import React from "react";
import { ArrowLeftRight, Route, X } from "lucide-react";
import type { Character, Locale } from "../types";
import { CHARACTERS, CHARACTER_MAP } from "../data/characters";
import { FACTION_MAP } from "../data/factions";
import { UI_TEXT, pickText } from "../data/i18n";
import type { PathResult } from "../utils/pathfinding";

interface PathFinderBarProps {
  locale: Locale;
  startId: string | null;
  endId: string | null;
  result: PathResult | null;
  onChangeStart: (id: string) => void;
  onChangeEnd: (id: string) => void;
  onSwap: () => void;
  onClose: () => void;
  onLocateCharacter: (char: Character) => void;
}

export const PathFinderBar: React.FC<PathFinderBarProps> = ({
  locale,
  startId,
  endId,
  result,
  onChangeStart,
  onChangeEnd,
  onSwap,
  onClose,
  onLocateCharacter,
}) => {
  const t = UI_TEXT[locale];

  const sortedChars = React.useMemo(
    () =>
      [...CHARACTERS].sort((a, b) =>
        pickText(a.mapName, locale).localeCompare(pickText(b.mapName, locale))
      ),
    [locale]
  );

  return (
    <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-1.5rem)] max-w-2xl pointer-events-auto">
      <div className="bg-white/96 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 city-ink-card">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#F7B647] border-2 border-[#141419] flex items-center justify-center">
              <Route className="w-3.5 h-3.5 text-[#141419]" />
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-[#141419] leading-tight">
                {t.pathTitle}
              </h2>
              <p className="text-[10.5px] font-bold text-[#666678]">{t.pathPickHint}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#141419] text-white hover:bg-[#DD5549] flex items-center justify-center cursor-pointer transition-colors"
            aria-label={t.pathClear}
            title={t.pathClear}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selectors row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={startId ?? ""}
            onChange={(e) => onChangeStart(e.target.value)}
            aria-label={t.pathFrom}
            className="flex-1 px-3 py-2 rounded-xl border-2 border-[#141419] bg-[#FFF4D6] text-xs font-extrabold text-[#141419] focus:outline-none cursor-pointer"
          >
            <option value="">{t.pathFrom}…</option>
            {sortedChars.map((c) => (
              <option key={c.id} value={c.id}>
                {pickText(c.fullName, locale)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onSwap}
            className="self-center w-8 h-8 rounded-full border-2 border-[#141419] bg-white hover:bg-[#C4E4F5] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            aria-label={t.pathSwap}
            title={t.pathSwap}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <select
            value={endId ?? ""}
            onChange={(e) => onChangeEnd(e.target.value)}
            aria-label={t.pathTo}
            className="flex-1 px-3 py-2 rounded-xl border-2 border-[#141419] bg-[#FCE2EA] text-xs font-extrabold text-[#141419] focus:outline-none cursor-pointer"
          >
            <option value="">{t.pathTo}…</option>
            {sortedChars.map((c) => (
              <option key={c.id} value={c.id}>
                {pickText(c.fullName, locale)}
              </option>
            ))}
          </select>
        </div>

        {/* Quick fun presets */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {(
            [
              { from: "kuratake", to: "mimineko", label: t.pathExample1 },
              { from: "nagumo", to: "tatewaku", label: t.pathExample2 },
              { from: "tanabe", to: "tekaridake", label: t.pathExample3 },
              {
                from: "nagumo",
                to: "john-lennon",
                label:
                  locale === "zh"
                    ? "南云 → 约翰·列侬 (?)"
                    : locale === "ja"
                    ? "南雲 → ジョン・レノン (?)"
                    : "Nagumo → John Lennon (?)",
              },
            ] as const
          ).map((ex) => (
            <button
              key={`${ex.from}-${ex.to}`}
              type="button"
              onClick={() => {
                onChangeStart(ex.from);
                onChangeEnd(ex.to);
              }}
              className="px-2.5 py-0.5 rounded-full border border-[#141419]/30 bg-[#F6F5F0] hover:bg-[#99CB77] hover:border-[#141419] text-[10.5px] font-extrabold text-[#141419] transition-colors cursor-pointer"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Path Result */}
        {result && (
          <div className="mt-3 pt-2.5 border-t-2 border-dashed border-[#141419]/20">
            {result.isJohnLennon ? (
              <div className="bg-[#33333F] text-[#F7B647] rounded-xl px-3.5 py-2.5 text-xs font-extrabold">
                {t.pathJohnLennon}
              </div>
            ) : result.sameNode ? (
              <div className="text-xs font-extrabold text-[#5A5A6A]">{t.pathSame}</div>
            ) : !result.found ? (
              <div className="text-xs font-extrabold text-[#DD5549]">{t.pathNotFound}</div>
            ) : (
              <div>
                <div className="text-xs font-black text-[#DD5549] mb-2">
                  {t.pathSteps(result.steps.length)}
                </div>
                <div className="flex items-center flex-wrap gap-1.5">
                  {result.nodes.map((nodeId, idx) => {
                    const char = CHARACTER_MAP[nodeId];
                    const nextStep = result.steps[idx];
                    if (!char) return null;
                    const stepLabel = nextStep
                      ? nextStep.edge
                        ? nextStep.edge.label
                          ? pickText(nextStep.edge.label, locale)
                          : t.relationTypes[nextStep.edge.type]
                        : nextStep.sharedFactionId && FACTION_MAP[nextStep.sharedFactionId]
                        ? pickText(FACTION_MAP[nextStep.sharedFactionId].shortName, locale)
                        : "·"
                      : null;

                    return (
                      <React.Fragment key={nodeId}>
                        <button
                          type="button"
                          onClick={() => onLocateCharacter(char)}
                          className={`px-2.5 py-1 rounded-full border-2 border-[#141419] text-xs font-extrabold cursor-pointer hover:scale-105 transition-transform ${
                            idx === 0
                              ? "bg-[#F7B647]"
                              : idx === result.nodes.length - 1
                              ? "bg-[#F09CB4]"
                              : "bg-white"
                          }`}
                        >
                          {pickText(char.mapName, locale)}
                        </button>
                        {stepLabel && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#5A5A6A]">
                            <span>—</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#F4F3EE] border border-[#141419]/20 text-[#141419]">
                              {stepLabel}
                            </span>
                            <span>→</span>
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
