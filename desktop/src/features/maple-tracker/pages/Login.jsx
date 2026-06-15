import React from "react";

export default function Login({ onLogin, theme }) {
    const T = theme;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: T.bg,
        }}>
            {/* 로고 영역 */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🍁</div>
                <div style={{
                    fontSize: 24, fontWeight: 700,
                    color: T.text, marginBottom: 8,
                }}>
                    메이플 파밍 트래커
                </div>
                <div style={{ fontSize: 14, color: T.sub }}>
                    보스 수익 · 지출 · 통계를 한눈에
                </div>
            </div>

            {/* 로그인 카드 */}
            <div style={{
                background: T.card,
                border: `0.5px solid ${T.border}`,
                borderRadius: 16,
                padding: "32px 40px",
                width: 320,
                textAlign: "center",
            }}>
                <div style={{
                    fontSize: 13, color: T.sub, marginBottom: 24, lineHeight: 1.6,
                }}>
                    Google 계정으로 로그인하면<br />
                    모든 기기에서 데이터가 동기화됩니다.
                </div>

                <button
                    onClick={onLogin}
                    style={{
                        width: "100%",
                        padding: "12px 0",
                        background: "#534AB7",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                    }}
                >
                    <span>🔐</span>
                    <span>Google로 로그인</span>
                </button>
            </div>

            {/* 버전 */}
            <div style={{ marginTop: 24, fontSize: 11, color: T.sub }}>
                MCT ver.0.4.4 Desktop
            </div>
        </div>
    );
}