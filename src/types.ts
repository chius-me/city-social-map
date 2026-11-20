export type Locale = "zh" | "en" | "ja";

export interface LocalizedText {
  zh: string;
  en: string;
  ja: string;
}

/** Original VayItsHere map line style */
export type RelationType = "children" | "friendship" | "employment" | "specific";

/** Rich semantic relation category (FandomGraph / Otaku Data Viz inspired) */
export type RelationCategory =
  | "family"
  | "friendship"
  | "romance"
  | "work"
  | "conflict"
  | "admiration";

export type FactionId =
  | "the-mob"
  | "adatara-family"
  | "mont-blanc-trio"
  | "city-weekly"
  | "makabe-family"
  | "tanabe-mansion"
  | "tekaridake-troupe"
  | "city-south-soccer";

export interface Faction {
  id: FactionId;
  name: LocalizedText;
  shortName: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  location: LocalizedText;
  fill: string;
  accent: string;
  ink: string;
  svgPath: string;
  labelPos: { x: number; y: number; align?: "start" | "middle" | "end" };
  bounds: { x: number; y: number; width: number; height: number };
  wikiUrl?: string;
}

export interface Character {
  id: string;
  /** Compact display name on map nodes */
  mapName: LocalizedText;
  /** Full authoritative canonical name */
  fullName: LocalizedText;
  /** Japanese reading (kana) */
  reading?: string;
  /** Local optimized portrait avatar path (`/avatars/<id>.webp`) */
  avatar: string;
  /** Factions this character belongs to (Tatewaku belongs to two!) */
  factions: FactionId[];
  /** Classic Social Map coordinates (center of node) */
  x: number;
  y: number;
  /** Pill width on the Classic Social Map */
  width?: number;
  /** Voice actor in CITY THE ANIMATION (2025) */
  cv?: LocalizedText;
  /** Affiliation / school / job title */
  role: LocalizedText;
  /** Official or iconic tagline */
  tagline?: LocalizedText;
  /** Rich character bio */
  bio: LocalizedText;
  /** Short comic badge (e.g. "#28", "11F", "CAT") */
  badge?: string;
  /** Featured on city-the-animation.com official character page */
  officialSite?: boolean;
  wikiUrl?: string;
  /** Extra search aliases (romaji, alternate translations, Nichijou cameo, etc.) */
  aliases?: string[];
}

export interface RelationEdge {
  id: string;
  from: string;
  to: string;
  /** Visual line style on Classic Map */
  type: RelationType;
  /** Semantic category for Ego/Network Radar & grouped Dossier */
  category: RelationCategory;
  bidirectional?: boolean;
  label?: LocalizedText;
  labelPos?: { x: number; y: number };
  points: [number, number][];
  story: LocalizedText;
  arrowEnd?: boolean;
  arrowStart?: boolean;
}

export interface ResourceCategory {
  id: string;
  title: LocalizedText;
  accent: string;
  items: {
    title: LocalizedText;
    description: LocalizedText;
    url: string;
    tag?: string;
  }[];
}
