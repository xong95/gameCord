import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../config/firebase";

export function useAuth() {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (e) {
            console.error("로그인 실패:", e);
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    return { user, loading, login, logout };
}