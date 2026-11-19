import React from "react";
import {
  BookOpen,
  Compass,
  Eye,
  EyeOff,
  ExternalLink,
  Keyboard,
  Map,
  Route,
  Sparkles,
} from "lucide-react";
import type { Locale } from "../types";
import { RESOURCE_CATEGORIES } from "../data/resources";
import { UI_TEXT, pickText } from "../data/i18n";
import { CityLogo, MiminekoMascot } from "./CityLogo";

interface MenuOverlayProps {
  open: boolean;
  locale: Locale;
  spoilerFree: boolean;
  onToggleSpoilerFree: () => void;
  onClose: () => void;
  onOpenMap: () => void;
  onOpenNetwork: () => void;
  onOpenDirectory: () => void;
  onOpenPathFinder: () => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  open,
  locale,
  spoilerFree,
  onToggleSpoilerFree,
  onClose,
  onOpenMap,
  onOpenNetwork,
  onOpenDirectory,
  onOpenPathFinder,
}) => {
  const t = UI_TEXT[locale];

  return (
    <div
      className={`fixed inset-0 z-40 overflow-y-auto city-scroll transition-all duration-400 ${
        open
          ? "opacity-100 visible pointer-events-auto scale-100"
          : "opacity-0 invisible pointer-events-none scale-[1.02]"
      }`}
      style={{
        backgroundColor: "rgba(255, 253, 249, 0.95)",
        backdropFilter: "blur(10px)",
      }}
      aria-hidden={!open}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-24 pb-16 space-y-10">
        {/* Top Hero mirroring city-the-animation.com's .menu-header */}
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-center">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <div className="flex items-end gap-2">
              <CityLogo subtitle="SOCIAL MAP" />
              <MiminekoMascot className="w-12 h-12 -mb-1" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#444455] leading-relaxed">
              “{t.tagline}”
            </p>

            {/* Spoiler-Free Toggle Switch (handy on mobile too!) */}
            <button
              type="button"
              onClick={onToggleSpoilerFree}
              className={`mt-1 px-3.5 py-2 rounded-full border-2 border-[#141419] text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-colors shadow-[2.5px_2.5px_0_#141419] ${
                spoilerFree
                  ? "bg-[#33333F] text-[#99CB77]"
                  : "bg-white text-[#141419] hover:bg-[#FFF6E0]"
              }`}
            >
              {spoilerFree ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>{spoilerFree ? t.spoilerFreeOn : t.spoilerFreeOff}</span>
            </button>
          </div>

          {/* Official-Style Vibrant Navigation Tiles (.menu-list) */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                onOpenMap();
                onClose();
              }}
              className="city-menu-tile bg-[#F7B647] px-4 py-4 sm:py-5 text-left flex items-center gap-3 cursor-pointer"
            >
              <Map className="w-6 h-6 text-[#141419] shrink-0" strokeWidth={2.5} />
              <div>
                <div className="text-sm sm:text-base font-black text-[#141419]">{t.mapTab}</div>
                <div className="text-[11px] font-bold text-[#141419]/75">
                  65 {t.characterCount} · 8 {t.factionCount}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenNetwork();
                onClose();
              }}
              className="city-menu-tile bg-[#C4E4F5] px-4 py-4 sm:py-5 text-left flex items-center gap-3 cursor-pointer"
            >
              <Compass className="w-6 h-6 text-[#141419] shrink-0" strokeWidth={2.5} />
              <div>
                <div className="text-sm sm:text-base font-black text-[#141419]">
                  {t.networkTab}
                </div>
                <div className="text-[11px] font-bold text-[#141419]/75">EGO RADAR</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenDirectory();
                onClose();
              }}
              className="city-menu-tile bg-[#F09CB4] px-4 py-4 sm:py-5 text-left flex items-center gap-3 cursor-pointer"
            >
              <BookOpen className="w-6 h-6 text-[#141419] shrink-0" strokeWidth={2.5} />
              <div>
                <div className="text-sm sm:text-base font-black text-[#141419]">
                  {t.directoryTab}
                </div>
                <div className="text-[11px] font-bold text-[#141419]/75">CHARACTERS</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenPathFinder();
                onClose();
              }}
              className="city-menu-tile bg-[#99CB77] px-4 py-4 sm:py-5 text-left flex items-center gap-3 cursor-pointer"
            >
              <Route className="w-6 h-6 text-[#141419] shrink-0" strokeWidth={2.5} />
              <div>
                <div className="text-sm sm:text-base font-black text-[#141419]">{t.pathTab}</div>
                <div className="text-[11px] font-bold text-[#141419]/75">SIX DEGREES</div>
              </div>
            </button>
          </div>
        </div>

        {/* Curated Resources from awesome-citytheanimation */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-[#DD5549]" />
            <h3 className="text-base sm:text-lg font-black text-[#141419]">
              {t.menuResourcesTitle}
            </h3>
            <span className="city-dots" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
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

          {/* Credits & Links */}
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
                href="https://github.com/chius-me/awesome-citytheanimation"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-[#99CB77] text-[#141419] text-[11px] font-extrabold no-underline hover:opacity-90"
              >
                {t.awesomeRepoLink} ↗
              </a>
              <a
                href="https://city-the-animation.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-[#EE847D] text-[#141419] text-[11px] font-extrabold no-underline hover:opacity-90"
              >
                {t.officialSiteLink} ↗
              </a>
            </div>
          </div>
        </div>

        {/* Footer attribution */}
        <footer className="text-center text-[11.5px] font-bold text-[#666678] pt-2">
          Fan-made interactive tribute to Keiichi Arawi &amp; Kyoto Animation&apos;s{" "}
          <em>CITY THE ANIMATION</em> · Original characters © あらゐけいいち・講談社／CITY THE
          ANIMATION 製作委員会
        </footer>
      </div>
    </div>
  );
};
