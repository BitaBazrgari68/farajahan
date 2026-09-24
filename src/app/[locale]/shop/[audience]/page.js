import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import {
  getProductCategories,
  getProductCategoryBySlug,
} from '@/lib/wordpress/categories';

import { getProducts } from '@/lib/wordpress/products';

import { mapWooProduct } from '@/lib/wordpress/mappers';

const validAudiences = ['home', 'cafe', 'business'];

/**
 * دسته‌های مخاطب بخشی از ساختار ثابت سایت هستند.
 *
 * دسته‌های محصول را اینجا تعریف نمی‌کنیم.
 * دسته‌های محصول مستقیماً از WooCommerce دریافت می‌شوند.
 */
const audienceSlugs = [
  'home',
  'cafe',
  'business',
];

export default async function AudiencePage({ params }) {
  const { locale, audience } = await params;

  // --------------------------------------------------
  // 1. بررسی مخاطب
  // --------------------------------------------------

  if (!validAudiences.includes(audience)) {
    notFound();
  }

  // --------------------------------------------------
  // 2. پیدا کردن دسته مخاطب
  // --------------------------------------------------

  const audienceCategory =
    await getProductCategoryBySlug(
      audience,
      locale
    );

  if (!audienceCategory) {
    notFound();
  }

  // --------------------------------------------------
  // 3. ترجمه‌های صفحه
  // --------------------------------------------------

  const t = await getTranslations({
    locale,
    namespace: `audienceCategories.${audience}`,
  });

  const shopT = await getTranslations({
    locale,
    namespace: 'shop',
  });

  // --------------------------------------------------
  // 4. دریافت تمام محصولات این مخاطب
  //
  // این لیست مرجع ماست.
  // هر محصولی که در دسته‌های دیگر قرار می‌گیرد
  // باید ابتدا در این لیست وجود داشته باشد.
  // --------------------------------------------------

  const audienceProducts = await getProducts({
    category: audienceCategory.id,
    perPage: 100,
    locale,
  });

  const mappedAudienceProducts =
    audienceProducts.map(mapWooProduct);

  // برای جستجوی سریع‌تر محصولات مخاطب
  const audienceProductIds = new Set(
    mappedAudienceProducts.map(
      (product) => product.id
    )
  );

  // --------------------------------------------------
  // 5. دریافت تمام دسته‌های محصولات از WooCommerce
  //
  // اینجا دیگر هیچ دسته‌ای را hard-code نمی‌کنیم.
  // اگر فردا دسته جدیدی در WooCommerce ساخته شود،
  // در این لیست قرار می‌گیرد.
  // --------------------------------------------------

  const allCategories =
    await getProductCategories(locale);

  // --------------------------------------------------
  // 6. حذف دسته‌های مخاطب
  //
  // مثلاً در صفحه /shop/cafe نمی‌خواهیم
  // خود "For the café" به عنوان یک گروه محصول
  // دوباره نمایش داده شود.
  // --------------------------------------------------

  const productCategories =
    allCategories.filter(
      (category) =>
        !audienceSlugs.includes(category.slug) &&
        category.id !== audienceCategory.id
    );

  // --------------------------------------------------
  // 7. دریافت محصولات هر دسته
  //
  // هیچ slug یا دسته‌ای اینجا به صورت دستی تعریف نشده.
  // بنابراین دسته‌های جدید WooCommerce نیز خودکار
  // وارد این فرآیند می‌شوند.
  // --------------------------------------------------

  const productGroups = await Promise.all(
    productCategories.map(async (category) => {
      const categoryProducts =
        await getProducts({
          category: category.id,
          perPage: 100,
          locale,
        });

      const mappedCategoryProducts =
        categoryProducts.map(mapWooProduct);

      // فقط محصولاتی که هم:
      //
      // 1. در دسته فعلی هستند
      // 2. در دسته مخاطب صفحه هستند
      //
      const products =
        mappedCategoryProducts.filter(
          (product) =>
            audienceProductIds.has(product.id)
        );

      return {
        category,
        products,
      };
    })
  );

  // --------------------------------------------------
  // 8. فقط دسته‌هایی را نمایش بده که محصول دارند
  // --------------------------------------------------

  const validProductGroups =
    productGroups.filter(
      (group) =>
        group.products.length > 0
    );

  // --------------------------------------------------
  // 9. نمایش صفحه
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* عنوان صفحه */}
        <div className="mb-12">
          <h1 className="font-sans text-3xl font-bold text-coffee-dark md:text-4xl">
            {t('title')}
          </h1>

          <p className="mt-4 font-sans text-text-muted">
            {t('description')}
          </p>
        </div>

        {/* گروه‌های محصولات */}
        <div className="space-y-16">

          {validProductGroups.map((group) => (
            <section
              key={group.category.id}
            >

              {/* عنوان دسته */}
              <div className="mb-6">
                <h2 className="font-sans text-2xl font-bold text-coffee-dark">
                  {group.category.name}
                </h2>
              </div>

              {/* کارت محصولات */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                {group.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/${locale}/product/${product.slug}`}
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >

                    {/* تصویر */}
                    <div className="relative aspect-square overflow-hidden bg-cream">

                      {product.image && (
                        <Image
                          src={product.image.src}
                          alt={
                            product.image.alt ||
                            product.name
                          }
                          fill
                          unoptimized
                          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      )}

                    </div>

                    {/* اطلاعات محصول */}
                    <div className="p-4">

                      <h3 className="line-clamp-2 min-h-[3rem] font-sans text-sm font-semibold text-coffee-dark">
                        {product.name}
                      </h3>

                      {product.weight && (
                        <p className="mt-2 text-xs text-text-muted">
                          {product.weight}
                        </p>
                      )}

                      <div className="mt-4">
                        <span className="font-sans text-sm font-bold text-coffee-dark">
                          {product.price.value.toLocaleString(
                            locale === 'fa'
                              ? 'fa-IR'
                              : 'en-US'
                          )}
                        </span>

                        <span className="mr-1 text-xs text-text-muted">
                          {shopT(
                            'product.currency'
                          )}
                        </span>
                      </div>

                    </div>

                  </Link>
                ))}

              </div>

            </section>
          ))}

        </div>

      </div>
    </main>
  );
}