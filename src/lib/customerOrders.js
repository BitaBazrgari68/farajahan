import { wcAdminFetch } from "@/lib/wcAdmin";

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
export async function getCustomerOrders(customerId) {
    const result = await wcAdminFetch("/orders", {
        query: {
            customer: customerId,
            status: LISTED_STATUSES.join(","),
            per_page: 50,
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
                options: (item.meta_data || [])
                    .filter(
                        (meta) =>
                            meta?.display_key &&
                            !String(meta.key).startsWith("_") &&
                            typeof meta.display_value === "string"
                    )
                    .map((meta) => meta.display_value),
            })),
        }));

    return { ok: true, orders };
}