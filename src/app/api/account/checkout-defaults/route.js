import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCheckoutDefaults } from "@/lib/customerOrders";

const headers = { "Cache-Control": "no-store" };

export async function GET(request) {
    // شناسه‌ی مشتری فقط از نشست سرور
    const session = getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "unauthorized" },
            { status: 401, headers }
        );
    }

    try {
        const result = await getCheckoutDefaults(session.customerId);

        if (!result.ok) {
            return NextResponse.json(
                { error: "defaults_failed" },
                { status: 502, headers }
            );
        }

        return NextResponse.json(
            { defaults: result.defaults },
            { headers }
        );
    } catch (error) {
        console.error("Checkout defaults route error:", error);

        return NextResponse.json(
            { error: "defaults_failed" },
            { status: 500, headers }
        );
    }
}