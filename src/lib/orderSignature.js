// امضای سبد: هم در مسیر ثبت سفارش و هم در مرورگر استفاده می‌شود.
// قاعده: شناسه‌ی ووکامرس هر قلم (تنوع اگر بود، وگرنه محصول) + ":" + تعداد،
// تعدادهای تکراری جمع می‌شوند، مرتب‌سازی عددی است، و با "|" به هم می‌چسبند.
// این فایل عمداً هیچ وابستگی سروری ندارد.

export function orderSignature(items) {
    if (!Array.isArray(items)) return "";

    const totals = new Map();

    for (const item of items) {
        const id = Number(item?.variationId) || Number(item?.productId);
        const quantity = Number(item?.quantity);

        if (!id || !Number.isInteger(quantity) || quantity < 1) continue;

        totals.set(id, (totals.get(id) || 0) + quantity);
    }

    return [...totals.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([id, quantity]) => `${id}:${quantity}`)
        .join("|");
}