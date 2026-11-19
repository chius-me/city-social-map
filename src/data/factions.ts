import type { Faction } from "../types";

/**
 * Helper to create rounded orthogonal SVG paths from polygon points.
 * Used for both standard rectangles and authentic L-shaped faction zones
 * (THE MOB, Makabe Family, CITY South Soccer Team).
 */
function roundedPolygonPath(points: [number, number][], r = 16): string {
  const n = points.length;
  const segments: string[] = [];
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];
    const v1x = prev[0] - curr[0];
    const v1y = prev[1] - curr[1];
    const v2x = next[0] - curr[0];
    const v2y = next[1] - curr[1];
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    const radius = Math.min(r, len1 / 2, len2 / 2);
    const p1x = curr[0] + (v1x / len1) * radius;
    const p1y = curr[1] + (v1y / len1) * radius;
    const p2x = curr[0] + (v2x / len2) * radius;
    const p2y = curr[1] + (v2y / len2) * radius;
    if (i === 0) {
      segments.push(`M ${p1x.toFixed(1)} ${p1y.toFixed(1)}`);
    } else {
      segments.push(`L ${p1x.toFixed(1)} ${p1y.toFixed(1)}`);
    }
    segments.push(`Q ${curr[0]} ${curr[1]} ${p2x.toFixed(1)} ${p2y.toFixed(1)}`);
  }
  segments.push("Z");
  return segments.join(" ");
}

function rectPath(x: number, y: number, w: number, h: number, r = 18): string {
  return roundedPolygonPath(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    r
  );
}

export const FACTIONS: Faction[] = [
  {
    id: "the-mob",
    name: {
      zh: "路人团 (THE MOB)",
      en: "THE MOB",
      ja: "モブ (THE MOB)",
    },
    shortName: {
      zh: "路人团",
      en: "THE MOB",
      ja: "モブ",
    },
    subtitle: {
      zh: "戏份超足的「无名」背景路人们",
      en: "Suspiciously Distinctive 'Background' Citizens",
      ja: "個性豊かすぎる「モブ」の皆さん",
    },
    description: {
      zh: "恶搞漫画中「モブ（背景路人）」概念的奇特群体——每个人登场时都没有名字，却都有极其鲜明的性格与独立支线。首次集结时把无辜的新人警察本官误认成伪装小偷并狠狠痛扁了一顿。",
      en: "A playful parody of anime 'mob' background characters—introduced nameless yet packed with eccentric personalities. In their debut, they mistook Officer Honkan for a thief in disguise and beat him up.",
      ja: "「モブキャラ」という概念そのものをパロディ化した集団。最初は名無しのモブとして登場しながら一人ひとりが強烈な個性を持ち、初登場時には本官さんを泥棒と誤解してボコボコにしてしまった。",
    },
    location: {
      zh: "CITY 商店街一带",
      en: "CITY Shopping Street",
      ja: "CITY商店街周辺",
    },
    fill: "#DFE1E8",
    accent: "#6B7280",
    ink: "#1E222D",
    // Authentic L-shape with top-left title tab
    svgPath: roundedPolygonPath(
      [
        [56, 54],
        [232, 54],
        [232, 102],
        [466, 102],
        [466, 308],
        [56, 308],
      ],
      16
    ),
    labelPos: { x: 74, y: 86, align: "start" },
    bounds: { x: 40, y: 40, width: 450, height: 290 },
    wikiUrl: "https://city.wiki.gg/wiki/MOB",
  },
  {
    id: "adatara-family",
    name: {
      zh: "安达太良家（酒之安达太良）",
      en: "Adatara Family",
      ja: "安達太良家（酒の安達太良）",
    },
    shortName: {
      zh: "安达太良家",
      en: "Adatara Family",
      ja: "安達太良家",
    },
    subtitle: {
      zh: "热闹非凡的三代同堂八口酒屋家族",
      en: "Chaotic Three-Generation Liquor Store Clan",
      ja: "賑やかな三世代8人家族の酒屋さん",
    },
    description: {
      zh: "经营位于真壁西餐厅隔壁的「酒之安达太良（安达太良 WINE）」。从爱捣鼓奇怪发明的爷爷、属于「CITY 三羽乌」的爸爸、充满活力的妈妈，到五位性格迥异的兄弟姐妹，每天都充满欢闹。",
      en: "Owners of Adatara Sake right next door to Makabe's Western Bistro. Spanning three lively generations—an eccentric inventor grandpa, cool-headed dad, powerhouse mom, and five energetic siblings.",
      ja: "洋食マカベの隣にある「酒の安達太良」を営む三世代8人の大家族。発明家の博士、三羽ガラスの父、パワフルな母、そして個性あふれる5人きょうだいが毎日を賑やかに彩る。",
    },
    location: {
      zh: "酒之安達太良（真壁西餐厅隔壁）",
      en: "Adatara Sake (next to Makabe Bistro)",
      ja: "酒の安達太良（洋食マカベ隣）",
    },
    fill: "#D7EED0",
    accent: "#6BB252",
    ink: "#1E3A1B",
    svgPath: rectPath(490, 194, 340, 330, 20),
    labelPos: { x: 512, y: 234, align: "start" },
    bounds: { x: 470, y: 175, width: 380, height: 370 },
    wikiUrl: "https://city.wiki.gg/wiki/Adatara_Family",
  },
  {
    id: "mont-blanc-trio",
    name: {
      zh: "蒙布朗三人组",
      en: "Mont Blanc Trio",
      ja: "モンブラン三人組",
    },
    shortName: {
      zh: "蒙布朗三人组",
      en: "Mont Blanc Trio",
      ja: "モンブラン三人組",
    },
    subtitle: {
      zh: "蒙布朗大学 × 木目生庄核心主角团",
      en: "Mont Blanc University's Unstoppable Core Trio",
      ja: "モンブラン大学＆モクメセイ荘の仲良し3人組",
    },
    description: {
      zh: "故事的绝对中心！由整天欠租却赤诚爽快的南云美鸟、憧憬前辈的摄影少女新仓、以及脑洞清奇的天才怪人泉环子组成。三人同住木目生庄，就读于蒙布朗大学，是 CITY 欢闹日常的发动机。",
      en: "The beating heart of CITY! Midori Nagumo (broke, bold, pure-hearted), Niikura (aspiring photographer & loyal underclassman), and Wako Izumi (joyful eccentric genius), all living at Woodgrain Manor.",
      ja: "物語の中心となる3人組！家賃滞納常習犯だが心ピュアな南雲美鳥、カメラを愛する後輩・にーくら、天真爛漫な天才変人・泉わこ。モンブラン大学に通い、モクメセイ荘で暮らしている。",
    },
    location: {
      zh: "木目生庄 / 蒙布朗大学",
      en: "Woodgrain Manor / Mont Blanc University",
      ja: "モクメセイ荘・モンブラン大学",
    },
    fill: "#FAD4DF",
    accent: "#E46B8E",
    ink: "#4A1828",
    // Slight stepped top-right edge matching original composition
    svgPath: roundedPolygonPath(
      [
        [850, 96],
        [1138, 96],
        [1138, 174],
        [1234, 174],
        [1234, 258],
        [850, 258],
      ],
      18
    ),
    labelPos: { x: 996, y: 126, align: "middle" },
    bounds: { x: 830, y: 80, width: 425, height: 195 },
    wikiUrl: "https://city.wiki.gg/wiki/Mont_Blanc_Trio",
  },
  {
    id: "city-weekly",
    name: {
      zh: "《周刊CITY》编辑部",
      en: "CITY Weekly Magazine",
      ja: "『週刊CITY誌』編集部",
    },
    shortName: {
      zh: "《周刊CITY》",
      en: "CITY Weekly",
      ja: "週刊CITY誌",
    },
    subtitle: {
      zh: "香蕉公司出品的传奇（冷门）本地杂志",
      en: "Banana Company's Eccentric Local Weekly",
      ja: "バナナ社の個性派ローカル週刊誌編集部",
    },
    description: {
      zh: "坐落在真壁西餐厅对面大楼的香蕉公司《周刊CITY》编辑部，实际上由富婆田边暗中全额出资。这里有严厉的主编、元气前辈荒真、热血新人编辑轰，以及两位截然不同的连载漫画家——鬼蒲鉾与长野原大介（来自《日常》的彩蛋联动！）。",
      en: "Located across from Makabe's Western Bistro, this quirky local magazine (secretly funded by Tanabe) employs the strict Editor in Chief, cheerful Arama-san, ambitious Todoroki, struggling mangaka Kamaboko Oni, and superstar Daisuke Naganohara.",
      ja: "洋食マカベ向かいのビルにあるバナナ社『週刊CITY誌』編集部。編集長・あらまさん・轟の編集トリオに加え、漫画家・鬼カマボコと人気作家・長野原大介（『日常』からの豪華クロスオーバー！）が連載陣に名を連ねる。",
    },
    location: {
      zh: "香蕉公司大楼（真壁西餐厅对面）",
      en: "Banana Co. Building",
      ja: "バナナ社ビル",
    },
    fill: "#E4D3DA",
    accent: "#945E73",
    ink: "#361D27",
    svgPath: rectPath(948, 294, 334, 240, 18),
    labelPos: { x: 1111, y: 322, align: "middle" },
    bounds: { x: 928, y: 278, width: 374, height: 274 },
    wikiUrl: "https://city.wiki.gg/wiki/CITY_Weekly_Magazine_Editorial_Department",
  },
  {
    id: "makabe-family",
    name: {
      zh: "真壁家（洋食マカベ）",
      en: "Makabe Family",
      ja: "真壁家（洋食マカベ）",
    },
    shortName: {
      zh: "真壁家",
      en: "Makabe Family",
      ja: "真壁家",
    },
    subtitle: {
      zh: "商店街老字号西餐厅 × 最强房东外婆家族",
      en: "Beloved Western Bistro & Landlady Obaba's Clan",
      ja: "商店街の人気洋食店＆最強大家オババの一家",
    },
    description: {
      zh: "CITY 商店街的地标「洋食马卡贝（真壁西餐厅）」一家。包括无敌的木目生庄房东老婆婆、帅气冷面大厨真壁鹤菱、常年海外考古的妈妈、青春满溢的高中生哥哥立涌（同时也是足球部替补），以及元气满满的初中生妹妹茉莉。",
      en: "The warmhearted family behind Makabe's Western Bistro: invincible landlady Obaba, dandy Chef Tsurubishi Makabe, globetrotting archaeologist Mrs. Makabe, lovestruck high schooler Tatewaku (also on the Soccer Team!), and lively middle schooler Matsuri.",
      ja: "商店街の名店「洋食マカベ」の一家。最強の大家オババ、ダンディーな店主・鶴菱、海外調査中の母、青春ど真ん中の兄・立涌（サッカー部にも所属！）、元気な妹・まつりで構成される。",
    },
    location: {
      zh: "洋食マカベ / 木目生庄",
      en: "Makabe's Western Bistro",
      ja: "洋食マカベ・モクメセイ荘",
    },
    fill: "#F9DFBF",
    accent: "#E59235",
    ink: "#4A2908",
    // L-shaped polygon wrapping Obaba at top-left and main family below
    svgPath: roundedPolygonPath(
      [
        [1326, 174],
        [1456, 174],
        [1456, 256],
        [1648, 256],
        [1648, 530],
        [1326, 530],
      ],
      18
    ),
    labelPos: { x: 1552, y: 292, align: "middle" },
    bounds: { x: 1308, y: 158, width: 375, height: 390 },
    wikiUrl: "https://city.wiki.gg/wiki/Makabe_Family",
  },
  {
    id: "tanabe-mansion",
    name: {
      zh: "田边豪宅（田边家）",
      en: "The Tanabe Mansion",
      ja: "タナベ邸（タナベ家）",
    },
    shortName: {
      zh: "田边豪宅",
      en: "Tanabe Mansion",
      ja: "タナベ邸",
    },
    subtitle: {
      zh: "极尽浮夸的「强行表彰」豪门与高塔试炼",
      en: "Opulent Estate of Over-the-Top Hospitality & Tower Bosses",
      ja: "強引すぎる表彰でおもてなしする謎の大富豪一族",
    },
    description: {
      zh: "位于 CITY 郊外、拥有双子高塔的神秘豪门。大小姐田边菫樱子美曾任警官，辞职后沉迷用「抓捕+强行宴请表彰」来报答 CITY 居民，还雇佣了忠心管家穗高、无数仆人，以及镇守高塔各层的六位奇葩「塔之首领」来挽留（阻拦）宾客。",
      en: "An extravagant rural estate featuring twin towers. Eccentric heiress and former officer Tanabe loves 'kidnapping' worthy citizens for lavish award banquets—assisted by butler Hotaka, countless servants, and six bizarre Tower Bosses who keep guests from escaping.",
      ja: "街外れにそびえる大豪邸。元警官のお嬢様・タナベが「街のいい人」を強引に拉致して盛大に表彰しようとし、執事の穂高や無数の使用人、さらには塔の各階を守る6人の個性派ボスたちがゲストを迎え撃つ。",
    },
    location: {
      zh: "田边邸・双子高塔",
      en: "Tanabe Estate & Twin Towers",
      ja: "タナベ邸・ツインピークスタワー",
    },
    fill: "#FDF0B5",
    accent: "#DDA11C",
    ink: "#4A3604",
    svgPath: rectPath(412, 592, 396, 356, 20),
    labelPos: { x: 786, y: 920, align: "end" },
    bounds: { x: 394, y: 574, width: 432, height: 392 },
    wikiUrl: "https://city.wiki.gg/wiki/Tanabe_Family",
  },
  {
    id: "tekaridake-troupe",
    name: {
      zh: "光岳剧团",
      en: "The Theater Troupe Tekaridake",
      ja: "劇団テカリダケ",
    },
    shortName: {
      zh: "光岳剧团",
      en: "Tekaridake Troupe",
      ja: "劇団テカリダケ",
    },
    subtitle: {
      zh: "蒙布朗大学演剧研究会（唯一人类团长 × 六只谜之团员）",
      en: "Mont Blanc University's Cult-Favorite Animal Theater Troupe",
      ja: "モンブラン大学演劇研究会（人間1名＋動物＆謎の存在）",
    },
    description: {
      zh: "蒙布朗大学的传奇剧团，代表作包括第 7 回公演《のど（喉）》与《MONOEYE》，在 CITY 街头甚至有大批粉丝身穿其周边 T 恤。不知为何团长光岳伸晃是团里唯一的人类，其余成员全都是脾气火爆的小动物与谜之生物，排练时动不动就暴揍团长。",
      en: "Mont Blanc University's wildly beloved theater research club, famous for plays like 'Throat' and 'MONOEYE'. Mysteriously, founder Nobuteru Tekaridake is the sole human—surrounded by combative animals and an enigmatic Mr. X who regularly beat him up during rehearsals.",
      ja: "モンブラン大学の伝説的な演劇研究会。第7回公演『のど』などで街中に熱狂的ファンを抱えるが、なぜか座長の光岳伸晃以外は全員動物や正体不明の生き物で、稽古のたびに座長がボコボコにされている。",
    },
    location: {
      zh: "蒙布朗大学 / 剧团テカリダケ本部",
      en: "Mont Blanc University / Troupe HQ",
      ja: "モンブラン大学・劇団テカリダケ本部",
    },
    fill: "#FCDCD8",
    accent: "#E56F66",
    ink: "#4E1B18",
    svgPath: rectPath(964, 686, 348, 262, 20),
    labelPos: { x: 1138, y: 928, align: "middle" },
    bounds: { x: 944, y: 668, width: 388, height: 298 },
    wikiUrl: "https://city.wiki.gg/wiki/Tekaridake_Troupe",
  },
  {
    id: "city-south-soccer",
    name: {
      zh: "CITY南高中足球部",
      en: "CITY South Soccer Team",
      ja: "CITY南高校サッカー部",
    },
    shortName: {
      zh: "南高中足球部",
      en: "South Soccer Team",
      ja: "南高校サッカー部",
    },
    subtitle: {
      zh: "热血、搞笑又卧虎藏龙的 14 人足球天团",
      en: "Minami High School's Wildly Eccentric 14-Man Squad",
      ja: "個性派ぞろいのCITY南高校サッカー部（全14名）",
    },
    description: {
      zh: "CITY 南高中的王牌（？）社团！在完全不懂足球规则却情感充沛的雁腹教练带领下，汇集了热血队长带那、原百万年一遇棒球天才门将黑金、超级王牌却爱受伤的笹子、间谍权现山、泉莉子应援团团长火之玉，以及来自真壁家的替补中场真壁立涌！",
      en: "Minami High School's unforgettable soccer club! Coached by Mr. Gangahara (who knows zero soccer rules), the roster spans passionate Captain Obina, baseball-prodigy goalie Yamato, injury-prone ace Masago, undercover spy Gondenyama, Riko fan-club president Hinotama, and Makabe Family's own #28 sub Tatewaku.",
      ja: "サッカーのルールを一切知らない雁ヶ腹監督のもと、熱血キャプテン帯那、元野球の天才GK黒金、超高校級エース笹子、実はスパイの権現山、泉りこ親衛隊長の火之玉、そして真壁家の立涌（背番号28）ら14名が集う部活。",
    },
    location: {
      zh: "CITY 南高中操场",
      en: "CITY Minami High School Pitch",
      ja: "CITY南高校グラウンド",
    },
    fill: "#D2E5FA",
    accent: "#1395EA",
    ink: "#103252",
    // Authentic L-shape rising up to wrap ONLY Tatewaku (overlapping Makabe Family!)
    svgPath: roundedPolygonPath(
      [
        [1352, 462],
        [1492, 462],
        [1492, 534],
        [1726, 534],
        [1726, 948],
        [1352, 948],
      ],
      18
    ),
    labelPos: { x: 1539, y: 928, align: "middle" },
    bounds: { x: 1336, y: 448, width: 408, height: 516 },
    wikiUrl: "https://city.wiki.gg/wiki/CITY_South_Soccer_Team",
  },
];

export const FACTION_MAP: Record<string, Faction> = Object.fromEntries(
  FACTIONS.map((f) => [f.id, f])
);
