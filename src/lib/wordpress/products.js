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





export async function getProductBySlug(slug, locale = 'fa') {
  if (!slug) return null;

  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {}

  const encoded = encodeURIComponent(decoded).toLowerCase();

  // اگر خطای شبکه رخ دهد عمداً پرتاب می‌شود تا نسخه‌ی قبلیِ سالم صفحه حفظ شود
  const found = await wordpressFetch(
    `wp/v2/product?slug=${encoded}&lang=${locale}&_fields=id`,
    { next: { revalidate: 60 } }
  );

  const id = Array.isArray(found) ? found[0]?.id : null;

  // فقط وقتی وردپرس جواب خالی داد، محصول واقعاً وجود ندارد
  if (!id) return null;

  return wordpressFetch(`wc/store/v1/products/${id}`, {
    next: { revalidate: 60 },
  });
}

export async function getProductById(id) {
  if (!id) {
    return null;
  }

  return wordpressFetch(
    `wc/store/v1/products/${id}`,
    {
      next: { revalidate: 60 },
    }
  );
}



