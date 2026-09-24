'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
    const locale = useLocale();
    const t = useTranslations('footer');

    const isRTL = locale === 'fa' || locale === 'ar';

    return (
        <footer className="relative bg-black bg-center [background-image:url('/images/footer-bg.png')] bg-no-repeat bg-contain">
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-coffee-dark/90 pointer-events-none"></div>
            {/* Main Footer */}
            <div className="px-4 py-16 sm:px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-5xl ">
                    
                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 justify-items-center">
                        
                        {/* Column 1 - About */}
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                            <h3 className="text-lg font-bold text-white mb-4 ">
                                {t('aboutTitle')}
                            </h3>
                            <p className="text-cream/70 text-sm leading-7">
                                {t('aboutDescription')}
                            </p>
                            {/* Social Icons */}
                            <div className={`flex gap-4 mt-6 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                <a href="#" className="text-gold hover:text-gold-light transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-gold hover:text-gold-light transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-gold hover:text-gold-light transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M16 11.37A4 4 0 1112.63 8" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Column 2 - Links */}
                        <div className={`max-w-fit ${isRTL ? 'text-right' : 'text-left'}`}>
                            <h3 className="text-lg font-bold text-cream mb-4">
                                {t('linksTitle')}
                            </h3>
                            <nav className="space-y-3">
                                <a href="#" className="block text-cream/70 hover:text-gold transition text-sm">
                                    {t('link1')}
                                </a>
                                <a href="#" className="block text-cream/70 hover:text-gold transition text-sm">
                                    {t('link2')}
                                </a>
                                <a href="#" className="block text-cream/70 hover:text-gold transition text-sm">
                                    {t('link3')}
                                </a>
                                <a href="#" className="block text-cream/70 hover:text-gold transition text-sm">
                                    {t('link4')}
                                </a>
                            </nav>
                        </div>

                        {/* Column 3 - Contact */}
                        <div className={  `max-w-fit ${isRTL ? 'text-right' : 'text-left'}`}>
                            <h3 className="text-lg font-bold text-cream mb-4">
                                {t('contactTitle')}
                            </h3>
                            <div className="space-y-3 text-sm">
                                <a href="tel:+989123456789" className="flex items-center gap-2 text-cream/70 hover:text-gold transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {t('phone')}
                                </a>
                                <a href="mailto:info@farajahan.com" className="flex items-center gap-2 text-cream/70 hover:text-gold transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {t('email')}
                                </a>
                                <div className="flex items-start gap-2 text-cream/70">
                                    <svg className="w-4 h-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{t('address')}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Divider */}
                    <div className="h-px bg-coffee-brown/30 mb-8"></div>

                    {/* Bottom */}
                    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="text-cream/60 text-sm">
                            {t('copyright')}
                        </p>
                        <div className={`flex gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <a href="#" className="text-cream/60 hover:text-gold transition text-sm">
                                {t('privacy')}
                            </a>
                            <a href="#" className="text-cream/60 hover:text-gold transition text-sm">
                                {t('terms')}
                            </a>
                        </div>
                    </div>

                </div>
            </div>

        </footer>
    );
}