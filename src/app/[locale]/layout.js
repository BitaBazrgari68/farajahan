import { NextIntlClientProvider } from 'next-intl';
import '../globals.css';
import Header from '@/components/Header';

export function generateStaticParams() {
  return [
    { locale: 'fa' },
    { locale: 'en' },
  ];
}

export const metadata = {
  title: 'فروشگاه قهوه فراجهان',
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  const messages = (
    await import(`../../messages/${locale}.json`)
  ).default;

  return (
    <html
      lang={locale}
      dir={locale === 'fa' || locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <body>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
        >
          <Header />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}