"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCartStore } from "@/store/cartStore";

const DEBOUNCE_MS = 800;

// Sync در حال اجرا؛ بین همه‌ی نمونه‌های hook مشترک است
let activeSync = null;

const itemKey = (item) => `${item.productId}:${item.variationId || 0}`;

const signatureOf = (items) =>
    items
        .map((i) => `${itemKey(i)}:${i.quantity}`)
        .sort()
        .join("|");

export function useCartSync() {
    const items = useCartStore((state) => state.items);
    const setItems = useCartStore((state) => state.setItems);

    const [hydrated, setHydrated] = useState(false);
    const [cart, setCart] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [tick, setTick] = useState(0);

    const lastSynced = useRef(null);



    const instanceId = useRef(Math.random().toString(36).slice(2, 6));


    useEffect(() => {
        const persist = useCartStore.persist;

        if (persist.hasHydrated()) {
            setHydrated(true);
        }

        return persist.onFinishHydration(() => setHydrated(true));
    }, []);

    const runSync = useCallback(async () => {
        // اگر Sync دیگری (حتی از نمونه‌ی قبلی hook) در حال اجراست، منتظرش بمان
        while (activeSync) {
            await activeSync.catch(() => { });
        }

        const current = useCartStore.getState().items;
        const sig = signatureOf(current);

        if (sig === lastSynced.current) return;

        setIsSyncing(true);
        setError(null);

        // از اینجا تا تخصیص activeSync نباید await باشد
        const job = (async () => {
            const response = await fetch("/api/woocommerce/cart/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: current.map((i) => ({
                        productId: i.productId,
                        variationId: i.variationId || 0,
                        quantity: i.quantity,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "sync_failed");
            }

            return data;
        })();

        activeSync = job;

        try {
            const data = await job;

            const currentByKey = new Map(
                current.map((item) => [itemKey(item), item])
            );

            const enrichedIssues = (data.issues || []).map((issue) => ({
                ...issue,
                name: currentByKey.get(itemKey(issue))?.name ?? null,
                variationLabel:
                    currentByKey.get(itemKey(issue))?.variationLabel ?? null,
            }));
            setCart({
                ...data,
                issues: enrichedIssues,
            });


            const latest = useCartStore.getState().items;
            const changedMeanwhile = signatureOf(latest) !== sig;

            if (changedMeanwhile) {
                // کاربر وسط Sync سبد را عوض کرده؛ نتیجه‌ی قدیمی را روی Zustand اعمال نکن
                // و صریحاً یک Sync جدید را برای بعد از پایان این درخواست زمان‌بندی کن
                lastSynced.current = sig;
                setTick((t) => t + 1);
            } else {
                // مقدار واقعی Woo را روی Zustand اعمال کن
                const serverItems = new Map(
                    data.items.map((i) => [itemKey(i), i])
                );

                const reconciled = current
                    .filter((i) => serverItems.has(itemKey(i)))
                    .map((i) => ({
                        ...i,
                        quantity: serverItems.get(itemKey(i)).quantity,
                    }));

                const reconciledSig = signatureOf(reconciled);

                if (reconciledSig !== sig) {
                    setItems(reconciled);
                }

                lastSynced.current = reconciledSig;
            }
        } catch (err) {
            console.error("Cart sync failed:", err);
            setError("sync_failed");
        } finally {
            if (activeSync === job) {
                activeSync = null;
            }
            setIsSyncing(false);
        }
    }, [setItems]);

    useEffect(() => {
        if (!hydrated) return;

        const timer = setTimeout(runSync, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [items, hydrated, tick, runSync]);

    const retry = useCallback(() => {
        lastSynced.current = null;
        runSync();
    }, [runSync]);

    return { cart, isSyncing, error, retry };
}