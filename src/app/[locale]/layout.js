import { NextIntlClientProvider } from 'next-intl';
import '../globals.css';
import Header from '@/components/Header';
import CartProvider from '@/components/providers/CartProvider';
import { setRequestLocale } from 'next-intl/server';
import AuthProvider from '@/components/providers/AuthProvider';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/lib/seo';

export function generateStaticParams() {
  return [
    { locale: 'fa' },
    { locale: 'en' },
  ];
}

const SEO = {
  fa: {
    title: 'خرید آنلاین قهوه-دانه قهوه تازه رست-پودر قهوه|فراجهان',
    description:
      'فروشگاه اینترنتی قهوه فراجهان؛ خرید دانه قهوه، قهوه آسیاب‌شده و پودر قهوه با رست تازه برای خانه، کافه و کسب‌وکار. ارسال به سراسر ایران.',
    locale: 'fa_IR',
    siteName: 'فراجهان',
  },
  en: {
    title: 'Buy Coffee Online-Fresh Roasted Coffee Beans-Ground Coffee|Farajahan',
    description:
      'Farajahan online coffee shop: buy fresh roasted coffee beans, ground coffee and powder products for home, cafes and businesses. Shipping across Iran.',
    locale: 'en_US',
    siteName: 'Farajahan',
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const seo = SEO[locale] || SEO.fa;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.title,
      template: `%s|${seo.siteName}`,
    },
    description: seo.description,
    robots: {
      index: locale === 'fa',
      follow: locale === 'fa',
    },
    openGraph: {
      type: 'website',
      siteName: seo.siteName,
      title: seo.title,
      description: seo.description,
      locale: seo.locale,
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

const SUPPORTED_LOCALES = ['fa', 'en'];

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

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