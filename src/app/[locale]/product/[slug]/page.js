import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/wordpress/products";
import { mapWooProduct } from "@/lib/wordpress/mappers";
import ProductDetails from "@/components/product/ProductDetails";
import { setRequestLocale } from "next-intl/server";
export const revalidate = 60;
export async function generateStaticParams() {
  try {
    const res = await fetch(
      'https://farajahan.com/wp-json/wc/store/v1/products?per_page=100&_fields=slug'
    );

    if (!res.ok) return [];

    const products = await res.json();

    return ['fa', 'en'].flatMap((locale) =>
      products.map((product) => ({
        locale,
        slug: decodeURIComponent(product.slug),
      }))
    );
  } catch {
    return [];
  }
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

  return <ProductDetails product={product} locale={locale} />;
}
