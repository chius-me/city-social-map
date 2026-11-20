import React, { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  CITY_EXTERNAL_LINKS,
  CITY_SITES,
  CITY_SITE_LIST,
  SHELL_TEXT,
  getSisterSite,
  pickText,
  type CitySiteId,
  type Locale,
} from './ecosystem';
import { CityDots, CityLogo, GitHubMark, MiminekoMascot } from './CityLogo';

export interface CityMenuTile {
  id: string;
  tone: 'c' | 'i' | 't' | 'y' | 'sky';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
}

interface CityMenuOverlayProps {
  siteId: CitySiteId;
  open: boolean;
  locale: Locale;
  tagline: string;
  tiles: CityMenuTile[];
  onClose: () => void;
  wide?: boolean;
  children?: React.ReactNode;
}

export const CityMenuOverlay: React.FC<CityMenuOverlayProps> = ({
  siteId,
  open,
  locale,
  tagline,
  tiles,
  onClose,
  wide = false,
  children,
}) => {
  const currentSite = CITY_SITES[siteId];
  const sisterSite = getSisterSite(siteId);
  const st = SHELL_TEXT[locale];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`city-menu-overlay city-scroll ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={st.menuLabel}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`city-menu-overlay-inner ${wide ? 'is-wide' : ''}`}>
        <div className="city-menu-hero">
          <div className="city-menu-brand">
            <div className="city-menu-brand-row">
              <CityLogo subtitle={currentSite.subtitle} />
              <MiminekoMascot />
            </div>
            <p className="city-menu-tagline">{tagline}</p>
          </div>

          <div className="city-menu-tiles">
            {tiles.map((tile) => {
              const content = (
                <>
                  {tile.icon}
                  <div className="city-menu-tile-body">
                    <div className="tile-title">{tile.title}</div>
                    <div className="tile-sub">{tile.subtitle}</div>
                  </div>
                </>
              );

              if (tile.href) {
                return (
                  <a
                    key={tile.id}
                    href={tile.href}
                    target={tile.external === false ? undefined : '_blank'}
                    rel={tile.external === false ? undefined : 'noopener noreferrer'}
                    className={`city-menu-tile tile-${tile.tone}`}
                    onClick={() => {
                      tile.onClick?.();
                      onClose();
                    }}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  key={tile.id}
                  type="button"
                  className={`city-menu-tile tile-${tile.tone}`}
                  onClick={() => {
                    tile.onClick?.();
                    onClose();
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>

        {children}

        <section className="city-ecosystem-section" aria-label={st.ecosystemHeading}>
          <div className="city-ecosystem-head">
            <h3 className="city-ecosystem-heading">{st.ecosystemHeading}</h3>
            <CityDots />
          </div>

          <div className="city-ecosystem-grid">
            {CITY_SITE_LIST.map((site) => {
              const isCurrent = site.id === siteId;
              return (
                <article
                  key={site.id}
                  className={`city-ecosystem-card ${isCurrent ? 'is-current' : ''}`}
                >
                  <div>
                    <div className="city-ecosystem-card-top">
                      <div className="city-ecosystem-card-title-row">
                        <span
                          className="city-ecosystem-swatch"
                          style={{ backgroundColor: site.accent }}
                          aria-hidden="true"
                        />
                        <h4 className="city-ecosystem-card-title">
                          {pickText(site.name, locale)}
                        </h4>
                      </div>
                      <span
                        className={`city-ecosystem-badge ${isCurrent ? 'is-current' : ''}`}
                      >
                        {isCurrent ? st.currentSiteBadge : st.sisterSiteBadge}
                      </span>
                    </div>
                    <p className="city-ecosystem-summary">
                      {pickText(site.summary, locale)}
                    </p>
                  </div>

                  <div className="city-ecosystem-actions">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`city-ecosystem-action ${!isCurrent ? 'is-primary' : ''}`}
                    >
                      <span>{site.domain}</span>
                      <ExternalLink size={12} strokeWidth={2.4} />
                    </a>
                    <a
                      href={site.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="city-ecosystem-action"
                    >
                      <GitHubMark size={13} />
                      <span>{site.repoSlug}</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="city-menu-links">
          <a
            href={currentSite.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="city-link-pill"
          >
            <GitHubMark size={14} />
            <span>{currentSite.repoSlug} ↗</span>
          </a>
          <a
            href={sisterSite.url}
            target="_blank"
            rel="noopener noreferrer"
            className="city-link-pill"
          >
            <span>{pickText(sisterSite.name, locale)} ↗</span>
          </a>
          <a
            href={CITY_EXTERNAL_LINKS.awesomeRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="city-link-pill"
          >
            <span>{st.awesomeRepo} ↗</span>
          </a>
          <a
            href={CITY_EXTERNAL_LINKS.officialSite}
            target="_blank"
            rel="noopener noreferrer"
            className="city-link-pill"
          >
            <span>{st.officialSite} ↗</span>
          </a>
        </div>

        <footer className="city-menu-footer">{st.disclaimer}</footer>
      </div>
    </div>
  );
};
