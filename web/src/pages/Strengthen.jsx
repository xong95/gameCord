import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  calculateStrengthenCosts,
  evaluateEfficiency,
  formatMeso,
  calculateWorstCaseCost,
  STARFORCE_DATA,
  BLACK_BREATH_DATA,
  CUBE_DATA,
  MAPLE_CUBE_DATA,
  EQUIPMENT_SCROLL_DATA,
  RECLAMATION_DATA,
} from '../utils/strengthenData';
import './Strengthen.css';

export default function Strengthen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('starforce');

  // 공통 상태
  const [result, setResult] = useState(null);

  // 스타포스 상태
  const [sfCurrentLevel, setSfCurrentLevel] = useState(5);
  const [sfTargetLevel, setSfTargetLevel] = useState(10);
  const [sfUseProtect, setSfUseProtect] = useState(false);
  const [sfDropRateBoost, setSfDropRateBoost] = useState(0);

  // 블랙 숨결 상태
  const [bbCurrentLevel, setBbCurrentLevel] = useState(5);
  const [bbTargetLevel, setBbTargetLevel] = useState(10);
  const [bbCount, setBbCount] = useState(1);

  // 큐브 상태
  const [cubeType, setCubeType] = useState('normal');
  const [cubeRank, setCubeRank] = useState('에픽');
  const [cubeCount, setCubeCount] = useState(10);
  const [cubeCategory, setCubeCategory] = useState('normal');

  // 메이플 큐브 상태
  const [mcType, setMcType] = useState('normal');
  const [mcRank, setMcRank] = useState('에픽');
  const [mcCount, setMcCount] = useState(10);
  const [mcCategory, setMcCategory] = useState('normal');

  // 착용 주문서 상태
  const [esCurrentEnhance, setEsCurrentEnhance] = useState(1);
  const [esTargetEnhance, setEsTargetEnhance] = useState(5);

  // 재련 상태
  const [recCurrentLevel, setRecCurrentLevel] = useState(1);
  const [recTargetLevel, setRecTargetLevel] = useState(5);

  // 스타포스 계산
  const handleCalculateStarforce = () => {
    if (sfCurrentLevel >= sfTargetLevel) {
      alert('목표 단계가 현재 단계보다 높아야 합니다.');
      return;
    }

    const costs = calculateStrengthenCosts(sfCurrentLevel, sfTargetLevel, {
      useProtect: sfUseProtect,
      useBlackBreath: false,
      dropRateBoost: sfDropRateBoost,
    });

    const efficiency = evaluateEfficiency(costs.summary.totalCostWithProtect, costs.summary.totalLevels);
    const worstCase = calculateWorstCaseCost(costs.summary.totalCostWithProtect, 0.5);

    setResult({
      type: 'starforce',
      ...costs.summary,
      efficiency,
      worstCase,
      details: costs.details,
    });
  };

  // 블랙 숨결 계산
  const handleCalculateBlackBreath = () => {
    if (bbCurrentLevel >= bbTargetLevel) {
      alert('목표 단계가 현재 단계보다 높아야 합니다.');
      return;
    }

    let totalAttempts = 0;
    let totalBreathCost = 0;
    let details = [];

    for (let level = bbCurrentLevel; level < bbTargetLevel; level++) {
      const data = BLACK_BREATH_DATA[level];
      if (!data) continue;

      const averageAttempts = 1 / data.successRate;
      const breathForLevel = Math.round(data.breathCost * averageAttempts * bbCount);
      totalAttempts += averageAttempts;
      totalBreathCost += data.breathCost * averageAttempts * bbCount;

      details.push({
        level,
        successRate: data.successRate,
        averageAttempts: averageAttempts.toFixed(2),
        breathCost: breathForLevel,
      });
    }

    setResult({
      type: 'blackBreath',
      fromLevel: bbCurrentLevel,
      toLevel: bbTargetLevel,
      totalLevels: bbTargetLevel - bbCurrentLevel,
      totalAttempts: totalAttempts.toFixed(2),
      totalBreathCost: Math.round(totalBreathCost),
      quantity: bbCount,
      details,
    });
  };

  // 큐브 계산
  const handleCalculateCube = () => {
    const cubeData = CUBE_DATA[cubeCategory];
    const selectedCube = cubeData.find(c => c.rank === cubeRank);

    if (!selectedCube) return;

    const successCount = Math.round(cubeCount * selectedCube.successRate);
    const totalCost = cubeCount * selectedCube.cost;
    const costPerSuccess = Math.round(totalCost / successCount);

    setResult({
      type: 'cube',
      cubeType: cubeCategory,
      cubeRank,
      quantity: cubeCount,
      successRate: selectedCube.successRate,
      costPerCube: selectedCube.cost,
      expectedSuccesses: successCount,
      totalCost,
      costPerSuccess,
    });
  };

  // 메이플 큐브 계산
  const handleCalculateMapleCube = () => {
    const mcData = MAPLE_CUBE_DATA[mcCategory];
    const selectedCube = mcData.find(c => c.rank === mcRank);

    if (!selectedCube) return;

    const successCount = Math.round(mcCount * selectedCube.successRate);
    const totalCost = mcCount * selectedCube.cost;
    const costPerSuccess = Math.round(totalCost / successCount);

    setResult({
      type: 'mapleCube',
      cubeType: mcCategory,
      cubeRank: mcRank,
      quantity: mcCount,
      successRate: selectedCube.successRate,
      costPerCube: selectedCube.cost,
      expectedSuccesses: successCount,
      totalCost,
      costPerSuccess,
    });
  };

  // 착용 주문서 계산
  const handleCalculateEquipmentScroll = () => {
    if (esCurrentEnhance >= esTargetEnhance) {
      alert('목표 강화가 현재 강화보다 높아야 합니다.');
      return;
    }

    let totalCost = 0;
    let details = [];

    for (let enhance = esCurrentEnhance; enhance < esTargetEnhance; enhance++) {
      const data = EQUIPMENT_SCROLL_DATA[enhance];
      if (!data) continue;

      const averageAttempts = 1 / data.successRate;
      const costForLevel = Math.round(data.cost * averageAttempts);
      totalCost += costForLevel;

      details.push({
        enhance,
        successRate: data.successRate,
        averageAttempts: averageAttempts.toFixed(2),
        costPerAttempt: data.cost,
        totalCost: costForLevel,
      });
    }

    setResult({
      type: 'equipmentScroll',
      fromEnhance: esCurrentEnhance,
      toEnhance: esTargetEnhance,
      totalEnhances: esTargetEnhance - esCurrentEnhance,
      totalCost,
      details,
    });
  };

  // 재련 계산
  const handleCalculateReclamation = () => {
    if (recCurrentLevel >= recTargetLevel) {
      alert('목표 레벨이 현재 레벨보다 높아야 합니다.');
      return;
    }

    let totalCost = 0;
    let details = [];

    for (let level = recCurrentLevel; level < recTargetLevel; level++) {
      const data = RECLAMATION_DATA[level];
      if (!data) continue;

      const averageAttempts = 1 / data.successRate;
      const costForLevel = Math.round(data.cost * averageAttempts);
      totalCost += costForLevel;

      details.push({
        level,
        successRate: data.successRate,
        averageAttempts: averageAttempts.toFixed(2),
        cost: data.cost,
        totalCost: costForLevel,
      });
    }

    setResult({
      type: 'reclamation',
      fromLevel: recCurrentLevel,
      toLevel: recTargetLevel,
      totalLevels: recTargetLevel - recCurrentLevel,
      totalCost,
      details,
    });
  };

  return (
    <div className="strengthen-container">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← 돌아가기
        </button>
        <h1>⚡ 강화 시뮬레이터</h1>
      </header>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        {[
          { id: 'starforce', label: '스타포스', icon: '⭐' },
          { id: 'blackBreath', label: '블랙숨결', icon: '🌙' },
          { id: 'cube', label: '큐브', icon: '🎲' },
          { id: 'mapleCube', label: '메이플큐브', icon: '🍁' },
          { id: 'equipmentScroll', label: '착용주문서', icon: '📜' },
          { id: 'reclamation', label: '재련', icon: '🔥' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setResult(null);
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="strengthen-content">
        {/* 스타포스 탭 */}
        {activeTab === 'starforce' && (
          <div className="tab-content">
            <div className="input-section">
              <h2>스타포스 강화</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>현재 강화 단계</label>
                  <div className="input-with-slider">
                    <input
                      type="number"
                      min="5"
                      max="24"
                      value={sfCurrentLevel}
                      onChange={(e) => setSfCurrentLevel(parseInt(e.target.value) || 5)}
                      className="level-input"
                    />
                    <span className="unit">강</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="24"
                    value={sfCurrentLevel}
                    onChange={(e) => setSfCurrentLevel(parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="form-group">
                  <label>목표 강화 단계</label>
                  <div className="input-with-slider">
                    <input
                      type="number"
                      min={sfCurrentLevel + 1}
                      max="25"
                      value={sfTargetLevel}
                      onChange={(e) => setSfTargetLevel(parseInt(e.target.value) || sfCurrentLevel + 1)}
                      className="level-input"
                    />
                    <span className="unit">강</span>
                  </div>
                  <input
                    type="range"
                    min={sfCurrentLevel + 1}
                    max="25"
                    value={sfTargetLevel}
                    onChange={(e) => setSfTargetLevel(parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="form-group">
                  <label>드롭율 증가</label>
                  <div className="input-with-slider">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={sfDropRateBoost}
                      onChange={(e) => setSfDropRateBoost(parseInt(e.target.value) || 0)}
                      className="level-input"
                    />
                    <span className="unit">%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={sfDropRateBoost}
                    onChange={(e) => setSfDropRateBoost(parseInt(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>

              <div className="options-section">
                <h3>옵션</h3>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={sfUseProtect}
                    onChange={(e) => setSfUseProtect(e.target.checked)}
                  />
                  <span className="checkbox-label">보호 옵션 사용</span>
                </label>
              </div>

              <button onClick={handleCalculateStarforce} className="calculate-btn">
                계산하기
              </button>
            </div>

            {result && result.type === 'starforce' && (
              <div className="result-section">
                <StarforceResult result={result} />
              </div>
            )}
          </div>
        )}

        {/* 블랙 숨결 탭 */}
        {activeTab === 'blackBreath' && (
          <div className="tab-content">
            <div className="input-section">
              <h2>블랙 숨결 강화</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>현재 강화 단계</label>
                  <input
                    type="number"
                    min="5"
                    max="14"
                    value={bbCurrentLevel}
                    onChange={(e) => setBbCurrentLevel(parseInt(e.target.value) || 5)}
                    className="level-input"
                  />
                </div>

                <div className="form-group">
                  <label>목표 강화 단계</label>
                  <input
                    type="number"
                    min={bbCurrentLevel + 1}
                    max="15"
                    value={bbTargetLevel}
                    onChange={(e) => setBbTargetLevel(parseInt(e.target.value) || bbCurrentLevel + 1)}
                    className="level-input"
                  />
                </div>

                <div className="form-group">
                  <label>강화할 개수</label>
                  <input
                    type="number"
                    min="1"
                    value={bbCount}
                    onChange={(e) => setBbCount(parseInt(e.target.value) || 1)}
                    className="level-input"
                  />
                </div>
              </div>

              <button onClick={handleCalculateBlackBreath} className="calculate-btn">
                계산하기
              </button>
            </div>

            {result && result.type === 'blackBreath' && (
              <div className="result-section">
                <BlackBreathResult result={result} />
              </div>
            )}
          </div>
        )}

        {/* 큐브 탭 */}
        {activeTab === 'cube' && (
          <div className="tab-content">
            <div className="input-section">
              <h2>큐브</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>큐브 종류</label>
                  <select
                    value={cubeCategory}
                    onChange={(e) => setCubeCategory(e.target.value)}
                    className="select-input"
                  >
                    <option value="normal">일반 큐브</option>
                    <option value="premium">프리미엄 큐브</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>등급</label>
                  <select
                    value={cubeRank}
                    onChange={(e) => setCubeRank(e.target.value)}
                    className="select-input"
                  >
                    <option value="일반">일반</option>
                    <option value="레어">레어</option>
                    <option value="에픽">에픽</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>개수</label>
                  <input
                    type="number"
                    min="1"
                    value={cubeCount}
                    onChange={(e) => setCubeCount(parseInt(e.target.value) || 1)}
                    className="level-input"
                  />
                </div>
              </div>

              <button onClick={handleCalculateCube} className="calculate-btn">
                계산하기
              </button>
            </div>

            {result && result.type === 'cube' && (
              <div className="result-section">
                <CubeResult result={result} />
              </div>
            )}
          </div>
        )}

        {/* 메이플 큐브 탭 */}
        {activeTab === 'mapleCube' && (
          <div className="tab-content">
            <div className="input-section">
              <h2>메이플 큐브</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>큐브 종류</label>
                  <select
                    value={mcCategory}
                    onChange={(e) => setMcCategory(e.target.value)}
                    className="select-input"
                  >
                    <option value="normal">일반 메이플 큐브</option>
                    <option value="premium">프리미엄 메이플 큐브</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>등급</label>
                  <select
                    value={mcRank}
                    onChange={(e) => setMcRank(e.target.value)}
                    className="select-input"
                  >
                    <option value="일반">일반</option>
                    <option value="레어">레어</option>
                    <option value="에픽">에픽</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>개수</label>
                  <input
                    type="number"
                    min="1"
                    value={mcCount}
                    onChange={(e) => setMcCount(parseInt(e.target.value) || 1)}
                    className="level-input"
                  />
                </div>
              </div>

              <button onClick={handleCalculateMapleCube} className="calculate-btn">
                계산하기
              </button>
            </div>

            {result && result.type === 'mapleCube' && (
              <div className="result-section">
                <MapleCubeResult result={result} />
              </div>
            )}
          </div>
        )}

        {/* 착용 주문서 탭 */}
        {activeTab === 'equipmentScroll' && (
          <div className="tab-content">
            <div className="input-section">
              <h2>착용 주문서</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>현재 강화</label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={esCurrentEnhance}
                    onChange={(e) => setEsCurrentEnhance(parseInt(e.target.value) || 1)}
                    className="level-input"
                  />
                </div>

                <div className="form-group">
                  <label>목표 강화</label>
                  <input
                    type="number"
                    min={esCurrentEnhance + 1}
                    max="10"
                    value={esTargetEnhance}
                    onChange={(e) => setEsTargetEnhance(parseInt(e.target.value) || esCurrentEnhance + 1)}
                    className="level-input"
                  />
                </div>
              </div>

              <button onClick={handleCalculateEquipmentScroll} className="calculate-btn">
                계산하기
              </button>
            </div>

            {result && result.type === 'equipmentScroll' && (
              <div className="result-section">
                <EquipmentScrollResult result={result} />
              </div>
            )}
          </div>
        )}

        {/* 재련 탭 */}
        {activeTab === 'reclamation' && (
          <div className="tab-content">
            <div className="input-section">
              <h2>재련</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>현재 레벨</label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={recCurrentLevel}
                    onChange={(e) => setRecCurrentLevel(parseInt(e.target.value) || 1)}
                    className="level-input"
                  />
                </div>

                <div className="form-group">
                  <label>목표 레벨</label>
                  <input
                    type="number"
                    min={recCurrentLevel + 1}
                    max="10"
                    value={recTargetLevel}
                    onChange={(e) => setRecTargetLevel(parseInt(e.target.value) || recCurrentLevel + 1)}
                    className="level-input"
                  />
                </div>
              </div>

              <button onClick={handleCalculateReclamation} className="calculate-btn">
                계산하기
              </button>
            </div>

            {result && result.type === 'reclamation' && (
              <div className="result-section">
                <ReclamationResult result={result} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 결과 표시 컴포넌트들
function StarforceResult({ result }) {
  return (
    <>
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
          <div className="summary-item">
            <div className="label">최악의 경우</div>
            <div className="value warning">{formatMeso(result.worstCase)}</div>
          </div>
          <div className="summary-item">
            <div className="label">가성비</div>
            <div className={`value rating-${result.efficiency.rating}`}>
              {'⭐'.repeat(result.efficiency.rating)} {result.efficiency.label}
            </div>
          </div>
        </div>
      </div>
      <div className="details-card">
        <h2>📋 단계별 상세</h2>
        <div className="table-wrapper">
          <table className="details-table">
            <thead>
              <tr>
                <th>단계</th>
                <th>성공률</th>
                <th>평균 시도</th>
                <th>총 비용</th>
              </tr>
            </thead>
            <tbody>
              {result.details.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? 'even' : 'odd'}>
                  <td>{d.level}→{d.nextLevel}</td>
                  <td>{(d.successRate * 100).toFixed(0)}%</td>
                  <td>{d.averageAttempts}회</td>
                  <td className="highlight">{d.mesoTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function BlackBreathResult({ result }) {
  return (
    <div className="summary-card">
      <h2>📊 블랙 숨결 계산 결과</h2>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="label">강화 단계</div>
          <div className="value">{result.fromLevel}→{result.toLevel}</div>
        </div>
        <div className="summary-item">
          <div className="label">필요한 숨결</div>
          <div className="value highlight">{result.totalBreathCost.toLocaleString()}개</div>
        </div>
        <div className="summary-item">
          <div className="label">강화 개수</div>
          <div className="value">{result.quantity}개</div>
        </div>
        <div className="summary-item">
          <div className="label">평균 시도</div>
          <div className="value">{result.totalAttempts}회</div>
        </div>
      </div>
    </div>
  );
}

function CubeResult({ result }) {
  return (
    <div className="summary-card">
      <h2>📊 큐브 계산 결과</h2>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="label">큐브 종류</div>
          <div className="value">{result.cubeType === 'normal' ? '일반' : '프리미엄'}</div>
        </div>
        <div className="summary-item">
          <div className="label">등급</div>
          <div className="value">{result.cubeRank}</div>
        </div>
        <div className="summary-item">
          <div className="label">사용 개수</div>
          <div className="value">{result.quantity}개</div>
        </div>
        <div className="summary-item">
          <div className="label">성공률</div>
          <div className="value">{(result.successRate * 100).toFixed(0)}%</div>
        </div>
        <div className="summary-item">
          <div className="label">예상 성공</div>
          <div className="value highlight">{result.expectedSuccesses}회</div>
        </div>
        <div className="summary-item">
          <div className="label">총 비용</div>
          <div className="value">{formatMeso(result.totalCost)}</div>
        </div>
        <div className="summary-item">
          <div className="label">성공당 비용</div>
          <div className="value warning">{formatMeso(result.costPerSuccess)}</div>
        </div>
      </div>
    </div>
  );
}

function MapleCubeResult({ result }) {
  return (
    <div className="summary-card">
      <h2>📊 메이플 큐브 계산 결과</h2>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="label">큐브 종류</div>
          <div className="value">{result.cubeType === 'normal' ? '일반' : '프리미엄'}</div>
        </div>
        <div className="summary-item">
          <div className="label">등급</div>
          <div className="value">{result.cubeRank}</div>
        </div>
        <div className="summary-item">
          <div className="label">사용 개수</div>
          <div className="value">{result.quantity}개</div>
        </div>
        <div className="summary-item">
          <div className="label">성공률</div>
          <div className="value">{(result.successRate * 100).toFixed(0)}%</div>
        </div>
        <div className="summary-item">
          <div className="label">예상 성공</div>
          <div className="value highlight">{result.expectedSuccesses}회</div>
        </div>
        <div className="summary-item">
          <div className="label">총 비용</div>
          <div className="value">{formatMeso(result.totalCost)}</div>
        </div>
      </div>
    </div>
  );
}

function EquipmentScrollResult({ result }) {
  return (
    <>
      <div className="summary-card">
        <h2>📊 착용 주문서 계산 결과</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="label">강화 범위</div>
            <div className="value">{result.fromEnhance}→{result.toEnhance}</div>
          </div>
          <div className="summary-item">
            <div className="label">총 비용</div>
            <div className="value highlight">{formatMeso(result.totalCost)}</div>
          </div>
        </div>
      </div>
      <div className="details-card">
        <h2>📋 강화별 상세</h2>
        <div className="table-wrapper">
          <table className="details-table">
            <thead>
              <tr>
                <th>강화</th>
                <th>성공률</th>
                <th>평균 시도</th>
                <th>총 비용</th>
              </tr>
            </thead>
            <tbody>
              {result.details.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? 'even' : 'odd'}>
                  <td>+{d.enhance}</td>
                  <td>{(d.successRate * 100).toFixed(0)}%</td>
                  <td>{d.averageAttempts}회</td>
                  <td className="highlight">{formatMeso(d.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ReclamationResult({ result }) {
  return (
    <>
      <div className="summary-card">
        <h2>📊 재련 계산 결과</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="label">재련 범위</div>
            <div className="value">{result.fromLevel}→{result.toLevel}</div>
          </div>
          <div className="summary-item">
            <div className="label">총 비용</div>
            <div className="value highlight">{formatMeso(result.totalCost)}</div>
          </div>
        </div>
      </div>
      <div className="details-card">
        <h2>📋 레벨별 상세</h2>
        <div className="table-wrapper">
          <table className="details-table">
            <thead>
              <tr>
                <th>레벨</th>
                <th>성공률</th>
                <th>평균 시도</th>
                <th>총 비용</th>
              </tr>
            </thead>
            <tbody>
              {result.details.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? 'even' : 'odd'}>
                  <td>Lv.{d.level}</td>
                  <td>{(d.successRate * 100).toFixed(0)}%</td>
                  <td>{d.averageAttempts}회</td>
                  <td className="highlight">{formatMeso(d.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
