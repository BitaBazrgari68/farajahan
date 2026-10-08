import { NextResponse } from "next/server";
import {
    getCartToken,
    wcStoreFetch,
    jsonWithCart,
} from "@/lib/woocommerce";

const MAX_QTY = 999;

// تبدیل امن به عدد: مقدار نامعتبر یا خالی، NaN نمی‌شود و 0 می‌گیرد
const num = (value) => Number(value) || 0;

// کلید تطبیق: id آیتم در Woo = variationId یا در نبود آن productId
function normalizeItems(items) {
    const map = new Map();

    for (const raw of items) {
        const productId = Number(raw?.productId);
        const variationId = Number(raw?.variationId) || 0;
        const quantity = Number(raw?.quantity);

        if (!productId || !Number.isInteger(quantity) || quantity < 1) {
            return null;
        }

        const wooId = variationId || productId;
        const existing = map.get(wooId);

        map.set(wooId, {
            wooId,
            productId,
            variationId,
            quantity: Math.min(
                (existing?.quantity || 0) + quantity,
                MAX_QTY
            ),
        });
    }

    return map;
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!Array.isArray(body?.items)) {
            return NextResponse.json(
                { error: "items must be an array" },
                { status: 400 }
            );
        }

        const desired = normalizeItems(body.items);

        if (!desired) {
            return NextResponse.json(
                { error: "Invalid item in items" },
                { status: 400 }
            );
        }

        let cartToken = getCartToken(request);
        const failures = new Map(); // wooId -> error code

        // 1) خواندن Cart فعلی Woo
        const current = await wcStoreFetch("/cart", { cartToken });
        cartToken = current.cartToken;

        if (!current.ok) {
            return jsonWithCart(
                { error: "Failed to read WooCommerce cart" },
                { status: current.status, cartToken }
            );
        }

        const wooItems = new Map(
            current.data.items.map((i) => [i.id, i])
        );

        // آخرین سبد معتبر Woo؛ اگر عملیاتی بدنه‌ی سبد را برنگرداند null می‌شود
        let latestCart = current.data;

        // 2) حذف و تغییر تعداد (پشت‌سرهم، چون Cart یک session است)
        for (const [id, item] of wooItems) {
            const want = desired.get(id);
            let result;

            if (!want) {
                result = await wcStoreFetch("/cart/remove-item", {
                    method: "POST",
                    body: { key: item.key },
                    cartToken,
                });
            } else if (want.quantity !== item.quantity) {
                result = await wcStoreFetch("/cart/update-item", {
                    method: "POST",
                    body: { key: item.key, quantity: want.quantity },
                    cartToken,
                });
            } else {
                continue;
            }

            cartToken = result.cartToken;

            if (!result.ok) {
                failures.set(id, result.data?.code || "update_failed");
                console.error(
                    "Sync op failed:",
                    id,
                    result.status,
                    JSON.stringify(result.data)
                );
            }

            latestCart =
                result.ok && Array.isArray(result.data?.items)
                    ? result.data
                    : null;
        }

        // 3) افزودن آیتم‌های جدید
        for (const [id, want] of desired) {
            if (wooItems.has(id)) continue;

            const result = await wcStoreFetch("/cart/add-item", {
                method: "POST",
                body: { id, quantity: want.quantity },
                cartToken,
            });

            cartToken = result.cartToken;

            if (!result.ok) {
                failures.set(id, result.data?.code || "add_failed");
                console.error(
                    "Sync op failed:",
                    id,
                    result.status,
                    JSON.stringify(result.data)
                );
            }

            latestCart =
                result.ok && Array.isArray(result.data?.items)
                    ? result.data
                    : null;
        }

        // 4) سبد نهایی (منبع حقیقت)
        // فقط اگر سبد معتبر نداریم یا عملیاتی خطا داده، دوباره از Woo می‌خوانیم
        let cart = latestCart;

        if (!cart || failures.size > 0) {
            const final = await wcStoreFetch("/cart", { cartToken });
            cartToken = final.cartToken;

            if (!final.ok) {
                return jsonWithCart(
                    { error: "Failed to read final WooCommerce cart" },
                    { status: final.status, cartToken }
                );
            }

            cart = final.data;
        }

        const issues = [];
        const finalIds = new Set();

        const items = cart.items.map((i) => {
            finalIds.add(i.id);
            const want = desired.get(i.id);

            if (want && want.quantity !== i.quantity) {
                issues.push({
                    productId: want.productId,
                    variationId: want.variationId,
                    type: "quantity_adjusted",
                    requested: want.quantity,
                    actual: i.quantity,
                });
            }

            return {
                key: i.key,
                id: i.id,
                productId: want?.productId ?? i.id,
                variationId: want?.variationId ?? 0,
                name: i.name,
                image: i.images?.[0]?.thumbnail || null,
                quantity: i.quantity,
                price: num(i.prices?.price),
                regularPrice: num(i.prices?.regular_price),
                lineSubtotal: num(i.totals?.line_subtotal),
                lineTotal: num(i.totals?.line_total),
                maxQuantity: i.quantity_limits?.maximum ?? null,
                lowStockRemaining: i.low_stock_remaining ?? null,
            };
        });

        // آیتم‌هایی که خواسته شده بودند ولی وارد Cart نشدند
        for (const [id, want] of desired) {
            if (finalIds.has(id)) continue;

            const code = failures.get(id) || "unavailable";

            issues.push({
                productId: want.productId,
                variationId: want.variationId,
                type: code.includes("stock") ? "out_of_stock" : "unavailable",
                code,
            });
        }

        const t = cart.totals;
        const shippingRates = (cart.shipping_rates || []).map((pkg) => ({
            packageId: pkg.package_id,
            rates: (pkg.shipping_rates || []).map((rate) => ({
                rateId: rate.rate_id,
                name: rate.name,
                price: num(rate.price),
                selected: Boolean(rate.selected),
            })),
        }));

        return jsonWithCart(
            {
                items,
                totals: {
                    subtotal: num(t.total_items),
                    discount: num(t.total_discount),
                    shipping: num(t.total_shipping),
                    total: num(t.total_price),
                    currencyCode: t.currency_code,
                    currencySymbol: t.currency_symbol,
                    minorUnit: t.currency_minor_unit,
                },
                shippingRates,
                issues,
                cartErrors: cart.errors || [],
            },
            { cartToken }
        );
    } catch (error) {
        console.error("WooCommerce Cart Sync Error:", error);

        return NextResponse.json(
            { error: "Failed to sync cart" },
            { status: 500 }
        );
    }
}