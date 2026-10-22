// دسته‌هایی که فقط با تماس تلفنی خریداری می‌شوند (slug فارسی و انگلیسی)
const PHONE_ORDER_SLUGS = ["abmive", "fruit-drink"];
export const PHONE_NUMBER = "02191096656";
export function isPhoneOrder(product) {
    return Boolean(
        product?.categories?.some((category) =>
            PHONE_ORDER_SLUGS.includes(category.slug)
        )
    );
}