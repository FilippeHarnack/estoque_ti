export default function Btn({ onClick, children, variant = "primary", small, t, disabled }) {
  const styles = {
    primary: { background: t.accent,   color: "#fff", border: "none" },
    danger:  { background: t.danger,   color: "#fff", border: "none" },
    ghost:   { background: t.surface,  color: t.textMuted, border: `1px solid ${t.borderMed}` },
    success: { background: t.success,  color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding:      small ? "5px 11px" : "9px 20px",
        borderRadius: 10,
        cursor:       disabled ? "not-allowed" : "pointer",
        fontFamily:   "inherit",
        fontWeight:   600,
        fontSize:     small ? 12 : 14,
        opacity:      disabled ? 0.5 : 1,
        transition:   "opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
}
