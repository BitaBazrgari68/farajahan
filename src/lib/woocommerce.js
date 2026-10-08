import { NextResponse } from "next/server";

const WOOCOMMERCE_URL =
    process.env.WOOCOMMERCE_URL || "https://farajahan.com";

const CART_COOKIE = "wc_cart_token";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 2; // 48 hours

export function getCartToken(request) {
    return request.cookies.get(CART_COOKIE)?.value;
}

export async function wcStoreFetch(
    path,
    { method = "GET", body, cartToken } = {}
) {
    const headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
    };

    if (cartToken) {
        headers["Cart-Token"] = cartToken;
    }

    const url = new URL(
        `${WOOCOMMERCE_URL}/wp-json/wc/store/v1${path}`
    );

    if (method === "GET") {
        url.searchParams.set("_", Date.now().toString());
    }

    const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    return {
        ok: response.ok,
        status: response.status,
        data,
        cartToken:
            response.headers.get("Cart-Token") ||
            cartToken,
    };
}

export function jsonWithCart(
    data,
    { status = 200, cartToken } = {}
) {
    const nextResponse = NextResponse.json(data, {
        status,
    });

    if (cartToken) {
        nextResponse.cookies.set(
            CART_COOKIE,
            cartToken,
            {
                httpOnly: true,
                sameSite: "lax",
                secure:
                    process.env.NODE_ENV ===
                    "production",
                path: "/",
                maxAge: CART_COOKIE_MAX_AGE,
            }
        );
    }

    return nextResponse;
}