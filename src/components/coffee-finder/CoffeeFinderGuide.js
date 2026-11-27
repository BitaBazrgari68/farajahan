import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

// بخش متن راهنما زیر فایندر؛ در سرور رندر می‌شود و بدون جاوااسکریپت هم خوانده می‌شود.

const audiences = [
    { id: 'home', href: '/shop/home' },
    { id: 'cafe', href: '/shop/cafe' },
    { id: 'business', href: '/shop/business' },
];

const faqIds = ['how', 'login', 'otherMethod', 'cafePack', 'wholesale'];

export default async function CoffeeFinderGuide({ locale }) {
    const t = await getTranslations({
        locale,
        namespace: 'coffeeFinderGuide',
    });

    const isRTL = locale === 'fa' || locale === 'ar';

    return (
        <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8"
        >
            {/* مقدمه */}
            <section aria-labelledby="finder-guide-intro">
                <h2
                    id="finder-guide-intro"
                    className="text-2xl font-bold leading-[1.6] text-coffee-dark md:text-3xl"
                >
                    {t('intro.title')}
                </h2>

                <p className="mt-4 text-sm leading-8 text-text-muted md:text-base md:leading-9">
                    {t('intro.text')}
                </p>
            </section>

            {/* عربیکا یا روبستا */}
            <section
                aria-labelledby="finder-guide-arabica"
                className="mt-12"
            >
                <h2
                    id="finder-guide-arabica"
                    className="text-2xl font-bold leading-[1.6] text-coffee-dark md:text-3xl"
                >
                    {t('arabica.title')}
                </h2>

                <p className="mt-4 text-sm leading-8 text-text-muted md:text-base md:leading-9">
                    {t('arabica.text')}
                </p>
            </section>

            {/* روش دم و میزان آسیاب */}
            <section
                aria-labelledby="finder-guide-grind"
                className="mt-12"
            >
                <h2
                    id="finder-guide-grind"
                    className="text-2xl font-bold leading-[1.6] text-coffee-dark md:text-3xl"
                >
                    {t('grind.title')}
                </h2>

                <p className="mt-4 text-sm leading-8 text-text-muted md:text-base md:leading-9">
                    {t('grind.text')}
                </p>
            </section>

            {/* لینک به دسته‌ها */}
            <section
                aria-labelledby="finder-guide-audiences"
                className="mt-12"
            >
                <h2
                    id="finder-guide-audiences"
                    className="text-2xl font-bold leading-[1.6] text-coffee-dark md:text-3xl"
                >
                    {t('audiences.title')}
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {audiences.map((audience) => (
                        <Link
                            key={audience.id}
                            href={`/${locale}${audience.href}`}
                            className="group rounded-2xl border border-cream bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <h3 className="text-lg font-bold text-coffee-dark">
                                {t(`audiences.${audience.id}.title`)}
                            </h3>

                            <p className="mt-2 text-sm leading-7 text-text-muted">
                                {t(`audiences.${audience.id}.description`)}
                            </p>

                            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-dark transition group-hover:text-gold">
                                {t('audiences.linkLabel')}

                                <span
                                    aria-hidden="true"
                                    className={isRTL ? 'rotate-180' : ''}
                                >
                                    →
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* پرسش‌های متداول */}
            <section
                aria-labelledby="finder-guide-faq"
                className="mt-12 pb-4"
            >
                <h2
                    id="finder-guide-faq"
                    className="text-2xl font-bold leading-[1.6] text-coffee-dark md:text-3xl"
                >
                    {t('faq.title')}
                </h2>

                <div className="mt-6 divide-y divide-cream border-y border-cream">
                    {faqIds.map((id) => (
                        <details key={id} className="group">
                            <summary
                                className={`flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-medium text-coffee-dark transition-colors hover:text-gold-dark md:text-lg ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                                <span>{t(`faq.items.${id}.question`)}</span>

                                <span
                                    aria-hidden="true"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cream text-xl font-light text-text-muted transition-transform duration-300 group-open:rotate-45"
                                >
                                    +
                                </span>
                            </summary>

                            <p
                                className={`max-w-3xl pb-6 text-sm leading-8 text-text-muted md:text-base ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                                {t(`faq.items.${id}.answer`)}
                            </p>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    );
}