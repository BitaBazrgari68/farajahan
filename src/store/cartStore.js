import { create } from "zustand";
import { persist } from "zustand/middleware";

const sameItem = (item, productId, variationId) =>
    item.productId === productId &&
    (item.variationId || 0) === (variationId || 0);

export const useCartStore = create(
    persist(
        (set) => ({
            items: [],

            addItem: (product) =>
                set((state) => {
                    const newItem = {
                        ...product,
                        variationId: product.variationId || 0,
                    };

                    const existingItem = state.items.find((item) =>
                        sameItem(item, newItem.productId, newItem.variationId)
                    );

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                sameItem(
                                    item,
                                    newItem.productId,
                                    newItem.variationId
                                )
                                    ? {
                                          ...item,
                                          quantity:
                                              item.quantity +
                                              newItem.quantity,
                                      }
                                    : item
                            ),
                        };
                    }

                    return {
                        items: [...state.items, newItem],
                    };
                }),

            removeItem: (productId, variationId = 0) =>
                set((state) => ({
                    items: state.items.filter(
                        (item) => !sameItem(item, productId, variationId)
                    ),
                })),

            increaseQuantity: (productId, variationId = 0) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        sameItem(item, productId, variationId)
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                })),

            decreaseQuantity: (productId, variationId = 0) =>
                set((state) => ({
                    items: state.items
                        .map((item) =>
                            sameItem(item, productId, variationId)
                                ? { ...item, quantity: item.quantity - 1 }
                                : item
                        )
                        .filter((item) => item.quantity > 0),
                })),

            // برای اعمال نتیجه‌ی Sync (مثلاً وقتی موجودی تعداد را کم کرده)
            setItems: (items) => set({ items }),

            clearCart: () => set({ items: [] }),
        }),
        {
            name: "coffee-store-cart",
        }
    )
);