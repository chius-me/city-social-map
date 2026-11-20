import React from 'react';
import { SHELL_TEXT, type CitySiteId, type Locale } from './ecosystem';

interface CityFooterProps {
  siteId?: CitySiteId;
  locale: Locale;
}

export const CityFooter: React.FC<CityFooterProps> = ({ locale }) => {
  return (
    <footer className="city-footer">
      <span>{SHELL_TEXT[locale].disclaimer}</span>
    </footer>
  );
};
