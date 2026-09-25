import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, MapPin } from "lucide-react";
import { ITALY_CITIES, type ItalyCity, type Route } from "../data/hikingDb";
import { loadStaticRoute, loadStaticRouteCatalog, type RouteSummary } from "../lib/staticRouteData";
import { assetUrl } from "../lib/siteAsset";
import RouteDetailView from "./RouteDetailView";


type RoutesByCity = Record<string, RouteSummary[]>;

const difficultyTone: Record<Route["difficultyCode"], string> = {
  T1: "bg-emerald-50 text-emerald-800 border-emerald-200",
  T2: "bg-teal-50 text-teal-800 border-teal-200",
  T3: "bg-amber-50 text-amber-800 border-amber-200",
  T4: "bg-rose-50 text-rose-800 border-rose-200",
};

export default function ItalyTab() {
  const [routesByCity, setRoutesByCity] = useState<RoutesByCity>({});
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<ItalyCity | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  useEffect(() => {
    loadStaticRouteCatalog()
      .then((data) => setRoutesByCity(data.routesByCity))
      .catch(() => setRoutesByCity({}))
      .finally(() => setLoading(false));
  }, []);

  const cityRoutes = useMemo(() => selectedCity ? (routesByCity[selectedCity.id] ?? []) : [], [routesByCity, selectedCity]);
  const openCity = (city: ItalyCity) => {
    setSelectedCity(city);
  };
  const openRoute = async (route: RouteSummary) => {
    try {
      setSelectedRoute(await loadStaticRoute(route.id));
    } catch {
      // Keep the city route list visible if a route file cannot be loaded.
    }
  };

  if (selectedRoute) return <RouteDetailView route={selectedRoute} onClose={() => setSelectedRoute(null)} />;

  if (selectedCity) {
    return (
      <section id="italy-city-route-list" className="min-h-screen bg-slate-50 pb-16">
        <div className="relative isolate min-h-[360px] overflow-hidden bg-emerald-950 text-white">
          <img src={assetUrl(selectedCity.image)} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/65 to-slate-950" />
          <div className="mx-auto flex max-w-6xl flex-col px-6 pb-12 pt-10 sm:px-10">
            <button onClick={() => setSelectedCity(null)} className="mb-12 flex w-fit items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white" id="btn-back-to-italy-cities"><ArrowLeft className="h-4 w-4" /> 返回意大利城市</button>
            <div className="w-fit rounded-full border border-emerald-300/30 bg-emerald-900/80 px-4 py-1.5 text-xs font-bold tracking-wide text-emerald-100"><MapPin className="mr-1 inline h-3.5 w-3.5" /> {selectedCity.region}</div>
            <h1 className="mt-5 font-serif text-5xl font-semibold tracking-wide sm:text-6xl">{selectedCity.name} · {selectedCity.nameEn}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">{selectedCity.description}</p>
          </div>
        </div>
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-9 sm:px-6">
          {cityRoutes.map((route) => <article key={route.id} className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[256px_minmax(0,1fr)_210px]">
            <div className="relative min-h-52 bg-slate-200">{route.image && <img src={route.image} alt="" className="absolute inset-0 h-full w-full object-cover" referrerPolicy="no-referrer" />}</div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs"><span className={`rounded-md border px-2 py-1 font-bold ${difficultyTone[route.difficultyCode]}`}>{route.difficulty}</span><span className="text-slate-400">{selectedCity.nameEn} 市区出发 · 当日往返</span></div>
              <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-slate-950">{route.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{route.description}</p>
              <div className="mt-5 grid grid-cols-3 divide-x rounded-xl bg-slate-50 px-3 py-3 text-xs"><div className="px-2"><span className="block text-slate-400">单日步行距离</span><strong className="mt-1 block text-slate-900">{route.distance}</strong></div><div className="px-3"><span className="block text-slate-400">徒步耗时</span><strong className="mt-1 block text-slate-900">{route.duration}</strong></div><div className="px-3"><span className="block text-slate-400">累计爬升</span><strong className="mt-1 block text-emerald-800">{route.elevationGain}</strong></div></div>
            </div>
            <div className="flex items-center justify-center border-t border-slate-100 p-6 md:border-l md:border-t-0"><button onClick={() => openRoute(route)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900" id={`open-italy-route-${route.id}`}><FileText className="h-4 w-4" /> 查看计划 <ArrowRight className="h-4 w-4" /></button></div>
          </article>)}
          {!loading && cityRoutes.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">该城市的路线正在导入，请稍后刷新页面。</p>}
        </div>
      </section>
    );
  }

  return <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="italy-section">
    <div className="mb-12 text-center"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">FEATURED HUBS & DEPARTURE POINTS</span><h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">意大利 9 大出发城市</h2><p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-zinc-500">从城市市中心出发，体验完整的徒步一日游。</p></div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {ITALY_CITIES.map((city) => <button key={city.id} onClick={() => openCity(city)} className="group relative min-h-[285px] overflow-hidden rounded-2xl bg-zinc-950 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl" id={`city-card-${city.id}`}>
        <img src={assetUrl(city.image)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-90" referrerPolicy="no-referrer" /><div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/95" />
        <span className="absolute left-4 top-4 rounded-md bg-black/65 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white">⌾ {city.region}</span>
        <div className="absolute inset-x-5 bottom-5 text-white"><h3 className="font-serif text-4xl tracking-[0.1em]">{city.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-white/85">{city.description}</p><div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-xs font-bold"><span className="truncate pr-3">{routesByCity[city.id]?.[0]?.title ?? city.recommendedRoute}</span><span className="shrink-0">查看路线 <ArrowRight className="inline h-3.5 w-3.5" /></span></div></div>
      </button>)}
    </div>
  </section>;
}
