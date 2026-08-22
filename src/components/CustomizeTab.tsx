import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Compass, MapPin, Layers, Settings, Loader2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { displayLocationName } from "../data/locationTranslations";
import { createRoutePdf } from "../utils/routePdf";
import type { Route } from "../data/hikingDb";
import { supabase } from "../lib/supabase";

interface CustomizeTabProps {
  initialCountry?: string;
}

// Hierarchical Location Data
const COUNTRY_DATA = {
  italy: {
    name: "意大利 (Italia)",
    regions: {
      lombardia: {
        name: "Lombardia 伦巴第",
        cities: ["Brescia (BS) 布雷西亚", "Milano 米兰", "Sondrio 桑德里奥", "Bergamo 贝加莫"]
      },
      veneto: {
        name: "Veneto 威尼托",
        cities: ["Venezia 威尼斯", "Padova 帕多瓦", "Belluno 贝鲁诺"]
      },
      piemonte: {
        name: "Piemonte 皮埃蒙特",
        cities: ["Torino 都灵", "Cuneo 库内奥"]
      },
      toscana: {
        name: "Toscana 托斯卡纳",
        cities: ["Firenze 佛罗伦萨", "Siena 锡耶纳", "Pisa 比萨"]
      },
      emilia_romagna: {
        name: "Emilia Romagna 艾米利亚-罗马涅",
        cities: ["Bologna 博洛尼亚", "Parma 帕尔马"]
      },
      lazio: {
        name: "Lazio 拉齐奥",
        cities: ["Roma 罗马", "Viterbo 维泰博"]
      },
      campania: {
        name: "Campania 坎帕尼亚",
        cities: ["Napoli 那不勒斯", "Salerno 萨莱诺"]
      },
      sicilia: {
        name: "Sicilia 西西里",
        cities: ["Palermo 巴勒莫", "Catania 卡塔尼亚"]
      }
    }
  },
  switzerland: {
    name: "瑞士 (Schweiz)",
    regions: {
      valais: {
        name: "Valais 瓦莱州",
        cities: ["Zermatt 采尔马特", "Saas-Fee 萨斯费", "Verbier 韦尔比耶"]
      },
      bern: {
        name: "Bern 伯尔尼州",
        cities: ["Kandersteg 坎德施泰格", "Grindelwald 格林德瓦", "Interlaken 因特拉肯"]
      },
      graubunden: {
        name: "Graubünden 格劳宾登州",
        cities: ["St. Moritz 圣莫里茨", "Davos 达沃斯"]
      }
    }
  },
  france: {
    name: "法国 (France)",
    regions: {
      provence: {
        name: "Provence 普罗旺斯-阿尔卑斯",
        cities: ["La Palud 韦尔东大峡谷", "Avignon 阿维尼翁", "Marseille 马赛"]
      },
      rhone_alpes: {
        name: "Auvergne-Rhône-Alpes 阿尔卑斯山麓",
        cities: ["Chamonix 夏蒙尼 (勃朗峰)", "Annecy 安纳西", "Grenoble 格勒诺布尔"]
      }
    }
  },
  spain: {
    name: "西班牙 (España)",
    regions: {
      andalusia: {
        name: "Andalusia 安达卢西亚",
        cities: ["Malaga 马拉加", "Granada 格拉纳达", "Sevilla 塞维利亚"]
      },
      catalonia: {
        name: "Catalonia 加泰罗尼亚",
        cities: ["Pyrenees 比利牛斯山脉", "Barcelona 巴塞罗那", "Girona 赫罗纳"]
      }
    }
  },
  germany: {
    name: "德国",
    regions: {
      bavaria: {
        name: "Bavaria 巴伐利亚州",
        cities: ["Berchtesgaden 贝希特斯加登 (国王湖)", "Garmisch 加米施-帕滕基兴 (楚格峰)", "Munich 慕尼黑"]
      },
      black_forest: {
        name: "Baden-Württemberg 黑森林",
        cities: ["Freiburg 弗赖堡", "Baden-Baden 巴登巴登"]
      }
    }
  }
};

const DIFFICULTIES = [
  { value: "T1", label: "休闲 (T1) - 休闲散步，铺装路面为主" },
  { value: "T2", label: "初级 (T2) - 有一定坡度，土石路径山野体验" },
  { value: "T3", label: "进阶 (T3) - 陡峭碎石崖边，需良好体力与徒步鞋" },
];

export default function CustomizeTab({ initialCountry }: CustomizeTabProps) {
  // Input states
  const [selectedCountry, setSelectedCountry] = useState<string>("italy");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("T2");
  const [databaseLocations, setDatabaseLocations] = useState<Record<string, Record<string, string[]>>>({});

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [generatedRoute, setGeneratedRoute] = useState<any | null>(null);
  // Keep the full set returned by the database so “换一条” never repeats an
  // AI-generated result and can stop precisely at the final matching route.
  const [matchedRoutes, setMatchedRoutes] = useState<any[]>([]);
  const [matchedRouteIndex, setMatchedRouteIndex] = useState(0);
  const [matchMessage, setMatchMessage] = useState("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Dynamic dropdown synchronization
  const countryConfig = COUNTRY_DATA[selectedCountry as keyof typeof COUNTRY_DATA] as any;
  const countryLocations = databaseLocations[selectedCountry] || {};
  const regionKeys = Object.keys(countryLocations);
  const provinceOptions = countryLocations[selectedRegion] || [];

  useEffect(() => {
    fetch("/api/locations")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("locations unavailable")))
      .then((data) => setDatabaseLocations(data.locations || {}))
      .catch((error) => console.error("Location options error:", error));
  }, []);

  useEffect(() => {
    if (initialCountry && COUNTRY_DATA[initialCountry as keyof typeof COUNTRY_DATA]) {
      setSelectedCountry(initialCountry);
    }
  }, [initialCountry]);

  useEffect(() => {
    // Automatically set the first region when country changes
    if (regionKeys.length > 0) {
      setSelectedRegion(regionKeys[0]);
    } else {
      setSelectedRegion("");
    }
  }, [selectedCountry, databaseLocations]);

  useEffect(() => {
    if (selectedRegion) {
      if (provinceOptions.length > 0) {
        setSelectedCity(provinceOptions[0]);
      } else {
        setSelectedCity("");
      }
    } else {
      setSelectedCity("");
    }
  }, [selectedRegion, selectedCountry, databaseLocations]);

  // Fun interactive loading tips
  const loadingSteps = [
    "正在检索欧洲高山数据库...",
    "正在查询已审核的路线资料...",
    "正在核对出发地与难度条件...",
    "正在整理完整路线信息...",
    "即将展示匹配结果...",
  ];

  useEffect(() => {
    let timer: any;
    if (loading) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMatchedRoutes([]);
    setMatchedRouteIndex(0);
    setGeneratedRoute(null);
    setMatchMessage("");

    const countryName = countryConfig?.name || selectedCountry;
    const regionName = selectedRegion;

    try {
      // First request every database match. Routes with the strongest location
      // score belong to the selected country/region/province, so they form the
      // small rotation set used by the “换一条” action below.
      const routeSearch = new URLSearchParams({
        country: countryName,
        region: regionName,
        province: selectedCity,
        difficulty: selectedDifficulty,
      });
      if (!supabase) throw new Error("登录服务未配置");
      const { data: sessionData } = await supabase.auth.getSession();
      const matchesResponse = await fetch(`/api/routes?${routeSearch.toString()}`, {
        headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
      });
      if (matchesResponse.ok) {
        const { routes } = await matchesResponse.json();
        if (Array.isArray(routes) && routes.length > 0) {
          const highestScore = routes[0].matchScore;
          const strongestMatches = routes.filter((route: any) => route.matchScore === highestScore);
          setMatchedRoutes(strongestMatches);
          setMatchedRouteIndex(0);
          setGeneratedRoute(strongestMatches[0]);
          return;
        }
      }

      setMatchMessage("暂未找到完全符合条件的已审核路线，请调整大区、省份或难度后重试。");
    } catch (err) {
      console.error("Route lookup error:", err);
      setMatchMessage("路线资料暂时无法读取，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleNextDatabaseRoute = () => {
    const nextIndex = matchedRouteIndex + 1;
    if (nextIndex >= matchedRoutes.length) return;
    setMatchedRouteIndex(nextIndex);
    setGeneratedRoute(matchedRoutes[nextIndex]);
  };

  const handlePreviousDatabaseRoute = () => {
    const previousIndex = matchedRouteIndex - 1;
    if (previousIndex < 0) return;
    setMatchedRouteIndex(previousIndex);
    setGeneratedRoute(matchedRoutes[previousIndex]);
  };

  const hasDatabaseMatches = matchedRoutes.length > 0;
  const hasAnotherDatabaseRoute = matchedRouteIndex < matchedRoutes.length - 1;
  const countryNames: Record<string, string> = {
    italy: "意大利 · ITALY (ITALIA)",
    switzerland: "瑞士 · SWITZERLAND",
    france: "法国 · FRANCE",
    spain: "西班牙 · SPAIN (ESPAÑA)",
    germany: "德国",
  };
  const routeCountryLabel = generatedRoute?.countryId ? (countryNames[generatedRoute.countryId] || generatedRoute.countryId) : "欧洲一日徒步";

  const downloadRoutePdf = async () => {
    if (!generatedRoute) return;

    const shouldDownloadFile = window.matchMedia("(max-width: 767px)").matches
      || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (shouldDownloadFile) {
      try {
        setIsExportingPdf(true);
        const pdfBlob = await createRoutePdf(generatedRoute as Route);
        const url = URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = `${String(generatedRoute.title).replace(/[\\/:*?\"<>|]/g, "-")}-徒步路书.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1500);
        return;
      } finally {
        setIsExportingPdf(false);
      }
    }

    const originalTitle = document.title;
    document.title = `${generatedRoute.title} - 徒步路书`;
    window.addEventListener("afterprint", () => { document.title = originalTitle; }, { once: true });
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="customize-section">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest block mb-2">
          TAILOR-MADE INDIVIDUAL PLANS
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          智能徒步路线定制系统
        </h2>
        <p className="text-zinc-500 text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
          告诉我们您的出行目的地、期望的大区难度。系统将立刻为您精确匹配为您现场定制一套顶级一日高山路书。
        </p>
      </div>

      {/* Styled green Form Container exactly like the image card */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-950 relative overflow-hidden mb-12">
        {/* Background micro grid elements */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs bg-emerald-850/80 border border-emerald-800/80 px-2.5 py-1 rounded-full text-emerald-300 font-bold tracking-wide">
                ✨ 带你逃离城市 · 专属徒步定制
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold mt-2 tracking-tight">
                开启你的欧洲山野之旅，从这里开始
              </h3>
            </div>
            <p className="text-emerald-100/70 text-xs max-w-md leading-relaxed md:text-right">
              结合你的出发地与徒步偏好，为你量身打造私藏路线。从路书到拍照机位，一站式为你安排妥当
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 4 columns Grid for dropdown selects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Country select */}
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-2 uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>国家 STATO</span>
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-emerald-800/85 hover:bg-emerald-800 border border-emerald-700 rounded-xl px-3 py-3 text-sm font-semibold focus:border-white focus:outline-none appearance-none transition-colors"
                >
                  {Object.entries(COUNTRY_DATA).map(([key, val]) => (
                    <option key={key} value={key} className="bg-emerald-900 text-white">
                      {val.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region select */}
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-2 uppercase flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>大区 REGIONE</span>
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-emerald-800/85 hover:bg-emerald-800 border border-emerald-700 rounded-xl px-3 py-3 text-sm font-semibold focus:border-white focus:outline-none appearance-none transition-colors"
                  disabled={regionKeys.length === 0}
                >
                  {regionKeys.map((region) => (
                    <option key={region} value={region} className="bg-emerald-900 text-white">{displayLocationName(selectedCountry, region)}</option>
                  ))}
                </select>
              </div>

              {/* City/Province select */}
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-2 uppercase flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>省份 PROVINCIA</span>
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-emerald-800/85 hover:bg-emerald-800 border border-emerald-700 rounded-xl px-3 py-3 text-sm font-semibold focus:border-white focus:outline-none appearance-none transition-colors"
                  disabled={!selectedRegion}
                >
                  {provinceOptions.map((province) => (
                    <option key={province} value={province} className="bg-emerald-900 text-white">{displayLocationName(selectedCountry, province)}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty select */}
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-2 uppercase flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5" />
                  <span>难度 DIFFICULTY</span>
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-emerald-800/85 hover:bg-emerald-800 border border-emerald-700 rounded-xl px-3 py-3 text-sm font-semibold focus:border-white focus:outline-none appearance-none transition-colors"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value} className="bg-emerald-900 text-white">
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit btn */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-emerald-900 font-extrabold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                id="customize-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-900" />
                    <span>正在匹配路线...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-emerald-800" />
                    <span>生成你的徒步计划</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Interactive loading state overlay within the viewport */}
      {loading && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-700" />
          <h4 className="font-bold text-zinc-900 text-lg">正在匹配已审核路线</h4>
          <p className="text-zinc-500 text-xs font-medium max-w-md">
            {loadingSteps[loadingStep]}
          </p>
          <div className="w-64 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
              style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!loading && matchMessage && <p role="status" className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm font-medium text-amber-900">{matchMessage}</p>}

      {/* Curated route presentation */}
      {!loading && generatedRoute && (
        <>
          <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-3">
            {hasDatabaseMatches ? (
              <div className="flex items-center overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-800 shadow-sm">
                <button type="button" onClick={handlePreviousDatabaseRoute} disabled={matchedRouteIndex === 0} aria-label="上一条徒步路线" className="flex h-9 w-10 items-center justify-center hover:bg-zinc-50 disabled:opacity-35">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="border-x border-zinc-200 px-3 text-xs font-bold leading-9 tabular-nums">{matchedRouteIndex + 1}/{matchedRoutes.length}</span>
                <button type="button" onClick={handleNextDatabaseRoute} disabled={!hasAnotherDatabaseRoute} aria-label="下一条徒步路线" className="flex h-9 w-10 items-center justify-center hover:bg-zinc-50 disabled:opacity-35">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : <span />}
            <button
              type="button"
              onClick={downloadRoutePdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-900"
            >
              <Download className="h-4 w-4" />
              {isExportingPdf ? "正在生成 PDF..." : "下载 PDF"}
            </button>
          </div>
          <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl" id="generated-route-container">
          <header className="relative flex min-h-[330px] items-end overflow-hidden bg-emerald-950 px-6 py-8 sm:min-h-[410px] sm:px-10 sm:py-11">
            {generatedRoute.image && (
              <img
                src={generatedRoute.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/15" />

            <div className="absolute left-6 right-6 top-6 flex flex-wrap items-center gap-2 sm:left-10 sm:right-10 sm:top-8">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-800/95 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm">
                <MapPin className="h-3.5 w-3.5" />
                {routeCountryLabel}
              </span>
              <span className="rounded-md bg-zinc-800/95 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm">
                {generatedRoute.difficultyCode || generatedRoute.difficulty}
              </span>
              <span className="rounded-md bg-emerald-700/95 px-3 py-1.5 text-xs font-extrabold text-emerald-50 shadow-sm">
                {generatedRoute.departure}
              </span>
            </div>



            <div className="relative z-10 max-w-5xl pt-24 text-white sm:pt-20 md:pt-0">
              <h3 className="break-words text-2xl font-black leading-[1.18] tracking-tight sm:text-3xl md:text-5xl">{generatedRoute.title}</h3>
              <p className="mt-3 text-sm leading-7 italic text-zinc-200 sm:text-base md:text-lg">{generatedRoute.description}</p>
              <p className="mt-5 text-xs text-zinc-300 sm:text-sm">📷 路线资料 · {generatedRoute.departure}</p>
            </div>
          </header>

          <div className="mx-auto max-w-5xl px-5 py-9 sm:px-10 sm:py-12">
            <section className="mb-10 grid grid-cols-1 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                ["徒步距离", generatedRoute.distance],
                ["预计耗时", generatedRoute.duration],
                ["累计爬升", generatedRoute.elevationGain],
              ].map(([label, value]) => (
                <div key={label} className="px-5 py-4 text-center">
                  <p className="text-[11px] font-medium text-zinc-400">{label}</p>
                  <p className="mt-1 text-base font-extrabold text-emerald-900 sm:text-lg">{value}</p>
                </div>
              ))}
            </section>

            <div className="route-roadbook prose prose-zinc max-w-none text-[15px] leading-8 text-zinc-700 sm:text-base">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: () => null,
                  h2: ({ children }) => {
                    const isPackingList = String(children).includes("装备");
                    return <h2 data-packing-list={isPackingList || undefined} className="mt-12 flex items-center border-b-2 border-emerald-700 pb-3 text-2xl font-black leading-tight text-zinc-950 first:mt-0">{children}</h2>;
                  },
                  h3: ({ children }) => <h3 className="mt-7 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-lg font-extrabold leading-relaxed text-zinc-900 shadow-sm">{children}</h3>,
                  p: ({ children }) => <p className="my-4 leading-8 text-zinc-700">{children}</p>,
                  ul: ({ children }) => <ul className="my-5 space-y-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 marker:text-emerald-700">{children}</ul>,
                  ol: ({ children }) => <ol className="my-6 space-y-3 border-l-2 border-emerald-200 pl-7 marker:font-extrabold marker:text-emerald-800">{children}</ol>,
                  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
                  blockquote: ({ children }) => <blockquote className="my-6 rounded-r-xl border-l-4 border-amber-400 bg-amber-50 px-5 py-4 text-amber-950 not-italic">{children}</blockquote>,
                  table: ({ children }) => <div className="my-6 overflow-x-auto rounded-2xl border border-emerald-100 shadow-sm"><table className="w-full min-w-[420px] border-collapse text-sm">{children}</table></div>,
                  thead: ({ children }) => <thead className="bg-emerald-800 text-left text-white">{children}</thead>,
                  tbody: ({ children }) => <tbody className="divide-y divide-zinc-100 bg-white">{children}</tbody>,
                  tr: ({ children }) => <tr className="even:bg-emerald-50/50">{children}</tr>,
                  th: ({ children }) => <th className="px-4 py-3 text-xs font-extrabold tracking-wide">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-3 align-top leading-6 text-zinc-700">{children}</td>,
                  hr: () => <hr className="my-10 border-zinc-200" />,
                }}
              >
                {generatedRoute.roadBook}
              </ReactMarkdown>
            </div>
          </div>
          </article>
        </>
      )}
    </div>
  );
}
