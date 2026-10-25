import crypto from "crypto";

// نشست امضاشده در کوکی؛ فقط سمت سرور.

export const SESSION_COOKIE = "farajahan_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // ۳۰ روز

function getSecret() {
    const secret = process.env.SESSION_SECRET;

    if (!secret || secret.length < 32) return null;

    return secret;
}

function sign(data, secret) {
    return crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("base64url");
}

export function hasSessionSecret() {
    return Boolean(getSecret());
}

export function createSessionToken({ customerId, mobile }) {
    const secret = getSecret();

    if (!secret) return null;

    const payload = Buffer.from(
        JSON.stringify({
            cid: customerId,
            mobile,
            exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
        })
    ).toString("base64url");

    return `${payload}.${sign(payload, secret)}`;
}

export function readSessionToken(token) {
    const secret = getSecret();

    if (!secret || typeof token !== "string") return null;

    const parts = token.split(".");

    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

    const [payload, signature] = parts;

    const given = Buffer.from(signature);
    const expected = Buffer.from(sign(payload, secret));

    if (
        given.length !== expected.length ||
        !crypto.timingSafeEqual(given, expected)
    ) {
        return null;
    }

    try {
        const data = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8")
        );

        if (
            !Number.isInteger(data?.cid) ||
            typeof data?.mobile !== "string" ||
            !(data.exp > Date.now())
        ) {
            return null;
        }

        return { customerId: data.cid, mobile: data.mobile };
    } catch {
        return null;
    }
}

// برای مسیرهای API
export function getSession(request) {
    return readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

const baseOptions = () => ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
});

export function setSessionCookie(response, token) {
    response.cookies.set(SESSION_COOKIE, token, {
        ...baseOptions(),
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
}

export function clearSessionCookie(response) {
    response.cookies.set(SESSION_COOKIE, "", {
        ...baseOptions(),
        maxAge: 0,
    });
}