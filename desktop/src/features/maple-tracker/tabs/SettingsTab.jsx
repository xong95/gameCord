import React, { useState } from "react";
import { addInquiry, saveFavorites } from "../db/index";

export default function SettingsTab({ T, user, favorites, darkMode, onToggleDark, onSaved }) {
    const [inquiryTitle,   setInquiryTitle]   = useState("");
    const [inquiryContent, setInquiryContent] = useState("");
    const [saving,         setSaving]         = useState(false);
    const [sent,           setSent]           = useState(false);

    const IS = {
        padding: "9px 12px", background: T.bg,
        border: `0.5px solid ${T.border}`, borderRadius: 8,
        fontSize: 13, color: T.text, outline: "none", width: "100%",
        boxSizing: "border-box",
    };

    const handleInquiry = async () => {
        if (!inquiryTitle.trim())   return alert("제목을 입력해주세요.");
        if (!inquiryContent.trim()) return alert("내용을 입력해주세요.");
        setSaving(true);
        try {
            await addInquiry(user.uid, user.email, inquiryTitle.trim(), inquiryContent.trim());
            setInquiryTitle(""); setInquiryContent("");
            setSent(true);
            setTimeout(() => setSent(false), 3000);
        } catch (e) {
            alert("전송 실패: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    // 캐릭터 A/B 유형 변경
    const handleTypeChange = async (nickname, field, value) => {
        const updated = favorites.map(f =>
            f.nickname === nickname ? { ...f, [field]: value } : f
        );
        try {
            await saveFavorites(user.uid, updated);
            onSaved?.();
        } catch (e) {
            alert("저장 실패: " + e.message);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* 계정 정보 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 12 }}>
                    👤 계정 정보
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {user.photoURL && (
                        <img src={user.photoURL} alt="프로필"
                             style={{ width: 40, height: 40, borderRadius: "50%" }} />
                    )}
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{user.displayName}</div>
                        <div style={{ fontSize: 11, color: T.sub }}>{user.email}</div>
                    </div>
                </div>
            </div>

            {/* 다크/라이트 모드 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>
                            {darkMode ? "🌙 다크 모드" : "☀️ 라이트 모드"}
                        </div>
                        <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>테마를 변경합니다</div>
                    </div>
                    <button onClick={onToggleDark} style={{
                        padding: "8px 16px",
                        background: "#534AB7", color: "#fff",
                        border: "none", borderRadius: 8,
                        fontSize: 12, cursor: "pointer",
                    }}>
                        전환
                    </button>
                </div>
            </div>

            {/* A/B 유형 설정 */}
            {favorites.length > 0 && (
                <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 4 }}>
                        ⚙️ 캐릭터 A/B 유형 설정
                    </div>
                    <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>
                        B유형: 솔에르다/물욕템 수익을 순수익에서 제외
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {favorites.map(char => (
                            <div key={char.nickname} style={{
                                padding: "12px 14px", background: T.bg,
                                borderRadius: 8, border: `0.5px solid ${T.border}`,
                            }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 10 }}>
                                    {char.nickname}
                                </div>

                                {/* 솔에르다 유형 */}
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ fontSize: 11, color: T.sub, marginBottom: 6 }}>솔에르다 유형</div>
                                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                                        {["A", "B"].map(type => (
                                            <button key={type}
                                                    onClick={() => handleTypeChange(char.nickname, "solType", type)}
                                                    style={{
                                                        padding: "5px 16px",
                                                        background: (char.solType || "A") === type ? "#534AB7" : T.bg,
                                                        color: (char.solType || "A") === type ? "#fff" : T.sub,
                                                        border: `0.5px solid ${T.border}`,
                                                        borderRadius: 6, fontSize: 12, cursor: "pointer",
                                                    }}
                                            >{type}</button>
                                        ))}
                                    </div>
                                    {/* 솔에르다 B유형 적용 날짜 */}
                                    {(char.solType || "A") === "B" && (
                                        <div>
                                            <div style={{ fontSize: 11, color: T.sub, marginBottom: 4 }}>
                                                B유형 적용 시작일 (이 날짜부터 적용)
                                            </div>
                                            <input
                                                type="date"
                                                value={char.solApplyDate || ""}
                                                onChange={e => handleTypeChange(char.nickname, "solApplyDate", e.target.value)}
                                                style={{
                                                    padding: "7px 10px", background: T.bg,
                                                    border: `0.5px solid ${T.border}`, borderRadius: 8,
                                                    fontSize: 12, color: T.text, outline: "none",
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* 물욕템 유형 */}
                                <div>
                                    <div style={{ fontSize: 11, color: T.sub, marginBottom: 6 }}>물욕템 유형</div>
                                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                                        {["A", "B"].map(type => (
                                            <button key={type}
                                                    onClick={() => handleTypeChange(char.nickname, "dropType", type)}
                                                    style={{
                                                        padding: "5px 16px",
                                                        background: (char.dropType || "A") === type ? "#534AB7" : T.bg,
                                                        color: (char.dropType || "A") === type ? "#fff" : T.sub,
                                                        border: `0.5px solid ${T.border}`,
                                                        borderRadius: 6, fontSize: 12, cursor: "pointer",
                                                    }}
                                            >{type}</button>
                                        ))}
                                    </div>
                                    {/* 물욕템 B유형 적용 날짜 */}
                                    {(char.dropType || "A") === "B" && (
                                        <div>
                                            <div style={{ fontSize: 11, color: T.sub, marginBottom: 4 }}>
                                                B유형 적용 시작일 (이 날짜부터 적용)
                                            </div>
                                            <input
                                                type="date"
                                                value={char.dropApplyDate || ""}
                                                onChange={e => handleTypeChange(char.nickname, "dropApplyDate", e.target.value)}
                                                style={{
                                                    padding: "7px 10px", background: T.bg,
                                                    border: `0.5px solid ${T.border}`, borderRadius: 8,
                                                    fontSize: 12, color: T.text, outline: "none",
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 건의함 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 12 }}>
                    📬 건의함
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>제목</label>
                        <input value={inquiryTitle} onChange={e => setInquiryTitle(e.target.value)}
                               placeholder="제목을 입력해주세요" style={IS} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>내용</label>
                        <textarea value={inquiryContent} onChange={e => setInquiryContent(e.target.value)}
                                  placeholder="내용을 입력해주세요" rows={4}
                                  style={{ ...IS, resize: "vertical", fontFamily: "inherit" }} />
                    </div>
                    {sent && (
                        <div style={{
                            padding: "8px 12px", background: "#D1FAE5",
                            borderRadius: 8, fontSize: 12, color: "#065F46", textAlign: "center",
                        }}>
                            ✅ 건의가 전송되었습니다!
                        </div>
                    )}
                    <button onClick={handleInquiry} disabled={saving} style={{
                        width: "100%", padding: "10px 0",
                        background: "#534AB7", color: "#fff",
                        border: "none", borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>
                        {saving ? "전송 중..." : "📨 건의 전송"}
                    </button>
                </div>
            </div>
        </div>
    );
}