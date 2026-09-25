import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const projectRoot = process.cwd();
const databasePath = path.join(projectRoot, "data", "hiking-routes.db");
const outputDirectory = path.join(projectRoot, "public", "route-data");
const routesDirectory = path.join(outputDirectory, "routes");

if (!fs.existsSync(databasePath)) throw new Error(`找不到路线数据库：${databasePath}`);

const database = new DatabaseSync(databasePath, { readOnly: true });

function routeSummary(route) {
  const { roadBook: _roadBook, packingList: _packingList, photoSpot: _photoSpot, ...summary } = route;
  return summary;
}

function meaningfulTerms(value = "") {
  return value
    .toLocaleLowerCase()
    .split(/[\s()（）,，/·-]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3 && !/^(italia|france|españa|schweiz)$/.test(term));
}

function normalizeLocation(value = "") {
  return value.toLocaleLowerCase().replace(/[\s()（）,，./·'’-]/g, "");
}

function routeLocation(route) {
  const [regionFromSubtitle = "", rawProvince = ""] = (route.subtitle ?? "").split(" · ");
  const filenameFields = rawProvince.split(/[，,]/);
  const provinceFromFilename = filenameFields.length >= 3
    ? filenameFields[2].replace(/\s*一日徒步计划.*$/u, "").replace(/\.md$/iu, "").trim()
    : "";
  return {
    region: regionFromSubtitle || "未标注大区",
    province: provinceFromFilename || rawProvince || route.cityId || "未标注省份",
  };
}

function createLocations(searchRoutes) {
  const locations = {};
  for (const route of searchRoutes) {
    const { region, province } = route.location;
    if (region === "未标注大区") continue;
    if (route.countryId === "germany" && /[A-Za-z]/.test(region)) continue;
    locations[route.countryId] ??= {};
    locations[route.countryId][region] ??= new Set();
    locations[route.countryId][region].add(province);
  }
  return Object.fromEntries(
    Object.entries(locations).map(([country, regions]) => [
      country,
      Object.fromEntries(
        Object.entries(regions)
          .sort(([left], [right]) => left.localeCompare(right, "zh-Hans"))
          .map(([region, provinces]) => [region, [...provinces].sort((left, right) => left.localeCompare(right, "zh-Hans"))]),
      ),
    ]),
  );
}

const allRoutes = new Map();
const searchRoutes = database.prepare("SELECT route_json FROM hiking_routes").all().map((row) => {
  const route = JSON.parse(row.route_json);
  allRoutes.set(route.id, route);
  return {
    id: route.id,
    countryId: route.countryId,
    difficultyCode: route.difficultyCode,
    distance: route.distance,
    searchableText: [route.title, route.departure, route.description, route.cityId ?? "", route.subtitle ?? "", route.countryId]
      .join(" ")
      .toLocaleLowerCase(),
    location: routeLocation(route),
  };
});

const highlights = {};
for (const row of database.prepare("SELECT country_id, route_json FROM europe_highlights ORDER BY country_id, sort_order").all()) {
  const route = JSON.parse(row.route_json);
  allRoutes.set(route.id, route);
  (highlights[row.country_id] ??= []).push(routeSummary(route));
}

const routesByCity = {};
for (const row of database.prepare("SELECT city_id, route_json FROM italy_city_routes ORDER BY city_id, sort_order").all()) {
  const route = JSON.parse(row.route_json);
  allRoutes.set(route.id, route);
  (routesByCity[row.city_id] ??= []).push(routeSummary(route));
}

database.close();

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(routesDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "catalog.json"), JSON.stringify({
  locations: createLocations(searchRoutes),
  searchRoutes,
  highlights,
  routesByCity,
}));

for (const [routeId, route] of allRoutes) {
  fs.writeFileSync(path.join(routesDirectory, `${routeId}.json`), JSON.stringify(route));
}

console.log(JSON.stringify({
  staticRoutes: allRoutes.size,
  searchableRoutes: searchRoutes.length,
  highlightedRoutes: Object.values(highlights).reduce((count, routes) => count + routes.length, 0),
  cityRoutes: Object.values(routesByCity).reduce((count, routes) => count + routes.length, 0),
}, null, 2));
