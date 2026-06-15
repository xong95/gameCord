import React, { useState } from "react";
import { localDateStr } from "../utils/format";
import { saveIncome, saveExpense } from "../db/index";

export default function ExchangeTab({ T, user, selectedChar, favorites, onSaved }) {
    const today = localDateStr(new Date());

    const [date,      setDate]      = useState(today);
    const [nickname,  setNickname]  = useState(selectedChar?.nickname || "");
    const [direction, setDirection] = useState("meso2cash"); // meso2cash | cash2meso
    const [meso,      setMeso]      = useState("");
    const [cash,      setCash]      = useState("");
    const [note,      setNote]      = useState("");
    const [saving,    setSaving]    = useState(false);

    const IS = {
        padding: "9px 12px", background: T.bg,
        border: `0.5px solid ${T.border}`, borderRadius: 8,
        fontSize: 13, color: T.text, outline: "none", width: "100%",
        boxSizing: "border-box",
    };

    const handleSave = async () => {
        if (!nickname.trim()) return alert("닉네임을 입력해주세요.");
        if (!date)            return alert("날짜를 선택해주세요.");
        if (!meso && !cash)   return alert("금액을 입력해주세요.");
        setSaving(true);
        try {
            if (direction === "meso2cash") {
                // 메소 → 캐시: 메소 지출, 캐시 수익
                await saveExpense(user.uid, {
                    date, nickname: nickname.trim(), type: "exchange",
                    note, meso: Number(meso || 0), cash: 0, mileage: 0,
                });
            } else {
                // 캐시 → 메소: 캐시 지출, 메소 수익
                await saveIncome(user.uid, {
                    date, nickname: nickname.trim(), type: "exchange",
                    note, totalIncome: Number(meso || 0), cash: Number(cash || 0),
                });
            }
            setMeso(""); setCash(""); setNote("");
            onSaved?.();
        } catch (e) {
            alert("저장 실패: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* 날짜 / 닉네임 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>날짜</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={IS} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>닉네임</label>
                        <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="닉네임" style={IS} />
                    </div>
                </div>
            </div>

            {/* 환전 방향 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: T.sub, marginBottom: 10 }}>환전 방향</div>
                <div style={{ display: "flex", gap: 8 }}>
                    {[["meso2cash","💰 메소 → 캐시"],["cash2meso","💎 캐시 → 메소"]].map(([k, label]) => (
                        <button key={k} onClick={() => setDirection(k)} style={{
                            flex: 1, padding: "10px 0",
                            background: direction === k ? "#534AB7" : T.bg,
                            color: direction === k ? "#fff" : T.sub,
                            border: `0.5px solid ${T.border}`,
                            borderRadius: 8, fontSize: 13, cursor: "pointer",
                        }}>{label}</button>
                    ))}
                </div>
            </div>

            {/* 금액 입력 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>메소</label>
                        <input type="number" value={meso} onChange={e => setMeso(e.target.value)} placeholder="0" style={IS} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>넥슨 캐시 (원)</label>
                        <input type="number" value={cash} onChange={e => setCash(e.target.value)} placeholder="0" style={IS} />
                    </div>
                </div>
            </div>

            {/* 메모 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>메모</label>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="메모..." style={IS} />
            </div>

            {/* 저장 버튼 */}
            <button
                onClick={handleSave}
                disabled={saving}
                style={{
                    width: "100%", padding: "12px 0",
                    background: "#534AB7", color: "#fff",
                    border: "none", borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
            >
                {saving ? "저장 중..." : "🔄 환전 저장"}
            </button>
        </div>
    );
}