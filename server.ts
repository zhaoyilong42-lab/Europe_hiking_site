import express from "express";
import path from "path";
import fs from "fs";
import { DatabaseSync } from "node:sqlite";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { ROUTES, type Route } from "./src/data/hikingDb.ts";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

const serverSupabase = process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ? createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  : null;

if (isProduction) {
  app.use((_req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests");
    res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    next();
  });
}

type RouteMatch = Route & { matchScore: number };

function routeSummary(route: Route) {
  const { roadBook: _roadBook, packingList: _packingList, photoSpot: _photoSpot, ...summary } = route;
  return summary;
}

async function requireRouteAccess(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!serverSupabase || !token) {
    res.status(401).json({ error: "请先登录后查看完整徒步路线。" });
    return;
  }
  const { data, error } = await serverSupabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "登录已失效，请重新登录。" });
    return;
  }
  next();
}

// Development seeds a writable local database. Production reads the database
// packaged beside server.cjs, so it can run on an immutable deployment volume.
const dataDirectory = isProduction
  ? path.join(path.dirname(process.argv[1]), "data")
  : path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "hiking-routes.db");
if (!isProduction) fs.mkdirSync(dataDirectory, { recursive: true });
if (isProduction && !fs.existsSync(databasePath)) {
  throw new Error(`生产部署缺少路线数据库：${databasePath}`);
}
const database = new DatabaseSync(databasePath, isProduction ? { readOnly: true } : {});

if (!isProduction) database.exec(`
  CREATE TABLE IF NOT EXISTS hiking_routes (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL,
    difficulty_code TEXT NOT NULL,
    searchable_text TEXT NOT NULL,
    route_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_hiking_routes_filter
    ON hiking_routes(country_id, difficulty_code);
`);

if (!isProduction) database.exec(`
  CREATE TABLE IF NOT EXISTS europe_highlights (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    route_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_europe_highlights_country
    ON europe_highlights(country_id, sort_order);
`);

// Italian city road books are kept separate from custom-route search so city
// pages can expose every local plan without broadening selector results.
if (!isProduction) database.exec(`
  CREATE TABLE IF NOT EXISTS italy_city_routes (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    route_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_italy_city_routes_city
    ON italy_city_routes(city_id, sort_order);
`);

function seedRouteDatabase() {
  const insertRoute = database.prepare(`
    INSERT INTO hiking_routes (id, country_id, difficulty_code, searchable_text, route_json)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      country_id = excluded.country_id,
      difficulty_code = excluded.difficulty_code,
      searchable_text = excluded.searchable_text,
      route_json = excluded.route_json,
      updated_at = CURRENT_TIMESTAMP
  `);

  database.exec("BEGIN");
  try {
    for (const route of ROUTES) {
      const searchableText = [
        route.title, route.departure, route.description, route.roadBook,
        route.cityId ?? "", route.subtitle ?? "", route.countryId,
      ].join(" ").toLocaleLowerCase();
      insertRoute.run(route.id, route.countryId, route.difficultyCode, searchableText, JSON.stringify(route));
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

if (!isProduction) seedRouteDatabase();

const countryAliases: Record<string, string> = {
  italy: "italy", "意大利": "italy", italia: "italy",
  switzerland: "switzerland", "瑞士": "switzerland", schweiz: "switzerland",
  france: "france", "法国": "france",
  spain: "spain", "西班牙": "spain", "españa": "spain",
  germany: "germany", "德国": "germany", deutschland: "germany",
};

function normalizeCountry(value: string) {
  const text = value.toLocaleLowerCase();
  return Object.entries(countryAliases).find(([alias]) => text.includes(alias))?.[1];
}

function normalizeDifficulty(value: string) {
  return value.match(/T[1-4]/i)?.[0].toUpperCase();
}

function meaningfulTerms(value?: string) {
  return (value ?? "")
    .toLocaleLowerCase()
    .split(/[\s()（）,，/·-]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3 && !/^(italia|france|españa|schweiz)$/.test(term));
}

function normalizeLocation(value?: string) {
  return (value ?? "").toLocaleLowerCase().replace(/[\s()（）,，./·'’-]/g, "");
}

function findMatchingRoutes(country: string, region?: string, province?: string, difficulty?: string): RouteMatch[] {
  const countryId = normalizeCountry(country);
  const difficultyCode = normalizeDifficulty(difficulty ?? "");
  if (!countryId || !difficultyCode) return [];

  const rows = database.prepare(
    "SELECT route_json, searchable_text FROM hiking_routes WHERE country_id = ? AND difficulty_code = ?"
  ).all(countryId, difficultyCode) as Array<{ route_json: string; searchable_text: string }>;

  const locationTerms = [...meaningfulTerms(region), ...meaningfulTerms(province)];
  const requestedRegion = normalizeLocation(region);
  const requestedProvince = normalizeLocation(province);
  return rows
    .map((row) => {
      const route = JSON.parse(row.route_json) as Route;
      const location = routeLocation(route);
      const matchScore = locationTerms.reduce(
        (score, term) => score + (row.searchable_text.includes(term) ? 10 : 0),
        100,
      );
      return { ...route, matchScore, location };
    })
    // The form's province is a strict origin filter, not merely a preference.
    // A Lodi search must never display a Brescia departure, even as a fallback.
    .filter(({ location }) => !requestedRegion || normalizeLocation(location.region) === requestedRegion)
    .filter(({ location }) => !requestedProvince || normalizeLocation(location.province) === requestedProvince)
    .map(({ location: _location, ...route }) => route)
    .sort((a, b) => b.matchScore - a.matchScore || a.distance.localeCompare(b.distance));
}

function routeLocation(route: Route) {
  const [regionFromSubtitle = "", rawProvince = ""] = (route.subtitle ?? "").split(" · ");
  // Imported Markdown filenames follow “国家，大区，省份 一日徒步计划…”.
  // Curated routes may instead expose the city directly through cityId.
  const filenameFields = rawProvince.split(/[，,]/);
  const provinceFromFilename = filenameFields.length >= 3
    ? filenameFields[2].replace(/\s*一日徒步计划.*$/u, "").replace(/\.md$/iu, "").trim()
    : "";
  return {
    region: regionFromSubtitle || "未标注大区",
    province: provinceFromFilename || rawProvince || route.cityId || "未标注省份",
  };
}

// Returns every distinct region and province represented in the backend database.
// The form uses this instead of a hand-maintained, incomplete client-side list.
app.get("/api/locations", (_req, res) => {
  const rows = database.prepare("SELECT country_id, route_json FROM hiking_routes").all() as Array<{ country_id: string; route_json: string }>;
  const locations: Record<string, Record<string, Set<string>>> = {};
  for (const row of rows) {
    const route = JSON.parse(row.route_json) as Route;
    const { region, province } = routeLocation(route);
    // Routes without an administrative region cannot be selected accurately in
    // the custom-plan form, so keep the placeholder out of its region menu.
    if (region === "未标注大区") continue;
    // A handful of legacy curated German routes use an English subtitle in the
    // region field. They are routes, not administrative regions, so do not
    // expose them as options in the German region dropdown.
    if (row.country_id === "germany" && /[A-Za-z]/.test(region)) continue;
    locations[row.country_id] ??= {};
    locations[row.country_id][region] ??= new Set();
    locations[row.country_id][region].add(province);
  }

  const serializedLocations = Object.fromEntries(
    Object.entries(locations).map(([country, regions]) => [
      country,
      Object.fromEntries(
        Object.entries(regions)
          .sort(([a], [b]) => a.localeCompare(b, "zh-Hans"))
          .map(([region, provinces]) => [region, [...provinces].sort((a, b) => a.localeCompare(b, "zh-Hans"))]),
      ),
    ]),
  );
  res.json({ locations: serializedLocations });
});

// Queryable database endpoint. It allows a future map/list UI to show all
// appropriate routes, while the generator endpoint below selects the best one.
app.get("/api/routes", requireRouteAccess, (req, res) => {
  const { country, region, province, difficulty } = req.query;
  if (typeof country !== "string" || typeof difficulty !== "string") {
    res.status(400).json({ error: "country 和 difficulty 为必填项。" });
    return;
  }
  res.json({ routes: findMatchingRoutes(country, String(region ?? ""), String(province ?? ""), difficulty) });
});

// The five country panels on the Europe page intentionally use a fixed,
// editorially selected collection.  These 25 Markdown road books are stored
// separately from the custom-route search corpus so selection filters remain
// accurate while the public Europe page always has exactly five routes/country.
app.get("/api/europe-highlights", (_req, res) => {
  const rows = database.prepare(
    "SELECT country_id, route_json FROM europe_highlights ORDER BY country_id, sort_order"
  ).all() as Array<{ country_id: string; route_json: string }>;
  const highlights: Record<string, Route[]> = {};
  for (const row of rows) {
    (highlights[row.country_id] ??= []).push(routeSummary(JSON.parse(row.route_json) as Route) as Route);
  }
  res.json({ highlights });
});

app.get("/api/italy-city-routes", (_req, res) => {
  const rows = database.prepare(
    "SELECT city_id, route_json FROM italy_city_routes ORDER BY city_id, sort_order"
  ).all() as Array<{ city_id: string; route_json: string }>;
  const routesByCity: Record<string, Route[]> = {};
  for (const row of rows) {
    (routesByCity[row.city_id] ??= []).push(routeSummary(JSON.parse(row.route_json) as Route) as Route);
  }
  res.json({ routesByCity });
});

app.get("/api/route/:id", requireRouteAccess, (req, res) => {
  const id = req.params.id;
  const tables = ["hiking_routes", "europe_highlights", "italy_city_routes"];
  for (const table of tables) {
    const row = database.prepare(`SELECT route_json FROM ${table} WHERE id = ?`).get(id) as { route_json: string } | undefined;
    if (row) {
      res.json({ route: JSON.parse(row.route_json) as Route });
      return;
    }
  }
  res.status(404).json({ error: "未找到该路线。" });
});

async function startServer() {
  // Vite middleware for development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { maxAge: "1h" }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
