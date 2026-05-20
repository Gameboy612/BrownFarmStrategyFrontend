"use client";

import React, { useState, useRef } from 'react';
import { useLocale } from './IntlProvider.client';

export default function Slideshow({ images = [], interval = 5000, locale = null }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const { t, locale: ctxLocale } = useLocale();

  const currentImage = images[index];

  function formatEventTimespan(startTime, endTime) {
    if (!startTime && !endTime) return null;
    const now = new Date();
    const start = startTime ? new Date(startTime) : null;
    const end = endTime ? new Date(endTime) : null;
    if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) return null;

    const effectiveLocale = locale || ctxLocale || 'zh-Hant';
    const formattedLocale = effectiveLocale === 'zh-Hant' ? 'zh-TW' : effectiveLocale;
    const formatter = new Intl.DateTimeFormat(formattedLocale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });

    const liveLabel = (t && typeof t === 'function') ? (t('home.events.live') || 'Live now') : 'Live now';
    const endedLabel = (t && typeof t === 'function') ? (t('home.events.ended') || 'Ended') : 'Ended';

    // If both start and end provided
    if (start && end) {
      if (now >= start && now <= end) {
        return `${liveLabel} — ${formatter.format(end)}`;
      }
      if (now > end) {
        return `${endedLabel} — ${formatter.format(end)}`;
      }
      // Not started yet
      return `${formatter.format(start)} - ${formatter.format(end)}`;
    }

    // Only start provided
    if (start && !end) {
      if (now >= start) return liveLabel;
      return `${formatter.format(start)}`;
    }

    // Only end provided
    if (!start && end) {
      if (now <= end) return `${endedLabel === 'Ended' ? 'Ends' : endedLabel} ${formatter.format(end)}`;
      return `${endedLabel} ${formatter.format(end)}`;
    }

    return null;
  }

  const eventTimespan = formatEventTimespan(currentImage?.startTime, currentImage?.endTime);

  React.useEffect(() => {
    if (!images || images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [images, interval]);

  function go(n) {
    clearInterval(timerRef.current);
    setIndex((i) => {
      const next = (i + n + images.length) % images.length;
      return next;
    });
  }

  if (!images || images.length === 0) return null;

  return (
    <div className="relative overflow-hidden border border-line bg-paper shadow-panel">
      <div className={`aspect-[16/9] ${currentImage?.url ? 'cursor-pointer' : ''}`} onClick={() => currentImage?.url && window.open(currentImage.url, '_blank')}>
        <img src={currentImage.src} alt={currentImage.alt} className="h-full w-full object-cover" />
      </div>

      {images.length > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-[rgba(6,9,8,0.6)] px-3 py-1 sm:px-6 sm:py-1 text-white text-[1.5em] sm:text-[3em]"
          >
            ‹
          </button>

          <button
            aria-label="Next"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[rgba(6,9,8,0.6)] px-3 py-1 sm:px-6 sm:py-1 text-white text-[1.5em] sm:text-[3em]"
          >
            ›
          </button>
        </>
      )}

      <div className="border-t border-line px-4 py-3 text-center">
        {eventTimespan && (
          <p className="text-sm sm:text-lg text-[rgba(6,9,8,0.78)]">{eventTimespan}</p>
        )}

        {images.length > 1 && (
          <div className={`${eventTimespan ? 'mt-3' : ''} flex justify-center gap-2`}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => { clearInterval(timerRef.current); setIndex(i); }}
                className={`h-3 w-10 border border-solid border-black ${i === index ? 'bg-bronze' : 'bg-[rgba(6,9,8,0.3)]'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
