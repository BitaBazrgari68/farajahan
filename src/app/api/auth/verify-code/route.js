import crypto from "crypto";
import { NextResponse } from "next/server";
import { normalizeIranMobile, toLatinDigits } from "@/lib/phone";
import { verifyCode } from "@/lib/otpStore";
import { wcAdminFetch } from "@/lib/wcAdmin";
import {
    hasSessionSecret,
    createSessionToken,
    setSessionCookie,
} from "@/lib/session";

const GUEST_EMAIL_DOMAIN =
    process.env.GUEST_EMAIL_DOMAIN || "guest.farajahan.com";

function respond(body, status = 200) {
    return NextResponse.json(body, {
        status,
        headers: { "Cache-Control": "no-store" },
    });
}

async function findCustomerId(email) {
    const result = await wcAdminFetch("/customers", {
        query: { email, per_page: 1 },
    });

    if (!result.ok) {
        console.error("Find customer failed:", result.status);
        return { error: true, id: null };
    }

    const id = Array.isArray(result.data) ? result.data[0]?.id : null;

    return { error: false, id: Number.isInteger(id) ? id : null };
}

async function findOrCreateCustomer(mobile) {
    const email = `${mobile}@${GUEST_EMAIL_DOMAIN}`;

    const found = await findCustomerId(email);

    if (found.error) return null;
    if (found.id) return found.id;

    const created = await wcAdminFetch("/customers", {
        method: "POST",
        body: {
            email,
            username: mobile,
            // مشتری هرگز با رمز وارد نمی‌شود؛ ورود فقط با پیامک است
            password: crypto.randomBytes(24).toString("hex"),
            billing: { phone: mobile },
        },
    });

    if (created.ok && Number.isInteger(created.data?.id)) {
        return created.data.id;
    }

    // شاید درخواست هم‌زمان دیگری همین مشتری را ساخته باشد
    const retry = await findCustomerId(email);

    if (retry.id) return retry.id;

    console.error(
        "Create customer failed:",
        created.status,
        created.data?.code ?? null
    );

    return null;
}

export async function POST(request) {
    try {
        // قبل از مصرف شدن کد مطمئن شویم نشست ساخته می‌شود
        if (!hasSessionSecret()) {
            console.error("SESSION_SECRET is missing or too short");

            return respond({ error: "server_config" }, 500);
        }

        const body = await request.json().catch(() => null);

        const mobile = normalizeIranMobile(body?.phone);
        const code = toLatinDigits(body?.code).trim();

        if (!mobile) {
            return respond({ error: "invalid_phone" }, 400);
        }

        if (!/^\d{6}$/.test(code)) {
            return respond({ error: "invalid_code" }, 400);
        }

        const verified = verifyCode(mobile, code);

        if (!verified.ok) {
            return respond(
                { error: verified.reason },
                verified.reason === "too_many_attempts" ? 429 : 400
            );
        }

        const customerId = await findOrCreateCustomer(mobile);

        if (!customerId) {
            // کد مصرف شده؛ کاربر باید کد تازه بگیرد
            return respond({ error: "login_failed" }, 502);
        }

        const token = createSessionToken({ customerId, mobile });

        const response = respond({ ok: true, mobile });

        setSessionCookie(response, token);

        return response;
    } catch (error) {
        console.error("Verify code route error:", error);

        return respond({ error: "login_failed" }, 500);
    }
}