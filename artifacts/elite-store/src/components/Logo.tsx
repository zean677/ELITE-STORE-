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
              <stop offset="0%" stopColor="#4C35DE" />
              <stop offset="55%" stopColor="#7C5CE7" />
              <stop offset="100%" stopColor="#00B8B2" />
            </linearGradient>
            <linearGradient id="logo-shine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <linearGradient id="crown-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE44D" />
              <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
            <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background rounded square */}
          <rect width="100" height="100" rx="22" fill="url(#logo-bg)" />

          {/* Shine overlay */}
          <rect width="100" height="50" rx="0" fill="url(#logo-shine)" opacity="0.6" />
          <rect width="100" height="22" rx="22" fill="url(#logo-shine)" opacity="0.4" />

          {/* Crown icon centered */}
          <g filter="url(#logo-glow)">
            {/* Crown base */}
            <rect x="22" y="64" width="56" height="9" rx="4" fill="url(#crown-grad)" />

            {/* Crown body */}
            <path
              d="M22 65 L22 45 L34 55 L50 32 L66 55 L78 45 L78 65 Z"
              fill="url(#crown-grad)"
            />

            {/* Crown gems */}
            <circle cx="50" cy="31" r="4.5" fill="white" opacity="0.95" />
            <circle cx="50" cy="31" r="2.5" fill="#FFD700" />

            <circle cx="22" cy="44" r="3.5" fill="white" opacity="0.8" />
            <circle cx="22" cy="44" r="2" fill="#FFD700" />

            <circle cx="78" cy="44" r="3.5" fill="white" opacity="0.8" />
            <circle cx="78" cy="44" r="2" fill="#FFD700" />
          </g>

          {/* Corner accent star */}
          <path
            d="M80 14 L82 20 L78 17 L82 17 L78 20 Z"
            fill="rgba(255,255,255,0.7)"
          />
          <path
            d="M16 18 L17.5 23 L14 20.5 L17.5 20.5 L14 23 Z"
            fill="rgba(255,255,255,0.5)"
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
