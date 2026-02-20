"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import type { User } from "@/types/Auth";

export function useAuth() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            router.push("/login");
            return;
        }
        setToken(storedToken);

        getCurrentUser(storedToken)
            .then((u) => {
                if (!u) {
                    localStorage.removeItem("token");
                    router.push("/login");
                } else {
                    setUser(u);
                }
            })
            .catch(() => {
                localStorage.removeItem("token");
                router.push("/login");
            })
            .finally(() => setLoading(false));
    }, [router]);

    const logout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return { token, user, loading, logout };
}
