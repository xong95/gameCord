import React, { useState } from "react";
import { fmt, localDateStr } from "../utils/format";
import {
    addInventoryItem, updateInventoryItem, deleteInventoryItem, subscribeInventory,
} from "../db/index";

export default function AuctionTab({ T, user, inventory, onSaved }) {
    const today = localDateStr(new Date());

    // 입력 상태
    const [itemName,   setItemName]   = useState("");
    const [itemMemo,   setItemMemo]   = useState("");
    const [itemPrice,  setItemPrice]  = useState("");
    const [saving,     setSaving]     = useState(false);

    // 판매 모달 상태
    const [sellTarget, setSellTarget] = useState(null);
    const [sellPrice,  setSellPrice]  = useState("");
    const [sellDate,   setSellDate]   = useState(today);
    const [sellNote,   setSellNote]   = useState("");

    const IS = {
        padding: "9px 12px", background: T.bg,
        border: `0.5px solid ${T.border}`, borderRadius: 8,
        fontSize: 13, color: T.text, outline: "none", width: "100%",
        boxSizing: "border-box",
    };

    // 아이템 보관함 추가
    const handleAddItem = async () => {
        if (!itemName.trim()) return alert("아이템 이름을 입력해주세요.");
        setSaving(true);
        try {
            await addInventoryItem(user.uid, {
                name:  itemName.trim(),
                memo:  itemMemo.trim(),
                price: Number(itemPrice || 0),
                date:  today,
            });
            setItemName(""); setItemMemo(""); setItemPrice("");
            onSaved?.();
        } catch (e) {
            alert("저장 실패: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    // 판매 처리
    const handleSell = async () => {
        if (!sellPrice) return alert("판매가를 입력해주세요.");
        try {
            await updateInventoryItem(user.uid, sellTarget.id, {
                sold:      true,
                soldPrice: Number(sellPrice),
                soldDate:  sellDate,
                soldNote:  sellNote,
            });
            setSellTarget(null); setSellPrice(""); setSellNote("");
            onSaved?.();
        } catch (e) {
            alert("판매 처리 실패: " + e.message);
        }
    };

    // 삭제
    const handleDelete = async (itemId) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await deleteInventoryItem(user.uid, itemId);
        } catch (e) {
            alert("삭제 실패: " + e.message);
        }
    };

    const unsold = inventory.filter(i => !i.sold);
    const sold   = inventory.filter(i => i.sold);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* 아이템 추가 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 12 }}>
                    📦 물욕템 보관함 추가
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>아이템 이름</label>
                        <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="아이템 이름" style={IS} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>희망 판매가 (메소)</label>
                        <input type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="0" style={IS} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>메모</label>
                        <input value={itemMemo} onChange={e => setItemMemo(e.target.value)} placeholder="메모..." style={IS} />
                    </div>
                    <button onClick={handleAddItem} disabled={saving} style={{
                        width: "100%", padding: "10px 0",
                        background: "#534AB7", color: "#fff",
                        border: "none", borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>
                        {saving ? "저장 중..." : "➕ 보관함에 추가"}
                    </button>
                </div>
            </div>

            {/* 보관 중 목록 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 12 }}>
                    🗃️ 보관 중 ({unsold.length}개)
                </div>
                {unsold.length === 0 ? (
                    <div style={{ textAlign: "center", color: T.sub, fontSize: 13, padding: "20px 0" }}>
                        보관 중인 아이템이 없어요
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {unsold.map(item => (
                            <div key={item.id} style={{
                                padding: "10px 12px", background: T.bg,
                                borderRadius: 8, border: `0.5px solid ${T.border}`,
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{item.name}</div>
                                        {item.price > 0 && (
                                            <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
                                                희망가: {fmt(item.price)}
                                            </div>
                                        )}
                                        {item.memo && (
                                            <div style={{ fontSize: 11, color: T.sub }}>{item.memo}</div>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button onClick={() => { setSellTarget(item); setSellDate(today); }} style={{
                                            padding: "5px 10px", background: "#10B981",
                                            color: "#fff", border: "none", borderRadius: 6,
                                            fontSize: 12, cursor: "pointer",
                                        }}>판매</button>
                                        <button onClick={() => handleDelete(item.id)} style={{
                                            padding: "5px 10px", background: "#EF4444",
                                            color: "#fff", border: "none", borderRadius: 6,
                                            fontSize: 12, cursor: "pointer",
                                        }}>삭제</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 판매 완료 목록 */}
            {sold.length > 0 && (
                <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 12 }}>
                        ✅ 판매 완료 ({sold.length}개)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {sold.map(item => (
                            <div key={item.id} style={{
                                padding: "10px 12px", background: T.bg,
                                borderRadius: 8, border: `0.5px solid ${T.border}`,
                                opacity: 0.7,
                            }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{item.name}</div>
                                <div style={{ fontSize: 11, color: "#10B981", marginTop: 2 }}>
                                    판매가: {fmt(item.soldPrice)} · {item.soldDate}
                                </div>
                                {item.soldNote && (
                                    <div style={{ fontSize: 11, color: T.sub }}>{item.soldNote}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 판매 모달 */}
            {sellTarget && (
                <div onClick={() => setSellTarget(null)} style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1000,
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: T.card, borderRadius: 16, padding: 24,
                        width: 320, border: `0.5px solid ${T.border}`,
                    }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 16 }}>
                            💰 판매 처리 — {sellTarget.name}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div>
                                <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>판매가 (메소)</label>
                                <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="0" style={IS} />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>판매 날짜</label>
                                <input type="date" value={sellDate} onChange={e => setSellDate(e.target.value)} style={IS} />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>메모</label>
                                <input value={sellNote} onChange={e => setSellNote(e.target.value)} placeholder="메모..." style={IS} />
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                <button onClick={() => setSellTarget(null)} style={{
                                    flex: 1, padding: "10px 0",
                                    background: "transparent", color: T.sub,
                                    border: `0.5px solid ${T.border}`, borderRadius: 8,
                                    fontSize: 13, cursor: "pointer",
                                }}>취소</button>
                                <button onClick={handleSell} style={{
                                    flex: 2, padding: "10px 0",
                                    background: "#10B981", color: "#fff",
                                    border: "none", borderRadius: 8,
                                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                                }}>판매 완료</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}