'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function CoffeeRoastingHero() {
    const locale = useLocale();
    const t = useTranslations('coffeeExperience');

    const isRTL = locale === 'fa' || locale === 'ar';

    const contentVariants = {
        hidden: {
            opacity: 0,
            scale: 0.82,
        },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1.6,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    return (
        <section className="relative flex h-[400px] w-full items-center justify-center bg-center bg-cover bg-no-repeat [background-image:url('/images/coffee-experience.webp')]">

            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-coffee-deep/80" />

            {/* Centered Content */}
            <div className="relative flex h-full w-full items-center justify-center px-4">
                <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{
                        once: true,
                        amount: 0.35,
                    }}
                    className={`w-full max-w-2xl text-center ${
                        isRTL ? 'text-right sm:text-center' : 'text-center'
                    }`}
                >

                    {/* Eyebrow */}
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 1,
                            delay: 0.25,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        viewport={{ once: true }}
                        className="mb-6 inline-block text-sm font-semibold tracking-wide text-gold"
                    >
                        {t('eyebrow')}
                    </motion.span>

                    {/* Title */}
                    <motion.h2
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 1.1,
                            delay: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        viewport={{ once: true }}
                        className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
                    >
                        {t('title')}
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 1.1,
                            delay: 0.55,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        viewport={{ once: true }}
                        className="mb-8 text-base leading-8 text-white/95 sm:text-lg"
                    >
                        {t('description')}
                    </motion.p>

                    {/* Button */}
                    <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 1,
                            delay: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        viewport={{ once: true }}
                        whileHover={{
                            y: -3,
                            scale: 1.02,
                        }}
                        whileTap={{
                            scale: 0.98,
                        }}
                        className="inline-flex items-center justify-center rounded-2xl bg-gold px-7 py-3.5 text-sm font-semibold text-coffee-deep shadow-lg transition-colors duration-300 hover:bg-gold-light hover:shadow-xl"
                    >
                        {t('button')}
                    </motion.button>

                </motion.div>
            </div>

        </section>
    );
}