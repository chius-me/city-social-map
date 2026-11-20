import React from 'react';
import {
  CITY_EXTERNAL_LINKS,
  CITY_SITES,
  SHELL_TEXT,
  getSisterSite,
  pickText,
  type CitySiteId,
  type Locale,
} from './ecosystem';
import { GitHubMark } from './CityLogo';

interface CityFooterProps {
  siteId: CitySiteId;
  locale: Locale;
}

export const CityFooter: React.FC<CityFooterProps> = ({ siteId, locale }) => {
  const currentSite = CITY_SITES[siteId];
  const sisterSite = getSisterSite(siteId);
  const st = SHELL_TEXT[locale];

  return (
    <footer className="city-footer">
      <span>{st.disclaimer}</span>
      <span className="footer-sep" aria-hidden="true">
        ·
      </span>
      <a
        href={sisterSite.url}
        target="_blank"
        rel="noopener noreferrer"
        className="city-footer-link"
      >
        {pickText(sisterSite.name, locale)} ↗
      </a>
      <span className="footer-sep" aria-hidden="true">
        ·
      </span>
      <a
        href={currentSite.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="city-footer-link"
      >
        <GitHubMark size={13} />
        <span>GitHub</span>
      </a>
      <span className="footer-sep" aria-hidden="true">
        ·
      </span>
      <a
        href={CITY_EXTERNAL_LINKS.awesomeRepo}
        target="_blank"
        rel="noopener noreferrer"
        className="city-footer-link"
      >
        {st.awesomeRepo} ↗
      </a>
      <span className="footer-sep" aria-hidden="true">
        ·
      </span>
      <a
        href={CITY_EXTERNAL_LINKS.officialSite}
        target="_blank"
        rel="noopener noreferrer"
        className="city-footer-link"
      >
        {st.officialSite} ↗
      </a>
    </footer>
  );
};
