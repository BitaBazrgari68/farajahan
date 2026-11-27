import { wordpressFetch } from '@/lib/wordpress/client';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://farajahan.com';

// فقط فارسی ایندکس می‌شود (در layout.js نسخه‌ی انگلیسی noindex است).
// وقتی انگلیسی را فعال کردید، 'en' را برگردانید و robots در layout.js را هم عوض کنید.
const LOCALES = ['fa'];
// نقشه سایت هر یک ساعت دوباره ساخته می‌شود
export const revalidate = 3600;

const staticPaths = [
  '',
  '/shop',
  '/shop/home',
  '/shop/cafe',
  '/shop/business',
  '/shop2/coffee',
  '/shop2/powder-products',
  '/shop2/250g',
  '/shop2/abmive',
  '/about',
  '/contact',
  '/coffee-finder',
];

async function getProductSlugs(locale) {
  try {
    const products = await wordpressFetch(
      `wc/store/v1/products?per_page=100&lang=${locale}&_fields=slug`
    );

    if (!Array.isArray(products)) return [];

    return products.map((product) => product.slug);
  } catch {
    // اگر وردپرس در دسترس نبود، نقشه سایت بدون محصولات ساخته می‌شود
    return [];
  }
}

export default async function sitemap() {
  const now = new Date();

  const pages = staticPaths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((item) => [item, `${SITE_URL}/${item}${path}`])
        ),
      },
    }))
  );

  const productGroups = await Promise.all(
    LOCALES.map(async (locale) => {
      const slugs = await getProductSlugs(locale);

      return slugs.map((slug) => {
        let decoded = slug;

        try {
          decoded = decodeURIComponent(slug);
        } catch {}

        return {
          url: `${SITE_URL}/${locale}/product/${encodeURIComponent(decoded)}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        };
      });
    })
  );

  return [...pages, ...productGroups.flat()];
}