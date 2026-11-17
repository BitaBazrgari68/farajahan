export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://farajahan.com';

export const SEO_LOCALES = ['fa', 'en'];

// path برای صفحه‌ی اصلی خالی است، برای بقیه مثل '/about'
// path برای صفحه‌ی اصلی خالی است، برای بقیه مثل '/about'
export function buildAlternates(locale, path = '') {
  return {
    canonical: `/${locale}${path}`,
  };
}

export const ORGANIZATION_NAME = 'قهوه گستران صنعت شرق';
export const INSTAGRAM_URL = 'https://www.instagram.com/farajahan.coffee';

export function buildBreadcrumb(locale, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}/${locale}${item.path}`,
    })),
  };
}

export function buildOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZATION_NAME,
    alternateName: 'Farajahan',
    url: SITE_URL,
    logo: `${SITE_URL}/logo1.png`,
    telephone: '+982191096656',
    sameAs: [INSTAGRAM_URL],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IR',
      streetAddress: 'شهرک صنعتی چناران، فاز ۲، توسعه ۲',
    },
  };
}


// متن ساده از HTML، با طول محدود برای توضیحات متا
export function stripHtml(html, maxLength = 155) {
  const text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`;
}

// slug محصول را برای آدرس امن می‌کند (اسلاگ فارسی ممکن است خام یا کدشده باشد)
export function safeSlug(slug) {
  let decoded = String(slug || '');

  try {
    decoded = decodeURIComponent(decoded);
  } catch { }

  return encodeURIComponent(decoded);
}

// تومان در استاندارد ISO وجود ندارد؛ گوگل ریال (IRR) می‌خواهد
export function toSchemaPrice(amount, currencyCode) {
  const value = Number(amount) || 0;

  if (currencyCode === 'IRT') {
    return { price: value * 10, currency: 'IRR' };
  }

  return { price: value, currency: currencyCode || 'IRR' };
}