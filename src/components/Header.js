"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import {
    Search,
    ShoppingCart,
    User,
    ChevronDown,
} from "lucide-react";

import { useCartStore } from "@/store/cartStore";

import TopBar from "./TopBar";
import MobileMenu from "./MobileMenu";


export default function Header() {
    const currentLocale = useLocale();
    const t = useTranslations("header");

    const items = useCartStore((state) => state.items);

    const cartCount = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const menuItems = [
        {
            label: t("home"),
            href: `/${currentLocale}`,
        },
        {
            label: t("shop"),
            href: `/${currentLocale}/products`,
            submenu: [
                {
                    label: t("coffeeBeans"),
                    href: `/${currentLocale}/shop2/coffee`,
                },
                {
                    label: t("powderProducts"),
                    href: `/${currentLocale}/shop2/powder-products`,
                },
                {
                    label: t("products250g"),
                    href: `/${currentLocale}/shop2/250g`,
                },
                {
                    label: t("fruitDrink"),
                    href: `/${currentLocale}/shop2/abmive`,
                },
            ],
        },
        {
            label: t("farajahanServices"),
            href: `/${currentLocale}/services`,
            submenu: [
                {
                    label: t("eventSponsorship"),
                    href: `/${currentLocale}/services/event-sponsorship`,
                },
                {
                    label: t("agencyRequest"),
                    href: `/${currentLocale}/services/agency-request`,
                },
            ],
        },
        {
            label: t("faq"),
            href: `/${currentLocale}/faq`,
        },
        {
            label: t("about"),
            href: `/${currentLocale}/about`,
        },
        {
            label: t("contact"),
            href: `/${currentLocale}/contact`,
        },
    ];

    return (
        <>
            {/* Top Bar */}
            <TopBar />

            {/* Main Header */}
            <header className="sticky top-0 z-40 border-b border-cream bg-background text-coffee-dark shadow-sm">
                <div className="mx-auto grid min-h-[76px] max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4">

                    {/* Logo */}
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

                    {/* Desktop Menu */}
                    <nav
                        aria-label={t("mainNavigation")}
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
                            <div
                                key={item.href}
                                className="relative group"
                            >
                                <Link
                                    href={item.href}
                                    className="
                                        flex
                                        items-center
                                        gap-1
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

                                    {item.submenu && (
                                        <ChevronDown
                                            size={15}
                                            strokeWidth={1.8}
                                            className="
                                                transition-transform
                                                duration-200
                                                group-hover:rotate-180
                                            "
                                        />
                                    )}
                                </Link>

                                {item.submenu && (
                                    <div
                                        className="
                                            invisible
                                            absolute
                                            right-0
                                            top-full
                                            z-50
                                            mt-3
                                            min-w-[210px]
                                            translate-y-2
                                            rounded-lg
                                            border
                                            border-cream
                                            bg-background
                                            py-2
                                            opacity-0
                                            shadow-lg
                                            transition-all
                                            duration-200
                                            group-hover:visible
                                            group-hover:translate-y-0
                                            group-hover:opacity-100
                                        "
                                    >
                                        {item.submenu.map((subItem) => (
                                            <Link
                                                key={subItem.href}
                                                href={subItem.href}
                                                className="
                                                    block
                                                    whitespace-nowrap
                                                    px-5
                                                    py-2.5
                                                    text-sm
                                                    font-medium
                                                    text-coffee-dark
                                                    transition-colors
                                                    duration-200
                                                    hover:bg-cream
                                                    hover:text-gold
                                                "
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-4">

                        {/* Search */}
                        <button
                            type="button"
                            aria-label={t("search")}
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
                            aria-label={t("cart")}
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
                            aria-label={t("account")}
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