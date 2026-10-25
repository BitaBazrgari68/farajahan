"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AccountButton() {
    const t = useTranslations("header");
    const tAuth = useTranslations("auth");

    const { status, mobile, isMember, openLogin, logout } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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

    const handleClick = () => {
        // تا مشخص نشدن وضعیت ورود، کاری نمی‌کنیم
        if (status === "loading") return;

        if (isMember) {
            setMenuOpen((current) => !current);
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
                    className="absolute end-0 top-full z-50 mt-3 w-56 rounded-xl border border-cream bg-background p-4 shadow-lg"
                >
                    <p className="text-xs text-text-muted">
                        {tAuth("signedInAs")}
                    </p>

                    <p className="mt-1 text-sm font-bold text-coffee-dark">
                        <bdi dir="ltr">{mobile}</bdi>
                    </p>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-4 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-coffee-dark transition hover:bg-cream disabled:opacity-50"
                    >
                        {isLoggingOut ? tAuth("loggingOut") : tAuth("logout")}
                    </button>
                </div>
            )}
        </div>
    );
}