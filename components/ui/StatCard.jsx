export default function StatCard({ label, value, icon, accent, sub, onClick, t }) {
  return (
    <div
      onClick={onClick}
      style={{ background: t.surface, borderRadius: 16, padding: "18px 20px", border: `1px solid ${t.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 7, flex: 1, minWidth: 140, cursor: onClick ? "pointer" : "default", transition: "transform 0.15s", userSelect: "none" }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 12, color: t.textFaint, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 17, background: accent + "22", borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: t.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: t.textFaint }}>{sub}</div>}
    </div>
  );
}
