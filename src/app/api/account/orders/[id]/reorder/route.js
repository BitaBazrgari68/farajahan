import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOwnedOrderItems } from "@/lib/customerOrders";
import { wcStoreFetch } from "@/lib/woocommerce";
import { isPhoneOrder } from "@/lib/phoneOrder";
import { wcAdminFetch } from "@/lib/wcAdmin";
const MAX_QTY = 999;
const headers = { "Cache-Control": "no-store" };

const fail = (error, status) =>
    NextResponse.json({ error }, { status, headers });

// یک قلم سفارش قبلی را با اطلاعات امروز ووکامرس می‌سازد
async function buildCartItem(line, lang) {
    const parentRes = await wcStoreFetch(`/products/${line.productId}`, {
        lang,
    });

    if (!parentRes.ok || !parentRes.data) {
        return { skipped: "unavailable" };
    }

    const parent = parentRes.data;

    if (isPhoneOrder(parent)) return { skipped: "phone_only" };

    if (!parent.is_purchasable) return { skipped: "unavailable" };
    if (!parent.is_in_stock) return { skipped: "out_of_stock" };

    let price = Number(parent.prices?.price || 0);

    if (line.variationId) {
        const variationRes = await wcAdminFetch(
            `/products/${line.productId}/variations/${line.variationId}`
        );
        

        if (variationRes.status === 404) return { skipped: "unavailable" };

        if (variationRes.ok && variationRes.data) {
            const variation = variationRes.data;

            if (variation.status !== "publish" || variation.purchasable === false) {
                return { skipped: "unavailable" };
            }

            if (variation.stock_status === "outofstock") {
                return { skipped: "out_of_stock" };
            }

            price = Number(variation.price) || price;
        } else {
            // خطای موقت: همگام‌سازی سبد موجودی را دوباره بررسی می‌کند
            console.error("Reorder: variation read failed:", {
                productId: line.productId,
                variationId: line.variationId,
                status: variationRes.status,
            });
        }
    }

    const image = parent.images?.[0]?.src;

    return {
        item: {
            id: `${line.productId}_${line.variationId || "main"}`,
            productId: line.productId,
            variationId: line.variationId,
            variationLabel: line.options.join(" / ") || null,
            name: { fa: parent.name, en: parent.name },
            price,
            image: image ? encodeURI(image) : null,
            quantity: Math.min(line.quantity, MAX_QTY),
        },
    };
}

export async function POST(request, { params }) {
    // شناسه‌ی مشتری فقط از نشست سرور
    const session = getSession(request);

    if (!session) return fail("unauthorized", 401);

    try {
        const { id } = await params;

        if (!/^\d{1,10}$/.test(id)) return fail("not_found", 404);

        const body = await request.json().catch(() => null);
        const lang = body?.lang === "en" ? "en" : "fa";

        const order = await getOwnedOrderItems(Number(id), session.customerId);

        if (order.state === "not_found") return fail("not_found", 404);
        if (order.state === "error") return fail("order_failed", 502);

        const items = [];
        const skipped = [];

        const results = await Promise.all(
            order.items.map(async (line) => {
                if (!line.productId || line.quantity < 1) {
                    return { line, skipped: "unavailable" };
                }

                try {
                    return { line, ...(await buildCartItem(line, lang)) };
                } catch (error) {
                    console.error("Reorder item failed:", {
                        orderId: id,
                        productId: line.productId,
                        error: error?.name || "request_failed",
                    });

                    return { line, skipped: "unavailable" };
                }
            })
        );

        for (const result of results) {
            if (result.item) {
                items.push(result.item);
            } else {
                skipped.push({
                    name: result.line.name,
                    reason: result.skipped,
                });
            }
        }

        // افزودن به سبد در مرورگر انجام می‌شود (سبد در localStorage است)
        return NextResponse.json({ items, skipped }, { headers });
    } catch (error) {
        console.error("Reorder route error:", error);

        return fail("reorder_failed", 500);
    }
}