// 메소 단위 포맷 함수 (예: 1억 2345만 메소)
export function fmt(v) {
    v = Math.round(v);
    const neg = v < 0;
    const abs = Math.abs(v);
    if (abs === 0) return "0메소";
    const ok  = Math.floor(abs / 100000000);
    const man = Math.floor((abs % 100000000) / 10000);
    const won = abs % 10000;
    let r = "";
    if (ok  > 0) r += ok.toLocaleString()  + "억 ";
    if (man > 0) r += man.toLocaleString() + "만 ";
    if (won > 0) r += won.toLocaleString() + "메소";
    if (r.endsWith(" ")) r = r.trimEnd() + "메소";
    return (neg ? "-" : "") + (r.trim() || "0메소");
}

// 로컬 날짜 기준 YYYY-MM-DD 반환 (UTC 오프셋 버그 방지)
export function localDateStr(d) {
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
}