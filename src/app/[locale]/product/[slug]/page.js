import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/wordpress/products";
import { mapWooProduct } from "@/lib/wordpress/mappers";
import ProductDetails from "@/components/product/ProductDetails";
import { setRequestLocale } from "next-intl/server";
import {
  SITE_URL,
  buildBreadcrumb,
  safeSlug,
  stripHtml,
  toSchemaPrice,
} from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const results = await Promise.all(
      ['fa', 'en'].map(async (locale) => {
        const res = await fetch(
          `https://farajahan.com/wp-json/wc/store/v1/products?per_page=100&lang=${locale}&_fields=slug`
        );

        if (!res.ok) return [];

        const products = await res.json();

        return products.map((product) => ({
          locale,
          slug: decodeURIComponent(product.slug),
        }));
      })
    );

    return results.flat();
  } catch {
    return [];
  }
}

function buildProductSeo(rawProduct, locale) {
  const isFa = locale === 'fa';
  const name = rawProduct.name;

  const title = isFa ? `خرید ${name}` : `Buy ${name}`;

  const fallback = isFa
    ? `خرید آنلاین ${name} از فراجهان؛ قهوه تازه رست با ارسال به سراسر ایران.`
    : `Buy ${name} online from Farajahan: fresh roasted coffee shipped across Iran.`;

  const description =
    stripHtml(rawProduct.short_description || rawProduct.description) ||
    fallback;

  const path = `/${locale}/product/${safeSlug(rawProduct.slug)}`;
  const image = rawProduct.images?.[0]?.src
    ? encodeURI(rawProduct.images[0].src)
    : null;

  return { title, description, path, image };
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const rawProduct = await getProductBySlug(slug, locale);

  if (!rawProduct) return {};

  const seo = buildProductSeo(rawProduct, locale);

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.path,
    },
    openGraph: {
      type: 'website',
      title: seo.title,
      description: seo.description,
      url: seo.path,
      ...(seo.image && { images: [seo.image] }),
    },
    twitter: {
      title: seo.title,
      description: seo.description,
      ...(seo.image && { images: [seo.image] }),
    },
  };
}

function buildProductJsonLd({ rawProduct, mappedProduct, seo, locale }) {
  const isFa = locale === 'fa';
  const url = `${SITE_URL}${seo.path}`;
  const currencyCode = rawProduct.prices?.currency_code;

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: mappedProduct.name,
    description: seo.description,
    url,
    brand: {
      '@type': 'Brand',
      name: isFa ? 'فراجهان' : 'Farajahan',
    },
  };

  if (seo.image) product.image = [seo.image];
  if (rawProduct.sku) product.sku = rawProduct.sku;

  const availability = mappedProduct.stock.available
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const { priceRange, price } = mappedProduct;

  if (priceRange && priceRange.max > priceRange.min) {
    const low = toSchemaPrice(priceRange.min, currencyCode);
    const high = toSchemaPrice(priceRange.max, currencyCode);

    product.offers = {
      '@type': 'AggregateOffer',
      priceCurrency: low.currency,
      lowPrice: low.price,
      highPrice: high.price,
      availability,
      url,
    };
  } else if (price.value > 0) {
    const converted = toSchemaPrice(price.value, currencyCode);

    product.offers = {
      '@type': 'Offer',
      priceCurrency: converted.currency,
      price: converted.price,
      availability,
      url,
      seller: {
        '@type': 'Organization',
        name: 'قهوه گستران صنعت شرق',
      },
    };
  }

  if (mappedProduct.reviewCount > 0 && mappedProduct.rating > 0) {
    product.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: mappedProduct.rating,
      reviewCount: mappedProduct.reviewCount,
    };
  }

  return [
    product,
    buildBreadcrumb(locale, [
      { name: isFa ? 'خانه' : 'Home', path: '' },
      { name: isFa ? 'فروشگاه' : 'Shop', path: '/shop' },
      { name: mappedProduct.name, path: `/product/${safeSlug(rawProduct.slug)}` },
    ]),
  ];
}

export default async function ProductPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const rawProduct = await getProductBySlug(slug, locale);

  if (!rawProduct) {
    notFound();
  }

  // استفاده از همان ساختار محصولی که ProductCard مصرف می‌کند.
  const mappedProduct = mapWooProduct(rawProduct);

  const product = {
    ...mappedProduct,
    description:
      rawProduct.short_description || rawProduct.description || "",
  };

  const seo = buildProductSeo(rawProduct, locale);

  const jsonLd = buildProductJsonLd({
    rawProduct,
    mappedProduct,
    seo,
    locale,
  });

  return (
    <>
      <ProductDetails product={product} locale={locale} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}