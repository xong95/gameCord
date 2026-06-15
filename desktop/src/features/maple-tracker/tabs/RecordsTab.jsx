import React, { useState } from "react";
import { fmt } from "../utils/format";
import { updateRecord, deleteRecord } from "../db/index";
import { BOSSES } from "../constants/bosses";
import Modal from "../components/Modal";

export default function RecordsTab({ T, user, records, favorites }) {
    const [subTab,      setSubTab]      = useState("boss"); // boss | hunt | auction | etc
    const [selected,    setSelected]    = useState(null);
    const [editMode,    setEditMode]    = useState(false);
    const [saving,      setSaving]      = useState(false);

    // 수정 입력 상태
    const [editDate,    setEditDate]    = useState("");
    const [editNote,    setEditNote]    = useState("");
    const [editMeso,    setEditMeso]    = useState("");
    const [editCash,    setEditCash]    = useState("");
    const [editMile,    setEditMile]    = useState("");

    const IS = {
        padding: "9px 12px", background: T.bg,
        border: `0.5px solid ${T.border}`, borderRadius: 8,
        fontSize: 13, color: T.text, outline: "none", width: "100%",
        boxSizing: "border-box",
    };

    // 서브탭별 필터링
    const filtered = records.filter(r => {
        if (subTab === "boss")    return r.kind === "income" && r.type === "boss";
        if (subTab === "hunt")    return r.kind === "income" && (r.type === "hunt" || r.type === "event");
        if (subTab === "auction") return r.type === "exchange";
        if (subTab === "etc")     return r.kind === "expense";
        return false;
    });

    const openRecord = (r) => {
        setSelected(r);
        setEditMode(false);
        setEditDate(r.date || "");
        setEditNote(r.note || "");
        setEditMeso(r.meso || "");
        setEditCash(r.cash || "");
        setEditMile(r.mileage || "");
    };

    const handleUpdate = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await updateRecord(user.uid, selected.id, {
                date:    editDate,
                note:    editNote,
                meso:    Number(editMeso || 0),
                cash:    Number(editCash || 0),
                mileage: Number(editMile || 0),
            });
            setSelected(null);
        } catch (e) {
            alert("수정 실패: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await deleteRecord(user.uid, id);
            setSelected(null);
        } catch (e) {
            alert("삭제 실패: " + e.message);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* 서브탭 */}
            <div style={{ display: "flex", gap: 8 }}>
                {[["boss","⚔️ 보스"],["hunt","🌿 사냥"],["auction","🔄 환전"],["etc","💸 지출"]].map(([k, label]) => (
                    <button key={k} onClick={() => setSubTab(k)} style={{
                        flex: 1, padding: "8px 0",
                        background: subTab === k ? "#534AB7" : T.card,
                        color: subTab === k ? "#fff" : T.sub,
                        border: `0.5px solid ${T.border}`,
                        borderRadius: 8, fontSize: 12, cursor: "pointer",
                    }}>{label}</button>
                ))}
            </div>

            {/* 기록 목록 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", color: T.sub, fontSize: 13, padding: "20px 0" }}>
                        기록이 없어요
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {filtered.map(r => (
                            <div
                                key={r.id}
                                onClick={() => openRecord(r)}
                                style={{
                                    padding: "10px 12px", background: T.bg,
                                    borderRadius: 8, border: `0.5px solid ${T.border}`,
                                    cursor: "pointer",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>
                                            {r.nickname} · {r.date}
                                        </div>
                                        <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
                                            {r.type} {r.note ? `· ${r.note}` : ""}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: 13, fontWeight: 600,
                                        color: r.kind === "income" ? "#10B981" : "#EF4444",
                                    }}>
                                        {r.kind === "income" ? "+" : "-"}{fmt(r.totalIncome || r.meso || 0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 상세/수정 모달 */}
            {selected && (
                <Modal T={T} title="📋 기록 상세" onClose={() => setSelected(null)}>
                    {!editMode ? (
                        <div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                                {[
                                    ["날짜",     selected.date],
                                    ["닉네임",   selected.nickname],
                                    ["유형",     selected.type],
                                    ["금액",     fmt(selected.totalIncome || selected.meso || 0)],
                                    ["메모",     selected.note || "-"],
                                ].map(([label, value]) => (
                                    <div key={label} style={{
                                        display: "flex", justifyContent: "space-between",
                                        padding: "8px 10px", background: T.bg,
                                        borderRadius: 8, fontSize: 13,
                                    }}>
                                        <span style={{ color: T.sub }}>{label}</span>
                                        <span style={{ color: T.text, fontWeight: 500 }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => handleDelete(selected.id)} style={{
                                    flex: 1, padding: "10px 0",
                                    background: "#EF4444", color: "#fff",
                                    border: "none", borderRadius: 8,
                                    fontSize: 13, cursor: "pointer",
                                }}>🗑️ 삭제</button>
                                <button onClick={() => setEditMode(true)} style={{
                                    flex: 2, padding: "10px 0",
                                    background: "#534AB7", color: "#fff",
                                    border: "none", borderRadius: 8,
                                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                                }}>✏️ 수정</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                                <div>
                                    <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>날짜</label>
                                    <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={IS} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>메소</label>
                                    <input type="number" value={editMeso} onChange={e => setEditMeso(e.target.value)} style={IS} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>넥슨 캐시 (원)</label>
                                    <input type="number" value={editCash} onChange={e => setEditCash(e.target.value)} style={IS} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>마일리지</label>
                                    <input type="number" value={editMile} onChange={e => setEditMile(e.target.value)} style={IS} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>메모</label>
                                    <input value={editNote} onChange={e => setEditNote(e.target.value)} style={IS} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => setEditMode(false)} style={{
                                    flex: 1, padding: "10px 0",
                                    background: "transparent", color: T.sub,
                                    border: `0.5px solid ${T.border}`, borderRadius: 8,
                                    fontSize: 13, cursor: "pointer",
                                }}>← 뒤로</button>
                                <button onClick={handleUpdate} disabled={saving} style={{
                                    flex: 2, padding: "10px 0",
                                    background: "#534AB7", color: "#fff",
                                    border: "none", borderRadius: 8,
                                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                                }}>{saving ? "저장 중..." : "💾 수정 저장"}</button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}