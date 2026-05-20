"use client";

import React from 'react';

export default function Level({ level, size = 72, className = '' }) {
  const imgSize = Number(size) || 72;
  const badgeSize = Math.round(imgSize * 0.6);
  const numberSizeBase = Math.round(badgeSize * 0.6);
  const textShadow = '-2px 0 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000';

  const text = String(level ?? '');
  const digits = text.length;
  let sizeAdj = 0;
  if (digits === 1) sizeAdj = 5;
  else if (digits === 2) sizeAdj = 4;
  else if (digits === 3) sizeAdj = 2;
  const fontSize = numberSizeBase + sizeAdj;

  return (
    <span
      className={`inline-block relative ${className}`}
      style={{ width: imgSize, height: imgSize }}
    >
      <img
        src="/images/shared/game/general/experience.png"
        alt="level"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />

      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(calc(-50% - 1px), calc(-50% - 1px))',
          width: badgeSize,
          height: badgeSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '9999px',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            color: '#fff',
            fontWeight: 700,
            fontFamily: 'Poppins, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize,
            lineHeight: 1,
            textShadow,
            WebkitTextStroke: '0px transparent',
            display: 'inline-block',
            padding: '0 4px',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
      </span>
    </span>
  );
}
