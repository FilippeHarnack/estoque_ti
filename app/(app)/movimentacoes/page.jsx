"use client";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { StatCard, Table } from "@/components/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt, faCrown, faArrowDown, faArrowUp, faLock,
  faClipboardList, faRotateLeft, faArrowRightArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const PERFIL_BADGE = {
  super_admin: { label: "Super Admin", icon: faBolt,  bg: "#1e1b4b", cor: "#c4b5fd" },
  admin:       { label: "Admin",       icon: faCrown, bg: "#312e81", cor: "#a5b4fc" },
  operador:    { label: "Operador",    icon: null,    bg: "#052e16", cor: "#10B981" },
  viewer:      { label: "Viewer",      icon: null,    bg: "#1f2937", cor: "#64748B" },
};

export default function MovimentacoesPage() {
  const { t, historico, usuarios, podeAdmin } = useApp();

  const getOperador = (username) => usuarios.find((u) => u.usuario === username) || null;

  const totalEntradas = historico.filter((h) => h.tipo === "entrada").reduce((s, h) => s + h.qty, 0);
  const totalSaidas   = historico.filter((h) => h.tipo === "saida").reduce((s, h)   => s + h.qty, 0);

  const headerActions = null;

  return (
    <>
      <Header title="Movimentações" actions={headerActions} />
      <main style={{ flex: 1, overflowY: "auto", padding: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {!podeAdmin && (
            <div style={{ background: t.dangerBg, border: `1px solid ${t.dangerBdr}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18, color: t.danger }}>
                <FontAwesomeIcon icon={faLock} />
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.danger }}>Acesso restrito</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>Somente o <strong>Administrador</strong> pode registrar movimentações.</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatCard t={t} label="Total Entradas" icon={<FontAwesomeIcon icon={faArrowDown} />} accent="#10B981" value={totalEntradas} sub="unidades recebidas" />
            <StatCard t={t} label="Total Saídas"   icon={<FontAwesomeIcon icon={faArrowUp} />}   accent="#EF4444" value={totalSaidas}   sub="unidades distribuídas" />
            <StatCard t={t} label="Registros"       icon={<FontAwesomeIcon icon={faClipboardList} />} accent="#6366F1" value={historico.length} sub="movimentações no total" />
          </div>


          <Table t={t} emptyMsg="Sem movimentações registradas."
            cols={[
              { label: "Data",       render: (r) => <span style={{ color: t.textFaint, fontSize: 12, whiteSpace: "nowrap" }}>{r.data}</span> },
              { label: "Tipo",       render: (r) => (
                <span style={{ fontWeight: 700, fontSize: 12,
                  color: r.tipo === "entrada" ? t.success : r.tipo === "ajuste" ? "#F59E0B" : r.tipo === "devolucao" ? "#60A5FA" : r.tipo === "transferencia" ? "#F97316" : t.danger,
                  background: r.tipo === "entrada" ? t.successBg : r.tipo === "ajuste" ? "#F59E0B22" : r.tipo === "devolucao" ? "#60A5FA22" : r.tipo === "transferencia" ? "#F9731622" : t.dangerBg,
                  padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <FontAwesomeIcon icon={r.tipo === "entrada" ? faArrowDown : r.tipo === "ajuste" ? faClipboardList : r.tipo === "devolucao" ? faRotateLeft : r.tipo === "transferencia" ? faArrowRightArrowLeft : faArrowUp} />
                  {r.tipo === "entrada" ? "Entrada" : r.tipo === "ajuste" ? "Ajuste" : r.tipo === "devolucao" ? "Devolução" : r.tipo === "transferencia" ? "Transferência" : "Saída"}
                </span>
              )},
              { label: "Item",       render: (r) => <div><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{r.itemNome}</div><div style={{ fontSize: 11, color: t.textFaint }}>{r.categoria || "—"}</div></div> },
              { label: "Nº Série",   render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.serial || "—"}</span> },
              { label: "Patrimônio", render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.patrimonio || "—"}</span> },
              { label: "Qtd.",       render: (r) => <span style={{ fontWeight: 800, fontSize: 15, color: r.tipo === "entrada" ? t.success : r.tipo === "ajuste" ? "#F59E0B" : r.tipo === "devolucao" ? "#60A5FA" : r.tipo === "transferencia" ? "#F97316" : t.danger }}>{r.tipo === "entrada" ? "+" : r.tipo === "ajuste" ? "~" : r.tipo === "devolucao" ? "↩" : r.tipo === "transferencia" ? "⇄" : "-"}{r.qty}</span> },
              { label: "Total",      render: (r) => <span style={{ fontWeight: 600, color: t.text }}>{r.qtdTotal ?? "—"}</span> },
              { label: "Disponível", render: (r) => <span style={{ fontWeight: 600, color: r.qtdDisponivel === 0 ? t.danger : t.success }}>{r.qtdDisponivel ?? "—"}</span> },
              {
                label: "Origem / Destino",
                render: (r) => {
                  const temFunc  = r.funcionario && r.funcionario !== "—";
                  const temDepto = r.depto && r.depto !== "—";

                  if (r.tipo === "transferencia") {
                    const partes = r.obs?.split(" → ") || [];
                    return (
                      <div>
                        <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <FontAwesomeIcon icon={faArrowRightArrowLeft} /> Transferido
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                          <span style={{ color: t.danger, fontWeight: 600 }}>{partes[0] || r.obs}</span>
                          {partes[1] && <><span style={{ color: "#F97316" }}>→</span><span style={{ color: t.success, fontWeight: 600 }}>{partes[1]}</span></>}
                        </div>
                        {temDepto && <div style={{ fontSize: 11, color: t.textFaint }}>{r.depto}</div>}
                      </div>
                    );
                  }

                  if (r.tipo === "ajuste") {
                    return (
                      <div style={{ fontSize: 12, color: "#F59E0B", fontStyle: "italic" }}>
                        {r.obs || "Ajuste manual"}
                      </div>
                    );
                  }

                  if (r.tipo === "devolucao") {
                    return (
                      <div>
                        <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <FontAwesomeIcon icon={faRotateLeft} /> Devolvido por
                        </div>
                        {temFunc
                          ? <div style={{ fontSize: 13, fontWeight: 600, color: "#60A5FA" }}>{r.funcionario}</div>
                          : <div style={{ fontSize: 12, color: t.textFaint, fontStyle: "italic" }}>Não informado</div>
                        }
                        {temDepto && <div style={{ fontSize: 11, color: t.textFaint }}>{r.depto}</div>}
                      </div>
                    );
                  }

                  if (r.tipo === "entrada") {
                    return (
                      <div>
                        <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <FontAwesomeIcon icon={faArrowDown} /> Recebido de
                        </div>
                        {temFunc
                          ? <div style={{ fontSize: 13, fontWeight: 600, color: t.success }}>{r.funcionario}</div>
                          : <div style={{ fontSize: 12, color: t.textFaint, fontStyle: "italic" }}>Não informado</div>
                        }
                      </div>
                    );
                  }

                  return (
                    <div>
                      <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                        <FontAwesomeIcon icon={faArrowUp} /> Dado para
                      </div>
                      {temFunc
                        ? <div style={{ fontSize: 13, fontWeight: 600, color: t.danger }}>{r.funcionario}</div>
                        : <div style={{ fontSize: 12, color: t.textFaint, fontStyle: "italic" }}>Não informado</div>
                      }
                      {temDepto && <div style={{ fontSize: 11, color: t.textFaint }}>{r.depto}</div>}
                    </div>
                  );
                }
              },
              {
                label: "Operador (quem registrou)",
                render: (r) => {
                  const op = getOperador(r.usuario);
                  const badge = PERFIL_BADGE[op?.perfil] || PERFIL_BADGE.operador;
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{op?.nome || r.usuario}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: t.textFaint }}>@{r.usuario}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: badge.bg, color: badge.cor, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {badge.icon && <FontAwesomeIcon icon={badge.icon} />}
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                }
              },
              { label: "Obs.",       render: (r) => <span style={{ color: t.textFaint, fontSize: 11, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{r.obs || "—"}</span> },
            ]}
            rows={historico}
          />
        </div>
      </main>

    </>
  );
}
