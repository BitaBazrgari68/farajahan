'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import Footer from '@/components/Footer';

export default function NotFound() {
  const locale = useLocale();
  const isFa = locale === 'fa';
  const isRTL = locale === 'fa' || locale === 'ar';

  return (
    <>
      <main
        dir={isRTL ? 'rtl' : 'ltr'}
        className="flex min-h-[70vh] items-center justify-center bg-[#f7f4ee] px-4 py-16"
      >
        <div className="mx-auto max-w-xl text-center">
          <p className="text-7xl font-extrabold text-gold sm:text-8xl">
            404
          </p>

          <h1 className="mt-6 text-2xl font-bold text-coffee-dark sm:text-3xl">
            {isFa ? 'صفحه‌ای پیدا نشد' : 'Page not found'}
          </h1>

          <p className="mt-4 text-sm leading-8 text-text-muted sm:text-base">
            {isFa
              ? 'نشانی واردشده وجود ندارد یا جابه‌جا شده است. می‌توانید به صفحه نخست برگردید یا محصولات را ببینید.'
              : 'The page you are looking for does not exist or has been moved. You can go back home or browse our products.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${locale}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-coffee-dark px-7 text-sm font-bold text-white transition hover:bg-coffee-brown"
            >
              {isFa ? 'بازگشت به صفحه نخست' : 'Back to home'}
            </Link>

            <Link
              href={`/${locale}/shop`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-coffee-dark/20 px-7 text-sm font-bold text-coffee-dark transition hover:bg-cream"
            >
              {isFa ? 'مشاهده محصولات' : 'View products'}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}