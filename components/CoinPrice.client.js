"use client";

import React from 'react';

export default function CoinPrice({ value, className = 'transform -translate-y-[-4px]', imgClassName = 'h-8 w-8', numberClassName = 'font-medium' }) {
  const fmt = (v) => {
    if (v === null || v === undefined || v === '') return '-';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return new Intl.NumberFormat(undefined).format(n);
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src="/images/shared/game/general/coin.png" alt="coin" className={imgClassName} />
      <span className={numberClassName}>{fmt(value)}</span>
    </span>
  );
}
