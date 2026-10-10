"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { orderSignature } from "@/lib/orderSignature";
import { clearCheckoutForm } from "@/lib/checkoutFormStorage";
const MAX_ATTEMPTS = 5;
const DELAY_MS = 4000;
const VERDICT_KEY = "wc_order_verdict";
const VERDICT_MAX_AGE_MS = 30 * 60 * 1000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const readVerdict = () => {
    try {
        const verdict = JSON.parse(
            sessionStorage.getItem(VERDICT_KEY) || "null"
        );

        // حکم قدیمی‌تر از ۳۰ دقیقه (یا بدون زمان ذخیره) معتبر نیست
        if (
            !verdict ||
            Date.now() - Number(verdict.savedAt || 0) > VERDICT_MAX_AGE_MS
        ) {
            return null;
        }

        return verdict;
    } catch {
        return null;
    }
};

const saveVerdict = (verdict) => {
    try {
        sessionStorage.setItem(
            VERDICT_KEY,
            JSON.stringify({ ...verdict, savedAt: Date.now() })
        );
    } catch {
        // ذخیره‌سازی در دسترس نیست؛ فقط تازه‌کردن صفحه حکم را از دست می‌دهد
    }
};

export default function OrderResultPage({ params, searchParams }) {
    const { locale } = use(params);
    const query = use(searchParams);

    const rawOrder = String(query?.order ?? "");
    const urlOrder = /^\d{1,10}$/.test(rawOrder) ? rawOrder : "";

    const isFa = locale === "fa";
    const isRTL = locale === "fa" || locale === "ar";

    const [view, setView] = useState("checking");
    const [orderNumber, setOrderNumber] = useState(urlOrder);
    const startedRef = useRef(false);

    useEffect(() => {
        // در حالت توسعه React افکت را دوبار اجرا می‌کند؛ این پرچم جلوی دو حلقه‌ی بررسی را می‌گیرد
        if (startedRef.current) return;
        startedRef.current = true;

        const run = async () => {
            await waitForCartHydration();

            for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
                let data = null;

                try {
                    const response = await fetch(
                        "/api/woocommerce/order-status",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                signature: orderSignature(
                                    useCartStore.getState().items
                                ),
                            }),
                        }
                    );

                    data = await response.json();
                } catch (err) {
                    console.error("Order status request failed:", err);
                }

                const state = data?.state;
                const orderId = data?.orderId ? String(data.orderId) : "";

                // آدرس فقط برای مقایسه است؛ اگر با کوکی فرق داشت هرگز «موفق» نمی‌گوییم
                const sameOrder =
                    !urlOrder || !orderId || urlOrder === orderId;

                if (state === "paid") {
                    saveVerdict({ orderId, state: "paid" });

                    // سبد فقط وقتی پاک می‌شود که امضایش با امضای همان سفارش یکی باشد
                    if (data.cartMatchesOrder) {
                        useCartStore.getState().setItems([]);
                        clearCheckoutForm();
                    }

                    setOrderNumber(sameOrder ? orderId : urlOrder);
                    setView(sameOrder ? "paid" : "unconfirmed");
                    return;
                }

                if (state === "failed") {
                    setOrderNumber(sameOrder ? orderId : urlOrder);
                    setView(sameOrder ? "failed" : "unconfirmed");
                    return;
                }

                if (state === "none") {
                    // کوکی نیست یا قبلاً حکم داده شده: اول حکم ذخیره‌شده‌ی همین نشست
                    const verdict = readVerdict();

                    if (
                        verdict?.state === "paid" &&
                        urlOrder &&
                        urlOrder === verdict.orderId
                    ) {
                        setOrderNumber(verdict.orderId);
                        setView("paid");
                        return;
                    }

                    // بازگشت در مرورگر دیگر: پرداخت را تأیید نمی‌کنیم ولی می‌گوییم دوباره ثبت نکنید
                    setView(urlOrder ? "unconfirmed" : "notfound");
                    return;
                }

                // unconfirmed یا خطا: بعد از فاصله دوباره بررسی کن
                if (orderId && sameOrder) setOrderNumber(orderId);

                if (attempt < MAX_ATTEMPTS - 1) await wait(DELAY_MS);
            }

            setView("unconfirmed");
        };

        run();
    }, [urlOrder]);

    const orderLabel = orderNumber
        ? Number(orderNumber).toLocaleString(isFa ? "fa-IR" : "en-US", {
            useGrouping: false,
        })
        : "";

    const contents = {
        checking: {
            title: isFa
                ? "در حال بررسی پرداخت شما…"
                : "Checking your payment…",
            body: isFa
                ? "لطفاً صبر کنید و صفحه را نبندید. این کار چند ثانیه طول می‌کشد."
                : "Please wait and don't close this page. This takes a few seconds.",
        },
        paid: {
            title: isFa ? "سفارش شما ثبت شد" : "Your order is confirmed",
            body: isFa
                ? "پرداخت شما با موفقیت تأیید شد. از خرید شما سپاسگزاریم."
                : "Your payment was confirmed. Thank you for your purchase.",
        },
        failed: {
            title: isFa ? "پرداخت انجام نشد" : "Payment was not completed",
            body: isFa
                ? "پرداخت شما کامل نشد. سبد خرید شما همچنان محفوظ است و می‌توانید دوباره تلاش کنید."
                : "Your payment wasn't completed. Your cart is still saved and you can try again.",
        },
        unconfirmed: {
            title: isFa
                ? "پرداخت شما هنوز تأیید نشده است"
                : "Your payment isn't confirmed yet",
            body: isFa
                ? "اگر پرداخت را انجام داده‌اید، سفارش را دوباره ثبت نکنید؛ تأیید ممکن است چند دقیقه طول بکشد. اگر مبلغ از حساب شما کسر شد و وضعیت تغییر نکرد، با پشتیبانی فروشگاه تماس بگیرید."
                : "If you already paid, please don't place the order again; confirmation can take a few minutes. If you were charged and nothing changes, please contact the shop's support.",
        },
        notfound: {
            title: isFa ? "سفارشی برای نمایش پیدا نشد" : "No order to show",
            body: isFa
                ? "اگر تازه سفارش داده‌اید، از همان مرورگری که سفارش را ثبت کرده‌اید دوباره بررسی کنید."
                : "If you just placed an order, please check again from the browser you ordered with.",
        },
    };

    const content = contents[view];
    const showOrderNumber =
        orderLabel && view !== "checking" && view !== "notfound";

    return (
        <main
            dir={isRTL ? "rtl" : "ltr"}
            className="min-h-screen bg-[#f7f4ee] px-4 py-16"
        >
            <div
                role={view === "checking" ? "status" : undefined}
                className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5"
            >
                <h1 className="text-2xl font-bold text-coffee-dark">
                    {content.title}
                </h1>

                <p className="mt-3 text-sm leading-7 text-text-muted">
                    {content.body}
                </p>

                {showOrderNumber && (
                    <p className="mt-4 text-sm font-semibold text-coffee-dark">
                        {isFa ? "شماره‌ی سفارش:" : "Order number:"}{" "}
                        {orderLabel}
                    </p>
                )}

                {view === "failed" && (
                    <Link
                        href={`/${locale}/checkout`}
                        className="mt-8 rounded-2xl bg-coffee-dark px-6 py-3 text-sm font-bold text-white transition hover:bg-coffee"
                    >
                        {isFa ? "بازگشت به صفحه‌ی پرداخت" : "Back to checkout"}
                    </Link>
                )}

                {view === "unconfirmed" && (
                    <Link
                        href={`/${locale}/checkout`}
                        className="mt-8 text-sm font-semibold text-text-muted transition hover:text-coffee-dark"
                    >
                        {isFa ? "بازگشت به صفحه‌ی پرداخت" : "Back to checkout"}
                    </Link>
                )}

                {(view === "paid" || view === "notfound") && (
                    <Link
                        href={`/${locale}/shop`}
                        className="mt-8 rounded-2xl bg-coffee-dark px-6 py-3 text-sm font-bold text-white transition hover:bg-coffee"
                    >
                        {isFa ? "ادامه خرید" : "Continue Shopping"}
                    </Link>
                )}
            </div>
        </main>
    );
}