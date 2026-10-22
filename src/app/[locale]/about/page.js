import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  Award,
  CalendarDays,
  Coffee,
  FlaskConical,
  Flame,
  Heart,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Footer from '@/components/Footer';
import Reveal from '@/components/about/Reveal';
import CountUp from '@/components/about/CountUp';
import FloatingBeans from '@/components/about/FloatingBeans';
import GalleryCarousel from '@/components/about/GalleryCarousel';
import { mashhadAgents, representatives } from '@/data/contactData';

// تعداد محصولات فروشگاه؛ هر وقت عوض شد اینجا را به‌روز کنید
const PRODUCTS_COUNT = 34;

const journeySteps = [
  { id: 'arrival', image: '/images/hero/steps/coffee-arrival.webp', number: '01' },
  { id: 'roasting', image: '/images/hero/steps/coffee-roasting.webp', number: '02' },
  { id: 'packaging', image: '/images/hero/steps/coffee-packaging.webp', number: '03' },
  { id: 'shipping', image: '/images/hero/steps/shipping.webp', number: '04' },
];

const valueItems = [
  { id: 'quality', icon: ShieldCheck },
  { id: 'rnd', icon: FlaskConical },
  { id: 'freshRoast', icon: Flame },
  { id: 'customer', icon: Heart },
];

const galleryItems = [
  { id: 'roastMachine', src: '/images/about/gallery-1.webp' },
  { id: 'freshBeans', src: '/images/about/gallery-2.webp' },
  { id: 'packaging', src: '/images/about/gallery-3.webp' },
  { id: 'products', src: '/images/about/gallery-4.webp' },
  { id: 'cup', src: '/images/about/gallery-5.webp' },
  { id: 'lab', src: '/images/about/gallery-6.webp' },
];

const glassCard =
  'rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="mb-3 inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-gold">
        <span className="h-px w-8 bg-gold/70" />
        {eyebrow}
        <span className="h-px w-8 bg-gold/70" />
      </span>

      <h2 className="text-2xl font-bold leading-[1.5] text-white md:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-sm leading-8 text-cream/70 md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  const isRTL = locale === 'fa' || locale === 'ar';

  const agentsCount = mashhadAgents.length + representatives.length;

  const formattedAgentsCount = new Intl.NumberFormat(
    locale === 'fa' ? 'fa-IR' : 'en-US'
  ).format(agentsCount);

  const galleryImages = galleryItems.map((item) => ({
    src: item.src,
    alt: t(`gallery.alts.${item.id}`),
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'قهوه گستران صنعت شرق',
    alternateName: 'Farajahan',
    url: 'https://farajahan.com',
    logo: 'https://farajahan.com/logo1.png',
    telephone: '+982191096656',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IR',
      streetAddress: 'شهرک صنعتی چناران، فاز ۲، توسعه ۲',
    },
  };

  return (
    <>
      <main
        dir={isRTL ? 'rtl' : 'ltr'}
        className="relative overflow-hidden bg-coffee-deep"
      >
        {/* ستاره‌ها و نورهای پس‌زمینه */}
        <div
          aria-hidden="true"
          className="contact-stars pointer-events-none absolute inset-0 opacity-60"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[30%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gold/10 blur-[150px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[25%] right-[-10%] h-[420px] w-[420px] rounded-full bg-coffee-brown/40 blur-[130px]"
        />

        <div className="relative">
          {/* ============ بخش بالا ============ */}
          <section className="relative isolate flex min-h-[620px] items-center overflow-hidden md:min-h-[740px]">
            <Image
              src="/images/contact/contact-hero.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className={`-z-10 object-cover ${isRTL
                  ? 'object-left'
                  : 'object-right [transform:scaleX(-1)]'
                }`}
            />

            <div
              aria-hidden="true"
              className={`absolute inset-0 -z-10 bg-coffee-deep/55 md:bg-transparent ${isRTL ? 'md:bg-gradient-to-l' : 'md:bg-gradient-to-r'
                } md:from-coffee-deep/85 md:via-coffee-deep/35 md:to-transparent`}
            />

            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-coffee-deep to-transparent"
            />

            <FloatingBeans />

            <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="max-w-xl">
                <Reveal>
                  <span className="mb-4 inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-gold">
                    <span className="h-px w-8 bg-gold" />
                    {t('hero.eyebrow')}
                  </span>
                </Reveal>

                <Reveal delay={0.12}>
                  <h1 className="text-4xl font-bold leading-[1.4] text-gold-light sm:text-5xl lg:text-6xl">
                    {t('hero.title')}
                  </h1>
                </Reveal>

                <Reveal delay={0.24}>
                  <p className="mt-3 text-lg font-bold text-white md:text-xl">
                    {t('hero.subtitle')}
                  </p>
                </Reveal>

                <Reveal delay={0.36}>
                  <p className="mt-5 max-w-lg text-sm leading-8 text-cream/80 md:text-base">
                    {t('hero.description')}
                  </p>
                </Reveal>

                <Reveal delay={0.48}>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                     href={`/${locale}/shop`}
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-7 text-sm font-bold text-coffee-deep shadow-lg transition-colors duration-300 hover:bg-gold-light"
                    >
                      {t('hero.productsButton')}
                    </Link>

                    <Link
                      href={`/${locale}/contact`}
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-gold/50 bg-white/10 px-7 text-sm font-bold text-gold-light backdrop-blur-md transition-colors duration-300 hover:bg-white/20"
                    >
                      {t('hero.contactButton')}
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ============ داستان ما ============ */}
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <span className="mb-3 inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-gold">
                  <span className="h-px w-8 bg-gold/70" />
                  {t('story.eyebrow')}
                </span>

                <h2 className="text-2xl font-bold leading-[1.6] text-white md:text-4xl">
                  {t('story.title')}
                </h2>

                <div className="mt-6 space-y-4 text-sm leading-8 text-cream/75 md:text-base md:leading-9">
                  <p>{t('story.p1')}</p>
                  <p>{t('story.p2')}</p>
                  <p>{t('story.p3')}</p>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="relative aspect-[7/5] overflow-hidden rounded-3xl border border-gold/30 shadow-[0_25px_70px_rgba(197,147,76,0.18)]">
                  <Image
                    src="/images/about/about-story.webp"
                    alt={t('story.imageAlt')}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>
          </section>

          {/* ============ از دانه تا فنجان ============ */}
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow={t('journey.eyebrow')}
                title={t('journey.title')}
                description={t('journey.description')}
              />
            </Reveal>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-x-[12%] top-[72px] hidden border-t-2 border-dashed border-gold/30 lg:block"
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {journeySteps.map((step, index) => (
                  <Reveal key={step.id} delay={index * 0.12}>
                    <article
                      className={`${glassCard} relative h-full px-6 pb-8 pt-8 text-center transition-all duration-500 hover:-translate-y-1 hover:border-gold/40`}
                    >
                      <div className="relative mx-auto h-[108px] w-[108px]">
                        <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-gold/50 shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
                          <Image
                            src={step.image}
                            alt={t(`journey.steps.${step.id}.title`)}
                            fill
                            sizes="108px"
                            className="object-cover"
                          />
                        </div>

                        <span className="absolute -top-1 right-0 flex h-6 min-w-6 items-center justify-center rounded-full border border-white/70 bg-gold px-1 text-[10px] font-bold text-coffee-deep">
                          {step.number}
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-white">
                        {t(`journey.steps.${step.id}.title`)}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-cream/70">
                        {t(`journey.steps.${step.id}.description`)}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ============ ارزش‌ها ============ */}
          <section className="relative isolate overflow-hidden py-16">
            {/* تصویر پس‌زمینه */}
            <Image
              src="/images/about/about-values-bg.webp"
              alt=""
              fill
              sizes="100vw"
              className="-z-10 object-cover"
            />

            {/* لایه تیره برای خوانایی کارت‌ها */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-coffee-deep/70"
            />

            {/* محو شدن لبه بالا و پایین در زمینه صفحه */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-coffee-deep to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-coffee-deep to-transparent"
            />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Reveal>
                <SectionHeading
                  eyebrow={t('values.eyebrow')}
                  title={t('values.title')}
                />
              </Reveal>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {valueItems.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <Reveal key={item.id} delay={index * 0.12}>
                      <article
                        className={`${glassCard} h-full p-7 text-center transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_25px_60px_rgba(197,147,76,0.2)]`}
                      >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                          <Icon size={30} strokeWidth={1.5} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-white">
                          {t(`values.items.${item.id}.title`)}
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-cream/70">
                          {t(`values.items.${item.id}.description`)}
                        </p>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ============ تیم ما ============ */}
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <div className="relative aspect-[14/9] overflow-hidden rounded-3xl border border-gold/30 shadow-[0_25px_70px_rgba(197,147,76,0.18)]">
                  <Image
                    src="/images/about/about-team.webp"
                    alt={t('team.imageAlt')}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <span className="mb-3 inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-gold">
                  <span className="h-px w-8 bg-gold/70" />
                  {t('team.eyebrow')}
                </span>

                <h2 className="text-2xl font-bold leading-[1.6] text-white md:text-4xl">
                  {t('team.title')}
                </h2>

                <div className="mt-6 space-y-4 text-sm leading-8 text-cream/75 md:text-base md:leading-9">
                  <p>{t('team.p1')}</p>
                  <p>{t('team.p2')}</p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ============ عددها ============ */}
          <section className="relative isolate overflow-hidden border-y border-gold/20 bg-coffee-dark">
            <Image
              src="/images/about/about-stats1-bg.webp"
              alt=""
              fill
              sizes="100vw"
              className="-z-10 object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-coffee-deep/80"
            />

            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <Reveal>
                <p className="mb-10 text-center text-xl font-bold text-white md:text-2xl">
                  {t('stats.title')}
                </p>
              </Reveal>

              <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
                {[
                  {
                    id: 'years',
                    icon: Award,
                    to: 12,
                    from: 0,
                    suffix: '+',
                  },
                  {
                    id: 'since',
                    icon: CalendarDays,
                    to: 1398,
                    from: 1300,
                    suffix: '',
                  },
                  {
                    id: 'agents',
                    icon: Users,
                    to: agentsCount,
                    from: 0,
                    suffix: '',
                  },
                  {
                    id: 'products',
                    icon: Coffee,
                    to: PRODUCTS_COUNT,
                    from: 0,
                    suffix: '',
                  },
                ].map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.id}
                      className="flex flex-col items-center px-4 text-center lg:border-s lg:border-gold/20 lg:first:border-s-0"
                    >
                      <Icon
                        size={30}
                        strokeWidth={1.4}
                        className="text-gold"
                      />

                      <p className="mt-3 text-4xl font-extrabold text-gold-light md:text-5xl">
                        <CountUp
                          to={stat.to}
                          from={stat.from}
                          suffix={stat.suffix}
                          locale={locale}
                        />
                      </p>

                      <p className="mt-2 text-sm text-cream/70">
                        {t(`stats.items.${stat.id}`)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ============ گالری ============ */}
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow={t('gallery.eyebrow')}
                title={t('gallery.title')}
                description={t('gallery.description')}
              />
            </Reveal>

            <Reveal delay={0.1}>
              <GalleryCarousel
                images={galleryImages}
                rtl={isRTL}
                previousLabel={t('gallery.previous')}
                nextLabel={t('gallery.next')}
              />
            </Reveal>
          </section>

          {/* ============ شبکه نمایندگان ============ */}
          <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
            <Reveal>
              <div
                className={`${glassCard} relative overflow-hidden border-gold/30 from-gold/15 p-8 text-center md:p-14`}
              >
                <span className="mb-3 inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-gold">
                  <span className="h-px w-8 bg-gold/70" />
                  {t('network.eyebrow')}
                  <span className="h-px w-8 bg-gold/70" />
                </span>

                <h2 className="text-2xl font-bold leading-[1.6] text-white md:text-4xl">
                  {t('network.title')}
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-cream/75 md:text-base">
                  {t('network.description', { count: formattedAgentsCount })}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/${locale}/contact`}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-7 text-sm font-bold text-coffee-deep shadow-lg transition-colors duration-300 hover:bg-gold-light"
                  >
                    {t('network.contactButton')}
                  </Link>

                  <Link
                    href={`/${locale}/shop`}
                   
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-gold/50 bg-white/10 px-7 text-sm font-bold text-gold-light backdrop-blur-md transition-colors duration-300 hover:bg-white/20"
                  >
                    {t('network.productsButton')}
                  </Link>
                </div>
              </div>
            </Reveal>
          </section>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </main>

      <Footer />
    </>
  );
}