import { useState, useEffect, useMemo } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { loadStaticRouteCatalog, type RouteSummary } from "../lib/staticRouteData";
import { useLocale } from "../lib/locale";

interface HomeTabProps {
  onStartCustomise: () => void;
  onRouteAccess: () => void;
}

const FEATURED_LABELS = ["意大利 · 三峰山", "瑞士 · 采尔马特", "德国 · 国王湖", "西班牙 · 国王步道", "法国 · 韦尔东大峡谷"];
const ITALIAN_FEATURED_LABELS = ["Italia · Tre Cime", "Svizzera · Zermatt", "Germania · Königssee", "Spagna · Caminito del Rey", "Francia · Gole del Verdon"];
const FEATURED_COUNTRIES = ["italy", "switzerland", "germany", "spain", "france"];
const FEATURED_ROUTE_NAMES = ["多洛米蒂三峰", "采尔马特", "国王湖", "国王步道", "韦尔东大峡谷"];
const ITALIAN_DIFFICULTIES = { T1: "T1 Facile", T2: "T2 Principiante", T3: "T3 Avanzato", T4: "T4 Esperto" } as const;

export default function HomeTab({ onStartCustomise, onRouteAccess }: HomeTabProps) {
  const { locale } = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [highlights, setHighlights] = useState<Record<string, RouteSummary[]>>({});
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const slides = useMemo(() => FEATURED_COUNTRIES.map((countryId, index) => {
    const routes = highlights[countryId] ?? [];
    const route = routes.find((item) => item.title.includes(FEATURED_ROUTE_NAMES[index])) ?? routes[0];
    return route ? {
      route,
      image: route.image,
      title: route.title,
      label: locale === "it" ? ITALIAN_FEATURED_LABELS[index] : FEATURED_LABELS[index],
      difficulty: locale === "it" ? ITALIAN_DIFFICULTIES[route.difficultyCode] : route.difficulty,
    } : null;
  }).filter((slide): slide is { route: RouteSummary; image: string; title: string; label: string; difficulty: string } => Boolean(slide)), [highlights, locale]);

  useEffect(() => {
    loadStaticRouteCatalog()
      .then((data) => setHighlights(data.highlights))
      .catch(() => setHighlights({}));
  }, []);

  // Auto slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => slides.length ? (prev + 1) % slides.length : 0);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => slides.length ? (prev === 0 ? slides.length - 1 : prev - 1) : 0);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => slides.length ? (prev + 1) % slides.length : 0);
  };

  const handleTouchEnd = (endX: number) => {
    if (touchStartX === null) return;
    const distance = endX - touchStartX;
    if (Math.abs(distance) >= 48) distance < 0 ? handleNext() : handlePrev();
    setTouchStartX(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden" id="home-section" onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)} onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0].clientX)}>
      {/* Background Images with Cross-fading */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-0" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover brightness-[0.5] scale-105 transition-transform duration-10000"
            referrerPolicy="no-referrer"
          />
        </div>
      ))}

      {/* Hero Content Overlays */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white flex flex-col items-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-md select-none font-sans">
          一日欧洲徒步之旅
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-light text-zinc-200 mb-3 tracking-wide max-w-2xl drop-shadow">
          适合新手小白和徒步爱好者的网站
        </p>
        <p className="mb-8 text-xs sm:text-sm font-semibold text-emerald-200 drop-shadow">{slides[currentSlide] ? `${slides[currentSlide].label} · ${slides[currentSlide].difficulty}` : "正在加载欧洲精选路线"}</p>

        {/* Separated Badge Line */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-12 bg-black/35 backdrop-blur-md px-6 py-3.5 rounded-xl border border-white/10 text-xs sm:text-sm font-semibold tracking-wide">
          <span className="text-zinc-100">一日 1-DAY</span>
          <span className="text-zinc-400">|</span>
          <span className="text-zinc-100">欧洲 EUROPE</span>
          <span className="text-zinc-400">|</span>
          <span className="text-zinc-100">徒步 TREKKING</span>
          <span className="text-zinc-400">|</span>
          <span className="text-zinc-100">高山 ALPINE</span>
          <span className="text-zinc-400">|</span>
          <span className="text-zinc-100">湖泊 LAKES</span>
        </div>

        {/* Action Button */}
        <button
          onClick={onStartCustomise}
          className="group flex items-center gap-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
          id="hero-start-btn"
        >
          <span>打造一日徒步</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>

      {/* Slider Controls: Arrow Left */}
      <button
        onClick={handlePrev}
        className="absolute left-6 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md transition-all active:scale-95 hover:bg-black/50 md:flex"
        id="slider-prev-btn"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Slider Controls: Arrow Right */}
      <button
        onClick={handleNext}
        className="absolute right-6 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md transition-all active:scale-95 hover:bg-black/50 md:flex"
        id="slider-next-btn"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Index Dot Indicator at Bottom */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? "w-8 h-2 bg-emerald-500 rounded-full"
                : "w-2 h-2 bg-white/40 hover:bg-white/75 rounded-full"
            }`}
            aria-label={`Slide ${index + 1}`}
            id={`slide-dot-${index}`}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-16 z-10 hidden px-6 py-3 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          {slides.map((slide) => <button key={slide.label} type="button" onClick={onRouteAccess} className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${slide.label === slides[currentSlide]?.label ? "text-emerald-200" : "text-white hover:bg-white/10"}`}>
            <img src={slide.image} alt="" className="h-8 w-10 rounded object-cover" referrerPolicy="no-referrer" />
            <span className="truncate text-xs font-semibold text-white">{slide.label}</span>
          </button>)}
        </div>
      </div>
    </div>
  );
}
