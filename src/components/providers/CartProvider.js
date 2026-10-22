"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useCartStore } from "@/store/cartStore";

const NOTICE_MS = 8000;

export default function CartProvider({ children }) {
    const locale = useLocale();

    const items = useCartStore((state) => state.items);
    const cartLocale = useCartStore((state) => state.cartLocale);
    const setCartLocale = useCartStore((state) => state.setCartLocale);

    const [hydrated, setHydrated] = useState(false);
    const [showNotice, setShowNotice] = useState(false);

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key !== "coffee-store-cart") {
                return;
            }

            useCartStore.persist.rehydrate();
        };

        window.addEventListener(
            "storage",
            handleStorageChange
        );

        return () => {
            window.removeEventListener(
                "storage",
                handleStorageChange
            );
        };
    }, []);

    // صبر می‌کند تا سبد از حافظه‌ی مرورگر خوانده شود
    useEffect(() => {
        const persist = useCartStore.persist;

        if (persist.hasHydrated()) {
            setHydrated(true);
        }

        return persist.onFinishHydration(() => setHydrated(true));
    }, []);

    // سبد به زبانی که در آن ساخته شده وابسته است
    useEffect(() => {
        if (!hydrated) return;

        // سبد خالی زبان ندارد
        if (items.length === 0) {
            if (cartLocale !== null) setCartLocale(null);
            return;
        }

        // سبد پر بدون زبان (مثلاً سبد قدیمی): زبان فعلی صفحه ثبت می‌شود
        if (cartLocale === null) {
            setCartLocale(locale);
            return;
        }

        // زبان صفحه با زبان سبد فرق دارد: سبد خالی می‌شود
        if (cartLocale !== locale) {
            useCartStore.setState({ items: [], cartLocale: null });
            setShowNotice(true);
        }
    }, [hydrated, items.length, cartLocale, locale, setCartLocale]);

    // پیام بعد از چند ثانیه خودش بسته می‌شود
    useEffect(() => {
        if (!showNotice) return;

        const timer = setTimeout(() => setShowNotice(false), NOTICE_MS);

        return () => clearTimeout(timer);
    }, [showNotice]);

    const noticeTitle =
        locale === "fa" ? "سبد خرید خالی شد" : "Your cart was emptied";

    const noticeText =
        locale === "fa"
            ? "چون زبان سایت را عوض کردید، محصولات سبد پاک شدند. لطفاً دوباره محصول را اضافه کنید."
            : "Because you changed the site language, the items in your cart were removed. Please add your products again.";

    return (
        <>
            {children}

            {showNotice && (
                <div
                    role="status"
                    className="fixed inset-x-4 top-[120px] z-50 mx-auto flex max-w-lg items-start justify-between gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-amber-900 shadow-xl"
                >
                    <div className="min-w-0">
                        <p className="text-sm font-bold">{noticeTitle}</p>

                        <p className="mt-1 text-sm leading-7">{noticeText}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowNotice(false)}
                        aria-label={locale === "fa" ? "بستن" : "Close"}
                        className="shrink-0 text-xl leading-none text-amber-900/70 transition hover:text-amber-900"
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
}