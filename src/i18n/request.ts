import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { LOCALE_TAG, routing, type Locale } from './routing';
import { env } from '@/config/env';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    /**
     * Dates are stored as UTC and rendered in the company's timezone so a trip that
     * starts on the 5th never displays as the 4th for a visitor in another zone.
     */
    timeZone: env.SITE_TIMEZONE,
    formats: {
      dateTime: {
        short: { day: 'numeric', month: 'short', year: 'numeric' },
        long: { day: 'numeric', month: 'long', year: 'numeric' },
        dayMonth: { day: 'numeric', month: 'long' },
      },
    },
    now: new Date(),
    onError(error) {
      // Missing messages are a content bug, not a crash. Surface them in development.
      if (process.env.NODE_ENV === 'development') console.warn(error.message);
    },
    getMessageFallback({ key, namespace }) {
      return [namespace, key].filter(Boolean).join('.');
    },
  };
});

export { LOCALE_TAG };
