import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import {
  CITY_SITES,
  SHELL_TEXT,
  getSisterSite,
  pickText,
  type CitySiteId,
  type Locale,
} from './ecosystem';
import { CityLogo, GitHubMark } from './CityLogo';

interface CityTopShellProps {
  siteId: CitySiteId;
  locale: Locale;
  onChangeLocale: (next: Locale) => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onBrandClick?: () => void;
  brandTitle?: string;
  children?: React.ReactNode;
}

export const CityTopShell: React.FC<CityTopShellProps> = ({
  siteId,
  locale,
  onChangeLocale,
  menuOpen,
  onToggleMenu,
  onBrandClick,
  brandTitle,
  children,
}) => {
  const currentSite = CITY_SITES[siteId];
  const sisterSite = getSisterSite(siteId);
  const st = SHELL_TEXT[locale];
  const sisterLabel = pickText(sisterSite.shortLabel, locale);

  return (
    <>
      <header className="city-topbar-brand">
        <button
          type="button"
          className="city-brand-pill"
          onClick={onBrandClick}
          title={brandTitle ?? pickText(currentSite.name, locale)}
        >
          <CityLogo compact subtitle={currentSite.subtitle} />
        </button>
      </header>

      <div className="city-top-shelf">
        {children}

        <a
          href={sisterSite.url}
          target="_blank"
          rel="noopener noreferrer"
          className="city-sister-pill"
          title={`${pickText(sisterSite.name, locale)} (${sisterSite.domain})`}
        >
          {sisterSite.id === 'avatar' ? (
            <Sparkles size={13} strokeWidth={2.5} />
          ) : (
            <Compass size={13} strokeWidth={2.5} />
          )}
          <span>{sisterLabel}</span>
          <span className="city-sister-arrow" aria-hidden="true">
            ↗
          </span>
        </a>

        <a
          href={currentSite.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="city-github-btn"
          aria-label={`${st.sourceCode} (${currentSite.repoSlug})`}
          title={`${st.sourceCode} · ${currentSite.repoSlug}`}
        >
          <GitHubMark size={16} />
        </a>

        <div className="city-locale-switch" role="group" aria-label="Language">
          {(
            [
              { code: 'zh', label: '中' },
              { code: 'en', label: 'EN' },
              { code: 'ja', label: '日' },
            ] as const
          ).map(({ code, label }) => (
            <button
              key={code}
              type="button"
              className={`city-locale-btn ${locale === code ? 'is-active' : ''}`}
              onClick={() => onChangeLocale(code)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`city-menu-btn ${menuOpen ? 'is-open' : ''}`}
          onClick={onToggleMenu}
          aria-label={st.menuLabel}
          title={st.menuLabel}
          aria-expanded={menuOpen}
        >
          <div className="city-menu-btn-lines" aria-hidden="true">
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
