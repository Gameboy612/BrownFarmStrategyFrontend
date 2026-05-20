"use client";

import { PageFrame, SectionTitle } from '../../components/PageFrame';
import { useLocale } from '../../components/IntlProvider.client';
import cropsData from '../../data/game/crops.json';
import CoinPrice from '../../components/CoinPrice.client';
import Experience from '../../components/Experience.client';
import Level from '../../components/Level.client';

function formatValue(value) {
  if (value === null || value === undefined) return '-';
  return String(value);
}

function formatGrowthTime(seconds, locale) {
  if (seconds === null || seconds === undefined) return '-';

  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds)) return String(seconds);
  if (totalSeconds === 0) return '-';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const labels = {
    en: { h: 'h', m: 'm', s: 's' },
    ja: { h: '時間', m: '分', s: '秒' },
    'zh-Hant': { h: '小時', m: '分', s: '秒' },
  };

  const localeLabels = labels[locale] || labels['zh-Hant'];
  const parts = [];

  if (hours > 0) parts.push(`${hours}${localeLabels.h}`);
  if (minutes > 0) parts.push(`${minutes}${localeLabels.m}`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}${localeLabels.s}`);

  return parts.join(' ');
}

export default function CropsPage() {
  const { t, locale } = useLocale();
  const localeName = locale === 'zh-Hant' ? 'zh-Hant' : locale;

  return (
    <PageFrame
      currentPath="/crops"
      eyebrow={t('nav.crops')}
      title={t('features.crops.title')}
      description={t('features.crops.description')}
    >
      <div className="space-y-6 text-lg md:text-xl">
        <section className="border border-line bg-paper p-6 shadow-panel">
          <SectionTitle
            eyebrow="Data"
            title="Crop Reference Table"
            description="The table below combines localized crop names with the wiki stats in one place. Growth time is stored in seconds."
          />

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-[1000px] w-full border-collapse text-left text-lg">
              <thead>
                <tr className="border-b border-line bg-[rgba(244,240,231,0.9)] text-base uppercase tracking-[0.22em] text-clay">
                  <th className="px-4 py-3">{t('crops.columns.icon')}</th>
                  <th className="px-4 py-3">{t('crops.columns.name')}</th>
                  <th className="px-4 py-3">{t('crops.columns.unlockLevel')}</th>
                  <th className="px-4 py-3">{t('crops.columns.growthTime')}</th>
                  <th className="px-4 py-3">{t('crops.columns.defaultSell')}</th>
                  <th className="px-4 py-3">{t('crops.columns.maxSell')}</th>
                  <th className="px-4 py-3">{t('crops.columns.xp')}</th>
                </tr>
              </thead>
              <tbody>
                {cropsData.items.map((crop, index) => (
                  <tr key={crop.id} className={index % 2 === 0 ? 'bg-paper' : 'bg-[rgba(244,240,231,0.4)]'}>
                    <td className="border-b border-line px-4 py-4">
                      <span className="inline-flex h-16 w-16 items-center justify-center bg-transparent">
                        <img src={crop.imageUrl} alt={crop.names[localeName]} className="h-14 w-14 object-contain" />
                      </span>
                    </td>
                    <td className="border-b border-line px-4 py-4 font-medium text-xl text-ink">{crop.names[localeName]}</td>
                    <td className="border-b border-line px-4 py-4"><Level level={crop.stats.unlockLevel} size={48} /></td>
                    <td className="border-b border-line px-4 py-4">{formatGrowthTime(crop.stats.cropStats?.growthTime ?? crop.stats.growthTime, locale)}</td>
                    <td className="border-b border-line px-4 py-4"><CoinPrice value={crop.stats.defaultSellPrice} /></td>
                    <td className="border-b border-line px-4 py-4"><CoinPrice value={crop.stats.maxSellPrice} /></td>
                    <td className="border-b border-line px-4 py-4"><Experience value={crop.stats.cropStats?.experience ?? crop.stats.experience} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Removed info panels (Data provenance / How to read it) per request */}
      </div>
    </PageFrame>
  );
}