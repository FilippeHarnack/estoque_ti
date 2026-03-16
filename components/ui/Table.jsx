export default function Table({ cols, rows, onRowClick, emptyMsg, t }) {
  return (
    <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: t.bg }}>
            {cols.map((c) => (
              <th key={c.label} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length} style={{ padding: 40, textAlign: "center", color: t.textFaint, fontSize: 14 }}>
                {emptyMsg || "Nenhum resultado."}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id || i}
                style={{ borderTop: `1px solid ${t.border}`, background: i % 2 === 0 ? t.surface : t.rowAlt, cursor: onRowClick ? "pointer" : "default" }}
                onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.background = t.surfaceHov; }}
                onMouseLeave={(e) => { if (onRowClick) e.currentTarget.style.background = i % 2 === 0 ? t.surface : t.rowAlt; }}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {cols.map((c) => (
                  <td key={c.label} style={{ padding: "10px 12px", fontSize: 13, color: t.textMuted, verticalAlign: "middle" }}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
