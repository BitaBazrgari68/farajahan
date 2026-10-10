// قالب و تنظیمات کوکی آخرین سفارش؛ فقط سمت سرور استفاده شود
export const LAST_ORDER_COOKIE = "wc_last_order";

// دو روز، هم‌مدت با توکن سبد
const MAX_AGE = 60 * 60 * 24 * 2;

const baseOptions = () => ({
    httpOnly: true,
    // lax: برگشت از درگاه یک ناوبری سطح‌بالا از سایت دیگر است و با strict کوکی نمی‌رسد
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
});

export function setLastOrderCookie(
    response,
    { orderId, orderKey, email, signature }
) {
    response.cookies.set(
        LAST_ORDER_COOKIE,
        JSON.stringify({ orderId, orderKey, email, signature }),
        { ...baseOptions(), maxAge: MAX_AGE }
    );
}

export function readLastOrderCookie(request) {
    const raw = request.cookies.get(LAST_ORDER_COOKIE)?.value;

    if (!raw) return null;

    try {
        const data = JSON.parse(raw);

        if (
            !Number.isInteger(data?.orderId) ||
            typeof data?.orderKey !== "string" ||
            typeof data?.email !== "string" ||
            typeof data?.signature !== "string"
        ) {
            return null;
        }

        return data;
    } catch {
        return null;
    }
}

export function clearLastOrderCookie(response) {
    response.cookies.set(LAST_ORDER_COOKIE, "", {
        ...baseOptions(),
        maxAge: 0,
    });
}

// کوکی محافظ پرداخت تکراری: بعد از حکم «پرداخت‌شده» می‌ماند (۶ ساعت)،
// فقط برای پرسش پیش از ثبت دوباره‌ی همان اقلام
export const PAID_GUARD_COOKIE = "wc_paid_guard";

const GUARD_MAX_AGE = 60 * 60 * 6;

export function setPaidGuardCookie(response, { orderId, signature }) {
    response.cookies.set(
        PAID_GUARD_COOKIE,
        JSON.stringify({ orderId, signature }),
        { ...baseOptions(), maxAge: GUARD_MAX_AGE }
    );
}

export function readPaidGuardCookie(request) {
    const raw = request.cookies.get(PAID_GUARD_COOKIE)?.value;

    if (!raw) return null;

    try {
        const data = JSON.parse(raw);

        if (
            !Number.isInteger(data?.orderId) ||
            typeof data?.signature !== "string" ||
            !data.signature
        ) {
            return null;
        }

        return data;
    } catch {
        return null;
    }
}

export function clearPaidGuardCookie(response) {
    response.cookies.set(PAID_GUARD_COOKIE, "", {
        ...baseOptions(),
        maxAge: 0,
    });
}