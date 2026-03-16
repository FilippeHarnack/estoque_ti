"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { StatusBadge } from "@/components/ui";
import { CAT_ICONS, hoje } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faCrown } from "@fortawesome/free-solid-svg-icons";

const PERFIL_BADGE = {
  super_admin: { label: "Super Admin", icon: faBolt,  bg: "#1e1b4b", cor: "#c4b5fd" },
  admin:       { label: "Admin",       icon: faCrown, bg: "#312e81", cor: "#a5b4fc" },
  operador:    { label: "Operador",    icon: null,    bg: "#052e16", cor: "#10B981" },
  viewer:      { label: "Viewer",      icon: null,    bg: "#1f2937", cor: "#64748B" },
};

export default function HistoricoPage() {
  const { t, dark, itens, historico, usuarios } = useApp();

  const getOperador = (username) => usuarios.find((u) => u.usuario === username) || null;
  const [periodo, setPeriodo] = useState("todos");

  const histFiltrado = useMemo(() => {
    const agora = new Date(); const hj = hoje();
    return historico.filter((h) => {
      if (periodo === "hoje") return h.data === hj;
      if (periodo === "mes")  { const d = new Date(h.data); return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear(); }
      return true;
    });
  }, [historico, periodo]);

  return (
    <>
      <Header title="Histórico por Item" />
      <main style={{ flex: 1, overflowY: "auto", padding: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 600 }}>Período:</span>
            {[{ v: "hoje", l: "Hoje" }, { v: "mes", l: "Este Mês" }, { v: "todos", l: "Todos" }].map((p) => (
              <button key={p.v} onClick={() => setPeriodo(p.v)}
                style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${periodo === p.v ? t.accent : t.borderMed}`, background: periodo === p.v ? t.accent : "transparent", color: periodo === p.v ? "#fff" : t.textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {p.l}
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 12, color: t.textFaint }}>{histFiltrado.length} registro{histFiltrado.length !== 1 ? "s" : ""}</span>
          </div>

          {itens.map((item) => {
            const hItem = histFiltrado.filter((h) => h.itemId === item.id);
            if (!hItem.length) return null;
            return (
              <div key={item.id} style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10, background: t.bg, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 16, color: t.textMuted }}>
                    {CAT_ICONS[item.categoria] && <FontAwesomeIcon icon={CAT_ICONS[item.categoria]} />}
                  </span>
                  <span style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{item.nome}</span>
                  <StatusBadge status={item.status} dark={dark} />
                  {item.serial && item.serial !== "—" && <span style={{ fontSize: 11, color: t.textFaint, background: t.border, borderRadius: 6, padding: "2px 8px", fontFamily: "monospace" }}>S/N: {item.serial}</span>}
                  {item.patrimonio && item.patrimonio !== "—" && <span style={{ fontSize: 11, color: t.textFaint, background: t.border, borderRadius: 6, padding: "2px 8px", fontFamily: "monospace" }}>PAT: {item.patrimonio}</span>}
                  <span style={{ marginLeft: "auto", fontSize: 12, color: t.textFaint }}>{hItem.length} registro{hItem.length !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ padding: "8px 0" }}>
                  {hItem.map((h) => {
                    const op    = getOperador(h.usuario);
                    const badge = PERFIL_BADGE[op?.perfil] || PERFIL_BADGE.operador;
                    const temFunc  = h.funcionario && h.funcionario !== "—";
                    const temDepto = h.depto && h.depto !== "—";
                    return (
                      <div key={h.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${t.border}` }}>

                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: h.tipo === "entrada" ? t.success : t.danger, flexShrink: 0, marginTop: 5 }} />

                        <span style={{ fontSize: 12, color: t.textFaint, width: 88, flexShrink: 0, paddingTop: 2 }}>{h.data}</span>

                        <span style={{ fontSize: 13, fontWeight: 700, color: h.tipo === "entrada" ? t.success : t.danger, width: 60, flexShrink: 0, paddingTop: 2 }}>
                          {h.tipo === "entrada" ? "+" : "-"}{h.qty} un.
                        </span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: t.text, fontWeight: 500, marginBottom: 4 }}>
                            {h.tipo === "entrada" ? (
                              temFunc
                                ? <span>Entrada recebida de <strong style={{ color: t.success }}>{h.funcionario}</strong></span>
                                : <span style={{ color: t.textMuted }}>Entrada em estoque</span>
                            ) : (
                              temFunc
                                ? <span>Saído para <strong style={{ color: t.danger }}>{h.funcionario}</strong>{temDepto && <span style={{ color: t.textFaint, fontWeight: 400 }}> · {h.depto}</span>}</span>
                                : <span style={{ color: t.textFaint }}>Saída — destinatário não informado</span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, color: t.textFaint }}>por</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: t.textMuted }}>{op?.nome || h.usuario}</span>
                            <span style={{ fontSize: 10, color: t.textFaint }}>(@{h.usuario})</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: badge.bg, color: badge.cor, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              {badge.icon && <FontAwesomeIcon icon={badge.icon} />}
                              {badge.label}
                            </span>
                            {h.obs && <span style={{ fontSize: 11, color: t.textFaint, fontStyle: "italic" }}>· {h.obs}</span>}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
                          {h.serial && h.serial !== "—"         && <span style={{ fontSize: 10, color: t.textFaint, fontFamily: "monospace", background: t.bg, borderRadius: 5, padding: "1px 6px", border: `1px solid ${t.border}` }}>S/N {h.serial}</span>}
                          {h.patrimonio && h.patrimonio !== "—" && <span style={{ fontSize: 10, color: t.accent,    fontFamily: "monospace", background: t.bg, borderRadius: 5, padding: "1px 6px", border: `1px solid ${t.accent}44` }}>PAT {h.patrimonio}</span>}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {histFiltrado.length === 0 && <div style={{ textAlign: "center", padding: 40, color: t.textFaint, fontSize: 14 }}>Nenhuma movimentação encontrada.</div>}
        </div>
      </main>
    </>
  );
}
