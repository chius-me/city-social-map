import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Maximize2, Minus, Plus, Search, X } from "lucide-react";
import type { Character, Faction, FactionId, Locale, RelationType } from "../types";
import { CHARACTERS } from "../data/characters";
import { FACTIONS, FACTION_MAP } from "../data/factions";
import { UI_TEXT, pickText } from "../data/i18n";
import { getDisplayBadge, getDisplayFullName, getDisplayMapName } from "../utils/display";
import type { ViewMode } from "./TopBar";

interface BottomControlsProps {
  locale: Locale;
  spoilerFree: boolean;
  viewMode: ViewMode;
  visibleRelationTypes: Record<RelationType, boolean>;
  onToggleRelationType: (t: RelationType) => void;
  selectedFactionId: FactionId | null;
  onJumpToFaction: (faction: Faction | null) => void;
  onLocateCharacter: (char: Character) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  drawerOpen?: boolean;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const FEATURED_SLIDE_IDS = [
  "nagumo",
  "niikura",
  "wako",
  "obaba",
  "chef-makabe",
  "tatewaku",
  "matsuri",
  "ecchan",
  "riko-izumi",
  "dr-adatara",
  "kamaboko",
  "naganohara",
  "tanabe",
  "tekaridake",
  "honkan",
  "mimineko",
  "john-lennon",
];

export const BottomControls: React.FC<BottomControlsProps> = ({
  locale,
  spoilerFree,
  viewMode,
  visibleRelationTypes,
  onToggleRelationType,
  selectedFactionId,
  onJumpToFaction,
  onLocateCharacter,
  onZoomIn,
  onZoomOut,
  onResetView,
  drawerOpen = false,
  searchInputRef,
}) => {
  const t = UI_TEXT[locale];
  const [slideIdx, setSlideIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const featuredChars = useMemo(
    () =>
      FEATURED_SLIDE_IDS.map((id) => CHARACTERS.find((c) => c.id === id)).filter(
        (c): c is Character => Boolean(c)
      ),
    []
  );

  const currentSlideChar = featuredChars[slideIdx] ?? CHARACTERS[0];

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CHARACTERS.filter((c) => {
      const hay = [
        c.mapName.zh,
        c.mapName.en,
        c.mapName.ja,
        c.fullName.zh,
        c.fullName.en,
        c.fullName.ja,
        c.spoilerSafeName?.zh ?? "",
        c.spoilerSafeName?.en ?? "",
        c.spoilerSafeName?.ja ?? "",
        c.reading ?? "",
        c.cv?.zh ?? "",
        c.cv?.en ?? "",
        c.cv?.ja ?? "",
        c.badge ?? "",
        ...(c.aliases ?? []),
        ...c.factions.map((fid) => {
          const f = FACTION_MAP[fid];
          return f ? `${f.name.zh} ${f.name.en} ${f.name.ja}` : "";
        }),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    }).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const handleSelectResult = (char: Character) => {
    setQuery("");
    setSearchFocused(false);
    onLocateCharacter(char);
  };

  const activeLayerCount = Object.values(visibleRelationTypes).filter(Boolean).length;

  return (
    <>
      {/* Bottom-Left Compact Floating Filter & Faction Quick-Jump Dock */}
      <div className="fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-30 flex flex-col items-start gap-2 pointer-events-auto">
        {filterOpen && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 w-72 sm:w-80 city-ink-card-sm max-h-[60vh] overflow-y-auto city-scroll">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold">
                  {viewMode === "map" ? t.legendTitle : t.factionsTitle}
                </span>
                <span className="city-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="p-1 rounded-full hover:bg-black/5 cursor-pointer"
                aria-label={t.close}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Relation layer toggles (Classic Map only — Network has its own 6-category bar) */}
            {viewMode === "map" && (
              <>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {(["children", "friendship", "employment", "specific"] as RelationType[]).map(
                    (type) => {
                      const active = visibleRelationTypes[type];
                      const swatch =
                        type === "children"
                          ? "bg-[#252430]"
                          : type === "friendship"
                          ? "bg-[#1395EA]"
                          : type === "employment"
                          ? "bg-[#C88412]"
                          : "bg-[#DD5549]";
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => onToggleRelationType(type)}
                          className={`px-2.5 py-1.5 rounded-xl border-2 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            active
                              ? "bg-[#FFFDF9] border-[#141419] text-[#141419]"
                              : "bg-gray-100 border-gray-300 text-gray-400 line-through"
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${swatch}`} />
                          <span className="truncate">{t.relationTypes[type]}</span>
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="text-[11px] font-extrabold text-[#5A5A6A] mb-1.5">
                  {t.factionsTitle}
                </div>
              </>
            )}

            {/* Faction quick-jump pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onJumpToFaction(null)}
                className={`px-2.5 py-1 rounded-full border-2 text-[11px] font-extrabold cursor-pointer transition-colors ${
                  selectedFactionId === null
                    ? "bg-[#141419] text-white border-[#141419]"
                    : "bg-white text-[#141419] border-[#141419]/30 hover:border-[#141419]"
                }`}
              >
                {t.allFactions}
              </button>
              {FACTIONS.map((f) => {
                const isSel = selectedFactionId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onJumpToFaction(f)}
                    style={{
                      backgroundColor: isSel ? f.accent : f.fill,
                      color: isSel ? "#FFFFFF" : f.ink,
                    }}
                    className="px-2.5 py-1 rounded-full border-2 border-[#141419] text-[11px] font-extrabold cursor-pointer hover:scale-[1.03] transition-transform"
                  >
                    {pickText(f.shortName, locale)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className="bg-white/95 backdrop-blur-md px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-full city-ink-pill flex items-center gap-1.5 sm:gap-2 text-xs font-extrabold cursor-pointer hover:bg-[#FFF6E0] transition-colors"
          aria-label={viewMode === "map" ? t.legendTitle : t.factionsTitle}
        >
          <Filter className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {viewMode === "map" ? t.legendTitle : t.factionsTitle}
          </span>
          {viewMode === "map" ? (
            <span className="px-1.5 py-0.5 rounded-full bg-[#141419] text-white text-[10px]">
              {activeLayerCount}/4
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-[#141419] text-white text-[10px]">
              8
            </span>
          )}
        </button>
      </div>

      {/* Bottom-Right Official-Site-Inspired Character Finder + Stacked Pill Zoom Controls */}
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-30 flex items-end gap-2 sm:gap-3.5 pointer-events-auto">
        {/* Official `.controls-character` Character Search & Stepper Pill */}
        <div ref={searchBoxRef} className="relative flex flex-col items-end">
          {/* Search Autocomplete Popover with Circular Avatars */}
          {searchFocused && query.trim().length > 0 && (
            <div className="mb-2 w-72 sm:w-80 bg-white/98 rounded-2xl city-ink-card-sm overflow-hidden">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-xs font-bold text-[#6B6B7C]">
                  {t.searchNoResults}
                </div>
              ) : (
                <ul className="divide-y divide-[#141419]/10 max-h-72 overflow-y-auto city-scroll">
                  {searchResults.map((c) => {
                    const fac = c.factions[0] ? FACTION_MAP[c.factions[0]] : null;
                    const badge = getDisplayBadge(c, spoilerFree);
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectResult(c)}
                          className="w-full px-3 py-2 flex items-center justify-between gap-2.5 text-left hover:bg-[#FFF6E0] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-8 h-8 rounded-full p-[1.5px] border-[1.8px] border-[#141419] shrink-0"
                              style={{ backgroundColor: fac?.accent ?? "#1395EA" }}
                            >
                              <img
                                src={c.avatar}
                                alt=""
                                className="w-full h-full rounded-full object-cover bg-white"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-extrabold text-[#141419] truncate">
                                {getDisplayFullName(c, locale, spoilerFree)}
                              </div>
                              <div className="text-[10.5px] text-[#666678] truncate">
                                {pickText(c.role, locale)}
                                {c.cv ? ` · CV: ${pickText(c.cv, locale)}` : ""}
                              </div>
                            </div>
                          </div>
                          {badge && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#141419] text-white text-[10px] font-extrabold shrink-0">
                              {badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Official-style label above pill */}
          {!drawerOpen && (
            <div className="hidden sm:flex items-center gap-1.5 mb-1 pr-2">
              <span className="text-[11px] font-extrabold tracking-wide text-[#141419] bg-white/85 px-2 py-0.5 rounded-full border border-[#141419]/20">
                {locale === "zh"
                  ? "寻找 CITY 的居民"
                  : locale === "ja"
                  ? "CITYの住人を探そう"
                  : "Find a CITY Resident"}
              </span>
            </div>
          )}

          {/* `.controls-character-block` rounded white pill */}
          <div className="bg-white/95 backdrop-blur-md p-1.5 pl-2.5 rounded-full city-ink-pill flex items-center gap-1.5 sm:gap-2">
            {/* Prev/Next Featured Character Cycler with mini avatar (hidden when typing) */}
            {query.trim().length === 0 && (
              <div className="hidden sm:flex items-center gap-1 pr-1.5 border-r border-[#141419]/15">
                <button
                  type="button"
                  onClick={() =>
                    setSlideIdx((i) => (i - 1 + featuredChars.length) % featuredChars.length)
                  }
                  className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                  aria-label="Previous resident"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onLocateCharacter(currentSlideChar)}
                  className="flex items-center gap-1.5 max-w-[126px] text-xs font-extrabold text-[#141419] px-1 hover:text-[#DD5549] cursor-pointer"
                  title={t.flyToCharacter}
                >
                  <img
                    src={currentSlideChar.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover border-[1.5px] border-[#141419] shrink-0 bg-white"
                  />
                  <span className="truncate">
                    {getDisplayMapName(currentSlideChar, locale, spoilerFree)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSlideIdx((i) => (i + 1) % featuredChars.length)}
                  className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                  aria-label="Next resident"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Live Instant Search Input */}
            <div className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchResults.length > 0) {
                    handleSelectResult(searchResults[0]);
                  } else if (e.key === "Escape") {
                    setQuery("");
                    setSearchFocused(false);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder={t.searchPlaceholder}
                className="w-28 sm:w-44 md:w-52 bg-transparent text-xs font-bold text-[#141419] placeholder:text-[#8A8A9C] focus:outline-none px-1.5 py-1"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-0.5 text-[#777] hover:text-[#141419] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Official circular `#141419` Locate / Search Button */}
            <button
              type="button"
              onClick={() => {
                if (searchResults.length > 0) {
                  handleSelectResult(searchResults[0]);
                } else {
                  onLocateCharacter(currentSlideChar);
                }
              }}
              className="w-9 h-9 rounded-full bg-[#141419] text-white flex items-center justify-center cursor-pointer city-hover-cycle hover:bg-[var(--hover-color)] hover:text-[#141419] transition-colors shrink-0"
              aria-label={t.flyToCharacter}
              title={t.flyToCharacter}
            >
              <Search className="w-4 h-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>

        {/* Official `.controls-zoom` Vertical Pill Zoom Controls */}
        <div className="flex flex-col gap-[3px] drop-shadow-[2.5px_2.5px_0_rgba(20,20,25,0.28)]">
          <button
            type="button"
            onClick={onZoomIn}
            className="city-zoom-btn city-zoom-btn--top city-hover-cycle"
            aria-label={t.zoomIn}
            title={`${t.zoomIn} (+)`}
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={onResetView}
            className="city-zoom-btn city-zoom-btn--mid city-hover-cycle"
            aria-label={t.resetView}
            title={`${t.resetView} (0)`}
          >
            <Maximize2 className="w-4 h-4" strokeWidth={2.6} />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="city-zoom-btn city-zoom-btn--bottom city-hover-cycle"
            aria-label={t.zoomOut}
            title={`${t.zoomOut} (-)`}
          >
            <Minus className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </>
  );
};
