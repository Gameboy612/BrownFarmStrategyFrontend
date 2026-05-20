"use client";

import React from 'react';

export default function Experience({ value, className = '', imgClassName = 'h-6 w-6', numberClassName = 'font-medium' }) {
  const fmt = (v) => {
    if (v === null || v === undefined || v === '') return '-';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return new Intl.NumberFormat(undefined).format(n);
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src="/images/shared/game/general/experience.png" alt="experience" className={imgClassName} />
      <span className={numberClassName}>{fmt(value)}</span>
    </span>
  );
}
