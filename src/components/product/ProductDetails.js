"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

const PHONE_NUMBER = "02191096656";

export default function ProductDetails({ product, locale = "fa" }) {
  const addItem = useCartStore((state) => state.addItem);

  const [selectedVariationId, setSelectedVariationId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const isFa = locale === "fa";
  const variations = product.variations || [];
  const isVariableProduct = product.type === "variable";
  const hasVariationOptions =
    isVariableProduct && variations.length > 0;

  const selectedVariation = hasVariationOptions
    ? variations.find(
        (variation) => String(variation.id) === selectedVariationId
      )
    : undefined;

  // مطابق ProductCard، فعلاً قیمت تمام تنوع‌ها همان قیمت پایه است.
  const displayPrice = product.price.value;
  const needsSelection = hasVariationOptions && !selectedVariation;

  const isPhoneOrderProduct = product.categories?.some(
    (category) => category.slug === "abmive"
  );

  const isAvailable =
    product.stock.available && product.stock.purchasable;

  const formatPrice = (value) =>
    new Intl.NumberFormat(isFa ? "fa-IR" : "en-US").format(value);

  const handleAddToCart = () => {
    if (needsSelection || !isAvailable) return;

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
      quantity,
      cachedAt: Date.now(),
    });

    setAddedToCart(true);
  };

  return (
    <main
      dir={isFa ? "rtl" : "ltr"}
      className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <nav className="mb-6 text-sm text-text-muted">
        <Link href={`/${locale}`} className="transition hover:text-coffee">
          {isFa ? "خانه" : "Home"}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${locale}/shop`} className="transition hover:text-coffee">
          {isFa ? "فروشگاه" : "Shop"}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-coffee-dark">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-3xl bg-cream p-6 sm:min-h-[460px]">
          {product.image?.src ? (
            <Image
              src={product.image.src}
              alt={product.image.alt || product.name}
              width={800}
              height={800}
              priority
              className="h-full max-h-[520px] w-full object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <p className="text-text-muted">
              {isFa
                ? "تصویری برای این محصول موجود نیست."
                : "No image available for this product."}
            </p>
          )}
        </div>

        <section className="flex flex-col justify-center">
          <p className="mb-3 text-sm text-text-muted">
            {isFa ? "فروشگاه فراجهان" : "Farajahan Store"}
          </p>

          <h1 className="mb-5 text-2xl font-bold leading-relaxed text-coffee-dark sm:text-3xl">
            {product.name}
          </h1>

          {product.price.value > 0 && (
            <p className="mb-6 text-2xl font-bold text-coffee">
              {formatPrice(displayPrice)}
              <span className="mr-2 text-base font-normal text-text-muted">
                {isFa ? "تومان" : "تومان"}
              </span>
            </p>
          )}

          {product.description && (
            <div
              className="mb-6 leading-8 text-text-muted [&_p]:mb-3"
              dangerouslySetInnerHTML={{
                __html: product.description,
              }}
            />
          )}

          {hasVariationOptions && (
            <div className="mb-6">
              <label
                htmlFor="product-variation"
                className="mb-3 block font-semibold text-coffee-dark"
              >
                {product.variationAttributeName ||
                  (isFa ? "انتخاب تنوع محصول" : "Choose an option")}
              </label>

              <select
                id="product-variation"
                value={selectedVariationId}
                onChange={(event) => {
                  setSelectedVariationId(event.target.value);
                  setAddedToCart(false);
                }}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-coffee-dark outline-none transition focus:border-coffee"
              >
                <option value="">
                  {isFa ? "لطفاً یک گزینه انتخاب کنید" : "Select an option"}
                </option>

                {variations.map((variation) => (
                  <option key={variation.id} value={String(variation.id)}>
                    {variation.label}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-sm text-text-muted">
                {isFa
                  ? "قیمت گزینه‌های این محصول مطابق قیمت پایه محاسبه می‌شود."
                  : "All options currently use the base product price."}
              </p>
            </div>
          )}

          {!isPhoneOrderProduct && (
            <div className="mb-6">
              <label className="mb-3 block font-semibold text-coffee-dark">
                {isFa ? "تعداد" : "Quantity"}
              </label>

              <div className="inline-flex items-center overflow-hidden rounded-xl border border-stone-300">
                <button
                  type="button"
                  onClick={() => {
                    setQuantity((current) => Math.max(1, current - 1));
                    setAddedToCart(false);
                  }}
                  disabled={quantity <= 1}
                  aria-label={isFa ? "کاهش تعداد" : "Decrease quantity"}
                  className="px-4 py-3 text-coffee-dark transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>

                <span
                  aria-live="polite"
                  className="min-w-12 px-3 text-center font-semibold text-coffee-dark"
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setQuantity((current) => current + 1);
                    setAddedToCart(false);
                  }}
                  aria-label={isFa ? "افزایش تعداد" : "Increase quantity"}
                  className="px-4 py-3 text-coffee-dark transition hover:bg-cream"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {isPhoneOrderProduct ? (
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-coffee-brown px-6 py-4 font-semibold text-white transition hover:opacity-90 sm:w-auto"
            >
              {isFa
                ? `سفارش تلفنی: ${PHONE_NUMBER}`
                : `Call to order: ${PHONE_NUMBER}`}
            </a>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable || needsSelection}
                className="w-full rounded-xl bg-coffee-brown px-6 py-4 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-stone-400 sm:w-auto"
              >
                {!product.stock.available
                  ? isFa
                    ? "ناموجود"
                    : "Out of stock"
                  : !product.stock.purchasable
                    ? isFa
                      ? "فعلاً قابل خرید نیست"
                      : "Currently unavailable"
                    : needsSelection
                      ? isFa
                        ? "ابتدا تنوع محصول را انتخاب کنید"
                        : "Select an option first"
                      : isFa
                        ? "افزودن به سبد خرید"
                        : "Add to cart"}
              </button>

              {addedToCart && (
                <p
                  role="status"
                  className="mt-3 font-medium text-green-700"
                >
                  {isFa
                    ? "محصول به سبد خرید اضافه شد."
                    : "Product added to cart."}
                </p>
              )}
            </>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-stone-200 pt-6 text-sm text-text-muted sm:grid-cols-3">
            <div>
              <span className="mb-1 block font-semibold text-coffee-dark">
                {isFa ? "خرید مطمئن" : "Secure shopping"}
              </span>
              <span>
                {isFa ? "ثبت سفارش از فروشگاه" : "Order through our store"}
              </span>
            </div>

            <div>
              <span className="mb-1 block font-semibold text-coffee-dark">
                {isFa ? "پشتیبانی" : "Support"}
              </span>
              <span>{PHONE_NUMBER}</span>
            </div>

            <div>
              <span className="mb-1 block font-semibold text-coffee-dark">
                {isFa ? "تنوع محصول" : "Product options"}
              </span>
              <span>
                {isFa ? "انتخاب پیش از خرید" : "Choose before purchase"}
              </span>
            </div>
          </div>

          {product.categories?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.categories.map((category) => (
                <span
                  key={category.id}
                  className="rounded-full bg-cream px-3 py-1 text-sm text-coffee"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
