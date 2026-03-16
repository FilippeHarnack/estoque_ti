export default function Modal({ titulo, onClose, children, t, maxW = 560 }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{ background: t.surface, borderRadius: 20, padding: 30, width: "100%", maxWidth: maxW, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${t.border}` }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: t.text }}>{titulo}</h2>
          <button onClick={onClose} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14, color: t.textMuted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
