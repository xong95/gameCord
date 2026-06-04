import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BossAnalysis.css';

export default function BossAnalysis() {
  const navigate = useNavigate();
  const [bosses, setBosses] = useState([
    { name: '혼테', reward: 55000000, time: 5, selected: false },
    { name: '데미안', reward: 100000000, time: 10, selected: false },
    { name: '루시드', reward: 150000000, time: 15, selected: false },
    { name: '윌', reward: 200000000, time: 20, selected: false },
  ]);

  const [customBoss, setCustomBoss] = useState('');
  const [customReward, setCustomReward] = useState('');
  const [customTime, setCustomTime] = useState('');

  const handleBossToggle = (index) => {
    const updated = [...bosses];
    updated[index].selected = !updated[index].selected;
    setBosses(updated);
  };

  const handleAddCustomBoss = () => {
    if (customBoss && customReward && customTime) {
      setBosses([
        ...bosses,
        {
          name: customBoss,
          reward: parseInt(customReward),
          time: parseInt(customTime),
          selected: true,
        },
      ]);
      setCustomBoss('');
      setCustomReward('');
      setCustomTime('');
    }
  };

  const selectedBosses = bosses.filter((b) => b.selected);
  const totalRevenue = selectedBosses.reduce((acc, b) => acc + b.reward, 0);
  const totalTime = selectedBosses.reduce((acc, b) => acc + b.time, 0);
  const revenuePerMinute = totalTime > 0 ? Math.round(totalRevenue / totalTime) : 0;
  const revenuePerHour = revenuePerMinute * 60;

  return (
    <div className="boss-container">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← 돌아가기
        </button>
        <h1>👹 쌀먹 계산기</h1>
      </header>

      <section className="info-banner">
        <div className="banner-content">
          <h2>🍁 메이플 파밍 트래커</h2>
          <p>메이플스토리 파밍 유저를 위한 수익·지출 전문 관리 도구</p>
          <p className="banner-description">
            보스 결정석 자동 계산, 솔에르다 시세 환산, 캐릭터 INFO 조회, 주간 수익 통계까지 모두 무료로 제공합니다.
          </p>
          <div className="features-highlight">
            <span>⚔️ 보스 수익 자동 계산</span>
            <span>✨ 솔에르다 환산</span>
            <span>📊 수익·지출 통계</span>
            <span>🔍 캐릭터 INFO</span>
          </div>
        </div>
      </section>

      <div className="analysis-content">
        <div className="bosses-list">
          <h2>보스 선택</h2>
          <div className="boss-items">
            {bosses.map((boss, index) => (
              <div key={index} className="boss-item">
                <input
                  type="checkbox"
                  checked={boss.selected}
                  onChange={() => handleBossToggle(index)}
                  id={`boss-${index}`}
                />
                <label htmlFor={`boss-${index}`} className="boss-label">
                  <span className="boss-name">{boss.name}</span>
                  <span className="boss-reward">
                    {(boss.reward / 1000000).toFixed(0)}M
                  </span>
                  <span className="boss-time">{boss.time}분</span>
                </label>
              </div>
            ))}
          </div>

          <div className="custom-boss-form">
            <h3>커스텀 보스 추가</h3>
            <input
              type="text"
              placeholder="보스 이름"
              value={customBoss}
              onChange={(e) => setCustomBoss(e.target.value)}
              className="custom-input"
            />
            <input
              type="number"
              placeholder="보상 (메소)"
              value={customReward}
              onChange={(e) => setCustomReward(e.target.value)}
              className="custom-input"
            />
            <input
              type="number"
              placeholder="소요 시간 (분)"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="custom-input"
            />
            <button onClick={handleAddCustomBoss} className="add-btn">
              추가
            </button>
          </div>
        </div>

        <div className="analysis-result">
          <h2>수익 분석</h2>
          {selectedBosses.length > 0 ? (
            <div className="result-details">
              <div className="result-item">
                <label>선택한 보스</label>
                <div className="result-value">
                  <span>{selectedBosses.length}개</span>
                </div>
              </div>
              <div className="result-item">
                <label>총 소요 시간</label>
                <div className="result-value">
                  <span className="time">{totalTime}</span>
                  <span className="unit">분</span>
                </div>
              </div>
              <div className="result-item">
                <label>총 보상</label>
                <div className="result-value">
                  <span className="reward">
                    {(totalRevenue / 1000000).toFixed(1)}
                  </span>
                  <span className="unit">M</span>
                </div>
              </div>

              <div className="divider"></div>

              <div className="result-item highlight">
                <label>분당 수익</label>
                <div className="result-value">
                  <span className="highlight-value">
                    {(revenuePerMinute / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
              <div className="result-item highlight">
                <label>시간당 수익</label>
                <div className="result-value">
                  <span className="highlight-value">
                    {(revenuePerHour / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>

              <div className="recommended">
                <p>💡 최고 효율: 시간당 {(revenuePerHour / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>보스를 선택하여 수익을 분석하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
