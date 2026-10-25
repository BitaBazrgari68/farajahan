import { NextResponse } from "next/server";
import { normalizeIranMobile } from "@/lib/phone";
import { issueCode, revokeCode } from "@/lib/otpStore";
import { sendSms } from "@/lib/asanak";

function getClientIp(request) {
    const forwarded = request.headers.get("x-forwarded-for");

    if (forwarded) return forwarded.split(",")[0].trim();

    return request.headers.get("x-real-ip") || "unknown";
}

function respond(body, status = 200, extraHeaders = {}) {
    return NextResponse.json(body, {
        status,
        headers: { "Cache-Control": "no-store", ...extraHeaders },
    });
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => null);
        const mobile = normalizeIranMobile(body?.phone);

        if (!mobile) {
            return respond({ error: "invalid_phone" }, 400);
        }

        const ip = getClientIp(request);
        const issued = issueCode(mobile, ip);

        if (!issued.ok) {
            return respond(
                { error: issued.reason, retryAfter: issued.retryAfter },
                429,
                { "Retry-After": String(issued.retryAfter) }
            );
        }

        const sms = await sendSms(
            mobile,
            `کد ورود به فراجهان: ${issued.code}`
        );

        if (!sms.ok) {
            revokeCode(mobile, ip);

            console.error("Send code failed:", sms.status);

            return respond({ error: "sms_failed" }, 502);
        }

        return respond({ ok: true, expiresIn: 120, resendAfter: 60 });
    } catch (error) {
        console.error("Send code route error:", error);

        return respond({ error: "send_failed" }, 500);
    }
}