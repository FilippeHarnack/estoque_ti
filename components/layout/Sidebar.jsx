"use client";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

const NAV_ITEMS = [
  { href: "/dashboard",      icon: "◉",  label: "Visão Geral"   },
  { href: "/equipamentos",   icon: "⊞",  label: "Equipamentos"  },
  { href: "/movimentacoes",  icon: "↕",  label: "Movimentações" },
  { href: "/historico",      icon: "📋", label: "Histórico"     },
  { href: "/relatorios",     icon: "📊", label: "Relatórios"    },
  { href: "/seguranca",      icon: "🔐", label: "Segurança", adminOnly: true },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { t, sessao, podeAdmin, handleLogout } = useApp();
  const pathname = usePathname();
  const router   = useRouter();

  const items = NAV_ITEMS.filter((i) => !i.adminOnly || podeAdmin);

  return (
    <aside style={{ width: collapsed ? 64 : 230, background: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", transition: "width 0.25s", flexShrink: 0, overflow: "hidden" }}>
      {/* Logo */}
      <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⬡</div>
        {!collapsed && <span style={{ fontWeight: 700, fontSize: 14, color: t.text, whiteSpace: "nowrap" }}>TI Inventário</span>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 2, background: active ? (t.dark ? "#312e81" : "#EEF2FF") : "transparent", color: active ? t.accent : t.textMuted, fontWeight: active ? 700 : 400, fontSize: 14, fontFamily: "inherit", whiteSpace: "nowrap", textAlign: "left" }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: `1px solid ${t.border}`, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${t.accent},#8B5CF6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
          {sessao?.avatar}
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sessao?.nome}</div>
              <div style={{ fontSize: 10, color: t.textFaint, textTransform: "capitalize" }}>{sessao?.perfil}</div>
            </div>
            <button onClick={handleLogout} style={{ background: t.dangerBg, border: `1px solid ${t.dangerBdr}`, borderRadius: 8, cursor: "pointer", fontSize: 11, color: t.danger, fontWeight: 700, padding: "4px 9px", fontFamily: "inherit", flexShrink: 0 }}>
              Sair
            </button>
          </>
        )}
        {collapsed && (
          <button onClick={handleLogout} style={{ background: t.dangerBg, border: `1px solid ${t.dangerBdr}`, borderRadius: 8, cursor: "pointer", fontSize: 13, color: t.danger, fontWeight: 700, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>⏻</button>
        )}
      </div>

      {/* Toggle */}
      <button onClick={onToggle} style={{ margin: "0 8px 10px", padding: "7px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.bg, cursor: "pointer", color: t.textFaint, fontSize: 12, fontFamily: "inherit" }}>
        {collapsed ? "→" : "← Recolher"}
      </button>
    </aside>
  );
}
