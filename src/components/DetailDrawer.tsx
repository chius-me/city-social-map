import React, { useMemo } from "react";
import {
  Crosshair,
  ExternalLink,
  Flag,
  MapPin,
  Mic,
  Navigation,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { Character, Faction, Locale, RelationEdge } from "../types";
import { CHARACTERS, CHARACTER_MAP } from "../data/characters";
import { FACTION_MAP } from "../data/factions";
import { EDGES } from "../data/edges";
import { UI_TEXT, pickText } from "../data/i18n";

interface DetailDrawerProps {
  locale: Locale;
  character: Character | null;
  faction: Faction | null;
  onClose: () => void;
  onSelectCharacter: (char: Character) => void;
  onSelectFaction: (faction: Faction) => void;
  onLocateCharacter: (char: Character) => void;
  onSetPathEndpoint: (charId: string, which: "start" | "end") => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  locale,
  character,
  faction,
  onClose,
  onSelectCharacter,
  onSelectFaction,
  onLocateCharacter,
  onSetPathEndpoint,
}) => {
  const t = UI_TEXT[locale];

  const connections = useMemo(() => {
    if (!character) return [];
    const list: {
      edge: RelationEdge;
      other: Character;
      direction: "out" | "in" | "mutual";
    }[] = [];
    for (const edge of EDGES) {
      if (edge.from === character.id) {
        const other = CHARACTER_MAP[edge.to];
        if (other) {
          list.push({
            edge,
            other,
            direction:
              edge.bidirectional || edge.type === "friendship" ? "mutual" : "out",
          });
        }
      } else if (edge.to === character.id) {
        const other = CHARACTER_MAP[edge.from];
        if (other) {
          list.push({
            edge,
            other,
            direction:
              edge.bidirectional || edge.type === "friendship" ? "mutual" : "in",
          });
        }
      }
    }
    return list;
  }, [character]);

  const factionMembers = useMemo(() => {
    if (!faction) return [];
    return CHARACTERS.filter((c) => c.factions.includes(faction.id));
  }, [faction]);

  if (!character && !faction) return null;

  return (
    <aside
      className="fixed top-[70px] right-3 sm:right-4 bottom-24 sm:bottom-[118px] z-40 w-[calc(100vw-1.5rem)] sm:w-[376px] pointer-events-auto flex flex-col"
      aria-label="Details"
    >
      {/* Official rotating 4-color conic-gradient border frame (.page-frame) */}
      <div className="city-conic-frame rounded-[24px] h-full flex flex-col shadow-[6px_6px_0_#141419] border-[2.5px] border-[#141419]">
        <div className="bg-[#FFFDF9] rounded-[20px] h-full flex flex-col overflow-hidden">
          {character ? (
            <CharacterPanel
              locale={locale}
              t={t}
              character={character}
              connections={connections}
              onClose={onClose}
              onSelectCharacter={onSelectCharacter}
              onSelectFaction={onSelectFaction}
              onLocateCharacter={onLocateCharacter}
              onSetPathEndpoint={onSetPathEndpoint}
            />
          ) : faction ? (
            <FactionPanel
              locale={locale}
              t={t}
              faction={faction}
              members={factionMembers}
              onClose={onClose}
              onSelectCharacter={onSelectCharacter}
            />
          ) : null}
        </div>
      </div>
    </aside>
  );
};

interface CharacterPanelProps {
  locale: Locale;
  t: (typeof UI_TEXT)[Locale];
  character: Character;
  connections: {
    edge: RelationEdge;
    other: Character;
    direction: "out" | "in" | "mutual";
  }[];
  onClose: () => void;
  onSelectCharacter: (char: Character) => void;
  onSelectFaction: (faction: Faction) => void;
  onLocateCharacter: (char: Character) => void;
  onSetPathEndpoint: (charId: string, which: "start" | "end") => void;
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({
  locale,
  t,
  character,
  connections,
  onClose,
  onSelectCharacter,
  onSelectFaction,
  onLocateCharacter,
  onSetPathEndpoint,
}) => {
  const primaryFaction = character.factions[0] ? FACTION_MAP[character.factions[0]] : null;
  const headerBg = primaryFaction ? primaryFaction.fill : "#E6F4FD";
  const accentColor = primaryFaction ? primaryFaction.accent : "#1395EA";
  const isJohnLennon = character.id === "john-lennon";

  return (
    <>
      {/* Header Banner */}
      <div
        className="relative px-5 pt-4 pb-4 border-b-[2.5px] border-[#141419]"
        style={{ backgroundColor: headerBg }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#141419] text-white flex items-center justify-center hover:bg-[#DD5549] transition-colors cursor-pointer"
          aria-label={t.close}
        >
          <X className="w-4 h-4" strokeWidth={2.8} />
        </button>

        {/* Faction badges */}
        <div className="flex flex-wrap items-center gap-1.5 pr-9 mb-2">
          {character.factions.length > 0 ? (
            character.factions.map((fid) => {
              const f = FACTION_MAP[fid];
              if (!f) return null;
              return (
                <button
                  key={fid}
                  type="button"
                  onClick={() => onSelectFaction(f)}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border-2 border-[#141419] bg-white text-[#141419] hover:bg-[#141419] hover:text-white transition-colors cursor-pointer"
                >
                  {pickText(f.shortName, locale)}
                </button>
              );
            })
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border-2 border-[#141419] bg-white text-[#141419]">
              {t.soloResident}
            </span>
          )}
          {character.badge && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#141419] text-[#F7B647]">
              {character.badge}
            </span>
          )}
        </div>

        {/* Name + Avatar Emblem */}
        <div className="flex items-center gap-3">
          <div
            className="w-13 h-13 rounded-2xl border-[2.5px] border-[#141419] flex items-center justify-center text-xl font-black text-white shrink-0 shadow-[2px_2px_0_#141419]"
            style={{ backgroundColor: accentColor }}
          >
            {pickText(character.mapName, locale).slice(0, 2)}
          </div>
          <div className="min-w-0">
            {character.reading && (
              <div className="text-[11px] font-bold text-[#141419]/65 tracking-wider">
                {character.reading}
              </div>
            )}
            <h2 className="text-xl font-black text-[#141419] leading-tight">
              {pickText(character.fullName, locale)}
            </h2>
            <div className="text-xs font-bold text-[#141419]/70 mt-0.5 truncate">
              {locale === "zh"
                ? `${character.fullName.ja} · ${character.fullName.en}`
                : locale === "ja"
                ? `${character.fullName.en} · ${character.fullName.zh}`
                : `${character.fullName.ja} · ${character.fullName.zh}`}
            </div>
          </div>
        </div>

        {character.factions.length > 1 && (
          <div className="mt-2 text-[11px] font-extrabold text-[#141419]/80 bg-white/75 rounded-lg px-2.5 py-1 inline-flex items-center gap-1 border border-[#141419]/25">
            <Sparkles className="w-3 h-3 text-[#DD5549]" />
            <span>{t.overlapNote}</span>
          </div>
        )}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto city-scroll px-5 py-4 space-y-4">
        {/* Role & CV Grid */}
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-white rounded-xl p-2.5 border-2 border-[#141419]/15 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#8CC466] shrink-0 mt-0.5" />
            <div>
              <div className="text-[10.5px] font-extrabold text-[#777788] uppercase">
                {t.affiliation}
              </div>
              <div className="text-xs font-extrabold text-[#141419]">
                {pickText(character.role, locale)}
              </div>
            </div>
          </div>

          {character.cv && (
            <div className="bg-[#FFF9EC] rounded-xl p-2.5 border-2 border-[#F7B647] flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#DD5549] shrink-0" />
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[10.5px] font-extrabold text-[#8A6110] uppercase">
                  {t.voiceActor}
                </span>
                <span className="text-sm font-black text-[#141419]">
                  {pickText(character.cv, locale)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Official / Iconic Catchphrase & Bio in Official #33333F Commentary Bubble */}
        <div className="bg-[#33333F] text-white rounded-2xl p-4 border-2 border-[#141419] relative">
          {character.tagline && (
            <div className="text-xs font-extrabold text-[#F7B647] mb-1.5 flex items-center gap-1.5">
              <span>★</span>
              <span>{pickText(character.tagline, locale)}</span>
            </div>
          )}
          <p className="text-xs sm:text-[13px] leading-relaxed text-white/95">
            {pickText(character.bio, locale)}
          </p>
        </div>

        {/* Quick Actions: Locate + Path Finder Endpoints */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onLocateCharacter(character)}
            className="px-2 py-2 rounded-xl border-2 border-[#141419] bg-[#C4E4F5] hover:bg-[#1395EA] hover:text-white text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{t.flyToCharacter}</span>
          </button>
          <button
            type="button"
            onClick={() => onSetPathEndpoint(character.id, "start")}
            className="px-2 py-2 rounded-xl border-2 border-[#141419] bg-[#F7B647]/35 hover:bg-[#F7B647] text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{t.setPathStart}</span>
          </button>
          <button
            type="button"
            onClick={() => onSetPathEndpoint(character.id, "end")}
            className="px-2 py-2 rounded-xl border-2 border-[#141419] bg-[#F09CB4]/35 hover:bg-[#F09CB4] text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t.setPathEnd}</span>
          </button>
        </div>

        {/* Relationships List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
              <span>{t.connectionsTitle}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#141419] text-white text-[10px]">
                {connections.length}
              </span>
            </h3>
            <span className="city-dots" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
          </div>

          {connections.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-[#141419]/35 p-3.5 bg-white text-xs font-bold text-[#5A5A6A] leading-relaxed">
              {isJohnLennon ? t.johnLennonEasterEgg : t.noConnections}
            </div>
          ) : (
            <ul className="space-y-2">
              {connections.map(({ edge, other, direction }) => {
                const otherFaction = other.factions[0] ? FACTION_MAP[other.factions[0]] : null;
                const badgeColor =
                  edge.type === "children"
                    ? "bg-[#252430] text-white"
                    : edge.type === "friendship"
                    ? "bg-[#C4E4F5] text-[#141419]"
                    : edge.type === "employment"
                    ? "bg-[#FDF0B5] text-[#4A3604]"
                    : "bg-[#FAD4DF] text-[#4A1828]";
                const arrow =
                  direction === "mutual"
                    ? t.edgeDirectionBoth
                    : direction === "out"
                    ? t.edgeDirectionTo
                    : t.edgeDirectionFrom;

                return (
                  <li key={edge.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCharacter(other);
                        onLocateCharacter(other);
                      }}
                      className="w-full text-left bg-white hover:bg-[#FFF8EA] rounded-xl p-2.5 border-2 border-[#141419]/20 hover:border-[#141419] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-black text-[#DD5549]">{arrow}</span>
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-[#141419] shrink-0"
                            style={{ backgroundColor: otherFaction?.accent ?? "#1395EA" }}
                          />
                          <span className="text-xs font-extrabold text-[#141419] truncate group-hover:underline">
                            {pickText(other.fullName, locale)}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border border-[#141419]/30 ${badgeColor}`}
                        >
                          {edge.label
                            ? pickText(edge.label, locale)
                            : t.relationTypes[edge.type]}
                        </span>
                      </div>
                      <p className="text-[11px] leading-snug text-[#5A5A6A] line-clamp-2">
                        {pickText(edge.story, locale)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* External Links */}
        <div className="flex flex-wrap gap-2 pt-1 pb-2">
          {character.wikiUrl && (
            <a
              href={character.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[130px] px-3 py-2 rounded-xl border-2 border-[#141419] bg-white hover:bg-[#F7B647] text-xs font-extrabold text-[#141419] flex items-center justify-center gap-1.5 transition-colors no-underline"
            >
              <span>{t.openWiki}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {character.officialSite && (
            <a
              href="https://city-the-animation.com/character/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[130px] px-3 py-2 rounded-xl border-2 border-[#141419] bg-[#141419] hover:bg-[#EE847D] text-xs font-extrabold text-white hover:text-[#141419] flex items-center justify-center gap-1.5 transition-colors no-underline"
            >
              <span>{t.openOfficial}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </>
  );
};

interface FactionPanelProps {
  locale: Locale;
  t: (typeof UI_TEXT)[Locale];
  faction: Faction;
  members: Character[];
  onClose: () => void;
  onSelectCharacter: (char: Character) => void;
}

const FactionPanel: React.FC<FactionPanelProps> = ({
  locale,
  t,
  faction,
  members,
  onClose,
  onSelectCharacter,
}) => {
  return (
    <>
      <div
        className="relative px-5 pt-4 pb-4 border-b-[2.5px] border-[#141419]"
        style={{ backgroundColor: faction.fill }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#141419] text-white flex items-center justify-center hover:bg-[#DD5549] transition-colors cursor-pointer"
          aria-label={t.close}
        >
          <X className="w-4 h-4" strokeWidth={2.8} />
        </button>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border-2 border-[#141419] text-[11px] font-extrabold mb-2">
          <Users className="w-3 h-3" />
          <span>
            {members.length} {t.characterCount}
          </span>
        </div>

        <h2 className="text-xl font-black text-[#141419] pr-8 leading-tight">
          {pickText(faction.name, locale)}
        </h2>
        <p className="text-xs font-bold text-[#141419]/75 mt-1">
          {pickText(faction.subtitle, locale)}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto city-scroll px-5 py-4 space-y-4">
        <div className="bg-white rounded-xl p-2.5 border-2 border-[#141419]/15 flex items-center gap-2 text-xs font-extrabold">
          <MapPin className="w-4 h-4 text-[#8CC466] shrink-0" />
          <span>{pickText(faction.location, locale)}</span>
        </div>

        <div className="bg-[#33333F] text-white rounded-2xl p-4 border-2 border-[#141419]">
          <p className="text-xs sm:text-[13px] leading-relaxed text-white/95">
            {pickText(faction.description, locale)}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-wide mb-2 flex items-center justify-between">
            <span>{t.factionMembers}</span>
            <span className="city-dots" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectCharacter(m)}
                className="px-3 py-2 rounded-xl border-2 border-[#141419] bg-white hover:bg-[#FFF6E0] text-left transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="text-xs font-extrabold text-[#141419] truncate flex items-center justify-between gap-1">
                  <span className="truncate">{pickText(m.mapName, locale)}</span>
                  {m.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#141419] text-[#F7B647] text-[9.5px] shrink-0">
                      {m.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-bold text-[#666678] truncate mt-0.5">
                  {m.cv ? `CV: ${pickText(m.cv, locale)}` : pickText(m.role, locale)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {faction.wikiUrl && (
          <a
            href={faction.wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-3 py-2.5 rounded-xl border-2 border-[#141419] bg-white hover:bg-[#F7B647] text-xs font-extrabold text-[#141419] flex items-center justify-center gap-1.5 transition-colors no-underline"
          >
            <span>{t.openWiki}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </>
  );
};
