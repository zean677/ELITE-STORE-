import React from 'react';

interface LogoProps {
  size?: number;
  withText?: boolean;
  className?: string;
}

export function Logo({ size = 36, withText = false, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div style={{ width: size, height: size, flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
          <defs>
            <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6C5CE7" />
              <stop offset="60%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#00CEC9" />
            </linearGradient>
            <linearGradient id="logo-shine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="logo-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6C5CE7" floodOpacity="0.5" />
            </filter>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#logo-bg)" filter="url(#logo-shadow)" />
          <rect width="100" height="50" rx="0" fill="url(#logo-shine)" />
          <rect width="100" height="24" rx="24" fill="url(#logo-shine)" />
          <text
            x="50"
            y="67"
            textAnchor="middle"
            fontFamily="Arial Black, Impact, sans-serif"
            fontWeight="900"
            fontSize="58"
            fill="white"
            letterSpacing="-2"
          >
            E
          </text>
          <path
            d="M72 20 L80 28 L72 24 L64 28 Z"
            fill="rgba(255,255,255,0.6)"
          />
        </svg>
      </div>
      {withText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-black tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #a29bfe, #00CEC9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: size > 30 ? '1rem' : '0.8rem',
              letterSpacing: '-0.02em',
            }}
          >
            ELITE STORE
          </span>
          <span
            className="text-[9px] tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}
          >
            المتجر الرقمي
          </span>
        </div>
      )}
    </div>
  );
}
