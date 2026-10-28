"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCartStore } from "@/store/cartStore";

export function useReorder() {
    const locale = useLocale();
    const router = useRouter();
    const addItem = useCartStore((state) => state.addItem);

    const [reorderingId, setReorderingId] = useState(null);
    const [error, setError] = useState(false);
    // { added, skipped } فقط وقتی بعضی اقلام اضافه نشده‌اند
    const [result, setResult] = useState(null);

    const busyRef = useRef(false);

    const reorder = useCallback(
        async (orderId) => {
            if (busyRef.current) return;

            busyRef.current = true;
            setReorderingId(orderId);
            setError(false);
            setResult(null);

            try {
                const response = await fetch(
                    `/api/account/orders/${orderId}/reorder`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            lang: locale === "en" ? "en" : "fa",
                        }),
                    }
                );

                if (!response.ok) throw new Error("reorder_failed");

                const data = await response.json();

                // ادغام با سبد فعلی؛ addItem تعداد قلم تکراری را جمع می‌کند
                for (const item of data.items) {
                    addItem({ ...item, cachedAt: Date.now() });
                }

                if (data.skipped.length > 0) {
                    setResult({
                        added: data.items.length,
                        skipped: data.skipped,
                    });
                } else {
                    router.push(`/${locale}/cart`);
                }
            } catch {
                setError(true);
            } finally {
                busyRef.current = false;
                setReorderingId(null);
            }
        },
        [addItem, locale, router]
    );

    const reset = useCallback(() => {
        setError(false);
        setResult(null);
    }, []);

    return { reorder, reorderingId, error, result, reset };
}