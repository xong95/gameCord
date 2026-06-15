import React, { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import {
    subscribeRecords, subscribeInventory,
    getFavorites, saveFavorites,
} from "./db/index";
import Login      from "./pages/Login";
import HomeTab    from "./tabs/HomeTab";
import IncomeTab  from "./tabs/IncomeTab";
import ExpenseTab from "./tabs/ExpenseTab";
import ExchangeTab from "./tabs/ExchangeTab";
import AuctionTab from "./tabs/AuctionTab";
import RecordsTab from "./tabs/RecordsTab";
import StatsTab   from "./tabs/StatsTab";
import SettingsTab from "./tabs/SettingsTab";

// ── 테마 ──────────────────────────────────────
const THEMES = {
    dark: {
        bg:      "#0F0E17",
        card:    "#1A1828",
        border:  "#2A2740",
        text:    "#F0EEF6",
        sub:     "#7B78A8",
        charBg:  "#12111E",
        prevBg:  "#12111E",
    },
    light: {
        bg:      "#F4F3FA",
        card:    "#FFFFFF",
        border:  "#E2E0F0",
        text:    "#1A1828",
        sub:     "#7B78A8",
        charBg:  "#F0EEF6",
        prevBg:  "#F0EEF6",
    },
};

// ── 탭 목록 ───────────────────────────────────
const TABS = [
    ["home",     "🏠", "홈"],
    ["income",   "💰", "수익"],
    ["expense",  "💸", "지출"],
    ["exchange", "🔄", "환전"],
    ["auction",  "🏪", "경매장"],
    ["records",  "📋", "조회/수정"],
    ["stats",    "📊", "통계"],
    ["settings", "⚙️", "설정"],
];

export default function MapleTracker({ user, onLogin }) {
    const { loading, logout } = useAuth();

    const [darkMode,   setDarkMode]   = useState(true);
    const [tab,        setTab]        = useState("home");
    const [records,    setRecords]    = useState([]);
    const [inventory,  setInventory]  = useState([]);
    const [favorites,  setFavorites]  = useState([]);
    const [selChar,    setSelChar]    = useState(null);

    const T = THEMES[darkMode ? "dark" : "light"];

    // ── 데이터 구독 ───────────────────────────────
    useEffect(() => {
        if (!user) return;

        // 기록 구독
        const unsubRecords = subscribeRecords(user.uid, setRecords);

        // 인벤토리 구독
        const unsubInventory = subscribeInventory(user.uid, setInventory);

        // 즐겨찾기 로드
        getFavorites(user.uid).then(setFavorites);

        return () => {
            unsubRecords();
            unsubInventory();
        };
    }, [user]);

    // ── 캐릭터 검색 ───────────────────────────────
    const handleSearch = async (nickname) => {
        const FUNCTION_URL = import.meta.env.VITE_FUNCTION_URL;
        try {
            const res  = await fetch(`${FUNCTION_URL}?name=${encodeURIComponent(nickname)}`);
            const data = await res.json();
            if (data.error) return alert(data.error);
            setSelChar(data);
        } catch {
            alert("캐릭터 조회 실패");
        }
    };

    // ── 즐겨찾기 토글 ─────────────────────────────
    const handleFavoriteToggle = async (char) => {
        const exists = favorites.find(f => f.nickname === char.nickname);
        const updated = exists
            ? favorites.filter(f => f.nickname !== char.nickname)
            : [...favorites, char];
        await saveFavorites(user.uid, updated);
        setFavorites(updated);
    };

    // ── 로딩 중 ───────────────────────────────────
    if (loading) {
        return (
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100vh", background: THEMES.dark.bg,
                fontSize: 14, color: THEMES.dark.sub,
            }}>
                🍁 로딩 중...
            </div>
        );
    }

    // ── 로그인 전 ─────────────────────────────────
    if (!user) {
        return <Login onLogin={onLogin} theme={T} />;
    }

    // ── 탭 콘텐츠 ────────────────────────────────
    const tabContent = {
        home:     <HomeTab     T={T} user={user} records={records} favorites={favorites} inventory={inventory} onSearch={handleSearch} onSelectChar={setSelChar} onLoadInfo={handleSearch} />,
        income:   <IncomeTab   T={T} user={user} selectedChar={selChar} records={records} onSaved={() => {}} />,
        expense:  <ExpenseTab  T={T} user={user} selectedChar={selChar} favorites={favorites} onSaved={() => {}} />,
        exchange: <ExchangeTab T={T} user={user} selectedChar={selChar} favorites={favorites} onSaved={() => {}} />,
        auction:  <AuctionTab  T={T} user={user} inventory={inventory}  onSaved={() => {}} />,
        records:  <RecordsTab  T={T} user={user} records={records} favorites={favorites} />,
        stats:    <StatsTab    T={T} records={records} favorites={favorites} />,
        settings: <SettingsTab T={T} user={user} favorites={favorites} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} onSaved={() => getFavorites(user.uid).then(setFavorites)} />,
    };

    return (
        <div style={{ display: "flex", height: "100vh", background: T.bg, color: T.text, fontFamily: "Pretendard, sans-serif" }}>

            {/* ── 사이드바 ── */}
            <div style={{
                width: 200, flexShrink: 0,
                background: T.card, borderRight: `0.5px solid ${T.border}`,
                display: "flex", flexDirection: "column",
            }}>
                {/* 로고 */}
                <div style={{
                    padding: "20px 16px 16px",
                    borderBottom: `0.5px solid ${T.border}`,
                }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#534AB7" }}>🍁 파밍 트래커</div>
                    <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>
                        {user.displayName}
                    </div>
                </div>

                {/* 탭 메뉴 */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                    {TABS.map(([k, icon, label]) => (
                        <button key={k} onClick={() => setTab(k)} style={{
                            width: "100%", padding: "11px 16px",
                            background: tab === k ? "#534AB7" : "transparent",
                            color: tab === k ? "#fff" : T.sub,
                            border: "none", borderBottom: `0.5px solid ${T.border}`,
                            cursor: "pointer", textAlign: "left",
                            fontSize: 13, fontWeight: tab === k ? 500 : 400,
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <span style={{ fontSize: 15 }}>{icon}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* 로그아웃 */}
                <button onClick={logout} style={{
                    padding: "12px 16px",
                    background: "transparent", color: T.sub,
                    border: "none", borderTop: `0.5px solid ${T.border}`,
                    cursor: "pointer", textAlign: "left", fontSize: 12,
                }}>
                    🚪 로그아웃
                </button>
            </div>

            {/* ── 메인 콘텐츠 ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {tabContent[tab]}
            </div>
        </div>
    );
}