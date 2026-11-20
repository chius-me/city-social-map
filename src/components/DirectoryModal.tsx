import React, { useMemo, useState } from "react";
import { MapPin, Mic, Search, X } from "lucide-react";
import type { Character, FactionId, Locale } from "../types";
import { CHARACTERS } from "../data/characters";
import { FACTIONS, FACTION_MAP } from "../data/factions";
import { UI_TEXT, pickText } from "../data/i18n";

interface DirectoryModalProps {
  open: boolean;
  locale: Locale;
  onClose: () => void;
  onPickCharacter: (char: Character) => void;
}

export const DirectoryModal: React.FC<DirectoryModalProps> = ({
  open,
  locale,
  onClose,
  onPickCharacter,
}) => {
  const t = UI_TEXT[locale];
  const [query, setQuery] = useState("");
  const [factionFilter, setFactionFilter] = useState<FactionId | "all" | "solo">("all");
  const [voicedOnly, setVoicedOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHARACTERS.filter((c) => {
      if (voicedOnly && !c.cv) return false;
      if (factionFilter === "solo" && c.factions.length > 0) return false;
      if (
        factionFilter !== "all" &&
        factionFilter !== "solo" &&
        !c.factions.includes(factionFilter)
      ) {
        return false;
      }
      if (!q) return true;
      const hay = [
        c.mapName.zh,
        c.mapName.en,
        c.mapName.ja,
        c.fullName.zh,
        c.fullName.en,
        c.fullName.ja,
        c.reading ?? "",
        c.cv?.zh ?? "",
        c.cv?.en ?? "",
        c.cv?.ja ?? "",
        c.role.zh,
        c.role.en,
        c.role.ja,
        c.badge ?? "",
        ...(c.aliases ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [factionFilter, query, voicedOnly]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-white/92 backdrop-blur-md city-confetti-bg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b-[3px] border-[#141419] bg-white/95 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#141419]">
              {t.directoryTitle}
            </h2>
            <span className="city-dots" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
          </div>
          <p className="text-xs font-bold text-[#666678] mt-0.5">{t.directorySubtitle}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-[#141419] text-white hover:bg-[#DD5549] flex items-center justify-center cursor-pointer transition-colors shrink-0"
          aria-label={t.close}
        >
          <X className="w-5 h-5" strokeWidth={2.8} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="px-4 sm:px-8 py-3.5 bg-[#FFFDF9]/90 border-b-2 border-[#141419]/15 flex flex-col gap-2.5 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[210px] max-w-md">
            <Search className="w-4 h-4 text-[#777788] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 rounded-full border-2 border-[#141419] bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#F7B647]"
            />
          </div>

          <button
            type="button"
            onClick={() => setVoicedOnly((v) => !v)}
            className={`px-3.5 py-2 rounded-full border-2 border-[#141419] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
              voicedOnly ? "bg-[#F7B647] text-[#141419]" : "bg-white text-[#141419]"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{t.filterVoiced}</span>
          </button>

          <span className="text-xs font-extrabold text-[#5A5A6A] ml-auto">
            {filtered.length} / {CHARACTERS.length} {t.characterCount}
          </span>
        </div>

        {/* Faction Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFactionFilter("all")}
            className={`px-3 py-1 rounded-full border-2 border-[#141419] text-xs font-extrabold cursor-pointer ${
              factionFilter === "all" ? "bg-[#141419] text-white" : "bg-white text-[#141419]"
            }`}
          >
            {t.filterAll}
          </button>
          {FACTIONS.map((f) => {
            const active = factionFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFactionFilter(f.id)}
                style={{
                  backgroundColor: active ? f.accent : f.fill,
                  color: active ? "#FFFFFF" : f.ink,
                }}
                className="px-3 py-1 rounded-full border-2 border-[#141419] text-xs font-extrabold cursor-pointer hover:scale-[1.02] transition-transform"
              >
                {pickText(f.shortName, locale)}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setFactionFilter("solo")}
            className={`px-3 py-1 rounded-full border-2 border-[#141419] text-xs font-extrabold cursor-pointer ${
              factionFilter === "solo"
                ? "bg-[#1395EA] text-white"
                : "bg-[#E6F4FD] text-[#103252]"
            }`}
          >
            {t.soloResident}
          </button>
        </div>
      </div>

      {/* Cards Grid with Character Portrait Avatars */}
      <div className="flex-1 overflow-y-auto city-scroll px-4 sm:px-8 py-6">
        {filtered.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl city-ink-card p-6">
            <p className="text-sm font-extrabold text-[#5A5A6A]">{t.searchNoResults}</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((char) => {
              const primary = char.factions[0] ? FACTION_MAP[char.factions[0]] : null;
              const displayName = pickText(char.fullName, locale);

              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => {
                    onPickCharacter(char);
                    onClose();
                  }}
                  className="text-left bg-white rounded-2xl overflow-hidden city-ink-card-sm hover:-translate-y-1 hover:shadow-[5px_5px_0_#141419] transition-all cursor-pointer flex flex-col"
                >
                  <div
                    className="px-3.5 py-3 border-b-2 border-[#141419] flex items-center gap-3"
                    style={{ backgroundColor: primary?.fill ?? "#E6F4FD" }}
                  >
                    <div
                      className="w-13 h-13 rounded-full p-[2px] border-2 border-[#141419] shadow-[2px_2px_0_#141419] shrink-0"
                      style={{ backgroundColor: primary?.accent ?? "#1395EA" }}
                    >
                      <img
                        src={char.avatar}
                        alt={displayName}
                        className="w-full h-full rounded-full object-cover bg-white"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      {char.reading && (
                        <div className="text-[10px] font-bold text-[#141419]/65 truncate">
                          {char.reading}
                        </div>
                      )}
                      <div className="text-base font-black text-[#141419] truncate">
                        {displayName}
                      </div>
                    </div>
                    {char.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-[#141419] text-[#F7B647] text-[10.5px] font-extrabold shrink-0">
                        {char.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {char.factions.length > 0 ? (
                        char.factions.map((fid) => (
                          <span
                            key={fid}
                            className="px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-[#141419]/30 bg-[#F6F5F0]"
                          >
                            {pickText(FACTION_MAP[fid].shortName, locale)}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-[#141419]/30 bg-[#E6F4FD]">
                          {t.soloResident}
                        </span>
                      )}
                      {char.cv && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF4D6] border border-[#F7B647] text-[#141419] inline-flex items-center gap-1">
                          <Mic className="w-2.5 h-2.5 text-[#DD5549]" />
                          {pickText(char.cv, locale)}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-bold text-[#666678] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#8CC466] shrink-0" />
                      <span className="truncate">{pickText(char.role, locale)}</span>
                    </div>

                    {char.tagline && (
                      <div className="text-xs font-extrabold text-[#DD5549]">
                        “{pickText(char.tagline, locale)}”
                      </div>
                    )}

                    <p className="text-xs text-[#444455] leading-relaxed line-clamp-3 mt-auto">
                      {pickText(char.bio, locale)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
