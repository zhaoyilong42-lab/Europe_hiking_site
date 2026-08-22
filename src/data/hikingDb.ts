import { ITALY_ROUTES } from "./routes/italy";
import { SWITZERLAND_ROUTES } from "./routes/switzerland";
import { FRANCE_ROUTES } from "./routes/france";
import { SPAIN_ROUTES } from "./routes/spain";
import { GERMANY_ROUTES } from "./routes/germany";

export interface Route {
  id: string;
  countryId: string;
  cityId?: string; // Optional link to Italian city
  subtitle?: string; // Optional subtitle descriptor
  title: string;
  departure: string;
  difficulty: string;
  difficultyCode: 'T1' | 'T2' | 'T3' | 'T4';
  duration: string;
  distance: string;
  elevationGain: string;
  description: string;
  image: string;
  photoSpot: string;
  packingList: string[];
  roadBook: string;
}

export interface Country {
  id: string;
  name: string;
  nameEn: string;
  flagColors: string; // Tailwind linear gradient or emoji flag representation
  description: string;
  routesCount: number;
}

export interface ItalyCity {
  id: string;
  name: string;
  nameEn: string;
  region: string;
  routesCount: number;
  description: string;
  image: string;
  recommendedRoute: string;
  recommendedRouteId: string;
}

export interface Companion {
  id: string;
  name: string;
  avatar: string;
  gender: '男' | '女';
  rating: number;
  hikesCompleted: number;
  languages: string[];
  regions: string[]; // Areas they guide (e.g., "Lombardia", "Veneto", "Dolomiti")
  countries: ("italy" | "spain" | "switzerland" | "france" | "germany")[];
  countryName: string;
  regionName: string;
  provinceName: string;
  age: number;
  profileImage?: string;
  difficulties: ('T1' | 'T2' | 'T3' | 'T4')[];
  price: number; // Euros per day
  bio: string;
  tags: string[];
  contactWeChat: string;
}

export const COUNTRIES: Country[] = [
  {
    id: "italy",
    name: "意大利",
    nameEn: "Italia",
    flagColors: "linear-gradient(to right, #009246 33.3%, #ffffff 33.3%, #ffffff 66.6%, #ce2b37 66.6%)",
    description: "白云石秘境、亚平宁山脊与地中海悬崖",
    routesCount: 5
  },
  {
    id: "switzerland",
    name: "瑞士",
    nameEn: "Schweiz / Suisse",
    flagColors: "radial-gradient(circle, #ffffff 15%, transparent 15%), linear-gradient(to bottom, #d52b1e 100%, #d52b1e 100%)", // Cross custom drawn in UI
    description: "阿尔卑斯高山湖泊、雪峰全景与齿轨列车",
    routesCount: 5
  },
  {
    id: "france",
    name: "法国",
    nameEn: "France",
    flagColors: "linear-gradient(to right, #002395 33.3%, #ffffff 33.3%, #ffffff 66.6%, #ed2939 66.6%)",
    description: "韦尔东翡翠大峡谷、勃朗峰山麓与普罗旺斯...",
    routesCount: 5
  },
  {
    id: "spain",
    name: "西班牙",
    nameEn: "España",
    flagColors: "linear-gradient(to bottom, #c60b1e 25%, #ffc400 25%, #ffc400 75%, #c60b1e 75%)",
    description: "国王步道绝壁栈道、比利牛斯山国家公园与...",
    routesCount: 5
  },
  {
    id: "germany",
    name: "德国",
    nameEn: "Deutschland",
    flagColors: "linear-gradient(to bottom, #000000 33.3%, #dd0000 33.3%, #dd0000 66.6%, #ffce00 66.6%)",
    description: "国王湖冰洞秘境、楚格峰高山牧场与黑森林...",
    routesCount: 5
  }
];

export const ITALY_CITIES: ItalyCity[] = [
  {
    id: "brescia",
    name: "BRESCIA",
    nameEn: "Brescia",
    region: "LOMBARDIA - 意大利",
    routesCount: 8,
    description: "布雷西亚 · 加尔达湖、伊塞奥湖与阿尔卑斯山脉一日徒步枢纽",
    image: "/italy-cities/brescia.jpg",
    recommendedRoute: "卡斯托诺铁厂公园 (Parco delle Fucine di Casto)",
    recommendedRouteId: "it-brescia-fucine"
  },
  {
    id: "milano",
    name: "MILANO",
    nameEn: "Milano",
    region: "LOMBARDIA - 意大利",
    routesCount: 5,
    description: "米兰 · 高铁/自驾直达科莫湖全景、雷塞戈内锯齿峰与格里尼亚白云岩",
    image: "/italy-cities/milano.jpg",
    recommendedRoute: "锯齿山一日徒步计划 (Monte Resegone)",
    recommendedRouteId: "it-milano-resegone"
  },
  {
    id: "torino",
    name: "TORINO",
    nameEn: "Torino",
    region: "PIEMONTE - 意大利",
    routesCount: 5,
    description: "都灵 · 大天堂国家公园高空冰川湖群、圣弥额尔悬崖修道院与佩利切谷冰川盆地",
    image: "/italy-cities/torino.jpg",
    recommendedRoute: "尼沃莱棚口冰川湖一日徒步计划 (Colle del Nivolet)",
    recommendedRouteId: "it-torino-nivolet"
  },
  {
    id: "padova",
    name: "PADOVA",
    nameEn: "Padova",
    region: "VENETO - 意大利",
    routesCount: 5,
    description: "帕多瓦 · 欧甘内火山丘陵后花园、小多洛米蒂高原悬吊吊桥与索拉皮斯牛奶蓝冰川湖",
    image: "/italy-cities/padova.jpg",
    recommendedRoute: "小多洛米蒂吊桥环线一日徒步计划 (Anello delle Piccole Dolomiti)",
    recommendedRouteId: "it-padova-dolomiti"
  },
  {
    id: "firenze",
    name: "FIRENZE",
    nameEn: "Firenze",
    region: "TOSCANA - 意大利",
    routesCount: 5,
    description: "佛罗伦萨 · 托斯卡纳红土丘陵、百花大教堂远眺、蕾塞蒂修道院与阿普亚内阿尔卑斯国家森林",
    image: "/italy-cities/firenze.jpg",
    recommendedRoute: "菲耶索莱丘陵环线一日徒步计划 (Anello di Fiesole)",
    recommendedRouteId: "it-firenze-fiesole"
  },
  {
    id: "bologna",
    name: "BOLOGNA",
    nameEn: "Bologna",
    region: "EMILIA ROMAGNA - 意大利",
    routesCount: 5,
    description: "博洛尼亚 · 亚平宁山脉绿肺、欧洲最长拱廊与钙华溶洞瀑布",
    image: "/italy-cities/bologna.jpg",
    recommendedRoute: "拉班特钙华溶洞与瀑布 (Grotte di Labante)",
    recommendedRouteId: "it-bologna-labante"
  },
  {
    id: "roma",
    name: "ROMA",
    nameEn: "Roma",
    region: "LAZIO - 意大利",
    routesCount: 5,
    description: "罗马 · 古罗马阿皮亚大道、输水道皇家公园、内米火山湖口湖与蒂沃利别墅峡谷山脊",
    image: "/italy-cities/roma.jpg",
    recommendedRoute: "内米火山湖环线一日徒步计划 (Anello di Nemi)",
    recommendedRouteId: "it-roma-nemi"
  },
  {
    id: "napoli",
    name: "NAPOLI",
    nameEn: "Napoli",
    region: "CAMPANIA - 意大利",
    routesCount: 5,
    description: "那不勒斯 · 维苏威火山火山口、费托山双海湾全景、阿玛菲海岸众神之路与萨勒诺清凉溪谷",
    image: "/italy-cities/napoli.jpg",
    recommendedRoute: "维苏威火山大地裂缝一日徒步计划 (Gran Cono Vesuvio)",
    recommendedRouteId: "it-napoli-vesuvio"
  },
  {
    id: "palermo",
    name: "PALERMO",
    nameEn: "Palermo",
    region: "SICILIA - 意大利",
    routesCount: 5,
    description: "巴勒莫 · 龙之峡谷、拉格萨绿源水源、欧德若卡悬崖海岸与圣玛格丽特峰、加洛角灯塔与辛加罗绝美海湾",
    image: "/italy-cities/palermo.jpg",
    recommendedRoute: "龙之峡谷与科尔莱奥内瀑布一日徒步计划 (Gole del Drago)",
    recommendedRouteId: "it-palermo-drago"
  }
];

export const ROUTES: Route[] = [
  ...ITALY_ROUTES,
  ...SWITZERLAND_ROUTES,
  ...FRANCE_ROUTES,
  ...SPAIN_ROUTES,
  ...GERMANY_ROUTES
];

export const COMPANIONS: Companion[] = [
  {
    id: "xiaolong",
    name: "小泷",
    avatar: "🧑‍🦱",
    gender: "男",
    rating: 4.9,
    hikesCompleted: 0,
    languages: ["中文", "意大利语", "英语"],
    regions: ["布雷西亚（Brescia）", "伦巴第大区", "多洛米蒂"],
    countries: ["italy"],
    countryName: "意大利",
    regionName: "伦巴第大区",
    provinceName: "布雷西亚省（Brescia）",
    age: 26,
    profileImage: "/companions/xiaolong.jpg",
    difficulties: ["T2"],
    price: 80,
    bio: "生活在意大利的户外爱好者，带你畅游伦巴第自由山野，用 Vlog 记录每一次出发的感动。",
    tags: ["中级陪爬", "摄影记录", "户外 Vlog"],
    contactWeChat: "请联系小泷确认"
  }
];
