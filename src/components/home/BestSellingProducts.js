import { getBestSellingProducts } from '@/lib/wordpress/products';
import { getTranslations } from 'next-intl/server';
import BestSellingProductsCarousel from './BestSellingProductsCarousel';

export default async function BestSellingProducts({ locale = 'fa' }) {
  const t = await getTranslations({
    locale,
    namespace: 'bestSellingProducts',
  });

  const products = await getBestSellingProducts({
    limit: 8,
    locale,
  });

  if (!products?.length) return null;

  const isRTL = locale === 'fa' || locale === 'ar';

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#f7f4ee] py-14 select-none"
    >
      {/* پس‌زمینه ثابت */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="/images/home/best-sellers-bg.jpg"
          alt=""
          className="h-full w-full object-cover"
        />

        
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4">
        <div className="inline-block">
          <img
            decoding="async"
            className="inline-block max-w-12"
            src="/images/home/icon3.png"
            alt="Testimonials"
          />
        </div>
        
        {/* Title */}
        <h2 className="mb-3 text-center text-3xl font-bold text-coffee-dark md:text-4xl">
          {t('title')}
        </h2>

        {/* Description */}
        <p className="mb-10 max-w-2xl text-center mt-3 font-sans text-sm leading-7 text-text-muted md:text-base">
          {t('description')}
        </p>

        <BestSellingProductsCarousel
          products={products}
          locale={locale}
          translations={{
            viewProduct: t('viewProduct'),
            previous: t('previous'),
            next: t('next'),
            adding: t('adding'),
            added: t('added'),
            addToCart: t('addToCart'),
          }}
        />
      </div>
    </section>
  );
}