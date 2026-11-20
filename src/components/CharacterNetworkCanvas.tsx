import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Compass, Filter, Layers, Network, RotateCcw, Sparkles } from "lucide-react";
import type {
  Character,
  Faction,
  FactionId,
  Locale,
  RelationCategory,
  RelationEdge,
} from "../types";
import { CHARACTERS, CHARACTER_MAP } from "../data/characters";
import { FACTIONS, FACTION_MAP } from "../data/factions";
import { EDGES } from "../data/edges";
import { RELATION_CATEGORY_META, UI_TEXT, pickText } from "../data/i18n";
import type { MapCameraHandle } from "./SocialMapCanvas";
import type { PathResult } from "../utils/pathfinding";

export type NetworkSubMode = "ego" | "full";

const WORLD_W = 1860;
const WORLD_H = 1180;
const CX = WORLD_W / 2;
const CY = WORLD_H / 2 + 16;

const ALL_CATEGORIES: RelationCategory[] = [
  "family",
  "friendship",
  "romance",
  "work",
  "conflict",
  "admiration",
];

interface CharacterNetworkCanvasProps {
  locale: Locale;
  drawerOpen?: boolean;
  initialSubMode?: NetworkSubMode;
  egoCenterId: string;
  onChangeEgoCenter: (charId: string) => void;
  selectedCharacterId: string | null;
  selectedFactionId: FactionId | null;
  selectedEdgeId: string | null;
  activePath: PathResult | null;
  pathMode: boolean;
  pathStartId: string | null;
  pathEndId: string | null;
  onSelectCharacter: (char: Character) => void;
  onSelectFaction: (faction: Faction) => void;
  onSelectEdge: (edge: RelationEdge | null) => void;
  onClearSelection: () => void;
  cameraRef: React.RefObject<MapCameraHandle | null>;
}

interface PositionedNode {
  char: Character;
  x: number;
  y: number;
  r: number;
  ring: 0 | 1 | 2;
  degree: number;
  viaFaction?: boolean;
}

interface NetworkLink {
  id: string;
  from: string;
  to: string;
  edge?: RelationEdge;
  category: RelationCategory | "faction";
  color: string;
  label?: string;
  dashed?: boolean;
  bidirectional?: boolean;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  curveOffset: number;
  isSecondary?: boolean;
}

/** Pre-compute degree (number of explicit edges) for every resident */
const DEGREE_MAP: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (const c of CHARACTERS) map[c.id] = 0;
  for (const e of EDGES) {
    map[e.from] = (map[e.from] ?? 0) + 1;
    map[e.to] = (map[e.to] ?? 0) + 1;
  }
  return map;
})();

function getFullNodeRadius(charId: string): number {
  const d = DEGREE_MAP[charId] ?? 0;
  if (d >= 7) return 33;
  if (d >= 5) return 29;
  if (d >= 3) return 25;
  if (d >= 1) return 21;
  return 18;
}

/**
 * Deterministic faction-clustered force layout for all 65 characters (computed once).
 * Zero jitter, balanced faction zones, clear hubs, and John Lennon isolated in his corner!
 */
const FULL_NETWORK_POSITIONS: Record<string, { x: number; y: number }> = (() => {
  // Hand-tuned spacious faction cluster anchors in 1860x1180 world
  const factionCenters: Record<FactionId, { x: number; y: number }> = {
    "mont-blanc-trio": { x: 905, y: 540 },
    "adatara-family": { x: 545, y: 280 },
    "the-mob": { x: 245, y: 345 },
    "city-weekly": { x: 1015, y: 245 },
    "makabe-family": { x: 1390, y: 375 },
    "city-south-soccer": { x: 1525, y: 830 },
    "tanabe-mansion": { x: 965, y: 880 },
    "tekaridake-troupe": { x: 485, y: 865 },
  };

  const pos: Record<string, { x: number; y: number }> = {};
  const factionCounts: Record<string, number> = {};

  for (const c of CHARACTERS) {
    if (c.id === "john-lennon") {
      pos[c.id] = { x: 185, y: 920 };
      continue;
    }
    const primary = c.factions[0];
    if (primary) {
      const idx = factionCounts[primary] ?? 0;
      factionCounts[primary] = idx + 1;
      const anchor = factionCenters[primary];
      const angle = idx * 2.39996; // golden angle spiral
      const rad = 42 + Math.sqrt(idx) * 48;
      pos[c.id] = {
        x: anchor.x + Math.cos(angle) * rad,
        y: anchor.y + Math.sin(angle) * rad,
      };
    } else {
      // Independent residents start mapped from classic map coordinates scaled into world
      pos[c.id] = {
        x: 165 + (c.x / 1776) * (WORLD_W - 330),
        y: 145 + (c.y / 976) * (WORLD_H - 290),
      };
    }
  }

  // Deterministic relaxation iterations: spring attraction + faction gravity + generous non-overlap
  const ids = CHARACTERS.map((c) => c.id);
  const vel: Record<string, { vx: number; vy: number }> = {};
  for (const id of ids) vel[id] = { vx: 0, vy: 0 };

  for (let iter = 0; iter < 180; iter++) {
    const damping = 0.78;
    // 1. Pairwise repulsion & strict non-overlap (leaves clear room for nameplates!)
    for (let i = 0; i < ids.length; i++) {
      const idA = ids[i];
      if (idA === "john-lennon") continue;
      const pA = pos[idA];
      const rA = getFullNodeRadius(idA);
      for (let j = i + 1; j < ids.length; j++) {
        const idB = ids[j];
        if (idB === "john-lennon") continue;
        const pB = pos[idB];
        const rB = getFullNodeRadius(idB);
        let dx = pB.x - pA.x;
        let dy = pB.y - pA.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 0.01) {
          dx = 1;
          dy = 0.5;
          dist = 1.12;
        }
        const minDist = rA + rB + 48;
        if (dist < minDist) {
          const push = ((minDist - dist) / dist) * 0.52;
          vel[idA].vx -= dx * push;
          vel[idA].vy -= dy * push;
          vel[idB].vx += dx * push;
          vel[idB].vy += dy * push;
        } else if (dist < 280) {
          const rep = 620 / (dist * dist);
          vel[idA].vx -= (dx / dist) * rep;
          vel[idA].vy -= (dy / dist) * rep;
          vel[idB].vx += (dx / dist) * rep;
          vel[idB].vy += (dy / dist) * rep;
        }
      }
    }

    // 2. Edge springs
    for (const edge of EDGES) {
      const pA = pos[edge.from];
      const pB = pos[edge.to];
      if (!pA || !pB) continue;
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      const dist = Math.hypot(dx, dy) || 1;
      const target = 152;
      const force = (dist - target) * 0.011;
      vel[edge.from].vx += (dx / dist) * force;
      vel[edge.from].vy += (dy / dist) * force;
      vel[edge.to].vx -= (dx / dist) * force;
      vel[edge.to].vy -= (dy / dist) * force;
    }

    // 3. Gentle faction home gravity so clusters remain coherent & inside board
    for (const c of CHARACTERS) {
      if (c.id === "john-lennon") continue;
      const p = pos[c.id];
      const primary = c.factions[0];
      if (primary) {
        const anchor = factionCenters[primary];
        // Pull dual-faction Tatewaku gently toward Makabe-Soccer midpoint
        const tx =
          c.factions.length > 1
            ? (anchor.x * 0.72 + factionCenters[c.factions[1]].x * 0.28)
            : anchor.x;
        const ty =
          c.factions.length > 1
            ? (anchor.y * 0.72 + factionCenters[c.factions[1]].y * 0.28)
            : anchor.y;
        vel[c.id].vx += (tx - p.x) * 0.017;
        vel[c.id].vy += (ty - p.y) * 0.017;
      } else {
        vel[c.id].vx += (CX - p.x) * 0.004;
        vel[c.id].vy += (CY - p.y) * 0.004;
      }
    }

    // 4. Integrate & clamp safely inside drafting sheet bounds
    for (const id of ids) {
      if (id === "john-lennon") continue;
      vel[id].vx *= damping;
      vel[id].vy *= damping;
      pos[id].x = Math.max(115, Math.min(WORLD_W - 115, pos[id].x + vel[id].vx));
      pos[id].y = Math.max(135, Math.min(WORLD_H - 115, pos[id].y + vel[id].vy));
    }
  }

  return pos;
})();

/** Helper: compute quadratic Bézier path trimmed to circle borders + midpoint for label */
function computeCurvedEdgeGeometry(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  curveOffset: number
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;

  const ctrlX = (x1 + x2) / 2 + nx * curveOffset;
  const ctrlY = (y1 + y2) / 2 + ny * curveOffset;

  // Tangent from start to control point
  const sdx = ctrlX - x1;
  const sdy = ctrlY - y1;
  const sLen = Math.hypot(sdx, sdy) || 1;
  const sx = x1 + (sdx / sLen) * (r1 + 5);
  const sy = y1 + (sdy / sLen) * (r1 + 5);

  // Tangent from end to control point
  const edx = ctrlX - x2;
  const edy = ctrlY - y2;
  const eLen = Math.hypot(edx, edy) || 1;
  const ex = x2 + (edx / eLen) * (r2 + 8);
  const ey = y2 + (edy / eLen) * (r2 + 8);

  // Midpoint at t = 0.5 on quadratic Bézier
  const midX = 0.25 * sx + 0.5 * ctrlX + 0.25 * ex;
  const midY = 0.25 * sy + 0.5 * ctrlY + 0.25 * ey;

  return {
    d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
    midX,
    midY,
  };
}

export const CharacterNetworkCanvas: React.FC<CharacterNetworkCanvasProps> = ({
  locale,
  drawerOpen = false,
  initialSubMode = "ego",
  egoCenterId,
  onChangeEgoCenter,
  selectedCharacterId,
  selectedFactionId,
  selectedEdgeId,
  activePath,
  pathMode,
  pathStartId,
  pathEndId,
  onSelectCharacter,
  onSelectFaction,
  onSelectEdge,
  onClearSelection,
  cameraRef,
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const t = UI_TEXT[locale];

  const [subMode, setSubMode] = useState<NetworkSubMode>(initialSubMode);
  const [showRing2, setShowRing2] = useState(false);
  const [isolateSubgraph, setIsolateSubgraph] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<Record<RelationCategory, boolean>>({
    family: true,
    friendship: true,
    romance: true,
    work: true,
    conflict: true,
    admiration: true,
  });
  const [categoryBarOpen, setCategoryBarOpen] = useState(false);

  // Per-node custom drag offsets (cleared on Reset Layout or switching Ego center/mode)
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, { dx: number; dy: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 0.78 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [hoveredCharId, setHoveredCharId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const cameraStateRef = useRef(camera);
  cameraStateRef.current = camera;

  const panDragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const nodeDragRef = useRef<{
    active: boolean;
    moved: boolean;
    charId: string | null;
    startX: number;
    startY: number;
    origDx: number;
    origDy: number;
  }>({
    active: false,
    moved: false,
    charId: null,
    startX: 0,
    startY: 0,
    origDx: 0,
    origDy: 0,
  });

  const pinchRef = useRef({
    active: false,
    startDist: 0,
    startScale: 1,
    midX: 0,
    midY: 0,
    origX: 0,
    origY: 0,
  });

  // Reset custom dragged offsets when switching subMode or ego center
  useEffect(() => {
    setNodeOffsets({});
  }, [subMode, egoCenterId]);

  const clampScale = (s: number) => Math.max(0.28, Math.min(2.4, s));

  const computeFitTransform = useCallback(
    (mode: NetworkSubMode = subMode, ring2: boolean = showRing2) => {
      const el = viewportRef.current;
      if (!el) return { x: 0, y: 0, scale: 0.8 };
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const padTop = vw < 640 ? 124 : 120;
      const padBottom = vw < 640 ? 84 : 88;
      const padX = vw < 640 ? 18 : vw < 1200 ? 36 : 56;
      const effectiveW = vw >= 1024 && drawerOpen ? vw - 400 : vw;
      const availW = Math.max(200, effectiveW - padX * 2);
      const availH = Math.max(200, vh - padTop - padBottom);

      if (mode === "ego") {
        // Fit tightly around the active radar radius (inner ring ~660px diameter, outer ~980px)
        const spanW = ring2 ? 1040 : 760;
        const spanH = ring2 ? 960 : 700;
        const scale = clampScale(Math.min(availW / spanW, availH / spanH, 1.18));
        const targetCenterX = effectiveW * 0.5;
        const targetCenterY = padTop + availH * 0.5;
        return {
          x: targetCenterX - CX * scale,
          y: targetCenterY - CY * scale,
          scale,
        };
      }

      const scale = clampScale(Math.min(availW / WORLD_W, availH / WORLD_H));
      return {
        x: (effectiveW - WORLD_W * scale) / 2,
        y: padTop + (availH - WORLD_H * scale) / 2,
        scale,
      };
    },
    [drawerOpen, showRing2, subMode]
  );

  // Initial fit & refit when toggling subMode or Ring 2
  useEffect(() => {
    setIsAnimating(true);
    setCamera(computeFitTransform(subMode, showRing2));
  }, [subMode, showRing2, egoCenterId]); // eslint-disable-line react-hooks/exhaustive-deps

  const animateTo = useCallback((next: { x: number; y: number; scale: number }) => {
    setIsAnimating(true);
    setCamera(next);
  }, []);

  const zoomAtPoint = useCallback(
    (nextScaleRaw: number, clientX?: number, clientY?: number, smooth = true) => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cur = cameraStateRef.current;
      const nextScale = clampScale(nextScaleRaw);
      if (Math.abs(nextScale - cur.scale) < 0.001) return;

      const px = clientX !== undefined ? clientX - rect.left : rect.width / 2;
      const py = clientY !== undefined ? clientY - rect.top : rect.height / 2;
      const worldX = (px - cur.x) / cur.scale;
      const worldY = (py - cur.y) / cur.scale;

      setIsAnimating(smooth);
      setCamera({
        x: px - worldX * nextScale,
        y: py - worldY * nextScale,
        scale: nextScale,
      });
    },
    []
  );

  // Build layout graph (nodes & links) for current mode
  const egoChar = CHARACTER_MAP[egoCenterId] ?? CHARACTERS[0];

  const { nodes, links, ring1Radius, ring2Radius, ring2ExtraCount } = useMemo(() => {
    if (subMode === "ego") {
      const directEdges = EDGES.filter(
        (e) =>
          visibleCategories[e.category] && (e.from === egoChar.id || e.to === egoChar.id)
      );

      // Group direct edges by neighbor id (there may rarely be parallel edges)
      const neighborMap = new Map<string, RelationEdge[]>();
      for (const e of directEdges) {
        const otherId = e.from === egoChar.id ? e.to : e.from;
        const arr = neighborMap.get(otherId) ?? [];
        arr.push(e);
        neighborMap.set(otherId, arr);
      }

      // Same-faction teammates who don't already have an explicit direct edge
      const sameFactionChars =
        egoChar.factions.length > 0
          ? CHARACTERS.filter(
              (c) =>
                c.id !== egoChar.id &&
                !neighborMap.has(c.id) &&
                c.factions.some((f) => egoChar.factions.includes(f))
            )
          : [];

      // If character has ZERO explicit direct edges (e.g. CITY South Soccer teammates),
      // promote their same-faction teammates right onto Ring 1 so their radar is lively!
      const promoteFactionToRing1 = neighborMap.size === 0 && sameFactionChars.length > 0;

      // Sort Ring 1 entries by primary edge category for harmonious color sectors
      const ring1Ids = promoteFactionToRing1
        ? sameFactionChars.map((c) => c.id)
        : Array.from(neighborMap.keys()).sort((a, b) => {
            const catA = neighborMap.get(a)?.[0]?.category ?? "friendship";
            const catB = neighborMap.get(b)?.[0]?.category ?? "friendship";
            const diff = ALL_CATEGORIES.indexOf(catA) - ALL_CATEGORIES.indexOf(catB);
            if (diff !== 0) return diff;
            return (DEGREE_MAP[b] ?? 0) - (DEGREE_MAP[a] ?? 0);
          });

      const n1 = ring1Ids.length;
      const r1 = n1 > 10 ? 292 : n1 > 6 ? 266 : 244;
      const r2 = r1 + 158;

      const positioned: PositionedNode[] = [
        {
          char: egoChar,
          x: CX,
          y: CY,
          r: 50,
          ring: 0,
          degree: DEGREE_MAP[egoChar.id] ?? 0,
        },
      ];

      const angleByCharId = new Map<string, number>();

      ring1Ids.forEach((cid, idx) => {
        const char = CHARACTER_MAP[cid];
        if (!char) return;
        const angle = -Math.PI / 2 + (idx / Math.max(1, n1)) * Math.PI * 2;
        angleByCharId.set(cid, angle);
        const stagger = n1 >= 8 ? (idx % 2 === 0 ? -14 : 18) : 0;
        const rad = r1 + stagger;
        positioned.push({
          char,
          x: CX + Math.cos(angle) * rad,
          y: CY + Math.sin(angle) * rad,
          r: n1 > 10 ? 26 : 31,
          ring: 1,
          degree: DEGREE_MAP[cid] ?? 0,
          viaFaction: promoteFactionToRing1,
        });
      });

      const builtLinks: NetworkLink[] = [];

      if (promoteFactionToRing1) {
        const fac = egoChar.factions[0] ? FACTION_MAP[egoChar.factions[0]] : null;
        for (const cid of ring1Ids) {
          builtLinks.push({
            id: `fac-${egoChar.id}-${cid}`,
            from: egoChar.id,
            to: cid,
            category: "faction",
            color: fac?.accent ?? "#1395EA",
            label: fac ? pickText(fac.shortName, locale) : t.networkSameFaction,
            dashed: true,
            bidirectional: true,
            curveOffset: 14,
          });
        }
      } else {
        for (const edgeList of neighborMap.values()) {
          edgeList.forEach((edge, idx) => {
            const catMeta = RELATION_CATEGORY_META[edge.category];
            const spread = edgeList.length > 1 ? (idx === 0 ? -34 : 34) : 22;
            builtLinks.push({
              id: edge.id,
              from: edge.from,
              to: edge.to,
              edge,
              category: edge.category,
              color: catMeta.color,
              label: edge.label
                ? pickText(edge.label, locale)
                : t.relationCategories[edge.category],
              dashed: edge.type === "friendship" || edge.type === "employment",
              bidirectional: edge.bidirectional || edge.type === "friendship",
              arrowStart: edge.arrowStart,
              arrowEnd:
                edge.arrowEnd !== undefined
                  ? edge.arrowEnd
                  : !(edge.bidirectional || edge.type === "friendship"),
              curveOffset: spread,
            });
          });
        }
      }

      // Collect Ring 2 candidates: remaining same-faction teammates + 2nd-hop explicit neighbors
      const ring1Set = new Set([egoChar.id, ...ring1Ids]);
      const ring2Candidates: {
        char: Character;
        parentId: string;
        edge?: RelationEdge;
        isSameFaction: boolean;
      }[] = [];
      const seenR2 = new Set<string>();

      if (!promoteFactionToRing1) {
        for (const fc of sameFactionChars) {
          if (seenR2.has(fc.id)) continue;
          seenR2.add(fc.id);
          ring2Candidates.push({ char: fc, parentId: egoChar.id, isSameFaction: true });
        }
      }

      for (const r1Id of ring1Ids) {
        for (const e of EDGES) {
          if (!visibleCategories[e.category]) continue;
          const otherId = e.from === r1Id ? e.to : e.to === r1Id ? e.from : null;
          if (!otherId || ring1Set.has(otherId) || seenR2.has(otherId)) continue;
          const char = CHARACTER_MAP[otherId];
          if (!char) continue;
          seenR2.add(otherId);
          ring2Candidates.push({
            char,
            parentId: r1Id,
            edge: e,
            isSameFaction: false,
          });
        }
      }

      const cappedR2 = ring2Candidates.slice(0, 18);

      if (showRing2 && cappedR2.length > 0) {
        // Place Ring 2 nodes evenly around outer circle, sorted by their parent's angle
        const sortedR2 = [...cappedR2].sort((a, b) => {
          const angA = angleByCharId.get(a.parentId) ?? -Math.PI / 2;
          const angB = angleByCharId.get(b.parentId) ?? -Math.PI / 2;
          return angA - angB;
        });

        sortedR2.forEach((item, idx) => {
          const angle = -Math.PI / 2 + ((idx + 0.5) / sortedR2.length) * Math.PI * 2;
          positioned.push({
            char: item.char,
            x: CX + Math.cos(angle) * r2,
            y: CY + Math.sin(angle) * r2,
            r: 22,
            ring: 2,
            degree: DEGREE_MAP[item.char.id] ?? 0,
            viaFaction: item.isSameFaction,
          });

          if (item.edge) {
            const catMeta = RELATION_CATEGORY_META[item.edge.category];
            builtLinks.push({
              id: `r2-${item.edge.id}`,
              from: item.edge.from,
              to: item.edge.to,
              edge: item.edge,
              category: item.edge.category,
              color: catMeta.color,
              dashed: true,
              curveOffset: 16,
              isSecondary: true,
            });
          } else {
            const fac = egoChar.factions[0] ? FACTION_MAP[egoChar.factions[0]] : null;
            builtLinks.push({
              id: `r2-fac-${egoChar.id}-${item.char.id}`,
              from: egoChar.id,
              to: item.char.id,
              category: "faction",
              color: fac?.accent ?? "#8A8A9C",
              dashed: true,
              curveOffset: 18,
              isSecondary: true,
            });
          }
        });
      }

      return {
        nodes: positioned,
        links: builtLinks,
        ring1Radius: r1,
        ring2Radius: r2,
        ring2ExtraCount: cappedR2.length,
      };
    }

    // FULL NETWORK MODE: all 65 residents sized by connection degree
    const positioned: PositionedNode[] = CHARACTERS.map((char) => {
      const p = FULL_NETWORK_POSITIONS[char.id] ?? { x: CX, y: CY };
      return {
        char,
        x: p.x,
        y: p.y,
        r: getFullNodeRadius(char.id),
        ring: char.id === egoCenterId ? 0 : 1,
        degree: DEGREE_MAP[char.id] ?? 0,
      };
    });

    const builtLinks: NetworkLink[] = EDGES.filter((e) => visibleCategories[e.category]).map(
      (edge) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        edge,
        category: edge.category,
        color: RELATION_CATEGORY_META[edge.category].color,
        label: edge.label ? pickText(edge.label, locale) : undefined,
        dashed: edge.type === "friendship" || edge.type === "employment",
        bidirectional: edge.bidirectional || edge.type === "friendship",
        arrowStart: edge.arrowStart,
        arrowEnd:
          edge.arrowEnd !== undefined
            ? edge.arrowEnd
            : !(edge.bidirectional || edge.type === "friendship"),
        curveOffset: 16,
      })
    );

    return {
      nodes: positioned,
      links: builtLinks,
      ring1Radius: 244,
      ring2Radius: 400,
      ring2ExtraCount: 0,
    };
  }, [egoChar, egoCenterId, locale, showRing2, subMode, t, visibleCategories]);

  // Resolved live positions (base position + custom user drag offset)
  const resolvedPosMap = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    for (const n of nodes) {
      const off = nodeOffsets[n.char.id];
      map.set(n.char.id, {
        ...n,
        x: n.x + (off?.dx ?? 0),
        y: n.y + (off?.dy ?? 0),
      });
    }
    return map;
  }, [nodeOffsets, nodes]);

  // Faction cluster centroid bubbles for Full Network mode (based on primary faction so overlap members don't inflate radius!)
  const fullFactionClouds = useMemo(() => {
    if (subMode !== "full") return [];
    return FACTIONS.map((fac) => {
      const members = nodes
        .filter((n) => n.char.factions[0] === fac.id)
        .map((n) => resolvedPosMap.get(n.char.id)!)
        .filter(Boolean);
      if (members.length === 0) return null;
      const avgX = members.reduce((s, m) => s + m.x, 0) / members.length;
      const avgY = members.reduce((s, m) => s + m.y, 0) / members.length;
      const maxDist = Math.max(
        78,
        ...members.map((m) => Math.hypot(m.x - avgX, m.y - avgY) + m.r + 32)
      );
      return { faction: fac, cx: avgX, cy: avgY, r: maxDist };
    }).filter((x): x is { faction: Faction; cx: number; cy: number; r: number } => Boolean(x));
  }, [nodes, resolvedPosMap, subMode]);

  // Imperative camera API shared with App & BottomControls
  useImperativeHandle(
    cameraRef,
    () => ({
      zoomIn: () => zoomAtPoint(cameraStateRef.current.scale * 1.22, undefined, undefined, true),
      zoomOut: () => zoomAtPoint(cameraStateRef.current.scale / 1.22, undefined, undefined, true),
      resetView: () => animateTo(computeFitTransform(subMode, showRing2)),
      flyToPoint: (_wx: number, _wy: number, targetScale = 1.15) => {
        // If a character is selected, fly to their live network coordinates!
        const targetChar = selectedCharacterId
          ? resolvedPosMap.get(selectedCharacterId)
          : resolvedPosMap.get(egoCenterId);
        const el = viewportRef.current;
        if (!el || !targetChar) return;
        const vw = el.clientWidth;
        const vh = el.clientHeight;
        const centerX = vw >= 1024 && drawerOpen ? (vw - 400) / 2 : vw * 0.5;
        const centerY = vw < 640 && drawerOpen ? vh * 0.24 : vh * 0.5;
        const s = clampScale(vw < 640 ? Math.min(targetScale, 0.95) : targetScale);
        animateTo({
          x: centerX - targetChar.x * s,
          y: centerY - targetChar.y * s,
          scale: s,
        });
      },
      flyToBounds: () => {
        if (subMode === "ego") {
          setSubMode("full");
        }
        animateTo(computeFitTransform("full", showRing2));
      },
    }),
    [
      animateTo,
      computeFitTransform,
      drawerOpen,
      egoCenterId,
      resolvedPosMap,
      selectedCharacterId,
      showRing2,
      subMode,
      zoomAtPoint,
    ]
  );

  // Wheel zoom toward cursor
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.ctrlKey
        ? Math.exp(-e.deltaY * 0.01)
        : Math.exp(-e.deltaY * 0.0018);
      zoomAtPoint(cameraStateRef.current.scale * factor, e.clientX, e.clientY, false);
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [zoomAtPoint]);

  // Global mouse move / up for both canvas pan & node dragging
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (nodeDragRef.current.active && nodeDragRef.current.charId) {
        const dxScreen = e.clientX - nodeDragRef.current.startX;
        const dyScreen = e.clientY - nodeDragRef.current.startY;
        if (Math.hypot(dxScreen, dyScreen) > 5) {
          nodeDragRef.current.moved = true;
        }
        const scale = cameraStateRef.current.scale || 1;
        const cid = nodeDragRef.current.charId;
        setNodeOffsets((prev) => ({
          ...prev,
          [cid]: {
            dx: nodeDragRef.current.origDx + dxScreen / scale,
            dy: nodeDragRef.current.origDy + dyScreen / scale,
          },
        }));
        return;
      }

      if (!panDragRef.current.active) return;
      const dx = e.clientX - panDragRef.current.startX;
      const dy = e.clientY - panDragRef.current.startY;
      if (Math.hypot(dx, dy) > 5) {
        panDragRef.current.moved = true;
      }
      setCamera((prev) => ({
        ...prev,
        x: panDragRef.current.origX + dx,
        y: panDragRef.current.origY + dy,
      }));
    };

    const onUp = () => {
      if (nodeDragRef.current.active) {
        nodeDragRef.current.active = false;
        setDraggingNodeId(null);
      }
      if (panDragRef.current.active) {
        panDragRef.current.active = false;
        setIsPanning(false);
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsAnimating(false);
    setIsPanning(true);
    panDragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origX: cameraStateRef.current.x,
      origY: cameraStateRef.current.y,
    };
  };

  const handleNodeMouseDown = (e: React.MouseEvent, charId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setIsAnimating(false);
    setDraggingNodeId(charId);
    const existing = nodeOffsets[charId] ?? { dx: 0, dy: 0 };
    nodeDragRef.current = {
      active: true,
      moved: false,
      charId,
      startX: e.clientX,
      startY: e.clientY,
      origDx: existing.dx,
      origDy: existing.dy,
    };
  };

  // Touch pan & pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsAnimating(false);
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      panDragRef.current = {
        active: true,
        moved: false,
        startX: touch.clientX,
        startY: touch.clientY,
        origX: cameraStateRef.current.x,
        origY: cameraStateRef.current.y,
      };
      pinchRef.current.active = false;
    } else if (e.touches.length === 2) {
      panDragRef.current.active = false;
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const rect = viewportRef.current?.getBoundingClientRect();
      pinchRef.current = {
        active: true,
        startDist: dist,
        startScale: cameraStateRef.current.scale,
        midX: (t0.clientX + t1.clientX) / 2 - (rect?.left ?? 0),
        midY: (t0.clientY + t1.clientY) / 2 - (rect?.top ?? 0),
        origX: cameraStateRef.current.x,
        origY: cameraStateRef.current.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && panDragRef.current.active) {
      const touch = e.touches[0];
      const dx = touch.clientX - panDragRef.current.startX;
      const dy = touch.clientY - panDragRef.current.startY;
      if (Math.hypot(dx, dy) > 6) panDragRef.current.moved = true;
      setCamera((prev) => ({
        ...prev,
        x: panDragRef.current.origX + dx,
        y: panDragRef.current.origY + dy,
      }));
    } else if (e.touches.length === 2 && pinchRef.current.active) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const nextScale = clampScale(
        pinchRef.current.startScale * (dist / pinchRef.current.startDist)
      );
      const worldX = (pinchRef.current.midX - pinchRef.current.origX) / pinchRef.current.startScale;
      const worldY = (pinchRef.current.midY - pinchRef.current.origY) / pinchRef.current.startScale;
      setCamera({
        x: pinchRef.current.midX - worldX * nextScale,
        y: pinchRef.current.midY - worldY * nextScale,
        scale: nextScale,
      });
    }
  };

  const handleTouchEnd = () => {
    panDragRef.current.active = false;
    pinchRef.current.active = false;
  };

  // Spotlight calculation (Hover > Path Mode > Selected Edge > Full Mode Isolate / Selection)
  const spotlight = useMemo(() => {
    if (pathMode && activePath?.found && activePath.nodes.length > 0) {
      const nodeSet = new Set<string>(activePath.nodes);
      const edgeSet = new Set<string>();
      for (const s of activePath.steps) {
        if (s.edge) edgeSet.add(s.edge.id);
      }
      return { active: true, nodes: nodeSet, edges: edgeSet, mode: "path" as const };
    }

    if (hoveredEdgeId) {
      const lk = links.find((l) => l.id === hoveredEdgeId || l.edge?.id === hoveredEdgeId);
      if (lk) {
        return {
          active: true,
          nodes: new Set([lk.from, lk.to]),
          edges: new Set([lk.id]),
          mode: "edge" as const,
        };
      }
    }

    if (hoveredCharId) {
      const nodeSet = new Set([hoveredCharId]);
      const edgeSet = new Set<string>();
      for (const lk of links) {
        if (lk.from === hoveredCharId || lk.to === hoveredCharId) {
          edgeSet.add(lk.id);
          nodeSet.add(lk.from);
          nodeSet.add(lk.to);
        }
      }
      return { active: true, nodes: nodeSet, edges: edgeSet, mode: "char" as const };
    }

    if (selectedEdgeId) {
      const lk = links.find((l) => l.edge?.id === selectedEdgeId || l.id === selectedEdgeId);
      if (lk) {
        return {
          active: true,
          nodes: new Set([lk.from, lk.to]),
          edges: new Set([lk.id]),
          mode: "edge" as const,
        };
      }
    }

    if (subMode === "full" && selectedFactionId) {
      const nodeSet = new Set(
        CHARACTERS.filter((c) => c.factions.includes(selectedFactionId)).map((c) => c.id)
      );
      const edgeSet = new Set<string>();
      for (const lk of links) {
        if (nodeSet.has(lk.from) || nodeSet.has(lk.to)) edgeSet.add(lk.id);
      }
      return { active: true, nodes: nodeSet, edges: edgeSet, mode: "faction" as const };
    }

    if (subMode === "full" && (selectedCharacterId || isolateSubgraph)) {
      const focusId = selectedCharacterId ?? egoCenterId;
      const nodeSet = new Set([focusId]);
      const edgeSet = new Set<string>();
      for (const lk of links) {
        if (lk.from === focusId || lk.to === focusId) {
          edgeSet.add(lk.id);
          nodeSet.add(lk.from);
          nodeSet.add(lk.to);
        }
      }
      return { active: true, nodes: nodeSet, edges: edgeSet, mode: "char" as const };
    }

    return {
      active: false,
      nodes: new Set<string>(),
      edges: new Set<string>(),
      mode: "none" as const,
    };
  }, [
    activePath,
    egoCenterId,
    hoveredCharId,
    hoveredEdgeId,
    isolateSubgraph,
    links,
    pathMode,
    selectedCharacterId,
    selectedEdgeId,
    selectedFactionId,
    subMode,
  ]);

  const activeEdgeObject = useMemo(() => {
    const id = hoveredEdgeId ?? selectedEdgeId;
    if (!id) return null;
    const direct = EDGES.find((e) => e.id === id);
    if (direct) return direct;
    if (id.startsWith("r2-")) {
      return EDGES.find((e) => e.id === id.slice(3)) ?? null;
    }
    return null;
  }, [hoveredEdgeId, selectedEdgeId]);

  const hasDraggedNodes = Object.keys(nodeOffsets).length > 0;
  const activeCatCount = ALL_CATEGORIES.filter((c) => visibleCategories[c]).length;

  const handleToggleCategory = (cat: RelationCategory) => {
    setVisibleCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div
      ref={viewportRef}
      className={`relative w-full h-full overflow-hidden select-none city-confetti-bg ${
        draggingNodeId ? "cursor-grabbing" : isPanning ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={handleCanvasMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (panDragRef.current.moved || nodeDragRef.current.moved) return;
        onClearSelection();
      }}
      style={{ touchAction: "none" }}
    >
      {/* Floating Comic Sub-Mode & Category Filter Control Bar (top-center) */}
      <div
        className={`fixed top-[74px] sm:top-[72px] -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-1.5 max-w-[calc(100vw-1rem)] transition-[left] duration-300 ${
          drawerOpen ? "left-1/2 lg:left-[calc(50%-200px)]" : "left-1/2"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl sm:rounded-full city-ink-card-sm flex items-center gap-1.5 flex-wrap justify-center">
          {/* Sub-mode switch: Ego Radar vs Full Network */}
          <div className="flex items-center bg-[#F4F3EE] p-0.5 rounded-full border-[1.5px] border-[#141419]">
            <button
              type="button"
              onClick={() => setSubMode("ego")}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
                subMode === "ego"
                  ? "bg-[#141419] text-[#F7B647]"
                  : "text-[#141419] hover:bg-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.networkEgoMode}</span>
            </button>
            <button
              type="button"
              onClick={() => setSubMode("full")}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
                subMode === "full"
                  ? "bg-[#141419] text-[#99CB77]"
                  : "text-[#141419] hover:bg-white"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>{t.networkFullMode}</span>
            </button>
          </div>

          {/* Mode-specific toggle */}
          {subMode === "ego" && ring2ExtraCount > 0 && (
            <button
              type="button"
              onClick={() => setShowRing2((v) => !v)}
              className={`px-2.5 py-1 rounded-full border-[1.5px] border-[#141419] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
                showRing2
                  ? "bg-[#C4E4F5] text-[#141419]"
                  : "bg-white text-[#141419] hover:bg-[#FFF6E0]"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">{t.networkRing2On}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#141419] text-white text-[9.5px]">
                +{ring2ExtraCount}
              </span>
            </button>
          )}

          {subMode === "full" && (
            <button
              type="button"
              onClick={() => setIsolateSubgraph((v) => !v)}
              className={`px-2.5 py-1 rounded-full border-[1.5px] border-[#141419] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
                isolateSubgraph
                  ? "bg-[#F09CB4] text-[#141419]"
                  : "bg-white text-[#141419] hover:bg-[#FFF6E0]"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{t.networkIsolate}</span>
            </button>
          )}

          {/* Semantic 6-category relation filter popover toggle */}
          <button
            type="button"
            onClick={() => setCategoryBarOpen((v) => !v)}
            className={`px-2.5 py-1 rounded-full border-[1.5px] border-[#141419] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
              categoryBarOpen || activeCatCount < 6
                ? "bg-[#F7B647] text-[#141419]"
                : "bg-white text-[#141419] hover:bg-[#FFF6E0]"
            }`}
          >
            <Filter className="w-3 h-3" />
            <span className="hidden md:inline">
              {locale === "zh" ? "关系分类" : locale === "ja" ? "関係フィルタ" : "Categories"}
            </span>
            <span className="text-[10px] font-black">{activeCatCount}/6</span>
          </button>

          {/* Reset dragged layout button */}
          {hasDraggedNodes && (
            <button
              type="button"
              onClick={() => setNodeOffsets({})}
              className="px-2.5 py-1 rounded-full border-[1.5px] border-[#141419] bg-[#EE847D] text-[#141419] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer hover:opacity-90"
              title={t.networkResetNodes}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">{t.networkResetNodes}</span>
            </button>
          )}
        </div>

        {/* Collapsible 6-category semantic filter ribbon */}
        {categoryBarOpen && (
          <div className="bg-white/96 backdrop-blur-md px-2.5 py-2 rounded-2xl city-ink-card-sm flex flex-wrap items-center justify-center gap-1.5">
            {ALL_CATEGORIES.map((cat) => {
              const meta = RELATION_CATEGORY_META[cat];
              const active = visibleCategories[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleToggleCategory(cat)}
                  style={{
                    backgroundColor: active ? meta.bg : "#F3F3F5",
                    borderColor: active ? "#141419" : "#D1D1DA",
                  }}
                  className={`px-2.5 py-1 rounded-full border-[1.5px] text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    active ? "text-[#141419]" : "text-[#8E8E9E] line-through"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-[#141419] shrink-0"
                    style={{ backgroundColor: active ? meta.color : "#C2C2CC" }}
                  />
                  <span>{pickText(meta.label, locale)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tiny helper hint pill on desktop */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/82 border border-[#141419]/15 text-[10.5px] font-bold text-[#5A5A6A]">
          <span>{subMode === "ego" ? t.networkHintEgo : t.networkHintFull}</span>
        </div>
      </div>

      {/* Transformed SVG World */}
      <div
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{
          width: WORLD_W,
          height: WORLD_H,
          transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`,
          transition: isAnimating
            ? "transform 580ms cubic-bezier(0.65, 0.05, 0.36, 1)"
            : "none",
        }}
        onTransitionEnd={() => setIsAnimating(false)}
      >
        <svg
          width={WORLD_W}
          height={WORLD_H}
          viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
          className="block overflow-visible"
        >
          <defs>
            {/* Universal circular objectBoundingBox clip for crisp square avatars */}
            <clipPath id="net-avatar-circle" clipPathUnits="objectBoundingBox">
              <circle cx="0.5" cy="0.5" r="0.5" />
            </clipPath>

            {/* Colored arrowheads for each RelationCategory + faction */}
            {ALL_CATEGORIES.map((cat) => (
              <marker
                key={`mk-${cat}`}
                id={`net-arrow-${cat}`}
                viewBox="0 0 14 14"
                refX="10.5"
                refY="7"
                markerWidth="9"
                markerHeight="9"
                orient="auto-start-reverse"
              >
                <path
                  d="M 1.5 2 L 11.8 7 L 1.5 12 Z"
                  fill={RELATION_CATEGORY_META[cat].color}
                />
              </marker>
            ))}
            <marker
              id="net-arrow-path"
              viewBox="0 0 14 14"
              refX="10.5"
              refY="7"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <path d="M 1.5 2 L 11.8 7 L 1.5 12 Z" fill="#DD5549" />
            </marker>
          </defs>

          {/* ============================================================== */}
          {/* LAYER 1: RADAR GUIDES (EGO) OR FACTION CLOUDS (FULL NETWORK)   */}
          {/* ============================================================== */}
          {subMode === "ego" ? (
            <g className="radar-guides" pointerEvents="none">
              {/* Outer soft comic halo */}
              <circle
                cx={CX}
                cy={CY}
                r={ring1Radius}
                fill="rgba(255, 253, 249, 0.72)"
                stroke="#141419"
                strokeOpacity="0.18"
                strokeWidth="2.2"
                strokeDasharray="8 8"
              />
              {showRing2 && ring2ExtraCount > 0 && (
                <circle
                  cx={CX}
                  cy={CY}
                  r={ring2Radius}
                  fill="none"
                  stroke="#141419"
                  strokeOpacity="0.14"
                  strokeWidth="2"
                  strokeDasharray="5 9"
                />
              )}
              {/* Inner decorative compass ticks */}
              <circle
                cx={CX}
                cy={CY}
                r={118}
                fill="none"
                stroke="#F7B647"
                strokeOpacity="0.32"
                strokeWidth="1.8"
                strokeDasharray="3 7"
              />
              {/* Subtle radar crosshairs */}
              <line
                x1={CX - ring1Radius - 32}
                y1={CY}
                x2={CX + ring1Radius + 32}
                y2={CY}
                stroke="#141419"
                strokeOpacity="0.06"
                strokeWidth="1.5"
              />
              <line
                x1={CX}
                y1={CY - ring1Radius - 32}
                x2={CX}
                y2={CY + ring1Radius + 32}
                stroke="#141419"
                strokeOpacity="0.06"
                strokeWidth="1.5"
              />

              {/* John Lennon Solo Easter Egg Banner in Ego Radar */}
              {egoChar.id === "john-lennon" && (
                <g transform={`translate(${CX}, ${CY + 148})`}>
                  <rect
                    x="-220"
                    y="-26"
                    width="440"
                    height="52"
                    rx="18"
                    fill="#33333F"
                    stroke="#141419"
                    strokeWidth="2.5"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fontSize="13.5"
                    fontWeight="800"
                    fill="#F7B647"
                  >
                    {t.johnLennonEasterEgg.slice(0, 44)}
                  </text>
                </g>
              )}
            </g>
          ) : (
            <g className="full-faction-clouds">
              {/* Warm drafting sheet backdrop */}
              <rect
                x="24"
                y="42"
                width={WORLD_W - 48}
                height={WORLD_H - 66}
                rx="32"
                fill="rgba(255, 253, 249, 0.82)"
                stroke="#141419"
                strokeWidth="3"
              />
              {fullFactionClouds.map(({ faction, cx, cy, r }) => {
                const isSelectedFac = selectedFactionId === faction.id;
                const dimmed =
                  isolateSubgraph ||
                  (spotlight.active && spotlight.mode === "faction" && !isSelectedFac);
                return (
                  <g
                    key={`cloud-${faction.id}`}
                    style={{
                      opacity: dimmed ? 0.22 : 1,
                      transition: "opacity 220ms ease",
                    }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={faction.fill}
                      fillOpacity={0.55}
                      stroke={isSelectedFac ? "#141419" : faction.accent}
                      strokeWidth={isSelectedFac ? 3 : 2}
                      strokeDasharray="7 6"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!panDragRef.current.moved) onSelectFaction(faction);
                      }}
                    />
                    {(() => {
                      const fLabel = pickText(faction.shortName, locale);
                      const units = Array.from(fLabel).reduce(
                        (a, ch) => a + (ch.charCodeAt(0) > 255 ? 1.05 : 0.6),
                        0
                      );
                      const pw = Math.max(76, Math.ceil(units * 13 + 22));
                      return (
                        <g
                          transform={`translate(${cx.toFixed(1)}, ${(cy - r + 4).toFixed(1)})`}
                          pointerEvents="none"
                        >
                          <rect
                            x={-pw / 2}
                            y="-12"
                            width={pw}
                            height="24"
                            rx="12"
                            fill="#FFFDF9"
                            stroke={faction.accent}
                            strokeWidth="2"
                          />
                          <text
                            x="0"
                            y="4.5"
                            textAnchor="middle"
                            fontSize="12.5"
                            fontWeight="900"
                            fill={faction.ink}
                          >
                            {fLabel}
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                );
              })}
            </g>
          )}

          {/* ============================================================== */}
          {/* LAYER 2: CURVED COLOR-CODED RELATIONSHIP LINKS                 */}
          {/* ============================================================== */}
          <g className="network-links">
            {links.map((lk) => {
              const pA = resolvedPosMap.get(lk.from);
              const pB = resolvedPosMap.get(lk.to);
              if (!pA || !pB) return null;

              const isHighlighted = spotlight.edges.has(lk.id);
              const isPathEdge = spotlight.mode === "path" && isHighlighted;
              const isDimmed = spotlight.active && !isHighlighted;

              if (subMode === "full" && isolateSubgraph && isDimmed) {
                return null;
              }

              const { d } = computeCurvedEdgeGeometry(
                pA.x,
                pA.y,
                pA.r,
                pB.x,
                pB.y,
                pB.r,
                lk.curveOffset
              );

              const strokeColor = isPathEdge ? "#DD5549" : lk.color;
              const strokeWidth = isPathEdge
                ? 4.6
                : isHighlighted
                ? 4
                : lk.isSecondary
                ? 2.2
                : subMode === "ego"
                ? 3.2
                : 2.2;

              const markerEnd =
                lk.arrowEnd && lk.category !== "faction"
                  ? isPathEdge
                    ? "url(#net-arrow-path)"
                    : `url(#net-arrow-${lk.category})`
                  : undefined;

              const markerStart =
                lk.arrowStart && lk.category !== "faction"
                  ? isPathEdge
                    ? "url(#net-arrow-path)"
                    : `url(#net-arrow-${lk.category})`
                  : undefined;

              return (
                <g
                  key={lk.id}
                  style={{
                    opacity: isDimmed ? 0.1 : lk.isSecondary ? 0.58 : 0.92,
                    transition: "opacity 200ms ease",
                  }}
                >
                  {(isHighlighted || subMode === "ego") && !lk.isSecondary && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#FFFDF9"
                      strokeWidth={strokeWidth + 4}
                      strokeLinecap="round"
                      pointerEvents="none"
                    />
                  )}
                  <path
                    d={d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={lk.dashed ? "8 6" : undefined}
                    strokeLinecap="round"
                    markerEnd={markerEnd}
                    markerStart={markerStart}
                    pointerEvents="none"
                  />
                  {isHighlighted && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeOpacity="0.65"
                      strokeWidth="2"
                      strokeDasharray="6 14"
                      strokeLinecap="round"
                      className="edge-animated-flow"
                      pointerEvents="none"
                    />
                  )}
                  {lk.edge && (
                    <path
                      d={d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredEdgeId(lk.id)}
                      onMouseLeave={() =>
                        setHoveredEdgeId((prev) => (prev === lk.id ? null : prev))
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (panDragRef.current.moved) return;
                        onSelectEdge(lk.edge ?? null);
                      }}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* ============================================================== */}
          {/* LAYER 3: FLOATING RELATION PILL LABELS (EGO & HIGHLIGHTED FULL)*/}
          {/* ============================================================== */}
          <g className="network-edge-labels">
            {links.map((lk) => {
              if (!lk.label || lk.isSecondary) return null;
              const isHighlighted = spotlight.edges.has(lk.id);
              // In Full Network mode, show edge labels only on highlighted edges to stay clean!
              if (subMode === "full" && !isHighlighted) return null;

              const pA = resolvedPosMap.get(lk.from);
              const pB = resolvedPosMap.get(lk.to);
              if (!pA || !pB) return null;

              const { midX, midY } = computeCurvedEdgeGeometry(
                pA.x,
                pA.y,
                pA.r,
                pB.x,
                pB.y,
                pB.r,
                lk.curveOffset
              );
              const isDimmed = spotlight.active && !isHighlighted;
              const approxUnits = Array.from(lk.label).reduce(
                (acc, ch) => acc + (ch.charCodeAt(0) > 255 ? 1.05 : 0.58),
                0
              );
              const pillW = Math.max(46, Math.ceil(approxUnits * 11 + 20));

              return (
                <g
                  key={`lbl-${lk.id}`}
                  transform={`translate(${midX.toFixed(1)}, ${midY.toFixed(1)})`}
                  className={lk.edge ? "cursor-pointer" : "pointer-events-none"}
                  style={{
                    opacity: isDimmed ? 0.14 : 1,
                    transition: "opacity 200ms ease",
                  }}
                  onMouseEnter={() => lk.edge && setHoveredEdgeId(lk.id)}
                  onMouseLeave={() =>
                    setHoveredEdgeId((prev) => (prev === lk.id ? null : prev))
                  }
                  onClick={(e) => {
                    if (!lk.edge) return;
                    e.stopPropagation();
                    if (panDragRef.current.moved) return;
                    onSelectEdge(lk.edge);
                  }}
                >
                  <rect
                    x={-pillW / 2}
                    y="-11.5"
                    width={pillW}
                    height="23"
                    rx="11.5"
                    fill={isHighlighted ? "#141419" : "#FFFFFF"}
                    stroke={isHighlighted ? lk.color : "#141419"}
                    strokeWidth={isHighlighted ? 2.4 : 1.8}
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fill={isHighlighted ? "#F7B647" : lk.color}
                  >
                    {lk.label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ============================================================== */}
          {/* LAYER 4: CIRCULAR PORTRAIT NODES (DRAGGABLE!)                  */}
          {/* ============================================================== */}
          <g className="network-nodes">
            {nodes.map((baseNode) => {
              const node = resolvedPosMap.get(baseNode.char.id) ?? baseNode;
              const { char, x, y, r, ring } = node;
              const name = pickText(char.mapName, locale);
              const badge = char.badge;

              const isCenter = subMode === "ego" && ring === 0;
              const isSelected = selectedCharacterId === char.id;
              const isHovered = hoveredCharId === char.id;
              const isPathStart = pathMode && pathStartId === char.id;
              const isPathEnd = pathMode && pathEndId === char.id;
              const isHighlighted =
                isCenter ||
                isSelected ||
                isHovered ||
                isPathStart ||
                isPathEnd ||
                spotlight.nodes.has(char.id);
              const isDimmed = spotlight.active && !isHighlighted;

              if (subMode === "full" && isolateSubgraph && isDimmed) {
                return null;
              }

              const primaryFac = char.factions[0] ? FACTION_MAP[char.factions[0]] : null;
              const secondaryFac = char.factions[1] ? FACTION_MAP[char.factions[1]] : null;
              const ringColor = isPathStart
                ? "#F7B647"
                : isPathEnd
                ? "#F09CB4"
                : primaryFac?.accent ?? "#1395EA";

              const approxUnits = Array.from(name).reduce(
                (acc, ch) => acc + (ch.charCodeAt(0) > 255 ? 1.05 : 0.6),
                0
              );
              const labelFont = isCenter ? 13.5 : ring === 2 ? 10.5 : 11.5;
              const labelW = Math.max(58, Math.ceil(approxUnits * labelFont + 18));
              const labelH = isCenter ? 26 : 22;

              return (
                <g
                  key={char.id}
                  transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)})`}
                  className={draggingNodeId === char.id ? "cursor-grabbing" : "cursor-pointer"}
                  style={{
                    opacity: isDimmed ? 0.16 : ring === 2 && !isHovered ? 0.88 : 1,
                    transition: draggingNodeId === char.id ? "none" : "opacity 200ms ease",
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, char.id)}
                  onMouseEnter={() => setHoveredCharId(char.id)}
                  onMouseLeave={() =>
                    setHoveredCharId((prev) => (prev === char.id ? null : prev))
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (nodeDragRef.current.moved || panDragRef.current.moved) return;
                    if (subMode === "ego" && char.id !== egoCenterId && !pathMode) {
                      onChangeEgoCenter(char.id);
                    }
                    onSelectCharacter(char);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (subMode === "full") {
                      onChangeEgoCenter(char.id);
                      setSubMode("ego");
                      onSelectCharacter(char);
                    }
                  }}
                >
                  {/* Iconic 4-color C-I-T-Y comic aura ring on Ego Center node */}
                  {isCenter && (
                    <g>
                      <circle
                        cx="0"
                        cy="0"
                        r={r + 12}
                        fill="#FFFDF9"
                        stroke="#141419"
                        strokeWidth="2.8"
                      />
                      {/* 4 quadrant C-I-T-Y colored arcs */}
                      <path
                        d={`M 0 ${-(r + 7.5)} A ${r + 7.5} ${r + 7.5} 0 0 1 ${r + 7.5} 0`}
                        fill="none"
                        stroke="#F7B647"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M ${r + 7.5} 0 A ${r + 7.5} ${r + 7.5} 0 0 1 0 ${r + 7.5}`}
                        fill="none"
                        stroke="#F09CB4"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M 0 ${r + 7.5} A ${r + 7.5} ${r + 7.5} 0 0 1 ${-(r + 7.5)} 0`}
                        fill="none"
                        stroke="#99CB77"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M ${-(r + 7.5)} 0 A ${r + 7.5} ${r + 7.5} 0 0 1 0 ${-(r + 7.5)}`}
                        fill="none"
                        stroke="#EE847D"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                      />
                    </g>
                  )}

                  {/* Selection / Path highlight halo */}
                  {!isCenter && (isSelected || isPathStart || isPathEnd || isHovered) && (
                    <circle
                      cx="0"
                      cy="0"
                      r={r + 7}
                      fill="none"
                      stroke={
                        isPathStart
                          ? "#F7B647"
                          : isPathEnd
                          ? "#EE847D"
                          : isSelected
                          ? "#1395EA"
                          : "#141419"
                      }
                      strokeWidth="3.2"
                      strokeDasharray={isHovered && !isSelected ? "4 3" : undefined}
                    />
                  )}

                  {/* Comic offset drop shadow */}
                  <circle
                    cx={isHovered || isCenter ? 4 : 2.5}
                    cy={isHovered || isCenter ? 4 : 2.5}
                    r={r + 2.5}
                    fill="#141419"
                    opacity={isCenter || isHovered || isSelected ? 0.85 : 0.25}
                  />

                  {/* Colored faction border ring (dual half-ring for Tatewaku!) */}
                  <circle
                    cx="0"
                    cy="0"
                    r={r + 3}
                    fill="#FFFDF9"
                    stroke={ringColor}
                    strokeWidth={isCenter ? 4.5 : 3.6}
                  />
                  {secondaryFac && (
                    <path
                      d={`M 0 ${-(r + 3)} A ${r + 3} ${r + 3} 0 0 1 0 ${r + 3}`}
                      fill="none"
                      stroke={secondaryFac.accent}
                      strokeWidth={isCenter ? 4.5 : 3.6}
                    />
                  )}

                  {/* Crisp outer comic ink stroke */}
                  <circle
                    cx="0"
                    cy="0"
                    r={r + 5}
                    fill="none"
                    stroke="#141419"
                    strokeWidth={isCenter ? 2.6 : 1.9}
                  />

                  {/* Portrait Avatar Image */}
                  <image
                    href={char.avatar}
                    x={-r}
                    y={-r}
                    width={r * 2}
                    height={r * 2}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#net-avatar-circle)"
                  />

                  {/* Optional compact top-right badge (Jersey #, Floor, CAT) */}
                  {badge && (
                    <g transform={`translate(${(r * 0.72).toFixed(1)}, ${(-r * 0.74).toFixed(1)})`}>
                      <rect
                        x="-14"
                        y="-8.5"
                        width="28"
                        height="17"
                        rx="8.5"
                        fill="#141419"
                        stroke="#FFFDF9"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="3.3"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="800"
                        fill="#F7B647"
                      >
                        {badge}
                      </text>
                    </g>
                  )}

                  {/* Degree indicator pill in Full Network mode for high-degree hubs */}
                  {subMode === "full" && node.degree >= 4 && !badge && (
                    <g transform={`translate(${(r * 0.72).toFixed(1)}, ${(-r * 0.72).toFixed(1)})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r="9.5"
                        fill="#F7B647"
                        stroke="#141419"
                        strokeWidth="1.6"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="900"
                        fill="#141419"
                      >
                        {node.degree}
                      </text>
                    </g>
                  )}

                  {/* Crisp Nameplate Pill underneath portrait */}
                  <g transform={`translate(0, ${r + (isCenter ? 20 : 14)})`}>
                    <rect
                      x={-labelW / 2}
                      y={-labelH / 2}
                      width={labelW}
                      height={labelH}
                      rx={labelH / 2}
                      fill={isCenter || isSelected ? "#141419" : "#FFFDF9"}
                      stroke="#141419"
                      strokeWidth={isCenter || isSelected ? 2.4 : 1.7}
                    />
                    <text
                      x="0"
                      y={labelFont * 0.36}
                      textAnchor="middle"
                      fontSize={labelFont}
                      fontWeight="800"
                      fill={isCenter || isSelected ? "#FFFFFF" : "#141419"}
                    >
                      {name}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Edge Lore Bubble at bottom-center (identical comic style to Classic Map) */}
      {activeEdgeObject && (
        <div
          className={`pointer-events-auto fixed bottom-20 -translate-x-1/2 z-30 max-w-md w-[calc(100vw-2rem)] transition-[left] duration-300 ${
            drawerOpen ? "left-1/2 lg:left-[calc(50%-200px)]" : "left-1/2"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#33333F] text-white rounded-2xl px-4 py-3 city-ink-card-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold flex-wrap">
                <img
                  src={CHARACTER_MAP[activeEdgeObject.from].avatar}
                  alt=""
                  className="w-5 h-5 rounded-full border border-white/60 object-cover"
                />
                <span className="px-2 py-0.5 rounded-full bg-[#F7B647] text-[#141419]">
                  {pickText(CHARACTER_MAP[activeEdgeObject.from].mapName, locale)}
                </span>
                <span className="text-[#F09CB4]">
                  {activeEdgeObject.bidirectional
                    ? t.edgeDirectionBoth
                    : activeEdgeObject.type === "friendship"
                    ? "—"
                    : t.edgeDirectionTo}
                </span>
                <img
                  src={CHARACTER_MAP[activeEdgeObject.to].avatar}
                  alt=""
                  className="w-5 h-5 rounded-full border border-white/60 object-cover"
                />
                <span className="px-2 py-0.5 rounded-full bg-[#99CB77] text-[#141419]">
                  {pickText(CHARACTER_MAP[activeEdgeObject.to].mapName, locale)}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold text-[#141419]"
                  style={{
                    backgroundColor: RELATION_CATEGORY_META[activeEdgeObject.category].bg,
                  }}
                >
                  {activeEdgeObject.label
                    ? pickText(activeEdgeObject.label, locale)
                    : t.relationCategories[activeEdgeObject.category]}
                </span>
              </div>
              {selectedEdgeId === activeEdgeObject.id && (
                <button
                  type="button"
                  onClick={() => onSelectEdge(null)}
                  className="text-xs text-white/70 hover:text-white px-1.5 cursor-pointer"
                  aria-label={t.close}
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-white/95">
              {pickText(activeEdgeObject.story, locale)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
