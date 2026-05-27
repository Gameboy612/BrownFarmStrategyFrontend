"use client";

import { useLocale } from '../IntlProvider.client';

export default function ShopSlotTitle({ title }) {
  const { locale } = useLocale();
  const len = title ? title.length : 0;
  const threshold = locale === 'en' ? 10 : 5;
  var scaleClass = '';
  if (len >= threshold) {
    scaleClass = ' scale-[0.8]';
  }
  if (len >= threshold * 1.4) {
    scaleClass = ' scale-[0.65]';
  }

  return (
    <span className="flex items-center justify-center m-0 md:m-[10%]">
      <img src="/images/shared/shop_title.png" alt="" aria-hidden="true" className="h-auto w-auto object-contain" />
      <span
        className={
          'pt-1 absolute inset-0 flex items-center justify-center px-1 text-[80%] sm:text-[90%] md:text-[100%] lg:text-[120%] font-semibold tracking-[0.18em] text-[#72421A]' +
          scaleClass
        }
      >
        {title}
      </span>
    </span>
  );
}
