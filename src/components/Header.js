'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';

import TopBar from './TopBar';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const currentLocale = useLocale();
  const t = useTranslations('header');

  const cartCount = 3;

  const menuItems = [
    {
      label: t('instantCoffee'),
      href: `/${currentLocale}/products/instant-coffee`,
    },
    {
      label: t('specialtyCoffee'),
      href: `/${currentLocale}/products/specialty-coffee`,
    },
    {
      label: t('shop'),
      href: `/${currentLocale}/products`,
    },
    {
      label: t('blog'),
      href: `/${currentLocale}/blog`,
    },
    {
      label: t('contact'),
      href: `/${currentLocale}/contact`,
    },
    {
      label: t('about'),
      href: `/${currentLocale}/about`,
    }
  ];

  return (
    <>
      {/* Top Bar */}
      <TopBar />

      {/* Main Header */}
      <header className="sticky top-0 z-40 border-b border-cream bg-background text-coffee-dark shadow-sm">
        <div className="mx-auto grid min-h-[76px] max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4">

          {/* ================================================= */}
          {/* Logo - همیشه سمت راست */}
          {/* ================================================= */}

          <div className="flex shrink-0 items-center justify-end">
            <Link
              href={`/${currentLocale}`}
              aria-label="Farajahan"
              className="relative flex h-14 w-40 items-center transition-opacity duration-200 hover:opacity-80 md:h-16 md:w-52"
            >
              <Image
                src="/logo1.png"
                alt="Farajahan"
                fill
                priority
                sizes="(max-width: 640px) 100px, (max-width: 1024px) 120px, 150px"
                className="object-contain"
              />
            </Link>
          </div>




          {/* ================================================= */}
          {/* Desktop Menu - همیشه وسط */}
          {/* ================================================= */}

          <nav
            aria-label={t('mainNavigation')}
            className="
              hidden
              min-w-0
              items-center
              justify-center
              gap-7
              md:flex
            "
          >
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="
                  whitespace-nowrap
                  text-base
                  font-medium
                  text-coffee-dark
                  transition-colors
                  duration-200
                  hover:text-gold
                "
              >
                {item.label}
              </Link>
            ))}
          </nav>


          {/* ================================================= */}
          {/* Actions - همیشه سمت چپ */}
          {/* ================================================= */}

          <div className="flex shrink-0 items-center gap-4">

            {/* Search */}
            <button
              type="button"
              aria-label={t('search')}
              className="
                text-coffee-dark
                transition-colors
                duration-200
                hover:text-gold
              "
            >
              <Search
                size={20}
                strokeWidth={1.8}
              />
            </button>

            {/* Cart */}
            <Link
              href={`/${currentLocale}/cart`}
              aria-label={t('cart')}
              className="
                relative
                text-coffee-dark
                transition-colors
                duration-200
                hover:text-gold
              "
            >
              <ShoppingCart
                size={21}
                strokeWidth={1.8}
              />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-2
                    -top-2
                    flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-gold
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href={`/${currentLocale}/account`}
              aria-label={t('account')}
              className="
                text-coffee-dark
                transition-colors
                duration-200
                hover:text-gold
              "
            >
              <User
                size={21}
                strokeWidth={1.8}
              />
            </Link>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <MobileMenu />
            </div>

          </div>




        </div>
      </header>
    </>
  );
}