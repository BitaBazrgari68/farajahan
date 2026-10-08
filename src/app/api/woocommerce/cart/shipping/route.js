import { NextResponse } from "next/server";
import {
    getCartToken,
    wcStoreFetch,
    jsonWithCart,
} from "@/lib/woocommerce";

const num = (value) => Number(value) || 0;

export async function POST(request) {
    try {
        const { packageId, rateId } = await request.json();

        const pkg = Number(packageId);

        if (
            !Number.isInteger(pkg) ||
            pkg < 0 ||
            typeof rateId !== "string" ||
            !/^[\w.:-]{1,100}$/.test(rateId)
        ) {
            return NextResponse.json(
                { error: "Invalid shipping selection" },
                { status: 400 }
            );
        }

        const result = await wcStoreFetch("/cart/select-shipping-rate", {
            method: "POST",
            body: { package_id: pkg, rate_id: rateId },
            cartToken: getCartToken(request),
        });

        if (!result.ok) {
            console.error(
                "Select shipping failed:",
                result.status,
                JSON.stringify(result.data)
            );

            return jsonWithCart(
                { error: result.data?.code || "shipping_failed" },
                { status: result.status, cartToken: result.cartToken }
            );
        }

        const cart = result.data;
        const t = cart.totals;

        return jsonWithCart(
            {
                totals: {
                    subtotal: num(t.total_items),
                    discount: num(t.total_discount),
                    shipping: num(t.total_shipping),
                    total: num(t.total_price),
                    currencyCode: t.currency_code,
                    currencySymbol: t.currency_symbol,
                    minorUnit: t.currency_minor_unit,
                },
                shippingRates: (cart.shipping_rates || []).map((p) => ({
                    packageId: p.package_id,
                    rates: (p.shipping_rates || []).map((r) => ({
                        rateId: r.rate_id,
                        name: r.name,
                        price: num(r.price),
                        selected: Boolean(r.selected),
                    })),
                })),
            },
            { cartToken: result.cartToken }
        );
    } catch (error) {
        console.error("Select shipping error:", error);

        return NextResponse.json(
            { error: "Failed to select shipping rate" },
            { status: 500 }
        );
    }
}