"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useCartSync } from "@/hooks/useCartSync";
import { IRAN_PROVINCES } from "@/data/iranProvinces";
import { use, useEffect, useState, useRef } from "react";
import { usePaidOrderCleanup } from "@/hooks/usePaidOrderCleanup";
import {
    loadCheckoutForm,
    saveCheckoutForm,
    clearCheckoutForm,
} from "@/lib/checkoutFormStorage";
const toLatinDigits = (value) =>
    String(value ?? "")
        .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
        .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

export default function CheckoutPage({ params }) {
    const { locale } = use(params);

    const items = useCartStore((state) => state.items);
    const { cart, isSyncing, error, retry } = useCartSync();
    const {
        isChecking: isCheckingOrder,
        clearedOrderId,
        checkFailed,
    } = usePaidOrderCleanup();
    const totals = cart?.totals;
    const fromMinor = (value) => value / 10 ** (totals?.minorUnit ?? 0);

    const syncedByKey = new Map(
        (cart?.items ?? []).map((i) => [
            `${i.productId}:${i.variationId || 0}`,
            i,
        ])
    );

    const [localRates, setLocalRates] = useState(null);
    const [isSelectingRate, setIsSelectingRate] = useState(false);
    const [shippingError, setShippingError] = useState(false);

    // با هر Sync جدید، پاسخ Woo جایگزین انتخاب محلی می‌شود
    useEffect(() => {
        setLocalRates(null);
    }, [cart]);

    const shippingPackage = (localRates ?? cart?.shippingRates ?? [])[0];
    const shippingOptions = shippingPackage?.rates ?? [];
    const selectedRate = shippingOptions.find((r) => r.selected);
    const SHIPPING_NAMES_EN = {
        "flat_rate:5": "Post",
        "flat_rate:6": "Freight",
    };

    // نام Woo شامل توضیح داخل پرانتز است («پست (پس کرایه محاسبه می شود)»)؛ فقط نام روش را نگه می‌داریم
    const shippingMethodName = selectedRate
        ? locale === "fa"
            ? selectedRate.name.replace(/\s*\(.*\)\s*$/, "").trim() ||
            selectedRate.name
            : SHIPPING_NAMES_EN[selectedRate.rateId] ||
            selectedRate.name.replace(/\s*\(.*\)\s*$/, "").trim()
        : "";

    const hasShippingCost = Boolean(totals) && totals.shipping > 0;
    const handleSelectRate = async (rateId) => {
        if (isSelectingRate || rateId === selectedRate?.rateId) return;

        setIsSelectingRate(true);
        setShippingError(false);

        try {
            const response = await fetch("/api/woocommerce/cart/shipping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId: shippingPackage.packageId,
                    rateId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "shipping_failed");
            }

            setLocalRates(data.shippingRates);
        } catch (err) {
            console.error("Select shipping failed:", err);
            setShippingError(true);
        } finally {
            setIsSelectingRate(false);
        }
    };
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        state: "",
        city: "",
        address: "",
        postcode: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [repeatPrompt, setRepeatPrompt] = useState(null);
    const confirmRepeatRef = useRef(false);

    const [formReady, setFormReady] = useState(false);
    const restoredRef = useRef(false);

    // بازیابی فرم بعد از mount (نه در state اولیه، تا با رندر سرور ناسازگار نشود)
    useEffect(() => {
        if (restoredRef.current) return;
        restoredRef.current = true;

        const saved = loadCheckoutForm();

        if (saved) {
            setForm((current) => ({ ...current, ...saved }));
        }

        setFormReady(true);
    }, []);

    // ذخیره فقط بعد از پایان بازیابی، تا فرم خالی اولیه داده‌ی ذخیره‌شده را پاک نکند
    useEffect(() => {
        if (!formReady) return;

        saveCheckoutForm(form);
    }, [form, formReady]);
    const submittingRef = useRef(false);

    // بازگشت با دکمه‌ی برگشت مرورگر: قفل «در حال ثبت» را باز کن
    useEffect(() => {
        const handlePageShow = (event) => {
            if (event.persisted) {
                submittingRef.current = false;
                setIsSubmitting(false);
            }
        };

        window.addEventListener("pageshow", handlePageShow);

        return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);

    const totalItems = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
    const displaySubtotal = totals ? fromMinor(totals.subtotal) : subtotal;
    const displayTotal = totals ? fromMinor(totals.total) : subtotal;
    const canSubmit = Boolean(totals) && !isSyncing && !error && !isSelectingRate && !isCheckingOrder && Boolean(selectedRate);

    const isRTL = locale === "fa" || locale === "ar";

    const formatPrice = (price) => {
        return price.toLocaleString(
            locale === "fa" ? "fa-IR" : "en-US"
        );
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((current) => ({
                ...current,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();
        const phone = toLatinDigits(form.phone).trim();
        const email = form.email.trim();
        const state = form.state.trim();
        const city = form.city.trim();
        const address = form.address.trim();
        const postcode = toLatinDigits(form.postcode).trim();

        if (!firstName) {
            newErrors.firstName =
                locale === "fa"
                    ? "لطفاً نام خود را وارد کنید."
                    : "Please enter your first name.";
        }

        if (!lastName) {
            newErrors.lastName =
                locale === "fa"
                    ? "لطفاً نام خانوادگی خود را وارد کنید."
                    : "Please enter your last name.";
        }

        if (!phone) {
            newErrors.phone =
                locale === "fa"
                    ? "لطفاً شماره موبایل خود را وارد کنید."
                    : "Please enter your mobile number.";
        } else {
            const normalizedPhone = phone.replace(
                /[\s-]/g,
                ""
            );

            const iranPhoneRegex =
                /^(?:\+98|0098|0)?9\d{9}$/;

            if (!iranPhoneRegex.test(normalizedPhone)) {
                newErrors.phone =
                    locale === "fa"
                        ? "شماره موبایل وارد شده معتبر نیست."
                        : "Please enter a valid mobile number.";
            }
        }

        if (email) {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                newErrors.email =
                    locale === "fa"
                        ? "فرمت ایمیل صحیح نیست."
                        : "Please enter a valid email address.";
            }
        }

        if (!state) {
            newErrors.state =
                locale === "fa"
                    ? "لطفاً استان را انتخاب کنید."
                    : "Please select your state or province.";
        }

        if (!city) {
            newErrors.city =
                locale === "fa"
                    ? "لطفاً شهر را وارد کنید."
                    : "Please enter your city.";
        }

        if (!address) {
            newErrors.address =
                locale === "fa"
                    ? "لطفاً آدرس کامل خود را وارد کنید."
                    : "Please enter your full address.";
        } else if (address.length < 10) {
            newErrors.address =
                locale === "fa"
                    ? "آدرس وارد شده خیلی کوتاه است."
                    : "Please enter a more complete address.";
        }

        if (!postcode) {
            newErrors.postcode =
                locale === "fa"
                    ? "لطفاً کد پستی را وارد کنید."
                    : "Please enter your postal code.";
        } else {
            const normalizedPostcode = postcode.replace(
                /\s/g,
                ""
            );

            if (!/^\d{10}$/.test(normalizedPostcode)) {
                newErrors.postcode =
                    locale === "fa"
                        ? "کد پستی باید ۱۰ رقم باشد."
                        : "Postal code must contain 10 digits.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // ref بلافاصله عوض می‌شود، برخلاف state؛ جلوی دوبار کلیک سریع را می‌گیرد
        if (submittingRef.current || !canSubmit) return;
        if (!validateForm()) return;

        submittingRef.current = true;
        setIsSubmitting(true);
        setSubmitError("");
        const confirmRepeat = confirmRepeatRef.current;
        confirmRepeatRef.current = false;
        try {
            const response = await fetch("/api/woocommerce/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    confirmRepeat,
                    items: items.map((i) => ({
                        productId: i.productId,
                        variationId: i.variationId || 0,
                        quantity: i.quantity,
                    })),
                }),
            });

            const data = await response.json();

            if (response.ok && data.redirectUrl) {
                // سبد Zustand عمداً پاک نمی‌شود؛ فقط بعد از تأیید پرداخت.
                // قفل عمداً باز نمی‌شود؛ فقط pageshow آن را باز می‌کند.
                window.location.href = data.redirectUrl;
                return;
            }

            if (response.ok) {
                // سفارش ساخته شده ولی نشانی درگاه نیامده؛ قفل می‌ماند تا سفارش تکراری نسازیم
                setSubmitError(
                    locale === "fa"
                        ? `سفارش شما با شماره ${data.orderId} ثبت شد، ولی انتقال به درگاه پرداخت انجام نشد. لطفاً با پشتیبانی تماس بگیرید.`
                        : `Your order #${data.orderId} was created, but we couldn't send you to the payment gateway. Please contact support.`
                );
                return;
            }

            if (data.error === "already_paid") {
                setRepeatPrompt({ orderId: data.orderId });
            } else if (data.error === "cart_changed") {
                setErrors(
                    Object.fromEntries(
                        data.fields.map((f) => [
                            f,
                            locale === "fa"
                                ? "این فیلد معتبر نیست."
                                : "This field is invalid.",
                        ])
                    )
                );
            } else {
                setSubmitError(
                    locale === "fa"
                        ? "ثبت سفارش انجام نشد. دوباره تلاش کنید."
                        : "Couldn't place your order. Please try again."
                );
            }
        } catch (err) {
            console.error("Checkout request failed:", err);
            setSubmitError(
                locale === "fa"
                    ? "ثبت سفارش انجام نشد. دوباره تلاش کنید."
                    : "Couldn't place your order. Please try again."
            );
        }

        submittingRef.current = false;
        setIsSubmitting(false);
    };
    const handleConfirmRepeat = () => {
        confirmRepeatRef.current = true;
        setRepeatPrompt(null);
        handleSubmit({ preventDefault() { } });
    };

    const handleClearCart = () => {
        setRepeatPrompt(null);
        useCartStore.getState().setItems([]);
        clearCheckoutForm();
    };
    if (items.length === 0) {
        return (
            <main
                dir={isRTL ? "rtl" : "ltr"}
                className="min-h-screen bg-[#f7f4ee] px-4 py-16"
            >
                {clearedOrderId && (
                    <div
                        role="status"
                        className="mx-auto mb-6 max-w-2xl rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-sm leading-7 text-green-900"
                    >
                        {locale === "fa"
                            ? `سفارش شماره‌ی ${Number(
                                clearedOrderId
                            ).toLocaleString("fa-IR", {
                                useGrouping: false,
                            })} پرداخت شده بود و سبد خرید پاک شد.`
                            : `Order #${clearedOrderId} was already paid, so your cart was cleared.`}
                    </div>
                )}
                <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5">
                    <h1 className="text-2xl font-bold text-coffee-dark">
                        {locale === "fa"
                            ? "سبد خرید شما خالی است"
                            : "Your cart is empty"}
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-text-muted">
                        {locale === "fa"
                            ? "برای ادامه فرایند پرداخت ابتدا محصولی به سبد خرید اضافه کنید."
                            : "Add a product to your cart before continuing to checkout."}
                    </p>

                    <Link
                        href={`/${locale}/shop`}
                        className="mt-8 rounded-2xl bg-coffee-dark px-6 py-3 text-sm font-bold text-white transition hover:bg-coffee"
                    >
                        {locale === "fa"
                            ? "ادامه خرید"
                            : "Continue Shopping"}
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main
            dir={isRTL ? "rtl" : "ltr"}
            className="min-h-screen bg-[#f7f4ee] px-4 py-10 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-7xl">
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-coffee-dark sm:text-4xl">
                        {locale === "fa"
                            ? "تکمیل سفارش"
                            : "Checkout"}
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-text-muted">
                        {locale === "fa"
                            ? "اطلاعات خود را وارد کنید تا سفارش شما ثبت شود."
                            : "Enter your information to complete your order."}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="grid gap-8 lg:grid-cols-[1fr_400px]"
                >
                    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
                        <div className="mb-7">
                            <h2 className="text-xl font-bold text-coffee-dark">
                                {locale === "fa"
                                    ? "اطلاعات مشتری"
                                    : "Customer Information"}
                            </h2>

                            <p className="mt-2 text-sm text-text-muted">
                                {locale === "fa"
                                    ? "لطفاً اطلاعات تماس و آدرس خود را وارد کنید."
                                    : "Please enter your contact and shipping information."}
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="mb-2 block text-sm font-semibold text-coffee-dark"
                                >
                                    {locale === "fa"
                                        ? "نام"
                                        : "First name"}
                                </label>

                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    autoComplete="given-name"
                                    className={`w-full rounded-2xl border bg-[#faf9f6] px-4 py-3.5 text-sm text-coffee-dark outline-none transition placeholder:text-text-muted focus:bg-white ${errors.firstName
                                        ? "border-red-400 focus:border-red-500"
                                        : "border-black/10 focus:border-coffee"
                                        }`}
                                />

                                {errors.firstName && (
                                    <p className="mt-2 text-xs leading-5 text-red-500">
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="mb-2 block text-sm font-semibold text-coffee-dark"
                                >
                                    {locale === "fa"
                                        ? "نام خانوادگی"
                                        : "Last name"}
                                </label>

                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    autoComplete="family-name"
                                    className={`w-full rounded-2xl border bg-[#faf9f6] px-4 py-3.5 text-sm text-coffee-dark outline-none transition placeholder:text-text-muted focus:bg-white ${errors.lastName
                                        ? "border-red-400 focus:border-red-500"
                                        : "border-black/10 focus:border-coffee"
                                        }`}
                                />

                                {errors.lastName && (
                                    <p className="mt-2 text-xs leading-5 text-red-500">
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-semibold text-coffee-dark"
                                >
                                    {locale === "fa"
                                        ? "شماره موبایل"
                                        : "Mobile number"}
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    inputMode="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    autoComplete="tel"
                                    placeholder={
                                        locale === "fa"
                                            ? "0912..."
                                            : "+98..."
                                    }
                                    className={`w-full rounded-2xl border bg-[#faf9f6] px-4 py-3.5 text-sm text-coffee-dark outline-none transition placeholder:text-text-muted focus:bg-white ${errors.phone
                                        ? "border-red-400 focus:border-red-500"
                                        : "border-black/10 focus:border-coffee"
                                        }`}
                                />

                                {errors.phone && (
                                    <p className="mt-2 text-xs leading-5 text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-coffee-dark"
                                >
                                    {locale === "fa"
                                        ? "ایمیل (اختیاری)"
                                        : "Email (Optional)"}
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    placeholder="example@email.com"
                                    className={`w-full rounded-2xl border bg-[#faf9f6] px-4 py-3.5 text-sm text-coffee-dark outline-none transition placeholder:text-text-muted focus:bg-white ${errors.email
                                        ? "border-red-400 focus:border-red-500"
                                        : "border-black/10 focus:border-coffee"
                                        }`}
                                />

                                {errors.email && (
                                    <p className="mt-2 text-xs leading-5 text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="state"
                                    className="mb-2 block text-sm font-semibold text-coffee-dark"
                                >
                                    {locale === "fa"
                                        ? "استان"
                                        : "State / Province"}
                                </label>

                                <select
                                    id="state"
                                    name="state"
                                    value={form.state}
                                    onChange={handleChange}
                                    autoComplete="address-level1"
                                    className={`w-full rounded-2xl border bg-[#faf9f6] px-4 py-3.5 text-sm text-coffee-dark outline-none transition focus:bg-white ${errors.state
                                        ? "border-red-400 focus:border-red-500"
                                        : "border-black/10 focus:border-coffee"
                                        }`}
                                >
                                    <option value="">
                                        {locale === "fa"
                                            ? "انتخاب استان"
                                            : "Select a province"}
                                    </option>

                                    {IRAN_PROVINCES.map((province) => (
                                        <option
                                            key={province.code}
                                            value={province.code}
                                        >
                                            {locale === "fa"
                                                ? province.fa
                                                : province.en}
                                        </option>
                                    ))}
                                </select>

                                {errors.state && (
                                    <p className="mt-2 text-xs leading-5 text-red-500">
                                        {errors.state}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="city"
                                    className="mb-2 block text-sm font-semibold text-coffee-dark"
                                >
                                    {locale === "fa"
                                        ? "شهر"
                                        : "City"}
                                </label>

                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={form.city}
                                    onChange={handleChange}
                                    autoComplete="address-level2"
                                    className={`w-full rounded-2xl border bg-[#faf9f6] px-4 py-3.5 text-sm text-coffee-dark outline-none transition placeholder:text-text-muted focus:bg-white ${errors.city
                                        ? "border-red-400 focus:border-red-500"
                                        : "border-black/10 focus:border-coffee"
                                        }`}
                                />

                                {errors.city && (
                                    <p className="mt-2 text-xs leading-5 text-red-500">
                                        {errors.city}
                                    </p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="address"
                                    className="mb-2 block text-sm font-semibold text-coffee-dark"
                                >
                                    {locale === "fa"
                                        ? "آدرس"
                                        : "Address"}
                                </label>

                                <textarea
                                    id="address"
                                    name="address"
                                    rows={4}
                                    value={form.address}
                                    onChange={handleChange}
                                    autoComplete="street-address"
                                    className={`w-full resize-none rounded-2xl border bg-[#faf9f6] px-4 py-3.5 text-sm leading-7 text-coffee-dark outline-none transition placeholder:text-text-muted focus:bg-white ${errors.address
                                        ? "border-red-400 focus:border-red-500"
                                        : "border-black/10 focus:border-coffee"
                                        }`}
                                />

                                {errors.address && (
                                    <p className="mt-2 text-xs leading-5 text-red-500">
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="postcode"
                                    className="mb-2 block text-sm font-semibold text-coffee-dark"
                                >
                                    {locale === "fa"
                                        ? "کد پستی"
                                        : "Postal code"}
                                </label>

                                <input
                                    id="postcode"
                                    name="postcode"
                                    type="text"
                                    inputMode="numeric"
                                    value={form.postcode}
                                    onChange={handleChange}
                                    autoComplete="postal-code"
                                    className={`w-full rounded-2xl border bg-[#faf9f6] px-4 py-3.5 text-sm text-coffee-dark outline-none transition placeholder:text-text-muted focus:bg-white ${errors.postcode
                                        ? "border-red-400 focus:border-red-500"
                                        : "border-black/10 focus:border-coffee"
                                        }`}
                                />

                                {errors.postcode && (
                                    <p className="mt-2 text-xs leading-5 text-red-500">
                                        {errors.postcode}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="mt-8 border-t border-black/5 pt-7">
                            <h3 className="text-base font-bold text-coffee-dark">
                                {locale === "fa" ? "روش ارسال" : "Shipping method"}
                            </h3>

                            {shippingOptions.length === 0 ? (
                                <p className="mt-3 text-xs text-text-muted">
                                    {isSyncing
                                        ? locale === "fa"
                                            ? "در حال بررسی روش‌های ارسال…"
                                            : "Checking shipping methods…"
                                        : locale === "fa"
                                            ? "روش ارسالی در دسترس نیست."
                                            : "No shipping method available."}
                                </p>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {shippingOptions.map((rate) => (
                                        <label
                                            key={rate.rateId}
                                            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition ${rate.selected
                                                ? "border-coffee bg-[#faf9f6]"
                                                : "border-black/10"
                                                } ${isSyncing || isSelectingRate ? "opacity-60" : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                name="shippingRate"
                                                value={rate.rateId}
                                                checked={rate.selected}
                                                disabled={isSyncing || isSelectingRate}
                                                onChange={() => handleSelectRate(rate.rateId)}
                                            />

                                            <span className="font-semibold text-coffee-dark">
                                                {rate.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {shippingError && (
                                <p className="mt-3 text-xs text-red-500">
                                    {locale === "fa"
                                        ? "انتخاب روش ارسال ثبت نشد. دوباره تلاش کنید."
                                        : "Couldn't save your shipping choice. Try again."}
                                </p>
                            )}
                        </div>

                    </section>

                    <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7 lg:sticky lg:top-6">
                        <h2 className="text-xl font-bold text-coffee-dark">
                            {locale === "fa"
                                ? "خلاصه سفارش"
                                : "Order Summary"}
                        </h2>

                        <div className="mt-6 space-y-4">
                            {items.map((item) => {
                                const synced = syncedByKey.get(
                                    `${item.productId}:${item.variationId || 0}`
                                );
                                const unitPrice = synced
                                    ? fromMinor(synced.price)
                                    : item.price;

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-start justify-between gap-4 border-b border-black/5 pb-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="line-clamp-2 text-sm font-semibold leading-6 text-coffee-dark">
                                                {item.name?.[locale] ||
                                                    item.name?.fa ||
                                                    item.name?.en}
                                            </p>
                                            {item.variationLabel && (
                                                <p className="mt-0.5 text-xs text-text-muted">
                                                    {item.variationLabel}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-text-muted">
                                                {item.quantity} × {formatPrice(unitPrice)}
                                            </p>
                                        </div>

                                        <span className="shrink-0 text-sm font-bold text-coffee-dark">
                                            {formatPrice(unitPrice * item.quantity)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">
                                    {locale === "fa"
                                        ? "تعداد کالا"
                                        : "Items"}
                                </span>

                                <span className="font-semibold text-coffee-dark">
                                    {totalItems}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">
                                    {locale === "fa"
                                        ? "جمع محصولات"
                                        : "Subtotal"}
                                </span>

                                <span className="font-semibold text-coffee-dark">
                                    {formatPrice(displaySubtotal)}
                                </span>
                            </div>

                            <div className="text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-text-muted">
                                        {locale === "fa" ? "ارسال" : "Shipping"}
                                    </span>

                                    <span className="text-end font-semibold text-coffee-dark">
                                        {hasShippingCost
                                            ? formatPrice(fromMinor(totals.shipping))
                                            : `${shippingMethodName ? `${shippingMethodName} · ` : ""}${locale === "fa" ? "پس‌کرایه" : "Pay on delivery"
                                            }`}
                                    </span>
                                </div>

                                {!hasShippingCost && (
                                    <p className="mt-1.5 text-xs leading-6 text-text-muted">
                                        {locale === "fa"
                                            ? "هزینه‌ی ارسال الان دریافت نمی‌شود و هنگام تحویل بسته، طبق تعرفه‌ی پست یا باربری، مستقیماً به آن‌ها پرداخت می‌شود."
                                            : "Shipping isn't charged now. You pay the carrier directly on delivery, based on their rates."}
                                    </p>
                                )}
                            </div>
                            <div className="border-t border-black/10 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-coffee-dark">
                                        {locale === "fa"
                                            ? "مبلغ قابل پرداخت"
                                            : "Total"}
                                    </span>

                                    <div className="text-end">
                                        <span className="text-xl font-extrabold text-coffee-dark">
                                            {formatPrice(displayTotal)}
                                        </span>

                                        <span className="ms-1 text-xs text-text-muted">
                                            {locale === "fa"
                                                ? "تومان"
                                                : "Toman"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isSyncing && (
                            <p className="mt-6 text-xs text-text-muted">
                                {locale === "fa"
                                    ? "در حال بررسی قیمت و موجودی…"
                                    : "Checking prices and availability…"}
                            </p>
                        )}

                        {error && !isSyncing && (
                            <button
                                type="button"
                                onClick={retry}
                                className="mt-6 text-xs font-medium text-red-500 hover:text-red-700"
                            >
                                {locale === "fa"
                                    ? "بررسی سبد انجام نشد. دوباره تلاش کنید"
                                    : "Couldn't check your cart. Try again"}
                            </button>
                        )}
                        {repeatPrompt && (
                            <div
                                role="alertdialog"
                                className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900"
                            >
                                <p>
                                    {locale === "fa"
                                        ? `سفارشی با همین اقلام (شماره‌ی ${Number(
                                            repeatPrompt.orderId
                                        ).toLocaleString("fa-IR", {
                                            useGrouping: false,
                                        })}) قبلاً پرداخت شده است. می‌خواهید دوباره سفارش دهید؟`
                                        : `An order with the same items (#${repeatPrompt.orderId}) was already paid. Do you want to order again?`}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={handleConfirmRepeat}
                                        className="rounded-xl bg-coffee-dark px-4 py-2 text-xs font-bold text-white transition hover:bg-coffee"
                                    >
                                        {locale === "fa"
                                            ? "ادامه و ثبت دوباره"
                                            : "Continue and place again"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleClearCart}
                                        className="rounded-xl border border-black/10 px-4 py-2 text-xs font-semibold text-coffee-dark transition hover:bg-cream"
                                    >
                                        {locale === "fa"
                                            ? "پاک‌کردن سبد"
                                            : "Clear cart"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {checkFailed && (
                            <p
                                role="status"
                                className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900"
                            >
                                {locale === "fa"
                                    ? "وضعیت سفارش قبلی شما بررسی نشد. اگر قبلاً همین سفارش را پرداخت کرده‌اید، دوباره ثبت نکنید."
                                    : "We couldn't check your previous order. If you already paid for it, please don't place it again."}
                            </p>
                        )}
                        {submitError && (
                            <p
                                role="alert"
                                className="mt-6 text-xs leading-6 text-red-500"
                            >
                                {submitError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            aria-busy={isSubmitting}
                            className="mt-7 w-full rounded-2xl bg-coffee-dark px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-coffee active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                        >
                            {isSubmitting
                                ? locale === "fa"
                                    ? "در حال ثبت سفارش…"
                                    : "Placing order…"
                                : locale === "fa"
                                    ? "ثبت سفارش و ادامه پرداخت"
                                    : "Place Order & Continue"}
                        </button>

                        {isSubmitting && (
                            <p
                                role="status"
                                className="mt-3 text-center text-xs leading-6 text-text-muted"
                            >
                                {locale === "fa"
                                    ? "لطفاً صبر کنید. در حال انتقال به درگاه پرداخت هستیم و این کار چند ثانیه طول می‌کشد. صفحه را نبندید."
                                    : "Please wait. We're taking you to the payment gateway, which can take a few seconds. Don't close this page."}
                            </p>
                        )}

                        <Link
                            href={`/${locale}/cart`}
                            className="mt-3 block text-center text-sm font-semibold text-text-muted transition hover:text-coffee-dark"
                        >
                            {locale === "fa"
                                ? "بازگشت به سبد خرید"
                                : "Back to Cart"}
                        </Link>
                    </aside>
                </form>
            </div>
        </main>
    );
}