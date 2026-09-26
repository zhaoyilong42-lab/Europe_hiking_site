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
  "LOMBARDIA - 意大利": "LOMBARDIA · ITALIA", "PIEMONTE - 意大利": "PIEMONTE · ITALIA", "VENETO - 意大利": "VENETO · ITALIA", "TOSCANA - 意大利": "TOSCANA · ITALIA", "EMILIA ROMAGNA - 意大利": "EMILIA-ROMAGNA · ITALIA", "LAZIO - 意大利": "LAZIO · ITALIA", "CAMPANIA - 意大利": "CAMPANIA · ITALIA", "SICILIA - 意大利": "SICILIA · ITALIA",
  "布雷西亚 · 加尔达湖、伊塞奥湖与阿尔卑斯山脉一日徒步枢纽": "Brescia · punto di partenza per escursioni di un giorno tra Lago di Garda, Lago d'Iseo e Alpi.",
  "米兰 · 高铁/自驾直达科莫湖全景、雷塞戈内锯齿峰与格里尼亚白云岩": "Milano · accesso in treno o auto ai panorami del Lago di Como, al Monte Resegone e alle Grigne.",
  "都灵 · 大天堂国家公园高空冰川湖群、圣弥额尔悬崖修道院与佩利切谷冰川盆地": "Torino · laghi glaciali del Parco Nazionale del Gran Paradiso, Sacra di San Michele e conca glaciale della Val Pellice.",
  "帕多瓦 · 欧甘内火山丘陵后花园、小多洛米蒂高原悬吊吊桥与索拉皮斯牛奶蓝冰川湖": "Padova · Colli Euganei, ponti sospesi delle Piccole Dolomiti e lago turchese di Sorapis.",
  "佛罗伦萨 · 托斯卡纳红土丘陵、百花大教堂远眺、蕾塞蒂修道院与阿普亚内阿尔卑斯国家森林": "Firenze · colline toscane, vista sul Duomo, monasteri e foreste delle Alpi Apuane.",
  "博洛尼亚 · 亚平宁山脉绿肺、欧洲最长拱廊与钙华溶洞瀑布": "Bologna · Appennino verde, portici storici e cascate nelle grotte di travertino.",
  "罗马 · 古罗马阿皮亚大道、输水道皇家公园、内米火山湖口湖与蒂沃利别墅峡谷山脊": "Roma · Via Appia Antica, Parco degli Acquedotti, Lago di Nemi e gole di Tivoli.",
  "那不勒斯 · 维苏威火山火山口、费托山双海湾全景、阿玛菲海岸众神之路与萨勒诺清凉溪谷": "Napoli · cratere del Vesuvio, panorami sul Monte Faito, Sentiero degli Dei e vallate di Salerno.",
  "巴勒莫 · 龙之峡谷、拉格萨绿源水源、欧德若卡悬崖海岸与圣玛格丽特峰、加洛角灯塔与辛加罗绝美海湾": "Palermo · Gole del Drago, sorgenti della provincia di Ragusa, scogliere costiere e baie della Riserva dello Zingaro.",
  "Lago di Aviolo · 阿维奥洛湖": "Lago di Aviolo", "Lago di Sorapis · 索拉皮斯湖": "Lago di Sorapis", "多洛米蒂 · 刀锋山": "Dolomiti · Seceda", "多洛米蒂 · 魔戒之路": "Dolomiti · Sentiero del Signore degli Anelli", "多洛米蒂 · 三峰山": "Dolomiti · Tre Cime",
  "意大利 · 布雷西亚": "Italia · Brescia", "意大利 · 多洛米蒂": "Italia · Dolomiti",
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

Object.assign(italianCopy, {
  "欧洲华人专属 · 一日徒步与户外服务平台": "Piattaforma di escursioni e attività outdoor di un giorno in Europa",
  "我们是一家专为欧洲华人及户外爱好者打造的轻户外服务平台。针对大家“休息时间少（通常只有一天）、不了解周边路线、缺乏同行搭子”的痛点，提供省心、安全、有伴的徒步体验。": "Siamo una piattaforma di attività outdoor pensata per chi ama il trekking in Europa. Offriamo escursioni di un giorno semplici, sicure e in compagnia.",
  "● 我们为你提供：": "● Cosa offriamo:",
  "一键生成一日计划": "Piano di un giorno in un click", "只需输入所在城市与出发时间，即刻获取为你量身打理的一日行程，轻松解锁周边好风光。": "Inserisci città e orario di partenza per ricevere un itinerario di un giorno su misura.",
  "温暖陪爬与搭子服务": "Guide e compagni di trekking", "一个人徒步太孤单？开启陪爬模式，与靠谱队友一起结伴同行。": "Non vuoi camminare da solo? Trova una guida o un compagno affidabile.",
  "华人友好路线分级": "Livelli di percorso chiari", "从“休闲散步”到“进阶挑战”，清晰标注路线难度与装备建议，新手也能安心出发。": "Da passeggiate rilassate a sfide avanzate: difficoltà e attrezzatura sono indicate con chiarezza.",
  "同城社群交流": "Community locale", "加入我们的徒步社群，随时分享路况、结识身边的户外爱好者。": "Entra nella community per condividere condizioni dei sentieri e conoscere altri appassionati.",
  "(如有多日深度行程需求，亦可联系小徒探讨。)": "(Per itinerari di più giorni, contattaci per parlarne.)",
  "♡ 温暖同行 · 欧洲华人专属陪爬": "♡ In cammino insieme · guide e compagni in Europa", "你的专属徒步陪爬": "La tua guida di trekking", "一个人徒步太孤单？专业认证领队与温暖同行搭子，全程带路、节奏适配、摄影记录，不催不赶、不落单，安心享受欧洲绝美山野。": "Una guida qualificata o un compagno di cammino ti accompagna con il ritmo giusto, orientamento e foto ricordo.",
  "筛选你的专属陪爬向导": "Filtra la tua guida", "休闲娱乐": "Tempo libero", "中级陪爬": "Guida livello intermedio", "高级徒步": "Trekking avanzato", "国家 Country:": "Paese:", "年龄 Age:": "Età:", "难度 Level:": "Livello:",
  "搭子昵称": "Nome", "年龄 / 性别": "Età / genere", "国家": "Paese", "大区": "Regione", "省份": "Provincia", "户外年限": "Esperienza outdoor", "语言": "Lingue", "2 年+ 欧洲徒步经验": "Oltre 2 anni di esperienza di trekking in Europa",
  "性格与带队风格：": "Stile e personalità:", "💡 关于我 & 陪爬亮点：": "💡 Punti di forza:", "🏔️ 精选私藏路线（熟悉度 100%）：": "🏔️ Itinerari preferiti:",
  "户外搭子 · 温暖陪爬": "Compagni outdoor · guide amichevoli", "寻找属于您的陪爬伙伴": "Trova il tuo compagno di trekking", "平台合作领队均持有 CAI、UIMLA 等专业资格或极丰富的阿尔卑斯带队安全经验": "Le guide partner possiedono qualifiche CAI, UIMLA o una vasta esperienza di sicurezza sulle Alpi.",
  "没有找到符合该筛选条件的领队伙伴，可以尝试重置筛选或联系客服微信获取更多推荐。": "Nessuna guida corrisponde ai filtri. Reimposta i filtri o contattaci per altri suggerimenti.",
  "微信号码 (WeChat ID)": "ID WeChat", "本服务不收取任何中介费用，安全免责声明由出行领队与客户双方友好协商达成为准。": "Il servizio non applica commissioni di intermediazione; sicurezza e responsabilità vengono concordate tra guida e partecipante.",
  "让你的每一个休息天，都能轻松出发，不负山野！": "Trasforma ogni giorno libero in una partenza verso la natura.", "点击此处，立即定制你的一日专属欧洲徒步计划": "Clicca qui per creare subito il tuo piano di trekking europeo di un giorno.", "制定一日计划": "Crea un piano di un giorno",
  "生活在意大利的户外爱好者，带你畅游伦巴第自由山野，用 Vlog 记录每一次出发的感动。": "Appassionato di outdoor che vive in Italia: esplora la Lombardia e conserva ogni avventura in un vlog.", "摄影记录": "Foto e video", "户外 Vlog": "Vlog outdoor", "布雷西亚（Brescia）": "Brescia", "伦巴第大区": "Lombardia", "多洛米蒂": "Dolomiti", "布雷西亚省（Brescia）": "Provincia di Brescia", "意大利语 / 中文 / 英语": "Italiano / Cinese / Inglese",
});
Object.assign(italianCopy, {
  "• 情绪价值拉满：开朗随和，让徒步旅程不冷场。": "• Energia positiva: allegro e alla mano, per rendere piacevole ogni escursione.",
  "• 嘎嘎出片：兼顾人物与风光构图，记录高质量徒步照片。": "• Foto curate: unisce ritratti e paesaggi per immagini di trekking di qualità.",
  "• Vlog 记录加分：可按需记录动态镜头；介意入镜可提前说明。": "• Riprese vlog su richiesta; se preferisci non comparire, basta comunicarlo prima.",
  "具体档期与结伴方式请在申请后与小泷确认。": "Dopo la richiesta, conferma con Xiaolong le date disponibili e le modalità per partecipare.",
  "Lago di Aviolo（高山湖泊，绝美清澈）": "Lago di Aviolo (lago alpino dalle acque cristalline)",
  "Dolomiti 三峰山 Tre Cime（多洛米蒂经典地标）": "Tre Cime di Lavaredo (icona classica delle Dolomiti)",
  "Dolomiti Seceda 刀锋山（震撼山脊，风光大片）": "Seceda nelle Dolomiti (cresta spettacolare e panorami grandiosi)",
  "岁 ·": "anni ·", "岁": "anni", "男": "Uomo", "女": "Donna",
});
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