# gameCord
메이플스토리 강화 시뮬레이터 - Claude AI 기반

## 프로젝트 구조
```
gameCord/
├── web/           - React 18 + Vite 웹 애플리케이션
├── functions/     - Node.js + Express 백엔드 서버
├── desktop/       - Electron 데스크톱 애플리케이션
└── docs/          - 문서
```

## 기술 스택
- **프론트엔드**: React 18, Vite
- **백엔드**: Node.js 22, Express 5
- **데스크톱**: Electron 32
- **AI**: Anthropic Claude Haiku 4.5
- **Database**: Firebase Firestore
- **패키지 관리**: npm 11 (workspaces)

## 설치

### 요구 사항
- Node.js 22.x
- npm 11.x

### 전체 설치
```bash
npm run install:all
```

### 개별 설치
```bash
npm install --workspace=web
npm install --workspace=functions
npm install --workspace=desktop
```

## 개발

### 웹 + 백엔드 동시 실행
```bash
npm run dev
```

### 개별 서버 실행
```bash
npm run dev:web        # 웹 서버 (http://localhost:5173)
npm run dev:functions  # 백엔드 서버 (http://localhost:3001)
npm run dev:desktop    # Electron 앱
```

## 빌드

```bash
npm run build
```

## 환경 변수

### web/.env
```
VITE_API_URL=http://localhost:3001
VITE_ANTHROPIC_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
```

### functions/.env
```
ANTHROPIC_API_KEY=your_key
PORT=3001
FIREBASE_PROJECT_ID=your_project
NEXON_API_KEY=your_key
```

### desktop/.env
```
VITE_API_URL=http://localhost:3001
```

## 주요 기능
- [ ] 강화 비용 계산 (스타포스, 숨결)
- [ ] 큐브 기댓값 분석
- [ ] 보스 수익 분석
- [ ] 최적 강화 경로 추천
- [ ] 장비 가성비 평가

## 개발 진행 상태
- [x] 개발 환경 구축
- [ ] 기능 구현
- [ ] 테스트
- [ ] 배포

## 라이선스
MIT
