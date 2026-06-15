import React from "react";

export default function Modal({ T, title, onClose, children, wide }) {
    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: T.card,
                    borderRadius: 16,
                    padding: 20,
                    width: wide ? 540 : 360,
                    maxWidth: "90vw",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    border: `0.5px solid ${T.border}`,
                }}
            >
                {/* 헤더 */}
                <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 16,
                }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>
            {title}
          </span>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent", border: "none",
                            fontSize: 18, cursor: "pointer", color: T.sub,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* 내용 */}
                {children}
            </div>
        </div>
    );
}