"use client";

import { useLocale } from '../IntlProvider.client';

export default function ShopSlotTitle({ title }) {
  const { locale } = useLocale();
  const len = title ? title.length : 0;
  const threshold = locale === 'en' ? 10 : 5;
  const scaleClass = len >= threshold ? ' scale-[0.8]' : '';

  return (
    <span className="flex items-center justify-center m-[0%]">
      <img src="/images/shared/shop_title.png" alt="" aria-hidden="true" className="h-auto w-auto object-contain" />
      <span
        className={
          'pt-1 absolute inset-0 flex items-center justify-center px-3 text-[80%] sm:text-[90%] md:text-[100%] lg:text-[120%] font-semibold tracking-[0.18em] text-[#72421A]' +
          scaleClass
        }
      >
        {title}
      </span>
    </span>
  );
}
