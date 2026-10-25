// ارسال پیامک با وب‌سرویس آسانک؛ فقط سمت سرور.

const ASANAK_URL = "https://panel.asanak.com/webservice/v2rest/sendsms";
const REQUEST_TIMEOUT_MS = 15 * 1000;

export async function sendSms(mobile, message) {
    const username = process.env.ASANAK_USERNAME;
    const password = process.env.ASANAK_PASSWORD;
    const source = process.env.ASANAK_SOURCE;

    if (!username || !password || !source) {
        console.error("Asanak: missing env values");
        return { ok: false, status: 500, data: null };
    }

    // 09123456789 -> 989123456789
    const destination = `98${mobile.slice(1)}`;

    const form = new FormData();
    form.append("username", username);
    form.append("password", password);
    form.append("source", source);
    form.append("destination", destination);
    form.append("message", message);

    const response = await fetch(ASANAK_URL, {
        method: "POST",
        body: form,
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const text = await response.text();

    let data = null;

    try {
        data = JSON.parse(text);
    } catch {
        // پاسخ JSON نیست
    }

    // موقت: پاسخ خام آسانک را در حالت توسعه ببینیم تا تشخیص موفقیت را دقیق کنیم
    if (process.env.NODE_ENV === "development") {
        console.log("Asanak raw response:", response.status, text);
    }

    // موفقیت فقط وقتی که خود آسانک هم وضعیت ۲۰۰ را در پاسخ تأیید کند
    const accepted = response.ok && data?.meta?.status === 200;

    return { ok: accepted, status: response.status, data };}