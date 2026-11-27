import type { ResourceCategory } from "../types";

/**
 * Curated CITY THE ANIMATION resources adapted from:
 * https://github.com/chius-cc/awesome-citytheanimation
 */
export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: "official",
    title: {
      zh: "官方传送门",
      en: "Official Portals",
      ja: "公式リンク",
    },
    accent: "#F7B647",
    items: [
      {
        title: {
          zh: "《CITY THE ANIMATION》官方网站",
          en: "Official Anime Website (city-the-animation.com)",
          ja: "『CITY THE ANIMATION』公式サイト",
        },
        description: {
          zh: "日文官方总站，含全体居民档案、分集简介、音乐与 Blu-ray 专题页。",
          en: "Primary Japanese portal with character roster, episode guides, music & BD/DVD.",
          ja: "キャラクター紹介、ストーリー、音楽、BD&DVD情報を網羅した公式ポータル。",
        },
        url: "https://city-the-animation.com/",
        tag: "OFFICIAL",
      },
      {
        title: {
          zh: "京都动画官方作品页",
          en: "Kyoto Animation Official Works Page",
          ja: "京都アニメーション 作品ページ",
        },
        description: {
          zh: "京阿尼时隔 6 年的全新非续作 TV 动画官方档案与主创名单。",
          en: "Kyoto Animation's studio portfolio page with synopsis and core staff.",
          ja: "京都アニメーションによる作品アーカイブとメインスタッフ情報。",
        },
        url: "https://www.kyotoanimation.co.jp/works/city/",
        tag: "KYOANI",
      },
      {
        title: {
          zh: "Amazon Prime Video 全球正版流媒体",
          en: "Amazon Prime Video (Worldwide Streaming)",
          ja: "Amazon Prime Video（世界独占配信）",
        },
        description: {
          zh: "全 13 话（80 个段落）全球正版观看，支持中英日等多语字幕。",
          en: "All 13 episodes streaming worldwide with multi-language audio & subtitles.",
          ja: "全13話を見放題独占配信中（多言語字幕・吹替対応）。",
        },
        url: "https://www.primevideo.com/detail/0S1DSDV3YPNM8W8GZQK8FJTZ9H",
        tag: "STREAM",
      },
      {
        title: {
          zh: "KyoaniChannel 官方播放列表",
          en: "KyoaniChannel Official YouTube Playlist",
          ja: "KyoaniChannel 公式再生リスト",
        },
        description: {
          zh: "收录全套 PV 预告、无字 OP/ED 与官方名场面切片。",
          en: "Official PVs, creditless OP/ED, cast commentaries, and cut scenes.",
          ja: "PV・ノンクレジットOP/ED・切り抜きシーンなどの公式映像集。",
        },
        url: "https://www.youtube.com/playlist?list=PLTNhweghpLi1K3yEu0cSTb0wg9r1Lp-Qf",
        tag: "VIDEO",
      },
    ],
  },
  {
    id: "wiki-community",
    title: {
      zh: "图谱出处、Wiki 与精选清单",
      en: "Map Source, Wikis & Curated Lists",
      ja: "出典・Wiki・まとめ",
    },
    accent: "#F09CB4",
    items: [
      {
        title: {
          zh: "原始关系图：CITY Social Map (VayItsHere)",
          en: "Original Map: CITY Social Map by VayItsHere",
          ja: "元相関図：CITY Social Map by VayItsHere",
        },
        description: {
          zh: "本站人物关系拓扑的原始参考图（2025 年 6 月由 VayItsHere / Mokkachino 制作）。",
          en: "The community social map (June 2025 by VayItsHere / Mokkachino) this interactive map honors.",
          ja: "本サイトの相関図トポロジーの出典となったコミュニティ制作マップ（CITY Wiki）。",
        },
        url: "https://city.wiki.gg/wiki/File:CITY_Social_Map_by_VayItsHere.jpeg",
        tag: "SOURCE",
      },
      {
        title: {
          zh: "awesome-citytheanimation 资源仓库",
          en: "awesome-citytheanimation (GitHub)",
          ja: "awesome-citytheanimation（GitHub）",
        },
        description: {
          zh: "中英双语精选清单，涵盖官方情报、音乐、作画笔记、访谈与社区入口。",
          en: "Bilingual curated catalog of official links, music, sakuga essays, and communities.",
          ja: "公式・音楽・作画考察・インタビューを網羅した厳選リソース集。",
        },
        url: "https://github.com/chius-cc/awesome-citytheanimation",
        tag: "AWESOME",
      },
      {
        title: {
          zh: "CITY Wiki (wiki.gg)",
          en: "CITY Wiki (wiki.gg)",
          ja: "CITY Wiki（wiki.gg）",
        },
        description: {
          zh: "活跃的英文社区维基，详尽整理全体角色、阵营与漫画/动画对照。",
          en: "Active community encyclopedia covering characters, factions, and episodes.",
          ja: "登場人物・グループ・各話エピソードを詳しくまとめた英語Wiki。",
        },
        url: "https://city.wiki.gg/",
        tag: "WIKI",
      },
      {
        title: {
          zh: "萌娘百科 — CITY",
          en: "Moegirlpedia (萌娘百科) — CITY",
          ja: "萌娘百科 — CITY",
        },
        description: {
          zh: "中文 ACG 百科条目，梳理群像角色设定、原作单行本与动画情报。",
          en: "Chinese ACG encyclopedia entry covering ensemble cast & publication history.",
          ja: "中国語圏のACG百科事典による登場人物・原作・アニメ情報。",
        },
        url: "https://zh.moegirl.org.cn/CITY",
        tag: "ZH WIKI",
      },
    ],
  },
  {
    id: "music-craft",
    title: {
      zh: "音乐、漫画与深度作画笔记",
      en: "Music, Manga & Sakuga Craft",
      ja: "音楽・原作・作画考察",
    },
    accent: "#99CB77",
    items: [
      {
        title: {
          zh: "OP：Furui Riho《Hello》（无字片头）",
          en: "OP: Furui Riho — \"Hello\" (Creditless)",
          ja: "OP：Furui Riho「Hello」（ノンクレジット）",
        },
        description: {
          zh: "石立太一监督亲自担任分镜与演出的活力满点片头曲映像。",
          en: "Energetic opening sequence storyboarded and directed by Taichi Ishidate.",
          ja: "石立太一監督自ら絵コンテ・演出を手がけたノンクレジットOP映像。",
        },
        url: "https://www.youtube.com/watch?v=10eZAXGuVT4",
        tag: "OP",
      },
      {
        title: {
          zh: "ED：TOMOO《LUCKY》（无字片尾）",
          en: "ED: TOMOO — \"LUCKY\" (Creditless)",
          ja: "ED：TOMOO「LUCKY」（ノンクレジット）",
        },
        description: {
          zh: "美术监督山崎诗央里执导的绘本风温暖片尾映像。",
          en: "Storybook-style ending sequence directed by Art Director Shiori Yamazaki.",
          ja: "美術監督・山崎詩央里が手がけた絵本テイストのノンクレジットED。",
        },
        url: "https://www.youtube.com/watch?v=bP9yvQKl02Q",
        tag: "ED",
      },
      {
        title: {
          zh: "原声大碟 OST — Piranhans (Spotify)",
          en: "Original Soundtrack by Piranhans (Spotify)",
          ja: "オリジナルサウンドトラック（ピラニアンズ）",
        },
        description: {
          zh: "口风琴四重奏乐队 Piranhans 创作的 26 首轻快配乐。",
          en: "26 playful instrumental tracks by the melodica-led quartet Piranhans.",
          ja: "ピアニカ四重奏バンド・ピラニアンズによる全26曲の劇伴アルバム。",
        },
        url: "https://open.spotify.com/album/1L70upT9oBx0qQ2OnpPLbH",
        tag: "OST",
      },
      {
        title: {
          zh: "Sakuga Blog — 从《日常》到《CITY》制作笔记",
          en: "Sakuga Blog — From Nichijou to CITY & Production Notes",
          ja: "Sakuga Blog — 『日常』から『CITY』への制作ノート",
        },
        description: {
          zh: "深度解析新井圭一 × 京阿尼十四年来的创作演进与手绘实验美学。",
          en: "In-depth essays on Kyoto Animation's analog craft, simultaneity & art direction.",
          ja: "新井圭一×京アニの14年の歩みと手描き表現を掘り下げる英語長文コラム。",
        },
        url: "https://blog.sakugabooru.com/2024/09/21/from-nichijou-to-city-kyoto-animations-gentle-touch-adapting-keiichi-arawis-madness/",
        tag: "ESSAY",
      },
    ],
  },
  {
    id: "creator-communities",
    title: {
      zh: "原作者与社区讨论",
      en: "Creator & Fan Communities",
      ja: "原作者・コミュニティ",
    },
    accent: "#EE847D",
    items: [
      {
        title: {
          zh: "新井圭一官方 X (@himaraya) & 讲谈社 Morning",
          en: "Keiichi Arawi on X (@himaraya)",
          ja: "あらゐけいいち 公式X (@himaraya)",
        },
        description: {
          zh: "《CITY》（全 15 卷完结）与《日常》原作者的插画与日常涂鸦。",
          en: "Original author of CITY (15 volumes complete) and Nichijou.",
          ja: "原作漫画『CITY』（全15巻完結）作者の公式アカウント。",
        },
        url: "https://x.com/himaraya",
        tag: "AUTHOR",
      },
      {
        title: {
          zh: "讲谈社 Morning《CITY》漫画总页",
          en: "Kodansha Morning — Official CITY Manga Page",
          ja: "講談社モーニング『CITY』公式ページ",
        },
        description: {
          zh: "涵盖 2016–2021 首轮连载与 2024–2025 回归完结篇的原作总入口。",
          en: "Official serialization home covering all 15 volumes of the manga.",
          ja: "2016年の連載開始から完結編までを網羅したモーニング公式作品ページ。",
        },
        url: "https://morning.kodansha.co.jp/c/city.html",
        tag: "MANGA",
      },
      {
        title: {
          zh: "r/City (Reddit) & Nichijou-CITY Discord",
          en: "r/City Subreddit",
          ja: "r/City（Reddit コミュニティ）",
        },
        description: {
          zh: "诞生了本张 Social Map 原图的活跃英文粉丝社区！",
          en: "The lively fan community where VayItsHere originally posted the CITY Social Map!",
          ja: "元の相関図『CITY the Social Map』が投稿された海外ファンコミュニティ。",
        },
        url: "https://www.reddit.com/r/City/",
        tag: "REDDIT",
      },
      {
        title: {
          zh: "Bangumi 番组计划 — CITY THE ANIMATION",
          en: "Bangumi (番组计划) — CITY THE ANIMATION",
          ja: "Bangumi — CITY THE ANIMATION",
        },
        description: {
          zh: "中文 ACG 数据库条目，收录每话分镜演出表与深度讨论。",
          en: "Chinese ACG database with episode staff credits and viewer discussions.",
          ja: "各話絵コンテ・演出データやレビューが集まる中国語ACGデータベース。",
        },
        url: "https://bgm.tv/subject/514358",
        tag: "BGM",
      },
    ],
  },
];
