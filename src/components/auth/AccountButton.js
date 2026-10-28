"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { User, LoaderCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useReorder } from "@/hooks/useReorder";

export default function AccountButton() {
    const locale = useLocale();
    const t = useTranslations("header");
    const tAuth = useTranslations("auth");
    const tAccount = useTranslations("account");

    const { status, mobile, isMember, openLogin, logout } = useAuth();
    const { reorder, reorderingId, error, result, reset } = useReorder();

    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // idle | loading | done | error
    const [lastState, setLastState] = useState("idle");
    const [lastOrder, setLastOrder] = useState(null);

    const wrapperRef = useRef(null);

    // بستن منو با کلیک بیرون یا Escape
    useEffect(() => {
        if (!menuOpen) return;

        const handlePointerDown = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [menuOpen]);

    // با خروج یا تعویض کاربر، سفارش کاربر قبلی نمایش داده نشود
    useEffect(() => {
        if (!isMember) {
            setLastOrder(null);
            setLastState("idle");
            setMenuOpen(false);
            reset();
        }
    }, [isMember, mobile, reset]);

    // آخرین سفارش فقط وقتی منو باز می‌شود گرفته می‌شود
    useEffect(() => {
        if (!menuOpen || !isMember) return;

        let cancelled = false;

        const load = async () => {
            setLastState("loading");

            try {
                const response = await fetch("/api/account/orders?limit=1", {
                    cache: "no-store",
                });

                if (!response.ok) throw new Error("orders_failed");

                const data = await response.json();

                if (cancelled) return;

                setLastOrder(data.orders?.[0] ?? null);
                setLastState("done");
            } catch {
                if (!cancelled) setLastState("error");
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [menuOpen, isMember, mobile]);

    const handleClick = () => {
        // تا مشخص نشدن وضعیت ورود، کاری نمی‌کنیم
        if (status === "loading") return;

        if (isMember) {
            setMenuOpen((current) => {
                if (current) reset();
                return !current;
            });
            return;
        }

        openLogin();
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);

        await logout();

        setIsLoggingOut(false);
        setMenuOpen(false);
    };

    const formatOrderNumber = (value) =>
        Number(value).toLocaleString(locale === "fa" ? "fa-IR" : "en-US", {
            useGrouping: false,
        });

    const formatCount = (value) =>
        Number(value).toLocaleString(locale === "fa" ? "fa-IR" : "en-US");

    const firstItem = lastOrder?.items?.[0];
    const moreCount = (lastOrder?.items?.length ?? 0) - 1;

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={handleClick}
                aria-label={t("account")}
                aria-haspopup={isMember ? "menu" : "dialog"}
                aria-expanded={isMember ? menuOpen : undefined}
                className="
                    relative
                    text-coffee-dark
                    transition-colors
                    duration-200
                    hover:text-gold
                "
            >
                <User size={21} strokeWidth={1.8} />

                {isMember && (
                    <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-gold"
                    />
                )}
            </button>

            {isMember && menuOpen && (
                <div
                    role="menu"
                    className="absolute end-0 top-full z-50 mt-3 w-64 rounded-xl border border-cream bg-background p-4 shadow-lg"
                >
                    <p className="text-xs text-text-muted">
                        {tAuth("signedInAs")}
                    </p>

                    <p className="mt-1 text-sm font-bold text-coffee-dark">
                        <bdi dir="ltr">{mobile}</bdi>
                    </p>

                    {/* آخرین سفارش */}
                    {lastState === "loading" && (
                        <div
                            role="status"
                            className="mt-4 flex h-[104px] items-center justify-center gap-2 rounded-xl bg-cream/60 text-xs font-medium text-text-muted"
                        >
                            <LoaderCircle
                                size={16}
                                className="animate-spin"
                                aria-hidden="true"
                            />
                            <span>{tAccount("loadingLastOrder")}</span>
                        </div>
                    )}

                    {lastState === "done" && lastOrder && firstItem && (
                        <div className="mt-4 rounded-xl border border-gold/40 bg-cream/40 p-3">
                            <p className="text-[11px] font-semibold text-text-muted">
                                {tAccount("lastOrder", {
                                    number: formatOrderNumber(
                                        lastOrder.number
                                    ),
                                })}
                            </p>

                            <p className="mt-1 line-clamp-1 text-sm font-bold text-coffee-dark">
                                {firstItem.name}
                            </p>

                            {moreCount > 0 && (
                                <p className="text-xs text-text-muted">
                                    {tAccount("andMore", {
                                        count: formatCount(moreCount),
                                    })}
                                </p>
                            )}

                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => reorder(lastOrder.id)}
                                disabled={Boolean(reorderingId)}
                                aria-busy={reorderingId === lastOrder.id}
                                className="mt-3 w-full rounded-xl bg-coffee-dark px-4 py-2.5 text-sm font-bold text-white transition hover:bg-coffee-brown disabled:pointer-events-none disabled:opacity-50"
                            >
                                {reorderingId === lastOrder.id
                                    ? tAccount("reordering")
                                    : tAccount("reorderLast")}
                            </button>

                            {error && (
                                <p
                                    role="alert"
                                    className="mt-2 text-xs leading-5 text-red-500"
                                >
                                    {tAccount("reorderError")}
                                </p>
                            )}

                            {result && (
                                <div
                                    role="status"
                                    className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs leading-5 text-amber-900"
                                >
                                    <p className="font-semibold">
                                        {tAccount("reorderSkippedTitle")}
                                    </p>

                                    <ul className="mt-1 space-y-0.5">
                                        {result.skipped.map((entry, index) => (
                                            <li key={index}>
                                                {entry.name} (
                                                {tAccount(
                                                    `skippedReason.${entry.reason}`
                                                )}
                                                )
                                            </li>
                                        ))}
                                    </ul>

                                    {result.added > 0 && (
                                        <Link
                                            href={`/${locale}/cart`}
                                            onClick={() => setMenuOpen(false)}
                                            className="mt-2 block rounded-lg bg-coffee-dark px-3 py-1.5 text-center font-bold text-white transition hover:bg-coffee-brown"
                                        >
                                            {tAccount("reorderGoToCart")}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {(lastState === "error" ||
                        (lastState === "done" && lastOrder)) && (
                            <Link
                                href={`/${locale}/account/orders`}
                                role="menuitem"
                                onClick={() => setMenuOpen(false)}
                                className="mt-4 block w-full rounded-xl bg-cream px-4 py-2.5 text-center text-sm font-semibold text-coffee-dark transition hover:bg-gold-light"
                            >
                                {tAccount("ordersLink")}
                            </Link>
                        )}

                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-2 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-coffee-dark transition hover:bg-cream disabled:opacity-50"
                    >
                        {isLoggingOut ? tAuth("loggingOut") : tAuth("logout")}
                    </button>
                </div>
            )}
        </div>
    );
}