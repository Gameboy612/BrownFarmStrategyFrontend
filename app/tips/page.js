"use client";

import { PageFrame, SectionTitle } from '../../components/PageFrame';
import { site } from '../../data/site';
import { useLocale } from '../../components/IntlProvider.client';

export default function TipsPage() {
  const { t } = useLocale();

  return (
    <PageFrame
      currentPath="/tips"
      eyebrow={t('nav.tips')}
      title={t('features.tips.title')}
      description={t('features.tips.description')}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
        <div className="space-y-5">
          {site.tipsSections.map((section) => (
            <article key={section.title} className="border border-line bg-paper p-6 shadow-panel">
              <SectionTitle eyebrow="Strategy" title={section.title} description={section.summary} />
              <ul className="mt-6 space-y-4">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 border border-line bg-panel p-4 text-sm leading-7 text-[rgba(6,9,8,0.76)]">
                    <span className="mt-1 h-2 w-2 shrink-0 bg-bronze" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <aside className="space-y-5">
          <div className="border border-line bg-panel p-6 shadow-panel">
            <SectionTitle eyebrow="Checklist" title="每日檢查表" />
            <div className="mt-6 space-y-3 text-sm leading-7 text-[rgba(6,9,8,0.76)]">
              <p className="border-l-2 border-bronze pl-4">先完成固定收益，再做高波動操作。</p>
              <p className="border-l-2 border-bronze pl-4">先整理格位與資源，再點升級。</p>
              <p className="border-l-2 border-bronze pl-4">先看是否值得，後看是不是能升。</p>
              <p className="border-l-2 border-bronze pl-4">先記錄卡點，後面才能刪除重複成本。</p>
            </div>
          </div>

          <div className="border border-line bg-[rgba(244,240,231,0.88)] p-6 shadow-panel">
            <SectionTitle eyebrow="Focus" title="判斷優先順序" description="如果只有有限時間，先處理這三個方向。" />
            <ol className="mt-6 space-y-3 text-sm leading-7 text-[rgba(6,9,8,0.76)]">
              <li className="border border-line bg-paper p-4">
                <span className="font-semibold text-ink">1. 產能節點</span>
                <p className="mt-2">直接影響資源累積的項目優先。</p>
              </li>
              <li className="border border-line bg-paper p-4">
                <span className="font-semibold text-ink">2. 操作效率</span>
                <p className="mt-2">能縮短日常流程的設計最值得先優化。</p>
              </li>
              <li className="border border-line bg-paper p-4">
                <span className="font-semibold text-ink">3. 活動補缺口</span>
                <p className="mt-2">活動只拿來補齊缺少的部分，不要反客為主。</p>
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </PageFrame>
  );
}
