import type { Route } from "../data/hikingDb";
import { assetUrl } from "./siteAsset";

export type RouteSummary = Omit<Route, "photoSpot" | "packingList" | "roadBook">;

export type RouteLocation = {
  region: string;
  province: string;
};

export type RouteSearchEntry = {
  id: string;
  countryId: string;
  difficultyCode: Route["difficultyCode"];
  distance: string;
  searchableText: string;
  location: RouteLocation;
};

export type StaticRouteCatalog = {
  locations: Record<string, Record<string, string[]>>;
  searchRoutes: RouteSearchEntry[];
  highlights: Record<string, RouteSummary[]>;
  routesByCity: Record<string, RouteSummary[]>;
};

let catalogPromise: Promise<StaticRouteCatalog> | null = null;
const routePromises = new Map<string, Promise<Route>>();

export function loadStaticRouteCatalog() {
  catalogPromise ??= fetch(assetUrl("route-data/catalog.json"))
    .then((response) => response.ok ? response.json() as Promise<StaticRouteCatalog> : Promise.reject(new Error("无法加载路线目录")));
  return catalogPromise;
}

export function loadStaticRoute(routeId: string) {
  let routePromise = routePromises.get(routeId);
  if (!routePromise) {
    routePromise = fetch(assetUrl(`route-data/routes/${encodeURIComponent(routeId)}.json`))
      .then((response) => response.ok ? response.json() as Promise<Route> : Promise.reject(new Error("无法加载路线详情")));
    routePromises.set(routeId, routePromise);
  }
  return routePromise;
}
