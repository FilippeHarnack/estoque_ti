"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { StatCard } from "@/components/ui";
import { CATEGORIAS_ITENS, CAT_ICONS, hoje } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown, faArrowUp, faBriefcase, faWrench, faChartBar, faUser,
  faFileArrowDown, faXmark, faBoxOpen, faRotateLeft, faShuffle, faSliders, faCalendar,
} from "@fortawesome/free-solid-svg-icons";

/* ─── Helpers de tipo ─── */
const isEntrada = (tipo) => tipo === "entrada" || tipo === "devolucao" || tipo === "ajuste" || tipo === "retorno";
const TIPO_META = {
  entrada:      { label: "Entrada",      color: "#10B981", bg: "#052e16", icon: faArrowDown },
  devolucao:    { label: "Devolução",    color: "#10B981", bg: "#052e16", icon: faRotateLeft },
  ajuste:       { label: "Ajuste",       color: "#10B981", bg: "#052e16", icon: faSliders },
  retorno:      { label: "Retorno",      color: "#10B981", bg: "#052e16", icon: faRotateLeft },
  saida:        { label: "Saída",        color: "#EF4444", bg: "#450a0a", icon: faArrowUp },
  transferencia:{ label: "Transferência",color: "#F59E0B", bg: "#451a03", icon: faShuffle },
};

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
  const labelPeriodo = { hoje: "Hoje", mes: "Este Mês", todos: "Todos os Registros", personalizado: "Por Data" }[periodo] ?? "Período Personalizado";
  const totalE = historico.filter((h) => isEntrada(h.tipo)).reduce((s, h) => s + h.qty, 0);
  const totalS = historico.filter((h) => !isEntrada(h.tipo)).reduce((s, h) => s + h.qty, 0);
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
    ...Array(8).fill(cell("", { fill: fill(HEADER_BG), border: border() }))]);

  // Linha 2 — vazia
  rows.push(Array(9).fill(cell("")));

  // Linhas de metadados
  const meta = (lbl, val) => [
    cell(lbl, { font: font(true, 11, "475569"), fill: fill(GRAY_BG), alignment: align("left") }),
    cell(val, { font: font(false, 11),          fill: fill(GRAY_BG), alignment: align("left") }),
    ...Array(7).fill(cell("", { fill: fill(GRAY_BG) })),
  ];
  rows.push(meta("Período:",           labelPeriodo));
  rows.push(meta("Gerado em:",         dataGeracao));
  rows.push(meta("Total de registros:", historico.length));

  // Linha vazia
  rows.push(Array(9).fill(cell("")));

  // Cabeçalho das colunas
  const COLS = ["Data", "Tipo", "Item", "Categoria", "Qtd", "Funcionário", "Departamento", "Operador", "Observação"];
  rows.push(COLS.map((h) => cell(h, { font: font(true, 11, "FFFFFF"), fill: fill(ACCENT), alignment: align("center"), border: border() })));

  // Dados
  historico.forEach((h, i) => {
    const ent     = isEntrada(h.tipo);
    const meta    = TIPO_META[h.tipo] || (ent ? TIPO_META.entrada : TIPO_META.saida);
    const tipoBg  = ent ? GREEN_BG : RED_BG;
    const tipoFg  = ent ? GREEN_FG : RED_FG;
    const rowBg   = i % 2 === 0 ? "FFFFFF" : ROW_ALT;
    const base    = { fill: fill(rowBg), border: border(), alignment: align("left") };

    rows.push([
      cell(h.data || "",       { ...base, font: font(false, 10), alignment: align("center") }),
      cell(meta.label,         { font: font(true, 10, tipoFg), fill: fill(tipoBg), border: border(), alignment: align("center") }),
      cell(h.itemNome,         { ...base, font: font(false, 11) }),
      cell(h.categoria,        { ...base, font: font(false, 10) }),
      cell(h.qty,              { ...base, font: font(true, 11),  alignment: align("center"), t: "n" }),
      cell(h.funcionario || "—", { ...base, font: font(false, 10) }),
      cell(h.depto       || "—", { ...base, font: font(false, 10) }),
      cell(h.usuario     || "—", { ...base, font: font(false, 10) }),
      cell(h.obs         || "",  { ...base, font: font(false, 10) }),
    ]);
  });

  // Linha vazia
  rows.push(Array(9).fill(cell("")));

  // Resumo
  rows.push([cell("RESUMO", { font: font(true, 12, "FFFFFF"), fill: fill(HEADER_BG), alignment: align("left"), border: border() }),
    ...Array(8).fill(cell("", { fill: fill(HEADER_BG), border: border() }))]);

  const resumoRow = (lbl, val, bg, fg) => [
    cell(lbl, { font: font(true, 11, fg || "1E293B"),   fill: fill(bg || GRAY_BG), alignment: align("left"),   border: border() }),
    cell(val, { font: font(true, 12, fg || "1E293B"),   fill: fill(bg || GRAY_BG), alignment: align("center"), border: border(), t: "n" }),
    ...Array(7).fill(cell("", { fill: fill(bg || GRAY_BG), border: border() })),
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
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },     // título
    { s: { r: rows.length - 4, c: 0 }, e: { r: rows.length - 4, c: 8 } }, // RESUMO
  ];

  // Larguras das colunas
  ws["!cols"] = [
    { wch: 12 }, { wch: 14 }, { wch: 28 }, { wch: 14 },
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
    entradas: historico.filter((h) => isEntrada(h.tipo) && h.categoria === cat).reduce((s, h) => s + h.qty, 0),
    saidas:   historico.filter((h) => !isEntrada(h.tipo) && h.categoria === cat).reduce((s, h) => s + h.qty, 0),
  })).filter((d) => d.entradas > 0 || d.saidas > 0), [historico]);

  const totalE = historico.filter((h) => isEntrada(h.tipo)).reduce((s, h) => s + h.qty, 0);
  const totalS = historico.filter((h) => !isEntrada(h.tipo)).reduce((s, h) => s + h.qty, 0);
  const labelPeriodo = { hoje: "Hoje", mes: "Este Mês", todos: "Todos os Registros", personalizado: "Por Data" }[periodo] ?? "Período Personalizado";

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
                    {(() => { const m = TIPO_META[h.tipo] || TIPO_META.entrada; return (
                      <span style={{ fontWeight: 700, fontSize: 11, color: m.color, background: m.bg, padding: "2px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FontAwesomeIcon icon={m.icon} />{m.label}
                      </span>
                    ); })()}
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: 13, color: t.text, fontWeight: 500 }}>{h.itemNome}</td>
                  <td style={{ padding: "9px 12px", fontSize: 13, fontWeight: 700, color: isEntrada(h.tipo) ? "#10B981" : "#EF4444" }}>{isEntrada(h.tipo) ? "+" : "-"}{h.qty}</td>
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

/* ─── Range Picker (estilo passagem aérea) ─── */
const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_CURTOS = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

function RangePicker({ t, dataInicio, dataFim, onApply, onClear }) {
  const todayStr = hoje();
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [hoverDate, setHoverDate] = useState(null);
  const [tempStart, setTempStart] = useState(dataInicio || "");
  const [tempEnd,   setTempEnd]   = useState(dataFim    || "");
  const [step, setStep]           = useState(!dataInicio ? "inicio" : !dataFim ? "fim" : "inicio");

  const RNG = `${t.accent}28`;
  const m2y = viewMonth === 11 ? viewYear + 1 : viewYear;
  const m2  = viewMonth === 11 ? 0 : viewMonth + 1;

  function cells(y, m) {
    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    const total = new Date(y, m + 1, 0).getDate();
    const arr = Array(first).fill(null);
    for (let d = 1; d <= total; d++) arr.push(d);
    while (arr.length % 7) arr.push(null);
    return arr;
  }

  function toDs(y, m, d) {
    return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  function handleClick(d) {
    if (step === "inicio") {
      setTempStart(d); setTempEnd(""); setStep("fim");
    } else {
      if (d < tempStart) { setTempStart(d); setTempEnd(""); setStep("fim"); }
      else if (d === tempStart) { setTempEnd(""); setStep("fim"); }
      else { setTempEnd(d); setStep("inicio"); }
    }
  }

  function getState(d) {
    const effEnd = tempEnd || (step === "fim" ? hoverDate : null);
    const start = d === tempStart;
    const end   = !!effEnd && d === effEnd && d !== tempStart;
    let range = false;
    if (tempStart && effEnd) {
      const lo = tempStart < effEnd ? tempStart : effEnd;
      const hi = tempStart < effEnd ? effEnd   : tempStart;
      range = d > lo && d < hi;
    }
    return { start, end, range, effEnd };
  }

  function fmt(ds) {
    return ds ? new Date(ds + "T00:00:00").toLocaleDateString("pt-BR") : "—";
  }

  function renderMonth(y, m) {
    return (
      <div style={{ width: 238 }}>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13, color: t.text, marginBottom: 10 }}>
          {MESES_PT[m]} {y}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
          {DIAS_CURTOS.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: t.textFaint, padding: "2px 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells(y, m).map((day, i) => {
            if (!day) return <div key={i} style={{ height: 34 }} />;
            const d = toDs(y, m, day);
            const { start, end, range, effEnd } = getState(d);
            const today = d === todayStr;
            const sel   = start || end;

            let wrapBg = "transparent";
            if (range)              wrapBg = RNG;
            else if (start && effEnd) wrapBg = `linear-gradient(to right, transparent 50%, ${RNG} 50%)`;
            else if (end && tempStart) wrapBg = `linear-gradient(to left, transparent 50%, ${RNG} 50%)`;

            return (
              <div key={i}
                style={{ height: 34, background: wrapBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                onClick={() => handleClick(d)}
                onMouseEnter={() => step === "fim" && setHoverDate(d)}
                onMouseLeave={() => step === "fim" && setHoverDate(null)}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: sel ? t.accent : "transparent",
                  color: sel ? "#fff" : today ? t.accent : t.text,
                  fontWeight: sel || today ? 700 : 400,
                  fontSize: 13,
                  border: today && !sel ? `1.5px solid ${t.accent}` : "none",
                  userSelect: "none",
                }}>
                  {day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const canApply = !!(tempStart && tempEnd);

  return (
    <div style={{
      position: "absolute", zIndex: 300, top: "calc(100% + 8px)", left: 0,
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16,
      padding: "16px 18px", boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
    }}>
      {/* Campos início / fim */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Início", val: tempStart, active: step === "inicio", onClick: () => setStep("inicio") },
          { label: "Fim",    val: tempEnd,   active: step === "fim",    onClick: () => tempStart && setStep("fim") },
        ].map(({ label, val, active, onClick }) => (
          <div key={label} onClick={onClick}
            style={{ flex: 1, padding: "8px 14px", borderRadius: 10, border: `2px solid ${active ? t.accent : t.border}`, background: t.bg, cursor: "pointer" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 1 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: val ? t.text : t.textFaint }}>{fmt(val)}</div>
          </div>
        ))}
      </div>

      {/* Calendários */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
        <button onClick={() => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); }}
          style={{ marginTop: 20, background: "none", border: `1px solid ${t.border}`, color: t.textMuted, borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          ‹
        </button>
        {renderMonth(viewYear, viewMonth)}
        <div style={{ width: 1, background: t.border, alignSelf: "stretch", margin: "0 8px" }} />
        {renderMonth(m2y, m2)}
        <button onClick={() => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); }}
          style={{ marginTop: 20, background: "none", border: `1px solid ${t.border}`, color: t.textMuted, borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          ›
        </button>
      </div>

      {/* Rodapé */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
        <button onClick={() => { setTempStart(""); setTempEnd(""); setStep("inicio"); onClear(); }}
          style={{ padding: "7px 16px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: "transparent", color: t.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          Limpar
        </button>
        <button onClick={() => canApply && onApply(tempStart, tempEnd)} disabled={!canApply}
          style={{ padding: "7px 20px", borderRadius: 10, border: "none", background: canApply ? t.accent : t.borderMed, color: canApply ? "#fff" : t.textFaint, fontSize: 13, fontWeight: 700, cursor: canApply ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
          Aplicar
        </button>
      </div>
    </div>
  );
}

/* ─── Página principal ─── */
export default function RelatoriosPage() {
  const { t, historico, stats } = useApp();
  const [periodo, setPeriodo]         = useState("mes");
  const [modalAberto, setModalAberto] = useState(false);
  const [catRel, setCatRel]           = useState("Todas");
  const [dataInicio, setDataInicio]   = useState("");
  const [dataFim, setDataFim]         = useState("");
  const [pickerAberto, setPickerAberto] = useState(false);

  const histFiltrado = useMemo(() => {
    const agora = new Date(); const hj = hoje();
    return historico.filter((h) => {
      if (periodo === "hoje") return h.data === hj;
      if (periodo === "mes")  { const d = new Date(h.data); return d.getUTCMonth() === agora.getUTCMonth() && d.getUTCFullYear() === agora.getUTCFullYear(); }
      if (periodo === "personalizado") {
        if (!dataInicio && !dataFim) return true;
        if (dataInicio && h.data < dataInicio) return false;
        if (dataFim    && h.data > dataFim)    return false;
        return true;
      }
      return true;
    });
  }, [historico, periodo, dataInicio, dataFim]);

  const relCategoria = useMemo(() => CATEGORIAS_ITENS.map((cat) => ({
    cat,
    entradas: histFiltrado.filter((h) => isEntrada(h.tipo) && h.categoria === cat).reduce((s, h) => s + h.qty, 0),
    saidas:   histFiltrado.filter((h) => !isEntrada(h.tipo) && h.categoria === cat).reduce((s, h) => s + h.qty, 0),
  })).filter((r) => r.entradas > 0 || r.saidas > 0), [histFiltrado]);

  const relCategoriaFiltrada = useMemo(() =>
    catRel === "Todas" ? relCategoria : relCategoria.filter((r) => r.cat === catRel),
  [relCategoria, catRel]);

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
            {[{ v: "hoje", l: "Hoje" }, { v: "mes", l: "Este Mês" }, { v: "todos", l: "Todos" }, { v: "personalizado", l: "Data" }].map((p) => (
              <button key={p.v} onClick={() => { if (p.v === "personalizado" && periodo === "personalizado") { setPickerAberto(v => !v); } else { setPeriodo(p.v); setPickerAberto(p.v === "personalizado"); } }}
                style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${periodo === p.v ? t.accent : t.borderMed}`, background: periodo === p.v ? t.accent : "transparent", color: periodo === p.v ? "#fff" : t.textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {p.l}
              </button>
            ))}
            {periodo === "personalizado" && (
              <div style={{ position: "relative" }}>
                <button onClick={() => setPickerAberto(v => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 20, border: `1px solid ${(dataInicio || dataFim) ? t.accent : t.borderMed}`, background: (dataInicio && dataFim) ? `${t.accent}18` : "transparent", color: (dataInicio || dataFim) ? t.accent : t.textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  <FontAwesomeIcon icon={faCalendar} />
                  {dataInicio && dataFim
                    ? `${new Date(dataInicio + "T00:00:00").toLocaleDateString("pt-BR")} → ${new Date(dataFim + "T00:00:00").toLocaleDateString("pt-BR")}`
                    : dataInicio
                      ? `${new Date(dataInicio + "T00:00:00").toLocaleDateString("pt-BR")} → ...`
                      : "Selecionar datas"}
                </button>
                {pickerAberto && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 299 }} onClick={() => setPickerAberto(false)} />
                    <RangePicker
                      t={t}
                      dataInicio={dataInicio}
                      dataFim={dataFim}
                      onApply={(start, end) => { setDataInicio(start); setDataFim(end); setPickerAberto(false); }}
                      onClear={() => { setDataInicio(""); setDataFim(""); }}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatCard t={t} label="Entradas no Período"     icon={<FontAwesomeIcon icon={faArrowDown} />}  accent="#10B981" value={histFiltrado.filter((h) => isEntrada(h.tipo)).reduce((s, h) => s + h.qty, 0)} sub="unidades recebidas" />
            <StatCard t={t} label="Saídas no Período"       icon={<FontAwesomeIcon icon={faArrowUp} />}    accent="#EF4444" value={histFiltrado.filter((h) => h.tipo === "saida").reduce((s, h) => s + h.qty, 0)} sub="unidades distribuídas" />
            <StatCard t={t} label="Transferências"          icon={<FontAwesomeIcon icon={faShuffle} />}    accent="#F59E0B" value={histFiltrado.filter((h) => h.tipo === "transferencia").length} sub="entre funcionários" />
            <StatCard t={t} label="Em Uso"                  icon={<FontAwesomeIcon icon={faBriefcase} />}  accent="#3B82F6" value={stats.emUso}      sub={`de ${stats.total} itens`} />
            <StatCard t={t} label="Disponível"              icon={<FontAwesomeIcon icon={faBoxOpen} />}    accent="#10B981" value={stats.dispUnid}    sub="unidades disponíveis" />
            <StatCard t={t} label="Em Manutenção"           icon={<FontAwesomeIcon icon={faWrench} />}     accent="#F59E0B" value={stats.manutencao}  sub="necessitam atenção" />
          </div>

          <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <FontAwesomeIcon icon={faChartBar} style={{ color: t.accent }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Relatório por Categoria</span>
              <select value={catRel} onChange={(e) => setCatRel(e.target.value)}
                style={{ marginLeft: "auto", padding: "5px 10px", borderRadius: 8, border: `1px solid ${catRel !== "Todas" ? t.accent : t.borderMed}`, fontSize: 12, color: catRel !== "Todas" ? t.accent : t.text, background: t.bg, fontFamily: "inherit", cursor: "pointer", outline: "none", fontWeight: catRel !== "Todas" ? 700 : 400 }}>
                {["Todas", ...CATEGORIAS_ITENS].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            {relCategoriaFiltrada.length === 0
              ? <div style={{ padding: "24px 18px", textAlign: "center", color: t.textFaint, fontSize: 13 }}>Nenhuma movimentação no período.</div>
              : <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: t.bg }}>
                      {["Categoria", "Entradas", "Saídas", "Saldo"].map((h) => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {relCategoriaFiltrada.map((r, i) => {
                      const saldo = r.entradas - r.saidas;
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
                          <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "#10B981" }}>+{r.entradas}</td>
                          <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: r.saidas > 0 ? "#EF4444" : t.textFaint }}>-{r.saidas}</td>
                          <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: saldo >= 0 ? "#10B981" : "#EF4444" }}>{saldo >= 0 ? "+" : ""}{saldo}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            }
          </div>

          <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <FontAwesomeIcon icon={faUser} style={{ color: t.accent }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Movimentações no Período</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: t.textFaint }}>{histFiltrado.length} registro{histFiltrado.length !== 1 ? "s" : ""}</span>
            </div>
            {histFiltrado.length === 0
              ? <div style={{ padding: "24px 18px", textAlign: "center", color: t.textFaint, fontSize: 13 }}>Nenhuma movimentação no período.</div>
              : <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: t.bg }}>
                      {["Data", "Tipo", "Item", "Qtd", "Funcionário", "Operador"].map((h) => (
                        <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {histFiltrado.map((h, i) => {
                      const m = TIPO_META[h.tipo] || TIPO_META.entrada;
                      return (
                        <tr key={h.id} style={{ borderTop: `1px solid ${t.border}`, background: i % 2 === 0 ? t.surface : t.rowAlt }}>
                          <td style={{ padding: "9px 12px", fontSize: 12, color: t.textFaint }}>{h.data}</td>
                          <td style={{ padding: "9px 12px" }}>
                            <span style={{ fontWeight: 700, fontSize: 11, color: m.color, background: m.bg, padding: "2px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <FontAwesomeIcon icon={m.icon} />{m.label}
                            </span>
                          </td>
                          <td style={{ padding: "9px 12px", fontSize: 13, color: t.text, fontWeight: 500 }}>{h.itemNome}</td>
                          <td style={{ padding: "9px 12px", fontSize: 13, fontWeight: 700, color: isEntrada(h.tipo) ? "#10B981" : h.tipo === "transferencia" ? "#F59E0B" : "#EF4444" }}>{isEntrada(h.tipo) ? "+" : "-"}{h.qty}</td>
                          <td style={{ padding: "9px 12px", fontSize: 12, color: t.textMuted }}>
                            {(h.tipo === "transferencia" || h.tipo === "retorno") ? (() => {
                              const arrowIdx = (h.obs || "").indexOf(" → ");
                              const de = arrowIdx >= 0 ? h.obs.slice(0, arrowIdx).trim() : "—";
                              const afterArrow = arrowIdx >= 0 ? h.obs.slice(arrowIdx + 3) : h.funcionario || "—";
                              const dotIdx = afterArrow.indexOf(" · ");
                              const paraRaw = dotIdx >= 0 ? afterArrow.slice(0, dotIdx).trim() : afterArrow;
                              const para = /^estoque/i.test(paraRaw) ? "Estoque" : paraRaw;
                              const corDe = h.tipo === "retorno" ? "#10B981" : "#F59E0B";
                              const corPara = h.tipo === "retorno" ? "#10B981" : t.success;
                              return <span><strong style={{ color: corDe }}>{de}</strong><span style={{ color: corDe, margin: "0 4px" }}>→</span><strong style={{ color: corPara }}>{para}</strong></span>;
                            })() : h.funcionario === "—" ? "—" : h.funcionario || "—"}
                          </td>
                          <td style={{ padding: "9px 12px", fontSize: 12, color: t.textFaint }}>{h.usuario}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            }
          </div>
        </div>
      </main>

      {modalAberto && (
        <RelatorioModal t={t} historico={histFiltrado} periodo={periodo} onClose={() => setModalAberto(false)} />
      )}
    </>
  );
}
