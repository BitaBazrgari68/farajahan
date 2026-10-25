import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request) {
    const session = getSession(request);

    return NextResponse.json(
        session
            ? { loggedIn: true, mobile: session.mobile }
            : { loggedIn: false },
        { headers: { "Cache-Control": "no-store" } }
    );
}