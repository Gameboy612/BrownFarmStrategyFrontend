"use client";

import Link from 'next/link';
import { PageFrame, SectionTitle } from '../components/PageFrame';
import { site } from '../data/site';
import Slideshow from '../components/Slideshow.client';
import ShopSlot from '../components/shop/ShopSlot';
import ShopHeader from '../components/shop/ShopHeader';
import { useLocale } from '../components/IntlProvider.client';
import BlogIndexClient from './blog/index.client';

export default function HomePage() {
  const { t, locale } = useLocale();

  return (
    <PageFrame
      currentPath="/"
      eyebrow={t('nav.home')}
      title={t('site.name')}
      description={t('site.description')}
    >
      <div className="space-y-12">

        <section className="pt-6">
          <div>
            <h3 className="sr-only">Promotions</h3>
            {/* Slideshow: displays `site.eventGallery` images */}
            <div className="mx-auto max-w-4xl">
              <Slideshow locale={locale} images={site.eventGalleryByLocale?.[locale] && site.eventGalleryByLocale[locale].length > 0 ? site.eventGalleryByLocale[locale] : site.eventGallery} />
            </div>
          </div>
        </section>
        
        <section id="blog" className="space-y-6 border-t border-line pt-12">
          <SectionTitle
            eyebrow="Blog"
            title="Blog"
            description=""
          />
          <BlogIndexClient lang={locale} />
        </section>
        
        <section>  
          <div className="mt-6">
            <ShopHeader title="物資" />
            <div className="mt-4 grid gap-4 sm:gap-6 md:gap-8 grid-cols-2 sm:grid-cols-3 sm:mx-[5%] md:mx-[10%] lg:mx-[15%]">
              {site.homeSlots.map((slot) => (
                <ShopSlot key={slot.title} href={slot.href} icon={slot.icon} title={slot.title} tooltipEnabled={false} />
              ))}
            </div>
          </div>
        </section>


        <section className="grid gap-5 border-t border-line pt-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-line bg-paper p-6 shadow-panel">
            <SectionTitle eyebrow="摘要" title="這個站的用途" />
            <div className="mt-6 space-y-4 text-sm leading-7 text-[rgba(6,9,8,0.76)]">
              {site.heroHighlights.map((line) => (
                <p key={line} className="border-l-2 border-bronze pl-4">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="border border-line bg-panel p-6 shadow-panel">
            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <SectionTitle eyebrow="Next" title="下一步" description="如果你要補強內容，可以直接往 Tips 或 Resources 擴充，不需要改動整體版面。" />
                <div className="mt-6 flex flex-wrap gap-3">
                  {site.nav
                    .filter((item) => item.href !== '/')
                    .map((item) => (
                      <Link key={item.href} href={item.href} className="border border-bronze bg-bronze px-4 py-3 text-sm uppercase tracking-[0.24em] text-paper transition-colors hover:bg-[rgba(206,175,109,0.86)]">
                        {item.label}
                      </Link>
                    ))}
                </div>
              </div>
              <figure className="border border-line bg-paper overflow-hidden">
                <div className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(244,240,231,0.9),rgba(251,252,252,0.8))] p-3">
                  <img src={site.sharedVisuals.grid} alt="Brown Farm shared strategy grid" className="h-full w-full object-cover" />
                </div>
              </figure>
            </div>
          </div>
        </section>
      </div>
    </PageFrame>
  );
}
