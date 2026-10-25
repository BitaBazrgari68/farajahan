// اتصال سمت سرور به API کامل ووکامرس (wc/v3) با کلید خواندن/نوشتن.
// این فایل را هرگز در کامپوننت‌های سمت کلاینت وارد نکنید.

const WOOCOMMERCE_URL =
    process.env.WOOCOMMERCE_URL || "https://farajahan.com";

const REQUEST_TIMEOUT_MS = 20 * 1000;

export function hasAdminKeys() {
    return Boolean(
        process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET
    );
}

export async function wcAdminFetch(
    path,
    { method = "GET", body, query } = {}
) {
    if (!hasAdminKeys()) {
        return {
            ok: false,
            status: 500,
            data: { code: "missing_keys" },
        };
    }

    const url = new URL(`${WOOCOMMERCE_URL}/wp-json/wc/v3${path}`);

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            url.searchParams.set(key, String(value));
        }
    }

    const credentials = Buffer.from(
        `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64");

    const response = await fetch(url.toString(), {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data = await response.json().catch(() => null);

    return {
        ok: response.ok,
        status: response.status,
        data,
    };
}