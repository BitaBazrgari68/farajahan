import { getTranslations, setRequestLocale } from 'next-intl/server';
import CoffeeFinder from '@/components/coffee-finder/CoffeeFinder';
import CoffeeFinderGuide from '@/components/coffee-finder/CoffeeFinderGuide';
import { buildAlternates, buildBreadcrumb } from '@/lib/seo';

const SHARE_IMAGE = '/images/coffee-finder/barista.png';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: 'coffeeFinderPage',
    });

    const title = t('metaTitle');
    const description = t('metaDescription');
    const path = `/${locale}/coffee-finder`;

    return {
        title,
        description,
        alternates: buildAlternates(locale, '/coffee-finder'),
        openGraph: {
            type: 'website',
            title,
            description,
            url: path,
            images: [SHARE_IMAGE],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [SHARE_IMAGE],
        },
    };
}

export default async function CoffeeFinderPage({ params }) {
    const { locale } = await params;

    setRequestLocale(locale);

    const t = await getTranslations({
        locale,
        namespace: 'coffeeFinderPage',
    });

    // مسیر نان‌ریز: خانه ← راهنمای انتخاب قهوه
    const jsonLd = buildBreadcrumb(locale, [
        { name: locale === 'fa' ? 'خانه' : 'Home', path: '' },
        {
            name: locale === 'fa' ? 'راهنمای انتخاب قهوه' : 'Coffee Finder',
            path: '/coffee-finder',
        },
    ]);

    return (
        <main className="min-h-screen bg-background py-12">
            {/*
              تنها h1 صفحه؛ در همه‌ی مرحله‌های فایندر ثابت می‌ماند.
              عنوان‌های داخل فایندر h2 هستند و ظاهر صفحه عوض نمی‌شود.
            */}
            <h1 className="sr-only">{t('h1')}</h1>

            <CoffeeFinder />

            <CoffeeFinderGuide locale={locale} />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd),
                }}
            />
        </main>
    );
}