export default function InputField({ label, value, onChange, type, t, half, readOnly, mono }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: half ? "calc(50% - 6px)" : "100%" }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </label>
      )}
      <input
        type={type || "text"}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          padding:     "9px 12px",
          borderRadius: 10,
          border:      `1px solid ${t.borderMed}`,
          fontSize:    14,
          color:       t.text,
          background:  readOnly ? t.bg : t.inputBg,
          fontFamily:  mono ? "monospace" : "inherit",
          outline:     "none",
          width:       "100%",
          boxSizing:   "border-box",
          opacity:     readOnly ? 0.7 : 1,
        }}
      />
    </div>
  );
}
