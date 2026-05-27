"use client";

import { useLocale } from './IntlProvider.client';
import { SectionTitle } from './PageFrame';
import BlogIndex from '../app/blog/index.client';

export default function HomeBlog({ blogs }) {
  const { t, locale } = useLocale();

  return (
    <section id="blog" className="space-y-6 border-t border-line pt-12">
      <SectionTitle eyebrow={t('nav.blog')} title={t('nav.blog')} description="" />
      <BlogIndex blogs={blogs} lang={locale} />
    </section>
  );
}
