import React, { useState } from "react";
import {
  BookOpen,
  Compass,
  ExternalLink,
  Map,
  Route,
  Sparkles,
} from "lucide-react";
import type { Locale } from "../types";
import { RESOURCE_CATEGORIES } from "../data/resources";
import { UI_TEXT, pickText } from "../data/i18n";
import { CityMenuOverlay, type CityMenuTile } from "./city-shell";

interface MenuOverlayProps {
  open: boolean;
  locale: Locale;
  onClose: () => void;
  onOpenMap: () => void;
  onOpenNetwork: () => void;
  onOpenDirectory: () => void;
  onOpenPathFinder: () => void;
}

const SECTION_LABELS: Record<
  Locale,
  {
    resources: string;
    tabs: Record<string, string>;
    shortcuts: { key: string; label: string }[];
    creditNote: string;
  }
> = {
  zh: {
    resources: "精选资料",
    tabs: {
      official: "官方入口",
      "wiki-community": "出处 & Wiki",
      "music-craft": "音乐与制作",
      "creator-communities": "作者 & 社区",
    },
    shortcuts: [
      { key: "拖拽", label: "平移画布 / 节点" },
      { key: "滚轮", label: "缩放" },
      { key: "+ / - / 0", label: "放缩与重置" },
      { key: "/ · Esc", label: "搜索 / 关闭" },
    ],
    creditNote: "拓扑参考自 VayItsHere (CITY Wiki)",
  },
  en: {
    resources: "Curated Links",
    tabs: {
      official: "Official",
      "wiki-community": "Source & Wiki",
      "music-craft": "Music & Craft",
      "creator-communities": "Author & Fans",
    },
    shortcuts: [
      { key: "Drag", label: "Pan canvas / nodes" },
      { key: "Scroll", label: "Zoom" },
      { key: "+ / - / 0", label: "Zoom & reset" },
      { key: "/ · Esc", label: "Search / close" },
    ],
    creditNote: "Map topology after VayItsHere (CITY Wiki)",
  },
  ja: {
    resources: "関連リンク",
    tabs: {
      official: "公式",
      "wiki-community": "出典・Wiki",
      "music-craft": "音楽・作画",
      "creator-communities": "原作・コミュニティ",
    },
    shortcuts: [
      { key: "ドラッグ", label: "移動" },
      { key: "ホイール", label: "拡大縮小" },
      { key: "+ / - / 0", label: "ズーム・全体" },
      { key: "/ · Esc", label: "検索 / 閉じる" },
    ],
    creditNote: "相関図出典: VayItsHere (CITY Wiki)",
  },
};

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
  const labels = SECTION_LABELS[locale];
  const [activeCatId, setActiveCatId] = useState<string>(RESOURCE_CATEGORIES[0].id);

  const activeCategory =
    RESOURCE_CATEGORIES.find((cat) => cat.id === activeCatId) ?? RESOURCE_CATEGORIES[0];

  const tiles: CityMenuTile[] = [
    {
      id: "map",
      tone: "c",
      icon: <Map size={22} strokeWidth={2.5} />,
      title: t.mapTab,
      subtitle: `65 ${t.characterCount} · 8 ${t.factionCount}`,
      onClick: onOpenMap,
    },
    {
      id: "network",
      tone: "i",
      icon: <Compass size={22} strokeWidth={2.5} />,
      title: t.networkTab,
      subtitle: "Ego Radar",
      onClick: onOpenNetwork,
    },
    {
      id: "directory",
      tone: "t",
      icon: <BookOpen size={22} strokeWidth={2.5} />,
      title: t.directoryTab,
      subtitle: "Characters",
      onClick: onOpenDirectory,
    },
    {
      id: "path",
      tone: "y",
      icon: <Route size={22} strokeWidth={2.5} />,
      title: t.pathTab,
      subtitle: "Six Degrees",
      onClick: onOpenPathFinder,
    },
  ];

  return (
    <CityMenuOverlay
      siteId="social-map"
      open={open}
      locale={locale}
      tagline={t.tagline}
      tiles={tiles}
      onClose={onClose}
      extraLinks={[
        {
          id: "wiki-map",
          label: t.originalMapLink,
          href: "https://city.wiki.gg/wiki/File:CITY_Social_Map_by_VayItsHere.jpeg",
        },
      ]}
      creditNote={labels.creditNote}
    >
      <section className="city-menu-tabs-card" aria-label={labels.resources}>
        <div className="city-menu-tabs-head">
          <div className="city-menu-tabs-title">
            <Sparkles size={14} strokeWidth={2.5} />
            <span>{labels.resources}</span>
          </div>

          <div className="city-menu-tabs-list" role="tablist" aria-label={labels.resources}>
            {RESOURCE_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategory.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCatId(cat.id)}
                  className={`city-menu-tab ${isActive ? "is-active" : ""}`}
                  style={isActive ? { backgroundColor: cat.accent } : undefined}
                >
                  {labels.tabs[cat.id] ?? pickText(cat.title, locale)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="city-menu-tabs-grid" role="tabpanel">
          {activeCategory.items.map((item) => (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="city-menu-resource-item"
            >
              <div className="city-menu-resource-top">
                <span className="city-menu-resource-title">
                  {pickText(item.title, locale)}
                </span>
                <span className="city-menu-resource-meta">
                  {item.tag && (
                    <span className="city-menu-resource-tag">{item.tag}</span>
                  )}
                  <ExternalLink size={12} strokeWidth={2.4} />
                </span>
              </div>
              <p className="city-menu-resource-desc">
                {pickText(item.description, locale)}
              </p>
            </a>
          ))}
        </div>
      </section>

      <div className="city-menu-kbd-hint" aria-label={t.menuShortcutsTitle}>
        {labels.shortcuts.map((s) => (
          <span key={s.key} className="city-menu-kbd-item">
            <kbd>{s.key}</kbd>
            <span>{s.label}</span>
          </span>
        ))}
      </div>
    </CityMenuOverlay>
  );
};
