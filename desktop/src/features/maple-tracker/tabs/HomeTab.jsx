import React, { useState } from "react";
import { fmt } from "../utils/format";

export default function HomeTab({
                                    T, user, records, favorites, inventory,
                                    onSearch, onSelectChar, onLoadInfo,
                                }) {
    const [searchInput, setSearchInput] = useState("");

    // 오늘 날짜
    const today = new Date().toISOString().slice(0, 10);

    // 오늘 수익 합계
    const todayIncome = records
        .filter(r => r.kind === "income" && r.date === today)
        .reduce((sum, r) => sum + (r.totalIncome || 0), 0);

    // 오늘 지출 합계
    const todayExpense = records
        .filter(r => r.kind === "expense" && r.date === today)
        .reduce((sum, r) => sum + (r.meso || 0), 0);

    // 이번 주 수익
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);
    const weekIncome = records
        .filter(r => r.kind === "income" && r.date >= weekAgoStr)
        .reduce((sum, r) => sum + (r.totalIncome || 0), 0);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) onSearch(searchInput.trim());
    };

    return (
        <div>
            {/* 요약 카드 */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12, marginBottom: 20,
            }}>
                {[
                    { label: "오늘 수익",   value: fmt(todayIncome),  color: "#10B981" },
                    { label: "오늘 지출",   value: fmt(todayExpense), color: "#EF4444" },
                    { label: "주간 수익",   value: fmt(weekIncome),   color: "#534AB7" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        background: T.card, border: `0.5px solid ${T.border}`,
                        borderRadius: 12, padding: "16px 14px",
                    }}>
                        <div style={{ fontSize: 11, color: T.sub, marginBottom: 6 }}>{label}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* 캐릭터 검색 */}
            <div style={{
                background: T.card, border: `0.5px solid ${T.border}`,
                borderRadius: 12, padding: 16, marginBottom: 16,
            }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 10 }}>
                    🔍 캐릭터 검색
                </div>
                <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
                    <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="닉네임 입력..."
                        style={{
                            flex: 1, padding: "9px 12px",
                            background: T.bg, border: `0.5px solid ${T.border}`,
                            borderRadius: 8, fontSize: 13, color: T.text, outline: "none",
                        }}
                    />
                    <button type="submit" style={{
                        padding: "9px 16px", background: "#534AB7",
                        color: "#fff", border: "none", borderRadius: 8,
                        fontSize: 13, fontWeight: 500, cursor: "pointer",
                    }}>
                        검색
                    </button>
                </form>
            </div>

            {/* 즐겨찾기 */}
            {favorites.length > 0 && (
                <div style={{
                    background: T.card, border: `0.5px solid ${T.border}`,
                    borderRadius: 12, padding: 16,
                }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 10 }}>
                        ⭐ 즐겨찾기
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {favorites.map(char => (
                            <div key={char.nickname} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "8px 0", borderBottom: `0.5px solid ${T.border}`,
                            }}>
                                <div
                                    onClick={() => onSelectChar(char)}
                                    style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, cursor: "pointer" }}
                                >
                                    {char.image && (
                                        <img src={char.image} alt={char.nickname}
                                             style={{ width: 32, height: 32, borderRadius: 6 }} />
                                    )}
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>
                                            {char.nickname}
                                        </div>
                                        <div style={{ fontSize: 11, color: T.sub }}>{char.job}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onLoadInfo(char.nickname)}
                                    style={{
                                        background: "transparent", border: "none",
                                        cursor: "pointer", color: "#534AB7", fontSize: 13,
                                    }}
                                >
                                    📊
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}