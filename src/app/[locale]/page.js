import { getTranslations } from 'next-intl/server';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Benefits from '@/components/home/Benefits';
import FAQ from '@/components/home/FAQ';
import CoffeeFinderCTA from '@/components/home/CoffeeFinderCTA';
import CoffeeRoastingHero from '@/components/home/CoffeeRoastingHero';
import AudienceCategories from '@/components/home/AudienceCategories';
import BestSellingProducts from '@/components/home/BestSellingProducts';
export default async function Home({ params }) {
  const { locale } = await params;

  const t = await getTranslations({ locale });

  return (
    <>
<Hero />
<Benefits />
<AudienceCategories locale={locale} />
<CoffeeFinderCTA />
<BestSellingProducts locale={locale} />
<CoffeeRoastingHero/>
<FAQ locale={locale} />
<Footer/>
    </>
  );
}
