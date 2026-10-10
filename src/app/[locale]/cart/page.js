"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useTranslations } from "next-intl";
import { useCartSync } from "@/hooks/useCartSync";
import { usePaidOrderCleanup } from "@/hooks/usePaidOrderCleanup";
export default function CartPage({ params }) {


    const { locale } = use(params);
    const t = useTranslations("cart");
    const {
        items,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        clearCart,
    } = useCartStore();

    const totalItems = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = items.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    const { cart, isSyncing, error, retry } = useCartSync();
    const { isChecking: isCheckingOrder, clearedOrderId } =
        usePaidOrderCleanup();
    const issues = cart?.issues ?? [];

    const issueText = (issue) => {
        const baseName =
            issue.name?.[locale] ||
            issue.name?.en ||
            issue.name?.fa ||
            "";

        const name = issue.variationLabel
            ? `${baseName} (${issue.variationLabel})`
            : baseName;

        if (issue.type === "quantity_adjusted") {
            return t("issueQuantityAdjusted", {
                name,
                requested: issue.requested,
                actual: issue.actual,
            });
        }

        if (issue.type === "out_of_stock") {
            return t("issueOutOfStock", { name });
        }

        return t("issueUnavailable", { name });
    };


    const issuesBlock = issues.length > 0 && (
        <div
            role="alert"
            className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900"
        >
            <ul className="space-y-1">
                {issues.map((issue, index) => (
                    <li
                        key={`${issue.productId}:${issue.variationId}:${index}`}
                    >
                        {issueText(issue)}
                    </li>
                ))}
            </ul>
        </div>
    );

    const totals = cart?.totals;
    const fromMinor = (value) => value / 10 ** (totals?.minorUnit ?? 0);

    // تا رسیدن اولین پاسخ Woo، تخمین Zustand نمایش داده می‌شود
    const displaySubtotal = totals ? fromMinor(totals.subtotal) : subtotal;
    const displayTotal = totals ? fromMinor(totals.total) : subtotal;
    const canCheckout =
        Boolean(totals) && !isSyncing && !error && !isCheckingOrder;

    const formatPrice = (price) =>
        price.toLocaleString(
            locale === "fa"
                ? "fa-IR"
                : "en-US"
        );

    const getProductName = (item) =>
        item.name?.[locale] ||
        item.name?.en ||
        item.name?.fa ||
        "";

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-background py-10 sm:py-14 lg:py-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {issuesBlock}

                    {clearedOrderId && (
                        <div
                            role="status"
                            className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-900"
                        >
                            {locale === "fa"
                                ? `سفارش شماره‌ی ${Number(
                                    clearedOrderId
                                ).toLocaleString("fa-IR", {
                                    useGrouping: false,
                                })} پرداخت شده بود و سبد خرید پاک شد.`
                                : `Order #${clearedOrderId} was already paid, so your cart was cleared.`}
                        </div>
                    )}
                    <div className="rounded-3xl bg-white px-5 py-12 text-center shadow-sm ring-1 ring-black/5 sm:px-10 sm:py-16">
                        {/* آیکون سبد */}
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cream text-coffee-dark">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                className="h-9 w-9"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 7H6"
                                />
                                <circle
                                    cx="10"
                                    cy="20"
                                    r="1.3"
                                />
                                <circle
                                    cx="18"
                                    cy="20"
                                    r="1.3"
                                />
                            </svg>
                        </div>

                        <h1 className="mt-6 font-sans text-2xl font-bold text-coffee-dark sm:text-3xl">
                            {t("title")}
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-text-muted sm:text-base">
                            {t("empty")}
                        </p>

                        <Link
                            href={`/${locale}/shop/home`}
                            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-coffee-dark px-7 py-3 font-semibold text-white transition-all duration-200 hover:bg-coffee hover:shadow-md"
                        >
                            {t("continueShopping")}
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background py-8 sm:py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-7 flex items-end justify-between gap-4 sm:mb-10">
                    <div className="min-w-0">
                        <h1 className="font-sans text-2xl font-bold text-coffee-dark sm:text-3xl md:text-4xl">
                            {t("title")}
                        </h1>

                        <p className="mt-1.5 text-xs text-text-muted sm:mt-2 sm:text-sm">
                            {t("itemsCount", {
                                count: totalItems,
                            })}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={clearCart}
                        className="shrink-0 text-xs font-medium text-red-500 transition-colors duration-200 hover:text-red-700 sm:text-sm"
                    >
                        {t("clearCart")}
                    </button>
                </div>

                {issuesBlock}
                {/* Main Layout */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
                    {/* Products */}
                    <section className="min-w-0">
                        <div className="space-y-3 sm:space-y-4">
                            {items.map((item) => {
                                const productName =
                                    getProductName(item);

                                const itemTotal =
                                    item.price *
                                    item.quantity;

                                return (
                                    <article
                                        key={item.id}
                                        className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 sm:rounded-3xl sm:p-5"
                                    >
                                        <div className="flex min-w-0 gap-3 sm:gap-5">
                                            {/* Product Image */}
                                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream sm:h-32 sm:w-32 sm:rounded-2xl md:h-36 md:w-36">
                                                {item.image ? (
                                                    <Image
                                                        src={
                                                            item.image
                                                        }
                                                        alt={
                                                            productName
                                                        }
                                                        fill
                                                        unoptimized
                                                        sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 144px"
                                                        className="object-contain p-2.5 sm:p-3"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-text-muted sm:text-xs">
                                                        {t(
                                                            "noImage"
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex min-w-0 flex-1 flex-col">
                                                {/* Name + Remove */}
                                                <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
                                                    <div className="min-w-0">
                                                        <h2 className="line-clamp-2 font-sans text-sm font-bold leading-6 text-coffee-dark sm:text-base md:text-lg">
                                                            {
                                                                productName
                                                            }
                                                        </h2>

                                                        {item.variationId > 0 && (
                                                            <p className="mt-0.5 text-[10px] text-text-muted sm:mt-1 sm:text-xs">
                                                                {item.variationLabel ||
                                                                    `${t("variation")} #${item.variationId}`}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(
                                                                item.productId,
                                                                item.variationId
                                                            )
                                                        }
                                                        aria-label={t(
                                                            "remove"
                                                        )}
                                                        className="shrink-0 rounded-lg p-1 text-xs text-red-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-700 sm:p-1.5 sm:text-sm"
                                                    >
                                                        <span className="hidden sm:inline">
                                                            {t(
                                                                "remove"
                                                            )}
                                                        </span>

                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            className="h-4 w-4 sm:hidden"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M6 6l12 12M18 6L6 18"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Bottom Controls */}
                                                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4 sm:pt-6">
                                                    {/* Quantity */}
                                                    <div className="flex items-center rounded-xl border border-black/10 bg-white">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                decreaseQuantity(
                                                                    item.productId,
                                                                    item.variationId
                                                                )
                                                            }
                                                            aria-label={t(
                                                                "decrease"
                                                            )}
                                                            className="flex h-9 w-9 items-center justify-center text-lg text-coffee-dark transition-colors duration-200 hover:bg-cream active:bg-cream sm:h-10 sm:w-10"
                                                        >
                                                            −
                                                        </button>

                                                        <span className="flex h-9 min-w-8 items-center justify-center border-x border-black/5 px-1 text-xs font-bold text-coffee-dark sm:h-10 sm:min-w-9 sm:text-sm">
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                increaseQuantity(
                                                                    item.productId,
                                                                    item.variationId
                                                                )
                                                            }
                                                            aria-label={t(
                                                                "increase"
                                                            )}
                                                            className="flex h-9 w-9 items-center justify-center text-lg text-coffee-dark transition-colors duration-200 hover:bg-cream active:bg-cream sm:h-10 sm:w-10"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-end">
                                                        <p className="text-sm font-extrabold text-coffee-dark sm:text-base md:text-lg">
                                                            {formatPrice(
                                                                itemTotal
                                                            )}{" "}
                                                            <span className="text-[10px] font-medium sm:text-xs">
                                                                {t(
                                                                    "currency"
                                                                )}
                                                            </span>
                                                        </p>

                                                        {item.quantity >
                                                            1 && (
                                                                <p className="mt-0.5 text-[10px] text-text-muted sm:text-xs">
                                                                    {formatPrice(
                                                                        item.price
                                                                    )}{" "}
                                                                    {t(
                                                                        "currency"
                                                                    )}{" "}
                                                                    ×{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </p>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    {/* Order Summary */}
                    <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:rounded-3xl sm:p-6 lg:sticky lg:top-24">
                        <h2 className="font-sans text-lg font-bold text-coffee-dark sm:text-xl">
                            {t("summary")}
                        </h2>

                        <div className="mt-5 space-y-4 sm:mt-6">
                            {/* Subtotal */}
                            <div className="flex items-center justify-between gap-4 text-sm">
                                <span className="text-text-muted">
                                    {t("subtotal")}
                                </span>

                                <span className={`text-end font-semibold text-coffee-dark ${isSyncing ? "opacity-60" : ""}`}>
                                    {formatPrice(displaySubtotal)}{" "}
                                    {t("currency")}
                                </span>
                            </div>

                            {/* Total */}
                            <div className="border-t border-black/5 pt-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="font-semibold text-coffee-dark">
                                        {t("total")}
                                    </span>

                                    <span className={`text-end text-lg font-extrabold text-coffee-dark sm:text-xl ${isSyncing ? "opacity-60" : ""}`}>
                                        {formatPrice(displayTotal)}{" "}
                                        {t("currency")}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {isSyncing && (
                            <p className="mt-4 text-xs text-text-muted">{t("syncing")}</p>
                        )}

                        {error && !isSyncing && (
                            <button
                                type="button"
                                onClick={retry}
                                className="mt-4 text-xs font-medium text-red-500 hover:text-red-700"
                            >
                                {t("syncError")}
                            </button>
                        )}

                        {/* Checkout */}
                        <Link
                            href={`/${locale}/checkout`}
                            aria-disabled={!canCheckout}
                            tabIndex={canCheckout ? undefined : -1}
                            onClick={(e) => {
                                if (!canCheckout) e.preventDefault();
                            }}
                            className={`mt-6 flex min-h-12 w-full items-center justify-center rounded-2xl bg-coffee-dark px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-coffee hover:shadow-md sm:text-base ${canCheckout ? "" : "pointer-events-none opacity-50"
                                }`}
                        >
                            {t("checkout")}
                        </Link>
                        {/* Continue Shopping */}
                        <Link
                            href={`/${locale}/shop/home`}
                            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-coffee-dark transition-colors duration-200 hover:bg-cream"
                        >
                            {t("continueShopping")}
                        </Link>
                    </aside>
                </div>
            </div>
        </main>
    );
}