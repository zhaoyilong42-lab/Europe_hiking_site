import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { 
  ArrowLeft, X, MapPin, Clock, Compass, TrendingUp, Camera, 
  CheckSquare, Info, Car, AlertTriangle, AlertCircle, Map, Check, Ruler, Gauge
} from "lucide-react";
import { Route, COUNTRIES } from "../data/hikingDb";


interface RouteDetailViewProps {
  route: Route;
  onClose: () => void;
}

interface CustomStep {
  title: string;
  duration: string;
  trail: string;
  description: string;
}

interface PhotoSpot {
  id: number;
  title: string;
  desc: string;
  time: string;
}

const cleanMarkdown = (value: string) => value.replace(/^[-*]\s*/, "").replace(/\*\*/g, "").trim();

function readRoadBookField(roadBook: string, label: string, fallback = "待补充") {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return roadBook.match(new RegExp(`^\\s*-\\s*${escaped}[：:]\\s*(.+)$`, "m"))?.[1]?.trim() || fallback;
}

function readRouteSteps(roadBook: string): CustomStep[] {
  const itinerary = roadBook.match(/##[^\S\r\n]+.*徒步路线规划[\s\S]*?(?=\n##[^\S\r\n]|$)/)?.[0] ?? "";
  const blocks = [...itinerary.matchAll(/^###\s*(\d+)\.\s*(.+?)\s*\n([\s\S]*?)(?=^###\s*\d+\.|(?![\s\S]))/gm)];
  const headingSteps = blocks.map((match) => {
    const body = match[3];
    const field = (label: string, fallback: string) => body.match(new RegExp(`^\\s*-\\s*${label}[：:]\\s*(.+)$`, "m"))?.[1]?.trim() || fallback;
    return {
      title: `${match[1]}. ${match[2].trim()}`,
      duration: `⏱️ ${field("大概耗时", "时长以现场节奏为准")}`,
      trail: `📍 对应路段: ${field("对应路段", "以现场官方路牌为准")}`,
      description: `路线说明: ${field("路线说明", "沿官方步道稳步前行，随时留意天气与脚下路况。").replace(/^路线说明[：:]?\s*/, "")}`,
    };
  });
  if (headingSteps.length > 0) return headingSteps;

  // Italy road books use a time table. Its third column is the original,
  // factual path reference (for example Trail 21 / CAI 567).
  const tableRows = itinerary.split("\n")
    .filter((line) => /^\s*\|/.test(line) && !/\|\s*:?-{3,}/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cleanMarkdown(cell)))
    .filter((cells) => cells.length >= 6 && !/时间段|行程节点/.test(cells.join(" ")))
    .filter((cells) => !/^(—|-|自驾|停车|停留|用餐)$/u.test(cells[2] ?? ""));
  return tableRows.map((cells, index) => ({
    title: `${index + 1}. ${cells[1] || "徒步路段"}`,
    duration: `⏱️ ${cells[3] || cells[0] || "时长以现场节奏为准"}`,
    trail: `📍 对应路段: ${cells[2] || "以现场官方路牌为准"}`,
    description: `路线说明: ${cells[5] || "沿官方步道稳步前行，随时留意天气与脚下路况。"}`,
  }));
}

function readPhotoSpots(roadBook: string): PhotoSpot[] {
  const section = roadBook.match(/##[^\S\r\n]+.*(?:📸|打卡拍照点推荐)[\s\S]*?(?=\n##[^\S\r\n]|$)/)?.[0] ?? "";
  const blocks = [...section.matchAll(/^###\s*(?:•\s*)?(.+?)\s*\n([\s\S]*?)(?=^###\s|(?![\s\S]))/gm)];
  return blocks.slice(0, 3).map((match, index) => ({
    id: index + 1,
    title: match[1].trim(),
    desc: `拍摄特色：${match[2].match(/拍摄特色[：:]\s*(.+)/)?.[1]?.trim() || "请根据现场安全距离与天气选择机位。"}`,
    time: `⏱️ 建议停留时间：${match[2].match(/建议停留时间[：:]\s*(.+)/)?.[1]?.trim() || "10 - 15 分钟"}`,
  }));
}

// Map route IDs to highly detailed, high-fidelity custom steps
const CUSTOM_STEPS_MAP: Record<string, CustomStep[]> = {
  "it-seceda": [
    {
      title: "Ortisei 停车场 → Seceda 山顶站 (徒步登顶)",
      duration: "⏱️ 约 2.5 - 3.5 小时 (预计 13:00 - 13:30 PM 到达，累计爬升约 1300 米，海拔约 2519 米)",
      trail: "📍 对应路段: trail 1 (Ortisei - Seceda 直达步道，从缆车站旁停车场向北起步，经 Costamula 一带持续上行)",
      description: "路线说明: 整段连续上坡，是当天体力感最重的一段。节奏压稳，别在开头就把体力气用光；中途 Curona 餐厅一带有短暂补水。"
    },
    {
      title: "Seceda 山顶站 → Seceda 山脊观景点",
      duration: "⏱️ 约 10 - 15 分钟 (预计 13:15 - 13:45 PM 到达，海拔约 2519 米)",
      trail: "📍 对应路段: trail 6 (山顶站起步，连至 Gipfelkreuz 与金属环状观景结构)",
      description: "路线说明: 第一眼先把视线打开，这是整条路线最经典的“瑞士军刀”刀锋画面，海拔推到全段最高点。"
    },
    {
      title: "Seceda 山脊 → Furcella de Pana 鞍部 → Pieralongia 山屋 (折返点)",
      duration: "⏱️ 约 40 - 50 分钟 (预计 14:30 - 15:00 PM 到达，海拔约 2297 米)",
      trail: "📍 对应路段: trail 6 → trail 1 (高段沿山脊护栏步道) → trail 2B (接 Pieralongia)",
      description: "路线说明: 先沿泥土轻步道推进至 Furcella de Pana 鞍部 (约 2439 米)，再向 Pieralongia 山屋下行。这是当天最稳的开场段，景色一口气全打开。形塑写作为折返点，不继续走完完整大环线，给下山留足体力。"
    },
    {
      title: "Pieralongia → 原路返回 Seceda 山顶站",
      duration: "⏱️ 约 40 - 50 分钟 (预计 15:30 - 16:00 PM 回到山顶站)",
      trail: "📍 对应路段: trail 2B → trail 1 → trail 6 (沿原路折返)",
      description: "路线说明: 沿原路返回山顶站，节奏放松，把腿部和股四头肌照顾好，不要为了赶时间冲速度。"
    }
  ],
  "it-tres-cime": [
    {
      title: "Auronzo 避难所 → Lavaredo 避难所",
      duration: "⏱️ 约 30 - 45 分钟 (预计 09:30 AM 到达，海拔约 2344 米)",
      trail: "📍 对应路段: trail 101 (平缓宽阔的石板碎石道)",
      description: "路线说明: 清晨起步非常平缓，可以当作热身。右侧可以俯瞰深邃的山谷，左侧则是巍峨的山壁，会经过一座白色精致小教堂。"
    },
    {
      title: "Lavaredo 避难所 → Forcella Lavaredo 垭口",
      duration: "⏱️ 约 30 - 40 分钟 (预计 10:15 AM 到达，海拔约 2450 米)",
      trail: "📍 对应路段: trail 101 (陡峭碎石上坡段)",
      description: "路线说明: 这一段坡度明显增加，路面多为中大颗松散碎石。登上垭口后，三峰山的庞大侧影会突然撞入眼帘，视觉极其震撼！"
    },
    {
      title: "Forcella Lavaredo → Locatelli 避难所 (最佳拍摄点)",
      duration: "⏱️ 约 50 - 60 分钟 (预计 11:30 AM 到达，海拔约 2405 米)",
      trail: "📍 对应路段: trail 101 (山体切向缓下坡路)",
      description: "路线说明: 沿山体下行切过去，道路清晰。Locatelli避难所是经典的三峰山明信片背景拍摄地。后侧还有一战时开凿的防御工事岩洞，可以用作天然前景拍三峰。"
    },
    {
      title: "Locatelli 避难所 → 山谷牧场 → Auronzo 避难所 (完结)",
      duration: "⏱️ 约 2.0 小时 (预计 14:30 PM 返回起点)",
      trail: "📍 对应路段: trail 105 (下切深谷后急促爬升环线)",
      description: "路线说明: 先下一段陡坡到绿色山谷草甸，随后要面对一段较陡的碎石之字形上坡，回到 Auronzo 停车场，完成闭环。"
    }
  ],
  "es-caminito": [
    {
      title: "北入口 (Ardales) → 控制闸口",
      duration: "⏱️ 约 30 - 40 分钟 (建议 09:00 AM 出发)",
      trail: "📍 对应路段: 穿山林荫辅道 (包含一段幽暗的岩石大涵洞)",
      description: "路线说明: 从停车场出来，需要先走一段平缓的林道和隧道才能到达官方检票口。检票后会统一发放安全帽并讲解安全守则。"
    },
    {
      title: "控制闸口 → 第一峡谷悬空木栈道",
      duration: "⏱️ 约 1.0 小时",
      trail: "📍 对应路段: Gaitanejo 峡谷壁挂木栈道",
      description: "路线说明: 正式步入百米高空悬挂在绝壁上的木板栈道！脚下是深邃狭窄的谷底，两旁石壁几乎触手可及，请戴好头盔稳步慢行。"
    },
    {
      title: "中段河谷林道 → 第二悬崖栈道",
      duration: "⏱️ 约 1.0 小时",
      trail: "📍 对应路段: El Hoyo 谷地泥土道与悬壁栈道",
      description: "路线说明: 中段会有一大段地面泥土平坦路，视野开阔。随后再次切入壮丽的悬壁栈道，穿过几乎垂直的石灰岩绝壁。"
    },
    {
      title: "跨峡谷吊桥 → 南出口 (El Chorro)",
      duration: "⏱️ 约 45 分钟 (预计 12:30 PM 抵达终点)",
      trail: "📍 对应路段: 悬空钢索吊桥 & 下山石阶路",
      description: "路线说明: 翻越全线最刺激的悬索吊桥！桥底是百米悬空，风力极大，桥身会有轻微晃动，极其考验胆量。过桥后沿石级下行至火车站，可乘接驳巴士返回。"
    }
  ]
};

export default function RouteDetailView({ route, onClose }: RouteDetailViewProps) {
  // Setup checked items for the gear checklist
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({
    "gear-base": true,
    "gear-wind": true,
    "gear-shoes": true,
    "gear-poles": true,
    "gear-water": true,
  });

  const toggleGear = (id: string) => {
    setCheckedGear(prev => ({ ...prev, [id]: !prev[id] }));
  };


  const country = COUNTRIES.find((c) => c.id === route.countryId);
  const basicFacts = [
    ["出发时间", readRoadBookField(route.roadBook, "出发时间", "07:00 AM")],
    ["出发地", readRoadBookField(route.roadBook, "出发地", route.departure)],
    ["目的地", readRoadBookField(route.roadBook, "目的地", "以路书为准")],
    ["到达时间", readRoadBookField(route.roadBook, "到达时间")],
    ["驾车耗时", readRoadBookField(route.roadBook, "驾车耗时")],
    ["徒步耗时", readRoadBookField(route.roadBook, "徒步耗时", route.duration)],
    ["路线距离", readRoadBookField(route.roadBook, "路线距离", route.distance)],
    ["休息与拍照", readRoadBookField(route.roadBook, "休息与拍照")],
    ["预计回程时间", readRoadBookField(route.roadBook, "预计回程时间")],
    ["线路强度", readRoadBookField(route.roadBook, "线路强度", route.difficulty)],
  ].filter(([, value]) => value !== "待补充");


  // Generate generic steps if route doesn't have custom ones mapped
  const getRouteSteps = (): CustomStep[] => {
    if (CUSTOM_STEPS_MAP[route.id]) {
      return CUSTOM_STEPS_MAP[route.id];
    }

    // Europe Markdown files contain numbered ### sections. Read their original
    // trail numbers, durations and route notes instead of inventing a route.
    const importedSteps = readRouteSteps(route.roadBook);
    if (importedSteps.length > 0) return importedSteps;
    
    // Fallback steps if parsing yielded nothing
    return [
      {
        title: `1. ${route.departure} → 起步集结`,
        duration: "⏱️ 约 1.0 - 1.5 小时 (建议清晨起步避开暴晒)",
        trail: `📍 对应路段: ${route.departure} 方向主步道`,
        description: `路线说明: 出发集结，整理行装。前半段一般坡度较为缓和，非常适合调节呼吸和热身。`
      },
      {
        title: "2. 主段爬升 → 核心景观段",
        duration: "⏱️ 约 2.0 - 3.0 小时 (挑战段爬升)",
        trail: `📍 对应路段: 景区标志性极佳观景线`,
        description: `路线说明: 爬升的主要负荷段，沿途山石堆积，视野豁然开朗。注意调整脚尖朝向，稳步踏实前行。`
      },
      {
        title: `3. 终点折返 / 极顶探秘`,
        duration: "⏱️ 约 1.0 - 1.5 小时 (停留拍照与午餐)",
        trail: `📍 对应路段: 峰顶 / 湖畔环线观景路`,
        description: `路线说明: 抵达景观的核心。可在此处寻找最佳拍照角度，品尝高热量路餐，短暂静修感受自然力量。`
      },
      {
        title: "4. 下行回归 → 停车场",
        duration: "⏱️ 约 1.5 - 2.0 小时 (安全下山)",
        trail: `📍 对应路段: 沿原路下撤或下山环线`,
        description: `路线说明: 下山时重力负荷在膝关节。建议配合登山杖交替支撑，控制节奏，安全返回。`
      }
    ];
  };

  const stepsList = getRouteSteps();

  // Preserve the written photo locations, descriptions and dwell times from
  // each Markdown road book. Older curated records retain their custom map.
  const getPhotoSpots = () => {
    if (route.id === "it-seceda") {
      return [
        { id: 1, title: "登顶后的山顶站前草原平台", desc: "拍摄特色：刀锋山经典明信片机位，左边是 Seceda 山脊 + 大草坡斜线，右边远眺罗森加滕山 Catinaccio-Rosengarten、蓝柯弗尔山 Sassolungo-Langkofel 与休斯高原 Alpe di Siusi。", time: "⏱️ 建议停留时间：20 - 30 分钟" },
        { id: 2, title: "岩石小径至高位观影段", desc: "拍摄特色：从靠近 Seceda 山脊的岩石小径拍摄刀锋山侧面悬崖褶皱，岩石两侧无扶手，画面更野、更出片，但需要脚下稳。", time: "⏱️ 建议停留时间：15 - 20 分钟" },
        { id: 3, title: "Furcella de Pana 山口与 Pieralongia 周边", desc: "拍摄特色：高位鞍部把 Odle 群峰、Sassolungo 与休斯草原同时拉进一张画面。搭配 Dolomite 巨石的“石牙”前景，是环境感最足的位置。", time: "⏱️ 建议停留时间：20 - 30 分钟" }
      ];
    }
    const importedSpots = readPhotoSpots(route.roadBook);
    if (importedSpots.length > 0) return importedSpots;

    // Generic fallback photo spots derived from the route data
    return [
      { id: 1, title: "行程最佳全景位置", desc: `拍摄特色: ${route.photoSpot || "开阔的山间垭口或观景台，将远景雪峰与近景小径、人物完美融合。建议使用广角端拍摄大自然的气势。"}`, time: "⏱️ 建议停留时间: 15 - 20 分钟" },
      { id: 2, title: "林线过渡与透光处", desc: "拍摄特色: 拍摄斑驳阳光洒在针叶林木和碎石路上的光影对比。使用中焦段拍摄徒步者的动态背影，极具故事感。", time: "⏱️ 建议停留时间: 10 - 15 分钟" },
      { id: 3, title: "折返点/顶峰地标纪念", desc: "拍摄特色: 在徒步的极顶或地标石柱前，迎着逆光或侧光进行半身特写，记录征服自然、战胜疲惫的真实喜悦笑容。", time: "⏱️ 建议停留时间: 15 - 25 分钟" }
    ];
  };

  const photoSpots = getPhotoSpots();
  const displayTitle = route.title.replace(/^[^\p{L}\p{N}]+/u, "").trim();
  const italianTitle = displayTitle.match(/\(([^)]+)\)/)?.[1] || route.title.split("·").at(-1)?.trim();

  return (
    <div className="fixed inset-0 overflow-y-auto bg-stone-50 z-[100] animate-fade-in flex flex-col" id="route-detail-full-view">
      {/* 1. TOP STICKY BAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 sm:py-4 flex items-center justify-between shadow-sm">
        <button 
          onClick={onClose}
          className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors font-semibold text-xs sm:text-sm py-1.5 px-3 rounded-lg hover:bg-stone-100"
          id="btn-back-to-list"
        >
          <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>返回路线列表</span>
        </button>

        <div aria-hidden="true" />

        <div className="flex items-center gap-2 no-print">

          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-100 hover:bg-stone-200/80 text-stone-600 rounded-full flex items-center justify-center transition-colors" aria-label="关闭" id="btn-close-full-view"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        </div>
      </header>

      {/* 2. HERO BANNER SECTION */}
      <section className="relative flex min-h-[270px] w-full items-end overflow-hidden bg-stone-900 sm:min-h-[360px]">
        <img 
          src={route.image} 
          alt={route.title}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.45] saturate-[1.1]"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-6 text-white sm:px-12 sm:pb-7">
          <h1 className="flex items-end gap-3 font-serif text-3xl font-bold leading-[1.12] tracking-tight drop-shadow-lg sm:text-5xl md:text-6xl">
            <span className="mb-1 text-3xl sm:mb-2 sm:text-5xl">🏔️</span>{displayTitle.replace(/\s*\([^)]+\)/, "")}
          </h1>
          {italianTitle && <p className="mt-2 font-serif text-base italic text-stone-100/95 drop-shadow sm:text-xl">{italianTitle}</p>}
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-white/15 pt-3 text-[10px] italic leading-5 text-stone-200/90 sm:text-xs">
            <span>📷 图源：Wikimedia Commons（CC BY / CC BY-SA 4.0 自由版权）</span>
            <span className="hidden sm:inline">·</span>
            <span>坐标：{country?.name} · {route.departure.replace(" 出发", "")}</span>
          </div>
        </div>
      </section>

      {/* ROUTE PILLS — between cover image and basic information */}
      <div className="bg-white border-b border-stone-200/60 py-3.5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2 items-center text-xs">
          <span className="bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-sm">
            📍 {country?.name} · {country?.nameEn}
          </span>
          <span className="bg-stone-100 text-stone-700 font-bold px-3 py-1.5 rounded-md border border-stone-200/60">
            {route.difficulty} (纯徒步路线)
          </span>
          <span className="bg-cyan-50 text-cyan-800 font-bold px-3 py-1.5 rounded-md border border-cyan-100/80 flex items-center gap-1">
            🚌 {route.departure} · 一日往返
          </span>

        </div>
      </div>

      {/* 3. MAIN CONTAINER FOR CONTENTS */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        
        {/* SECTION 1: 基本信息 CARD */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-emerald-800"><span className="text-xl">📌</span><h2 className="text-lg font-bold text-stone-900 tracking-tight">基本信息</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl border border-stone-200 bg-stone-50/60 p-3 sm:p-4">
            {[{ label: "路线距离", value: route.distance, icon: Ruler, colour: "text-stone-800" }, { label: "徒步耗时", value: route.duration, icon: Clock, colour: "text-stone-800" }, { label: "累计爬升", value: route.elevationGain, icon: TrendingUp, colour: "text-emerald-800" }, { label: "难度级别", value: route.difficulty, icon: Gauge, colour: "text-stone-800" }].map(({ label, value, icon: Icon, colour }) => <div key={label} className="flex min-w-0 items-center gap-3 rounded-xl px-2.5 py-2">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-200 text-stone-700"><Icon className="h-5 w-5" /></span>
              <span className="min-w-0"><span className="block text-[10px] font-bold tracking-wide text-stone-500">{label}</span><span className={`block break-words text-sm font-extrabold leading-5 ${colour}`}>{value}</span></span>
            </div>)}
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4">
            <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {basicFacts.map(([label, value]) => <li key={label} className="flex items-start gap-2 text-sm leading-6 text-stone-700"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" /><span><strong className="mr-2 text-stone-900">{label}:</strong>{value}</span></li>)}
            </ul>
          </div>
          <p className="text-sm leading-7 text-stone-600">{route.description}</p>
        </section>

        {/* SECTION 2: 前往徒步起点路径 SECTION */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 pb-2">
            <span className="text-xl">🚌</span>
            <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">前往徒步起点路径 (07:00 AM - 预计 10:15 AM 到达停车场)</h2>
          </div>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed bg-white border border-stone-200 p-5 rounded-2xl">
            从主要城市（如 {route.departure.replace("出发", "")}）准时起程。通过 A22/A4 高速向北/目的地行驶，转入山谷省道 SS242 / SP235。两旁是陡峭险峻的山林风光。预计在 09:45 - 10:15 AM 前往集结区附近的停车场。旺季时车位极度紧张，请务必赶在 10:00 前到场。
          </p>

          {/* Morning Peak traffic warning card */}
          <div className="bg-amber-50 border-2 border-amber-500/30 rounded-2xl p-5 flex gap-4 shadow-xs">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-amber-950 text-sm">⚠️ 早高峰与出城交通关键提醒</h4>
              <p className="text-amber-900 text-xs leading-relaxed">
                在周中或滑雪/徒步大旺季（7月-9月，12月-2月），出城方向高速路极易在上午 08:00 - 09:30 出现瓶颈拥堵。建议比预定计划提前 15 - 30 分钟起步。本路线极度依赖晴朗天气，如果遇到清晨中大雨或高空大雾起重，请及时启动备用 Plan B。
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: 徒步路线规划 SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <span className="text-xl">🥾</span>
            <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">徒步路线规划 ({route.difficultyCode === "T1" ? "休闲观光版" : "纯徒步版本"})</h2>
          </div>

          {/* Timeline steps row-by-row */}
          <div className="relative border-l-2 border-emerald-600/30 ml-4 pl-6 space-y-10">
            {stepsList.map((step, idx) => (
              <div key={idx} className="relative bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all">
                {/* Visual Connector dot */}
                <span className="absolute -left-[35px] top-6 w-6 h-6 bg-emerald-850 text-white rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-stone-50">
                  {idx + 1}
                </span>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                    {step.title}
                  </h3>

                  {/* Badges block inside the step card */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-stone-50 border border-stone-200/80 text-stone-600 font-bold px-2 py-1 rounded">
                      {step.duration}
                    </span>
                    <span className="bg-emerald-50 border border-emerald-100/60 text-emerald-850 font-medium px-2 py-1 rounded">
                      {step.trail}
                    </span>
                  </div>

                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed border-t border-stone-100 pt-3">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Warning checklist items under itinerary */}
          <div className="bg-amber-50/30 border border-amber-200/60 rounded-2xl p-5 space-y-3.5 text-xs text-stone-700">
            <h4 className="font-extrabold text-amber-950 flex items-center gap-1.5 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>安全要点与注意事项</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>本路线部分路段包含极其开阔、垂直落差巨大的绝壁边缘，恐高症患者切勿靠近护栏，且大风天切忌站立在无防护的石上摆拍。</li>
              <li>沿途除了山屋或起点站外几乎没有公共卫生间或水源补充。请在开爬前于停车场服务台排队上厕所，并带足不低于 2.5L 的饮用水。</li>
              <li>部分地段如 {route.title.replace("计划", "")} 的高段可能有浮石滚落风险，同行伙伴之间请保持适当的安全踩踏距离。</li>
            </ul>
          </div>

          {/* Plan B card */}
          <div className="bg-stone-100/80 border border-stone-200 rounded-2xl p-5">
            <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Map className="w-4 h-4 text-stone-500" />
              <span>🟡 预备方案 / Plan B</span>
            </h4>
            <ul className="text-xs text-stone-600 space-y-1.5 list-disc pl-5">
              <li>**体能警报折返**: 假如在第一阶段或第二阶段遭遇严重膝盖酸软，请果断选择原路下山，不要强撑。山下小镇均有接驳出租车或缆车备用。</li>
              <li>**恶劣天气变道**: 如遇突发山间雷雨，切勿在大片开阔草甸或金属十字架旁逗留。立即就近切入最近的高山避难所 (Rifugio) 避险，静待天气转晴。</li>
            </ul>
          </div>
        </section>

        {/* SECTION 4: 打卡拍照推荐 SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <span className="text-xl">📸</span>
            <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">打卡拍照推荐</h2>
          </div>

          {/* 3-column photo spots layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {photoSpots.map((spot, index) => (
              <div key={spot.id} className={`bg-white border rounded-2xl p-5 flex flex-col justify-between shadow-xs ${index === 0 ? "border-emerald-400" : "border-stone-200"}`}>
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800"><Camera className="h-4 w-4" /> 机位 #{index + 1}</span>
                  <h4 className="font-extrabold text-stone-950 text-base leading-snug">• {spot.title}</h4>
                  <p className="text-stone-700 text-sm leading-6">{spot.desc}</p>
                </div>
                <div className="text-xs text-stone-500 font-mono mt-4 pt-3 border-t border-stone-200">{spot.time}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: 小陇建议的爬山装备清单 SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <span className="text-xl">🎒</span>
            <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">小陇建议的爬山装备清单</h2>
          </div>

          {/* Checklist with active toggles */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <p className="text-xs text-stone-400 font-bold mb-5 block uppercase tracking-wider">
              请在出发前核对以下清单，确保行装无误 (点击可标记已打包项):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "gear-base", name: "速干底层 / 保暖内衣", desc: "速干材质贴身防感冒，可多备一件用于汗湿后更换" },
                { id: "gear-wind", name: "防风防雨外屏 (冲锋衣/裤)", desc: "阿尔卑斯山顶常年大风，防雨系数需 10000mm 以上" },
                { id: "gear-insu", name: "轻量保温层 (轻薄羽绒/抓绒)", desc: "海拔每上升1000米，气温降低6度，山顶极冷，不可缺" },
                { id: "gear-shoes", name: "抓地防滑登山鞋 (中高帮推荐)", desc: "硬底、耐磨、护踝，多松散石砾路防止崴脚" },
                { id: "gear-poles", name: "伸缩登山杖 (长距离下坡护膝)", desc: "两支交替撑重，可分散下山对膝关节 30% 冲击" },
                { id: "gear-sun", name: "高指数防晒霜 + 太阳镜 + 遮阳帽", desc: "高海拔紫外线极强，眼镜可防冰川/岩壁眩光" },
                { id: "gear-water", name: "充足饮用水 (登顶段不低于2.5L)", desc: "可携带运动电解质片，沿途无直饮补给站" },
                { id: "gear-food", name: "高能量干粮 / 能量棒 / 简易路餐", desc: "牛肉干、士力架、坚果等，高强度消耗必备" },
                { id: "gear-map", name: "离线卫星地图 App + 满电充电宝", desc: "山野常无网络信号，提前下载离线足迹防迷航" },
                { id: "gear-lamp", name: "备用头灯 / 充电应急手电", desc: "防止下撤过晚天色全暗。山谷天黑极快，手机手电极易没电" }
              ].map((item) => {
                const isChecked = checkedGear[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleGear(item.id)}
                    className={`text-left p-3.5 rounded-xl border flex items-start gap-3.5 transition-all ${
                      isChecked 
                        ? "bg-emerald-50/40 border-emerald-500/40" 
                        : "bg-stone-50/50 border-stone-200/80 hover:bg-stone-50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
                      isChecked 
                        ? "bg-emerald-800 border-emerald-800 text-white" 
                        : "border-stone-300 bg-white"
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className={`text-xs sm:text-sm font-extrabold block transition-colors ${
                        isChecked ? "text-emerald-950" : "text-stone-800"
                      }`}>
                        {item.name}
                      </span>
                      <span className="text-[11px] text-stone-400 block mt-0.5 leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* 4. FOOTER FOOTNOTE */}
      <footer className="bg-stone-150 border-t border-stone-200 text-stone-400 py-8 px-4 text-center text-xs space-y-2 mt-auto">
        <p>精确地点：{country?.nameEn}阿尔卑斯山脉 · 奥尔蒂塞伊 / 塞瑟达谷地区</p>
        <p>照片及图例版权：Wikimedia Commons (CC BY / CC BY-SA 4.0 自由版) & Unsplash Open-Source</p>
      </footer>
    </div>
  );
}
