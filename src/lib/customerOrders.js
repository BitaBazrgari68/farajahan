import { wcAdminFetch } from "@/lib/wcAdmin";
import { IRAN_PROVINCE_CODES } from "@/data/iranProvinces";

const GUEST_EMAIL_DOMAIN =
    process.env.GUEST_EMAIL_DOMAIN || "guest.farajahan.com";
// فقط سفارش‌هایی که پرداختشان تأیید شده در پنل نشان داده می‌شوند
export const LISTED_STATUSES = ["processing", "completed"];

// وصل کردن سفارش به مشتری واردشده.
// شکست این مرحله خرید را متوقف نمی‌کند؛ فقط شناسه‌ها در لاگ می‌مانند
// تا بعداً بشود دستی اصلاحش کرد.
export async function linkOrderToCustomer(orderId, customerId) {
    try {
        const result = await wcAdminFetch(`/orders/${orderId}`, {
            method: "PUT",
            body: { customer_id: customerId },
            timeoutMs: 8000,
        });

        if (!result.ok) {
            console.error("Link order to customer failed:", {
                orderId,
                customerId,
                status: result.status,
                code: result.data?.code ?? null,
            });

            return false;
        }

        return true;
    } catch (error) {
        console.error("Link order to customer error:", {
            orderId,
            customerId,
            error: error?.name || "request_failed",
        });

        return false;
    }
}

// سفارش‌های یک مشتری؛ فقط فیلدهای لازم برای نمایش برگردانده می‌شود
export async function getCustomerOrders(customerId, { limit = 50 } = {}) {
    const perPage = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 50);

    const result = await wcAdminFetch("/orders", {
        query: {
            customer: customerId,
            status: LISTED_STATUSES.join(","),
            per_page: perPage,
            orderby: "date",
            order: "desc",
        },
    });
    if (!result.ok || !Array.isArray(result.data)) {
        console.error("Customer orders failed:", {
            customerId,
            status: result.status,
        });

        return { ok: false, orders: [] };
    }

    const orders = result.data
        // اگر فیلتر ووکامرس به هر دلیلی نادیده گرفته شود، سفارش دیگران رد نمی‌شود
        .filter(
            (order) =>
                order?.customer_id === customerId &&
                LISTED_STATUSES.includes(order?.status)
        )
        .map((order) => ({
            id: order.id,
            number: String(order.number ?? order.id),
            date: order.date_created_gmt
                ? `${order.date_created_gmt}Z`
                : null,
            status: order.status,
            total: Number(order.total) || 0,
            items: (order.line_items || []).map((item) => ({
                name: item.name,
                quantity: item.quantity,
                productId: item.product_id,
                variationId: item.variation_id || 0,
                // مثلاً «آئروپرس»؛ فقط ویژگی‌های قابل‌نمایش (کلیدهای داخلی با _ شروع می‌شوند)
                options: itemOptions(item),
            })),
        }));

    return { ok: true, orders };
}

// مثلاً «آئروپرس»؛ فقط ویژگی‌های قابل‌نمایش (کلیدهای داخلی با _ شروع می‌شوند)
export function itemOptions(item) {
    return (item?.meta_data || [])
        .filter(
            (meta) =>
                meta?.display_key &&
                !String(meta.key).startsWith("_") &&
                typeof meta.display_value === "string"
        )
        .map((meta) => meta.display_value);
}

// اقلام سفارش، فقط اگر مال همین مشتری و پرداخت‌شده باشد.
// نبودن، مال دیگری بودن و وضعیت نامعتبر را عمداً یکسان برمی‌گردانیم (not_found).
export async function getOwnedOrderItems(orderId, customerId) {
    const result = await wcAdminFetch(`/orders/${orderId}`);

    if (result.status === 404) return { state: "not_found", items: [] };

    if (!result.ok || !result.data) {
        console.error("Reorder: read order failed:", {
            orderId,
            customerId,
            status: result.status,
        });

        return { state: "error", items: [] };
    }

    const order = result.data;

    if (
        order.customer_id !== customerId ||
        !LISTED_STATUSES.includes(order.status)
    ) {
        return { state: "not_found", items: [] };
    }

    return {
        state: "ok",
        items: (order.line_items || []).map((item) => ({
            name: item.name,
            productId: Number(item.product_id) || 0,
            variationId: Number(item.variation_id) || 0,
            quantity: Number(item.quantity) || 0,
            options: itemOptions(item),
        })),
    };
}

// آدرس آخرین سفارش پرداخت‌شده‌ی مشتری، برای پر کردن فرم پرداخت
export async function getCheckoutDefaults(customerId) {
    const result = await wcAdminFetch("/orders", {
        query: {
            customer: customerId,
            status: LISTED_STATUSES.join(","),
            per_page: 1,
            orderby: "date",
            order: "desc",
        },
    });

    if (!result.ok || !Array.isArray(result.data)) {
        console.error("Checkout defaults failed:", {
            customerId,
            status: result.status,
        });

        return { ok: false, defaults: null };
    }

    // اگر فیلتر ووکامرس نادیده گرفته شود، سفارش دیگران استفاده نمی‌شود
    const order = result.data.find(
        (item) =>
            item?.customer_id === customerId &&
            LISTED_STATUSES.includes(item?.status)
    );

    if (!order) return { ok: true, defaults: null };

    const billing = order.billing || {};
    const text = (value) => String(value ?? "").trim();

    const email = text(billing.email);

    return {
        ok: true,
        defaults: {
            firstName: text(billing.first_name),
            lastName: text(billing.last_name),
            phone: text(billing.phone),
            // ایمیل جایگزین ساخته‌ی خودمان در فرم نمایش داده نمی‌شود
            email: email.toLowerCase().endsWith(`@${GUEST_EMAIL_DOMAIN}`)
                ? ""
                : email,
            state: IRAN_PROVINCE_CODES.has(text(billing.state))
                ? text(billing.state)
                : "",
            city: text(billing.city),
            address: text(billing.address_1),
            postcode: text(billing.postcode),
        },
    };
}