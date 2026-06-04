import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Firebase Admin 초기화
try {
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
} catch (error) {
  console.warn('Firebase not initialized:', error.message);
}

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API 라우트 예시
app.get('/api/strengthen', (req, res) => {
  res.json({ message: '강화 계산 엔드포인트' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});