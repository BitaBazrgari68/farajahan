import crypto from "crypto";

// نگه‌داری موقت کدهای تأیید، فقط در حافظه‌ی برنامه.
// وقتی بستر نهایی سرور مشخص شد، فقط همین فایل عوض می‌شود
// و توابع صادرشده (issueCode, revokeCode, verifyCode) همان می‌مانند.

const CODE_TTL_MS = 2 * 60 * 1000;
const RESEND_GAP_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

const HOUR_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_MOBILE_PER_HOUR = 5;
const MAX_SENDS_PER_IP_PER_HOUR = 20;
const MAX_TRACKED_KEYS = 5000;

// globalThis: تا با بارگذاری دوباره‌ی ماژول در حالت توسعه حافظه پاک نشود
const state =
    globalThis.__otpState ??
    (globalThis.__otpState = {
        codes: new Map(), // mobile -> { hash, expiresAt, sentAt, attempts }
        sends: new Map(), // "m:mobile" / "ip:addr" -> [timestamps]
        secret: crypto.randomBytes(32), // فقط برای هش کردن؛ با ریست برنامه کدها هم می‌میرند
    });

function hashCode(mobile, code) {
    return crypto
        .createHmac("sha256", state.secret)
        .update(`${mobile}:${code}`)
        .digest("hex");
}

function recentSends(key, now) {
    const list = (state.sends.get(key) || []).filter(
        (t) => now - t < HOUR_MS
    );

    if (list.length > 0) {
        state.sends.set(key, list);
    } else {
        state.sends.delete(key);
    }

    return list;
}

function pushSend(key, now) {
    const list = recentSends(key, now);

    list.push(now);
    state.sends.set(key, list);
}

function popSend(key) {
    const list = state.sends.get(key);

    if (!list || list.length === 0) return;

    list.pop();

    if (list.length === 0) state.sends.delete(key);
}

function cleanup(now) {
    if (state.sends.size > MAX_TRACKED_KEYS) {
        for (const key of [...state.sends.keys()]) {
            recentSends(key, now);
        }
    }

    if (state.codes.size > MAX_TRACKED_KEYS) {
        for (const [mobile, entry] of state.codes) {
            if (entry.expiresAt <= now) state.codes.delete(mobile);
        }
    }
}

// بررسی و ثبت در یک مرحله‌ی همگام (بدون await)، تا دو درخواست هم‌زمان رد نشوند.
export function issueCode(mobile, ip) {
    const now = Date.now();

    cleanup(now);

    const existing = state.codes.get(mobile);

    if (existing && now - existing.sentAt < RESEND_GAP_MS) {
        return {
            ok: false,
            reason: "too_soon",
            retryAfter: Math.ceil(
                (RESEND_GAP_MS - (now - existing.sentAt)) / 1000
            ),
        };
    }

    const mobileKey = `m:${mobile}`;
    const ipKey = `ip:${ip}`;

    if (recentSends(mobileKey, now).length >= MAX_SENDS_PER_MOBILE_PER_HOUR) {
        return { ok: false, reason: "mobile_limit", retryAfter: 600 };
    }

    if (recentSends(ipKey, now).length >= MAX_SENDS_PER_IP_PER_HOUR) {
        return { ok: false, reason: "ip_limit", retryAfter: 600 };
    }

    const code = String(crypto.randomInt(100000, 1000000));

    state.codes.set(mobile, {
        hash: hashCode(mobile, code),
        expiresAt: now + CODE_TTL_MS,
        sentAt: now,
        attempts: 0,
    });

    pushSend(mobileKey, now);
    pushSend(ipKey, now);

    return { ok: true, code };
}

// اگر ارسال پیامک شکست خورد: کد و شمارنده‌ها را برمی‌گرداند
export function revokeCode(mobile, ip) {
    state.codes.delete(mobile);
    popSend(`m:${mobile}`);
    popSend(`ip:${ip}`);
}

// برای مسیر تأیید (قدم بعد)
export function verifyCode(mobile, code) {
    const now = Date.now();
    const entry = state.codes.get(mobile);

    if (!entry) return { ok: false, reason: "no_code" };

    if (entry.expiresAt <= now) {
        state.codes.delete(mobile);
        return { ok: false, reason: "expired" };
    }

    if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
        state.codes.delete(mobile);
        return { ok: false, reason: "too_many_attempts" };
    }

    entry.attempts += 1;

    const given = Buffer.from(hashCode(mobile, String(code ?? "")), "hex");
    const saved = Buffer.from(entry.hash, "hex");

    if (
        given.length === saved.length &&
        crypto.timingSafeEqual(given, saved)
    ) {
        state.codes.delete(mobile);
        return { ok: true };
    }

    if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
        state.codes.delete(mobile);
        return { ok: false, reason: "too_many_attempts" };
    }

    return { ok: false, reason: "wrong_code" };
}