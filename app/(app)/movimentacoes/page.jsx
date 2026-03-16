"use client";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { Btn, StatCard, Table } from "@/components/ui";
import ModalMovimento from "@/components/forms/ModalMovimento";
import { CAT_ICONS } from "@/lib/constants";

const PERFIL_BADGE = {
  super_admin: { label: "⚡ Super Admin", bg: "#1e1b4b", cor: "#c4b5fd" },
  admin:       { label: "👑 Admin",       bg: "#312e81", cor: "#a5b4fc" },
  operador:    { label: "Operador",       bg: "#052e16", cor: "#10B981" },
  viewer:      { label: "Viewer",         bg: "#1f2937", cor: "#64748B" },
};

export default function MovimentacoesPage() {
  const { t, itens, historico, usuarios, podeAdmin, handleMovimento } = useApp();

  // Encontra dados do operador pelo username salvo na movimentação
  const getOperador = (username) => usuarios.find((u) => u.usuario === username) || null;
  const [movModal, setMovModal] = useState(null);

  const totalEntradas = historico.filter((h) => h.tipo === "entrada").reduce((s, h) => s + h.qty, 0);
  const totalSaidas   = historico.filter((h) => h.tipo === "saida").reduce((s, h)   => s + h.qty, 0);

  const headerActions = podeAdmin && (
    <div style={{ display: "flex", gap: 8 }}>
      <Btn t={t} variant="success" onClick={() => setMovModal({ tipo: "entrada", item: itens[0] || null })}>📥 Nova Entrada</Btn>
      <Btn t={t} variant="danger"  onClick={() => setMovModal({ tipo: "saida",   item: itens.find((i) => i.qtdDisponivel > 0) || itens[0] || null })}>📤 Nova Saída</Btn>
    </div>
  );

  return (
    <>
      <Header title="Movimentações" actions={headerActions} />
      <main style={{ flex: 1, overflowY: "auto", padding: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {!podeAdmin && (
            <div style={{ background: t.dangerBg, border: `1px solid ${t.dangerBdr}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🔒</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.danger }}>Acesso restrito</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>Somente o <strong>Administrador</strong> pode registrar movimentações.</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatCard t={t} label="Total Entradas" icon="📥" accent="#10B981" value={totalEntradas} sub="unidades recebidas" />
            <StatCard t={t} label="Total Saídas"   icon="📤" accent="#EF4444" value={totalSaidas}   sub="unidades distribuídas" />
            <StatCard t={t} label="Registros"       icon="📋" accent="#6366F1" value={historico.length} sub="movimentações no total" />
          </div>

          {/* Quick movement */}
          {podeAdmin && itens.filter((i) => i.qtdDisponivel > 0).length > 0 && (
            <div style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, padding: "16px 18px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: t.text }}>Movimentação Rápida</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {itens.filter((i) => i.qtdDisponivel > 0).slice(0, 4).map((i) => (
                  <div key={i.id} style={{ background: t.bg, borderRadius: 12, padding: "10px 14px", border: `1px solid ${t.border}`, minWidth: 180 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4 }}>{CAT_ICONS[i.categoria]} {i.nome}</div>
                    <div style={{ fontSize: 11, color: t.textFaint, marginBottom: 8 }}>Disponível: <strong style={{ color: t.success }}>{i.qtdDisponivel}</strong></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small t={t} variant="success" onClick={() => setMovModal({ tipo: "entrada", item: i })}>+</Btn>
                      <Btn small t={t} variant="danger"  onClick={() => setMovModal({ tipo: "saida",   item: i })}>−</Btn>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Movements table */}
          <Table t={t} emptyMsg="Sem movimentações registradas."
            cols={[
              { label: "Data",       render: (r) => <span style={{ color: t.textFaint, fontSize: 12, whiteSpace: "nowrap" }}>{r.data}</span> },
              { label: "Tipo",       render: (r) => <span style={{ fontWeight: 700, fontSize: 12, color: r.tipo === "entrada" ? t.success : t.danger, background: r.tipo === "entrada" ? t.successBg : t.dangerBg, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>{r.tipo === "entrada" ? "📥 Entrada" : "📤 Saída"}</span> },
              { label: "Item",       render: (r) => <div><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{r.itemNome}</div><div style={{ fontSize: 11, color: t.textFaint }}>{r.categoria || "—"}</div></div> },
              { label: "Nº Série",   render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.serial || "—"}</span> },
              { label: "Patrimônio", render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.patrimonio || "—"}</span> },
              { label: "Qtd.",       render: (r) => <span style={{ fontWeight: 800, fontSize: 15, color: r.tipo === "entrada" ? t.success : t.danger }}>{r.tipo === "entrada" ? "+" : "-"}{r.qty}</span> },
              { label: "Total",      render: (r) => <span style={{ fontWeight: 600, color: t.text }}>{r.qtdTotal ?? "—"}</span> },
              { label: "Disponível", render: (r) => <span style={{ fontWeight: 600, color: r.qtdDisponivel === 0 ? t.danger : t.success }}>{r.qtdDisponivel ?? "—"}</span> },
              {
                label: "Origem / Destino",
                render: (r) => {
                  const temFunc  = r.funcionario && r.funcionario !== "—";
                  const temDepto = r.depto && r.depto !== "—";

                  if (r.tipo === "entrada") {
                    return (
                      <div>
                        <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>📥 Recebido de</div>
                        {temFunc
                          ? <div style={{ fontSize: 13, fontWeight: 600, color: t.success }}>{r.funcionario}</div>
                          : <div style={{ fontSize: 12, color: t.textFaint, fontStyle: "italic" }}>Não informado</div>
                        }
                      </div>
                    );
                  }

                  return (
                    <div>
                      <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>📤 Dado para</div>
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
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: badge.bg, color: badge.cor }}>{badge.label}</span>
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

      {movModal && (
        <ModalMovimento tipo={movModal.tipo} itemInicial={movModal.item} itens={itens}
          onSave={(params) => { handleMovimento({ tipo: movModal.tipo, ...params }); setMovModal(null); }}
          onClose={() => setMovModal(null)} t={t}
        />
      )}
    </>
  );
}
