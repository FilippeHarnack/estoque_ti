"use client";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse, faBoxesStacked, faArrowsUpDown, faClipboardList,
  faChartBar, faShieldHalved, faCubes, faRightFromBracket,
  faChevronLeft, faChevronRight, faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import UserAvatar from "@/components/ui/UserAvatar";

const NAV_ITEMS = [
  { href: "/dashboard",      icon: faHouse,         label: "Visão Geral"   },
  { href: "/equipamentos",   icon: faBoxesStacked,  label: "Equipamentos"  },
  { href: "/areas-comuns",   icon: faBuilding,      label: "Áreas Comuns"  },
  { href: "/movimentacoes",  icon: faArrowsUpDown,  label: "Movimentações" },
  { href: "/historico",      icon: faClipboardList, label: "Histórico"     },
  { href: "/relatorios",     icon: faChartBar,      label: "Relatórios"    },
  { href: "/seguranca",      icon: faShieldHalved,  label: "Segurança", adminOnly: true },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { t, sessao, podeAdmin, handleLogout } = useApp();
  const pathname = usePathname();
  const router   = useRouter();

  const items = NAV_ITEMS.filter((i) => !i.adminOnly || podeAdmin);

  return (
    <aside style={{
      width: collapsed ? 64 : 230,
      background: t.surface,
      borderRight: `1px solid ${t.border}`,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflow: "hidden",
      transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
      willChange: "width",
      transform: "translateZ(0)",
    }}>

      <div style={{
        height: 64,
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        padding: "0 16px",
        gap: 10,
      }}>
        {collapsed ? (
          <button
            onClick={onToggle}
            title="Expandir menu"
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              border: "none", cursor: "pointer", color: "#fff",
              fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto", flexShrink: 0,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        ) : (
          <>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "#fff",
            }}>
              <FontAwesomeIcon icon={faCubes} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: t.text, whiteSpace: "nowrap", flex: 1 }}>
              TI Inventário
            </span>
            <button
              onClick={onToggle}
              title="Recolher menu"
              style={{
                width: 26, height: 26, borderRadius: 7,
                border: `1px solid ${t.border}`,
                background: "transparent",
                cursor: "pointer", color: t.textFaint,
                fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.accent;
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = t.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = t.textFaint;
                e.currentTarget.style.borderColor = t.border;
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          </>
        )}
      </div>

      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 10, width: "100%",
                padding: collapsed ? "10px 0" : "9px 12px",
                borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 2,
                background: active ? (t.dark ? "#312e81" : "#EEF2FF") : "transparent",
                color: active ? t.accent : t.textMuted,
                fontWeight: active ? 700 : 400,
                fontSize: 14, fontFamily: "inherit",
                whiteSpace: "nowrap", textAlign: "left",
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>
                <FontAwesomeIcon icon={item.icon} />
              </span>
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      <div style={{
        borderTop: `1px solid ${t.border}`,
        padding: collapsed ? "12px 0" : "10px 12px",
        display: "flex",
        flexDirection: collapsed ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: collapsed ? 10 : 8,
      }}>
        <UserAvatar avatar={sessao?.avatar} t={t} size={32} borderRadius={8} fontSize={14} />

        {!collapsed && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sessao?.nome}
            </div>
            <div style={{ fontSize: 10, color: t.textFaint, textTransform: "capitalize" }}>
              {sessao?.perfil}
            </div>
          </div>
        )}

        {!collapsed ? (
          <button onClick={handleLogout} style={{ background: t.dangerBg, border: `1px solid ${t.dangerBdr}`, borderRadius: 8, cursor: "pointer", fontSize: 11, color: t.danger, fontWeight: 700, padding: "4px 9px", fontFamily: "inherit", flexShrink: 0 }}>
            Sair
          </button>
        ) : (
          <button onClick={handleLogout} title="Sair" style={{ width: 32, height: 32, background: t.dangerBg, border: `1px solid ${t.dangerBdr}`, borderRadius: 8, cursor: "pointer", fontSize: 14, color: t.danger, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        )}
      </div>
    </aside>
  );
}
