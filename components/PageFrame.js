"use client";

import Link from 'next/link';
import { site } from '../data/site';
import { useLocale } from './IntlProvider.client';

function NavLink({ href, label, currentPath }) {
  const active = currentPath === href;

  return (
    <Link
      href={href}
      className={`border px-4 py-2 text-sm uppercase tracking-[0.24em] transition-colors ${
        active
          ? 'border-bronze bg-bronze text-paper'
          : 'border-line bg-paper text-ink hover:border-bronze hover:bg-[rgba(206,175,109,0.12)]'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  );
}

export function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="space-y-3">
      {eyebrow ? <p className="text-xs uppercase tracking-[0.32em] text-clay">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">{title}</h2>
      {description ? <p className="max-w-3xl text-sm leading-7 text-[rgba(6,9,8,0.78)]">{description}</p> : null}
    </div>
  );
}

function LanguageSwitcher() {
  const { locale, setLocale, localeNames } = useLocale();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        className="appearance-none border border-line bg-paper px-3 py-2 pr-10 text-xs uppercase tracking-[0.24em] text-ink outline-none transition-colors hover:border-bronze focus:border-bronze"
      >
        {Object.keys(localeNames).map((key) => (
          <option key={key} value={key}>
            {localeNames[key]}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-clay">▾</span>
    </label>
  );
}

export function PageFrame({ currentPath, eyebrow, title, description, children }) {
  const { t } = useLocale();

  return (
    <div className="min-h-screen text-ink">
      <header className="border-b border-line bg-[rgba(251,252,252,0.84)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-5 md:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center border-2 border-bronze bg-paper p-0">
                <img src="/images/shared/app_logo.png" alt="Brown Farm app logo" className="h-full w-full object-contain" />
              </span>
              <span className="space-y-1">
                <span className="block font-display text-2xl leading-none tracking-wide">{t('site.name')}</span>
                <span className="block text-xs uppercase tracking-[0.32em] text-clay">{t('site.subtitle')}</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex flex-wrap gap-3">
              <NavLink href="/" label={t('nav.home')} currentPath={currentPath} />
              <NavLink href="/tips" label={t('nav.tips')} currentPath={currentPath} />
              <NavLink href="/resources" label={t('nav.resources')} currentPath={currentPath} />
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main>
        {/* <section className="border-b border-line">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:py-14">
            <div className="space-y-6">
              {eyebrow ? <p className="text-xs uppercase tracking-[0.36em] text-clay">{eyebrow}</p> : null}
              <h1 className="font-display text-4xl leading-tight md:text-6xl">{title}</h1>
              {description ? <p className="max-w-3xl text-base leading-8 text-[rgba(6,9,8,0.76)]">{description}</p> : null}
            </div>

            <div className="grid gap-3 self-start border border-line bg-panel p-5 shadow-panel md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="border border-line bg-paper p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-clay">{t('stats.pages')}</p>
                <p className="mt-2 font-display text-2xl">3</p>
              </div>
              <div className="border border-line bg-paper p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-clay">{t('stats.theme')}</p>
                <p className="mt-2 font-display text-2xl">1</p>
              </div>
            </div>
          </div>
        </section> */}

        <div className="mx-auto w-full max-w-7xl px-5 py-5 md:px-8">{children}</div>
      </main>

      <footer className="border-t border-line bg-[rgba(244,240,231,0.75)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm leading-7 text-[rgba(6,9,8,0.74)]">{t('footer.note')}</p>
          <p className="text-xs uppercase tracking-[0.28em] text-clay">Brown Farm Strategy Wiki</p>
        </div>
      </footer>
    </div>
  );
}
