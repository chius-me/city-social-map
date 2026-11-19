export type Locale = "zh" | "en" | "ja";

export interface LocalizedText {
  zh: string;
  en: string;
  ja: string;
}

export type RelationType = "children" | "friendship" | "employment" | "specific";

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
  /** Soft pastel fill for the zone on the map */
  fill: string;
  /** Stronger comic border/accent color */
  accent: string;
  /** Deep readable text color on the pastel fill */
  ink: string;
  /** SVG path string describing the zone shape (supports L-shapes!) */
  svgPath: string;
  /** Label anchor on the canvas */
  labelPos: { x: number; y: number; align?: "start" | "middle" | "end" };
  /** Camera bounding box for flying to this faction */
  bounds: { x: number; y: number; width: number; height: number };
  wikiUrl?: string;
}

export interface Character {
  id: string;
  /** Display name on the map pill (compact) */
  mapName: LocalizedText;
  /** Full canonical name for the dossier drawer */
  fullName: LocalizedText;
  /** Japanese furigana / reading */
  reading?: string;
  /** Factions this character belongs to (Tatewaku belongs to two!) */
  factions: FactionId[];
  /** Logical canvas coordinates (center of pill) */
  x: number;
  y: number;
  /** Optional custom minimum pill width override on the map */
  width?: number;
  /** Voice actor in CITY THE ANIMATION (2025) */
  cv?: LocalizedText;
  /** Affiliation / school / job title */
  role: LocalizedText;
  /** Official or iconic tagline */
  tagline?: LocalizedText;
  /** Rich character bio */
  bio: LocalizedText;
  /** Short comic badge (e.g. "#28", "11F", "CV", "猫") */
  badge?: string;
  /** Whether featured on city-the-animation.com official character page */
  officialSite?: boolean;
  wikiUrl?: string;
  /** Extra search aliases (romaji, nicknames, Nichijou cameo name, etc.) */
  aliases?: string[];
}

export interface RelationEdge {
  id: string;
  from: string;
  to: string;
  type: RelationType;
  bidirectional?: boolean;
  /** Label displayed on the map (for Specific & Agent) */
  label?: LocalizedText;
  /** Position of the floating pill label on the map */
  labelPos?: { x: number; y: number };
  /** Hand-crafted orthogonal waypoints [x, y][] from source edge to target edge */
  points: [number, number][];
  /** Optional smooth arc jump markers or notes */
  story: LocalizedText;
  /** If true, renders arrowhead at `to` end; default true for directed types */
  arrowEnd?: boolean;
  /** If true, renders arrowhead at `from` end */
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
