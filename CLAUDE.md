# gameCord 프로젝트 가이드

## 프로젝트 정보
- **프로젝트명**: gameCord
- **목적**: 메이플스토리 강화 시뮬레이터 (Claude AI 기반)
- **상태**: 개발 환경 구축 완료

## 현재 환경 구조

### 파일 구조
```
gameCord/
├── web/               - React 18 + Vite 웹앱
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env
│   └── .env.local
├── functions/         - Node.js + Express 백엔드
│   ├── src/
│   │   └── index.js   (Express 서버)
│   ├── package.json
│   ├── .env
│   └── .env.local
├── desktop/           - Electron 데스크톱 앱
│   ├── src/
│   │   ├── main.js    (Electron 메인 프로세스)
│   │   ├── preload.js (프리로드 스크립트)
│   │   ├── App.jsx    (React 컴포넌트)
│   │   └── index.jsx  (React 진입점)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
├── package.json       (루트 - 워크스페이스)
├── .gitignore
└── README.md
```

## API 서버 구조

### 포트
- **웹**: localhost:5173 (Vite)
- **백엔드**: localhost:3001 (Express)
- **Electron**: 로컬 앱

### 현재 구현된 엔드포인트
- `GET /health` - 헬스 체크
- `GET /api/strengthen` - 강화 계산 (예시)

## 환경 변수 관리

### 개발 환경 (.env.local)
- 각 워크스페이스의 `.env.local`에 실제 API 키를 입력합니다
- Git에 커밋되지 않습니다

### 프로덕션 환경 (.env)
- 기본값만 포함합니다
- 실제 값은 배포 시 주입합니다

## npm 스크립트

```bash
npm run dev              # 웹 + 백엔드 동시 실행
npm run dev:web         # 웹만 실행
npm run dev:functions   # 백엔드만 실행
npm run dev:desktop     # Electron 앱 실행
npm run build           # 전체 빌드
npm run lint            # ESLint 실행
npm run install:all     # 전체 워크스페이스 설치
```

## 개발 체크리스트

### 필수 API 키
- [ ] Anthropic Claude API 키 (functions/.env.local)
- [ ] Firebase 프로젝트 ID (functions, web/.env.local)
- [ ] Nexon API 키 (functions/.env.local)

### 다음 단계
1. 실제 API 키를 .env.local 파일에 입력
2. npm install 실행 후 서버 실행 테스트
3. 기능 구현 시작 (강화 계산, 데이터 분석 등)

## 주의사항
- `.env.local` 파일은 절대 Git에 커밋하지 말 것
- 각 워크스페이스는 독립적인 `package.json`을 가짐
- 웹과 Electron은 동일한 React 코드 재사용 가능
