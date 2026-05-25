"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '../data/locales/en.json';
import ja from '../data/locales/ja.json';
import zh from '../data/locales/zh-Hant.json';

const LOCALES = { en, ja, 'zh-Hant': zh };

const LocaleContext = createContext({
  locale: 'zh-Hant',
  setLocale: (l) => {},
  t: (k) => k,
  localeNames: LOCALES['zh-Hant'].localeNames,
});

export function useLocale() {
  return useContext(LocaleContext);
}

function resolve(obj, key) {
  return key.split('.').reduce((s, p) => (s && s[p] !== undefined ? s[p] : undefined), obj);
}

function interpolate(template, params = {}) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (params[key] === undefined || params[key] === null) return match;
    return String(params[key]);
  });
}

export default function IntlProvider({ children }) {
  const [locale, setLocaleState] = useState('zh-Hant');

  useEffect(() => {
    const stored = localStorage.getItem('bf_locale');
    if (stored && LOCALES[stored]) setLocaleState(stored);
    else {
      const nav = navigator.language || navigator.userLanguage || 'zh-Hant';
      if (nav.startsWith('ja')) setLocaleState('ja');
      else if (nav.startsWith('en')) setLocaleState('en');
      else setLocaleState('zh-Hant');
    }
  }, []);

  const value = useMemo(() => {
    const messages = LOCALES[locale] || LOCALES['zh-Hant'];
    return {
      locale,
      setLocale: (l) => {
        if (LOCALES[l]) {
          localStorage.setItem('bf_locale', l);
          setLocaleState(l);
        }
      },
      t: (key, params) => {
        const v = resolve(messages, key);
        return v !== undefined ? interpolate(v, params) : key;
      },
      localeNames: LOCALES['zh-Hant'].localeNames,
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
