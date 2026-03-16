"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { Btn } from "@/components/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

export default function Header({ title, search, onSearch, actions }) {
  const { t, dark, setDark } = useApp();

  return (
    <header style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
      <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text, flex: 1 }}>{title}</h1>

      {onSearch !== undefined && (
        <div style={{ position: "relative", width: 240 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: t.textFaint, fontSize: 13 }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          <input
            value={search || ""}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar equipamentos…"
            style={{ width: "100%", padding: "7px 12px 7px 30px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, fontSize: 13, color: t.text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>
      )}

      {actions}

      <button onClick={() => setDark((d) => !d)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.bg, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: t.textMuted }}>
        <FontAwesomeIcon icon={dark ? faSun : faMoon} />
      </button>
    </header>
  );
}
