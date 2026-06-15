// 캐릭터별 A/B 유형 고려한 수익 계산
export function calcIncome(r, favorites) {
    if (!r || r.kind !== "income") return 0;
    const fav = favorites?.find(f => f.nickname === r.nickname);

    let inc = r.totalIncome || 0;

    // 솔에르다 B유형 체크
    const solType      = fav?.solType || "A";
    const solApplyDate = fav?.solApplyDate || "";
    if (solType === "B" && (!solApplyDate || r.date >= solApplyDate)) {
        inc -= (r.totalSol || 0);
    }

    // 물욕템 B유형 체크
    const dropType      = fav?.dropType || "A";
    const dropApplyDate = fav?.dropApplyDate || "";
    if (dropType === "B" && r.type === "drop" && (!dropApplyDate || r.date >= dropApplyDate)) {
        inc -= ((r.meso || 0) + (r.etc || 0));
    }

    return Math.max(0, inc);
}

// 솔에르다만 추출 (통계 유형별 계산용)
export function calcSolIncome(r, favorites) {
    if (!r || r.kind !== "income") return 0;
    const fav          = favorites?.find(f => f.nickname === r.nickname);
    const solType      = fav?.solType || "A";
    const solApplyDate = fav?.solApplyDate || "";
    if (solType === "B" && (!solApplyDate || r.date >= solApplyDate)) return 0;
    return r.totalSol || 0;
}