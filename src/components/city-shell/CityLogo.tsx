import React from 'react';

interface CityLogoProps {
  className?: string;
  compact?: boolean;
  subtitle?: string;
}

export const CityDots: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`city-dots ${className}`.trim()} aria-hidden="true">
    <span />
    <span />
    <span />
    <span />
  </span>
);

export const GitHubMark: React.FC<{ size?: number; className?: string }> = ({
  size = 16,
  className = '',
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 2.88-.39c.98 0 1.96.13 2.88.39 2.19-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

/**
 * Chunky black-outlined 4-color C-I-T-Y wordmark (Marigold #f7b647, Sakura #f09cb4,
 * Meadow #99cb77, Coral #ee847d) adapted from city-the-animation.com.
 */
export const CityLogo: React.FC<CityLogoProps> = ({
  className = '',
  compact = false,
  subtitle = '',
}) => {
  const ariaLabel = subtitle ? `CITY ${subtitle}` : 'CITY';
  return (
    <div
      className={`city-wordmark ${compact ? 'is-compact' : ''} ${className}`.trim()}
    >
      <svg
        viewBox="0 0 264 84"
        className="city-wordmark-svg"
        role="img"
        aria-label={ariaLabel}
      >
        <path
          d="M54 22 C49 12 37 8 26 11 C12 15 6 29 7 44 C8 60 18 72 34 73 C45 74 54 68 59 58 L44 49 C41 55 37 57 32 56 C25 55 22 49 22 42 C22 33 26 27 33 26 C38 25 42 28 44 32 Z"
          fill="#F7B647"
          stroke="#141419"
          strokeWidth="5.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <rect
          x="74"
          y="12"
          width="25"
          height="60"
          rx="6"
          fill="#F09CB4"
          stroke="#141419"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        <path
          d="M113 12 L173 12 Q177 12 177 16 L177 29 Q177 33 173 33 L155 33 L155 68 Q155 72 151 72 L135 72 Q131 72 131 68 L131 33 L113 33 Q109 33 109 29 L109 16 Q109 12 113 12 Z"
          fill="#99CB77"
          stroke="#141419"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        <path
          d="M188 12 L211 12 L222 34 L234 12 L257 12 L234 50 L234 68 Q234 72 230 72 L214 72 Q210 72 210 68 L210 50 Z"
          fill="#EE847D"
          stroke="#141419"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
      </svg>
      {subtitle && (
        <div className="city-wordmark-sub">
          <span>{subtitle}</span>
          <CityDots />
        </div>
      )}
    </div>
  );
};

/**
 * Playful vector mascot of Mimineko (snow-white ear-cat with rabbit ears,
 * sky-blue eyes, red collar, and golden bell).
 */
export const MiminekoMascot: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 120 112"
    className={`mimineko-mascot ${className}`.trim()}
    role="img"
    aria-label="Mimineko"
  >
    <path
      d="M78 58 C95 52 108 32 110 15 C111 9 104 9 100 15 C95 23 89 35 76 42"
      fill="#FFFFFF"
      stroke="#141419"
      strokeWidth="4.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 56 C24 44 40 34 60 36 C78 38 88 50 86 68 L83 84 C82 88 74 88 74 83 L74 73 L55 74 L51 87 C49 92 40 91 41 85 L43 72 C33 70 29 63 28 56 Z"
      fill="#FFFFFF"
      stroke="#141419"
      strokeWidth="4.2"
      strokeLinejoin="round"
    />
    <path
      d="M32 45 C26 24 31 10 38 11 C45 12 45 27 42 42"
      fill="#FFFFFF"
      stroke="#141419"
      strokeWidth="4.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M46 43 C47 22 55 12 61 15 C67 18 62 33 56 45"
      fill="#FFFFFF"
      stroke="#141419"
      strokeWidth="4.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 61 C18 47 32 39 48 41 C61 43 66 54 61 65 C56 75 40 78 27 74 C20 71 16 66 17 61 Z"
      fill="#FFFFFF"
      stroke="#141419"
      strokeWidth="4.2"
      strokeLinejoin="round"
    />
    <ellipse cx="30" cy="57" rx="5.5" ry="6.2" fill="#FFFFFF" stroke="#141419" strokeWidth="3" />
    <circle cx="29" cy="58" r="3.4" fill="#1395EA" />
    <circle cx="28" cy="56.5" r="1.2" fill="#FFFFFF" />
    <ellipse cx="46" cy="58" rx="6" ry="6.5" fill="#FFFFFF" stroke="#141419" strokeWidth="3" />
    <circle cx="44.5" cy="59" r="3.6" fill="#1395EA" />
    <circle cx="43.5" cy="57.5" r="1.2" fill="#FFFFFF" />
    <path d="M23 50 L36 54" stroke="#141419" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M53 51 L40 54.5" stroke="#141419" strokeWidth="3.2" strokeLinecap="round" />
    <path
      d="M27 72 Q44 80 59 71"
      fill="none"
      stroke="#DD5549"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <circle cx="41" cy="83" r="10.5" fill="#F7B647" stroke="#141419" strokeWidth="3.6" />
    <path d="M31 83 Q41 87 51 83" fill="none" stroke="#141419" strokeWidth="2.5" />
    <circle cx="41" cy="87" r="2.2" fill="#141419" />
  </svg>
);
