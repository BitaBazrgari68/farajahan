import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Phone, MapPin, Factory, Users, ShoppingBag } from 'lucide-react';
import Footer from '@/components/Footer';
import FlipCard from '@/components/contact/FlipCard';
import {
    mainContacts,
    complaintsPhone,
    mashhadAgents,
    representatives,
} from '@/data/contactData';

const mainIcons = {
    factory: Factory,
    agents: Users,
    sales: ShoppingBag,
};

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'contact' });

    return { title: t('metaTitle') };
}

function PhoneLink({ phone, label, className = '' }) {
    return (
        <a
            href={`tel:${phone}`}
            aria-label={`${label} ${phone}`}
            dir="ltr"
            className={`inline-flex items-center gap-2 font-bold tracking-wide transition-colors duration-200 ${className}`}
        >
            <Phone size={16} strokeWidth={2} />
            <span>{phone}</span>
        </a>
    );
}

function SectionTitle({ children }) {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
                {children}
            </h2>
            <div className="mt-3 h-0.5 w-12 rounded-full bg-gold" />
        </div>
    );
}

const glassCard =
    'rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.03] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_25px_60px_rgba(197,147,76,0.2)]';

export default async function ContactPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const t = await getTranslations({ locale, namespace: 'contact' });
    const isRTL = locale === 'fa' || locale === 'ar';

    return (
        <>
            <main
                dir={isRTL ? 'rtl' : 'ltr'}
                className="relative overflow-hidden bg-coffee-deep"
            >
                {/* ستاره‌ها و نورهای پس‌زمینه */}
                <div
                    aria-hidden="true"
                    className="contact-stars pointer-events-none absolute inset-0 opacity-70"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gold/15 blur-[140px]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[30%] right-[-10%] h-[420px] w-[420px] rounded-full bg-coffee-brown/40 blur-[130px]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[-5%] left-[-10%] h-[420px] w-[420px] rounded-full bg-gold-dark/20 blur-[130px]"
                />

                <div className="relative">
                    {/* ============ بخش بالا ============ */}
                    <section className="relative bg-cover bg-center [background-image:linear-gradient(to_bottom,rgba(14,9,6,0.45),rgba(14,9,6,0.95)),url('/images/contact/contact-hero.webp')]">
                        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
                            <div className="max-w-2xl">
                                <span className="mb-4 inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-gold">
                                    <span className="h-px w-8 bg-gold" />
                                    {t('eyebrow')}
                                </span>

                                <h1 className="text-3xl font-bold leading-[1.5] text-white sm:text-4xl lg:text-5xl">
                                    {t('title')}
                                </h1>

                                <p className="mt-5 text-sm leading-8 text-cream/80 md:text-base">
                                    {t('description')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ============ تماس‌های اصلی ============ */}
                    <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
                        <div className="grid gap-5 md:grid-cols-3">
                            {mainContacts.map((item) => {
                                const Icon = mainIcons[item.id];

                                return (
                                    <article key={item.id} className={glassCard}>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                                            <Icon size={24} strokeWidth={1.7} />
                                        </div>

                                        <h2 className="mt-5 text-lg font-bold text-white">
                                            {t(`main.${item.id}.title`)}
                                        </h2>

                                        <p className="mt-1 text-sm text-cream/70">
                                            {t(`main.${item.id}.note`)}
                                        </p>

                                        <PhoneLink
                                            phone={item.phone}
                                            label={t(`main.${item.id}.title`)}
                                            className="mt-5 text-lg text-gold hover:text-gold-light"
                                        />
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    {/* ============ عوامل فروش مشهد ============ */}
                    <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
                        <SectionTitle>{t('mashhadTitle')}</SectionTitle>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {mashhadAgents.map((agent) => (
                                <FlipCard
                                    key={agent.phone}
                                    title={t('mashhadRole')}
                                    subtitle={agent.area}
                                    person={agent.person}
                                    phone={agent.phone}
                                />
                            ))}
                        </div>
                    </section>

                    {/* ============ نمایندگان شهرستان‌ها ============ */}
                    <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
                        <SectionTitle>{t('provincesTitle')}</SectionTitle>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {representatives.map((rep) => {
                                const city = rep.city[locale] || rep.city.fa;

                                return (
                                    <FlipCard
                                        key={rep.phone}
                                        title={t('representativeRole', { city })}
                                        person={rep.person}
                                        phone={rep.phone}
                                    />
                                );
                            })}
                        </div>
                    </section>

                    {/* ============ شکایات و آدرس ============ */}
                    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                        <div className="grid gap-5 md:grid-cols-2">
                            <article className={glassCard}>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                                    <Phone size={24} strokeWidth={1.7} />
                                </div>

                                <h2 className="mt-5 text-xl font-bold text-white">
                                    {t('complaints.title')}
                                </h2>

                                <p className="mt-1 text-sm text-cream/70">
                                    {t('complaints.note')}
                                </p>

                                <PhoneLink
                                    phone={complaintsPhone}
                                    label={t('complaints.title')}
                                    className="mt-5 text-lg text-gold hover:text-gold-light"
                                />
                            </article>

                            <article className={glassCard}>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                                    <MapPin size={24} strokeWidth={1.7} />
                                </div>

                                <h2 className="mt-5 text-xl font-bold text-white">
                                    {t('address.title')}
                                </h2>

                                <p className="mt-3 text-sm leading-8 text-cream/80">
                                    {t('address.value')}
                                </p>
                            </article>
                        </div>


                        {/* بنر محصولات فراجهان */}
                        <div
                            className={`relative isolate mt-8 flex min-h-[220px] flex-col justify-center gap-6 overflow-hidden rounded-3xl border border-gold/40 bg-cover bg-center p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:px-10 sm:py-8
    [background-image:linear-gradient(rgba(14,9,6,0.85),rgba(14,9,6,0.85)),url('/images/contact/contact-products-cta.webp')]
    sm:[background-image:linear-gradient(to_left,rgba(14,9,6,0.95)_0%,rgba(14,9,6,0.85)_55%,rgba(14,9,6,0.05)_100%),url('/images/contact/contact-products-cta.webp')]
    ${isRTL ? 'items-start' : 'items-end'}`}
                        >
                            <div
                                className={`relative z-10 flex w-full max-w-xl flex-col items-start ${isRTL ? 'text-right' : 'text-left'
                                    }`}
                            >
                                <span className="mb-2 block text-xs font-semibold tracking-widest text-gold">
                                    FARAJAHAN
                                </span>

                                <h2 className="text-xl font-bold text-white md:text-2xl">
                                    {t('productsCta.title')}
                                </h2>

                                <p className="mt-3 text-sm leading-7 text-cream/80">
                                    {t('productsCta.description')}
                                </p>

                                <Link
                                   href={`/${locale}/shop`}
                                    className="mt-5 inline-flex items-center justify-center rounded-2xl border border-gold/50 bg-gold px-7 py-3.5 text-sm font-bold text-coffee-deep shadow-[0_0_30px_rgba(197,147,76,0.25)] transition-all duration-300 hover:scale-105 hover:bg-gold-light"
                                >
                                    {t('productsCta.button')}
                                </Link>
                            </div>
                        </div>

                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}