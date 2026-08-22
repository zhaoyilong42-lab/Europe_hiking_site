import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Mountain, LoaderCircle } from "lucide-react";
import { COUNTRIES, type Route } from "../data/hikingDb";
import RouteDetailView from "./RouteDetailView";
import { supabase } from "../lib/supabase";

const COUNTRY_FLAGS: Record<string, { src: string; alt: string }> = {
  italy: { src: "https://flagcdn.com/w640/it.png", alt: "意大利国旗" },
  switzerland: { src: "https://flagcdn.com/w640/ch.png", alt: "瑞士国旗" },
  france: { src: "https://flagcdn.com/w640/fr.png", alt: "法国国旗" },
  spain: { src: "https://flagcdn.com/w640/es.png", alt: "西班牙国旗" },
  germany: { src: "https://flagcdn.com/w640/de.png", alt: "德国国旗" },
};

type Highlights = Record<string, Route[]>;

export default function EuropeTab({ isAuthenticated, onRequireLogin }: { isAuthenticated: boolean; onRequireLogin: () => void }) {
  const [activeCountryId, setActiveCountryId] = useState("italy");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [highlights, setHighlights] = useState<Highlights>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/europe-highlights")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("无法加载欧洲路线"))))
      .then((data: { highlights?: Highlights }) => {
        if (alive) setHighlights(data.highlights ?? {});
      })
      .catch(() => {
        if (alive) setHighlights({});
      })
      .finally(() => alive && setIsLoading(false));
    return () => { alive = false; };
  }, []);

  const activeCountry = COUNTRIES.find((country) => country.id === activeCountryId)!;
  const countryRoutes = useMemo(() => highlights[activeCountryId] ?? [], [activeCountryId, highlights]);
  const openRoute = async (route: Route) => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    const response = await fetch(`/api/route/${encodeURIComponent(route.id)}`, {
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    });
    if (!response.ok) {
      onRequireLogin();
      return;
    }
    const { route: fullRoute } = await response.json();
    setSelectedRoute(fullRoute);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="europe-section">
      <div className="text-center mb-12">
        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-[0.2em] block mb-3">PAN-EUROPEAN TREKKING HIGHLIGHTS</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">欧洲 5 国经典一日徒步路线</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8" aria-label="按国家选择徒步路线">
        {COUNTRIES.map((country) => {
          const isActive = country.id === activeCountryId;
          const count = highlights[country.id]?.length ?? 5;
          const flag = COUNTRY_FLAGS[country.id];
          return <button key={country.id} type="button" onClick={() => setActiveCountryId(country.id)} aria-label={`查看${country.name}的${count}条徒步路线`} title={`${country.name} · ${count} 条路线`} className={`relative h-36 sm:h-40 overflow-hidden rounded-2xl border transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 ${isActive ? "border-emerald-700 shadow-lg -translate-y-1" : "border-zinc-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"}`} id={`country-flag-${country.id}`}>
            <img src={flag.src} alt={flag.alt} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-black/10" />
            <span className="absolute right-3 bottom-3 rounded-full bg-emerald-900/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">{count} 条路线</span>
            {isActive && <span className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-white/80" />}
          </button>;
        })}
      </div>

      <div className="flex items-end justify-between gap-4 mb-6">
        <div><p className="text-xs font-bold tracking-widest text-emerald-700 uppercase">{activeCountry.nameEn}</p><h3 className="mt-1 text-2xl font-extrabold text-zinc-900">5 条精选路线</h3></div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500"><MapPin className="h-4 w-4 text-emerald-700" /> 点击任一路线，查看完整路书</div>
      </div>

      {isLoading ? <div className="min-h-72 flex items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-500"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> 正在载入 25 条路线…</div> :
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {countryRoutes.map((route) => <article key={route.id} className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl" id={`route-card-${route.id}`}>
            <button type="button" onClick={() => openRoute(route)} className="block w-full text-left" aria-label={`查看${route.title}的完整路书`}>
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                {route.image ? <img src={route.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" /> : <div className="h-full w-full bg-emerald-900" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-md bg-black/65 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">{activeCountry.name}</span>
                <span className="absolute right-3 top-3 rounded-md bg-emerald-900/90 px-2.5 py-1 text-[10px] font-bold text-white">{route.difficulty}</span>
                <span className="absolute bottom-3 left-3 flex max-w-[90%] items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 text-[10px] text-white"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{route.departure}</span></span>
              </div>
              <div className="p-5">
                <h4 className="line-clamp-2 min-h-12 text-lg font-extrabold leading-snug text-zinc-950">{route.title.replace(/^🏔️\s*/, "")}</h4>
                <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-relaxed text-zinc-500">{route.description}</p>
                <div className="mt-5 grid grid-cols-3 divide-x divide-zinc-200 rounded-lg border border-zinc-100 bg-zinc-50 py-2.5 text-center">
                  <div><span className="block text-[9px] text-zinc-400">距离</span><span className="text-xs font-bold text-zinc-800">{route.distance}</span></div>
                  <div><span className="block text-[9px] text-zinc-400">时长</span><span className="text-xs font-bold text-zinc-800">{route.duration}</span></div>
                  <div><span className="block text-[9px] text-zinc-400">爬升</span><span className="text-xs font-bold text-emerald-800">{route.elevationGain}</span></div>
                </div>
              </div>
            </button>
            <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3"><span className="flex items-center gap-1.5 text-[10px] text-zinc-400"><Mountain className="h-3.5 w-3.5 text-emerald-700" /> 完整一日路书</span><button type="button" onClick={() => openRoute(route)} className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950">查看路线 <ArrowRight className="h-3.5 w-3.5" /></button></div>
          </article>)}
        </div>}

      {selectedRoute && <RouteDetailView route={selectedRoute} onClose={() => setSelectedRoute(null)} />}
    </section>
  );
}
