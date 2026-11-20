import React, { useEffect, useState } from 'react';
import { CityLogo, MiminekoMascot } from './CityLogo';

export const CityLoadingDots: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div className={`city-loading-dots ${className}`.trim()} aria-hidden="true">
    <span />
    <span />
    <span />
    <span />
  </div>
);

/**
 * Brief sky-blue welcome curtain inspired by city-the-animation.com's
 * loading screen (--color-blue #1395ea + Mimineko + slide-out right).
 */
export const CityLoadingCurtain: React.FC<{ subtitle: string }> = ({
  subtitle,
}) => {
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>('in');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setPhase('gone');
      return;
    }
    const t1 = window.setTimeout(() => setPhase('out'), 520);
    const t2 = window.setTimeout(() => setPhase('gone'), 1150);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      className={`city-loading-curtain ${phase === 'out' ? 'load-out' : ''}`}
      aria-hidden="true"
    >
      <div className="city-loading-curtain-box">
        <div className="city-loading-curtain-mascot">
          <MiminekoMascot />
        </div>
        <div className="city-loading-curtain-card">
          <CityLogo subtitle={subtitle} />
        </div>
      </div>
    </div>
  );
};
