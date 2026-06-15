import React, { useState } from "react";
import { fmt } from "../utils/format";
import { calcIncome, calcSolIncome } from "../utils/calc";

export default function StatsTab({ T, records, favorites }) {
    const [period, setPeriod] = useState("week"); // week | month | all

    // 기간 필터
    const getStartDate = () => {
        const now = new Date();
        if (period === "week") {
            const d = new Date(now);
            d.setDate(d.getDate() - 7);
            return d.toISOString().slice(0, 10);
        }
        if (period === "month") {
            const d = new Date(now);
            d.setMonth(d.getMonth() - 1);
            return d.toISOString().slice(0, 10);
        }
        return "0000-00-00";
    };

    const startDate = getStartDate();

    const filtered = records.filter(r => (r.date || "") >= startDate);

    // 수익 합계
    const totalIncome = filtered
        .filter(r => r.kind === "income")
        .reduce((sum, r) => sum + calcIncome(r, favorites), 0);

    // 지출 합계
    const totalExpense = filtered
        .filter(r => r.kind === "expense")
        .reduce((sum, r) => sum + (r.meso || 0), 0);

    // 순손익
    const netProfit = totalIncome - totalExpense;

    // 솔에르다 합계
    const totalSol = filtered
        .filter(r => r.kind === "income")
        .reduce((sum, r) => sum + calcSolIncome(r, favorites), 0);

    // 보스 수익
    const bossIncome = filtered
        .filter(r => r.kind === "income" && r.type === "boss")
        .reduce((sum, r) => sum + calcIncome(r, favorites), 0);

    // 사냥 수익
    const huntIncome = filtered
        .filter(r => r.kind === "income" && r.type === "hunt")
        .reduce((sum, r) => sum + calcIncome(r, favorites), 0);

    // 캐릭터별 수익
    const byChar = {};
    filtered
        .filter(r => r.kind === "income")
        .forEach(r => {
            const name = r.nickname || "알 수 없음";
            byChar[name] = (byChar[name] || 0) + calcIncome(r, favorites);
        });
    const charRank = Object.entries(byChar)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* 기간 선택 */}
            <div style={{ display: "flex", gap: 8 }}>
                {[["week","최근 7일"],["month","최근 30일"],["all","전체"]].map(([k, label]) => (
                    <button key={k} onClick={() => setPeriod(k)} style={{
                        flex: 1, padding: "8px 0",
                        background: period === k ? "#534AB7" : T.card,
                        color: period === k ? "#fff" : T.sub,
                        border: `0.5px solid ${T.border}`,
                        borderRadius: 8, fontSize: 12, cursor: "pointer",
                    }}>{label}</button>
                ))}
            </div>

            {/* 요약 카드 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                    { label: "총 수익",   value: fmt(totalIncome),  color: "#10B981" },
                    { label: "총 지출",   value: fmt(totalExpense), color: "#EF4444" },
                    { label: "순손익",    value: fmt(netProfit),    color: netProfit >= 0 ? "#534AB7" : "#EF4444" },
                    { label: "솔에르다",  value: `${totalSol.toLocaleString()} 메소`, color: "#F59E0B" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        background: T.card, border: `0.5px solid ${T.border}`,
                        borderRadius: 12, padding: "14px 16px",
                    }}>
                        <div style={{ fontSize: 11, color: T.sub, marginBottom: 6 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* 수익 분석 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 12 }}>
                    📊 수익 분석
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                        { label: "⚔️ 보스 수익", value: bossIncome },
                        { label: "🌿 사냥 수익", value: huntIncome },
                    ].map(({ label, value }) => (
                        <div key={label} style={{
                            display: "flex", justifyContent: "space-between",
                            padding: "8px 10px", background: T.bg,
                            borderRadius: 8, fontSize: 13,
                        }}>
                            <span style={{ color: T.sub }}>{label}</span>
                            <span style={{ color: T.text, fontWeight: 500 }}>{fmt(value)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 캐릭터별 순위 */}
            {charRank.length > 0 && (
                <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 12 }}>
                        🏆 캐릭터별 수익 TOP 5
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {charRank.map(([name, value], idx) => (
                            <div key={name} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "8px 10px", background: T.bg,
                                borderRadius: 8, fontSize: 13,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: idx === 0 ? "#F59E0B" : idx === 1 ? "#9CA3AF" : idx === 2 ? "#B45309" : T.border,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>{idx + 1}</span>
                                    <span style={{ color: T.text }}>{name}</span>
                                </div>
                                <span style={{ color: "#10B981", fontWeight: 600 }}>{fmt(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}