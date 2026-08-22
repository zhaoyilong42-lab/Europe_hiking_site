// Display-only labels. The database continues to use the Chinese values as
// stable keys, while the form exposes familiar local Italian names.
export const ITALIAN_LOCATION_NAMES: Record<string, string> = {
  "阿布鲁佐": "Abruzzo", "艾米利亚-罗马涅": "Emilia-Romagna", "巴西利卡塔": "Basilicata",
  "弗留利-威尼斯朱利亚": "Friuli-Venezia Giulia", "卡拉布里亚": "Calabria", "坎帕尼亚": "Campania",
  "拉齐奥": "Lazio", "利古里亚": "Liguria", "伦巴第": "Lombardia", "马尔凯": "Marche",
  "莫利塞": "Molise", "皮埃蒙特": "Piemonte", "普利亚": "Puglia", "撒丁": "Sardegna",
  "特伦蒂诺-上阿迪杰": "Trentino-Alto Adige", "托斯卡纳": "Toscana", "翁布里亚": "Umbria",
  "瓦莱达奥斯塔": "Valle d'Aosta", "威尼托": "Veneto", "西西里": "Sicilia",
  "基耶蒂": "Chieti", "拉奎拉": "L'Aquila", "佩斯卡拉": "Pescara", "泰拉莫": "Teramo",
  "马泰拉": "Matera", "波坦察": "Potenza", "卡坦扎罗": "Catanzaro", "科森扎": "Cosenza",
  "克罗托内": "Crotone", "雷焦卡拉布里亚": "Reggio Calabria", "维博瓦伦蒂亚": "Vibo Valentia",
  "阿韦利诺": "Avellino", "贝内文托": "Benevento", "卡塞塔": "Caserta", "那不勒斯": "Napoli", "萨莱诺": "Salerno",
  "博洛尼亚": "Bologna", "费拉拉": "Ferrara", "弗利-切塞纳": "Forlì-Cesena", "摩德纳": "Modena",
  "帕尔马": "Parma", "皮亚琴察": "Piacenza", "拉文纳": "Ravenna", "雷焦艾米利亚": "Reggio Emilia", "里米尼": "Rimini",
  "戈里齐亚": "Gorizia", "波代诺内": "Pordenone", "的里雅斯特": "Trieste", "乌迪内": "Udine",
  "弗罗西诺内": "Frosinone", "拉蒂纳": "Latina", "列蒂": "Rieti", "罗马": "Roma", "维泰博": "Viterbo",
  "热那亚": "Genova", "因佩里亚": "Imperia", "拉斯佩齐亚": "La Spezia", "萨沃纳": "Savona",
  "贝加莫": "Bergamo", "布雷西亚": "Brescia", "科莫": "Como", "克雷莫纳": "Cremona", "莱科": "Lecco",
  "洛迪": "Lodi", "曼托瓦": "Mantova", "蒙扎和布里安扎": "Monza e Brianza", "米兰": "Milano", "帕维亚": "Pavia", "松德里奥": "Sondrio", "瓦雷泽": "Varese",
  "安科纳": "Ancona", "阿斯科利皮切诺": "Ascoli Piceno", "费尔莫": "Fermo", "马切拉塔": "Macerata", "佩萨罗和乌尔比诺": "Pesaro e Urbino",
  "坎波巴索": "Campobasso", "伊塞尔尼亚": "Isernia", "亚历山德里亚": "Alessandria", "阿斯蒂": "Asti", "别拉": "Biella",
  "库内奥": "Cuneo", "诺瓦拉": "Novara", "都灵": "Torino", "韦尔巴诺-库西奥-奥索拉": "Verbano-Cusio-Ossola", "韦尔切利": "Vercelli",
  "巴里": "Bari", "巴列塔-安德里亚-特拉尼": "Barletta-Andria-Trani", "布林迪西": "Brindisi", "福贾": "Foggia", "莱切": "Lecce", "塔兰托": "Taranto",
  "卡利亚里": "Cagliari", "努奥罗": "Nuoro", "奥里斯塔诺": "Oristano", "萨萨里": "Sassari", "南撒丁": "Sud Sardegna",
  "阿格里真托": "Agrigento", "卡尔塔尼塞塔": "Caltanissetta", "卡塔尼亚": "Catania", "恩纳": "Enna", "墨西拿": "Messina", "巴勒莫": "Palermo", "拉古萨": "Ragusa", "锡拉库萨": "Siracusa", "特拉帕尼": "Trapani",
  "阿雷佐": "Arezzo", "佛罗伦萨": "Firenze", "格罗塞托": "Grosseto", "里窝那": "Livorno", "卢卡": "Lucca", "马萨-卡拉拉": "Massa-Carrara", "比萨": "Pisa", "皮斯托亚": "Pistoia", "普拉托": "Prato", "锡耶纳": "Siena",
  "博尔扎诺": "Bolzano", "特伦托": "Trento", "佩鲁贾": "Perugia", "特尔尼": "Terni", "奥斯塔": "Aosta",
  "贝卢诺": "Belluno", "帕多瓦": "Padova", "罗维戈": "Rovigo", "特雷维索": "Treviso", "威尼斯": "Venezia", "维罗纳": "Verona", "维琴察": "Vicenza",
};

export function displayLocationName(countryId: string, value: string) {
  const localName = countryId === "italy" ? ITALIAN_LOCATION_NAMES[value] : undefined;
  return localName ? `${value} · ${localName}` : value;
}
