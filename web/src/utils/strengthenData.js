// 강화 단계별 데이터
export const STRENGTHEN_DATA = {
  5: { successRate: 0.95, mesoBase: 50000000, breath: 50, failureType: -1, protectCost: 10000000 },
  6: { successRate: 0.95, mesoBase: 100000000, breath: 60, failureType: -1, protectCost: 20000000 },
  7: { successRate: 0.90, mesoBase: 150000000, breath: 70, failureType: -1, protectCost: 30000000 },
  8: { successRate: 0.90, mesoBase: 250000000, breath: 80, failureType: -1, protectCost: 50000000 },
  9: { successRate: 0.90, mesoBase: 500000000, breath: 90, failureType: -1, protectCost: 100000000 },
  10: { successRate: 0.85, mesoBase: 1000000000, breath: 100, failureType: -1, protectCost: 150000000 },
  11: { successRate: 0.85, mesoBase: 1500000000, breath: 110, failureType: -1, protectCost: 200000000 },
  12: { successRate: 0.85, mesoBase: 2500000000, breath: 120, failureType: -1, protectCost: 300000000 },
  13: { successRate: 0.80, mesoBase: 3500000000, breath: 130, failureType: -2, protectCost: 500000000 },
  14: { successRate: 0.75, mesoBase: 5000000000, breath: 140, failureType: -2, protectCost: 700000000 },
  15: { successRate: 0.70, mesoBase: 7000000000, breath: 150, failureType: -2, protectCost: 1000000000 },
  16: { successRate: 0.65, mesoBase: 10000000000, breath: 160, failureType: -2, protectCost: 1500000000 },
  17: { successRate: 0.60, mesoBase: 15000000000, breath: 170, failureType: -2, protectCost: 2000000000 },
  18: { successRate: 0.50, mesoBase: 20000000000, breath: 180, failureType: -2, protectCost: 3000000000 },
  19: { successRate: 0.45, mesoBase: 30000000000, breath: 190, failureType: -2, protectCost: 4000000000 },
  20: { successRate: 0.40, mesoBase: 40000000000, breath: 200, failureType: -3, protectCost: 5000000000 },
  21: { successRate: 0.35, mesoBase: 50000000000, breath: 210, failureType: -3, protectCost: 7000000000 },
  22: { successRate: 0.30, mesoBase: 60000000000, breath: 220, failureType: -3, protectCost: 10000000000 },
  23: { successRate: 0.25, mesoBase: 75000000000, breath: 230, failureType: -3, protectCost: 12000000000 },
  24: { successRate: 0.20, mesoBase: 100000000000, breath: 240, failureType: -3, protectCost: 15000000000 },
  25: { successRate: 0.15, mesoBase: 150000000000, breath: 250, failureType: -3, protectCost: 20000000000 },
};

// 강화 계산 함수들
export const calculateStrengthenCosts = (fromLevel, toLevel, options = {}) => {
  const {
    useProtect = false,
    useBlackBreath = false,
    dropRateBoost = 0,
  } = options;

  let totalMeso = 0;
  let totalBreath = 0;
  let totalProtectCost = 0;
  let details = [];

  for (let level = fromLevel; level < toLevel; level++) {
    const data = STRENGTHEN_DATA[level];
    if (!data) continue;

    // 성공률 적용 (드롭율 증가 옵션)
    const adjustedRate = Math.min(1, data.successRate + dropRateBoost / 100);

    // 평균 시도 횟수 계산
    const averageAttempts = 1 / adjustedRate;

    // 1단계 강화에 필요한 총 메소
    const costPerLevel = Math.round(data.mesoBase * averageAttempts);
    totalMeso += costPerLevel;

    // 숨결 계산 (블랙 숨결 사용 여부)
    const breathPerAttempt = useBlackBreath ? data.breath * 0.5 : data.breath;
    const totalBreathForLevel = Math.round(data.breath * averageAttempts);
    totalBreath += totalBreathForLevel;

    // 보호 옵션 비용 (보호 옵션 사용 시)
    let protectCostForLevel = 0;
    if (useProtect) {
      protectCostForLevel = Math.round(data.protectCost * averageAttempts);
      totalProtectCost += protectCostForLevel;
    }

    details.push({
      level,
      nextLevel: level + 1,
      successRate: adjustedRate,
      averageAttempts: averageAttempts.toFixed(2),
      mesoPerAttempt: data.mesoBase.toLocaleString(),
      mesoTotal: costPerLevel.toLocaleString(),
      breathTotal: totalBreathForLevel,
      protectCost: protectCostForLevel.toLocaleString(),
    });
  }

  const totalCostWithProtect = totalMeso + totalProtectCost;

  return {
    summary: {
      fromLevel,
      toLevel,
      totalLevels: toLevel - fromLevel,
      totalMeso,
      totalBreath,
      totalProtectCost,
      totalCostWithProtect,
      averageCostPerLevel: Math.round(totalMeso / (toLevel - fromLevel)),
    },
    details,
  };
};

// 기댓값 계산 (1단계 강화)
export const calculateExpectedValue = (level, successRate, mesoBase) => {
  // 기댓값 = 성공률 × 메소비용 + (1-성공률) × (메소비용 + 손실비용)
  // 단순화: 기댓값 = 메소비용 / 성공률
  return Math.round(mesoBase / successRate);
};

// 최악의 경우 비용 계산 (95% 신뢰도)
export const calculateWorstCaseCost = (totalMeso, successRate) => {
  // 포아송 분포를 사용한 대략적 계산
  // 최악: 기댓값 × 2
  return Math.round(totalMeso * 2);
};

// 효율도 평가
export const evaluateEfficiency = (totalCost, levelIncrease) => {
  const costPerLevel = totalCost / levelIncrease;

  if (costPerLevel < 1000000000) {
    return { rating: 5, label: '매우 좋음' };
  } else if (costPerLevel < 5000000000) {
    return { rating: 4, label: '좋음' };
  } else if (costPerLevel < 10000000000) {
    return { rating: 3, label: '보통' };
  } else if (costPerLevel < 20000000000) {
    return { rating: 2, label: '낮음' };
  } else {
    return { rating: 1, label: '매우 낮음' };
  }
};

// 포맷팅 함수
export const formatMeso = (value) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}억`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}백만`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}천`;
  }
  return value.toLocaleString();
};
