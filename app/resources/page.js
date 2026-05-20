"use client";

import { PageFrame, SectionTitle } from '../../components/PageFrame';
import { site } from '../../data/site';
import { useLocale } from '../../components/IntlProvider.client';

export default function ResourcesPage() {
  const { t } = useLocale();

  return (
    <PageFrame
      currentPath="/resources"
      eyebrow={t('nav.resources')}
      title={t('features.resources.title')}
      description={t('features.resources.description')}
    >
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="border border-line bg-paper p-6 shadow-panel">
          <SectionTitle eyebrow="External" title="推薦資源" />
          <div className="mt-6 space-y-4">
            {site.resources.map((resource) => (
              <a
                key={resource.title}
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                className="block border border-line bg-panel p-4 transition-colors hover:border-bronze hover:bg-[rgba(206,175,109,0.1)]"
              >
                <p className="font-display text-xl">{resource.title}</p>
                <p className="mt-2 text-sm leading-7 text-[rgba(6,9,8,0.76)]">{resource.note}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="border border-line bg-[rgba(244,240,231,0.9)] p-6 shadow-panel">
          <SectionTitle eyebrow="Credits" title="圖片來源" description="共用圖片放在 public/images/shared，讓三種語言共用同一份素材。" />
          <div className="mt-6 space-y-4">
            {site.imageCredits.map((credit) => (
              <div key={credit.label} className="border border-line bg-paper p-4 text-sm leading-7 text-[rgba(6,9,8,0.76)]">
                <p className="font-semibold text-ink">{credit.label}</p>
                <a href={credit.source} target="_blank" rel="noreferrer" className="mt-2 block break-all border-t border-line pt-3 text-[rgba(6,9,8,0.7)] hover:text-ink">
                  {credit.source}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="border border-line bg-panel p-4 text-sm leading-7 text-[rgba(6,9,8,0.76)]">
              這個靜態站點設計為可直接輸出到 GitHub Pages。若之後要替換圖片，只需要更新 <span className="font-semibold text-ink">data/site.js</span> 即可。
            </div>
            <figure className="border border-line bg-paper overflow-hidden">
              <div className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(206,175,109,0.14),rgba(180,163,151,0.06))] p-3">
                <img src={site.sharedVisuals.card} alt="Shared UI card" className="h-full w-full object-cover" />
              </div>
            </figure>
          </div>
        </section>
      </div>
    </PageFrame>
  );
}
