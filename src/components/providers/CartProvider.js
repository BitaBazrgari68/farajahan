"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

export default function CartProvider({ children }) {
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

    return children;
}