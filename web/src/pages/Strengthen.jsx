import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  calculateStrengthenCosts,
  evaluateEfficiency,
  formatMeso,
  calculateWorstCaseCost,
  STRENGTHEN_DATA,
} from '../utils/strengthenData';
import './Strengthen.css';

export default function Strengthen() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(5);
  const [targetLevel, setTargetLevel] = useState(10);
  const [useProtect, setUseProtect] = useState(false);
  const [useBlackBreath, setUseBlackBreath] = useState(false);
  const [dropRateBoost, setDropRateBoost] = useState(0);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    if (currentLevel >= targetLevel) {
      alert('목표 단계가 현재 단계보다 높아야 합니다.');
      return;
    }

    const costs = calculateStrengthenCosts(currentLevel, targetLevel, {
      useProtect,
      useBlackBreath,
      dropRateBoost,
    });

    const efficiency = evaluateEfficiency(costs.summary.totalCostWithProtect, costs.summary.totalLevels);
    const worstCase = calculateWorstCaseCost(costs.summary.totalCostWithProtect, 0.5);

    setResult({
      ...costs.summary,
      efficiency,
      worstCase,
      details: costs.details,
    });
  };

  const maxLevel = 25;

  return (
    <div className="strengthen-container">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← 돌아가기
        </button>
        <h1>⚡ 강화 비용 시뮬레이터</h1>
      </header>

      <div className="strengthen-content">
        {/* 입력 폼 섹션 */}
        <div className="input-section">
          <h2>강화 설정</h2>

          <div className="form-grid">
            {/* 현재 단계 */}
            <div className="form-group">
              <label>현재 강화 단계</label>
              <div className="input-with-slider">
                <input
                  type="number"
                  min="5"
                  max={maxLevel - 1}
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(parseInt(e.target.value) || 5)}
                  className="level-input"
                />
                <span className="unit">강</span>
              </div>
              <input
                type="range"
                min="5"
                max={maxLevel - 1}
                value={currentLevel}
                onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
                className="slider"
              />
            </div>

            {/* 목표 단계 */}
            <div className="form-group">
              <label>목표 강화 단계</label>
              <div className="input-with-slider">
                <input
                  type="number"
                  min={currentLevel + 1}
                  max={maxLevel}
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(parseInt(e.target.value) || currentLevel + 1)}
                  className="level-input"
                />
                <span className="unit">강</span>
              </div>
              <input
                type="range"
                min={currentLevel + 1}
                max={maxLevel}
                value={targetLevel}
                onChange={(e) => setTargetLevel(parseInt(e.target.value))}
                className="slider"
              />
            </div>

            {/* 드롭율 증가 */}
            <div className="form-group">
              <label>드롭율 증가 옵션</label>
              <div className="input-with-slider">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={dropRateBoost}
                  onChange={(e) => setDropRateBoost(parseInt(e.target.value) || 0)}
                  className="level-input"
                />
                <span className="unit">%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={dropRateBoost}
                onChange={(e) => setDropRateBoost(parseInt(e.target.value))}
                className="slider"
              />
            </div>
          </div>

          {/* 옵션 체크박스 */}
          <div className="options-section">
            <h3>옵션</h3>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={useProtect}
                  onChange={(e) => setUseProtect(e.target.checked)}
                />
                <span className="checkbox-label">보호 옵션 사용 (+비용)</span>
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={useBlackBreath}
                  onChange={(e) => setUseBlackBreath(e.target.checked)}
                />
                <span className="checkbox-label">블랙 숨결 사용 (숨결 -50%)</span>
              </label>
            </div>
          </div>

          {/* 계산 버튼 */}
          <button onClick={handleCalculate} className="calculate-btn">
            계산하기
          </button>
        </div>

        {/* 결과 섹션 */}
        {result && (
          <div className="result-section">
            {/* 요약 정보 */}
            <div className="summary-card">
              <h2>📊 강화 분석 결과</h2>

              <div className="summary-grid">
                <div className="summary-item">
                  <div className="label">필요한 숨결</div>
                  <div className="value">{result.totalBreath.toLocaleString()}개</div>
                </div>

                <div className="summary-item">
                  <div className="label">예상 총 비용</div>
                  <div className="value highlight">{formatMeso(result.totalMeso)}</div>
                </div>

                {useProtect && (
                  <div className="summary-item">
                    <div className="label">보호 옵션 비용</div>
                    <div className="value">{formatMeso(result.totalProtectCost)}</div>
                  </div>
                )}

                <div className="summary-item">
                  <div className="label">최악의 경우 비용</div>
                  <div className="value warning">{formatMeso(result.worstCase)}</div>
                </div>

                <div className="summary-item">
                  <div className="label">1단계당 평균 비용</div>
                  <div className="value">{formatMeso(result.averageCostPerLevel)}</div>
                </div>

                <div className="summary-item">
                  <div className="label">가성비 평가</div>
                  <div className={`value rating-${result.efficiency.rating}`}>
                    {'⭐'.repeat(result.efficiency.rating)} {result.efficiency.label}
                  </div>
                </div>
              </div>

              {result.totalProtectCost > 0 && (
                <div className="cost-breakdown">
                  <p>💡 보호 옵션 포함 총 비용: <strong>{formatMeso(result.totalCostWithProtect)}</strong></p>
                </div>
              )}
            </div>

            {/* 상세 데이터 테이블 */}
            <div className="details-card">
              <h2>📋 단계별 상세 정보</h2>
              <div className="table-wrapper">
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>단계</th>
                      <th>성공률</th>
                      <th>평균 시도</th>
                      <th>1회 비용</th>
                      <th>총 비용</th>
                      <th>숨결</th>
                      {useProtect && <th>보호 비용</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {result.details.map((detail, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'even' : 'odd'}>
                        <td className="level">{detail.level}강 → {detail.nextLevel}강</td>
                        <td className="rate">{(detail.successRate * 100).toFixed(0)}%</td>
                        <td className="attempts">{detail.averageAttempts}회</td>
                        <td className="cost">{detail.mesoPerAttempt}</td>
                        <td className="cost highlight">{detail.mesoTotal}</td>
                        <td className="breath">{detail.breathTotal}개</td>
                        {useProtect && <td className="cost">{detail.protectCost}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 팁 섹션 */}
            <div className="tips-card">
              <h2>💡 강화 팁</h2>
              <div className="tips-content">
                {result.efficiency.rating >= 4 ? (
                  <p>✓ 현재 단계에서 강화하기 좋습니다! 성공 확률이 높아서 비용 대비 효율이 좋습니다.</p>
                ) : result.efficiency.rating >= 3 ? (
                  <p>△ 현재 단계는 보통 수준입니다. 서서히 진행하거나 자본금을 모은 후 진행하세요.</p>
                ) : (
                  <p>✗ 현재 단계는 매우 비쌉니다. 더 높은 레벨의 장비를 사용하거나, 자본금을 충분히 모은 후 진행하세요.</p>
                )}

                {dropRateBoost === 0 && (
                  <p>💾 드롭율 증가 옵션을 사용하면 성공률을 높일 수 있습니다!</p>
                )}

                {currentLevel >= 15 && (
                  <p>⚠️ 15강 이상에서는 실패 시 단계가 크게 떨어질 수 있습니다. 보호 옵션 사용을 고려하세요.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
