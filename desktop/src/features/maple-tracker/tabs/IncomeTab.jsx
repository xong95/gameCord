import React, { useState } from "react";
import { localDateStr } from "../utils/format";
import { BOSS_GROUPS } from "../constants/bosses";
import { SOL_PRICE } from "../constants/prices";
import { saveIncome } from "../db/index";

export default function IncomeTab({ T, user, selectedChar, records, onSaved }) {
    const today = localDateStr(new Date());

    // 공통
    const [date,     setDate]     = useState(today);
    const [nickname, setNickname] = useState(selectedChar?.nickname || "");
    const [type,     setType]     = useState("boss");
    const [note,     setNote]     = useState("");
    const [saving,   setSaving]   = useState(false);

    // 보스 상태 - { "weekly_스우": { checked: true, diff: "하드", party: 1, members: [] } }
    const [bossTab,   setBossTab]   = useState("weekly");
    const [bossState, setBossState] = useState({});

    // 사냥
    const [huntMeso, setHuntMeso] = useState("");
    const [huntSol1, setHuntSol1] = useState("");
    const [huntSol2, setHuntSol2] = useState("");
    const [huntSol3, setHuntSol3] = useState("");

    // 이벤트
    const [eventMeso, setEventMeso] = useState("");

    // 물욕템
    const [dropItems, setDropItems] = useState([{ name: "", price: "" }]);

    // 에픽던전주화
    const [epicMeso, setEpicMeso] = useState("");
    const [epicEtc,  setEpicEtc]  = useState("");

    const IS = {
        padding: "9px 12px", background: T.bg,
        border: `0.5px solid ${T.border}`, borderRadius: 8,
        fontSize: 13, color: T.text, outline: "none", width: "100%",
        boxSizing: "border-box",
    };

    // 보스 키 생성
    const bossKey = (sec, name) => `${sec}_${name}`;

    // 보스 상태 업데이트
    const toggleBoss = (sec, name) => {
        const key = bossKey(sec, name);
        const boss = BOSS_GROUPS[sec].find(b => b.name === name);
        setBossState(p => {
            const cur = p[key];
            if (cur?.checked) {
                const next = { ...p };
                delete next[key];
                return next;
            }
            return {
                ...p,
                [key]: {
                    checked: true,
                    diff: boss.diffs[0].diff,
                    party: 1,
                    members: [],
                }
            };
        });
    };

    const setDiff = (sec, name, diff) => {
        const key = bossKey(sec, name);
        setBossState(p => ({ ...p, [key]: { ...p[key], diff } }));
    };

    const setParty = (sec, name, delta) => {
        const key = bossKey(sec, name);
        setBossState(p => {
            const cur = p[key];
            const next = Math.min(6, Math.max(1, (cur.party || 1) + delta));
            return { ...p, [key]: { ...cur, party: next } };
        });
    };

    // 결정석 가격 계산
    const getCrystal = (sec, name, diff, party) => {
        const boss = BOSS_GROUPS[sec]?.find(b => b.name === name);
        const d = boss?.diffs.find(d => d.diff === diff);
        return d ? Math.floor(d.crystal / (party || 1)) : 0;
    };

    // 보스 합계
    const bossTotal = Object.entries(bossState).reduce((sum, [key, val]) => {
        if (!val?.checked) return sum;
        const [sec, ...rest] = key.split("_");
        const name = rest.join("_");
        return sum + getCrystal(sec, name, val.diff, val.party);
    }, 0);

    // 솔에르다 합계
    const solTotal = () => {
        if (type === "hunt") return ((+huntSol1 || 0) + (+huntSol2 || 0) + (+huntSol3 || 0)) * SOL_PRICE;
        return 0;
    };

    // 총 수익
    const calcTotal = () => {
        if (type === "boss")  return bossTotal;
        if (type === "hunt")  return (+huntMeso || 0) + solTotal();
        if (type === "event") return +eventMeso || 0;
        if (type === "drop")  return dropItems.reduce((s, i) => s + (+i.price || 0), 0);
        if (type === "epic")  return (+epicMeso || 0) + (+epicEtc || 0);
        return 0;
    };

    const handleSave = async () => {
        if (!nickname.trim()) return alert("닉네임을 입력해주세요.");
        if (!date)            return alert("날짜를 선택해주세요.");

        // 보스 중복 체크
        if (type === "boss") {
            const dup = records?.find(r =>
                r.kind === "income" && r.type === "boss" &&
                r.nickname === nickname.trim() && r.date === date
            );
            if (dup) return alert("이미 해당 날짜에 보스 수익이 기록되어 있습니다.");
        }

        setSaving(true);
        try {
            const base = { date, nickname: nickname.trim(), type, note };

            if (type === "boss") {
                const bossList = Object.entries(bossState)
                    .filter(([, v]) => v?.checked)
                    .map(([key, val]) => {
                        const [sec, ...rest] = key.split("_");
                        const name = rest.join("_");
                        return {
                            name: `${name} (${val.diff})`,
                            crystal: getCrystal(sec, name, val.diff, val.party),
                            party: val.party,
                        };
                    });
                await saveIncome(user.uid, {
                    ...base, bosses: bossList,
                    bossIncome: bossTotal, totalIncome: bossTotal,
                });
                setBossState({});

            } else if (type === "hunt") {
                const sol = (+huntSol1 || 0) + (+huntSol2 || 0) + (+huntSol3 || 0);
                await saveIncome(user.uid, {
                    ...base,
                    meso: +huntMeso || 0,
                    sol1: +huntSol1 || 0,
                    sol2: +huntSol2 || 0,
                    sol3: +huntSol3 || 0,
                    totalSol: solTotal(),
                    totalIncome: calcTotal(),
                });
                setHuntMeso(""); setHuntSol1(""); setHuntSol2(""); setHuntSol3("");

            } else if (type === "event") {
                await saveIncome(user.uid, { ...base, meso: +eventMeso || 0, totalIncome: +eventMeso || 0 });
                setEventMeso("");

            } else if (type === "drop") {
                const valid = dropItems.filter(i => i.name.trim());
                const total = valid.reduce((s, i) => s + (+i.price || 0), 0);
                await saveIncome(user.uid, { ...base, dropItems: valid, totalIncome: total });
                setDropItems([{ name: "", price: "" }]);

            } else if (type === "epic") {
                const total = (+epicMeso || 0) + (+epicEtc || 0);
                await saveIncome(user.uid, { ...base, meso: +epicMeso || 0, etc: +epicEtc || 0, totalIncome: total });
                setEpicMeso(""); setEpicEtc("");
            }

            setNote("");
            onSaved?.();
        } catch (e) {
            alert("저장 실패: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    // 보스 섹션 색상
    const secColor = { daily: "#10B981", weekly: "#534AB7", monthly: "#EF4444" };

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

            {/* 수익 유형 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: T.sub, marginBottom: 10 }}>수익 유형</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[["boss","⚔️ 보스"],["hunt","🌿 사냥"],["event","🎉 이벤트"],["drop","💎 물욕템"],["epic","🔮 에픽주화"]].map(([k, label]) => (
                        <button key={k} onClick={() => setType(k)} style={{
                            flex: 1, minWidth: 80, padding: "8px 0",
                            background: type === k ? "#534AB7" : T.bg,
                            color: type === k ? "#fff" : T.sub,
                            border: `0.5px solid ${T.border}`,
                            borderRadius: 8, fontSize: 12, cursor: "pointer",
                        }}>{label}</button>
                    ))}
                </div>
            </div>

            {/* 보스 입력 */}
            {type === "boss" && (
                <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                    {/* 보스 탭 */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        {[["daily","일간"],["weekly","주간"],["monthly","월간"]].map(([k, label]) => (
                            <button key={k} onClick={() => setBossTab(k)} style={{
                                flex: 1, padding: "6px 0",
                                background: bossTab === k ? secColor[k] : T.bg,
                                color: bossTab === k ? "#fff" : T.sub,
                                border: `0.5px solid ${T.border}`,
                                borderRadius: 8, fontSize: 12, cursor: "pointer",
                            }}>{label}</button>
                        ))}
                    </div>

                    {/* 보스 목록 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {BOSS_GROUPS[bossTab].map(boss => {
                            const key = bossKey(bossTab, boss.name);
                            const state = bossState[key];
                            const checked = !!state?.checked;
                            const selDiff = state?.diff || boss.diffs[0].diff;
                            const party = state?.party || 1;
                            const crystal = getCrystal(bossTab, boss.name, selDiff, party);
                            const color = secColor[bossTab];

                            return (
                                <div key={boss.name} style={{
                                    borderRadius: 8, border: `0.5px solid ${checked ? color : T.border}`,
                                    background: checked ? (color + "11") : T.bg,
                                    overflow: "hidden",
                                }}>
                                    {/* 보스 행 */}
                                    <div
                                        onClick={() => toggleBoss(bossTab, boss.name)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 10,
                                            padding: "10px 12px", cursor: "pointer",
                                        }}
                                    >
                                        {/* 체크박스 */}
                                        <div style={{
                                            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                                            border: `2px solid ${checked ? color : T.border}`,
                                            background: checked ? color : "transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                                        </div>

                                        {/* 보스 이름 */}
                                        <span style={{ flex: 1, fontSize: 13, color: T.text, fontWeight: checked ? 500 : 400 }}>
                      {boss.name}
                    </span>

                                        {/* 파티 인원 (체크됐을 때만) */}
                                        {checked && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}
                                                 onClick={e => e.stopPropagation()}>
                                                <button onClick={() => setParty(bossTab, boss.name, -1)} style={{
                                                    width: 22, height: 22, border: `0.5px solid ${T.border}`,
                                                    borderRadius: 4, background: T.card, color: T.text,
                                                    fontSize: 14, cursor: "pointer", display: "flex",
                                                    alignItems: "center", justifyContent: "center",
                                                }}>−</button>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: T.text, minWidth: 24, textAlign: "center" }}>
                          {party}인
                        </span>
                                                <button onClick={() => setParty(bossTab, boss.name, 1)} style={{
                                                    width: 22, height: 22, border: `0.5px solid ${T.border}`,
                                                    borderRadius: 4, background: T.card, color: T.text,
                                                    fontSize: 14, cursor: "pointer", display: "flex",
                                                    alignItems: "center", justifyContent: "center",
                                                }}>+</button>
                                            </div>
                                        )}

                                        {/* 결정석 금액 */}
                                        <span style={{ fontSize: 12, color: checked ? color : T.sub, minWidth: 80, textAlign: "right" }}>
                      {crystal.toLocaleString()}
                    </span>
                                    </div>

                                    {/* 난이도 선택 (체크됐을 때만, 난이도 2개 이상일 때만) */}
                                    {checked && boss.diffs.length > 1 && (
                                        <div style={{ padding: "0 12px 10px 40px", display: "flex", gap: 6, flexWrap: "wrap" }}
                                             onClick={e => e.stopPropagation()}>
                                            {boss.diffs.map(d => (
                                                <button key={d.diff}
                                                        onClick={() => setDiff(bossTab, boss.name, d.diff)}
                                                        style={{
                                                            padding: "3px 10px", borderRadius: 12, fontSize: 11,
                                                            fontWeight: 600, cursor: "pointer",
                                                            border: `1px solid ${selDiff === d.diff ? color : T.border}`,
                                                            background: selDiff === d.diff ? color : T.card,
                                                            color: selDiff === d.diff ? "#fff" : T.sub,
                                                        }}>
                                                    {d.diff}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* 파티원 닉네임 입력 */}
                                    {checked && party > 1 && (
                                        <div style={{ padding: "0 12px 10px 40px" }}
                                             onClick={e => e.stopPropagation()}>
                                            <div style={{ fontSize: 10, color: T.sub, marginBottom: 4 }}>함께한 용사</div>
                                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                {Array.from({ length: party - 1 }).map((_, i) => (
                                                    <input key={i}
                                                           type="text"
                                                           placeholder={`용사 ${i + 1}`}
                                                           value={state?.members?.[i] || ""}
                                                           onChange={e => {
                                                               const key = bossKey(bossTab, boss.name);
                                                               setBossState(p => {
                                                                   const cur = { ...p[key] };
                                                                   const members = [...(cur.members || [])];
                                                                   members[i] = e.target.value;
                                                                   return { ...p, [key]: { ...cur, members } };
                                                               });
                                                           }}
                                                           style={{
                                                               background: T.bg, border: `0.5px solid ${T.border}`,
                                                               borderRadius: 6, padding: "4px 8px",
                                                               color: T.text, fontSize: 11, outline: "none", width: 90,
                                                           }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* 선택 요약 + 합계 */}
                    {Object.keys(bossState).filter(k => bossState[k]?.checked).length > 0 && (
                        <div style={{ marginTop: 12, background: T.bg, borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ fontSize: 12, color: T.sub, marginBottom: 8 }}>
                                선택 ({Object.keys(bossState).filter(k => bossState[k]?.checked).length}개)
                            </div>
                            {Object.entries(bossState)
                                .filter(([, v]) => v?.checked)
                                .map(([key, val]) => {
                                    const [sec, ...rest] = key.split("_");
                                    const name = rest.join("_");
                                    const crystal = getCrystal(sec, name, val.diff, val.party);
                                    return (
                                        <div key={key} style={{
                                            display: "flex", justifyContent: "space-between",
                                            fontSize: 12, padding: "4px 0",
                                            borderBottom: `0.5px solid ${T.border}`,
                                        }}>
                      <span style={{ color: T.text }}>
                        {name} ({val.diff}){val.party > 1 ? ` ${val.party}인` : ""}
                      </span>
                                            <span style={{ color: "#854F0B", fontWeight: 500 }}>
                        {crystal.toLocaleString()}메소
                      </span>
                                        </div>
                                    );
                                })}
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                fontSize: 14, fontWeight: 700, color: "#854F0B",
                                marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}`,
                            }}>
                                <span>결정석 합산</span>
                                <span>{bossTotal.toLocaleString()}메소</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 사냥 입력 */}
            {type === "hunt" && (
                <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div>
                            <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>획득 메소</label>
                            <input type="number" value={huntMeso} onChange={e => setHuntMeso(e.target.value)} placeholder="0" style={IS} />
                        </div>
                        <div style={{ fontSize: 11, color: T.sub, marginBottom: 2 }}>솔에르다 (개) — 종류별 분리 입력</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {[["솔1", huntSol1, setHuntSol1], ["솔2", huntSol2, setHuntSol2], ["솔3", huntSol3, setHuntSol3]].map(([label, val, set]) => (
                                <div key={label}>
                                    <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>{label}</label>
                                    <input type="number" value={val} onChange={e => set(e.target.value)} placeholder="0" style={IS} />
                                </div>
                            ))}
                        </div>
                        {(+huntSol1 || +huntSol2 || +huntSol3) > 0 && (
                            <div style={{ fontSize: 12, color: "#534AB7" }}>
                                솔에르다 합계: {((+huntSol1||0)+(+huntSol2||0)+(+huntSol3||0)).toLocaleString()}개
                                = {solTotal().toLocaleString()} 메소
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 이벤트 입력 */}
            {type === "event" && (
                <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                    <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>획득 메소</label>
                    <input type="number" value={eventMeso} onChange={e => setEventMeso(e.target.value)} placeholder="0" style={IS} />
                </div>
            )}

            {/* 물욕템 입력 */}
            {type === "drop" && (
                <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, color: T.sub, marginBottom: 10 }}>아이템 목록</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {dropItems.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                    value={item.name}
                                    onChange={e => {
                                        const next = [...dropItems];
                                        next[idx] = { ...next[idx], name: e.target.value };
                                        setDropItems(next);
                                    }}
                                    placeholder="아이템 이름"
                                    style={{ ...IS, flex: 2 }}
                                />
                                <input
                                    type="number"
                                    value={item.price}
                                    onChange={e => {
                                        const next = [...dropItems];
                                        next[idx] = { ...next[idx], price: e.target.value };
                                        setDropItems(next);
                                    }}
                                    placeholder="판매가"
                                    style={{ ...IS, flex: 1 }}
                                />
                                {dropItems.length > 1 && (
                                    <button onClick={() => setDropItems(p => p.filter((_, i) => i !== idx))} style={{
                                        background: "#EF4444", color: "#fff", border: "none",
                                        borderRadius: 6, padding: "8px 10px", cursor: "pointer", fontSize: 13,
                                    }}>✕</button>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setDropItems(p => [...p, { name: "", price: "" }])} style={{
                            padding: "8px 0", background: "transparent",
                            border: `0.5px dashed ${T.border}`, borderRadius: 8,
                            color: T.sub, fontSize: 12, cursor: "pointer",
                        }}>+ 아이템 추가</button>
                    </div>
                </div>
            )}

            {/* 에픽던전주화 */}
            {type === "epic" && (
                <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                            <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>획득 메소</label>
                            <input type="number" value={epicMeso} onChange={e => setEpicMeso(e.target.value)} placeholder="0" style={IS} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>기타 수익</label>
                            <input type="number" value={epicEtc} onChange={e => setEpicEtc(e.target.value)} placeholder="0" style={IS} />
                        </div>
                    </div>
                </div>
            )}

            {/* 메모 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <label style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 4 }}>메모</label>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="메모..." style={IS} />
            </div>

            {/* 총 수익 + 저장 */}
            <div style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: T.sub }}>총 수익</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#10B981" }}>
            {calcTotal().toLocaleString()} 메소
          </span>
                </div>
                <button onClick={handleSave} disabled={saving} style={{
                    width: "100%", padding: "12px 0",
                    background: "#534AB7", color: "#fff",
                    border: "none", borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                    {saving ? "저장 중..." : "💰 수익 저장"}
                </button>
            </div>
        </div>
    );
}