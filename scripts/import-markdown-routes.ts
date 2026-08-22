import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

type DifficultyCode = "T1" | "T2" | "T3" | "T4";

type ImportedRoute = {
  id: string;
  countryId: string;
  cityId: string;
  subtitle: string;
  title: string;
  departure: string;
  difficulty: string;
  difficultyCode: DifficultyCode;
  duration: string;
  distance: string;
  elevationGain: string;
  description: string;
  image: string;
  photoSpot: string;
  packingList: string[];
  roadBook: string;
};

const [sourceDirectory] = process.argv.slice(2);
if (!sourceDirectory) {
  throw new Error("用法：tsx scripts/import-markdown-routes.ts <解压后的路线目录>");
}

const countryIds: Record<string, string> = {
  "意大利": "italy",
  "瑞士": "switzerland",
  "法国": "france",
  "西班牙": "spain",
  "德国": "germany",
};

function firstMatch(text: string, pattern: RegExp, fallback: string) {
  return text.match(pattern)?.[1]?.trim() || fallback;
}

function difficultyFromPath(filePath: string): DifficultyCode {
  if (/简单|休闲|初级/.test(filePath)) return "T1";
  if (/中级|中等/.test(filePath)) return "T2";
  if (/进阶|困难|挑战/.test(filePath)) return "T3";
  if (/极限|铁索|攀登/.test(filePath)) return "T4";
  return "T2";
}

function difficultyLabel(code: DifficultyCode) {
  return {
    T1: "T1 休闲散步",
    T2: "T2 初级体验",
    T3: "T3 进阶挑战",
    T4: "T4 高难挑战",
  }[code];
}

function extractListAfterHeading(markdown: string, heading: RegExp) {
  const start = markdown.search(heading);
  if (start < 0) return [];
  const section = markdown.slice(start).split(/\n##\s/)[0];
  return [...section.matchAll(/^\s*-\s+(.+)$/gm)].map((match) => match[1].trim()).slice(0, 12);
}

function parseRoute(filePath: string, markdown: string): ImportedRoute | null {
  // Overview documents are navigation/maintenance material, not individual
  // routes, and must never appear in the location picker or search results.
  if (/徒步路线总览/i.test(filePath)) return null;
  const parts = filePath.split("/");
  const countryName = parts[1];
  const countryId = countryIds[countryName];
  if (!countryId) return null;

  const region = parts[2] || "未标注大区";
  const province = parts[3] || region;
  const title = firstMatch(markdown, /^#\s+(.+)$/m, path.basename(filePath, ".md"));
  const difficultyCode = difficultyFromPath(filePath);
  const photoSection = markdown.slice(Math.max(0, markdown.search(/##\s+📸|##\s+打卡拍照/)));
  const image = firstMatch(markdown, /!\[[^\]]*\]\((https?:\/\/[^)]+)\)/, "");
  const description = firstMatch(
    markdown,
    /(?:^|\n)##\s+(?:🚗|🥾|📌)[^\n]*\n+([^#\n][^\n]{20,})/m,
    `${countryName}${region}${province}一日徒步路线。`,
  );
  const sourceHash = crypto.createHash("sha256").update(filePath).digest("hex").slice(0, 16);

  return {
    id: `md-${sourceHash}`,
    countryId,
    cityId: province,
    subtitle: `${region} · ${province}`,
    title,
    departure: firstMatch(markdown, /-\s*出发地[：:]\s*(.+)/, province),
    difficulty: difficultyLabel(difficultyCode),
    difficultyCode,
    duration: firstMatch(markdown, /-\s*徒步耗时[：:]\s*(.+)/, "待补充"),
    distance: firstMatch(markdown, /-\s*路线距离[：:]\s*(.+)/, "待补充"),
    elevationGain: firstMatch(markdown, /(?:累计爬升|爬升)[：:]\s*([^\n]+)/, "待补充"),
    description,
    image,
    photoSpot: firstMatch(photoSection, /拍摄特色[：:]\s*(.+)/, "沿途观景点"),
    packingList: extractListAfterHeading(markdown, /##\s+.*装备清单/),
    roadBook: markdown,
  };
}

async function importRoutes() {
  if (!fs.existsSync(sourceDirectory)) throw new Error(`找不到路线目录：${sourceDirectory}`);
  const dataDirectory = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDirectory, { recursive: true });
  const database = new DatabaseSync(path.join(dataDirectory, "hiking-routes.db"));
  database.exec(`
    CREATE TABLE IF NOT EXISTS hiking_routes (
      id TEXT PRIMARY KEY, country_id TEXT NOT NULL, difficulty_code TEXT NOT NULL,
      searchable_text TEXT NOT NULL, route_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_hiking_routes_filter
      ON hiking_routes(country_id, difficulty_code);
  `);
  const insert = database.prepare(`
    INSERT INTO hiking_routes (id, country_id, difficulty_code, searchable_text, route_json)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      country_id = excluded.country_id, difficulty_code = excluded.difficulty_code,
      searchable_text = excluded.searchable_text, route_json = excluded.route_json,
      updated_at = CURRENT_TIMESTAMP
  `);

  const imported: ImportedRoute[] = [];
  const skipped: string[] = [];
  const markdownFiles = fs.readdirSync(sourceDirectory, { recursive: true })
    .filter((entry): entry is string => typeof entry === "string" && entry.toLowerCase().endsWith(".md"));
  for (const relativePath of markdownFiles) {
    const absolutePath = path.join(sourceDirectory, relativePath);
    const markdown = fs.readFileSync(absolutePath, "utf8").trim();
    const archiveStylePath = relativePath.split(path.sep).join("/");
    const route = parseRoute(`徒步路线数据库/${archiveStylePath}`, markdown);
    if (route) imported.push(route); else skipped.push(relativePath);
  }

  database.exec("BEGIN");
  try {
    for (const route of imported) {
      const searchableText = [route.title, route.departure, route.description, route.roadBook, route.cityId, route.subtitle, route.countryId]
        .join(" ").toLocaleLowerCase();
      insert.run(route.id, route.countryId, route.difficultyCode, searchableText, JSON.stringify(route));
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  } finally {
    database.close();
  }

  console.log(JSON.stringify({ imported: imported.length, skipped: skipped.length, skippedFiles: skipped }, null, 2));
}

await importRoutes();
