import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

type DifficultyCode = "T1" | "T2" | "T3" | "T4";
type ItalyRoute = {
  id: string; countryId: "italy"; cityId: string; subtitle: string; title: string;
  departure: string; difficulty: string; difficultyCode: DifficultyCode; duration: string;
  distance: string; elevationGain: string; description: string; image: string;
  photoSpot: string; packingList: string[]; roadBook: string;
};

const [sourceDirectory] = process.argv.slice(2);
if (!sourceDirectory) throw new Error("用法：tsx scripts/import-italy-city-routes.ts <意大利路线 Markdown 目录>");

const cities: Record<string, { id: string; label: string; region: string }> = {
  Brescia: { id: "brescia", label: "布雷西亚（Brescia）", region: "Lombardia" },
  Milano: { id: "milano", label: "米兰（Milano）", region: "Lombardia" },
  Torino: { id: "torino", label: "都灵（Torino）", region: "Piemonte" },
  Padova: { id: "padova", label: "帕多瓦（Padova）", region: "Veneto" },
  Firenze: { id: "firenze", label: "佛罗伦萨（Firenze）", region: "Toscana" },
  Bologna: { id: "bologna", label: "博洛尼亚（Bologna）", region: "Emilia Romagna" },
  Roma: { id: "roma", label: "罗马（Roma）", region: "Lazio" },
  Napoli: { id: "napoli", label: "那不勒斯（Napoli）", region: "Campania" },
  Palermo: { id: "palermo", label: "巴勒莫（Palermo）", region: "Sicilia" },
};

const firstMatch = (text: string, pattern: RegExp, fallback: string) => text.match(pattern)?.[1]?.trim() || fallback;

function inferDifficulty(markdown: string): DifficultyCode {
  const intensity = firstMatch(markdown, /-\s*线路(?:难度|强度)[：:]\s*([^\n]+)/, "");
  if (/极限|铁索|攀登|高难/.test(intensity)) return "T4";
  if (/中高|进阶|困难|挑战|高强度/.test(intensity)) return "T3";
  if (/初级|有一定|中等|适中|入门进阶/.test(intensity)) return "T2";
  return "T1";
}

function extractPackingList(markdown: string) {
  const start = markdown.search(/##\s+.*装备清单/);
  if (start < 0) return [];
  const next = markdown.slice(start + 3).search(/\n##\s/);
  const section = next < 0 ? markdown.slice(start) : markdown.slice(start, start + 3 + next);
  return [...section.matchAll(/^\s*-\s+(.+)$/gm)].map((item) => item[1].replace(/\*\*/g, "").trim()).slice(0, 12);
}

function parseRoute(filePath: string, markdown: string): ItalyRoute | null {
  const sourceCity = path.basename(filePath).match(/^意大利，([^，]+)，/)?.[1];
  const city = sourceCity ? cities[sourceCity] : undefined;
  if (!city) return null;
  const title = firstMatch(markdown, /^#\s+(.+)$/m, path.basename(filePath, ".md"));
  const paragraphs = markdown.split(/\n\s*\n/).map((part) => part.replace(/^>\s*/gm, "").trim());
  const description = paragraphs.find((part) => part.length > 35 && !part.startsWith("#") && !part.startsWith("!") && !part.startsWith("-") && !part.startsWith("|") && !part.startsWith("*"))?.replace(/\n/g, " ").slice(0, 150) || `${title}一日徒步路线。`;
  const difficultyCode = inferDifficulty(markdown);
  const photoSection = markdown.slice(Math.max(0, markdown.search(/##\s+.*(?:📸|打卡拍照)/)));
  return {
    id: `italy-city-${crypto.createHash("sha256").update(filePath).digest("hex").slice(0, 16)}`,
    countryId: "italy", cityId: city.id,
    subtitle: `${city.region} · 意大利，${city.label} 一日徒步计划`,
    title,
    departure: firstMatch(markdown, /-\s*出发地[：:]\s*(.+)/, city.label),
    difficulty: ({ T1: "T1 休闲", T2: "T2 初级", T3: "T3 进阶挑战", T4: "T4 高难挑战" })[difficultyCode],
    difficultyCode,
    duration: firstMatch(markdown, /-\s*徒步耗时[：:]\s*(.+)/, "待补充"),
    distance: firstMatch(markdown, /-\s*路线距离[：:]\s*(.+)/, "待补充"),
    elevationGain: firstMatch(markdown, /-\s*(?:累计爬升|爬升)[：:]\s*([^\n]+)/, "待补充"),
    description,
    image: firstMatch(markdown, /^!\[[^\]]*\]\((https?:\/\/.+)\)\s*$/m, ""),
    photoSpot: firstMatch(photoSection, /(?:拍摄特色|核心拍摄特色)[：:]\s*(.+)/, "沿途观景点"),
    packingList: extractPackingList(markdown), roadBook: markdown,
  };
}

if (!fs.existsSync(sourceDirectory)) throw new Error(`找不到路线目录：${sourceDirectory}`);
const files = fs.readdirSync(sourceDirectory).filter((entry) => entry.toLowerCase().endsWith(".md")).sort((a, b) => a.localeCompare(b, "zh-Hans"));
if (files.length !== 48) throw new Error(`预期 48 条意大利路线，当前读取到 ${files.length} 条。`);

const grouped = new Map<string, ItalyRoute[]>();
const unmatched: string[] = [];
for (const file of files) {
  const route = parseRoute(path.join(sourceDirectory, file), fs.readFileSync(path.join(sourceDirectory, file), "utf8").trim());
  if (!route) { unmatched.push(file); continue; }
  const group = grouped.get(route.cityId) ?? [];
  group.push(route); grouped.set(route.cityId, group);
}
if (unmatched.length) throw new Error(`无法识别城市的文件：${unmatched.join("、")}`);

const database = new DatabaseSync(path.join(process.cwd(), "data", "hiking-routes.db"));
database.exec(`CREATE TABLE IF NOT EXISTS italy_city_routes (id TEXT PRIMARY KEY, city_id TEXT NOT NULL, sort_order INTEGER NOT NULL, route_json TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE INDEX IF NOT EXISTS idx_italy_city_routes_city ON italy_city_routes(city_id, sort_order);`);
const insert = database.prepare(`INSERT INTO italy_city_routes (id, city_id, sort_order, route_json) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET city_id = excluded.city_id, sort_order = excluded.sort_order, route_json = excluded.route_json, updated_at = CURRENT_TIMESTAMP`);
database.exec("DELETE FROM italy_city_routes");
database.exec("BEGIN");
try {
  for (const [cityId, routes] of grouped) routes.forEach((route, index) => insert.run(route.id, cityId, index, JSON.stringify(route)));
  database.exec("COMMIT");
} catch (error) { database.exec("ROLLBACK"); throw error; } finally { database.close(); }

console.log(JSON.stringify({ imported: files.length, cities: Object.fromEntries([...grouped].map(([cityId, routes]) => [cityId, routes.length])) }, null, 2));
