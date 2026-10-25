import { NextIntlClientProvider } from 'next-intl';
import '../globals.css';
import Header from '@/components/Header';
import CartProvider from '@/components/providers/CartProvider';
import { setRequestLocale } from 'next-intl/server';
import AuthProvider from '@/components/providers/AuthProvider';
export function generateStaticParams() {
  return [
    { locale: 'fa' },
    { locale: 'en' },
  ];
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://farajahan.com';

const SEO = {
  fa: {
    title: 'قهوه-فروشگاه قهوه|فراجهان',
    description:
      'خرید آنلاین دانه قهوه، قهوه اسپرسو و محصولات پودری فراجهان برای خانه، کافه و کسب‌وکار. رست تازه و ارسال به سراسر ایران.',
    locale: 'fa_IR',
    siteName: 'فراجهان',
  },
  en: {
    title: 'Coffee-Coffee Shop|Farajahan',
    description:
      'Buy fresh roasted coffee beans, espresso and powder products from Farajahan for home, cafes and businesses. Shipping across Iran.',
    locale: 'en_US',
    siteName: 'Farajahan',
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const seo = SEO[locale] || SEO.fa;

  return {
    metadataBase: new URL(SITE_URL),
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fa: '/fa',
        en: '/en',
        'x-default': '/fa',
      },
    },
    openGraph: {
      type: 'website',
      siteName: seo.siteName,
      title: seo.title,
      description: seo.description,
      locale: seo.locale,
      url: `/${locale}`,
      images: ['/images/hero/farajahan2.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: ['/images/hero/farajahan2.png'],
    },
  };
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (
    await import(`../../messages/${locale}.json`)
  ).default;

  return (
    <html
      lang={locale}
      dir={locale === 'fa' || locale === 'ar' ? 'rtl' : 'ltr'}
      data-scroll-behavior="smooth"
    >
      <body>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
        >
          <CartProvider>
            <AuthProvider>
              <Header />
              {children}
            </AuthProvider>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}