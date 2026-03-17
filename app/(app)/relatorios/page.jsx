"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { StatCard, Table, StatusBadge } from "@/components/ui";
import { CATEGORIAS_ITENS, CAT_ICONS, hoje } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown, faArrowUp, faBriefcase, faWrench, faChartBar, faUser,
  faFileArrowDown, faXmark,
} from "@fortawesome/free-solid-svg-icons";

/* ─── Gráfico SVG ─── */
function BarChart({ dados, t }) {
  const barW = 22;
  const gap  = 8;
  const groupW = barW * 2 + gap + 18;
  const chartH = 160;
  const maxVal = Math.max(...dados.map((d) => Math.max(d.entradas, d.saidas)), 1);

  return (
    <svg width={dados.length * groupW + 40} height={chartH + 50} style={{ overflow: "visible" }}>
      {/* grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={30} x2={dados.length * groupW + 30} y1={chartH - f * chartH} y2={chartH - f * chartH}
          stroke={t.border} strokeWidth={1} strokeDasharray="4 3" />
      ))}
      {dados.map((d, i) => {
        const x   = 30 + i * groupW;
        const hE  = (d.entradas / maxVal) * chartH;
        const hS  = (d.saidas   / maxVal) * chartH;
        return (
          <g key={d.cat}>
            {/* entrada bar */}
            <rect x={x} y={chartH - hE} width={barW} height={hE || 2} rx={4} fill="#10B981" opacity={0.85} />
            {d.entradas > 0 && (
              <text x={x + barW / 2} y={chartH - hE - 5} textAnchor="middle" fontSize={10} fill="#10B981" fontWeight={700}>{d.entradas}</text>
            )}
            {/* saida bar */}
            <rect x={x + barW + gap} y={chartH - hS} width={barW} height={hS || 2} rx={4} fill="#EF4444" opacity={0.85} />
            {d.saidas > 0 && (
              <text x={x + barW + gap + barW / 2} y={chartH - hS - 5} textAnchor="middle" fontSize={10} fill="#EF4444" fontWeight={700}>{d.saidas}</text>
            )}
            {/* label */}
            <text x={x + barW + gap / 2} y={chartH + 16} textAnchor="middle" fontSize={10} fill={t.textMuted}
              style={{ maxWidth: groupW - 4 }}>
              {d.cat.length > 7 ? d.cat.slice(0, 6) + "…" : d.cat}
            </text>
          </g>
        );
      })}
      {/* legenda */}
      <rect x={30} y={chartH + 30} width={10} height={10} rx={2} fill="#10B981" />
      <text x={44} y={chartH + 40} fontSize={11} fill={t.textMuted}>Entradas</text>
      <rect x={110} y={chartH + 30} width={10} height={10} rx={2} fill="#EF4444" />
      <text x={124} y={chartH + 40} fontSize={11} fill={t.textMuted}>Saídas</text>
    </svg>
  );
}

/* ─── Download Excel ─── */
async function downloadExcel(historico, periodo) {
  const XLSX = (await import("xlsx-js-style")).default;

  const agora        = new Date();
  const dataGeracao  = agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const labelPeriodo = { hoje: "Hoje", mes: "Este Mês", todos: "Todos os Registros" }[periodo];
  const totalE = historico.filter((h) => h.tipo === "entrada").reduce((s, h) => s + h.qty, 0);
  const totalS = historico.filter((h) => h.tipo === "saida").reduce((s, h)   => s + h.qty, 0);
  const saldo  = totalE - totalS;

  /* ── estilos reutilizáveis ── */
  const ACCENT   = "1E40AF";   // azul escuro
  const HEADER_BG= "1E3A8A";
  const ROW_ALT  = "EFF6FF";
  const GREEN_BG = "DCFCE7"; const GREEN_FG = "166534";
  const RED_BG   = "FEE2E2"; const RED_FG   = "991B1B";
  const GRAY_BG  = "F1F5F9";

  const font      = (bold, sz, color = "000000") => ({ bold, sz: sz || 11, color: { rgb: color }, name: "Calibri" });
  const fill      = (rgb)  => ({ type: "pattern", patternType: "solid", fgColor: { rgb } });
  const border    = ()     => ({ top: { style: "thin", color: { rgb: "CBD5E1" } }, bottom: { style: "thin", color: { rgb: "CBD5E1" } }, left: { style: "thin", color: { rgb: "CBD5E1" } }, right: { style: "thin", color: { rgb: "CBD5E1" } } });
  const align     = (h, v = "center") => ({ horizontal: h, vertical: v, wrapText: false });

  const cell = (v, style) => ({ v, s: style });

  /* ── montagem das linhas ── */
  const rows = [];

  // Linha 1 — título
  rows.push([cell("RELATÓRIO DE MOVIMENTAÇÕES — ESTOQUE TI", { font: font(true, 14, "FFFFFF"), fill: fill(HEADER_BG), alignment: align("left"), border: border() }),
    ...Array(9).fill(cell("", { fill: fill(HEADER_BG), border: border() }))]);

  // Linha 2 — vazia
  rows.push(Array(10).fill(cell("")));

  // Linhas de metadados
  const meta = (lbl, val) => [
    cell(lbl, { font: font(true, 11, "475569"), fill: fill(GRAY_BG), alignment: align("left") }),
    cell(val, { font: font(false, 11),          fill: fill(GRAY_BG), alignment: align("left") }),
    ...Array(8).fill(cell("", { fill: fill(GRAY_BG) })),
  ];
  rows.push(meta("Período:",           labelPeriodo));
  rows.push(meta("Gerado em:",         dataGeracao));
  rows.push(meta("Total de registros:", historico.length));

  // Linha vazia
  rows.push(Array(10).fill(cell("")));

  // Cabeçalho das colunas
  const COLS = ["Data", "Hora", "Tipo", "Item", "Categoria", "Qtd", "Funcionário", "Departamento", "Operador", "Observação"];
  rows.push(COLS.map((h) => cell(h, { font: font(true, 11, "FFFFFF"), fill: fill(ACCENT), alignment: align("center"), border: border() })));

  // Dados
  historico.forEach((h, i) => {
    const [data, hora] = (h.data || "").split("T");
    const entrada = h.tipo === "entrada";
    const tipoBg  = entrada ? GREEN_BG : RED_BG;
    const tipoFg  = entrada ? GREEN_FG : RED_FG;
    const rowBg   = i % 2 === 0 ? "FFFFFF" : ROW_ALT;
    const base    = { fill: fill(rowBg), border: border(), alignment: align("left") };

    rows.push([
      cell(data || h.data,                { ...base, font: font(false, 10), alignment: align("center") }),
      cell(hora ? hora.slice(0, 5) : "",  { ...base, font: font(false, 10), alignment: align("center") }),
      cell(entrada ? "Entrada" : "Saída", { font: font(true, 10, tipoFg), fill: fill(tipoBg), border: border(), alignment: align("center") }),
      cell(h.itemNome,                    { ...base, font: font(false, 11) }),
      cell(h.categoria,                   { ...base, font: font(false, 10) }),
      cell(h.qty,                         { ...base, font: font(true, 11),  alignment: align("center"), t: "n" }),
      cell(h.funcionario || "—",          { ...base, font: font(false, 10) }),
      cell(h.depto       || "—",          { ...base, font: font(false, 10) }),
      cell(h.usuario     || "—",          { ...base, font: font(false, 10) }),
      cell(h.obs         || "",           { ...base, font: font(false, 10) }),
    ]);
  });

  // Linha vazia
  rows.push(Array(10).fill(cell("")));

  // Resumo
  rows.push([cell("RESUMO", { font: font(true, 12, "FFFFFF"), fill: fill(HEADER_BG), alignment: align("left"), border: border() }),
    ...Array(9).fill(cell("", { fill: fill(HEADER_BG), border: border() }))]);

  const resumoRow = (lbl, val, bg, fg) => [
    cell(lbl, { font: font(true, 11, fg || "1E293B"),   fill: fill(bg || GRAY_BG), alignment: align("left"),   border: border() }),
    cell(val, { font: font(true, 12, fg || "1E293B"),   fill: fill(bg || GRAY_BG), alignment: align("center"), border: border(), t: "n" }),
    ...Array(8).fill(cell("", { fill: fill(bg || GRAY_BG), border: border() })),
  ];
  rows.push(resumoRow("Total de Entradas", totalE, GREEN_BG, GREEN_FG));
  rows.push(resumoRow("Total de Saídas",   totalS, RED_BG,   RED_FG));
  rows.push(resumoRow("Saldo",             saldo,  saldo >= 0 ? GREEN_BG : RED_BG, saldo >= 0 ? GREEN_FG : RED_FG));

  /* ── montar planilha ── */
  const ws   = XLSX.utils.aoa_to_sheet(rows.map((r) => r.map((c) => c.v)));
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: "" };
      ws[addr].s = rows[R]?.[C]?.s || {};
      if (rows[R]?.[C]?.t) ws[addr].t = rows[R][C].t;
    }
  }

  // Mesclagem do título e resumo
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },     // título
    { s: { r: rows.length - 4, c: 0 }, e: { r: rows.length - 4, c: 9 } }, // RESUMO
  ];

  // Larguras das colunas
  ws["!cols"] = [
    { wch: 12 }, { wch: 7 }, { wch: 10 }, { wch: 28 }, { wch: 14 },
    { wch: 6 },  { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 28 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Movimentações");
  XLSX.writeFile(wb, `relatorio_ti_${periodo}_${agora.toISOString().slice(0, 10)}.xlsx`);
}

/* ─── Modal Relatório ─── */
function RelatorioModal({ t, historico, periodo, onClose }) {
  const dadosGrafico = useMemo(() => CATEGORIAS_ITENS.map((cat) => ({
    cat,
    entradas: historico.filter((h) => h.tipo === "entrada" && h.categoria === cat).reduce((s, h) => s + h.qty, 0),
    saidas:   historico.filter((h) => h.tipo === "saida"   && h.categoria === cat).reduce((s, h) => s + h.qty, 0),
  })).filter((d) => d.entradas > 0 || d.saidas > 0), [historico]);

  const totalE = historico.filter((h) => h.tipo === "entrada").reduce((s, h) => s + h.qty, 0);
  const totalS = historico.filter((h) => h.tipo === "saida").reduce((s, h) => s + h.qty, 0);
  const labelPeriodo = { hoje: "Hoje", mes: "Este Mês", todos: "Todos os Registros" }[periodo];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: t.surface, borderRadius: 20, border: `1px solid ${t.border}`, width: "100%", maxWidth: 760, maxHeight: "90vh", overflowY: "auto", padding: "28px 32px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Relatório de Movimentações</div>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>{labelPeriodo}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => downloadExcel(historico, periodo)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, background: t.accent, border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              <FontAwesomeIcon icon={faFileArrowDown} /> Baixar Excel
            </button>
            <button onClick={onClose}
              style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.bg, color: t.textMuted, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Stats resumo */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Entradas", value: totalE, color: "#10B981", bg: "#052e16" },
            { label: "Total Saídas",   value: totalS, color: "#EF4444", bg: "#450a0a" },
            { label: "Saldo",          value: totalE - totalS, color: totalE >= totalS ? "#10B981" : "#EF4444", bg: t.bg },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 12, padding: "14px 18px", border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value > 0 ? "+" : ""}{s.value}</div>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        {dadosGrafico.length > 0 && (
          <div style={{ background: t.bg, borderRadius: 14, padding: "18px 16px", border: `1px solid ${t.border}`, marginBottom: 24, overflowX: "auto" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 16 }}>Movimentações por Categoria</div>
            <BarChart dados={dadosGrafico} t={t} />
          </div>
        )}

        {/* Tabela detalhada */}
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>Registros detalhados</div>
        <div style={{ border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: t.bg }}>
                {["Data", "Tipo", "Item", "Qtd", "Funcionário", "Operador"].map((h) => (
                  <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historico.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "20px 12px", textAlign: "center", color: t.textFaint, fontSize: 13 }}>Nenhum registro no período.</td></tr>
              )}
              {historico.map((h, i) => (
                <tr key={h.id} style={{ borderTop: `1px solid ${t.border}`, background: i % 2 === 0 ? t.surface : t.rowAlt }}>
                  <td style={{ padding: "9px 12px", fontSize: 12, color: t.textFaint }}>{h.data}</td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{ fontWeight: 700, fontSize: 11, color: h.tipo === "entrada" ? "#10B981" : "#EF4444", background: h.tipo === "entrada" ? "#052e16" : "#450a0a", padding: "2px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <FontAwesomeIcon icon={h.tipo === "entrada" ? faArrowDown : faArrowUp} />{h.tipo === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: 13, color: t.text, fontWeight: 500 }}>{h.itemNome}</td>
                  <td style={{ padding: "9px 12px", fontSize: 13, fontWeight: 700, color: h.tipo === "entrada" ? "#10B981" : "#EF4444" }}>{h.tipo === "entrada" ? "+" : "-"}{h.qty}</td>
                  <td style={{ padding: "9px 12px", fontSize: 12, color: t.textMuted }}>{h.funcionario === "—" ? "—" : h.funcionario}</td>
                  <td style={{ padding: "9px 12px", fontSize: 12, color: t.textFaint }}>{h.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Página principal ─── */
export default function RelatoriosPage() {
  const { t, dark, itens, historico, stats } = useApp();
  const [periodo, setPeriodo]         = useState("mes");
  const [modalAberto, setModalAberto] = useState(false);

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

  const headerActions = (
    <button onClick={() => setModalAberto(true)}
      style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 10, background: t.accent, border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
      <FontAwesomeIcon icon={faFileArrowDown} /> Baixar Excel
    </button>
  );

  return (
    <>
      <Header title="Relatórios" actions={headerActions} />
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

      {modalAberto && (
        <RelatorioModal t={t} historico={histFiltrado} periodo={periodo} onClose={() => setModalAberto(false)} />
      )}
    </>
  );
}
