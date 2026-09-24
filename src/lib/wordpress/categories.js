import { wordpressFetch } from './client';

export async function getProductCategories() {
  return wordpressFetch('wc/store/v1/products/categories');
}

export async function getProductCategoryBySlug(slug) {
  const categories = await getProductCategories();

  return categories.find(
    (category) => category.slug === slug
  );
}

export async function getProductCategoriesForAudience() {
  const categories = await getProductCategories();

  const audienceSlugs = ['home', 'cafe', 'business'];

  return categories.filter(
    (category) => !audienceSlugs.includes(category.slug)
  );
}