import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import MapleTracker from "./features/maple-tracker/index.jsx";

const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig, "gamecord");
const auth        = getAuth(firebaseApp);
const provider    = new GoogleAuthProvider();

const T = {
    bg:     "#0F0E17",
    card:   "#1A1828",
    border: "#2A2740",
    text:   "#F0EEF6",
    sub:    "#7B78A8",
};

const FEATURES = [
    { key: "maple-tracker", label: "🍁 파밍 트래커", owner: "정지원" },
    { key: "strengthen",    label: "⚒️ 강화 시뮬",   owner: "xong95" },
];

export default function App() {
    const [user,      setUser]      = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [page,      setPage]      = useState("home");
    const [hovered,   setHovered]   = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const login  = () => signInWithPopup(auth, provider);
    const logout = () => signOut(auth);

    if (loading) {
        return (
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100vh", background: T.bg, color: T.sub, fontSize: 14,
            }}>
                로딩 중...
            </div>
        );
    }

    const isHome = page === "home";
    // 홈이면 항상 펼침, 아니면 호버시만 펼침
    const expanded = isHome || hovered;
    const sideW = expanded ? 200 : 56;

    return (
        <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "Pretendard, sans-serif" }}>

            {/* ── 사이드바 ── */}
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    width: sideW,
                    flexShrink: 0,
                    background: T.card,
                    borderRight: `0.5px solid ${T.border}`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    transition: "width 0.25s ease",
                }}
            >
                {/* 로고 */}
                <div style={{
                    padding: "20px 16px 16px",
                    borderBottom: `0.5px solid ${T.border}`,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#534AB7" }}>
                        {expanded ? "🎮 gameCord" : "🎮"}
                    </div>
                    {expanded && (
                        <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>Desktop v1.0</div>
                    )}
                </div>

                {/* 홈 버튼 */}
                <button onClick={() => setPage("home")} style={{
                    width: "100%", padding: "12px 16px",
                    background: page === "home" ? "#534AB7" : "transparent",
                    color: page === "home" ? "#fff" : T.sub,
                    border: "none", borderBottom: `0.5px solid ${T.border}`,
                    cursor: "pointer", textAlign: "left", fontSize: 13,
                    display: "flex", alignItems: "center", gap: 8,
                    whiteSpace: "nowrap", overflow: "hidden",
                }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>🏠</span>
                    {expanded && <span>홈</span>}
                </button>

                {/* 기능 목록 */}
                <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                    {FEATURES.map(f => (
                        <button key={f.key} onClick={() => setPage(f.key)} style={{
                            width: "100%", padding: "12px 16px",
                            background: page === f.key ? "#534AB7" : "transparent",
                            color: page === f.key ? "#fff" : T.sub,
                            border: "none", borderBottom: `0.5px solid ${T.border}`,
                            cursor: "pointer", textAlign: "left", fontSize: 13,
                            display: "flex", alignItems: "center", gap: 8,
                            whiteSpace: "nowrap", overflow: "hidden",
                        }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>
                {f.label.split(" ")[0]}
              </span>
                            {expanded && (
                                <span>{f.label.split(" ").slice(1).join(" ")}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* 로그인/로그아웃 */}
                <div style={{ borderTop: `0.5px solid ${T.border}`, padding: expanded ? 12 : "12px 8px" }}>
                    {user ? (
                        <div>
                            {expanded && (
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    {user.photoURL && (
                                        <img src={user.photoURL} alt="프로필"
                                             style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} />
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 500, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {user.displayName}
                                        </div>
                                        <div style={{ fontSize: 10, color: T.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {!expanded && user.photoURL && (
                                <img src={user.photoURL} alt="프로필"
                                     style={{ width: 32, height: 32, borderRadius: "50%", display: "block", margin: "0 auto 8px" }} />
                            )}
                            <button onClick={logout} style={{
                                width: "100%", padding: "7px 0",
                                background: "transparent", color: T.sub,
                                border: `0.5px solid ${T.border}`, borderRadius: 8,
                                cursor: "pointer", fontSize: expanded ? 12 : 16,
                            }}>
                                {expanded ? "🚪 로그아웃" : "🚪"}
                            </button>
                        </div>
                    ) : (
                        <button onClick={login} style={{
                            width: "100%", padding: "10px 0",
                            background: "#534AB7", color: "#fff",
                            border: "none", borderRadius: 8,
                            cursor: "pointer", fontSize: expanded ? 13 : 16, fontWeight: 600,
                        }}>
                            {expanded ? "🔐 Google 로그인" : "🔐"}
                        </button>
                    )}
                </div>
            </div>

            {/* ── 메인 콘텐츠 ── */}
            <div style={{ flex: 1, overflow: "hidden" }}>

                {/* 홈 */}
                {page === "home" && (
                    <div style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        height: "100%", gap: 32, padding: 40,
                    }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: T.text, marginBottom: 8 }}>
                                gameCord
                            </div>
                            <div style={{ fontSize: 14, color: T.sub }}>
                                왼쪽 메뉴에서 기능을 선택해주세요
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                            {FEATURES.map(f => (
                                <div key={f.key} onClick={() => setPage(f.key)} style={{
                                    background: T.card, border: `0.5px solid ${T.border}`,
                                    borderRadius: 16, padding: "24px 32px",
                                    cursor: "pointer", textAlign: "center", minWidth: 160,
                                }}
                                     onMouseEnter={e => e.currentTarget.style.borderColor = "#534AB7"}
                                     onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                                >
                                    <div style={{ fontSize: 32, marginBottom: 10 }}>{f.label.split(" ")[0]}</div>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>
                                        {f.label.split(" ").slice(1).join(" ")}
                                    </div>
                                    <div style={{ fontSize: 11, color: T.sub }}>by {f.owner}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 파밍 트래커 */}
                {page === "maple-tracker" && (
                    <MapleTracker user={user} onLogin={login} />
                )}

                {/* 강화 시뮬 */}
                {page === "strengthen" && (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        height: "100%", flexDirection: "column", gap: 12,
                    }}>
                        <div style={{ fontSize: 32 }}>⚒️</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: T.text }}>강화 시뮬레이터</div>
                        <div style={{ fontSize: 13, color: T.sub }}>개발 중입니다...</div>
                    </div>
                )}
            </div>
        </div>
    );
}