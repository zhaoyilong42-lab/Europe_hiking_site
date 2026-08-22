import { Route } from "../hikingDb";

export const ITALY_ROUTES: Route[] = [
  // --- GENERAL ITALY ROUTES (5 ROUTES) ---
  {
    id: "it-tres-cime",
    countryId: "italy",
    title: "多洛米蒂三峰山 (Tre Cime) 经典环线",
    departure: "威尼斯 (Venezia) 出发 / 科尔蒂纳 (Cortina)",
    difficulty: "T2 初级体验",
    difficultyCode: "T2",
    duration: "5.5小时",
    distance: "10.5公里",
    elevationGain: "+420米",
    description: "多洛米蒂山脉最具标志性的奇峰，环绕标志性的三座石峰，穿越高山草甸、荒漠碎石路与历史战壕遗迹。",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    photoSpot: "Locatelli避难所前方高地，可完美将三座巨峰与高山海子同时框入镜头。",
    packingList: ["中帮登山鞋", "15-20L轻量背包", "伸缩登山杖", "防风防水外套", "水壶（1.5L）", "高热量路餐"],
    roadBook: `# 意大利多洛米蒂三峰山 (Tre Cime) 一日徒步书

## 🚶‍♂️ 徒步概要
- **起终点**: Auronzo避难所 (Rifugio Auronzo, 2320m)
- **距离/用时**: 10.5公里环线 / 约4.5 - 5.5小时
- **最高海拔**: 2450m (Paterno垭口)
- **爬升/下降**: 420米

## 🗺️ 路线轨迹
1. **起点 Auronzo 避难所**: 自驾或乘坐大巴抵达。向东沿101号平缓步道出发，沿途可眺望右侧深谷。
2. **Lavaredo 避难所 (Rifugio Lavaredo)**: 步行约30分钟抵达。在此可稍作休整，随后沿陡峭碎石坡爬升至 Lavaredo 垭口。
3. **Lavaredo 垭口 (Forcella Lavaredo)**: 豁然开朗！三峰山的庞大侧影扑面而来。继续沿101号石板路平缓切向 Locatelli 避难所。
4. **Locatelli 避难所 (Rifugio Locatelli)**: 最佳观景点。可在此享用热咖啡与德式香肠。避难所后侧有第一次世界大战时凿通的战壕岩洞。
5. **返程**: 沿105号步道下切至幽深的山谷草甸，然后穿过一段陡峭盘山碎石路爬升回 Auronzo 避难所。

## 📸 黄金机位推荐
- **机位 A**: Auronzo避难所旁的白色小教堂 (Cappella degli Alpini)，晨光洒在教堂尖顶与远处云海。
- **机位 B**: Locatelli避难所上方的两个岩洞中，利用洞口作为前景天然画框，将三峰山框定在画幅中央。`
  },
  {
    id: "it-braies",
    countryId: "italy",
    title: "布莱伊斯湖 (Lago di Braies) 与克罗达峰环线",
    departure: "威尼斯 (Venezia) 出发 / 普斯泰里亚谷",
    difficulty: "T2 初级体验",
    difficultyCode: "T2",
    duration: "4.5小时",
    distance: "9.2公里",
    elevationGain: "+380米",
    description: "多洛米蒂珍珠般的祖母绿高山湖泊，前半段湖畔漫步，后半段爬升至高山平原俯瞰幽蓝湖面全景。",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    photoSpot: "湖泊南侧的木质栈桥与湖面倒影；在爬升至300米高台处的林间空地俯瞰全景。",
    packingList: ["越野跑鞋或轻型登山鞋", "防晒帽", "太阳镜", "偏光滤镜镜头", "防水冲锋衣"],
    roadBook: `# 意大利布莱伊斯湖与高地全景徒步

## 🚶‍♂️ 徒步概要
- **起终点**: Lago di Braies (1496m)
- **距离/用时**: 9.2公里 / 约4小时
- **最高海拔**: 1850m
- **爬升**: 380米

## 🗺️ 路线轨迹
1. **湖畔漫步**: 顺时针出发，穿过松树林和白沙滩，清晨的湖面如镜。
2. **爬升段 (步道 19号)**: 离开湖泊南端，开始在碎石林带中爬升，路面铺设整齐但坡度较陡。
3. **高山草甸 (Malga Foresta)**: 豁然开朗的高山牧场，牛羊悠闲，背后是千仞绝壁。
4. **返程**: 沿西侧林道缓缓下行，回到小木屋船坞，结束完美的徒步。`
  },
  {
    id: "it-sorapis",
    countryId: "italy",
    title: "索拉皮斯湖 (Lago di Sorapis) 牛奶蓝秘境",
    departure: "威尼斯 (Venezia) 出发 / 科尔蒂纳",
    difficulty: "T3 进阶挑战",
    difficultyCode: "T3",
    duration: "5.5小时",
    distance: "11.6公里",
    elevationGain: "+460米",
    description: "不可思议的、由于冰川悬浮粉末形成的纯牛奶蓝色海子。步道含有陡峭悬崖切面与钢索攀爬点，极具挑战趣味。",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    photoSpot: "绕湖一圈至湖对岸，将那根如手指般直插云霄的 Dito di Dio (上帝之指) 峰和牛奶蓝湖水拍在一起。",
    packingList: ["防滑中帮登山鞋", "防滑手套（用于抓握铁锁）", "硬壳冲锋衣", "头灯", "保暖层衣物"],
    roadBook: `# 索拉皮斯牛奶蓝冰川湖徒步路书

## 🚶‍♂️ 徒步概要
- **起点**: Passo Tre Croci (1809m)
- **距离/用时**: 11.6公里折返 / 5-6小时
- **最高点**: Lago di Sorapis (1923m)
- **难度**: T3 进阶挑战 (中段有临空悬崖，配有防护钢索)

## 🗺️ 路线轨迹
- **第1阶段**: 沿215号平缓森林路行进约3公里。
- **第2阶段**: 坡度骤增，进入岩石断崖带。多处阶梯和狭窄临崖小道，需手扶钢索通过（恐高者慎入）。
- **第3阶段**: 翻过最后一道岩壁，牛奶般的蓝色突然跳入眼帘，让人惊叹！
- **返程**: 原路折返。建议清晨8点前出发，避开大流量人群。`
  },
  {
    id: "it-seceda",
    countryId: "italy",
    title: "多洛米蒂塞瑟达 (Seceda) 刀锋山绝壁环线",
    departure: "博尔扎诺 (Bolzano) / 奥尔蒂塞伊 (Ortisei)",
    difficulty: "T2 初级体验",
    difficultyCode: "T2",
    duration: "3.5小时",
    distance: "8.5公里",
    elevationGain: "+350米",
    description: "多洛米蒂最震撼、最出片的“恶魔刀锋”断崖。沿着绿丝绒般的高山草甸，直面那一面被大自然一刀切下、垂直落差近千米的巨大石灰岩陡崖壁。",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    photoSpot: "缆车顶站左侧山脊小径最高点，用广角镜头拍摄草坡斜切与垂直刀锋绝壁的震撼交汇。",
    packingList: ["轻便登山鞋", "冲锋衣/防风外套", "登山杖一支", "防晒帽", "路餐三明治"],
    roadBook: `# 多洛米蒂塞瑟达 (Seceda) 刀锋山徒步路书

## 🚶‍♂️ 徒步概要
- 起终点：Ortisei-Seceda 缆车顶站 (2500m) 环线
- 距离：8.5公里 / 爬升 350米 / 耗时 3-3.5小时
- 最佳季节：6月中旬至10月中旬

## 🧭 路线细节
1. **起步顶站**: 走出 Ortisei 乘缆车直达 2500 米 Seceda 顶站。出站后首先往左手方向的最高观景台走2分钟，一览360度多洛米蒂雪山。
2. **山脊线漫步**: 顺着缓坡往下走，向着 Seceda 著名的锯齿刀锋绝壁进发。这段路一侧是极其平缓的绿色大草坡，另一侧则是深达千米的绝对悬崖。
3. **Baita Troier 避难所**: 往下切入草甸，会经过几座古朴的黑木头高山酒馆，推荐在此点一盘南蒂罗尔特色熏肉拼盘（Speck）。
4. **牧场草坡回切**: 穿过悠闲啃草的阿尔卑斯奶牛群，顺着 1号和 6号步道，沿着巨大的石灰岩山体下方慢慢回切。
5. **轻松返回**: 回到缆车顶站，乘缆车返回奥尔蒂塞伊。`
  },
  {
    id: "it-cinque-terre",
    countryId: "italy",
    title: "五渔村蓝色小径 (Sentiero Azzurro) 悬崖海岸徒步",
    departure: "拉斯佩齐亚 (La Spezia) / Vernazza",
    difficulty: "T1 休闲散步",
    difficultyCode: "T1",
    duration: "3.0小时",
    distance: "7.2公里",
    elevationGain: "+210米",
    description: "地中海沿岸最浪漫温和的海岸小径。穿越层层梯田、柠檬树林与仙人掌丛，俯瞰五彩斑斓的悬崖渔村，聆听海浪拍击礁石的声音。",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    photoSpot: "从 Vernazza 往 Monterosso 方向步行15分钟处的悬崖阶梯，俯瞰 Vernazza 呈半岛状伸入蔚蓝海湾的经典画面。",
    packingList: ["轻便防滑鞋", "遮阳帽", "太阳镜", "充足饮用水", "备用零钱"],
    roadBook: `# 五渔村蓝色小径（Vernazza - Monterosso 段）徒步书

## 🚶‍♂️ 徒步概要
- 起终点：Vernazza 渔村至 Monterosso 滨海镇
- 距离：7.2公里 / 爬升 210米 / 耗时 2.5 - 3小时
- 门票：需在村口购买 Cinque Terre Card 徒步通行证（约7.5欧）

## 🧭 路线细节
1. **Vernazza 港口出发**: 穿过 Vernazza 的粉色与黄色老巷子，顺着写着 “Monterosso” 的指示牌拾级而上。
2. **梯田与柠檬林**: 小路很快切入陡峭的地中海石阶，两旁满是辛勤果农用轻便轨道车运输的柠檬果林和葡萄藤梯田。
3. **悬崖绝壁观海**: 在海拔150米的悬崖上穿行，空气中弥漫着迷迭香和海水的咸味，脚下是波涛汹涌的地中海蓝色缎面。
4. **下切Monterrosso海滩**: 远远能听到喧嚣。小径开始急剧下降，经过一处建在半山腰的历史古堡，最后直接下到五渔村唯一的超大沙滩 Monterosso 海滩。
5. **返程**: 在海边享用一杯柠檬冰沙（Granita），然后乘坐五渔村穿梭小火车轻松返回。`
  },

  // --- ITALIAN CITY RECOMMENDED ROUTES (9 CITIES) ---
  {
    id: "it-brescia-fucine",
    countryId: "italy",
    cityId: "brescia",
    title: "卡斯托诺铁厂公园 (Parco delle Fucine di Casto) 铁索攀爬与溪谷水上环线",
    departure: "布雷西亚 (Brescia) 驾车45分钟",
    difficulty: "T3 进阶挑战",
    difficultyCode: "T3",
    duration: "4.5小时",
    distance: "7.5公里",
    elevationGain: "+320米",
    description: "融合古老工业铁厂遗址与喀斯特溪谷地貌。设有14条不同难度的 Via Ferrata (铁索攀登) 路线，两座悬空百米吊桥及峡谷滑索。",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
    photoSpot: "穿过第3号悬空索桥，两旁绝壁与下方咆哮溪流形成的几何切角。",
    packingList: ["Ferrata攀登安全带与挽锁(双锁扣)", "攀岩头盔", "防滑耐磨半指手套", "硬底登山鞋"],
    roadBook: `# 布雷西亚卡斯托铁厂公园铁索徒步路书

## ⛰️ 景点特色
由废弃铁匠作坊改建的野外探索公园。
- 沿绝壁铺设的钢索、铁梯及横渡滑索。
- 难度涵盖 A (初学者) 至 E (极难)。

## 🗺️ 推荐体验轨迹
1. 从入口管理处租赁 Ferrata 装备 (约10-15欧)。
2. 先在练习区熟悉双锁扣的交替挂扣操作。
3. 沿古老河道行进，挑战 **"Stretta di Luina"** 峡谷狭缝涉水桥，两边绝壁近在咫尺。
4. 挑战 **桥梁环线**: 通过两座高达80米的悬空西藏桥。`
  },
  {
    id: "it-milano-resegone",
    countryId: "italy",
    cityId: "milano",
    title: "锯齿山一日徒步计划 (Monte Resegone) · 米兰后花园之巅",
    departure: "米兰 (Milano) 火车至 Lecco，随后乘大巴与缆车",
    difficulty: "T3 进阶挑战",
    difficultyCode: "T3",
    duration: "5.0小时",
    distance: "8.2公里",
    elevationGain: "+680米",
    description: "Lecco湖畔地标性的“梳子”状石灰岩锯齿群峰。山顶视野辽阔，可同时俯瞰科莫湖、米兰城天际线与波河平原。",
    image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80",
    photoSpot: "Azzoni避难所上方的金属十字架，黄昏时背景为科莫湖人字湾和米兰平原落日。",
    packingList: ["中帮登山鞋", "保暖外套", "登山杖", "1.5L电解质水"],
    roadBook: `# 米兰雷塞戈内锯齿山 (Resegone) 登顶书

## 🗺️ 路线概要
- 起点: Piani d'Erna 缆车顶站 (1375m)
- 终点: Monte Resegone 峰顶 (1875m)
- 累计爬升: 680米 / 用时 4.5小时

## 🚶‍♂️ 徒步轨迹
- 走出缆车站，向南沿1号历史步道（Sentiero 1）平缓切过草地。
- 进入山林，碎石路面坡度急剧攀升，部分路段需要手脚并用通过石灰岩阶梯。
- 登顶 Azzoni 避难所（Rifugio Azzoni），这里可以买到绝佳的伦巴第烩玉米面（Polenta）。
- 爬上避难所后侧的十字架最高点，晴天能望见米兰新门摩天大楼。`
  },
  {
    id: "it-torino-nivolet",
    countryId: "italy",
    cityId: "torino",
    title: "尼沃莱棚口冰川湖一日徒步计划 (Colle del Nivolet) · 大天堂高空旷野",
    departure: "都灵 (Torino) 自驾/拼车至 Ceresole Reale",
    difficulty: "T2 初级体验",
    difficultyCode: "T2",
    duration: "4.0小时",
    distance: "9.0公里",
    elevationGain: "+310米",
    description: "大天堂国家公园最纯净的高原旷野。两条巨大的浅蓝色高原水库相套，在海拔2500米的苔原上呈现如冰岛般的壮美冷冽。",
    image: "https://images.unsplash.com/photo-1544084944-15269ec7b5a0?auto=format&fit=crop&w=800&q=80",
    photoSpot: "从Nivolet垭口南侧高台，双水库S型弯道交融在山间雪峰中的俯瞰画面。",
    packingList: ["冲锋衣/裤", "轻量羽绒层", "垃圾袋（高空无垃圾桶）", "防晒霜"],
    roadBook: `# 都灵大天堂 Nivolet 冰川高湖徒步书

## ⛰️ 路线详情
- 起终点: Serrù湖堤坝停车场 (2270m)
- 最高点: Colle del Nivolet (2612m)
- 爬升: 340m / 距离 9公里 / 用时3.5-4小时

## 🧭 行程要点
- 沿平缓的高山湿地小道前行，由于海拔高（2500m+），即使盛夏也可能有积雪残存。
- 沿途有极大机率遇见阿尔卑斯野山羊（Ibex）和吹口哨的旱獭（Marmots）。
- 翻上垭口，在 Nivolet 避难所吃一盘山地热意面，极度解乏。`
  },
  {
    id: "it-padova-dolomiti",
    countryId: "italy",
    cityId: "padova",
    title: "小多洛米蒂吊桥环线一日徒步计划 (Anello delle Piccole Dolomiti)",
    departure: "帕多瓦 (Padova) 出发至 Recoaro Terme",
    difficulty: "T2 初级体验",
    difficultyCode: "T2",
    duration: "3.5小时",
    distance: "7.8公里",
    elevationGain: "+290米",
    description: "维琴察与帕多瓦后方的石灰岩奇峰。建有一座全长105米、悬空于绝壁狭谷之上的无桥墩钢索吊桥 (Avisio吊桥)，桥面采用格栅透空设计。",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    photoSpot: "站在吊桥正中央，顺着钢索透视线条拍摄背后如同牙齿般的碎石奇峰群。",
    packingList: ["防风衣", "防滑鞋", "保暖衣物"],
    roadBook: `# 小多洛米蒂吊桥环线指南

- **路线介绍**: 穿越一战时期的意奥战争坑道，跨越震撼的“无墩悬索吊桥”，全长105米。
- **适宜人群**: T2初级难度，适合全家及摄影发烧友。
- **沿途补给**: Campogrosso 避难所提供传统热餐和甜点。`
  },
  {
    id: "it-firenze-fiesole",
    countryId: "italy",
    cityId: "firenze",
    title: "菲耶索莱丘陵环线一日徒步计划 (Anello di Fiesole) · 俯瞰翡冷翠",
    departure: "佛罗伦萨 (Firenze) 市中心乘7路公交车直达",
    difficulty: "T1 休闲散步",
    difficultyCode: "T1",
    duration: "3.0小时",
    distance: "8.5公里",
    elevationGain: "+210米",
    description: "美第奇家族最爱的清凉避暑丘陵。穿行在古罗马剧场遗址、古老石场、柏树林林道以及达芬奇尝试人类飞行器起飞的 Mount Ceceri 山顶。",
    image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=800&q=80",
    photoSpot: "圣弗朗西斯科修道院外墙观景台，将百花大教堂圆顶、乔托钟楼和佛罗伦萨城完美同框。",
    packingList: ["轻便运动鞋", "防蚊喷雾", "遮阳伞/帽", "水壶"],
    roadBook: `# 佛罗伦萨菲耶索莱山丘徒步路书

- **亮点**: 达芬奇飞行器试验山顶 + 俯瞰翡冷翠全景 + 古罗马遗迹
- **起点**: Fiesole Piazza Mino 主广场。
- **轨迹**: 爬升至 Monte Ceceri 柏树自然公园，寻找达芬奇飞行实验的纪念碑。午后在圣弗朗西斯科修道院露台静候托斯卡纳夕阳。`
  },
  {
    id: "it-bologna-labante",
    countryId: "italy",
    cityId: "bologna",
    title: "拉班特钙华溶洞与瀑布 (Grotte di Labante) · 亚平宁天然森林浴",
    departure: "博洛尼亚 (Bologna) 火车至 Vergato，随后乘接驳车",
    difficulty: "T1 休闲散步",
    difficultyCode: "T1",
    duration: "2.5小时",
    distance: "6.2公里",
    elevationGain: "+150米",
    description: "欧洲最罕见、最庞大的钙华喀斯特溶洞和天然石瀑。山间清泉从长满绿苔的巨石上飞泻而下，形成了如童话般的水帘洞奇观。",
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
    photoSpot: "在水帘瀑布下方的绿苔岩石旁，仰拍泉水和茂密植被。",
    packingList: ["防潮轻便鞋", "水杯", "驱蚊水"],
    roadBook: `# 博洛尼亚拉班特天然瀑布步道

- **路线介绍**: 穿过静谧的栗树林和葡萄藤，走上水帘瀑布和天然溶洞栈道。
- **亮点**: 冰凉的喀斯特泉水，清澈见底，洞内长年15度左右，夏季解暑首选。`
  },
  {
    id: "it-roma-nemi",
    countryId: "italy",
    cityId: "roma",
    title: "内米火山湖环线一日徒步计划 (Anello di Nemi) · 罗马皇帝的夏宫湖",
    departure: "罗马 (Roma) 乘坐 Cotral 巴士至 Nemi 悬崖小镇",
    difficulty: "T1 休闲散步",
    difficultyCode: "T1",
    duration: "3.5小时",
    distance: "9.0公里",
    elevationGain: "+180米",
    description: "坐落在巨大死火山盆底的静谧深蓝湖泊。湖畔长满野生草莓，Nemi悬崖镇高高悬挂在火山口边缘，小道遍布着古罗马黛安娜神庙遗址。",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
    photoSpot: "Nemi悬崖小镇的瞭望天台，俯瞰火山口湖全貌，可以同时拍下草莓小蛋糕与深蓝湖水。",
    packingList: ["运动鞋", "遮阳帽", "现金（用于品尝草莓塔和野猪肉帕尼尼）"],
    roadBook: `# 罗马内米火山湖与草莓小镇徒步书

- **起终点**: Nemi悬崖小镇主门。
- **路线轨迹**: 沿之字折叠道下降至火山湖底，漫步在温室大棚和野草莓林中，探访一战打捞罗马皇帝克里古拉巨型木船遗址，最后沿火山崖边密林爬升回镇，品尝著名的草莓挞(Tortina alle Fragoline di Nemi)。`
  },
  {
    id: "it-napoli-vesuvio",
    countryId: "italy",
    cityId: "napoli",
    title: "维苏威火山大地裂缝一日徒步计划 (Gran Cono Vesuvio) · 环游末日火山口",
    departure: "那不勒斯 (Napoli) 火车 Circumvesuviana 至 Ercolano 换乘登山巴士",
    difficulty: "T2 初级体验",
    difficultyCode: "T2",
    duration: "3.0小时",
    distance: "5.8公里",
    elevationGain: "+320米",
    description: "登上摧毁庞贝古城的愤怒巨兽之脊。步道铺满红色火山砾石，环绕深达300米的巨大黑褐色火山口，两旁硫磺蒸汽袅袅，直面那不勒斯海湾绝景。",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    photoSpot: "在火山口最高点，将白色的硫磺蒸汽、红黑色的断裂崖壁和背景深蓝的那不勒斯湾、卡普里岛一同拍下。",
    packingList: ["高帮防沙防碎石登山鞋", "面巾或魔术头巾", "偏光墨镜", "防风衣"],
    roadBook: `# 那不勒斯维苏威火山口一日探险指南

- **路线介绍**: 攀登维苏威主火山口 (Gran Cono, 1281m)。
- **注意事项**: 必须在官网提前购买入场预约票，现场没有售票处！
- **感受**: 踩着红色岩浆熔岩沙砾缓缓上升。在山顶裂缝，能闻到淡淡的硫磺气味，惊叹于大自然的力量。下山可顺路到庞贝遗址游玩。`
  },
  {
    id: "it-palermo-drago",
    countryId: "italy",
    cityId: "palermo",
    title: "龙之峡谷与科尔莱奥内瀑布一日徒步计划 (Gole del Drago) · 西西里秘境",
    departure: "巴勒莫 (Palermo) 驾车或乘长途大巴至 Corleone",
    difficulty: "T2 初级体验",
    difficultyCode: "T2",
    duration: "3.5小时",
    distance: "7.0公里",
    elevationGain: "+180米",
    description: "西西里深处干热岩石丘陵之中的翡翠绿绿洲。数万年河水切割石灰岩，形成了幽深的峡谷。小溪终点是一座挂在城堡废墟下的瀑布。",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    photoSpot: "在科尔莱奥内双层瀑布的天然深潭前，仰拍古老城堡遗址悬崖。",
    packingList: ["涉水鞋或备用干鞋袜", "防晒帽", "西西里风味面包", "泳衣（可在瀑布深潭中游泳）"],
    roadBook: `# 西西里龙之峡谷与教父故乡瀑布徒步书

- **亮点**: 教父原著中的科尔莱奥内山城 + 荒漠中的瀑布水帘洞。
- **轨迹**: 从小路下切至龙之峡谷 (Gole del Drago) 谷底，攀爬被河水磨得圆润的火山灰岩巨石。沿河床折返至城镇边的 Cascata delle Due Rocche (双岩瀑布)，清凉的潭水非常适合洗去酷暑。`
  }
];
