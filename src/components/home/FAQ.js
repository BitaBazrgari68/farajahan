import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import FAQMotion from '@/components/FAQMotion';

const faqItems = [
  {
    id: 'arabicaRobusta',
    href: '/shop',
  },
  {
    id: 'espresso',
    href: '/shop/home',
  },
  {
    id: 'caffeine',
    href: '/shop/home',
  },
  {
    id: 'chooseCoffee',
    href: '/shop/home',
  },
  {
    id: 'cafe',
    href: '/shop/cafe',
  },
  {
    id: 'business',
    href: '/shop/business',
  },
];

export default async function FAQ({ locale }) {
  const t = await getTranslations({
    locale,
    namespace: 'faq',
  });

  const isRTL = locale === 'fa' || locale === 'ar';

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: t(`${item.id}.question`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`${item.id}.answer`),
      },
    })),
  };

  return (
    <section
      id="faq"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="bg-[#F5F1EE] bg-[url('/images/home/bg-faq.webp')] bg-contain bg-top bg-no-repeat py-20"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-5xl px-6">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block">
            <img
              decoding="async"
              className="inline-block max-w-12"
              src="/images/home/icon3.png"
              alt="Testimonials"
            />
          </div>

          <p className="mb-3 text-sm font-medium tracking-wide text-brown/60">
            {t('eyebrow')}
          </p>

          <h2
            id="faq-heading"
            className="text-3xl font-semibold text-brown md:text-4xl"
          >
            {t('title')}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-brown/60 md:text-base">
            {t('description')}
          </p>
        </div>

        {/* FAQ List */}
        <div className="divide-y divide-brown/10 border-y border-brown/10">
          {faqItems.map((item, index) => {
            const href = `/${locale}${item.href}`;

            return (
              <FAQMotion
                key={item.id}
                delay={index * 220}
              >
                <details className="group">

                  <summary
                    className={`
                      flex
                      cursor-pointer
                      list-none
                      items-center
                      justify-between
                      gap-6
                      py-6
                      text-base
                      font-medium
                      text-brown
                      transition-colors
                      hover:text-brown/70
                      md:text-lg
                      ${isRTL ? 'text-right' : 'text-left'}
                    `}
                  >
                    <span className="flex min-w-0 items-center gap-4">
                      <span className="shrink-0 text-sm text-brown/30">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span>
                        {t(`${item.id}.question`)}
                      </span>
                    </span>

                    <span
                      aria-hidden="true"
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-brown/15
                        text-xl
                        font-light
                        text-brown/60
                        transition-transform
                        duration-300
                        group-open:rotate-45
                      "
                    >
                      +
                    </span>
                  </summary>

                  <div className="pb-6 ps-10">
                    <p
                      className={`
                        max-w-3xl
                        text-sm
                        leading-8
                        text-brown/65
                        md:text-base
                        ${isRTL ? 'text-right' : 'text-left'}
                      `}
                    >
                      {t(`${item.id}.answer`)}
                    </p>

                    <Link
                      href={href}
                      className="
                        mt-4
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-brown
                        underline-offset-4
                        transition
                        hover:underline
                      "
                    >
                      <span>
                        {t(`${item.id}.linkLabel`)}
                      </span>

                      <span
                        aria-hidden="true"
                        className={isRTL ? 'rotate-180' : ''}
                      >
                        →
                      </span>
                    </Link>
                  </div>

                </details>
              </FAQMotion>
            );
          })}
        </div>
      </div>

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </section>
  );
}