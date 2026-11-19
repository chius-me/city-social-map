import React from "react";
import { BookOpen, Map, Route } from "lucide-react";
import type { Locale } from "../types";
import { UI_TEXT } from "../data/i18n";
import { CityLogo } from "./CityLogo";

interface TopBarProps {
  locale: Locale;
  onChangeLocale: (l: Locale) => void;
  directoryOpen: boolean;
  onToggleDirectory: () => void;
  pathMode: boolean;
  onTogglePathMode: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onResetView: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  locale,
  onChangeLocale,
  directoryOpen,
  onToggleDirectory,
  pathMode,
  onTogglePathMode,
  menuOpen,
  onToggleMenu,
  onResetView,
}) => {
  const t = UI_TEXT[locale];

  return (
    <>
      {/* Top-Left Brand Badge */}
      <header className="fixed top-2.5 left-2.5 sm:top-4 sm:left-4 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={onResetView}
          className="group bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl city-ink-card-sm flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 transition-transform"
          title={t.resetView}
        >
          <CityLogo compact subtitle="SOCIAL MAP" />
        </button>
      </header>

      {/* Top-Right Official-Site-Inspired Rounded-Bottom-Left Shelf */}
      <div className="fixed top-0 right-0 z-50 flex items-center gap-1.5 sm:gap-3 pl-3 sm:pl-6 pr-2.5 sm:pr-5 py-2 sm:py-3 city-top-shelf pointer-events-auto">
        {/* Mode Switcher Pills */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#F4F3EE] p-1 rounded-full border-2 border-[#141419]">
          <button
            type="button"
            onClick={() => {
              if (directoryOpen) onToggleDirectory();
              if (pathMode) onTogglePathMode();
            }}
            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
              !directoryOpen && !pathMode
                ? "bg-[#141419] text-white"
                : "text-[#141419] hover:bg-white"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{t.mapTab}</span>
          </button>
          <button
            type="button"
            onClick={onToggleDirectory}
            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
              directoryOpen
                ? "bg-[#99CB77] text-[#141419] border border-[#141419]"
                : "text-[#141419] hover:bg-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.directoryTab}</span>
          </button>
          <button
            type="button"
            onClick={onTogglePathMode}
            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
              pathMode
                ? "bg-[#F7B647] text-[#141419] border border-[#141419]"
                : "text-[#141419] hover:bg-white"
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>{t.pathTab}</span>
          </button>
        </nav>

        {/* Tablet-only compact Path & Directory icons (on mobile they live cleanly inside the Menu!) */}
        <div className="hidden sm:flex md:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleDirectory}
            aria-label={t.directoryTab}
            title={t.directoryTab}
            className={`w-9 h-9 rounded-full border-2 border-[#141419] flex items-center justify-center cursor-pointer ${
              directoryOpen ? "bg-[#99CB77]" : "bg-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onTogglePathMode}
            aria-label={t.pathTab}
            title={t.pathTab}
            className={`w-9 h-9 rounded-full border-2 border-[#141419] flex items-center justify-center cursor-pointer ${
              pathMode ? "bg-[#F7B647]" : "bg-white"
            }`}
          >
            <Route className="w-4 h-4" />
          </button>
        </div>

        {/* Trilingual Switcher (中文 / EN / 日本語) */}
        <div
          className="flex items-center bg-[#F4F3EE] p-0.5 rounded-full border-2 border-[#141419] text-[11px] font-extrabold"
          role="group"
          aria-label="Language"
        >
          {(
            [
              { code: "zh", label: "中" },
              { code: "en", label: "EN" },
              { code: "ja", label: "日" },
            ] as const
          ).map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => onChangeLocale(code)}
              className={`px-1.5 sm:px-2 py-1 rounded-full transition-colors cursor-pointer ${
                locale === code
                  ? "bg-[#F09CB4] text-[#141419]"
                  : "text-[#141419]/70 hover:text-[#141419]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Official 4-Color-Bar Morphing Menu Button */}
        <button
          type="button"
          onClick={onToggleMenu}
          className={`city-menu-btn !w-10 !h-10 sm:!w-12 sm:!h-12 ${menuOpen ? "is-open" : ""}`}
          aria-label={t.menu}
          title={t.menu}
          aria-expanded={menuOpen}
        >
          <div className="city-menu-btn-lines">
            <span className="city-menu-btn-line" />
            <span className="city-menu-btn-line" />
            <span className="city-menu-btn-line" />
            <span className="city-menu-btn-line" />
          </div>
        </button>
      </div>
    </>
  );
};
