import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCustomerOrders } from "@/lib/customerOrders";

const headers = { "Cache-Control": "no-store" };

export async function GET(request) {
    // شناسه‌ی مشتری فقط از نشست سرور؛ هرگز از ورودی مرورگر
    const session = getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "unauthorized" },
            { status: 401, headers }
        );
    }

    try {
        const result = await getCustomerOrders(session.customerId);

        if (!result.ok) {
            return NextResponse.json(
                { error: "orders_failed" },
                { status: 502, headers }
            );
        }

        return NextResponse.json({ orders: result.orders }, { headers });
    } catch (error) {
        console.error("Account orders route error:", error);

        return NextResponse.json(
            { error: "orders_failed" },
            { status: 500, headers }
        );
    }
}