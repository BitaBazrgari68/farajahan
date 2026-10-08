import { wordpressFetch } from './client';

export async function getProducts({
  category,
  page = 1,
  perPage = 12,
  locale = 'fa',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    lang: locale,
  });

  if (category) {
    params.set('category', String(category));
  }

  return wordpressFetch(
    `wc/store/v1/products?${params.toString()}`,
    {
      next: { revalidate: 60 },
    }
  );
}

export async function getBestSellingProducts({
  limit = 8,
  locale = 'fa',
} = {}) {
  const params = new URLSearchParams({
    orderby: 'popularity',
    order: 'desc',
    per_page: String(limit),
    lang: locale,
  });

  return wordpressFetch(
    `wc/store/v1/products?${params.toString()}`,
    {
      next: { revalidate: 60 },
    }
  );
}