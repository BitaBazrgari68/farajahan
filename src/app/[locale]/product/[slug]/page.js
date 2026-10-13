import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/wordpress/products";
import { mapWooProduct } from "@/lib/wordpress/mappers";
import ProductDetails from "@/components/product/ProductDetails";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { locale, slug } = await params;

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
