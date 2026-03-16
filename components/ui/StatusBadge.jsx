import { STATUSES } from "@/lib/constants";

export default function StatusBadge({ status, dark }) {
  const s = STATUSES[status] || STATUSES["Disponível"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, background: dark ? s.bgDk : s.bg, border: `1px solid ${s.color}33` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
}
