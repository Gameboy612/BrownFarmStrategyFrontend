"use client";

import React, { useEffect, useState } from 'react';
import { useLocale } from './IntlProvider.client';

export default function Slideshow({ images = [], locale = null, galleryByLocale = null }) {
  const [index, setIndex] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const { t, locale: ctxLocale } = useLocale();

  // Determine which images to display: prefer explicit `images`, then `galleryByLocale` keyed by ctxLocale
  let displayImages = Array.isArray(images) ? images : [];
  if ((!displayImages || displayImages.length === 0) && galleryByLocale) {
    displayImages = galleryByLocale[ctxLocale] || galleryByLocale['zh-Hant'] || Object.values(galleryByLocale)[0] || [];
  }

  const currentImage = displayImages[index];

  function formatCompactDuration(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}${t('home.events.unit.day')} ${hours}${t('home.events.unit.hour')} ${minutes}${t('home.events.unit.minute')} ${seconds}${t('home.events.unit.second')}`;
  }

  function buildCountdownLabel(targetMs, key) {
    const diffMs = targetMs - nowMs;
    if (diffMs < 0) return null;
    const duration = formatCompactDuration(diffMs);
    return t(key, { duration });
  }

  function formatDayNotice(startTime, endTime) {
    const now = new Date(nowMs);
    const start = startTime ? new Date(startTime) : null;
    const end = endTime ? new Date(endTime) : null;
    if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) return null;
    const endedLabel = t('home.events.ended') || 'Ended';

    if (start && end) {
      if (now < start) return buildCountdownLabel(start.getTime(), 'home.events.startsInCompact');
      if (now <= end) return buildCountdownLabel(end.getTime(), 'home.events.daysLeftCompact');
      return endedLabel;
    }

    if (start && !end && now < start) return buildCountdownLabel(start.getTime(), 'home.events.startsInCompact');
    if (!start && end) {
      if (now <= end) return buildCountdownLabel(end.getTime(), 'home.events.daysLeftCompact');
      return endedLabel;
    }
    return null;
  }

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

    const liveLabel = t('home.events.live') || 'Live now';
    const endedLabel = t('home.events.ended') || 'Ended';

    if (start && end) {
      if (now >= start && now <= end) return `${liveLabel} - ${formatter.format(end)}`;
      if (now > end) return `${endedLabel} - ${formatter.format(end)}`;
      return `${formatter.format(start)} - ${formatter.format(end)}`;
    }

    if (start && !end) {
      if (now >= start) return liveLabel;
      return formatter.format(start);
    }

    if (!start && end) {
      if (now <= end) return `${endedLabel === 'Ended' ? 'Ends' : endedLabel} ${formatter.format(end)}`;
      return `${endedLabel} ${formatter.format(end)}`;
    }

    return null;
  }

  const eventTimespan = formatEventTimespan(currentImage?.startTime, currentImage?.endTime);
  const eventDayNotice = formatDayNotice(currentImage?.startTime, currentImage?.endTime);

  function renderDayNoticeText(text) {
    if (!text) return null;
    const endMatch = text.match(/^(.*?後)(完結|開始)$/);
    if (endMatch) {
      return (
        <>
          {endMatch[1]}
          <strong className="font-bold">{endMatch[2]}</strong>
        </>
      );
    }
    return text;
  }

  useEffect(() => {
    const countdownTick = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(countdownTick);
  }, []);

  function go(n) {
    setIndex((i) => {
      const next = (i + n + images.length) % images.length;
      return next;
    });
  }

  if (!displayImages || displayImages.length === 0) return null;

  return (
    <div className="relative overflow-hidden border border-line bg-paper shadow-panel">
      <div className={`relative aspect-[16/9] ${currentImage?.url ? 'cursor-pointer' : ''}`} onClick={() => currentImage?.url && window.open(currentImage.url, '_blank')}>
        <img src={currentImage.src} alt={currentImage.alt} className="h-full w-full object-cover" />

        {displayImages.length > 1 && (
          <>
            <button
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute -left-2 top-0 bottom-0 z-10 w-14 sm:w-20 flex items-center justify-center bg-transparent"
            >
              <span className="border border-line bg-[rgba(211,185,137,0.92)] px-3 py-1 text-[rgba(6,9,8,0.92)]">‹</span>
            </button>

            <button
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute -right-2 top-0 bottom-0 z-10 w-14 sm:w-20 flex items-center justify-center bg-transparent"
            >
              <span className="border border-line bg-[rgba(211,185,137,0.92)] px-3 py-1 text-[rgba(6,9,8,0.92)]">›</span>
            </button>
          </>
        )}
      </div>

      <div className="border-t border-line px-4 py-3 text-center">
        {eventDayNotice && (
          <p className="inline-block border border-bronze bg-[rgba(206,175,109,0.22)] px-3 py-1 text-sm sm:text-base md:text-lg tracking-[0.08em] text-[rgba(6,9,8,0.92)]">
            {renderDayNoticeText(eventDayNotice)}
          </p>
        )}

        {eventTimespan && (
          <p className={`${eventDayNotice ? 'mt-2' : ''} text-sm sm:text-base font-semibold text-[rgba(6,9,8,0.78)]`}>{eventTimespan}</p>
        )}

        {images.length > 1 && (
          <div className={`${eventTimespan || eventDayNotice ? 'mt-3' : ''} flex justify-center gap-2`}>
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-3 w-10 border border-line ${i === index ? 'bg-bronze' : 'bg-[rgba(211,185,137,0.5)]'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
