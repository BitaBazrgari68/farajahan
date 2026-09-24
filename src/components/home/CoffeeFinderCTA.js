'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function CoffeeFinderCTA() {
    const locale = useLocale();
    const t = useTranslations('coffeeFinderCTA');

    const isRTL = locale === 'fa' || locale === 'ar';

    return (
        <section className="px-4 py-12 sm:px-6 lg:px-8 ">
            <div className="relative mx-auto max-w-7xl">

                {/* Responsive Clip Path */}
                <svg
                    className="absolute h-0 w-0"
                    aria-hidden="true"
                >
                    <defs>
                        <clipPath
                            id="coffeeFinderClip"
                            clipPathUnits="objectBoundingBox"
                        >
                            <path
                                d="
                                    M0.0387,0
                                    H0.9613
                                    A0.0387,0.1143,0,0,1,1,0.1143
                                    V0.8857
                                    A0.0387,0.1143,0,0,1,0.9613,1
                                    H0.0387
                                    A0.0387,0.1143,0,0,1,0,0.8857

                                    V0.5238
                                    A0.0387,0.1143,0,0,1,0.0387,0.4095

                                    H0.2258
                                    A0.0387,0.1143,0,0,0,0.2645,0.2952

                                    V0.1143
                                    A0.0387,0.1143,0,0,1,0.3032,0

                                    Z
                                "
                            />
                        </clipPath>
                    </defs>
                </svg>

                {/* CTA Background */}
                <div
                    className="shadow-2xl shadow-coffee-brown
        relative
        min-h-[420px]
        overflow-visible
        rounded-3xl
        bg-center
        bg-no-repeat
        bg-cover
        bg-[url('/images/coffee-finder/bg-coffee-finder1.jpeg')]
        [clip-path:none]
        lg:[clip-path:url(#coffeeFinderClip)]
        lg:rounded-none
    "
                >

                    {/* Cream Overlay */}
                    <div className="absolute inset-0 bg-[#E6DAC9]/30" />

                    {/* Text Content */}
                    <div
                        className={`relative z-50 ml-auto flex min-h-[420px] w-full items-center py-12 pr-8 sm:pr-12 lg:w-2/3 lg:pr-16 ${isRTL ? 'text-right' : 'text-left'
                            }`}
                    >
                        <div className="w-full pr-8 pl-5">

                            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold border border-gold/40">

                                <span className="text-sm font-semibold tracking-wide text-muted">
                                    {t('eyebrow')}
                                </span>
                            </div>

                            <h2 className="lg:leading-[1.3]  text-3xl font-bold leading-tight text-coffee-brown sm:text-4xl lg:text-[42px] rop-shadow-lg">
                                {t('title')}
                            </h2>

                            <p className="mt-8 text-base leading-8 text-muted sm:text-lg rop-shadow-lg sm:leading-9 ">
                                {t('description')}
                            </p>
                            <div className='text-left'>

                                <Link
                                    href={`/${locale}/coffee-finder`}
                                    type="button"
                                    className="mt-8 inline-flex  items-center justify-center rounded-2xl bg-gold px-7 py-3.5 text-sm font-semibold text-coffee-deep transition-colors duration-300 hover:bg-gold-light shadow-lg hover:shadow-xl"
                                >
                                    {t('button')}
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Barista */}
                <div className="absolute bottom-0 left-4 z-20 hidden h-[560px] w-[310px] sm:block lg:left-12 lg:h-[620px] lg:w-[340px]">
                    <Image
                        src="/images/coffee-finder/barista.png"
                        alt={t('imageAlt')}
                        fill
                        sizes="(min-width: 1024px) 340px, (min-width: 640px) 310px, 0px"
                        className="object-contain object-bottom"
                        priority={false}
                    />
                </div>

            </div>
        </section>
    );
}