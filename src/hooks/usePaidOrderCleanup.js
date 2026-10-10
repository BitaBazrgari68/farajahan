"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { orderSignature } from "@/lib/orderSignature";
import { clearCheckoutForm } from "@/lib/checkoutFormStorage";
const CHECKED_KEY = "wc_paid_order_checked";
const RECHECK_MS = 30 * 1000;
const CHECK_TIMEOUT_MS = 20 * 1000;

// صبر می‌کند تا سبد از localStorage خوانده شود؛ وگرنه امضای سبد همیشه خالی است
const waitForCartHydration = () =>
    new Promise((resolve) => {
        const persist = useCartStore.persist;

        if (persist.hasHydrated()) {
            resolve();
            return;
        }

        const unsubscribe = persist.onFinishHydration(() => {
            unsubscribe();
            resolve();
        });
    });

// فقط برای همان سبد (همان امضا) و فقط تا ۳۰ ثانیه از بررسی قبلی نپرس
const recentlyChecked = (signature) => {
    try {
        const saved = JSON.parse(
            sessionStorage.getItem(CHECKED_KEY) || "null"
        );

        return (
            Boolean(saved) &&
            saved.signature === signature &&
            Date.now() - Number(saved.at || 0) < RECHECK_MS
        );
    } catch {
        return false;
    }
};

const markChecked = (signature) => {
    try {
        sessionStorage.setItem(
            CHECKED_KEY,
            JSON.stringify({ signature, at: Date.now() })
        );
    } catch {
        // ذخیره‌سازی در دسترس نیست؛ فقط بررسی تکراری می‌شود
    }
};

export function usePaidOrderCleanup() {
    const [isChecking, setIsChecking] = useState(true);
    const [clearedOrderId, setClearedOrderId] = useState(null);
    const [checkFailed, setCheckFailed] = useState(false);
    const startedRef = useRef(false);

    useEffect(() => {
        // در حالت توسعه React افکت را دوبار اجرا می‌کند؛ این پرچم جلوی بررسی دوباره را می‌گیرد
        if (startedRef.current) return;
        startedRef.current = true;

        const run = async () => {
            try {
                await waitForCartHydration();

                const items = useCartStore.getState().items;

                // سبد خالی: چیزی برای پاک‌سازی نیست
                if (items.length === 0) return;

                const signature = orderSignature(items);

                // همین سبد همین چند لحظه پیش بررسی شده
                if (recentlyChecked(signature)) return;

                const controller = new AbortController();
                const timeoutId = setTimeout(
                    () => controller.abort(),
                    CHECK_TIMEOUT_MS
                );

                let data;

                try {
                    const response = await fetch(
                        "/api/woocommerce/order-status",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ signature }),
                            signal: controller.signal,
                        }
                    );

                    data = await response.json();
                } finally {
                    clearTimeout(timeoutId);
                }

                if (data?.state === "paid") {
                    // سبد در حین انتظار پاسخ نباید تغییر کرده باشد
                    const currentSignature = orderSignature(
                        useCartStore.getState().items
                    );

                    if (
                        data.cartMatchesOrder &&
                        currentSignature === signature
                    ) {
                        useCartStore.getState().setItems([]);
                        clearCheckoutForm();
                        setClearedOrderId(String(data.orderId));
                        
                    }
                } else if (
                    data?.state === "failed" ||
                    data?.state === "unconfirmed"
                ) {
                    // تماس با ووکامرس سنگین است؛ برای همین سبد تا ۳۰ ثانیه دوباره نمی‌پرسیم
                    markChecked(signature);
                }
            } catch (err) {
                console.error("Paid order check failed:", err);
                setCheckFailed(true);
            } finally {
                setIsChecking(false);
            }
        };

        run();
    }, []);

    return { isChecking, clearedOrderId, checkFailed };
}