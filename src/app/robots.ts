import type { MetadataRoute } from 'next';

import { APP_URL } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The dashboard and the API are not content; keep them out of the index.
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
