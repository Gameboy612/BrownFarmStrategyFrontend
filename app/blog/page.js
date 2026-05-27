"use client";

import dynamic from 'next/dynamic';
import BlogIndexClient from './index.client';
import { PageFrame, SectionTitle } from '../../components/PageFrame';
import { useLocale } from '../../components/IntlProvider.client';


export default function Page() {
  const { t, locale } = useLocale();
  return (
    <PageFrame currentPath={`/blog`}>
      <div className="space-y-6">
        <SectionTitle eyebrow="Blog" title="Blog" description="" />
        <BlogIndexClient lang={locale} />
      </div>
    </PageFrame>
  );
}
