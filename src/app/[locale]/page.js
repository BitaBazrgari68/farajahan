import { getTranslations } from 'next-intl/server';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Benefits from '@/components/home/Benefits';
import FAQ from '@/components/home/FAQ';
import CoffeeFinderCTA from '@/components/home/CoffeeFinderCTA';
import CoffeeRoastingHero from '@/components/home/CoffeeRoastingHero';
import AudienceCategories from '@/components/home/AudienceCategories';
import BestSellingProducts from '@/components/home/BestSellingProducts';
import { setRequestLocale } from "next-intl/server";
import { SITE_URL, buildAlternates } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    alternates: buildAlternates(locale),
    openGraph: {
      url: `/${locale}`,
    },
  };
}


export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'قهوه گستران صنعت شرق',
      alternateName: 'Farajahan',
      url: SITE_URL,
      logo: `${SITE_URL}/logo1.png`,
      telephone: '+982191096656',
      sameAs: ['https://www.instagram.com/farajahan.coffee'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: locale === 'fa' ? 'فراجهان' : 'Farajahan',
      url: `${SITE_URL}/${locale}`,
      inLanguage: locale,
    },
  ];


  return (
    <>
      <Hero />
      <Benefits />
      <AudienceCategories locale={locale} />
      <CoffeeFinderCTA />
      <BestSellingProducts locale={locale} />
      <CoffeeRoastingHero />
      <FAQ locale={locale} />
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

    </>
  );
}
