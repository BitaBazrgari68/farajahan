"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function ProductCard({
    product,
    locale,
    currency,
}) {
    const addItem = useCartStore((state) => state.addItem);

    const [selectedVariationId, setSelectedVariationId] =
        useState("");

    const isFa = locale === "fa";

    const variations = product.variations || [];
    const isVariableProduct = product.type === "variable";

    // کالای متغیر با گزینه‌های قابل انتخاب
    const hasVariationOptions =
        isVariableProduct && variations.length > 0;

    const selectedVariation = hasVariationOptions
        ? variations.find(
              (variation) =>
                  String(variation.id) === selectedVariationId
          )
        : undefined;

    // اگر گزینه فیلد price داشت از آن استفاده می‌شود، وگرنه قیمت پایه
    const displayPrice =
        selectedVariation?.price ?? product.price.value;

    const showFromLabel =
        hasVariationOptions &&
        Boolean(product.priceRange) &&
        selectedVariation?.price === undefined;

    const needsSelection =
        hasVariationOptions && !selectedVariation;

    // محصولاتی که فقط به صورت تلفنی قابل خرید هستند
    const isPhoneOrderProduct =
        product.categories?.some(
            (category) => category.slug === "abmive"
        );

    const productUrl = `/${locale}/product/${product.slug}`;

    const handleAddToCart = () => {
        if (needsSelection) return;

        addItem({
            id: `${product.id}_${selectedVariation?.id ?? "main"}`,
            productId: product.id,
            variationId: selectedVariation?.id ?? 0,
            variationLabel: selectedVariation?.label || null,

            name: {
                fa: product.name,
                en: product.name,
            },

            price: displayPrice,

            image: product.image?.src || null,

            quantity: 1,

            cachedAt: Date.now(),
        });
    };

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <Link href={productUrl} className="block">
                <div className="relative aspect-square overflow-hidden bg-cream">
                    <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-coffee-dark shadow-sm backdrop-blur">
                        {product.weight || "Coffee"}
                    </div>

                    {product.image ? (
                        <Image
                            src={product.image.src}
                            alt={
                                product.image.alt ||
                                product.name
                            }
                            fill
                            unoptimized
                            className="object-contain p-7 transition-transform duration-500 ease-out group-hover:scale-110"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-text-muted">
                            No image
                        </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <Link href={productUrl} className="block">
                    <h3 className="line-clamp-2 min-h-[2.75rem] font-sans text-sm font-bold leading-6 text-coffee-dark transition-colors duration-200 group-hover:text-coffee">
                        {product.name}
                    </h3>

                    {product.weight && (
                        <p className="mt-1.5 text-xs text-text-muted">
                            {product.weight}
                        </p>
                    )}
                </Link>

                {hasVariationOptions && !isPhoneOrderProduct && (
                    <div className="mt-3">
                        <label
                            htmlFor={`variation-${product.id}`}
                            className="mb-1.5 block text-[11px] font-semibold text-text-muted"
                        >
                            {product.variationAttributeName ||
                                (isFa ? "گزینه‌ها" : "Options")}
                        </label>

                        <select
                            id={`variation-${product.id}`}
                            value={selectedVariationId}
                            onChange={(event) =>
                                setSelectedVariationId(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-xl border border-black/10 bg-[#faf9f6] px-3 py-2.5 text-xs text-coffee-dark outline-none transition focus:border-coffee focus:bg-white"
                        >
                            <option value="">
                                {isFa
                                    ? "انتخاب گزینه"
                                    : "Select an option"}
                            </option>

                            {variations.map((variation) => (
                                <option
                                    key={variation.id}
                                    value={variation.id}
                                    disabled={
                                        variation.inStock === false
                                    }
                                >
                                    {variation.label}
                                    {variation.inStock === false
                                        ? ` (${isFa ? "ناموجود" : "Out of stock"})`
                                        : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <div className="min-w-0">
                        <div className="flex items-baseline gap-1">
                            {showFromLabel && (
                                <span className="text-[10px] font-medium text-text-muted sm:text-xs">
                                    {isFa ? "از" : "From"}
                                </span>
                            )}

                            <span className="font-sans text-base font-extrabold text-coffee-dark sm:text-lg">
                                {displayPrice.toLocaleString(
                                    isFa ? "fa-IR" : "en-US"
                                )}
                            </span>

                            <span className="text-[10px] font-medium text-text-muted sm:text-xs">
                                {currency}
                            </span>
                        </div>
                    </div>

                    {/* محصولاتی که فقط تلفنی قابل خرید هستند */}
                    {isPhoneOrderProduct ? (
                        <a
                            href="tel:02191096656"
                            aria-label={
                                isFa
                                    ? "خرید فقط با تماس"
                                    : "Purchase by phone"
                            }
                            className="flex h-11 shrink-0 items-center justify-center rounded-2xl bg-coffee-dark px-4 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-coffee hover:shadow-md active:scale-95"
                        >
                            {isFa
                                ? "خرید فقط با تماس"
                                : "Purchase by phone"}
                        </a>
                    ) : isVariableProduct && !hasVariationOptions ? (
                        <Link
                            href={productUrl}
                            aria-label={
                                isFa
                                    ? "مشاهده محصول"
                                    : "View product"
                            }
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-coffee-dark text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-coffee hover:shadow-md"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2 2.5A1 1 0 0 0 6 17h11M10 21a1 1 0 1 1-2 0m9 0a1 1 0 1 1-2 0"
                                />
                            </svg>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={needsSelection}
                            title={
                                needsSelection
                                    ? isFa
                                        ? "ابتدا گزینه را انتخاب کنید"
                                        : "Select an option first"
                                    : undefined
                            }
                            aria-label={
                                isFa
                                    ? "افزودن به سبد خرید"
                                    : "Add to cart"
                            }
                            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-coffee-brown text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-coffee hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-coffee-brown"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2 2.5A1 1 0 0 0 6 17h11M10 21a1 1 0 1 1-2 0m9 0a1 1 0 1 1-2 0"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}