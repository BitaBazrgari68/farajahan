"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";

export default function CartTestPage() {
    const [hydrated, setHydrated] = useState(false);

    const {
        items,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
    } = useCartStore();

    useEffect(() => {
        setHydrated(true);
    }, []);

    const simpleProduct = {
        id: "1_main",
        productId: 1,
        variationId: null,

        name: {
            fa: "قهوه اسپرسو",
            en: "Espresso Coffee",
        },

        price: 50000,
        image: "https://example.com/espresso.jpg",
        quantity: 1,
        cachedAt: Date.now(),
    };

    const variationProduct = {
        id: "1_25",
        productId: 1,
        variationId: 25,

        name: {
            fa: "قهوه اسپرسو - 250 گرم",
            en: "Espresso Coffee - 250g",
        },

        price: 65000,
        image: "https://example.com/espresso-250.jpg",
        quantity: 1,
        cachedAt: Date.now(),
    };

    if (!hydrated) {
        return (
            <main className="mx-auto max-w-4xl p-8">
                <p>Loading cart...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-4xl p-8">
            <h1 className="mb-8 text-2xl font-bold">
                Cart Store Test
            </h1>

            <div className="mb-8 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => addItem(simpleProduct)}
                    className="rounded bg-black px-4 py-2 text-white"
                >
                    Add Simple Product
                </button>

                <button
                    type="button"
                    onClick={() => addItem(variationProduct)}
                    className="rounded bg-black px-4 py-2 text-white"
                >
                    Add Variation
                </button>

                <button
                    type="button"
                    onClick={clearCart}
                    className="rounded bg-red-600 px-4 py-2 text-white"
                >
                    Clear Cart
                </button>
            </div>

            {items.length === 0 ? (
                <p>Cart is empty.</p>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded border p-4"
                        >
                            <div className="flex gap-4">
                                {item.image && (
                                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        <img
                                            src={item.image}
                                            alt={item.name.en}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                )}

                                <div>
                                    <h2 className="font-bold">
                                        {item.name.en}
                                    </h2>

                                    <p>
                                        Product ID:{" "}
                                        {item.productId}
                                    </p>

                                    <p>
                                        Variation ID:{" "}
                                        {item.variationId ??
                                            "Simple Product"}
                                    </p>

                                    <p>
                                        Price: {item.price}
                                    </p>

                                    <p>
                                        Quantity:{" "}
                                        {item.quantity}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        increaseQuantity(
                                            item.productId,
                                            item.variationId
                                        )
                                    }
                                    className="rounded border px-3 py-1"
                                >
                                    +
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        decreaseQuantity(
                                            item.productId,
                                            item.variationId
                                        )
                                    }
                                    className="rounded border px-3 py-1"
                                >
                                    -
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeItem(
                                            item.productId,
                                            item.variationId
                                        )
                                    }
                                    className="rounded bg-red-500 px-3 py-1 text-white"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}