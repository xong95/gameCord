import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const categories = [
    {
      id: 'strengthen',
      title: '강화 확률 계산',
      description: '스타포스, 숨결 강화 비용과 성공률을 ㄴㅁㅇ람노ㅓ라ㅣ;ㅈㄷ3ㅗ ㅏㅐ;23ㅗㄱ ',
      icon: '⚡',
      color: '#FF6B6B',
    },
    {
      id: 'bosses',
      title: '쌀먹 계산기',
      description: '보스 사냥으로 얻을 수 있는 수익을 분석합니다',
      icon: '👹',
      color: '#4ECDC4',
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>gameCord</h1>
          <p>메이플스토리 어시스턴트</p>
        </div>
        <div className="user-info">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button onClick={handleLogout} className="logout-btn">
                로그아웃
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="login-btn">
              로그인
            </button>
          )}
        </div>
      </header>

      <main className="home-main">
        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => navigate(`/${category.id}`)}
              style={{ '--card-color': category.color }}
            >
              <div className="card-icon">{category.icon}</div>
              <h2>{category.title}</h2>
              <p>{category.description}</p>
              <div className="card-arrow">→</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="home-footer">
        <p>© 2026 gameCord. 메이플스토리 어시스턴트</p>
      </footer>
    </div>
  );
}
