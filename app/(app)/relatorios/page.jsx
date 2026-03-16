"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { StatCard, Table, StatusBadge } from "@/components/ui";
import { CATEGORIAS_ITENS, CAT_ICONS, hoje } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown, faArrowUp, faBriefcase, faWrench, faChartBar, faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function RelatoriosPage() {
  const { t, dark, itens, historico, stats } = useApp();
  const [periodo, setPeriodo] = useState("todos");

  const histFiltrado = useMemo(() => {
    const agora = new Date(); const hj = hoje();
    return historico.filter((h) => {
      if (periodo === "hoje") return h.data === hj;
      if (periodo === "mes")  { const d = new Date(h.data); return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear(); }
      return true;
    });
  }, [historico, periodo]);

  const relCategoria = useMemo(() => CATEGORIAS_ITENS.map((cat) => {
    const lista = itens.filter((i) => i.categoria === cat);
    return { cat, total: lista.length, unidades: lista.reduce((s, i) => s + i.qtdTotal, 0), disponiveis: lista.reduce((s, i) => s + i.qtdDisponivel, 0) };
  }).filter((r) => r.total > 0), [itens]);

  return (
    <>
      <Header title="Relatórios" />
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
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatCard t={t} label="Entradas no Período" icon={<FontAwesomeIcon icon={faArrowDown} />} accent="#10B981" value={histFiltrado.filter((h) => h.tipo === "entrada").reduce((s, h) => s + h.qty, 0)} sub="unidades recebidas" />
            <StatCard t={t} label="Saídas no Período"   icon={<FontAwesomeIcon icon={faArrowUp} />}   accent="#EF4444" value={histFiltrado.filter((h) => h.tipo === "saida").reduce((s, h) => s + h.qty, 0)} sub="unidades distribuídas" />
            <StatCard t={t} label="Em Uso"               icon={<FontAwesomeIcon icon={faBriefcase} />} accent="#3B82F6" value={stats.emUso}      sub={`de ${stats.total} itens`} />
            <StatCard t={t} label="Em Manutenção"        icon={<FontAwesomeIcon icon={faWrench} />}    accent="#F59E0B" value={stats.manutencao} sub="necessitam atenção" />
          </div>

          <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <FontAwesomeIcon icon={faChartBar} style={{ color: t.accent }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Relatório por Categoria</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: t.bg }}>
                  {["Categoria", "Itens", "Unid. Total", "Unid. Disponível", "% Disponível"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {relCategoria.map((r, i) => {
                  const pct = r.unidades ? Math.round((r.disponiveis / r.unidades) * 100) : 0;
                  return (
                    <tr key={r.cat} style={{ borderTop: `1px solid ${t.border}`, background: i % 2 === 0 ? t.surface : t.rowAlt }}>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, color: t.textMuted }}>
                            {CAT_ICONS[r.cat] && <FontAwesomeIcon icon={CAT_ICONS[r.cat]} />}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{r.cat}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: t.text }}>{r.total}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: t.textMuted }}>{r.unidades}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: r.disponiveis === 0 ? t.danger : t.success }}>{r.disponiveis}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: t.bg, borderRadius: 10, overflow: "hidden", maxWidth: 80 }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: pct > 50 ? t.success : pct > 20 ? t.gold : t.danger, borderRadius: 10 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: pct > 50 ? t.success : pct > 20 ? t.gold : t.danger }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <FontAwesomeIcon icon={faUser} style={{ color: t.accent }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Equipamentos em Uso por Funcionário</span>
            </div>
            <Table t={t} emptyMsg="Nenhum item em uso."
              cols={[
                { label: "Item",         render: (r) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, color: t.textMuted }}>
                      {CAT_ICONS[r.categoria] && <FontAwesomeIcon icon={CAT_ICONS[r.categoria]} />}
                    </span>
                    <span style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{r.nome}</span>
                  </div>
                )},
                { label: "Categoria",    render: (r) => <span style={{ color: t.textMuted }}>{r.categoria}</span> },
                { label: "Funcionário",  render: (r) => <span style={{ fontWeight: 600, color: t.text }}>{r.funcionario || "—"}</span> },
                { label: "Departamento", render: (r) => <span style={{ color: t.textMuted }}>{r.departamento === "-" ? "—" : r.departamento}</span> },
                { label: "Status",       render: (r) => <StatusBadge status={r.status} dark={dark} /> },
              ]}
              rows={itens.filter((i) => i.status === "Em Uso")}
            />
          </div>
        </div>
      </main>
    </>
  );
}
