import React, { useEffect } from 'react';
import {
  CITY_EXTERNAL_LINKS,
  CITY_SITES,
  SHELL_TEXT,
  getSisterSite,
  pickText,
  type CitySiteId,
  type Locale,
} from './ecosystem';
import { CityLogo, GitHubMark, MiminekoMascot } from './CityLogo';

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
  extraLinks?: { id: string; label: string; href: string }[];
  creditNote?: string;
  children?: React.ReactNode;
}

export const CityMenuOverlay: React.FC<CityMenuOverlayProps> = ({
  siteId,
  open,
  locale,
  tagline,
  tiles,
  onClose,
  extraLinks,
  creditNote,
  children,
}) => {
  const currentSite = CITY_SITES[siteId];
  const sisterSite = getSisterSite(siteId);
  const st = SHELL_TEXT[locale];

  const tileHasSister = tiles.some((t) =>
    Boolean(t.href && t.href.startsWith(sisterSite.url))
  );
  const tileHasOfficial = tiles.some((t) =>
    Boolean(t.href && t.href.startsWith('https://city-the-animation.com'))
  );

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
      <div className="city-menu-overlay-inner">
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

        <div className="city-menu-links">
          {!tileHasSister && (
            <a
              href={sisterSite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="city-link-pill city-link-pill--sister"
            >
              <span>{pickText(sisterSite.name, locale)} ↗</span>
            </a>
          )}
          {extraLinks?.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="city-link-pill"
            >
              <span>{link.label} ↗</span>
            </a>
          ))}
          <a
            href={CITY_EXTERNAL_LINKS.awesomeRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="city-link-pill"
          >
            <span>{st.awesomeRepo} ↗</span>
          </a>
          {!tileHasOfficial && (
            <a
              href={CITY_EXTERNAL_LINKS.officialSite}
              target="_blank"
              rel="noopener noreferrer"
              className="city-link-pill"
            >
              <span>{st.officialSite} ↗</span>
            </a>
          )}
          <a
            href={currentSite.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="city-link-pill"
          >
            <GitHubMark size={14} />
            <span>{st.sourceShort} ↗</span>
          </a>
        </div>

        <footer className="city-menu-footer">
          {st.disclaimer}
          {creditNote ? ` · ${creditNote}` : ''}
        </footer>
      </div>
    </div>
  );
};
