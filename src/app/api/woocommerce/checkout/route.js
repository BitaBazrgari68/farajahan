import { NextResponse } from "next/server";
import {
    getCartToken,
    wcStoreFetch,
    jsonWithCart,
} from "@/lib/woocommerce";
import { IRAN_PROVINCE_CODES } from "@/data/iranProvinces";

import { orderSignature } from "@/lib/orderSignature";
import {
    setLastOrderCookie,
    readPaidGuardCookie,
    clearPaidGuardCookie,
} from "@/lib/lastOrderCookie";
const PAYMENT_METHOD = "WC_ZPal";

const GUEST_EMAIL_DOMAIN =
    process.env.GUEST_EMAIL_DOMAIN || "guest.farajahan.com";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const toLatinDigits = (value) =>
    value
        .replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
        .replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d));

const clean = (value, max = 200) =>
    String(value ?? "").trim().slice(0, max);

// فقط productId / variationId / quantity از کلاینت قبول می‌شود
function normalizeItems(items) {
    if (!Array.isArray(items) || items.length === 0) return null;

    const map = new Map();

    for (const raw of items) {
        const productId = Number(raw?.productId);
        const variationId = Number(raw?.variationId) || 0;
        const quantity = Number(raw?.quantity);

        if (!productId || !Number.isInteger(quantity) || quantity < 1) {
            return null;
        }

        const id = variationId || productId;
        map.set(id, (map.get(id) || 0) + quantity);
    }

    return map;
}

export async function POST(request) {
    try {
        const body = await request.json();

        const desired = normalizeItems(body?.items);

        if (!desired) {
            return NextResponse.json(
                { error: "invalid_items" },
                { status: 400 }
            );
        }

        // اعتبارسنجی فیلدها (سمت سرور، مستقل از کلاینت)
        const firstName = clean(body.firstName, 60);
        const lastName = clean(body.lastName, 60);
        const state = clean(body.state, 10);
        const city = clean(body.city, 80);
        const address = clean(body.address, 300);
        const emailInput = clean(body.email, 120);

        const phoneMatch = toLatinDigits(clean(body.phone, 20))
            .replace(/[\s-]/g, "")
            .match(/^(?:\+98|0098|0)?(9\d{9})$/);
        const phone = phoneMatch ? `0${phoneMatch[1]}` : "";

        const postcode = toLatinDigits(clean(body.postcode, 20)).replace(
            /\s/g,
            ""
        );

        const fields = [];

        if (!firstName) fields.push("firstName");
        if (!lastName) fields.push("lastName");
        if (!phone) fields.push("phone");
        if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
            fields.push("email");
        }
        if (!IRAN_PROVINCE_CODES.has(state)) fields.push("state");
        if (!city) fields.push("city");
        if (address.length < 10) fields.push("address");
        if (!/^\d{10}$/.test(postcode)) fields.push("postcode");

        if (fields.length > 0) {
            return NextResponse.json(
                { error: "invalid_fields", fields },
                { status: 400 }
            );
        }

        // اگر ایمیل نبود، ایمیل جایگزین روی دامنه‌ی خودمان
        const email = emailInput || `${phone}@${GUEST_EMAIL_DOMAIN}`;

        let cartToken = getCartToken(request);

        // سبد واقعی Woo باید دقیقاً همان چیزی باشد که کاربر دیده
        const current = await wcStoreFetch("/cart", { cartToken });
        cartToken = current.cartToken;

        if (!current.ok) {
            return jsonWithCart(
                { error: "cart_read_failed" },
                { status: current.status, cartToken }
            );
        }

        const wooItems = current.data.items || [];

        const cartMatches =
            wooItems.length === desired.size &&
            wooItems.every((i) => desired.get(i.id) === i.quantity);

        if (!cartMatches) {
            return jsonWithCart(
                { error: "cart_changed" },
                { status: 409, cartToken }
            );
        }

        // محافظ پرداخت تکراری: همین اقلام قبلاً پرداخت شده و مشتری هنوز تأیید نکرده
        const currentSignature = orderSignature(
            wooItems.map((i) => ({
                productId: i.id,
                quantity: i.quantity,
            }))
        );

        const paidGuard = readPaidGuardCookie(request);

        if (
            paidGuard &&
            paidGuard.signature === currentSignature &&
            body?.confirmRepeat !== true
        ) {
            return jsonWithCart(
                { error: "already_paid", orderId: paidGuard.orderId },
                { status: 409, cartToken }
            );
        }

        

        const result = await wcStoreFetch("/checkout", {
            method: "POST",
            body: {
                billing_address: {
                    first_name: firstName,
                    last_name: lastName,
                    address_1: address,
                    city,
                    state,
                    postcode,
                    country: "IR",
                    email,
                    phone,
                },
                shipping_address: {
                    first_name: firstName,
                    last_name: lastName,
                    address_1: address,
                    city,
                    state,
                    postcode,
                    country: "IR",
                    phone,
                },
                payment_method: PAYMENT_METHOD,
                payment_data: [],
                customer_note: "",
            },
            cartToken,
        });

        cartToken = result.cartToken;

        if (!result.ok) {
            console.error(
                "Woo checkout failed:",
                result.status,
                JSON.stringify(result.data)
            );

            return jsonWithCart(
                { error: result.data?.code || "checkout_failed" },
                { status: result.status, cartToken }
            );
        }

        const d = result.data;

        const response = jsonWithCart(
            {
                orderId: d.order_id,
                status: d.status,
                paymentStatus: d.payment_result?.payment_status ?? null,
                redirectUrl: d.payment_result?.redirect_url ?? null,
            },
            { cartToken }
        );

        // کوکی آخرین سفارش: فقط سمت سرور، برای بررسی وضعیت بعد از پرداخت
        if (d.order_id && d.order_key) {
            setLastOrderCookie(response, {
                orderId: Number(d.order_id),
                orderKey: String(d.order_key),
                email,
                signature: orderSignature(
                    wooItems.map((i) => ({
                        productId: i.id,
                        quantity: i.quantity,
                    }))
                ),
            });
        }
        clearPaidGuardCookie(response);
        return response;
    } catch (error) {
        console.error("Checkout route error:", error);

        return NextResponse.json(
            { error: "checkout_failed" },
            { status: 500 }
        );
    }
}