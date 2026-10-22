import { wordpressFetch } from './client';

// slug دسته‌ها در آدرس‌های سایت همان slug فارسی است.
// در WPML دسته‌ی انگلیسی slug جدا دارد، پس برای en تبدیل می‌شود.
const EN_SLUGS = {
  home: 'for-the-home',
  cafe: 'for-the-cafe',
  business: 'for-business',
  '250g': '250g-products',
  abmive: 'fruit-drink',
};

export async function getProductCategories(locale = 'fa') {
  const params = new URLSearchParams({
    per_page: '100',
    lang: locale,
  });

  return wordpressFetch(
    `wc/store/v1/products/categories?${params.toString()}`
  );
}

export async function getProductCategoryBySlug(slug, locale = 'fa') {
  const categories = await getProductCategories(locale);

  const target = locale === 'en' ? EN_SLUGS[slug] || slug : slug;

  const found = categories.find((category) => category.slug === target);

  if (found || locale === 'fa') return found;

  // slug انگلیسی عوض شده یا در EN_SLUGS نیست: به نسخه‌ی فارسی برگرد تا صفحه ۴۰۴ نشود
  console.warn(
    `Category "${slug}" not found for locale "${locale}"; falling back to fa`
  );

  const faCategories = await getProductCategories('fa');

  return faCategories.find((category) => category.slug === slug);
}

export async function getProductCategoriesForAudience(locale = 'fa') {
  const categories = await getProductCategories(locale);

  const audienceSlugs = [
    'home',
    'cafe',
    'business',
    'for-the-home',
    'for-the-cafe',
    'for-business',
  ];

  return categories.filter(
    (category) => !audienceSlugs.includes(category.slug)
  );
}