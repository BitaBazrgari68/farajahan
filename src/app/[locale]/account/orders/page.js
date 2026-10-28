"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useReorder } from "@/hooks/useReorder";
const STATUS_STYLES = {
    processing: "bg-amber-50 text-amber-800 ring-amber-200",
    completed: "bg-green-50 text-green-800 ring-green-200",
};

export default function AccountOrdersPage() {
    const locale = useLocale();
    const t = useTranslations("account");
    const { status, isMember, openLogin } = useAuth();

    const isFa = locale === "fa";
    const isRTL = locale === "fa" || locale === "ar";
    const numberLocale = isFa ? "fa-IR" : "en-US";

    const [orders, setOrders] = useState(null);
    // idle | loading | done | error
    const [loadState, setLoadState] = useState("idle");






    const {
        reorder,
        reorderingId,
        error: reorderError,
        result: reorderResult,
    } = useReorder();

    const loadOrders = useCallback(async () => {
        setLoadState("loading");

        try {
            const response = await fetch("/api/account/orders", {
                cache: "no-store",
            });

            if (!response.ok) throw new Error("orders_failed");

            const data = await response.json();

            setOrders(Array.isArray(data.orders) ? data.orders : []);
            setLoadState("done");
        } catch {
            setLoadState("error");
        }
    }, []);

    useEffect(() => {
        if (isMember) {
            loadOrders();
        } else {
            // با خروج یا تعویض کاربر، فهرست کاربر قبلی نمایش داده نشود
            setOrders(null);
            setLoadState("idle");
        }
    }, [isMember, loadOrders]);

    const formatNumber = (value) =>
        Number(value).toLocaleString(numberLocale);

    const formatOrderNumber = (value) =>
        Number(value).toLocaleString(numberLocale, { useGrouping: false });

    const formatDate = (iso) => {
        if (!iso) return "";

        const date = new Date(iso);

        if (Number.isNaN(date.getTime())) return "";

        return new Intl.DateTimeFormat(numberLocale, {
            dateStyle: "medium",
        }).format(date);
    };

    const cardClass =
        "rounded-3xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-black/5";

    let content;

    if (status === "loading" || (isMember && loadState !== "done" && loadState !== "error")) {
        content = (
            <div role="status" className={cardClass}>
                <p className="text-sm text-text-muted">{t("loading")}</p>
            </div>
        );
    } else if (!isMember) {
        content = (
            <div className={cardClass}>
                <p className="text-sm leading-7 text-text-muted">
                    {t("loginPrompt")}
                </p>

                <button
                    type="button"
                    onClick={openLogin}
                    className="mt-6 rounded-2xl bg-coffee-dark px-6 py-3 text-sm font-bold text-white transition hover:bg-coffee-brown"
                >
                    {t("loginButton")}
                </button>
            </div>
        );
    } else if (loadState === "error") {
        content = (
            <div role="alert" className={cardClass}>
                <p className="text-sm leading-7 text-red-500">
                    {t("loadError")}
                </p>

                <button
                    type="button"
                    onClick={loadOrders}
                    className="mt-6 rounded-2xl border border-black/10 px-6 py-3 text-sm font-semibold text-coffee-dark transition hover:bg-cream"
                >
                    {t("retry")}
                </button>
            </div>
        );
    } else if (!orders || orders.length === 0) {
        content = (
            <div className={cardClass}>
                <p className="text-sm leading-7 text-text-muted">
                    {t("empty")}
                </p>

                <Link
                    href={`/${locale}/shop`}
                    className="mt-6 inline-flex rounded-2xl bg-coffee-dark px-6 py-3 text-sm font-bold text-white transition hover:bg-coffee-brown"
                >
                    {t("startShopping")}
                </Link>
            </div>
        );
    } else {
        content = (
            <div className="space-y-4">

                {reorderError && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700"
                    >
                        {t("reorderError")}
                    </div>
                )}

                {reorderResult && (
                    <div
                        role="status"
                        className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900"
                    >
                        <p className="font-semibold">{t("reorderSkippedTitle")}</p>

                        <ul className="mt-2 space-y-1">
                            {reorderResult.skipped.map((entry, index) => (
                                <li key={index}>
                                    {entry.name} ({t(`skippedReason.${entry.reason}`)})
                                </li>
                            ))}
                        </ul>

                        {reorderResult.added > 0 && (
                            <Link
                                href={`/${locale}/cart`}
                                className="mt-3 inline-flex rounded-xl bg-coffee-dark px-4 py-2 text-xs font-bold text-white transition hover:bg-coffee-brown"
                            >
                                {t("reorderGoToCart")}
                            </Link>
                        )}
                    </div>
                )}

                {orders.map((order) => (
                    <article
                        key={order.id}
                        className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-bold text-coffee-dark sm:text-lg">
                                    {t("orderNumber", {
                                        number: formatOrderNumber(
                                            order.number
                                        ),
                                    })}
                                </h2>

                                <p className="mt-1 text-xs text-text-muted">
                                    {formatDate(order.date)}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STATUS_STYLES[order.status] ||
                                    "bg-cream text-coffee-dark ring-black/10"
                                    }`}
                            >
                                {t(`status.${order.status}`)}
                            </span>
                        </div>

                        <ul className="mt-4 space-y-2 border-t border-black/5 pt-4">
                            {order.items.map((item, index) => (
                                <li
                                    key={`${order.id}-${index}`}
                                    className="flex items-start justify-between gap-4 text-sm text-coffee-dark"
                                >
                                    <span className="min-w-0">
                                        {item.name}
                                        {item.options?.length > 0 && (
                                            <span className="mt-0.5 block text-xs text-text-muted">
                                                {item.options.join(" / ")}
                                            </span>
                                        )}
                                    </span>

                                    <span className="shrink-0 text-text-muted">
                                        × {formatNumber(item.quantity)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                            <span className="text-sm text-text-muted">
                                {t("total")}
                            </span>

                            <span className="text-base font-extrabold text-coffee-dark">
                                {formatNumber(order.total)}{" "}
                                <span className="text-xs font-medium">
                                    {t("currency")}
                                </span>
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => reorder(order.id)}
                            disabled={Boolean(reorderingId)}
                            aria-busy={reorderingId === order.id}
                            className="mt-4 w-full rounded-2xl bg-coffee-dark px-5 py-3 text-sm font-bold text-white transition hover:bg-coffee-brown disabled:pointer-events-none disabled:opacity-50"
                        >
                            {reorderingId === order.id ? t("reordering") : t("reorder")}
                        </button>
                    </article>
                ))}

                <p className="px-1 text-xs leading-6 text-text-muted">
                    {t("note")}
                </p>
            </div>
        );
    }

    return (
        <main
            dir={isRTL ? "rtl" : "ltr"}
            className="min-h-screen bg-[#f7f4ee] px-4 py-10 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-8 text-2xl font-extrabold text-coffee-dark sm:text-3xl">
                    {t("ordersTitle")}
                </h1>

                {content}
            </div>
        </main>
    );
}