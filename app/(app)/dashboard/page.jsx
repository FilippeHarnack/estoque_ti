"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { StatCard } from "@/components/ui";
import { STATUSES, CAT_ICONS, CATEGORIAS_ITENS } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen, faBriefcase, faCircleCheck, faWrench, faBoxArchive,
  faArrowDown, faArrowUp,
} from "@fortawesome/free-solid-svg-icons";

const CAT_COLORS = [
  "#6366F1","#3B82F6","#10B981","#F59E0B","#EC4899",
  "#8B5CF6","#14B8A6","#F97316","#EF4444","#06B6D4",
  "#84CC16","#A855F7","#F43F5E","#0EA5E9",
];

/* ── SVG Line Chart ─────────────────────────────────────────────── */
function LineChart({ data, t }) {
  const W = 500, H = 180, padL = 36, padR = 16, padT = 16, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxV = Math.max(...data.map((d) => Math.max(d.entradas, d.saidas)), 1);
  const toX = (i) => padL + (i / Math.max(data.length - 1, 1)) * innerW;
  const toY = (v) => padT + innerH - (v / maxV) * innerH;

  const linePath = (key) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d[key]).toFixed(1)}`).join(" ");

  const areaPath = (key) => {
    const pts = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d[key]).toFixed(1)}`).join(" L ");
    const x0 = toX(0), xN = toX(data.length - 1), yBase = padT + innerH;
    return `M ${x0},${toY(data[0]?.[key] ?? 0).toFixed(1)} L ${pts} L ${xN},${yBase} L ${x0},${yBase} Z`;
  };

  const yTicks = [...new Set([0, Math.round(maxV / 2), maxV])];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {/* Grid */}
      {yTicks.map((v) => (
        <line key={v} x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)}
          stroke={t.border} strokeWidth={1} strokeDasharray="3 3" />
      ))}
      {/* Area */}
      <path d={areaPath("entradas")} fill="#3B82F6" fillOpacity={0.08} />
      <path d={areaPath("saidas")}   fill="#10B981" fillOpacity={0.08} />
      {/* Lines */}
      <path d={linePath("entradas")} fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={linePath("saidas")}   fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.entradas)} r={4} fill="#fff" stroke="#3B82F6" strokeWidth={2} />
          <circle cx={toX(i)} cy={toY(d.saidas)}   r={4} fill="#fff" stroke="#10B981" strokeWidth={2} />
        </g>
      ))}
      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize={10} fill={t.textFaint}
          style={{ fontFamily: "inherit" }}>{d.label}</text>
      ))}
      {/* Y labels */}
      {yTicks.map((v) => (
        <text key={v} x={padL - 6} y={toY(v) + 4} textAnchor="end" fontSize={9} fill={t.textFaint}
          style={{ fontFamily: "inherit" }}>{v}</text>
      ))}
    </svg>
  );
}

/* ── SVG Donut Chart ────────────────────────────────────────────── */
function DonutChart({ data, total, t }) {
  const R = 60, cx = 75, cy = 75, SW = 20;
  const C = 2 * Math.PI * R;

  let cumPx = 0;
  const segments = data.map((d) => {
    const len = (d.pct / 100) * C;
    const seg = { ...d, len, offset: -cumPx };
    cumPx += len;
    return seg;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Centered donut */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <svg viewBox="0 0 150 150" style={{ width: 150, height: 150 }}>
          <g transform="rotate(-90, 75, 75)">
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={t.border} strokeWidth={SW} />
            {segments.map((seg, i) => (
              <circle key={i} cx={cx} cy={cy} r={R} fill="none"
                stroke={seg.color} strokeWidth={SW}
                strokeDasharray={`${seg.len} ${C}`}
                strokeDashoffset={seg.offset} />
            ))}
          </g>
          <text x={75} y={68} textAnchor="middle" fontSize={28} fontWeight={800}
            fill={t.text} style={{ fontFamily: "inherit" }}>{total}</text>
          <text x={75} y={84} textAnchor="middle" fontSize={11}
            fill={t.textFaint} style={{ fontFamily: "inherit" }}>itens total</text>
        </svg>
      </div>

      {/* Category list with bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {data.map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: t.textMuted, width: 88, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{d.name}</span>
            <div style={{ flex: 1, height: 5, background: t.border, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ width: `${d.pct}%`, height: "100%", background: d.color, borderRadius: 10, transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.text, width: 28, textAlign: "right", flexShrink: 0 }}>{d.value}</span>
            <span style={{ fontSize: 10, color: t.textFaint, width: 30, textAlign: "right", flexShrink: 0 }}>{d.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Status Badge ───────────────────────────────────────────────── */
function StatusBadge({ status, t }) {
  const cfg = STATUSES[status] || { color: "#6B7280", bg: "#F9FAFB", bgDk: "#1f2937" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      color: cfg.color,
      background: t.dark ? cfg.bgDk : cfg.bg,
    }}>{status}</span>
  );
}

/* ── Stock Bar ──────────────────────────────────────────────────── */
function StockBar({ pct, t }) {
  const color = pct >= 50 ? "#10B981" : pct >= 20 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: t.border, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 10, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: 11, color: t.textFaint, width: 28, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────────────── */
export default function DashboardPage() {
  const { t, dark, sessao, authNome, stats, itens, historico, usuarios } = useApp();
  const router = useRouter();

  /* Monthly movement data — last 6 months */
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleDateString("pt-BR", { month: "short" }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      });
    }
    return months.map((m) => {
      const movsMes = historico.filter((h) => h.data?.startsWith(m.key));
      const entradas = movsMes.filter((h) => h.tipo === "entrada" || h.tipo === "devolucao" || h.tipo === "ajuste").reduce((s, h) => s + (h.qty || 0), 0);
      const saidas   = movsMes.filter((h) => h.tipo === "saida" || h.tipo === "transferencia").reduce((s, h) => s + (h.qty || 0), 0);
      return { ...m, entradas, saidas };
    });
  }, [historico]);

  /* Category donut data */
  const catData = useMemo(() => {
    const cats = CATEGORIAS_ITENS.map((cat, i) => ({
      name: cat,
      value: itens.filter((item) => item.categoria === cat).length,
      color: CAT_COLORS[i % CAT_COLORS.length],
    })).filter((c) => c.value > 0);
    const total = cats.reduce((s, c) => s + c.value, 0);
    let cumPct = 0;
    return cats.map((c) => {
      const pct = total ? (c.value / total) * 100 : 0;
      const r = { ...c, pct, cumPct };
      cumPct += pct;
      return r;
    });
  }, [itens]);

  /* Stock status table rows — top 8 by criticality */
  const tableRows = useMemo(() => {
    return [...itens]
      .filter((i) => i.status !== "Desativado")
      .map((i) => ({ ...i, pctDisp: i.qtdTotal > 0 ? Math.round((i.qtdDisponivel / i.qtdTotal) * 100) : 0 }))
      .sort((a, b) => a.pctDisp - b.pctDisp)
      .slice(0, 8);
  }, [itens]);

  return (
    <>
      <Header title="Visão Geral" />
      <main style={{ flex: 1, overflowY: "auto", padding: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Greeting */}
          <div style={{ background: `linear-gradient(135deg,${t.accent},#8B5CF6)`, borderRadius: 16, padding: "20px 24px", color: "#fff" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Olá, {(() => {
              const limpar = (s) => {
                if (!s) return null;
                if (!s.includes(" ") && s.includes(".")) return s.split(".")[0].replace(/^./, c => c.toUpperCase());
                return s;
              };
              const raw = sessao?.nome?.includes("@") ? sessao.nome.split("@")[0] : sessao?.nome?.split(" ")[0];
              return limpar(authNome) || limpar(raw) || "você";
            })()}!</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              Perfil: <strong style={{ textTransform: "capitalize" }}>{sessao?.perfil}</strong>
              {" · "}
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              {" · "}
              {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatCard t={t} label="Total de Itens"  value={stats.total}      icon={<FontAwesomeIcon icon={faBoxOpen} />}      accent="#6366F1" sub={`${stats.totalUnid} unidades`}           onClick={() => router.push("/equipamentos")} />
            <StatCard t={t} label="Em Uso"           value={stats.emUso}      icon={<FontAwesomeIcon icon={faBriefcase} />}    accent="#3B82F6" sub={`${stats.total ? Math.round(stats.emUso / stats.total * 100) : 0}% da frota`} onClick={() => router.push("/equipamentos?status=Em+Uso")} />
            <StatCard t={t} label="Disponível"       value={stats.disponivel} icon={<FontAwesomeIcon icon={faCircleCheck} />}  accent="#10B981" sub={`${stats.dispUnid} unidades livres`}    onClick={() => router.push("/equipamentos?status=Dispon%C3%ADvel")} />
            <StatCard t={t} label="Manutenção"       value={stats.manutencao} icon={<FontAwesomeIcon icon={faWrench} />}       accent="#F59E0B" sub="Necessita atenção"                       onClick={() => router.push("/equipamentos?status=Manuten%C3%A7%C3%A3o")} />
            <StatCard t={t} label="Desativado"       value={stats.desativado} icon={<FontAwesomeIcon icon={faBoxArchive} />}   accent="#6B7280" sub="Fim de vida"                             onClick={() => router.push("/equipamentos?status=Desativado")} />
          </div>

          {/* Row 2: Line chart + Donut */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>

            {/* Line chart */}
            <div style={{ flex: 3, minWidth: 300, background: t.surface, borderRadius: 16, padding: "20px 22px", border: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>Controle de Estoque</div>
                  <div style={{ fontSize: 12, color: t.textFaint, marginTop: 2 }}>Movimentações nos últimos 6 meses</div>
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.textMuted }}>
                    <span style={{ width: 24, height: 3, background: "#3B82F6", borderRadius: 2, display: "inline-block" }} />
                    Entradas
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.textMuted }}>
                    <span style={{ width: 24, height: 3, background: "#10B981", borderRadius: 2, display: "inline-block" }} />
                    Saídas
                  </div>
                </div>
              </div>
              <LineChart data={chartData} t={t} />
            </div>

            {/* Donut chart */}
            <div style={{ flex: 2, minWidth: 240, background: t.surface, borderRadius: 16, padding: "20px 22px", border: `1px solid ${t.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 4 }}>Categorias</div>
              <div style={{ fontSize: 12, color: t.textFaint, marginBottom: 18 }}>Distribuição por tipo de item</div>
              {catData.length > 0
                ? <DonutChart data={catData} total={itens.length} t={t} />
                : <div style={{ color: t.textFaint, fontSize: 13, textAlign: "center", paddingTop: 40 }}>Sem dados</div>
              }
            </div>
          </div>

          {/* Row 3: Recent activities + Stock table */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>

            {/* Recent activities */}
            <div style={{ flex: 1, minWidth: 220, background: t.surface, borderRadius: 16, padding: "20px 22px", border: `1px solid ${t.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 4 }}>Atividades Recentes</div>
              <div style={{ fontSize: 12, color: t.textFaint, marginBottom: 18 }}>Últimas movimentações</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {historico.slice(0, 7).map((h) => {
                  const isDev     = h.tipo === "devolucao";
                  const isRetorno = h.tipo === "retorno";
                  const isTrans   = h.tipo === "transferencia";
                  const isEntrada = h.tipo === "entrada" || isDev || isRetorno || h.tipo === "ajuste";
                  const isAjuste  = h.tipo === "ajuste";
                  const cor   = isAjuste ? "#6366F1" : isTrans ? "#F97316" : isEntrada ? "#10B981" : "#EF4444";
                  const icon  = isAjuste ? faWrench : isTrans ? faArrowUp : isEntrada ? faArrowDown : faArrowUp;
                  const label = isDev ? "Devolução" : isRetorno ? "Retorno" : isTrans ? "Transferência" : isAjuste ? "Ajuste" : isEntrada ? "Entrada" : "Saída";
                  const func  = h.funcionario && h.funcionario !== "—" ? h.funcionario : null;
                  return (
                    <div key={h.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: cor + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <FontAwesomeIcon icon={icon} style={{ color: cor, fontSize: 12 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.itemNome}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: cor, marginTop: 2 }}>{label}</div>
                        {func && (
                          <div style={{ fontSize: 11, color: t.textFaint, marginTop: 1 }}>
                            {isDev || isRetorno ? "Devolvido por" : isTrans ? "Para" : isEntrada ? "Para" : "Para"}:{" "}
                            <span style={{ color: t.textMuted, fontWeight: 600 }}>{func}</span>
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: t.textFaint }}>
                          Responsável: <span style={{ color: t.textMuted }}>{usuarios.find((u) => u.usuario === h.usuario)?.nome || h.usuario || "—"}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: t.textFaint, flexShrink: 0, textAlign: "right" }}>{h.data}</div>
                    </div>
                  );
                })}
                {historico.length === 0 && (
                  <div style={{ color: t.textFaint, fontSize: 13, textAlign: "center", paddingTop: 20 }}>Sem atividades</div>
                )}
              </div>

              <button onClick={() => router.push("/historico")}
                style={{ marginTop: 16, width: "100%", background: "none", border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 0", color: t.accent, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Ver todas →
              </button>
            </div>

            {/* Stock status table */}
            <div style={{ flex: 3, minWidth: 300, background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
              <div style={{ padding: "20px 22px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>Status do Estoque</div>
                  <div style={{ fontSize: 12, color: t.textFaint, marginTop: 2 }}>Itens com menor disponibilidade</div>
                </div>
                <button onClick={() => router.push("/equipamentos")}
                  style={{ background: "none", border: "none", color: t.accent, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Ver todos →
                </button>
              </div>

              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr 1fr", gap: 0, padding: "10px 22px", borderBottom: `1px solid ${t.border}` }}>
                {["PRODUTO", "CATEGORIA", "DISPONIBILIDADE", "STATUS"].map((h) => (
                  <div key={h} style={{ fontSize: 10, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
                ))}
              </div>

              {tableRows.length === 0 && (
                <div style={{ padding: "32px 22px", textAlign: "center", color: t.textFaint, fontSize: 13 }}>Nenhum item cadastrado</div>
              )}

              {tableRows.map((item, idx) => (
                <div key={item.id}
                  onClick={() => router.push(`/equipamentos?status=${encodeURIComponent(item.status)}`)}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 2fr 1fr", gap: 0,
                    padding: "12px 22px", cursor: "pointer",
                    borderBottom: idx < tableRows.length - 1 ? `1px solid ${t.border}` : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = t.bg}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  {/* Nome + serial */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nome}</div>
                    <div style={{ fontSize: 11, color: t.textFaint, marginTop: 1 }}>
                      {item.serial !== "—" ? item.serial : item.patrimonio !== "—" ? item.patrimonio : "—"}
                    </div>
                  </div>
                  {/* Categoria */}
                  <div style={{ fontSize: 12, color: t.textMuted, display: "flex", alignItems: "center" }}>{item.categoria}</div>
                  {/* Bar */}
                  <div style={{ display: "flex", alignItems: "center", paddingRight: 16 }}>
                    <StockBar pct={item.pctDisp} t={t} />
                  </div>
                  {/* Status badge */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <StatusBadge status={item.status} t={t} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
