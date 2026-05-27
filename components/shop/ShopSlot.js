"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import ShopSlotTitle from './ShopSlotTitle';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return null;
  const s = Number(seconds);
  if (!Number.isFinite(s)) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function SlotContent({ icon, title, onIconPointerEnter, onIconPointerMove, onIconPointerLeave }) {
  return (
    <span className="relative block transition-transform duration-200 group-hover:-translate-y-2">
      <img src="/images/shared/shop_slot.png" alt="" aria-hidden="true" className="h-full w-full object-contain" />
      <span
        className="absolute left-1/2 top-[35%] h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2"
        onPointerEnter={onIconPointerEnter}
        onPointerMove={onIconPointerMove}
        onPointerLeave={onIconPointerLeave}
      >
        <img src={icon} alt="" aria-hidden="true" className="h-full w-full object-contain" />
      </span>
      <span className="absolute left-1/2 top-[83%] w-full -translate-x-1/2 -translate-y-1/2 px-2 md:px-4">
        <ShopSlotTitle title={title} />
      </span>
    </span>
  );
}

export default function ShopSlot({ href, icon, title, subtitle, productionTime, tooltipEnabled = false }) {
  const router = useRouter();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const hideTimer = useRef();
  const containerRef = useRef();
  const lastPointerType = useRef(null);
  const rafRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => () => {
    clearTimeout(hideTimer.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  function showTooltip(event) {
    if (!tooltipEnabled) return;
    clearTimeout(hideTimer.current);
    if (event && typeof window !== 'undefined') {
      setPos({ left: event.clientX + window.scrollX, top: event.clientY + window.scrollY });
    } else {
      const el = containerRef.current;
      if (el && typeof document !== 'undefined') {
        const rect = el.getBoundingClientRect();
        const left = rect.left + rect.width / 2 + window.scrollX;
        const top = rect.top + window.scrollY;
        setPos({ left, top });
      }
    }
    setTooltipVisible(true);
  }

  function handleClick(e) {
    if (!href) return;
    router.push(href);
  }

  const timeText = formatTime(productionTime);

  return (
    <div
      ref={containerRef}
      className="relative group inline-block text-center focus:outline-none cursor-pointer"
      onClick={handleClick}
      role={href ? 'link' : 'button'}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      <SlotContent
        icon={icon}
        title={title}
        onIconPointerEnter={(e) => {
          lastPointerType.current = e.pointerType;
          if (tooltipEnabled && e.pointerType !== 'touch') showTooltip(e);
        }}
        onIconPointerMove={(e) => {
          lastPointerType.current = e.pointerType;
          if (!tooltipEnabled || e.pointerType === 'touch') return;
          const left = e.clientX + window.scrollX;
          const top = e.clientY + window.scrollY;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(() => setPos({ left, top }));
        }}
        onIconPointerLeave={(e) => {
          lastPointerType.current = e.pointerType;
          if (tooltipEnabled && e.pointerType !== 'touch') setTooltipVisible(false);
        }}
      />

      {tooltipEnabled && tooltipVisible && typeof document !== 'undefined'
        ? createPortal(
            <div
                      style={{
                        left: (typeof window !== 'undefined'
                          ? Math.min(pos.left + 48, window.scrollX + document.documentElement.clientWidth - 48 - 320)
                          : pos.left),
                        top: (typeof window !== 'undefined'
                          ? Math.max(window.scrollY + 8, pos.top - 24)
                          : pos.top),
                      }}
                      className="absolute z-50 w-80 max-w-[20rem] pointer-events-auto"
                    >
                      <div
                        className="rounded-t border border-line border-b-0 bg-[rgba(240,240,240,0.98)] px-3 py-2 text-center text-lg"
                        style={{
                          color: '#ffffff',
                          fontWeight: 700,
                          textShadow:
                            '-2px 0 0 #4F241D,0 2px 0 #4F241D,2px 0 0 #4F241D,0 -2px 0 #4F241D,-1px -1px 0 #4F241D,1px -1px 0 #4F241D,-1px 1px 0 #4F241D,1px 1px 0 #4F241D,0 0 2px #4F241D',
                        }}
                      >
                        <span className="inline-block px-1">{title}</span>
                      </div>
                      <div className="border border-line rounded-b bg-white px-4 py-3 text-center text-sm shadow-sm">
                        {subtitle ? <div className="my-[1.5em] font-semibold text-sm text-[#4F241D]">Made at the {subtitle}</div> : null}
                        {timeText ? (
                          <div>
                            <div className="border-t border-dashed border-[#dedede] mb-2" />
                            <div className="text-base font-medium text-[#4F241D]">{timeText}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>,
            document.body,
          )
        : null}
    </div>
  );
}
