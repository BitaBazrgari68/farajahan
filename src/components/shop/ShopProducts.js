"use client";

import { useState } from "react";
import ProductCard from "@/components/shop/ProductCard";

export default function ShopProducts({
    products,
    categories,
    locale,
    currency,
}) {
    const [activeId, setActiveId] = useState(null);

    const isFa = locale === "fa";

    const formatCount = (value) =>
        value.toLocaleString(isFa ? "fa-IR" : "en-US");

    const inCategory = (product, categoryId) =>
        product.filterIds.includes(categoryId);

    // فقط دسته‌هایی که حداقل یک محصول دارند
    const filters = categories
        .map((category) => ({
            ...category,
            count: products.filter((product) =>
                inCategory(product, category.id)
            ).length,
        }))
        .filter((category) => category.count > 0);

    const visibleProducts =
        activeId === null
            ? products
            : products.filter((product) => inCategory(product, activeId));

    const chipClass = (active) =>
        `rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${active
            ? "border-coffee-dark bg-coffee-dark text-white"
            : "border-black/10 bg-white text-coffee-dark hover:border-gold"
        }`;

    return (
        <>
            <div
                role="group"
                aria-label={isFa ? "فیلتر دسته‌بندی" : "Category filter"}
                className="mb-8 flex flex-wrap gap-2"
            >
                <button
                    type="button"
                    onClick={() => setActiveId(null)}
                    aria-pressed={activeId === null}
                    className={chipClass(activeId === null)}
                >
                    {isFa ? "همه" : "All"} ({formatCount(products.length)})
                </button>

                {filters.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveId(category.id)}
                        aria-pressed={activeId === category.id}
                        className={chipClass(activeId === category.id)}
                    >
                        {category.name} ({formatCount(category.count)})
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {visibleProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        locale={locale}
                        currency={currency}
                    />
                ))}
            </div>
        </>
    );
}