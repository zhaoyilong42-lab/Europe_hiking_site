import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "zh" | "it";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "europe-hiking-locale";

// This dictionary covers fixed interface copy only. Route titles, descriptions
// and road books remain in their original language until reviewed translations
// are added to the route dataset.
const italianCopy: Record<string, string> = {
  "首页": "Home", "关于我们": "Chi siamo", "欧洲": "Europa", "意大利": "Italia", "瑞士": "Svizzera", "法国": "Francia", "西班牙": "Spagna", "德国": "Germania",
  "定制一日徒步": "Crea la tua escursione", "关闭导航菜单": "Chiudi il menu di navigazione", "打开导航菜单": "Apri il menu di navigazione",
  "一日欧洲徒步之旅": "Escursioni di un giorno in Europa", "适合新手小白和徒步爱好者的网站": "Un sito per principianti e appassionati di trekking", "正在加载欧洲精选路线": "Caricamento degli itinerari selezionati in Europa",
  "一日 1-DAY": "UN GIORNO", "欧洲 EUROPE": "EUROPA", "徒步 TREKKING": "TREKKING", "高山 ALPINE": "ALPINO", "湖泊 LAKES": "LAGHI", "打造一日徒步": "Crea un'escursione",
  "欧洲 5 国经典一日徒步路线": "Itinerari classici di un giorno in 5 paesi europei", "按国家选择徒步路线": "Scegli gli itinerari per paese", "5 条精选路线": "5 itinerari selezionati", "点击任一路线，查看完整路书": "Apri un itinerario per vedere la guida completa", "正在载入 25 条路线…": "Caricamento di 25 itinerari…", "距离": "Distanza", "时长": "Durata", "爬升": "Dislivello", "完整一日路书": "Guida completa di un giorno", "查看路线": "Vedi itinerario",
  "返回意大利城市": "Torna alle città italiane", "市区出发 · 当日往返": "Partenza dalla città · andata e ritorno in giornata", "单日步行距离": "Distanza a piedi", "徒步耗时": "Durata del trekking", "累计爬升": "Dislivello positivo", "查看计划": "Vedi piano", "该城市的路线正在导入，请稍后刷新页面。": "Gli itinerari di questa città sono in caricamento. Ricarica la pagina tra poco.", "意大利 9 大出发城市": "9 città italiane di partenza", "从城市市中心出发，体验完整的徒步一日游。": "Parti dal centro città e vivi un'escursione completa di un giorno.",
  "服务导航": "Navigazione", "我们提供的徒步路线": "I nostri itinerari", "合作团队与品牌 (CAI & UIMLA 支持)": "Partner e marchi (supporto CAI e UIMLA)", "参与者真实评价": "Recensioni dei partecipanti", "联系我们": "Contattaci", "微信:": "WeChat:", "抖音:": "Douyin:", "电子邮箱:": "E-mail:", "小红书:": "Xiaohongshu:", "© 2026 欧洲徒步 (Europe Trekking) · 专注欧洲华人一日户外与山野探索": "© 2026 Europe Trekking · Escursioni e natura in Europa",
  "智能徒步路线定制系统": "Sistema intelligente per itinerari di trekking", "告诉我们您的出行目的地、期望的大区难度。系统将立刻为您精确匹配为您现场定制一套顶级一日高山路书。": "Indica destinazione e livello desiderato: troveremo l'itinerario di un giorno più adatto a te.", "✨ 带你逃离城市 · 专属徒步定制": "✨ Esci dalla città · trekking su misura", "开启你的欧洲山野之旅，从这里开始": "Inizia qui la tua avventura nella natura europea", "结合你的出发地与徒步偏好，为你量身打造私藏路线。从路书到拍照机位，一站式为你安排妥当": "In base alla tua partenza e alle tue preferenze, troviamo un itinerario su misura, dalla guida ai punti fotografici.", "国家 STATO": "PAESE", "大区 REGIONE": "REGIONE", "省份 PROVINCIA": "PROVINCIA", "难度 DIFFICULTY": "DIFFICOLTÀ", "正在匹配路线...": "Ricerca dell'itinerario…", "生成你的徒步计划": "Genera il tuo piano di trekking", "正在匹配已审核路线": "Ricerca di itinerari verificati",
  "正在检索欧洲高山数据库...": "Ricerca nel database alpino europeo…", "正在查询已审核的路线资料...": "Verifica degli itinerari disponibili…", "正在核对出发地与难度条件...": "Controllo di partenza e difficoltà…", "正在整理完整路线信息...": "Preparazione dei dettagli dell'itinerario…", "即将展示匹配结果...": "Risultati in arrivo…", "路线详情暂时无法读取，请稍后重试。": "Impossibile caricare i dettagli dell'itinerario. Riprova più tardi.", "暂未找到完全符合条件的已审核路线，请调整大区、省份或难度后重试。": "Nessun itinerario verificato corrisponde ai criteri. Modifica regione, provincia o difficoltà e riprova.", "上一条徒步路线": "Itinerario precedente", "下一条徒步路线": "Itinerario successivo", "📷 路线资料 ·": "📷 Informazioni itinerario ·", "徒步距离": "Distanza del trekking", "预计耗时": "Tempo stimato",
  "返回路线列表": "Torna all'elenco degli itinerari", "关闭": "Chiudi", "基本信息": "Informazioni principali", "路线距离": "Distanza itinerario", "难度级别": "Livello di difficoltà", "打卡拍照推荐": "Punti fotografici consigliati", "安全要点与注意事项": "Sicurezza e avvertenze", "小陇建议的爬山装备清单": "Attrezzatura consigliata", "地标打卡": "Luogo iconico",
  "了解陪爬": "Scopri le guide", "了解更多": "Scopri di più", "申请结伴": "Richiedi di unirti", "重置全部筛选": "Reimposta filtri", "全部等级": "Tutti i livelli", "全部国家": "Tutti i paesi", "全部年龄": "Tutte le età", "全部区域 (Region: All)": "Tutte le regioni", "全部语言 (Language: All)": "Tutte le lingue", "不限难度 (Difficulty: All)": "Qualsiasi difficoltà", "语言能力": "Lingue parlate", "领航最大难度": "Difficoltà massima", "意向大区/区域": "Regione preferita", "获取联系方式": "Ottieni i contatti", "复制微信号": "Copia WeChat", "我知道了，返回": "Ho capito, torna indietro", "关闭档案": "Chiudi profilo", "查看上一张照片": "Foto precedente", "查看下一张照片": "Foto successiva",
};

const chineseCopy = Object.fromEntries(Object.entries(italianCopy).map(([zh, it]) => [it, zh]));

function localizeFixedCopy(value: string, locale: Locale) {
  const copy = locale === "it" ? italianCopy : chineseCopy;
  const trimmed = value.trim();
  const replacement = copy[trimmed];
  return replacement ? value.replace(trimmed, replacement) : value;
}

function localizeNodeTree(root: Node, locale: Locale) {
  if (root instanceof Text) {
    const localized = localizeFixedCopy(root.nodeValue ?? "", locale);
    if (localized !== root.nodeValue) root.nodeValue = localized;
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("[data-locale-skip], script, style")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach((node) => {
    const localized = localizeFixedCopy(node.nodeValue ?? "", locale);
    if (localized !== node.nodeValue) node.nodeValue = localized;
  });

  if (!(root instanceof Element)) return;
  root.querySelectorAll<HTMLElement>("[aria-label], [title], [placeholder]").forEach((element) => {
    ["aria-label", "title", "placeholder"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) return;
      const localized = localizeFixedCopy(value, locale);
      if (localized !== value) element.setAttribute(attribute, localized);
    });
  });
}

function InterfaceCopyTranslator({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale === "it" ? "it" : "zh-CN";
    const root = document.querySelector("[data-locale-root]");
    if (!root) return;
    localizeNodeTree(root, locale);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === "characterData") localizeNodeTree(record.target, locale);
        record.addedNodes.forEach((node) => localizeNodeTree(node, locale));
      });
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => window.localStorage.getItem(STORAGE_KEY) === "it" ? "it" : "zh");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}<InterfaceCopyTranslator locale={locale} /></LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LanguageProvider");
  return context;
}