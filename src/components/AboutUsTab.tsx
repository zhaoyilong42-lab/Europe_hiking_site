import { useState, type ReactNode } from "react";
import { Compass, BookOpen, Users, Compass as MapIcon, Star, Filter, MessageSquare, Shield, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { COMPANIONS, Companion } from "../data/hikingDb";

interface AboutUsTabProps {
  onStartCustomise: () => void;
}

const GALLERY_PHOTOS = [
  {
    url: "/about-gallery/lago-di-aviolo.jpg",
    title: "Lago di Aviolo · 阿维奥洛湖",
    location: "意大利 · 布雷西亚",
  },
  {
    url: "/about-gallery/lago-di-sorapis.jpg",
    title: "Lago di Sorapis · 索拉皮斯湖",
    location: "意大利 · 多洛米蒂",
  },
  {
    url: "/about-gallery/dolomites-knife-ridge.jpg",
    title: "多洛米蒂 · 刀锋山",
    location: "意大利 · 多洛米蒂",
  },
  {
    url: "/about-gallery/dolomites-ring-road.jpg",
    title: "多洛米蒂 · 魔戒之路",
    location: "意大利 · 多洛米蒂",
  },
  {
    url: "/about-gallery/dolomites-tre-cime.jpg",
    title: "多洛米蒂 · 三峰山",
    location: "意大利 · 多洛米蒂",
  }
];

const XIAOLONG_GALLERY_PHOTOS = [
  "/companions/xiaolong.jpg",
  "/companions/xiaolong-2.jpg",
  "/companions/xiaolong-3.jpg",
  "/companions/xiaolong-4.jpg",
];

export default function AboutUsTab({ onStartCustomise }: AboutUsTabProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showCompanionPortal, setShowCompanionPortal] = useState(false);
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [contactCompanion, setContactCompanion] = useState<Companion | null>(null);
  const [companionPhotoIndex, setCompanionPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % GALLERY_PHOTOS.length);
  };

  const prevPhoto = () => {
    setPhotoIndex((prev) => (prev === 0 ? GALLERY_PHOTOS.length - 1 : prev - 1));
  };

  // Filter companions
  const filteredCompanions = COMPANIONS.filter((c) => {
    const regionMatch = filterRegion === "all" || c.countries.includes(filterRegion as "italy" | "spain" | "switzerland" | "france" | "germany");
    const languageMatch = filterLanguage === "all" || c.languages.includes(filterLanguage);
    const ageMatch = filterAge === "all" || (filterAge === "18-24" ? c.age >= 18 && c.age <= 24 : filterAge === "24-30" ? c.age >= 24 && c.age <= 30 : c.age > 30);
    const difficultyMatch = filterDifficulty === "all" || c.difficulties.includes(filterDifficulty as any);
    return regionMatch && languageMatch && ageMatch && difficultyMatch;
  });

  if (showCompanionPortal) {
    const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => <button onClick={onClick} className={`rounded-xl px-4 py-2 text-xs font-bold transition ${active ? "bg-zinc-950 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>{children}</button>;
    return <section className="min-h-screen bg-slate-50 pb-16" id="companion-portal">
      <div className="relative isolate overflow-hidden bg-[#08090b] px-5 py-12 text-white sm:px-10 sm:py-16">
        <img src="/companions/companion-portal-cover.jpg" alt="多洛米蒂山景" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />
        <div className="mx-auto max-w-6xl">
          <button onClick={() => setShowCompanionPortal(false)} className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-zinc-300 transition hover:text-white"><ChevronLeft className="h-4 w-4" /> 返回关于我们（EUROPE TREKKING）</button>
          <span className="block w-fit rounded-full border border-emerald-500/40 bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300">♡ 温暖同行 · 欧洲华人专属陪爬</span>
          <h1 className="mt-4 text-4xl font-light tracking-tight sm:text-6xl">你的专属徒步陪爬</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-200 sm:text-base">一个人徒步太孤单？专业认证领队与温暖同行搭子，全程带路、节奏适配、摄影记录，不催不赶、不落单，安心享受欧洲绝美山野。</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-zinc-100 pb-4"><h2 className="flex items-center gap-2 text-sm font-bold text-emerald-800"><Users className="h-4 w-4" /> 筛选你的专属陪爬向导</h2><span className="text-xs text-zinc-500">匹配到 {filteredCompanions.length} 位陪爬员</span></div>
          <div className="space-y-3"><div className="flex flex-wrap items-center gap-2"><span className="mr-2 w-16 text-xs font-bold text-zinc-700">难度 Level:</span><FilterButton active={filterDifficulty === "all"} onClick={() => setFilterDifficulty("all")}>全部等级</FilterButton>{["T1", "T2", "T3"].map((item) => <FilterButton key={item} active={filterDifficulty === item} onClick={() => setFilterDifficulty(item)}>{item === "T1" ? "休闲娱乐" : item === "T2" ? "中级陪爬" : "高级徒步"}</FilterButton>)}</div>
          <div className="flex flex-wrap items-center gap-2"><span className="mr-2 w-16 text-xs font-bold text-zinc-700">国家 Country:</span><FilterButton active={filterRegion === "all"} onClick={() => setFilterRegion("all")}>全部国家</FilterButton>{[["italy", "意大利"], ["spain", "西班牙"], ["switzerland", "瑞士"], ["france", "法国"], ["germany", "德国"]].map(([value, label]) => <FilterButton key={value} active={filterRegion === value} onClick={() => setFilterRegion(value)}>{label}</FilterButton>)}</div>
          <div className="flex flex-wrap items-center gap-2"><span className="mr-2 w-16 text-xs font-bold text-zinc-700">年龄 Age:</span><FilterButton active={filterAge === "all"} onClick={() => setFilterAge("all")}>全部年龄</FilterButton>{["18-24", "24-30", "30+"].map((age) => <FilterButton key={age} active={filterAge === age} onClick={() => setFilterAge(age)}>{age} 岁</FilterButton>)}</div></div>
        </div>
        <div className="mt-6 space-y-5">
          {filteredCompanions.map((companion) => <article key={companion.id} className="grid overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm md:grid-cols-[180px_minmax(0,1fr)_180px]">
            <div className="relative min-h-44 overflow-hidden bg-gradient-to-br from-emerald-100 to-sky-100"><img src={companion.profileImage} alt={`${companion.name} 陪爬向导`} className="h-full w-full object-cover" /><span className="absolute bottom-3 right-3 rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">★ {companion.rating}</span></div>
            <div className="p-6"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">{companion.difficulties.at(-1)} 陪爬</span><span className="text-xs text-zinc-500">{companion.languages.join(" / ")} · {companion.age} 岁</span></div><h3 className="mt-3 text-xl font-bold text-zinc-950">{companion.name}</h3><p className="mt-1 text-xs font-medium text-emerald-800">{companion.countryName} · {companion.regionName} · {companion.provinceName}</p><p className="mt-2 text-sm leading-6 text-zinc-600">{companion.bio}</p><div className="mt-4 flex flex-wrap gap-2">{companion.tags.map((tag) => <span key={tag} className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-600">{tag}</span>)}</div></div>
            <div className="flex flex-col items-center justify-center gap-3 border-t border-zinc-100 p-6 md:border-l md:border-t-0"><span className="text-sm font-bold text-emerald-800">€{companion.price} / 天</span><button onClick={() => { setCompanionPhotoIndex(0); setContactCompanion(companion); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-900"><MessageSquare className="h-4 w-4" /> 了解更多</button></div>
          </article>)}
          {filteredCompanions.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center text-sm text-zinc-500">暂时没有符合条件的陪爬向导，请调整筛选条件。</div>}
        </div>
      </div>
      {contactCompanion && <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 p-3 sm:p-8" onMouseDown={() => setContactCompanion(null)}>
        <div className="mx-auto min-h-full w-full max-w-md py-4 sm:py-8" onMouseDown={(event) => event.stopPropagation()}>
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button aria-label="关闭档案" onClick={() => setContactCompanion(null)} className="absolute right-3 top-3 z-10 rounded-full bg-white/85 p-2 text-zinc-500 shadow-sm hover:text-zinc-950"><X className="h-5 w-5" /></button>
            <div className="relative aspect-[4/5] bg-emerald-950">
              <img src={XIAOLONG_GALLERY_PHOTOS[companionPhotoIndex]} alt={`${contactCompanion.name} 徒步照片 ${companionPhotoIndex + 1}`} className="h-full w-full object-cover" />
              <button aria-label="查看上一张照片" onClick={() => setCompanionPhotoIndex((current) => current === 0 ? XIAOLONG_GALLERY_PHOTOS.length - 1 : current - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"><ChevronLeft className="h-5 w-5" /></button>
              <button aria-label="查看下一张照片" onClick={() => setCompanionPhotoIndex((current) => (current + 1) % XIAOLONG_GALLERY_PHOTOS.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"><ChevronRight className="h-5 w-5" /></button>
              <div className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-2">
                {XIAOLONG_GALLERY_PHOTOS.map((_, index) => <button key={index} aria-label={`查看第 ${index + 1} 张照片`} onClick={() => setCompanionPhotoIndex(index)} className={`h-2 rounded-full transition-all ${index === companionPhotoIndex ? "w-6 bg-white" : "w-2 bg-white/55 hover:bg-white/85"}`} />)}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pb-5 pt-20 text-white"><div className="flex items-end justify-between gap-3"><div><h3 className="text-2xl font-black">{contactCompanion.name}</h3><p className="mt-1 text-sm text-zinc-100">{contactCompanion.countryName} · {contactCompanion.regionName} · {contactCompanion.provinceName}</p></div><span className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold">{contactCompanion.difficulties.at(-1)} 陪爬</span></div></div>
            </div>
            <div className="space-y-4 p-5 text-sm">
              <section className="overflow-hidden rounded-xl border border-zinc-200"><h4 className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 font-bold text-zinc-950">基本信息</h4><dl className="grid grid-cols-[105px_1fr] text-sm"><dt className="border-b border-r border-zinc-100 bg-zinc-50 px-4 py-3 font-semibold text-zinc-600">搭子昵称</dt><dd className="border-b border-zinc-100 px-4 py-3 text-zinc-900">{contactCompanion.name}</dd><dt className="border-b border-r border-zinc-100 bg-zinc-50 px-4 py-3 font-semibold text-zinc-600">年龄 / 性别</dt><dd className="border-b border-zinc-100 px-4 py-3 text-zinc-900">{contactCompanion.age} 岁 · {contactCompanion.gender}</dd><dt className="border-b border-r border-zinc-100 bg-zinc-50 px-4 py-3 font-semibold text-zinc-600">国家</dt><dd className="border-b border-zinc-100 px-4 py-3 text-zinc-900">{contactCompanion.countryName}</dd><dt className="border-b border-r border-zinc-100 bg-zinc-50 px-4 py-3 font-semibold text-zinc-600">大区</dt><dd className="border-b border-zinc-100 px-4 py-3 text-zinc-900">{contactCompanion.regionName}</dd><dt className="border-b border-r border-zinc-100 bg-zinc-50 px-4 py-3 font-semibold text-zinc-600">省份</dt><dd className="border-b border-zinc-100 px-4 py-3 text-zinc-900">{contactCompanion.provinceName}</dd><dt className="border-b border-r border-zinc-100 bg-zinc-50 px-4 py-3 font-semibold text-zinc-600">户外年限</dt><dd className="border-b border-zinc-100 px-4 py-3 text-zinc-900">2 年+ 欧洲徒步经验</dd><dt className="border-r border-zinc-100 bg-zinc-50 px-4 py-3 font-semibold text-zinc-600">语言</dt><dd className="px-4 py-3 text-zinc-900">意大利语 / 中文 / 英语</dd></dl></section>
              <section className="rounded-xl border border-zinc-200 p-4"><h4 className="font-bold text-zinc-950">性格与带队风格：</h4><p className="mt-2 leading-6 text-zinc-600">{contactCompanion.bio}</p></section>
              <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><h4 className="font-bold text-emerald-900">💡 关于我 & 陪爬亮点：</h4><ul className="mt-2 space-y-1.5 leading-6 text-emerald-900"><li>• 情绪价值拉满：开朗随和，让徒步旅程不冷场。</li><li>• 嘎嘎出片：兼顾人物与风光构图，记录高质量徒步照片。</li><li>• Vlog 记录加分：可按需记录动态镜头；介意入镜可提前说明。</li></ul></section>
              <section><h4 className="font-bold text-zinc-950">🏔️ 精选私藏路线（熟悉度 100%）：</h4><ol className="mt-2 space-y-1.5 text-zinc-700"><li><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">1</span>Lago di Aviolo（高山湖泊，绝美清澈）</li><li><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">2</span>Dolomiti 三峰山 Tre Cime（多洛米蒂经典地标）</li><li><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">3</span>Dolomiti Seceda 刀锋山（震撼山脊，风光大片）</li></ol></section>
              <div className="border-t border-zinc-100 pt-4"><p className="text-xs text-zinc-500">具体档期与结伴方式请在申请后与小泷确认。</p><button onClick={() => setContactCompanion(null)} className="mt-4 w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white">关闭档案</button></div>
            </div>
          </div>
        </div>
      </div>}
    </section>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="about-section">
      {/* Upper Grid: Description & Slideshow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-start">
        {/* Left Column: About Us Copy */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-700">关于我们</span>
            <div className="h-1 w-12 bg-emerald-600 mt-2 mb-4 rounded-full" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 leading-tight">
              欧洲华人专属 · 一日徒步与户外服务平台
            </h2>
          </div>

          <p className="text-base text-zinc-600 leading-relaxed">
            我们是一家专为欧洲华人及户外爱好者打造的轻户外服务平台。针对大家“休息时间少（通常只有一天）、不了解周边路线、缺乏同行搭子”的痛点，提供省心、安全、有伴的徒步体验。
          </p>

          <div className="space-y-4">
            <h4 className="font-bold text-zinc-800 text-base">● 我们为你提供：</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-950 block text-sm">一键生成一日计划</span>
                  <span className="text-zinc-600 text-sm">只需输入所在城市与出发时间，即刻获取为你量身打理的一日行程，轻松解锁周边好风光。</span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-950 block text-sm">温暖陪爬与搭子服务</span>
                  <span className="text-zinc-600 text-sm">一个人徒步太孤单？开启陪爬模式，与靠谱队友一起结伴同行。</span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-950 block text-sm">华人友好路线分级</span>
                  <span className="text-zinc-600 text-sm">从“休闲散步”到“进阶挑战”，清晰标注路线难度与装备建议，新手也能安心出发。</span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-950 block text-sm">同城社群交流</span>
                  <span className="text-zinc-600 text-sm">加入我们的徒步社群，随时分享路况、结识身边的户外爱好者。</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-zinc-100">
            <span className="text-xs text-zinc-500 italic">
              (如有多日深度行程需求，亦可联系小徒探讨。)
            </span>

            <button
              onClick={() => {
                setShowCompanionPortal(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-5 py-3 rounded-lg text-sm transition-all shadow-sm"
              id="learn-companion-btn"
            >
              <Users className="w-4 h-4" />
              <span>了解陪爬</span>
            </button>
          </div>
        </div>

        {/* Right Column: Sliding Photo Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="bg-white p-4 pb-8 rounded-2xl shadow-xl border border-zinc-100 max-w-sm w-full relative group">
            {/* Image Stage */}
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100 relative">
              <img
                src={GALLERY_PHOTOS[photoIndex].url}
                alt={GALLERY_PHOTOS[photoIndex].title}
                className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Slider Arrows */}
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/75 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/75 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Tag Overlays */}
              <div className="absolute top-3 left-3 bg-black/55 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                <MapIcon className="w-3 h-3 text-emerald-400" />
                <span>地标打卡</span>
              </div>

              <div className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-mono">
                {photoIndex + 1} / {GALLERY_PHOTOS.length}
              </div>
            </div>

            {/* Polaroid Description */}
            <div className="mt-5 text-center">
              <h4 className="font-extrabold text-zinc-900 text-base mb-1">
                {GALLERY_PHOTOS[photoIndex].title}
              </h4>
              <p className="text-zinc-500 text-xs flex items-center justify-center gap-1">
                <Compass className="w-3.5 h-3.5 text-zinc-400" />
                <span>{GALLERY_PHOTOS[photoIndex].location}</span>
              </p>
            </div>

            {/* Small page dot index bar */}
            <div className="flex justify-center gap-1.5 mt-4">
              {GALLERY_PHOTOS.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === photoIndex ? "bg-emerald-600 w-3" : "bg-zinc-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Companion Filter Section (Visible when user clicks "了解陪爬") */}
      {showCompanionPortal && (
        <div className="border-t border-zinc-100 pt-16 scroll-mt-24" id="companion-anchor">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">户外搭子 · 温暖陪爬</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
                寻找属于您的陪爬伙伴
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                平台合作领队均持有 CAI、UIMLA 等专业资格或极丰富的阿尔卑斯带队安全经验
              </p>
            </div>

            {/* Filter Toggle Reset */}
            <button
              onClick={() => {
                setFilterRegion("all");
                setFilterLanguage("all");
                setFilterDifficulty("all");
              }}
              className="text-xs text-zinc-500 hover:text-emerald-700 font-medium underline"
            >
              重置全部筛选
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Region Filter */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase">意向大区/区域</label>
              <div className="relative">
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:border-emerald-600 focus:outline-none appearance-none"
                >
                  <option value="all">全部区域 (Region: All)</option>
                  <option value="Dolomiti">多洛米蒂 (Dolomiti)</option>
                  <option value="Lombardia">伦巴第 (Lombardia)</option>
                  <option value="Veneto">威尼托 (Veneto)</option>
                  <option value="Piemonte">皮埃蒙特 (Piemonte)</option>
                  <option value="Toscana">托斯卡纳 (Toscana)</option>
                  <option value="Sicilia">西西里岛 (Sicilia)</option>
                </select>
                <Filter className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase">语言能力</label>
              <div className="relative">
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:border-emerald-600 focus:outline-none appearance-none"
                >
                  <option value="all">全部语言 (Language: All)</option>
                  <option value="中文">中文 (Mandarin)</option>
                  <option value="意大利语">意大利语 (Italiano)</option>
                  <option value="德语">德语 (Deutsch)</option>
                  <option value="法语">法语 (Français)</option>
                  <option value="英语">英语 (English)</option>
                </select>
                <Filter className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase">领航最大难度</label>
              <div className="relative">
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:border-emerald-600 focus:outline-none appearance-none"
                >
                  <option value="all">不限难度 (Difficulty: All)</option>
                  <option value="T1">T1 休闲散步 (Leisurely)</option>
                  <option value="T2">T2 初级体验 (Novice)</option>
                  <option value="T3">T3 进阶挑战 (Advanced)</option>
                  <option value="T4">T4 极限登山 (Expert)</option>
                </select>
                <Filter className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {filteredCompanions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredCompanions.map((companion) => (
                <div
                  key={companion.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  id={`companion-card-${companion.id}`}
                >
                  <div>
                    {/* Header: Name, Avatar, Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl bg-zinc-50 p-1.5 rounded-xl border border-zinc-100">{companion.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-zinc-900 text-base">{companion.name}</h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${companion.gender === '男' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                              {companion.gender}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mt-0.5">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{companion.rating.toFixed(1)}</span>
                            <span className="text-zinc-400 font-normal">({companion.hikesCompleted}次陪爬)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-zinc-500 block">费用预算</span>
                        <span className="text-lg font-extrabold text-emerald-800">€{companion.price} <span className="text-[10px] text-zinc-500 font-normal">/日</span></span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-zinc-600 line-clamp-3 mb-4 leading-relaxed bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-100">
                      {companion.bio}
                    </p>

                    {/* Coverage details */}
                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">带队区域:</span>
                        <span className="font-semibold text-zinc-800">{companion.regions.join(" · ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">语言掌握:</span>
                        <span className="font-semibold text-zinc-800">{companion.languages.join(" / ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">最大难度:</span>
                        <span className="font-bold text-emerald-700">
                          {companion.difficulties.join(" / ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags and Action */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1 max-w-[60%]">
                      {companion.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="bg-zinc-100 text-zinc-600 text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setContactCompanion(companion)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                    >
                      申请结伴
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-12 text-center text-zinc-500 text-sm mb-12">
              没有找到符合该筛选条件的领队伙伴，可以尝试重置筛选或联系客服微信获取更多推荐。
            </div>
          )}
        </div>
      )}

      {/* Custom Contact Popup Modal */}
      {contactCompanion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-sm w-full p-6 shadow-2xl relative">
            <h3 className="font-bold text-zinc-900 text-lg mb-2">获取联系方式</h3>
            <p className="text-zinc-500 text-xs mb-4">
              向陪爬伙伴 <b>{contactCompanion.name}</b> 申请结伴，可在微信中直接沟通一日线路安排与组队意向：
            </p>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">微信号码 (WeChat ID)</span>
                <span className="font-mono text-zinc-800 text-sm font-bold select-all">{contactCompanion.contactWeChat}</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(contactCompanion.contactWeChat);
                  alert("微信号已成功复制到剪贴板！");
                }}
                className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs px-2.5 py-1.5 rounded font-semibold transition-colors"
              >
                复制微信号
              </button>
            </div>

            <div className="flex items-start gap-2 text-[10px] text-zinc-500 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/60 mb-6">
              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>本服务不收取任何中介费用，安全免责声明由出行领队与客户双方友好协商达成为准。</span>
            </div>

            <button
              onClick={() => setContactCompanion(null)}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-2 rounded-lg text-sm font-bold transition-all"
            >
              我知道了，返回
            </button>
          </div>
        </div>
      )}

      {/* Wide Black/Green Banner */}
      <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 rounded-2xl p-8 sm:p-10 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-950/25 blur-3xl rounded-full" />
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <h3 className="text-white text-lg sm:text-xl font-bold tracking-wide">
            让你的每一个休息天，都能轻松出发，不负山野！
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm">
            点击此处，立即定制你的一日专属欧洲徒步计划
          </p>
        </div>

        <button
          onClick={onStartCustomise}
          className="relative z-10 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:shadow-emerald-900/10 group whitespace-nowrap"
          id="banner-start-btn"
        >
          <span>制定一日计划</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
