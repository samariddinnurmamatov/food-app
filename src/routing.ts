import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'uz', "ru"],
  defaultLocale: 'uz',
  localePrefix: 'as-needed',
  // Uzbek-first: "/" always serves Uzbek; users switch language in Settings
  localeDetection: false
});
