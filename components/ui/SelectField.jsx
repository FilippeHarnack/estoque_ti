export default function SelectField({ label, value, onChange, opts, t, half }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: half ? "calc(50% - 6px)" : "100%" }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        style={{
          padding:     "9px 12px",
          borderRadius: 10,
          border:      `1px solid ${t.borderMed}`,
          fontSize:    14,
          color:       t.text,
          background:  t.inputBg,
          fontFamily:  "inherit",
          outline:     "none",
          cursor:      "pointer",
          width:       "100%",
          boxSizing:   "border-box",
        }}
      >
        {opts.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
