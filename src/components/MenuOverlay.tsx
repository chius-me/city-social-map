import React from "react";
import {
  BookOpen,
  Compass,
  ExternalLink,
  Keyboard,
  Map,
  Route,
  Sparkles,
} from "lucide-react";
import type { Locale } from "../types";
import { RESOURCE_CATEGORIES } from "../data/resources";
import { UI_TEXT, pickText } from "../data/i18n";
import {
  CITY_SITES,
  CityDots,
  CityMenuOverlay,
  GitHubMark,
  type CityMenuTile,
} from "./city-shell";

interface MenuOverlayProps {
  open: boolean;
  locale: Locale;
  onClose: () => void;
  onOpenMap: () => void;
  onOpenNetwork: () => void;
  onOpenDirectory: () => void;
  onOpenPathFinder: () => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  open,
  locale,
  onClose,
  onOpenMap,
  onOpenNetwork,
  onOpenDirectory,
  onOpenPathFinder,
}) => {
  const t = UI_TEXT[locale];
  const currentSite = CITY_SITES["social-map"];
  const sisterSite = CITY_SITES.avatar;

  const tiles: CityMenuTile[] = [
    {
      id: "map",
      tone: "c",
      icon: <Map className="w-6 h-6 text-[#141419] shrink-0" strokeWidth={2.5} />,
      title: t.mapTab,
      subtitle: `65 ${t.characterCount} · 8 ${t.factionCount}`,
      onClick: onOpenMap,
    },
    {
      id: "network",
      tone: "sky",
      icon: <Compass className="w-6 h-6 text-[#141419] shrink-0" strokeWidth={2.5} />,
      title: t.networkTab,
      subtitle: "EGO RADAR",
      onClick: onOpenNetwork,
    },
    {
      id: "directory",
      tone: "i",
      icon: <BookOpen className="w-6 h-6 text-[#141419] shrink-0" strokeWidth={2.5} />,
      title: t.directoryTab,
      subtitle: "CHARACTERS",
      onClick: onOpenDirectory,
    },
    {
      id: "path",
      tone: "t",
      icon: <Route className="w-6 h-6 text-[#141419] shrink-0" strokeWidth={2.5} />,
      title: t.pathTab,
      subtitle: "SIX DEGREES",
      onClick: onOpenPathFinder,
    },
  ];

  return (
    <CityMenuOverlay
      siteId="social-map"
      open={open}
      locale={locale}
      tagline={`“${t.tagline}”`}
      tiles={tiles}
      onClose={onClose}
      wide
    >
      {/* Curated Resources from awesome-citytheanimation */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-[#DD5549]" />
          <h3 className="text-base sm:text-lg font-black text-[#141419]">
            {t.menuResourcesTitle}
          </h3>
          <CityDots />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {RESOURCE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl overflow-hidden city-ink-card-sm flex flex-col"
            >
              <div
                className="px-4 py-2.5 border-b-2 border-[#141419] font-black text-sm text-[#141419] flex items-center justify-between"
                style={{ backgroundColor: cat.accent }}
              >
                <span>{pickText(cat.title, locale)}</span>
              </div>
              <ul className="divide-y divide-[#141419]/12">
                {cat.items.map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 hover:bg-[#FFF8EA] transition-colors no-underline group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-extrabold text-[#141419] group-hover:text-[#DD5549] transition-colors">
                          {pickText(item.title, locale)}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.tag && (
                            <span className="px-1.5 py-0.5 rounded bg-[#141419] text-white text-[9.5px] font-extrabold">
                              {item.tag}
                            </span>
                          )}
                          <ExternalLink className="w-3.5 h-3.5 text-[#777788] group-hover:text-[#141419]" />
                        </div>
                      </div>
                      <p className="text-[11.5px] text-[#5A5A6A] mt-0.5 leading-snug">
                        {pickText(item.description, locale)}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Controls & Credits Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Shortcuts */}
        <div className="bg-white rounded-2xl p-5 city-ink-card-sm">
          <h3 className="text-sm font-black text-[#141419] mb-3 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#1395EA]" />
            <span>{t.menuShortcutsTitle}</span>
          </h3>
          <ul className="space-y-2">
            {t.shortcuts.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3 text-xs">
                <kbd className="px-2 py-0.5 rounded-lg bg-[#F4F3EE] border-2 border-[#141419] font-extrabold text-[#141419]">
                  {s.key}
                </kbd>
                <span className="font-bold text-[#444455] text-right">{s.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Credits & Original Links */}
        <div className="bg-[#33333F] text-white rounded-2xl p-5 city-ink-card-sm flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-[#F7B647] mb-2">{t.menuCreditsTitle}</h3>
            <p className="text-xs leading-relaxed text-white/90">{t.menuCreditsBody}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://city.wiki.gg/wiki/File:CITY_Social_Map_by_VayItsHere.jpeg"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-[#F7B647] text-[#141419] text-[11px] font-extrabold no-underline hover:opacity-90"
            >
              {t.originalMapLink} ↗
            </a>
            <a
              href={sisterSite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-[#F09CB4] text-[#141419] text-[11px] font-extrabold no-underline hover:opacity-90"
            >
              {pickText(sisterSite.shortLabel, locale)} ↗
            </a>
            <a
              href={currentSite.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-white text-[#141419] text-[11px] font-extrabold no-underline hover:opacity-90 inline-flex items-center gap-1"
            >
              <GitHubMark size={12} />
              <span>GitHub ↗</span>
            </a>
          </div>
        </div>
      </div>
    </CityMenuOverlay>
  );
};
