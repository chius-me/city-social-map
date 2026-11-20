export type Locale = 'zh' | 'en' | 'ja';

export interface LocalizedText {
  zh: string;
  en: string;
  ja: string;
}

export function pickText(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

export type CitySiteId = 'social-map' | 'avatar';

export interface CitySiteEntry {
  id: CitySiteId;
  subtitle: string;
  url: string;
  domain: string;
  repoUrl: string;
  repoSlug: string;
  accent: string;
  name: LocalizedText;
  tabTitle: LocalizedText;
  shortLabel: LocalizedText;
  summary: LocalizedText;
}

export const CITY_SITES: Record<CitySiteId, CitySiteEntry> = {
  'social-map': {
    id: 'social-map',
    subtitle: 'SOCIAL MAP',
    url: 'https://social.city.chius.dev',
    domain: 'social.city.chius.dev',
    repoUrl: 'https://github.com/chius-me/city-social-map',
    repoSlug: 'chius-me/city-social-map',
    accent: '#f7b647',
    name: {
      zh: 'CITY 人物关系图',
      en: 'CITY Social Map',
      ja: 'CITY 相関図マップ',
    },
    tabTitle: {
      zh: 'CITY Social Map · 《小城日常》人物关系图',
      en: 'CITY Social Map · CITY THE ANIMATION',
      ja: 'CITY Social Map · 『CITY THE ANIMATION』相関図',
    },
    shortLabel: {
      zh: '人物关系图',
      en: 'Social Map',
      ja: '相関図',
    },
    summary: {
      zh: '65 位居民、8 大阵营全景关系图谱、中心星图与六度路径查找。',
      en: 'Interactive 65-resident panorama chart, Ego Radar & Six-Degrees path finder.',
      ja: '住人65名・8グループの全体相関図、中心レーダー＆つながり検索。',
    },
  },
  avatar: {
    id: 'avatar',
    subtitle: 'AVATAR',
    url: 'https://avatar.city.chius.dev',
    domain: 'avatar.city.chius.dev',
    repoUrl: 'https://github.com/chius-me/city-avatar',
    repoSlug: 'chius-me/city-avatar',
    accent: '#f09cb4',
    name: {
      zh: 'CITY 风格头像工坊',
      en: 'CITY Avatar Studio',
      ja: 'CITY 風アイコン工房',
    },
    tabTitle: {
      zh: 'CITY Avatar · 《小城日常》风格头像工坊',
      en: 'CITY Avatar · CITY THE ANIMATION',
      ja: 'CITY Avatar · 『CITY THE ANIMATION』アイコン工房',
    },
    shortLabel: {
      zh: '头像工坊',
      en: 'Avatar Studio',
      ja: 'アイコン工房',
    },
    summary: {
      zh: '上传人物、宠物或生物照片，通过 Workers AI 重绘为 CITY 官网风头像。',
      en: 'Stylize any portrait, pet, or creature photo into a CITY official-style avatar.',
      ja: '人物やペットの写真を『CITY』公式キャラ風アイコンに変換。',
    },
  },
};

export const CITY_SITE_LIST: CitySiteEntry[] = [
  CITY_SITES['social-map'],
  CITY_SITES.avatar,
];

export function getSisterSite(siteId: CitySiteId): CitySiteEntry {
  return siteId === 'social-map' ? CITY_SITES.avatar : CITY_SITES['social-map'];
}

export const CITY_EXTERNAL_LINKS = {
  officialSite: 'https://city-the-animation.com/',
  officialCharacters: 'https://city-the-animation.com/character/',
  awesomeRepo: 'https://github.com/chius-me/awesome-citytheanimation',
} as const;

export const SHELL_TEXT: Record<
  Locale,
  {
    menuLabel: string;
    sourceShort: string;
    awesomeRepo: string;
    officialSite: string;
    disclaimer: string;
  }
> = {
  zh: {
    menuLabel: '导航菜单',
    sourceShort: 'GitHub',
    awesomeRepo: 'Awesome CITY',
    officialSite: '动画官网',
    disclaimer:
      '非官方同人交互项目 · 原作 © あらゐけいいち・講談社／CITY THE ANIMATION 製作委員会',
  },
  en: {
    menuLabel: 'Menu',
    sourceShort: 'GitHub',
    awesomeRepo: 'Awesome CITY',
    officialSite: 'Official Site',
    disclaimer:
      'Unofficial fan-made tool · Original characters © Keiichi Arawi · Kodansha / CITY THE ANIMATION',
  },
  ja: {
    menuLabel: 'メニュー',
    sourceShort: 'GitHub',
    awesomeRepo: 'Awesome CITY',
    officialSite: '公式サイト',
    disclaimer:
      '非公式ファンツール · 原作 © あらゐけいいち・講談社／CITY THE ANIMATION 製作委員会',
  },
};
