import { NextResponse } from "next/server";
import { getFinderProducts } from "@/lib/wordpress/finder";
import { recommend, sanitizeInput } from "@/lib/coffeeFinderRecommend";

const headers = { "Cache-Control": "no-store" };

export async function POST(request) {
    try {
        const body = await request.json().catch(() => null);

        // فقط پاسخ‌هایی که در فهرست سؤال‌ها هست قبول می‌شود
        const input = sanitizeInput(body);

        if (!input) {
            return NextResponse.json(
                { error: "invalid_input" },
                { status: 400, headers }
            );
        }

        // خرید عمده محصول پیشنهاد نمی‌دهد؛ بی‌دلیل سراغ ووکامرس نمی‌رویم
        if (input.businessType === "wholesale") {
            return NextResponse.json(
                { mode: "contact", products: [] },
                { headers }
            );
        }

        const rawProducts = await getFinderProducts(input.lang);

        return NextResponse.json(recommend(input, rawProducts), {
            headers,
        });
    } catch (error) {
        console.error("Coffee finder recommend error:", error);

        return NextResponse.json(
            { error: "recommend_failed" },
            { status: 500, headers }
        );
    }
}