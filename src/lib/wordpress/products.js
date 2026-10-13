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
  if (!slug) {
    return null;
  }

  const normalizeSlug = (value = '') => {
    try {
      return decodeURIComponent(value).toLowerCase();
    } catch {
      return value.toLowerCase();
    }
  };

  const targetSlug = normalizeSlug(slug);

  // ابتدا تلاش برای دریافت محصول با اسلاگ
  const slugParams = new URLSearchParams({
    slug: targetSlug,
    lang: locale,
  });

  const slugResults = await wordpressFetch(
    `wc/store/v1/products?${slugParams.toString()}`,
    { cache: 'no-store' }
  );

  if (Array.isArray(slugResults)) {
    const match = slugResults.find(
      (product) =>
        normalizeSlug(product.slug) === targetSlug
    );

    if (match) {
      return wordpressFetch(
        `wc/store/v1/products/${match.id}`,
        { cache: 'no-store' }
      );
    }
  }

  // اگر جست‌وجوی مستقیم نتیجه نداد، صفحات محصولات را بررسی کن
  for (let page = 1; page <= 20; page++) {
    const params = new URLSearchParams({
      per_page: '100',
      page: String(page),
      lang: locale,
    });

    const products = await wordpressFetch(
      `wc/store/v1/products?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!Array.isArray(products) || products.length === 0) {
      break;
    }

    const match = products.find(
      (product) =>
        normalizeSlug(product.slug) === targetSlug
    );

    if (match) {
      return wordpressFetch(
        `wc/store/v1/products/${match.id}`,
        { cache: 'no-store' }
      );
    }
  }

  return null;
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



export async function getProductVariations(productId, locale = 'fa') {
  if (!productId) {
    return [];
  }

  const params = new URLSearchParams({
    type: 'variation',
    parent: String(productId),
    per_page: '100',
    lang: locale,
  });

  const variations = await wordpressFetch(
    `wc/store/v1/products?${params.toString()}`,
    {
      cache: 'no-store',
    }
  );

  if (!Array.isArray(variations)) {
    return [];
  }

  return variations;
}
