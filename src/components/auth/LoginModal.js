"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { normalizeIranMobile, toLatinDigits } from "@/lib/phone";

const ERROR_KEYS = {
    invalid_phone: "invalid_phone",
    invalid_code: "invalid_code",
    wrong_code: "wrong_code",
    expired: "expired",
    no_code: "no_code",
    too_many_attempts: "too_many_attempts",
    mobile_limit: "too_many_requests",
    ip_limit: "too_many_requests",
    sms_failed: "send_failed",
    send_failed: "send_failed",
    login_failed: "login_failed",
};

const postJson = async (url, body) => {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    return { ok: response.ok, data };
};

export default function LoginModal({ onClose, onSuccess }) {
    const locale = useLocale();
    const t = useTranslations("auth");

    const isRTL = locale === "fa" || locale === "ar";

    const [step, setStep] = useState("phone");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [isBusy, setIsBusy] = useState(false);
    const [errorKey, setErrorKey] = useState("");
    const [noticeKey, setNoticeKey] = useState("");
    const [countdown, setCountdown] = useState(0);

    const inputRef = useRef(null);
    const busyRef = useRef(false);

    // قفل اسکرول صفحه و بستن با Escape
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    // فوکوس روی فیلد هر مرحله
    useEffect(() => {
        inputRef.current?.focus();
    }, [step]);

    // شمارش معکوس ارسال دوباره
    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setTimeout(() => {
            setCountdown((current) => current - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    const formatNumber = (value) =>
        value.toLocaleString(isRTL ? "fa-IR" : "en-US");

    const requestCode = async () => {
        if (busyRef.current) return;

        const normalized = normalizeIranMobile(phone);

        if (!normalized) {
            setErrorKey("invalid_phone");
            return;
        }

        busyRef.current = true;
        setIsBusy(true);
        setErrorKey("");
        setNoticeKey("");

        try {
            const { ok, data } = await postJson("/api/auth/send-code", {
                phone: normalized,
            });

            if (ok && data?.ok) {
                setPhone(normalized);
                setCode("");
                setStep("code");
                setCountdown(Number(data.resendAfter) || 60);
                return;
            }

            // کدی چند لحظه پیش فرستاده شده (مثلاً پنجره بسته و دوباره باز شده)
            if (data?.error === "too_soon") {
                setPhone(normalized);
                setCode("");
                setStep("code");
                setCountdown(Number(data.retryAfter) || 60);
                setNoticeKey("codeAlreadySent");
                return;
            }

            setErrorKey(ERROR_KEYS[data?.error] || "generic");
        } catch {
            setErrorKey("network");
        } finally {
            busyRef.current = false;
            setIsBusy(false);
        }
    };

    const submitCode = async () => {
        if (busyRef.current) return;

        const cleanCode = toLatinDigits(code).replace(/\D/g, "");

        if (cleanCode.length !== 6) {
            setErrorKey("invalid_code");
            return;
        }

        busyRef.current = true;
        setIsBusy(true);
        setErrorKey("");
        setNoticeKey("");

        try {
            const { ok, data } = await postJson("/api/auth/verify-code", {
                phone,
                code: cleanCode,
            });

            if (ok && data?.ok) {
                await onSuccess();
                onClose();
                return;
            }

            const error = data?.error;

            // کد دیگر قابل‌استفاده نیست؛ اجازه‌ی گرفتن کد تازه بدهیم
            if (
                error === "too_many_attempts" ||
                error === "expired" ||
                error === "no_code"
            ) {
                setCode("");
                setCountdown(0);
            }

            setErrorKey(ERROR_KEYS[error] || "generic");
        } catch {
            setErrorKey("network");
        } finally {
            busyRef.current = false;
            setIsBusy(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (step === "phone") {
            requestCode();
        } else {
            submitCode();
        }
    };

    const handleChangeNumber = () => {
        setStep("phone");
        setCode("");
        setCountdown(0);
        setErrorKey("");
        setNoticeKey("");
    };

    const inputClass =
        "w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3.5 text-sm text-coffee-dark outline-none transition placeholder:text-text-muted focus:border-coffee-brown focus:bg-white";

    return (
        <div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-coffee-deep/60 p-4 backdrop-blur-sm sm:items-center"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-title"
                dir={isRTL ? "rtl" : "ltr"}
                className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5 sm:p-8"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t("close")}
                    className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-cream hover:text-coffee-dark"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 6l12 12M18 6L6 18"
                        />
                    </svg>
                </button>

                <h2
                    id="login-title"
                    className="pe-10 text-xl font-bold text-coffee-dark sm:text-2xl"
                >
                    {t("title")}
                </h2>

                <form onSubmit={handleSubmit} noValidate className="mt-5">
                    {step === "phone" ? (
                        <>
                            <p className="text-sm leading-7 text-text-muted">
                                {t("phoneDescription")}
                            </p>

                            <label
                                htmlFor="login-phone"
                                className="mb-2 mt-5 block text-sm font-semibold text-coffee-dark"
                            >
                                {t("phoneLabel")}
                            </label>

                            <input
                                ref={inputRef}
                                id="login-phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                dir="ltr"
                                maxLength={16}
                                value={phone}
                                placeholder={t("phonePlaceholder")}
                                onChange={(event) => {
                                    setPhone(toLatinDigits(event.target.value));
                                    setErrorKey("");
                                }}
                                className={`${inputClass} text-start`}
                            />
                        </>
                    ) : (
                        <>
                            <p className="text-sm leading-7 text-text-muted">
                                {t("codeDescription")}
                            </p>

                            <div className="mt-2 flex items-center justify-between gap-3">
                                <bdi
                                    dir="ltr"
                                    className="text-sm font-bold text-coffee-dark"
                                >
                                    {phone}
                                </bdi>

                                <button
                                    type="button"
                                    onClick={handleChangeNumber}
                                    className="text-xs font-semibold text-gold transition hover:text-coffee-dark"
                                >
                                    {t("changeNumber")}
                                </button>
                            </div>

                            <label
                                htmlFor="login-code"
                                className="mb-2 mt-5 block text-sm font-semibold text-coffee-dark"
                            >
                                {t("codeLabel")}
                            </label>

                            <input
                                ref={inputRef}
                                id="login-code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                dir="ltr"
                                maxLength={6}
                                value={code}
                                onChange={(event) => {
                                    setCode(
                                        toLatinDigits(event.target.value)
                                            .replace(/\D/g, "")
                                            .slice(0, 6)
                                    );
                                    setErrorKey("");
                                }}
                                className={`${inputClass} text-center text-2xl font-bold tracking-[0.5em]`}
                            />
                        </>
                    )}

                    {noticeKey && !errorKey && (
                        <p
                            role="status"
                            className="mt-3 text-xs leading-6 text-text-muted"
                        >
                            {t(noticeKey)}
                        </p>
                    )}

                    {errorKey && (
                        <p
                            role="alert"
                            className="mt-3 text-xs leading-6 text-red-500"
                        >
                            {t(`errors.${errorKey}`)}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isBusy}
                        aria-busy={isBusy}
                        className="mt-6 w-full rounded-2xl bg-coffee-dark px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-coffee-brown active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                    >
                        {step === "phone"
                            ? isBusy
                                ? t("sending")
                                : t("sendCode")
                            : isBusy
                              ? t("verifying")
                              : t("verify")}
                    </button>

                    {step === "code" && (
                        <button
                            type="button"
                            onClick={requestCode}
                            disabled={isBusy || countdown > 0}
                            className="mt-3 w-full text-center text-sm font-semibold text-text-muted transition hover:text-coffee-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-text-muted"
                        >
                            {countdown > 0
                                ? t("resendIn", {
                                      seconds: formatNumber(countdown),
                                  })
                                : t("resend")}
                        </button>
                    )}
                </form>

                <p className="mt-6 border-t border-black/5 pt-4 text-xs leading-6 text-text-muted">
                    {t("optionalNote")}
                </p>
            </div>
        </div>
    );
}