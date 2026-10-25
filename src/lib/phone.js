// ارقام فارسی و عربی را به لاتین تبدیل می‌کند و موبایل ایران را یکدست می‌کند.
// قاعده، همان قاعده‌ی مسیر ثبت سفارش است.

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toLatinDigits(value) {
    return String(value ?? "")
        .replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
        .replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d));
}

// خروجی: «09123456789» یا رشته‌ی خالی اگر نامعتبر باشد
export function normalizeIranMobile(value) {
    const cleaned = toLatinDigits(value).replace(/[\s-]/g, "");
    const match = cleaned.match(/^(?:\+98|0098|0)?(9\d{9})$/);

    return match ? `0${match[1]}` : "";
}