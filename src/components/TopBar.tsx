import React from "react";
import { BookOpen, Compass, Map, Route } from "lucide-react";
import type { Locale } from "../types";
import { UI_TEXT } from "../data/i18n";
import { CityTopShell } from "./city-shell";

export type ViewMode = "map" | "network";

interface TopBarProps {
  locale: Locale;
  onChangeLocale: (l: Locale) => void;
  viewMode: ViewMode;
  onChangeViewMode: (m: ViewMode) => void;
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
  viewMode,
  onChangeViewMode,
  directoryOpen,
  onToggleDirectory,
  pathMode,
  onTogglePathMode,
  menuOpen,
  onToggleMenu,
  onResetView,
}) => {
  const t = UI_TEXT[locale];

  const isMapActive = viewMode === "map" && !directoryOpen && !pathMode;
  const isNetworkActive = viewMode === "network" && !directoryOpen && !pathMode;

  return (
    <CityTopShell
      siteId="social-map"
      locale={locale}
      onChangeLocale={onChangeLocale}
      menuOpen={menuOpen}
      onToggleMenu={onToggleMenu}
      onBrandClick={onResetView}
      brandTitle={t.resetView}
    >
      {/* Desktop & Tablet Mode Switcher Pills */}
      <nav className="hidden md:flex items-center gap-1 bg-[#F4F3EE] p-1 rounded-full border-2 border-[#141419]">
        <button
          type="button"
          onClick={() => {
            if (directoryOpen) onToggleDirectory();
            if (pathMode) onTogglePathMode();
            onChangeViewMode("map");
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isMapActive
              ? "bg-[#141419] text-white"
              : "text-[#141419] hover:bg-white"
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>{t.mapTab}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (directoryOpen) onToggleDirectory();
            if (pathMode) onTogglePathMode();
            onChangeViewMode("network");
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isNetworkActive
              ? "bg-[#141419] text-[#F7B647]"
              : "text-[#141419] hover:bg-white"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{t.networkTab}</span>
        </button>
        <button
          type="button"
          onClick={onToggleDirectory}
          className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
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
          className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
            pathMode
              ? "bg-[#F7B647] text-[#141419] border border-[#141419]"
              : "text-[#141419] hover:bg-white"
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>{t.pathTab}</span>
        </button>
      </nav>

      {/* Compact Mobile Quick View Toggle (Map <-> Ego Radar) */}
      <div className="flex md:hidden items-center gap-1">
        <button
          type="button"
          onClick={() => {
            if (directoryOpen) onToggleDirectory();
            if (pathMode) onTogglePathMode();
            onChangeViewMode(viewMode === "map" ? "network" : "map");
          }}
          aria-label={viewMode === "map" ? t.networkTab : t.mapTab}
          title={viewMode === "map" ? t.networkTab : t.mapTab}
          className={`h-[30px] sm:h-[34px] px-2 sm:px-2.5 rounded-full border-2 border-[#141419] flex items-center gap-1 text-[11px] font-extrabold cursor-pointer transition-colors ${
            viewMode === "network"
              ? "bg-[#141419] text-[#F7B647]"
              : "bg-[#C4E4F5] text-[#141419]"
          }`}
        >
          {viewMode === "map" ? (
            <>
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.networkTab}</span>
            </>
          ) : (
            <>
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.mapTab}</span>
            </>
          )}
        </button>

        {/* Small-tablet Directory & Path icons */}
        <button
          type="button"
          onClick={onToggleDirectory}
          aria-label={t.directoryTab}
          title={t.directoryTab}
          className={`hidden sm:flex w-[34px] h-[34px] rounded-full border-2 border-[#141419] items-center justify-center cursor-pointer ${
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
          className={`hidden sm:flex w-[34px] h-[34px] rounded-full border-2 border-[#141419] items-center justify-center cursor-pointer ${
            pathMode ? "bg-[#F7B647]" : "bg-white"
          }`}
        >
          <Route className="w-4 h-4" />
        </button>
      </div>
    </CityTopShell>
  );
};
