import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
    const response = NextResponse.json(
        { ok: true },
        { headers: { "Cache-Control": "no-store" } }
    );

    clearSessionCookie(response);

    return response;
}