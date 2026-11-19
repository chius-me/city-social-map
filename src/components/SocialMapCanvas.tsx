import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { Character, Faction, FactionId, Locale, RelationEdge, RelationType } from "../types";
import { CHARACTERS, CHARACTER_MAP } from "../data/characters";
import { FACTIONS, FACTION_MAP } from "../data/factions";
import { EDGES } from "../data/edges";
import { UI_TEXT, pickText } from "../data/i18n";
import type { PathResult } from "../utils/pathfinding";

export const MAP_WIDTH = 1776;
export const MAP_HEIGHT = 976;

const PILL_HEIGHT = 34;

export interface MapCameraHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  flyToPoint: (x: number, y: number, targetScale?: number) => void;
  flyToBounds: (bounds: { x: number; y: number; width: number; height: number }) => void;
}

interface SocialMapCanvasProps {
  locale: Locale;
  visibleRelationTypes: Record<RelationType, boolean>;
  onToggleRelationType: (t: RelationType) => void;
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

/**
 * Converts orthogonal polyline points into a clean rounded-corner SVG path.
 */
function roundedPolylinePath(points: [number, number][], cornerRadius = 11): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  if (points.length === 2) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
  }

  const cmds: string[] = [`M ${points[0][0]} ${points[0][1]}`];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const v1x = prev[0] - curr[0];
    const v1y = prev[1] - curr[1];
    const v2x = next[0] - curr[0];
    const v2y = next[1] - curr[1];
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    if (len1 < 0.5 || len2 < 0.5) {
      cmds.push(`L ${curr[0]} ${curr[1]}`);
      continue;
    }
    const r = Math.min(cornerRadius, len1 / 2, len2 / 2);
    const p1x = curr[0] + (v1x / len1) * r;
    const p1y = curr[1] + (v1y / len1) * r;
    const p2x = curr[0] + (v2x / len2) * r;
    const p2y = curr[1] + (v2y / len2) * r;
    cmds.push(`L ${p1x.toFixed(1)} ${p1y.toFixed(1)}`);
    cmds.push(`Q ${curr[0]} ${curr[1]} ${p2x.toFixed(1)} ${p2y.toFixed(1)}`);
  }
  const last = points[points.length - 1];
  cmds.push(`L ${last[0]} ${last[1]}`);
  return cmds.join(" ");
}

function getEdgeBaseColor(type: RelationType): string {
  switch (type) {
    case "children":
      return "#252430";
    case "friendship":
      return "#2B4C6F";
    case "employment":
      return "#7A5418";
    case "specific":
      return "#141419";
  }
}

function getEdgeHighlightColor(type: RelationType): string {
  switch (type) {
    case "children":
      return "#E07A22";
    case "friendship":
      return "#1395EA";
    case "employment":
      return "#C88412";
    case "specific":
      return "#DD5549";
  }
}

export const SocialMapCanvas: React.FC<SocialMapCanvasProps> = ({
  locale,
  visibleRelationTypes,
  onToggleRelationType,
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

  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 0.72 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCharId, setHoveredCharId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const cameraStateRef = useRef(camera);
  cameraStateRef.current = camera;

  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ active: false, moved: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const pinchRef = useRef<{
    active: boolean;
    startDist: number;
    startScale: number;
    midX: number;
    midY: number;
    origX: number;
    origY: number;
  }>({ active: false, startDist: 0, startScale: 1, midX: 0, midY: 0, origX: 0, origY: 0 });

  const clampScale = (s: number) => Math.max(0.18, Math.min(2.6, s));

  const computeFitTransform = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return { x: 0, y: 0, scale: 0.72 };
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const padX = vw < 640 ? 10 : 44;
    const padTop = vw < 640 ? 68 : 78;
    const padBottom = vw < 640 ? 78 : 88;
    const availW = Math.max(160, vw - padX * 2);
    const availH = Math.max(160, vh - padTop - padBottom);
    const scale = clampScale(Math.min(availW / MAP_WIDTH, availH / MAP_HEIGHT));
    const x = (vw - MAP_WIDTH * scale) / 2;
    const y = padTop + (availH - MAP_HEIGHT * scale) / 2;
    return { x, y, scale };
  }, []);

  useEffect(() => {
    setCamera(computeFitTransform());
    const onResize = () => {
      // Keep user's current position if already zoomed in; only refit gently on resize if near fit
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [computeFitTransform]);

  const animateTo = useCallback((next: { x: number; y: number; scale: number }) => {
    setIsAnimating(true);
    setCamera(next);
  }, []);

  const zoomAtPoint = useCallback((nextScaleRaw: number, clientX?: number, clientY?: number, smooth = true) => {
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
    const nextX = px - worldX * nextScale;
    const nextY = py - worldY * nextScale;

    setIsAnimating(smooth);
    setCamera({ x: nextX, y: nextY, scale: nextScale });
  }, []);

  useImperativeHandle(
    cameraRef,
    () => ({
      zoomIn: () => zoomAtPoint(cameraStateRef.current.scale * 1.24, undefined, undefined, true),
      zoomOut: () => zoomAtPoint(cameraStateRef.current.scale / 1.24, undefined, undefined, true),
      resetView: () => animateTo(computeFitTransform()),
      flyToPoint: (wx: number, wy: number, targetScale = 1.35) => {
        const el = viewportRef.current;
        if (!el) return;
        const vw = el.clientWidth;
        const vh = el.clientHeight;
        // Offset center slightly left on desktop if drawer is likely open
        const centerX = vw >= 1024 ? vw * 0.44 : vw * 0.5;
        const centerY = vh * 0.5;
        const s = clampScale(vw < 640 ? Math.min(targetScale, 1.05) : targetScale);
        animateTo({
          x: centerX - wx * s,
          y: centerY - wy * s,
          scale: s,
        });
      },
      flyToBounds: (bounds) => {
        const el = viewportRef.current;
        if (!el) return;
        const vw = el.clientWidth;
        const vh = el.clientHeight;
        const padX = vw < 640 ? 24 : 96;
        const padY = 96;
        const availW = vw >= 1024 ? vw * 0.72 - padX : vw - padX * 2;
        const availH = vh - padY * 2;
        const s = clampScale(Math.min(availW / bounds.width, availH / bounds.height, 1.6));
        const cx = bounds.x + bounds.width / 2;
        const cy = bounds.y + bounds.height / 2;
        const targetCenterX = vw >= 1024 ? vw * 0.44 : vw * 0.5;
        animateTo({
          x: targetCenterX - cx * s,
          y: vh * 0.5 - cy * s,
          scale: s,
        });
      },
    }),
    [animateTo, computeFitTransform, zoomAtPoint]
  );

  // Wheel zoom toward cursor
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Trackpad pinch or regular scroll wheel both zoom smoothly toward cursor
      const factor = e.ctrlKey
        ? Math.exp(-e.deltaY * 0.01)
        : Math.exp(-e.deltaY * 0.0018);
      zoomAtPoint(cameraStateRef.current.scale * factor, e.clientX, e.clientY, false);
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [zoomAtPoint]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsAnimating(false);
    setIsDragging(true);
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origX: cameraStateRef.current.x,
      origY: cameraStateRef.current.y,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.hypot(dx, dy) > 5) {
        dragRef.current.moved = true;
      }
      setCamera((prev) => ({
        ...prev,
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      }));
    };
    const onUp = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      setIsDragging(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Touch pan & 2-finger pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsAnimating(false);
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      dragRef.current = {
        active: true,
        moved: false,
        startX: touch.clientX,
        startY: touch.clientY,
        origX: cameraStateRef.current.x,
        origY: cameraStateRef.current.y,
      };
      pinchRef.current.active = false;
    } else if (e.touches.length === 2) {
      dragRef.current.active = false;
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
    if (e.touches.length === 1 && dragRef.current.active) {
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      if (Math.hypot(dx, dy) > 6) dragRef.current.moved = true;
      setCamera((prev) => ({
        ...prev,
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      }));
    } else if (e.touches.length === 2 && pinchRef.current.active) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const nextScale = clampScale(pinchRef.current.startScale * (dist / pinchRef.current.startDist));
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
    dragRef.current.active = false;
    pinchRef.current.active = false;
  };

  // Spotlight calculation (Hover > Path Mode > Selected Character / Edge / Faction)
  const spotlight = useMemo(() => {
    // 1. Path Finder active with a found path
    if (pathMode && activePath?.found && activePath.nodes.length > 0) {
      const nodes = new Set<string>(activePath.nodes);
      const edges = new Set<string>();
      for (const step of activePath.steps) {
        if (step.edge) edges.add(step.edge.id);
      }
      return { active: true, nodes, edges, mode: "path" as const };
    }

    // 2. Hovered character or edge
    if (hoveredEdgeId) {
      const edge = EDGES.find((e) => e.id === hoveredEdgeId);
      if (edge) {
        return {
          active: true,
          nodes: new Set([edge.from, edge.to]),
          edges: new Set([edge.id]),
          mode: "edge" as const,
        };
      }
    }

    const focusCharId = hoveredCharId ?? selectedCharacterId;
    if (focusCharId) {
      const nodes = new Set<string>([focusCharId]);
      const edges = new Set<string>();
      for (const edge of EDGES) {
        if (!visibleRelationTypes[edge.type]) continue;
        if (edge.from === focusCharId || edge.to === focusCharId) {
          edges.add(edge.id);
          nodes.add(edge.from);
          nodes.add(edge.to);
        }
      }
      return { active: true, nodes, edges, mode: "char" as const };
    }

    // 3. Selected edge
    if (selectedEdgeId) {
      const edge = EDGES.find((e) => e.id === selectedEdgeId);
      if (edge) {
        return {
          active: true,
          nodes: new Set([edge.from, edge.to]),
          edges: new Set([edge.id]),
          mode: "edge" as const,
        };
      }
    }

    // 4. Selected faction
    if (selectedFactionId) {
      const nodes = new Set<string>(
        CHARACTERS.filter((c) => c.factions.includes(selectedFactionId)).map((c) => c.id)
      );
      const edges = new Set<string>();
      for (const edge of EDGES) {
        if (!visibleRelationTypes[edge.type]) continue;
        if (nodes.has(edge.from) || nodes.has(edge.to)) {
          edges.add(edge.id);
        }
      }
      return { active: true, nodes, edges, mode: "faction" as const };
    }

    return { active: false, nodes: new Set<string>(), edges: new Set<string>(), mode: "none" as const };
  }, [
    activePath,
    hoveredCharId,
    hoveredEdgeId,
    pathMode,
    selectedCharacterId,
    selectedEdgeId,
    selectedFactionId,
    visibleRelationTypes,
  ]);

  const activeEdgeObject = useMemo(() => {
    const id = hoveredEdgeId ?? selectedEdgeId;
    if (!id) return null;
    return EDGES.find((e) => e.id === id) ?? null;
  }, [hoveredEdgeId, selectedEdgeId]);

  const handleCanvasBackgroundClick = () => {
    if (dragRef.current.moved) return;
    onClearSelection();
  };

  return (
    <div
      ref={viewportRef}
      className={`relative w-full h-full overflow-hidden select-none city-confetti-bg ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCanvasBackgroundClick}
      style={{ touchAction: "none" }}
    >
      {/* Transformed Map Container */}
      <div
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`,
          transition: isAnimating
            ? "transform 680ms cubic-bezier(0.65, 0.05, 0.36, 1)"
            : "none",
        }}
        onTransitionEnd={() => setIsAnimating(false)}
      >
        <svg
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="block overflow-visible"
        >
          <defs>
            {/* Children: solid filled triangle arrowhead */}
            <marker
              id="arrow-children"
              viewBox="0 0 14 14"
              refX="11"
              refY="7"
              markerWidth="9.5"
              markerHeight="9.5"
              orient="auto-start-reverse"
            >
              <path d="M 1 1.5 L 12.5 7 L 1 12.5 Z" fill="#252430" />
            </marker>
            <marker
              id="arrow-children-hi"
              viewBox="0 0 14 14"
              refX="11"
              refY="7"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <path d="M 1 1.5 L 12.5 7 L 1 12.5 Z" fill="#E07A22" />
            </marker>

            {/* Open chevron arrowhead for Employment & Specific */}
            <marker
              id="arrow-open-dark"
              viewBox="0 0 14 14"
              refX="10.5"
              refY="7"
              markerWidth="9.5"
              markerHeight="9.5"
              orient="auto-start-reverse"
            >
              <path
                d="M 2 2 L 10.8 7 L 2 12"
                fill="none"
                stroke="#141419"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </marker>
            <marker
              id="arrow-open-emp"
              viewBox="0 0 14 14"
              refX="10.5"
              refY="7"
              markerWidth="9.5"
              markerHeight="9.5"
              orient="auto-start-reverse"
            >
              <path
                d="M 2 2 L 10.8 7 L 2 12"
                fill="none"
                stroke="#7A5418"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </marker>
            <marker
              id="arrow-open-emp-hi"
              viewBox="0 0 14 14"
              refX="10.5"
              refY="7"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <path
                d="M 2 2 L 10.8 7 L 2 12"
                fill="none"
                stroke="#C88412"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </marker>
            <marker
              id="arrow-open-hi"
              viewBox="0 0 14 14"
              refX="10.5"
              refY="7"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <path
                d="M 2 2 L 10.8 7 L 2 12"
                fill="none"
                stroke="#DD5549"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </marker>
          </defs>

          {/* Subtle warm comic drafting board sheet */}
          <rect
            x="6"
            y="6"
            width={MAP_WIDTH - 12}
            height={MAP_HEIGHT - 12}
            rx="28"
            fill="rgba(255, 253, 249, 0.86)"
            stroke="#141419"
            strokeWidth="3.5"
          />

          {/* ============================================================== */}
          {/* LAYER 1: FACTION ZONES (with Makabe ∩ Soccer overlap!)         */}
          {/* ============================================================== */}
          <g className="factions-layer">
            {FACTIONS.map((faction) => {
              const isSelected = selectedFactionId === faction.id;
              const isDimmed =
                spotlight.active &&
                spotlight.mode === "faction" &&
                selectedFactionId !== faction.id;
              const isSoccer = faction.id === "city-south-soccer";

              return (
                <g
                  key={faction.id}
                  style={{
                    opacity: isDimmed ? 0.32 : 1,
                    transition: "opacity 220ms ease",
                  }}
                >
                  <path
                    d={faction.svgPath}
                    fill={faction.fill}
                    fillOpacity={isSoccer ? 0.74 : 0.88}
                    stroke={isSelected ? "#141419" : faction.accent}
                    strokeWidth={isSelected ? 3.5 : 2.2}
                    className="cursor-pointer transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dragRef.current.moved) return;
                      onSelectFaction(faction);
                    }}
                  />
                  {/* Clickable Faction Header Label */}
                  <g
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dragRef.current.moved) return;
                      onSelectFaction(faction);
                    }}
                  >
                    <text
                      x={faction.labelPos.x}
                      y={faction.labelPos.y}
                      textAnchor={faction.labelPos.align ?? "start"}
                      fill={faction.ink}
                      fontSize="16.5"
                      fontWeight="800"
                      letterSpacing="0.02em"
                    >
                      {pickText(faction.shortName, locale)}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Highlight the iconic Makabe Family ∩ CITY South Soccer Team overlap box */}
            <rect
              x="1352"
              y="462"
              width="140"
              height="68"
              rx="14"
              fill="rgba(164, 152, 138, 0.22)"
              stroke="#141419"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              pointerEvents="none"
            />
          </g>

          {/* ============================================================== */}
          {/* LAYER 2: CANVAS TITLE (Top-Right) & ON-MAP LEGEND (Bottom-Left) */}
          {/* ============================================================== */}
          <g className="canvas-title" pointerEvents="none">
            <text
              x="1718"
              y="98"
              textAnchor="end"
              fontSize="44"
              fontWeight="900"
              letterSpacing="-0.01em"
              fill="#DD5549"
              stroke="#141419"
              strokeWidth="1.6"
              paintOrder="stroke"
            >
              <tspan fill="#F7B647">C</tspan>
              <tspan fill="#F09CB4">I</tspan>
              <tspan fill="#99CB77">T</tspan>
              <tspan fill="#EE847D">Y</tspan>
              <tspan fill="#DD5549"> the Social Map</tspan>
            </text>
            <text
              x="1718"
              y="124"
              textAnchor="end"
              fontSize="13.5"
              fontWeight="700"
              fill="#5A5A6A"
            >
              {t.mapCanvasSubtitle}
            </text>
            {/* Official 4-color dots underline */}
            <circle cx="1518" cy="140" r="5" fill="#F7B647" stroke="#141419" strokeWidth="1.5" />
            <circle cx="1534" cy="140" r="5" fill="#F09CB4" stroke="#141419" strokeWidth="1.5" />
            <circle cx="1550" cy="140" r="5" fill="#99CB77" stroke="#141419" strokeWidth="1.5" />
            <circle cx="1566" cy="140" r="5" fill="#EE847D" stroke="#141419" strokeWidth="1.5" />
            <text x="1718" y="144" textAnchor="end" fontSize="11.5" fontWeight="700" fill="#7A7A8C">
              65 {t.characterCount} · 8 {t.factionCount}
            </text>
          </g>

          {/* On-Canvas Interactive Dotted Legend Box (Bottom-Left, faithful to VayItsHere's map!) */}
          <g className="canvas-legend" transform="translate(52, 608)">
            <rect
              x="0"
              y="0"
              width="334"
              height="338"
              rx="22"
              fill="#FFFFFF"
              fillOpacity="0.94"
              stroke="#141419"
              strokeWidth="3"
              strokeDasharray="6 6"
            />
            <text x="22" y="34" fontSize="15" fontWeight="800" fill="#141419">
              {t.legendTitle}
            </text>
            <text x="312" y="34" textAnchor="end" fontSize="11" fontWeight="600" fill="#777788">
              {t.legendHint}
            </text>

            {/* Row 1: Children */}
            <g
              transform="translate(18, 52)"
              className="cursor-pointer"
              opacity={visibleRelationTypes.children ? 1 : 0.35}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragRef.current.moved) onToggleRelationType("children");
              }}
            >
              <rect x="0" y="0" width="298" height="38" rx="11" fill="#F7F6F2" stroke="#141419" strokeWidth="1.5" />
              <text x="14" y="24" fontSize="13.5" fontWeight="800" fill="#141419">
                {t.relationTypes.children}
              </text>
              <path
                d="M 142 19 L 186 19 L 198 25 L 254 25 L 266 19 L 280 19"
                fill="none"
                stroke="#252430"
                strokeWidth="3.2"
                strokeLinecap="round"
                markerEnd="url(#arrow-children)"
              />
            </g>

            {/* Row 2: Friendship */}
            <g
              transform="translate(18, 98)"
              className="cursor-pointer"
              opacity={visibleRelationTypes.friendship ? 1 : 0.35}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragRef.current.moved) onToggleRelationType("friendship");
              }}
            >
              <rect x="0" y="0" width="298" height="38" rx="11" fill="#F7F6F2" stroke="#141419" strokeWidth="1.5" />
              <text x="14" y="24" fontSize="13.5" fontWeight="800" fill="#141419">
                {t.relationTypes.friendship}
              </text>
              <path
                d="M 142 22 L 196 22 Q 208 22 214 16 L 284 16"
                fill="none"
                stroke="#2B4C6F"
                strokeWidth="2.8"
                strokeDasharray="9 6"
                strokeLinecap="round"
              />
            </g>

            {/* Row 3: Employment */}
            <g
              transform="translate(18, 144)"
              className="cursor-pointer"
              opacity={visibleRelationTypes.employment ? 1 : 0.35}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragRef.current.moved) onToggleRelationType("employment");
              }}
            >
              <rect x="0" y="0" width="298" height="38" rx="11" fill="#F7F6F2" stroke="#141419" strokeWidth="1.5" />
              <text x="14" y="24" fontSize="13.5" fontWeight="800" fill="#141419">
                {t.relationTypes.employment}
              </text>
              <path
                d="M 142 22 L 222 22 L 234 15 L 280 15"
                fill="none"
                stroke="#7A5418"
                strokeWidth="3"
                strokeDasharray="2.5 5.5"
                strokeLinecap="round"
                markerEnd="url(#arrow-open-emp)"
              />
            </g>

            {/* Row 4: Specific */}
            <g
              transform="translate(18, 190)"
              className="cursor-pointer"
              opacity={visibleRelationTypes.specific ? 1 : 0.35}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragRef.current.moved) onToggleRelationType("specific");
              }}
            >
              <rect x="0" y="0" width="298" height="42" rx="11" fill="#F7F6F2" stroke="#141419" strokeWidth="1.5" />
              <text x="14" y="26" fontSize="13.5" fontWeight="800" fill="#141419">
                {t.relationTypes.specific}
              </text>
              <path
                d="M 142 17 L 280 17"
                fill="none"
                stroke="#141419"
                strokeWidth="2.6"
                strokeLinecap="round"
                markerEnd="url(#arrow-open-dark)"
              />
              <text x="210" y="34" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#DD5549">
                {locale === "zh" ? "关系说明标签" : locale === "ja" ? "関係ラベル付き" : "Descriptive Text"}
              </text>
            </g>

            {/* Row 5: Groups color swatches */}
            <g transform="translate(18, 240)">
              <rect x="0" y="0" width="298" height="36" rx="11" fill="#F7F6F2" stroke="#141419" strokeWidth="1.5" />
              <text x="14" y="23" fontSize="13.5" fontWeight="800" fill="#141419">
                {locale === "zh" ? "团体 / 阵营" : locale === "ja" ? "グループ" : "Groups"}
              </text>
              <rect x="142" y="9" width="32" height="18" rx="5" fill="#FAD4DF" stroke="#141419" strokeWidth="1.2" />
              <rect x="178" y="9" width="32" height="18" rx="5" fill="#D7EED0" stroke="#141419" strokeWidth="1.2" />
              <rect x="214" y="9" width="32" height="18" rx="5" fill="#F9DFBF" stroke="#141419" strokeWidth="1.2" />
              <rect x="250" y="9" width="34" height="18" rx="5" fill="#D2E5FA" stroke="#141419" strokeWidth="1.2" />
            </g>

            {/* Original Author Attribution Stamp */}
            <text x="20" y="302" fontSize="11.5" fontWeight="700" fill="#DD5549">
              Based on “CITY the Social Map” (28 June 2025)
            </text>
            <text x="20" y="321" fontSize="11" fontWeight="600" fill="#6B6B7C">
              Original by VayItsHere / Mokkachino (Discord) · CITY Wiki
            </text>
          </g>

          {/* ============================================================== */}
          {/* LAYER 3: RELATIONSHIP EDGES                                    */}
          {/* ============================================================== */}
          <g className="edges-layer">
            {/* Couple bridges for parents (Adatara & Makabe) */}
            {visibleRelationTypes.children && (
              <g
                opacity={
                  spotlight.active &&
                  !spotlight.nodes.has("mr-adatara") &&
                  !spotlight.nodes.has("mrs-adatara")
                    ? 0.16
                    : 1
                }
                style={{ transition: "opacity 220ms ease" }}
              >
                <line
                  x1="630"
                  y1="318"
                  x2="682"
                  y2="318"
                  stroke="#252430"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </g>
            )}
            {visibleRelationTypes.children && (
              <g
                opacity={
                  spotlight.active &&
                  !spotlight.nodes.has("chef-makabe") &&
                  !spotlight.nodes.has("mrs-makabe")
                    ? 0.16
                    : 1
                }
                style={{ transition: "opacity 220ms ease" }}
              >
                <line
                  x1="1468"
                  y1="356"
                  x2="1506"
                  y2="356"
                  stroke="#252430"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </g>
            )}

            {EDGES.map((edge) => {
              if (!visibleRelationTypes[edge.type]) return null;
              const isHighlighted = spotlight.edges.has(edge.id);
              const isPathEdge = spotlight.mode === "path" && isHighlighted;
              const isDimmed = spotlight.active && !isHighlighted;
              const d = roundedPolylinePath(edge.points, 12);

              const strokeColor = isPathEdge
                ? "#DD5549"
                : isHighlighted
                ? getEdgeHighlightColor(edge.type)
                : getEdgeBaseColor(edge.type);

              const strokeWidth = isPathEdge
                ? 4.6
                : isHighlighted
                ? 3.8
                : edge.type === "children"
                ? 3
                : 2.5;

              const dashArray =
                edge.type === "friendship"
                  ? "9 6"
                  : edge.type === "employment"
                  ? "2.5 5.5"
                  : undefined;

              const showEndArrow =
                edge.arrowEnd !== undefined
                  ? edge.arrowEnd
                  : edge.type === "children" ||
                    edge.type === "employment" ||
                    edge.type === "specific";
              const showStartArrow = Boolean(edge.arrowStart);

              const markerEnd = showEndArrow
                ? edge.type === "children"
                  ? isHighlighted
                    ? "url(#arrow-children-hi)"
                    : "url(#arrow-children)"
                  : edge.type === "employment"
                  ? isHighlighted
                    ? "url(#arrow-open-emp-hi)"
                    : "url(#arrow-open-emp)"
                  : isHighlighted
                  ? "url(#arrow-open-hi)"
                  : "url(#arrow-open-dark)"
                : undefined;

              const markerStart = showStartArrow
                ? isHighlighted
                  ? "url(#arrow-open-hi)"
                  : "url(#arrow-open-dark)"
                : undefined;

              return (
                <g
                  key={edge.id}
                  style={{
                    opacity: isDimmed ? 0.14 : 1,
                    transition: "opacity 220ms ease",
                  }}
                >
                  {/* White halo under highlighted/path edges for crisp legibility over crossings */}
                  {isHighlighted && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#FFFDF9"
                      strokeWidth={strokeWidth + 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pointerEvents="none"
                    />
                  )}
                  {/* Visible edge stroke */}
                  <path
                    d={d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dashArray}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd={markerEnd}
                    markerStart={markerStart}
                    pointerEvents="none"
                  />
                  {/* Animated flow overlay when highlighted */}
                  {isHighlighted && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeOpacity={isPathEdge ? 0.8 : 0.48}
                      strokeWidth={2}
                      strokeDasharray="6 14"
                      strokeLinecap="round"
                      className="edge-animated-flow"
                      pointerEvents="none"
                    />
                  )}
                  {/* Fat invisible hit target for easy hover & click */}
                  <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="14"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEdgeId(edge.id)}
                    onMouseLeave={() => setHoveredEdgeId((prev) => (prev === edge.id ? null : prev))}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dragRef.current.moved) return;
                      onSelectEdge(edge);
                    }}
                  />
                </g>
              );
            })}

            {/* Dedicated Edge Labels Layer rendered ABOVE all strokes so no line ever crosses a label */}
            <g className="edge-labels-layer">
              {EDGES.map((edge) => {
                if (!visibleRelationTypes[edge.type] || !edge.label || !edge.labelPos) return null;
                const labelStr = pickText(edge.label, locale);
                // Keep shared-bundle labels ("Beat up" / "Kidnapped") bright when any sibling edge is active
                const isBundleHighlighted =
                  spotlight.edges.has(edge.id) ||
                  (edge.id === "mob-new-honkan" &&
                    Array.from(spotlight.edges).some((id) => id.startsWith("mob-"))) ||
                  (edge.id === "tanabe-kidnapped-good-person" &&
                    spotlight.edges.has("tanabe-kidnapped-nagumo"));
                const isDimmed = spotlight.active && !isBundleHighlighted;
                const approxUnits = Array.from(labelStr).reduce(
                  (acc, ch) => acc + (ch.charCodeAt(0) > 255 ? 1.05 : 0.58),
                  0
                );
                const pillW = Math.max(46, Math.ceil(approxUnits * 11.5 + 22));

                return (
                  <g
                    key={`label-${edge.id}`}
                    transform={`translate(${edge.labelPos.x}, ${edge.labelPos.y})`}
                    className="cursor-pointer"
                    style={{
                      opacity: isDimmed ? 0.16 : 1,
                      transition: "opacity 220ms ease",
                    }}
                    onMouseEnter={() => setHoveredEdgeId(edge.id)}
                    onMouseLeave={() =>
                      setHoveredEdgeId((prev) => (prev === edge.id ? null : prev))
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dragRef.current.moved) return;
                      onSelectEdge(edge);
                    }}
                  >
                    <rect
                      x={-pillW / 2}
                      y="-12"
                      width={pillW}
                      height="24"
                      rx="12"
                      fill={isBundleHighlighted ? "#141419" : "#FFFFFF"}
                      stroke={isBundleHighlighted ? "#DD5549" : "#141419"}
                      strokeWidth={isBundleHighlighted ? 2.4 : 1.9}
                    />
                    <text
                      x="0"
                      y="4.2"
                      textAnchor="middle"
                      fontSize="11.5"
                      fontWeight="800"
                      fill={isBundleHighlighted ? "#F7B647" : "#DD5549"}
                    >
                      {labelStr}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Extra dashed connector when Path Finder hops across shared faction teammates */}
            {pathMode &&
              activePath?.found &&
              activePath.steps
                .filter((s) => !s.edge && s.sharedFactionId)
                .map((step, idx) => {
                  const a = CHARACTER_MAP[step.from];
                  const b = CHARACTER_MAP[step.to];
                  if (!a || !b) return null;
                  const midX = (a.x + b.x) / 2;
                  const midY = (a.y + b.y) / 2 - 22;
                  const d = `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
                  return (
                    <g key={`shared-hop-${idx}`} pointerEvents="none">
                      <path
                        d={d}
                        fill="none"
                        stroke="#FFFDF9"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <path
                        d={d}
                        fill="none"
                        stroke="#1395EA"
                        strokeWidth="4.5"
                        strokeDasharray="8 6"
                        strokeLinecap="round"
                        className="edge-animated-flow"
                      />
                    </g>
                  );
                })}
          </g>

          {/* ============================================================== */}
          {/* LAYER 4: CHARACTER PILL NODES (All 65 Residents!)              */}
          {/* ============================================================== */}
          <g className="characters-layer">
            {CHARACTERS.map((char) => {
              const name = pickText(char.mapName, locale);
              const w = char.width ?? Math.max(94, name.length * 14 + 34);
              const halfW = w / 2;
              const halfH = PILL_HEIGHT / 2;

              const isSelected = selectedCharacterId === char.id;
              const isHovered = hoveredCharId === char.id;
              const isPathStart = pathMode && pathStartId === char.id;
              const isPathEnd = pathMode && pathEndId === char.id;
              const isPathMember = pathMode && activePath?.found && activePath.nodes.includes(char.id);
              const isHighlighted =
                isSelected || isHovered || isPathStart || isPathEnd || spotlight.nodes.has(char.id);
              const isDimmed = spotlight.active && !isHighlighted;

              const primaryFaction = char.factions[0] ? FACTION_MAP[char.factions[0]] : null;
              const secondaryFaction = char.factions[1] ? FACTION_MAP[char.factions[1]] : null;
              const dotColor = primaryFaction ? primaryFaction.accent : "#1395EA";

              const fill = isPathStart
                ? "#F7B647"
                : isPathEnd
                ? "#F09CB4"
                : isSelected
                ? "#141419"
                : isPathMember
                ? "#FFF4D6"
                : "#FFFFFF";

              const textColor = isSelected && !isPathStart && !isPathEnd ? "#FFFFFF" : "#141419";

              return (
                <g
                  key={char.id}
                  transform={`translate(${char.x}, ${char.y})`}
                  className="cursor-pointer"
                  style={{
                    opacity: isDimmed ? 0.22 : 1,
                    transition: "opacity 200ms ease",
                  }}
                  onMouseEnter={() => setHoveredCharId(char.id)}
                  onMouseLeave={() => setHoveredCharId((prev) => (prev === char.id ? null : prev))}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragRef.current.moved) return;
                    onSelectCharacter(char);
                  }}
                >
                  {/* Pulsing ring for selected / path endpoint */}
                  {(isSelected || isPathStart || isPathEnd) && (
                    <rect
                      x={-halfW - 5}
                      y={-halfH - 5}
                      width={w + 10}
                      height={PILL_HEIGHT + 10}
                      rx={halfH + 5}
                      fill="none"
                      stroke={isPathStart ? "#F7B647" : isPathEnd ? "#EE847D" : "#1395EA"}
                      strokeWidth="3.5"
                    />
                  )}

                  {/* Comic ink offset shadow */}
                  <rect
                    x={-halfW + (isHovered ? 3.5 : 2)}
                    y={-halfH + (isHovered ? 3.5 : 2)}
                    width={w}
                    height={PILL_HEIGHT}
                    rx={halfH}
                    fill="#141419"
                    opacity={isHovered || isSelected ? 0.92 : 0.24}
                  />

                  {/* Main comic pill body */}
                  <rect
                    x={-halfW}
                    y={-halfH}
                    width={w}
                    height={PILL_HEIGHT}
                    rx={halfH}
                    fill={fill}
                    stroke="#141419"
                    strokeWidth={isHovered || isSelected || isPathMember ? 2.8 : 2.1}
                  />

                  {/* Left faction indicator dot (dual dot for Tatewaku!) */}
                  {secondaryFaction ? (
                    <>
                      <circle
                        cx={-halfW + 13}
                        cy={-3.5}
                        r="4.2"
                        fill={dotColor}
                        stroke="#141419"
                        strokeWidth="1.2"
                      />
                      <circle
                        cx={-halfW + 13}
                        cy={4.5}
                        r="4.2"
                        fill={secondaryFaction.accent}
                        stroke="#141419"
                        strokeWidth="1.2"
                      />
                    </>
                  ) : (
                    <circle
                      cx={-halfW + 13}
                      cy="0"
                      r="4.5"
                      fill={dotColor}
                      stroke="#141419"
                      strokeWidth="1.2"
                    />
                  )}

                  {/* Character Display Name — auto-scales smoothly for long EN/JA names */}
                  {(() => {
                    const approxUnits = Array.from(name).reduce(
                      (acc, ch) => acc + (ch.charCodeAt(0) > 255 ? 1.05 : 0.62),
                      0
                    );
                    const availPx = w - (char.badge ? 48 : char.cv ? 36 : 28);
                    const fontSize = Math.max(9.2, Math.min(13, availPx / Math.max(1, approxUnits)));
                    return (
                      <text
                        x={char.badge ? -8 : 4}
                        y={fontSize * 0.36}
                        textAnchor="middle"
                        fontSize={fontSize.toFixed(1)}
                        fontWeight="800"
                        fill={textColor}
                      >
                        {name}
                      </text>
                    );
                  })()}

                  {/* Optional compact right badge (Jersey #, Tower Floor, Cat, Star) */}
                  {char.badge && (
                    <g transform={`translate(${halfW - 18}, 0)`}>
                      <rect
                        x="-14"
                        y="-9.5"
                        width="28"
                        height="19"
                        rx="9.5"
                        fill={isSelected ? "#F7B647" : "#141419"}
                      />
                      <text
                        x="0"
                        y="3.8"
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="800"
                        fill={isSelected ? "#141419" : "#FFFFFF"}
                      >
                        {char.badge}
                      </text>
                    </g>
                  )}

                  {/* Tiny golden CV indicator dot at top-right if voiced in 2025 anime */}
                  {char.cv && !char.badge && (
                    <circle
                      cx={halfW - 10}
                      cy="0"
                      r="3.2"
                      fill="#F7B647"
                      stroke="#141419"
                      strokeWidth="1"
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Edge Story Banner (bottom-center when hovering/selecting an edge) */}
      {activeEdgeObject && (
        <div
          className="pointer-events-auto fixed bottom-24 left-1/2 -translate-x-1/2 z-30 max-w-md w-[calc(100vw-2rem)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#33333F] text-white rounded-2xl px-4 py-3 city-ink-card-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold flex-wrap">
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
                <span className="px-2 py-0.5 rounded-full bg-[#99CB77] text-[#141419]">
                  {pickText(CHARACTER_MAP[activeEdgeObject.to].mapName, locale)}
                </span>
                <span className="text-[#C4E4F5] ml-1">
                  ·{" "}
                  {activeEdgeObject.label
                    ? pickText(activeEdgeObject.label, locale)
                    : t.relationTypes[activeEdgeObject.type]}
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
