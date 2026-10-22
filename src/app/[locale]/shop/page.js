import { getTranslations, setRequestLocale } from 'next-intl/server';
import ShopProducts from '@/components/shop/ShopProducts';
import { getProductCategoriesForAudience } from '@/lib/wordpress/categories';
import { getProducts } from '@/lib/wordpress/products';
import { mapWooProduct } from '@/lib/wordpress/mappers';

export const revalidate = 60;

export default async function ShopPage({ params }) {
    const { locale } = await params;

    setRequestLocale(locale);

    const shopT = await getTranslations({ locale, namespace: 'shop' });

    const isRTL = locale === 'fa' || locale === 'ar';
    const isFa = locale === 'fa';

    // دسته‌های محصول (بدون دسته‌های مخاطب: خانه، کافه، کسب‌وکار)
    const categories = await getProductCategoriesForAudience(locale);

    const groups = await Promise.all(
        categories.map(async (category) => {
            const raw = await getProducts({
                category: category.id,
                perPage: 100,
                locale,
            });

            // دسته‌ای که محصول دارد نباید با لیست خالی ساخته و ذخیره شود
            if (raw.length === 0 && category.count > 0) {
                throw new Error(
                    `Empty product list for category "${category.slug}" (${locale}), expected ${category.count}`
                );
            }

            return { category, raw };
        })
    );

    // هر محصول یک‌بار نمایش داده می‌شود، با فهرست دسته‌هایی که عضو آن‌هاست
    const byId = new Map();

    for (const { category, raw } of groups) {
        for (const item of raw) {
            const existing = byId.get(item.id);

            if (existing) {
                existing.filterIds.push(category.id);
            } else {
                byId.set(item.id, {
                    ...mapWooProduct(item),
                    filterIds: [category.id],
                });
            }
        }
    }

    const products = [...byId.values()];

    if (products.length === 0) {
        throw new Error(`Empty product list for shop (${locale})`);
    }

    return (
        <main
            dir={isRTL ? 'rtl' : 'ltr'}
            className="min-h-screen bg-background py-16"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="font-sans text-3xl font-bold text-coffee-dark md:text-4xl">
                        {isFa ? 'فروشگاه' : 'Shop'}
                    </h1>

                    <p className="mt-4 font-sans text-text-muted">
                        {isFa
                            ? 'همه‌ی محصولات فراجهان؛ با فیلتر دسته‌بندی، محصولات را محدود کنید.'
                            : 'All Farajahan products. Use the category filter to narrow them down.'}
                    </p>
                </div>

                <ShopProducts
                    products={products}
                    categories={categories.map(({ id, name, slug }) => ({
                        id,
                        name,
                        slug,
                    }))}
                    locale={locale}
                    currency={shopT('product.currency')}
                />
            </div>
        </main>
    );
}