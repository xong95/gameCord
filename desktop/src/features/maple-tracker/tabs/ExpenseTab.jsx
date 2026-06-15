import React, { useState } from "react";
import { localDateStr } from "../utils/format";
import { saveExpense } from "../db/index";

export default function ExpenseTab({ T, user, selectedChar, favorites, onSaved }) {
    const today = localDateStr(new Date());

    const [date,     setDate]     = useState(today);
    const [nickname, setNickname] = useState(selectedChar?.nickname || "");
    const [type,     setType]     = useState("cube"); // cube | enhance | consume | etc
    const [meso,     setMeso]     = useState("");
    const [cash,     setCash]     = useState("");
    const [mileage,  setMileage]  = useState("");
    const [note,     setNote]     = useState("");
    const [saving,   setSaving]   = useState(false);

    const IS = {
        padding: "9px 12px", background: T.bg,
        border: `0.5px solid ${T.border}`, borderRadius: 8,
        fontSize: 13, color: T.text, outline: "none", width: "100%",
        boxSizing: "border-box",
    };

    const handleSave = async () => {
        if (!nickname.trim()) return alert("닉네임을 입력해주세요.");
        if (!date)            return alert("날짜를 선택해주세요.");
        if (!meso && !cash)   return alert("지출 금액을 입력해주세요.");
        setSaving(true);
        try {
            await saveExpense(user.uid, {
                date, nickname: nickname.trim(), type, note,
                meso:    Number(meso    || 0),
                cash:    Number(cash    || 0),
                mileage: Number(mileage || 0),
            });
            setMeso(""); setCash(""); setMileage(""); setNote("");
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
                        {favorites?.length > 0 && (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                                {favorites.map(f => (
                                    <button key={f.nickname} onClick={() => setNickname(f.nickname)} style={{
                                        padding: "3px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                                        background: nickname === f.nickname ? "#534AB7" : T.bg,
                                        color: nickname === f.nickname ? "#fff" : T.sub,
                                        border: `0.5px solid ${nickname === f.nickname ? "#534AB7" : T.border}`,
                                    }}>{f.nickname}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 지출 유형 선택 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: T.sub, marginBottom: 10 }}>지출 유형</div>
                <div style={{ display: "flex", gap: 8 }}>
                    {[["cube","🎲 큐브"],["enhance","⚒️ 강화"],["consume","🧪 소모품"],["etc","📦 기타"]].map(([k, label]) => (
                        <button key={k} onClick={() => setType(k)} style={{
                            flex: 1, padding: "8px 0",
                            background: type === k ? "#534AB7" : T.bg,
                            color: type === k ? "#fff" : T.sub,
                            border: `0.5px solid ${T.border}`,
                            borderRadius: 8, fontSize: 12, cursor: "pointer",
                        }}>{label}</button>
                    ))}
                </div>
            </div>

            {/* 금액 입력 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>지출 메소</label>
                        <input type="number" value={meso} onChange={e => setMeso(e.target.value)} placeholder="0" style={IS} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>넥슨 캐시 (원)</label>
                        <input type="number" value={cash} onChange={e => setCash(e.target.value)} placeholder="0" style={IS} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>마일리지 사용</label>
                        <input type="number" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="0" style={IS} />
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
                    background: "#EF4444", color: "#fff",
                    border: "none", borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
            >
                {saving ? "저장 중..." : "💸 지출 저장"}
            </button>
        </div>
    );
}