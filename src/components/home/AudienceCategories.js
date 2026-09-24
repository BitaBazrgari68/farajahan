import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Coffee, Store, Briefcase } from 'lucide-react';
import AudienceCategoriesMotion from '@/components/AudienceCategoriesMotion';

const audienceCategories = [
  {
    id: 'home',
    image: '/images/home/audience-home.webp',
    href: '/shop/home',
    icon: Coffee,
  },
  {
    id: 'cafe',
    image: '/images/home/audience-cafe.webp',
    href: '/shop/cafe',
    icon: Store,
  },
  {
    id: 'business',
    image: '/images/home/audience-business.webp',
    href: '/shop/business',
    icon: Briefcase,
  },
];

export default async function AudienceCategories({ locale }) {
  const t = await getTranslations({
    locale,
    namespace: 'audienceCategories',
  });

  return (
    <section className="bg-[url('/images/home/best-sellers-bg.jpg')] bg-no-repeat bg-cover py-16 md:py-20">
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <div className="inline-block">
            <img
              decoding="async"
              className="inline-block max-w-12"
              src="/images/home/icon3.png"
              alt="Testimonials"
            />
          </div>

          <h2 className="font-sans text-2xl font-bold text-coffee-dark md:text-3xl">
            {t('title')}
          </h2>

          <p className="mt-3 font-sans text-sm leading-7 text-text-muted md:text-base">
            {t('description')}
          </p>
        </div>

        {/* Audience Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {audienceCategories.map((category, index) => {
            const Icon = category.icon;

            return (
              <AudienceCategoriesMotion
                key={category.id}
                delay={index * 180}
              >
                <Link
                  href={`/${locale}${category.href}`}
                  className="
                    group
                    relative
                    block
                    min-h-[360px]
                    overflow-hidden
                    rounded-3xl
                  "
                >
                  {/* Background Image */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-cover
                      bg-center
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-105
                    "
                    style={{
                      backgroundImage: `url(${category.image})`,
                    }}
                  />

                  {/* Dark Overlay */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-coffee-deep/55
                      transition-colors
                      duration-500
                      group-hover:bg-coffee-deep/65
                    "
                  />

                  {/* Gold Accent */}
                  <div className="absolute inset-x-8 top-8 h-px bg-gold-light/60" />

                  {/* Content */}
                  <div
                    className="
                      relative
                      flex
                      h-full
                      min-h-[360px]
                      flex-col
                      items-center
                      justify-end
                      p-8
                      text-center
                    "
                  >
                    {/* Icon */}
                    <div
                      className="
                        mb-6
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        bg-white/10
                        text-white
                        backdrop-blur-sm
                        transition-transform
                        duration-500
                        group-hover:scale-110
                      "
                    >
                      <Icon size={32} strokeWidth={1.5} />
                    </div>

                    <div className="max-w-sm">
                      <h3 className="font-sans text-2xl font-bold text-white md:text-3xl">
                        {t(`${category.id}.title`)}
                      </h3>

                      <p className="mt-3 font-sans text-sm leading-7 text-cream md:text-base">
                        {t(`${category.id}.description`)}
                      </p>

                      <span
                        className="
                          mt-6
                          inline-flex
                          items-center
                          rounded-2xl
                          border
                          border-gold-light
                          bg-gold
                          px-6
                          py-2.5
                          font-sans
                          text-sm
                          font-medium
                          text-coffee-deep
                          transition-all
                          duration-300
                          group-hover:bg-gold-light
                        "
                      >
                        {t(`${category.id}.button`)}
                      </span>
                    </div>
                  </div>
                </Link>
              </AudienceCategoriesMotion>
            );
          })}
        </div>

      </div>
    </section>
  );
}