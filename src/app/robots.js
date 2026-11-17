const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://farajahan.com';

export default function robots() {
  const privatePaths = ['cart', 'checkout', 'order-result', 'account'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          ...['fa', 'en'].flatMap((locale) =>
            privatePaths.map((path) => `/${locale}/${path}`)
          ),
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}