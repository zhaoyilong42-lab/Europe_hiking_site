import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

type DifficultyCode = "T1" | "T2" | "T3" | "T4";

type HighlightRoute = {
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
  throw new Error("用法：tsx scripts/import-europe-highlights.ts <欧洲路线 Markdown 目录>");
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

function inferDifficulty(markdown: string): DifficultyCode {
  const intensity = firstMatch(markdown, /-\s*线路强度[：:]\s*([^\n]+)/, "");
  if (/极限|铁索|攀登|高难/.test(intensity)) return "T4";
  if (/中高|进阶|困难|挑战/.test(intensity)) return "T3";
  if (/初级|有一定|中等|适中/.test(intensity)) return "T2";
  return "T1";
}

function difficultyLabel(code: DifficultyCode) {
  return {
    T1: "T1 休闲",
    T2: "T2 初级",
    T3: "T3 进阶挑战",
    T4: "T4 高难挑战",
  }[code];
}

function extractListAfterHeading(markdown: string, heading: RegExp) {
  const start = markdown.search(heading);
  if (start < 0) return [];
  const nextHeading = markdown.slice(start + 3).search(/\n##\s/);
  const section = nextHeading < 0 ? markdown.slice(start) : markdown.slice(start, start + 3 + nextHeading);
  return [...section.matchAll(/^\s*-\s+(.+)$/gm)].map((match) => match[1].trim()).slice(0, 12);
}

function descriptionFrom(markdown: string, country: string, title: string) {
  const afterBasics = markdown.split(/##\s+📌\s*基本信息/)[1] ?? markdown;
  const paragraphs = afterBasics
    .split(/\n\s*\n/)
    .map((item) => item.replace(/^-\s+.+$/gm, "").trim())
    .filter((item) => item.length > 35 && !item.startsWith("##") && !item.startsWith("###"));
  return paragraphs[0]?.replace(/\n/g, " ").slice(0, 140) || `${country}${title}一日徒步路线。`;
}

function parseRoute(filePath: string, markdown: string): HighlightRoute | null {
  const country = path.basename(filePath).split("，")[0];
  const countryId = countryIds[country];
  if (!countryId) return null;

  const title = firstMatch(markdown, /^#\s+(.+)$/m, path.basename(filePath, ".md"));
  const departure = firstMatch(markdown, /-\s*出发地[：:]\s*(.+)/, country);
  const difficultyCode = inferDifficulty(markdown);
  const sourceHash = crypto.createHash("sha256").update(filePath).digest("hex").slice(0, 16);
  const photoSection = markdown.slice(Math.max(0, markdown.search(/##\s+📸|##\s+打卡拍照/)));

  return {
    id: `europe-${sourceHash}`,
    countryId,
    cityId: departure,
    subtitle: `${country} · 欧洲精选一日徒步`,
    title,
    departure,
    difficulty: difficultyLabel(difficultyCode),
    difficultyCode,
    duration: firstMatch(markdown, /-\s*徒步耗时[：:]\s*(.+)/, "待补充"),
    distance: firstMatch(markdown, /-\s*路线距离[：:]\s*(.+)/, "待补充"),
    elevationGain: firstMatch(markdown, /(?:累计爬升|爬升)[：:]\s*([^\n]+)/, "待补充"),
    description: descriptionFrom(markdown, country, title),
    // Some Commons URLs legitimately contain parentheses. Match the complete
    // Markdown image line instead of cutting the URL at the first one.
    image: firstMatch(markdown, /^!\[[^\]]*\]\((https?:\/\/.+)\)\s*$/m, ""),
    photoSpot: firstMatch(photoSection, /拍摄特色[：:]\s*(.+)/, "沿途观景点"),
    packingList: extractListAfterHeading(markdown, /##\s+.*装备清单/),
    roadBook: markdown,
  };
}

if (!fs.existsSync(sourceDirectory)) throw new Error(`找不到路线目录：${sourceDirectory}`);

const database = new DatabaseSync(path.join(process.cwd(), "data", "hiking-routes.db"));
database.exec(`
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

const files = fs.readdirSync(sourceDirectory)
  .filter((entry) => entry.toLowerCase().endsWith(".md") && !/徒步路线总览/i.test(entry))
  .sort((a, b) => a.localeCompare(b, "zh-Hans"));

const grouped = new Map<string, HighlightRoute[]>();
for (const file of files) {
  const absolutePath = path.join(sourceDirectory, file);
  const route = parseRoute(absolutePath, fs.readFileSync(absolutePath, "utf8").trim());
  if (!route) continue;
  const routes = grouped.get(route.countryId) ?? [];
  if (routes.length < 5) routes.push(route);
  grouped.set(route.countryId, routes);
}

const expectedCountries = ["italy", "switzerland", "france", "spain", "germany"];
for (const countryId of expectedCountries) {
  if ((grouped.get(countryId)?.length ?? 0) !== 5) {
    throw new Error(`${countryId} 需要 5 条路线，目前读取到 ${grouped.get(countryId)?.length ?? 0} 条。`);
  }
}

const insert = database.prepare(`
  INSERT INTO europe_highlights (id, country_id, sort_order, route_json)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    country_id = excluded.country_id,
    sort_order = excluded.sort_order,
    route_json = excluded.route_json,
    updated_at = CURRENT_TIMESTAMP
`);

database.exec("DELETE FROM europe_highlights");
database.exec("BEGIN");
try {
  for (const countryId of expectedCountries) {
    grouped.get(countryId)!.forEach((route, index) => insert.run(route.id, countryId, index, JSON.stringify(route)));
  }
  database.exec("COMMIT");
} catch (error) {
  database.exec("ROLLBACK");
  throw error;
} finally {
  database.close();
}

console.log(JSON.stringify({ imported: 25, countries: Object.fromEntries([...grouped].map(([country, routes]) => [country, routes.length])) }, null, 2));
