"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import LoginModal from "@/components/auth/LoginModal";

const AuthContext = createContext(null);

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}

export default function AuthProvider({ children }) {
    // loading | guest | member
    const [status, setStatus] = useState("loading");
    const [mobile, setMobile] = useState(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const refresh = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/me", {
                cache: "no-store",
            });

            const data = await response.json();

            if (data?.loggedIn) {
                setStatus("member");
                setMobile(data.mobile);
            } else {
                setStatus("guest");
                setMobile(null);
            }
        } catch {
            // خطای شبکه: وضعیت قبلی را نگه می‌داریم، مگر اینکه هنوز نمی‌دانستیم
            setStatus((current) =>
                current === "loading" ? "guest" : current
            );
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const openLogin = useCallback(() => setIsLoginOpen(true), []);
    const closeLogin = useCallback(() => setIsLoginOpen(false), []);

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // اگر درخواست نرسید، refresh وضعیت واقعی را نشان می‌دهد
        }

        await refresh();
    }, [refresh]);

    const value = useMemo(
        () => ({
            status,
            mobile,
            isMember: status === "member",
            openLogin,
            closeLogin,
            refresh,
            logout,
        }),
        [status, mobile, openLogin, closeLogin, refresh, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}

            {isLoginOpen && (
                <LoginModal onClose={closeLogin} onSuccess={refresh} />
            )}
        </AuthContext.Provider>
    );
}