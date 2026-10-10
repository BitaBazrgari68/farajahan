import { NextResponse } from "next/server";
import { wcStoreFetch } from "@/lib/woocommerce";
import {
    readLastOrderCookie,
    clearLastOrderCookie,
    setPaidGuardCookie,
} from "@/lib/lastOrderCookie";
const PAID_STATUSES = new Set(["processing", "completed"]);
const FAILED_STATUSES = new Set(["failed", "cancelled"]);

// محدودیت سبک درون‌حافظه‌ای. روی هاست چندنمونه‌ای یا serverless قابل‌اتکا نیست؛
// محافظت جدی‌تر را باید روی هاست یا Cloudflare گذاشت.
const WINDOW_MS = 60 * 1000;
const MAX_CALLS = 20;
const calls = new Map();

function isRateLimited(key) {
    const now = Date.now();
    const recent = (calls.get(key) || []).filter((t) => now - t < WINDOW_MS);

    recent.push(now);
    calls.set(key, recent);

    // جلوگیری از رشد بی‌پایان نقشه
    if (calls.size > 500) {
        for (const [k, times] of calls) {
            if (times.every((t) => now - t >= WINDOW_MS)) calls.delete(k);
        }
    }

    return recent.length > MAX_CALLS;
}

// عمداً NextResponse ساده است و نه jsonWithCart،
// تا کوکی سبد مشتری هیچ‌وقت بازنویسی نشود.
function respond(body, { status = 200, clearCookie = false } = {}) {
    const response = NextResponse.json(body, {
        status,
        headers: { "Cache-Control": "no-store" },
    });

    if (clearCookie) clearLastOrderCookie(response);

    return response;
}

export async function POST(request) {
      
    try {
        const saved = readLastOrderCookie(request);

        // بدون کوکی: بلافاصله و بدون هیچ تماسی با ووکامرس
        if (!saved) {
            return respond({ state: "none" });
        }

        const body = await request.json().catch(() => null);
        const signature =
            typeof body?.signature === "string"
                ? body.signature.slice(0, 2000)
                : "";

        if (isRateLimited(saved.orderId)) {
            return respond(
                {
                    state: "unconfirmed",
                    orderId: saved.orderId,
                    cartMatchesOrder: false,
                },
                { status: 429 }
            );
        }

        const params = new URLSearchParams({
            key: saved.orderKey,
            billing_email: saved.email,
        });

        // بدون توکن سبد: برای خواندن سفارش لازم نیست
        const result = await wcStoreFetch(
            `/order/${saved.orderId}?${params}`
        );

        if (!result.ok) {
            // سفارش حذف یا نامعتبر شده (مثلاً سفارش آزمایشی به سطل زباله رفته)
            if (result.status === 401 || result.status === 404) {
                return respond({ state: "none" }, { clearCookie: true });
            }

            console.error(
                "Order status failed:",
                result.status,
                JSON.stringify(result.data)
            );

            return respond({
                state: "unconfirmed",
                orderId: saved.orderId,
                cartMatchesOrder: false,
            });
        }


        const status = String(result.data?.status ?? "");
        if (status === "trash") {
            return respond({ state: "none" }, { clearCookie: true });
        }
        const cartMatchesOrder =
            Boolean(signature) && signature === saved.signature;

        // پرداخت‌شده: کوکی پاک می‌شود، چه سبد یکی باشد چه فرق داشته باشد
        if (PAID_STATUSES.has(status)) {
            const response = respond(
                { state: "paid", orderId: saved.orderId, cartMatchesOrder },
                { clearCookie: true }
            );

            // هر دو کوکی روی همین یک پاسخ؛ امضا، امضای خود سفارش است نه سبد مرورگر
            setPaidGuardCookie(response, {
                orderId: saved.orderId,
                signature: saved.signature,
            });

            return response;
        }

        // ناموفق یا لغو: کوکی و سبد می‌مانند
        if (FAILED_STATUSES.has(status)) {
            return respond({
                state: "failed",
                orderId: saved.orderId,
                cartMatchesOrder,
            });
        }

        // pending و هر وضعیت ناشناخته: هرگز «پرداخت‌شده» حساب نمی‌شود
        return respond({
            state: "unconfirmed",
            orderId: saved.orderId,
            cartMatchesOrder,
        });
    } catch (error) {
        console.error("Order status route error:", error);

        return respond(
            { state: "unconfirmed", cartMatchesOrder: false },
            { status: 500 }
        );
    }
}