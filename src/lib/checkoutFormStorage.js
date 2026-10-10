// ذخیره‌ی موقت فیلدهای فرم پرداخت تا بستن تب؛ فقط همین هشت فیلد
const STORAGE_KEY = "wc_checkout_form";

const FORM_KEYS = [
    "firstName",
    "lastName",
    "phone",
    "email",
    "state",
    "city",
    "address",
    "postcode",
];

export function loadCheckoutForm() {
    try {
        const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");

        if (!raw || typeof raw !== "object") return null;

        const result = {};

        for (const key of FORM_KEYS) {
            if (typeof raw[key] === "string") result[key] = raw[key];
        }

        return Object.keys(result).length > 0 ? result : null;
    } catch {
        return null;
    }
}

export function saveCheckoutForm(form) {
    try {
        const data = {};

        for (const key of FORM_KEYS) {
            data[key] = typeof form?.[key] === "string" ? form[key] : "";
        }

        // فرم کاملاً خالی را ذخیره نمی‌کنیم
        if (Object.values(data).every((value) => value === "")) {
            sessionStorage.removeItem(STORAGE_KEY);
            return;
        }

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // ذخیره‌سازی در دسترس نیست؛ فقط بازیابی فرم کار نمی‌کند
    }
}

export function clearCheckoutForm() {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // ذخیره‌سازی در دسترس نیست
    }
}