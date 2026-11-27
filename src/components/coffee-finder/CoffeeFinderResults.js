'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { mainContacts } from '@/data/contactData';

/*
 * کارت یک محصول پیشنهادی
 * افزودن به سبد دقیقاً مثل ProductCard است.
 */
function RecommendationCard({
    product,
    isBest,
    locale,
    t,
    shopT,
    describeReason,
}) {
    const addItem = useCartStore((state) => state.addItem);

    const [variationId, setVariationId] = useState(
        product.suggestedVariationId
            ? String(product.suggestedVariationId)
            : ''
    );

    const [added, setAdded] = useState(false);

    const isFa = locale === 'fa';
    const numberLocale = isFa ? 'fa-IR' : 'en-US';

    const variations = product.variations || [];

    const hasOptions =
        product.type === 'variable' && variations.length > 0;

    // محصول متغیری که گزینه‌ای برایش نیامده: فقط صفحه‌ی محصول
    const isBrokenVariable =
        product.type === 'variable' && variations.length === 0;

    const selectedVariation = hasOptions
        ? variations.find(
              (variation) => String(variation.id) === variationId
          )
        : undefined;

    const needsSelection = hasOptions && !selectedVariation;

    const productUrl = `/${locale}/product/${product.slug}`;

    const handleAddToCart = () => {
        if (needsSelection || isBrokenVariable) return;

        addItem({
            id: `${product.id}_${selectedVariation?.id ?? 'main'}`,
            productId: product.id,
            variationId: selectedVariation?.id ?? 0,
            variationLabel: selectedVariation?.label || null,

            name: {
                fa: product.name,
                en: product.name,
            },

            price: product.price,

            image: product.image || null,

            quantity: 1,

            cachedAt: Date.now(),
        });

        setAdded(true);
    };

    return (
        <article
            className={`flex flex-col overflow-hidden rounded-3xl border bg-coffee-brown/30 ${
                isBest ? 'border-gold/60' : 'border-cream/10'
            }`}
        >
            <Link href={productUrl} className="block">
                <div className="relative aspect-square bg-cream">
                    {isBest && (
                        <span className="absolute start-3 top-3 z-10 rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold text-coffee-deep">
                            {t('bestMatch')}
                        </span>
                    )}

                    {product.image && (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-contain p-6"
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    )}
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-5">
                <Link href={productUrl} className="block">
                    <h3 className="text-base font-bold leading-7 text-cream">
                        {product.name}
                    </h3>
                </Link>

                {product.reasons.length > 0 && (
                    <div className="mt-3">
                        <p className="text-xs font-semibold text-gold">
                            {t('whyTitle')}
                        </p>

                        <ul className="mt-2 space-y-1.5 text-xs leading-6 text-cream/80">
                            {product.reasons.map((reason, index) => (
                                <li
                                    key={`${reason.key}-${index}`}
                                    className="flex gap-2"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold"
                                    />

                                    <span>{describeReason(reason)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {hasOptions && (
                    <div className="mt-4">
                        <label
                            htmlFor={`finder-variation-${product.id}`}
                            className="mb-1.5 block text-[11px] font-semibold text-cream/70"
                        >
                            {t('optionLabel')}
                        </label>

                        <select
                            id={`finder-variation-${product.id}`}
                            value={variationId}
                            onChange={(event) => {
                                setVariationId(event.target.value);
                                setAdded(false);
                            }}
                            className="w-full rounded-xl border border-cream/15 bg-coffee-deep px-3 py-2.5 text-xs text-cream outline-none transition focus:border-gold"
                        >
                            <option value="">{t('selectOption')}</option>

                            {variations.map((variation) => (
                                <option
                                    key={variation.id}
                                    value={variation.id}
                                >
                                    {variation.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="mt-auto pt-5">
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-gold-light">
                            {product.price.toLocaleString(numberLocale)}
                        </span>

                        <span className="text-xs text-cream/60">
                            {shopT('product.currency')}
                        </span>
                    </div>

                    {isBrokenVariable ? (
                        <Link
                            href={productUrl}
                            className="mt-3 flex w-full items-center justify-center rounded-2xl bg-gold px-5 py-3 text-sm font-semibold text-coffee-deep transition-colors hover:bg-gold-light"
                        >
                            {t('viewProduct')}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={needsSelection}
                            title={
                                needsSelection
                                    ? t('chooseOptionFirst')
                                    : undefined
                            }
                            className="mt-3 w-full rounded-2xl bg-gold px-5 py-3 text-sm font-semibold text-coffee-deep transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gold"
                        >
                            {added ? t('added') : t('addToCart')}
                        </button>
                    )}

                    {added && (
                        <Link
                            href={`/${locale}/cart`}
                            className="mt-3 block text-center text-xs font-semibold text-gold transition hover:text-gold-light"
                        >
                            {t('goToCart')}
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function CoffeeFinderResults({
    businessType,
    answers,
    onBack,
    onRestart,
}) {
    const locale = useLocale();
    const t = useTranslations('coffeeFinder');
    const shopT = useTranslations('shop');

    const isRTL = locale === 'fa' || locale === 'ar';
    const isFa = locale === 'fa';

    const [state, setState] = useState({ status: 'loading', data: null });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        setState({ status: 'loading', data: null });

        const run = async () => {
            try {
                const response = await fetch(
                    '/api/coffee-finder/recommend',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            businessType,
                            answers,
                            lang: locale === 'en' ? 'en' : 'fa',
                        }),
                        signal: controller.signal,
                    }
                );

                if (!response.ok) throw new Error('recommend_failed');

                const data = await response.json();

                setState({ status: 'done', data });
            } catch (error) {
                if (error?.name === 'AbortError') return;

                console.error('Coffee finder request failed:', error);

                setState({ status: 'error', data: null });
            }
        };

        run();

        return () => controller.abort();
    }, [businessType, answers, locale, attempt]);

    const formatNumber = (value) =>
        Number(value).toLocaleString(isFa ? 'fa-IR' : 'en-US');

    // اندازه‌ی کمتر از یک کیلو به گرم نوشته می‌شود
    const formatSize = (kg) => {
        const value = Number(kg);

        if (!value) return '';

        return value < 1
            ? t('units.gram', { value: formatNumber(Math.round(value * 1000)) })
            : t('units.kilogram', { value: formatNumber(value) });
    };

    const describeReason = (reason) => {
        switch (reason.key) {
            case 'wholeBeans':
                return t('reasons.wholeBeans');

            case 'grind':
                return t('reasons.grind', {
                    method: t(`questions.brewMethod.options.${reason.method}`),
                });

            case 'strength':
                return t('reasons.strength', {
                    intensity: t(
                        `questions.intensity.options.${reason.intensity}`
                    ),
                });

            case 'flavors':
                return t('reasons.flavors', {
                    flavors: reason.flavors
                        .map((id) => t(`questions.flavors.options.${id}`))
                        .join(isRTL ? '، ' : ', '),
                });

            case 'service':
                return t('reasons.service', {
                    service: t(
                        `questions.serviceType.options.${reason.service}`
                    ),
                });

            case 'pack':
                return t('reasons.pack', { size: formatSize(reason.kg) });

            case 'budget':
                return t('reasons.budget');

            case 'powderKind':
                return t('reasons.powderKind', {
                    kind: t(
                        `questions.powderKind.options.${reason.kind}`
                    ),
                });

            case 'powderSize':
                return t('reasons.powderSize', {
                    size: formatSize(reason.kg),
                });

            case 'instant':
                return t('reasons.instant');

            default:
                return '';
        }
    };

    const actions = (
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
                type="button"
                onClick={onBack}
                className="rounded-full border border-cream/15 px-6 py-3 text-sm font-medium text-cream transition-colors hover:border-cream/30"
            >
                {t('backToQuestions')}
            </button>

            <button
                type="button"
                onClick={onRestart}
                className="rounded-full border border-cream/15 px-6 py-3 text-sm font-medium text-cream transition-colors hover:border-cream/30"
            >
                {t('startOver')}
            </button>
        </div>
    );

    const { status, data } = state;

    let content;

    if (status === 'loading') {
        content = (
            <div
                role="status"
                className="mt-10 rounded-2xl border border-cream/10 bg-coffee-brown/30 p-8 text-center text-sm text-cream/80"
            >
                {t('loading')}
            </div>
        );
    } else if (status === 'error') {
        content = (
            <div
                role="alert"
                className="mt-10 rounded-2xl border border-red-300/30 bg-coffee-brown/30 p-8 text-center"
            >
                <p className="text-sm leading-7 text-red-300">
                    {t('loadError')}
                </p>

                <button
                    type="button"
                    onClick={() => setAttempt((current) => current + 1)}
                    className="mt-5 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-coffee-deep transition-colors hover:bg-gold-light"
                >
                    {t('retry')}
                </button>
            </div>
        );
    } else if (data?.mode === 'contact') {
        const sales = mainContacts.find((item) => item.id === 'sales');
        const factory = mainContacts.find((item) => item.id === 'factory');

        content = (
            <div className="mt-10 rounded-2xl border border-gold/40 bg-coffee-brown/30 p-6 text-center sm:p-8">
                <h3 className="text-xl font-bold text-cream">
                    {t('contactTitle')}
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-cream/75">
                    {t('contactDescription')}
                </p>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    {sales && (
                        <a
                            href={`tel:${sales.phone}`}
                            dir="ltr"
                            className="inline-flex items-center gap-2 rounded-2xl bg-gold px-7 py-3.5 text-sm font-bold text-coffee-deep transition-colors hover:bg-gold-light"
                        >
                            <span dir={isRTL ? 'rtl' : 'ltr'}>
                                {t('salesLabel')}
                            </span>

                            <span>{sales.phone}</span>
                        </a>
                    )}

                    {factory && (
                        <a
                            href={`tel:${factory.phone}`}
                            dir="ltr"
                            className="inline-flex items-center gap-2 rounded-2xl border border-gold/50 px-7 py-3.5 text-sm font-bold text-gold-light transition-colors hover:bg-white/10"
                        >
                            <span dir={isRTL ? 'rtl' : 'ltr'}>
                                {t('factoryLabel')}
                            </span>

                            <span>{factory.phone}</span>
                        </a>
                    )}
                </div>
            </div>
        );
    } else if (!data?.products?.length) {
        content = (
            <div className="mt-10 rounded-2xl border border-cream/10 bg-coffee-brown/30 p-8 text-center">
                <h3 className="text-lg font-bold text-cream">
                    {t('noMatchTitle')}
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-cream/75">
                    {t('noMatchDescription')}
                </p>

                <Link
                    href={`/${locale}/shop`}
                    className="mt-6 inline-flex rounded-full bg-gold px-7 py-3 text-sm font-semibold text-coffee-deep transition-colors hover:bg-gold-light"
                >
                    {t('viewShop')}
                </Link>
            </div>
        );
    } else {
        content = (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {data.products.map((product, index) => (
                    <RecommendationCard
                        key={product.id}
                        product={product}
                        isBest={index === 0 && data.products.length > 1}
                        locale={locale}
                        t={t}
                        shopT={shopT}
                        describeReason={describeReason}
                    />
                ))}
            </div>
        );
    }

    return (
        <section
            dir={isRTL ? 'rtl' : 'ltr'}
            className="px-4 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-6xl rounded-3xl bg-coffee-dark px-6 py-10 sm:px-10 sm:py-12">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="text-sm font-medium tracking-wide text-gold">
                        {t('resultLabel')}
                    </span>

                    <h2 className="mt-3 text-3xl font-bold leading-tight text-cream sm:text-4xl">
                        {t('resultTitle')}
                    </h2>

                    <p className="mt-4 text-base leading-8 text-cream/70 sm:text-lg">
                        {t('resultDescription')}
                    </p>
                </div>

                {content}

                {status !== 'loading' && actions}
            </div>
        </section>
    );
}