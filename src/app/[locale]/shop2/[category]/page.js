import { notFound } from "next/navigation";
import { getProductCategoryBySlug } from "@/lib/wordpress/categories";
import { getProducts } from "@/lib/wordpress/products";
import { mapWooProduct } from "@/lib/wordpress/mappers";
import ProductCard from "@/components/shop/ProductCard";
import { getTranslations } from "next-intl/server";

export default async function CategoryPage({ params }) {
    const { locale, category } = await params;

    // ---------------------------------------------
    // 1. پیدا کردن دسته‌بندی از WooCommerce
    // ---------------------------------------------

    const productCategory =
        await getProductCategoryBySlug(category);

    if (!productCategory) {
        notFound();
    }

    // ---------------------------------------------
    // 2. دریافت محصولات این دسته
    // ---------------------------------------------

    const rawProducts = await getProducts({
        category: productCategory.id,
        perPage: 100,
        locale,
    });

    // ---------------------------------------------
    // 3. تبدیل محصولات WooCommerce
    // ---------------------------------------------

    const products = rawProducts.map((product) =>
        mapWooProduct(product)
    );

    // ---------------------------------------------
    // 4. ترجمه‌های عمومی فروشگاه
    // ---------------------------------------------

    const shopT = await getTranslations({
        locale,
        namespace: "shop",
    });

    const isRTL =
        locale === "fa" || locale === "ar";

    // ---------------------------------------------
    // 5. نمایش صفحه
    // ---------------------------------------------

    return (
        <main
            dir={isRTL ? "rtl" : "ltr"}
            className="min-h-screen bg-background py-16"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* عنوان دسته */}
                <div className="mb-12">
                    <h1 className="font-sans text-3xl font-bold text-coffee-dark md:text-4xl">
                        {productCategory.name}
                    </h1>

                    {productCategory.description && (
                        <p className="mt-4 max-w-2xl font-sans leading-7 text-text-muted">
                            {productCategory.description}
                        </p>
                    )}
                </div>

                {/* محصولات */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                locale={locale}
                                currency={shopT(
                                    "product.currency"
                                )}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[300px] items-center justify-center rounded-3xl bg-white px-6 text-center shadow-sm">
                        <p className="font-sans text-text-muted">
                            {locale === "fa"
                                ? "محصولی در این دسته‌بندی وجود ندارد."
                                : "No products found in this category."}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}