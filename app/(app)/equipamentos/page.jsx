"use client";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { Btn, Table, StatusBadge, Modal } from "@/components/ui";
import FormItem from "@/components/forms/FormItem";
import ModalMovimento from "@/components/forms/ModalMovimento";
import { CAT_ICONS, CAT_FILTROS, STATUS_FILTROS, DEPARTAMENTOS, CATEGORIAS_ITENS } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faArrowDown, faArrowUp, faFilter, faXmark, faTag, faCircleDot, faBuilding, faIndustry, faRotateLeft, faWrench } from "@fortawesome/free-solid-svg-icons";
import ModalSaida from "@/components/forms/ModalSaida";

export default function EquipamentosPage() {
  const { t, dark, itens, marcas, podeAdmin, podeEditar, handleSaveItem, handleMovimento, handleDevolucao, handleToggleManutencao, funcionarios, usuarios } = useApp();
  const searchParams = useSearchParams();

  const [busca, setBusca]       = useState("");
  const [catFil, setCatFil]     = useState("Todas");
  const [statusFil, setStatusFil] = useState("Em Uso");

  useEffect(() => {
    const s = searchParams.get("status");
    if (s) setStatusFil(s);
  }, [searchParams]);
  const [deptFil, setDeptFil]   = useState("Todos");
  const [funcFil, setFuncFil]   = useState("Todos");
  const [marcaFil, setMarcaFil] = useState("Todas");
  const [selecionado, setSelecionado] = useState(null);
  const [editando, setEditando] = useState(null);
  const [adicionando, setAdicionando] = useState(false);
  const [movModal, setMovModal] = useState(null);
  const [manutModal, setManutModal] = useState(null); // { item }
  const [manutQty, setManutQty] = useState(1);
  const [saidaModal, setSaidaModal] = useState(false);

  const sel = { padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.borderMed}`, fontSize: 13, color: t.text, background: t.inputBg, cursor: "pointer", fontFamily: "inherit", outline: "none" };

  const filtrados = useMemo(() => itens.filter((a) => {
    const q = busca.toLowerCase();
    const mB = !q || [a.nome, a.marca, a.modelo, a.serial, a.funcionario, a.departamento].some((v) => v?.toLowerCase().includes(q));
    return mB && (catFil === "Todas" || a.categoria === catFil) && (statusFil === "Todos" || a.status === statusFil) && (deptFil === "Todos" || a.departamento === deptFil) && (funcFil === "Todos" || a.funcionario === funcFil) && (marcaFil === "Todas" || a.marca === marcaFil);
  }), [itens, busca, catFil, statusFil, deptFil, funcFil, marcaFil]);

  const marcasOpts = ["Todas", "Acer", "Apple", "Asus", "BRX", "Edifier", "Feltron", "Generic", "HP", "Intelbras", "Lenovo", "LG", "Logitech", "Microsoft", "Motorola", "My Max", "Samsung"];

  const temFiltros = catFil !== "Todas" || statusFil !== "Em Uso" || deptFil !== "Todos" || funcFil !== "Todos" || marcaFil !== "Todas" || busca;

  return (
    <>
      <Header title="Equipamentos" search={busca} onSearch={setBusca}
        actions={podeEditar && <Btn onClick={() => setAdicionando(true)} t={t} variant="primary">+ Adicionar Item</Btn>}
      />
      <main style={{ flex: 1, overflowY: "auto", padding: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── Resumo por Categoria ── */}
          {(() => {
            const cats = CATEGORIAS_ITENS.map((cat) => {
              const lista = itens.filter((i) => i.categoria === cat);
              if (!lista.length) return null;
              const total = lista.reduce((s, i) => s + i.qtdTotal, 0);
              const disp  = lista.reduce((s, i) => s + i.qtdDisponivel, 0);
              const pct   = total ? Math.round((disp / total) * 100) : 0;
              return { cat, total, disp, pct };
            }).filter(Boolean);
            if (!cats.length) return null;
            return (
              <div style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Estoque por Categoria</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                  {cats.map(({ cat, total, disp, pct }) => {
                    const cor = pct > 50 ? t.success : pct > 20 ? t.gold : t.danger;
                    const ativo = catFil === cat;
                    return (
                      <button key={cat} onClick={() => setCatFil(ativo ? "Todas" : cat)}
                        style={{ background: ativo ? `${t.accent}18` : t.bg, border: `1.5px solid ${ativo ? t.accent : t.border}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "border-color 0.15s, background 0.15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                          <span style={{ fontSize: 14, color: ativo ? t.accent : t.textMuted }}>
                            {CAT_ICONS[cat] && <FontAwesomeIcon icon={CAT_ICONS[cat]} />}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: ativo ? t.accent : t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat}</span>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: cor, lineHeight: 1 }}>{disp}</div>
                        <div style={{ fontSize: 11, color: t.textFaint, marginTop: 2, marginBottom: 8 }}>de {total} disponíveis</div>
                        <div style={{ height: 4, background: t.border, borderRadius: 10, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: cor, borderRadius: 10 }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, padding: "14px 18px" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: t.accent }}><FontAwesomeIcon icon={faFilter} /></span>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Filtros</span>
              {temFiltros && (
                <span style={{ fontSize: 11, background: t.accent, color: "#fff", borderRadius: 20, padding: "1px 8px", fontWeight: 700 }}>ativos</span>
              )}
              <span style={{ marginLeft: "auto", fontSize: 12, color: t.textFaint, fontWeight: 600 }}>
                {filtrados.length} item{filtrados.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Filters + Nova Entrada on the same row */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              {[
                { label: "Categoria", icon: faTag,       value: catFil,    onChange: setCatFil,    opts: CAT_FILTROS,    active: catFil    !== "Todas" },
                { label: "Status",    icon: faCircleDot, value: statusFil, onChange: setStatusFil, opts: STATUS_FILTROS, active: statusFil !== "Todos" },
                { label: "Depto.",    icon: faBuilding,  value: deptFil,   onChange: setDeptFil,   opts: DEPARTAMENTOS,  active: deptFil   !== "Todos" },
                { label: "Marca",     icon: faIndustry,  value: marcaFil,  onChange: setMarcaFil,  opts: marcasOpts,     active: marcaFil  !== "Todas" },
              ].map(({ label, icon, value, onChange, opts, active }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: active ? t.accent : t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                    <FontAwesomeIcon icon={icon} /> {label}
                  </span>
                  <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...sel, border: active ? `1.5px solid ${t.accent}` : `1px solid ${t.borderMed}`, color: active ? t.accent : t.text, fontWeight: active ? 700 : 400 }}>
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: funcFil !== "Todos" ? t.accent : t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                  <FontAwesomeIcon icon={faUser} /> Funcionário
                </span>
                <select value={funcFil} onChange={(e) => setFuncFil(e.target.value)} style={{ ...sel, maxWidth: 180, border: funcFil !== "Todos" ? `1.5px solid ${t.accent}` : `1px solid ${t.borderMed}`, color: funcFil !== "Todos" ? t.accent : t.text, fontWeight: funcFil !== "Todos" ? 700 : 400 }}>
                  {funcionarios.map((o) => <option key={o} value={o}>{o === "Todos" ? "Todos" : o}</option>)}
                </select>
              </div>
              {temFiltros && (
                <button onClick={() => { setCatFil("Todas"); setStatusFil("Em Uso"); setDeptFil("Todos"); setFuncFil("Todos"); setMarcaFil("Todas"); setBusca(""); }}
                  style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${t.dangerBdr}`, background: t.dangerBg, color: t.danger, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                  <FontAwesomeIcon icon={faXmark} /> Limpar
                </button>
              )}
              {/* Botões de ação — alinhados ao final */}
              {podeAdmin && (
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setSaidaModal(true)}
                    style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                    <FontAwesomeIcon icon={faArrowUp} /> Saída
                  </button>
                  <button
                    onClick={() => setMovModal({ tipo: "entrada", item: null })}
                    style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#10B981", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                    <FontAwesomeIcon icon={faArrowDown} /> Nova Entrada
                  </button>
                </div>
              )}
            </div>
          </div>

          <Table t={t} emptyMsg="Nenhum item encontrado." onRowClick={(r) => setSelecionado(r)}
            cols={[
              { label: "Item",       render: (r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 16, color: t.textMuted, width: 20, textAlign: "center" }}>
                    {CAT_ICONS[r.categoria] && <FontAwesomeIcon icon={CAT_ICONS[r.categoria]} />}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{r.nome}</div>
                    <div style={{ fontSize: 11, color: t.textFaint }}>{r.marca} · {r.modelo}</div>
                  </div>
                </div>
              )},
              { label: "Categoria",  render: (r) => <span style={{ color: t.textMuted }}>{r.categoria}</span> },
              { label: "Série",      render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.serial}</span> },
              { label: "Patrimônio", render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.patrimonio || "—"}</span> },
              { label: "Total",      render: (r) => <span style={{ fontWeight: 700, color: t.text }}>{r.qtdTotal}</span> },
              { label: "Disponível", render: (r) => <span style={{ fontWeight: 700, color: r.qtdDisponivel === 0 ? t.danger : t.success }}>{r.qtdDisponivel}</span> },
              { label: "Status",     render: (r) => <StatusBadge status={r.status} dark={dark} /> },
              { label: "Funcionário",render: (r) => <span style={{ color: t.text, fontSize: 12 }}>{r.funcionario && r.funcionario !== "—" ? r.funcionario : <span style={{ color: t.textFaint }}>—</span>}</span> },
              {
                label: "Ações", render: (r) => {
                  const temFunc = r.funcionario && r.funcionario !== "—";
                  const btnStyle = { padding: "5px 11px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", minWidth: 72, textAlign: "center" };
                  return (
                    <div style={{ display: "flex", gap: 5 }} onClick={(e) => e.stopPropagation()}>
                      {podeAdmin && (
                        <button onClick={() => setMovModal({ tipo: "saida", item: r })}
                          style={{ ...btnStyle, background: "#EF4444", color: "#fff" }}>
                          −Saída
                        </button>
                      )}
                      {podeAdmin && (
                        <button
                          onClick={() => temFunc && setMovModal({ tipo: "devolucao", item: r })}
                          style={{ ...btnStyle, background: temFunc ? "#3B82F6" : t.surface, color: temFunc ? "#fff" : t.textFaint, border: temFunc ? "none" : `1px solid ${t.borderMed}`, opacity: temFunc ? 1 : 0.4, cursor: temFunc ? "pointer" : "default" }}>
                          <FontAwesomeIcon icon={faRotateLeft} style={{ marginRight: 4 }} />Devolver
                        </button>
                      )}
                      {podeAdmin && (
                        <button
                          onClick={() => {
                            if (r.status === "Manutenção") {
                              handleToggleManutencao(r);
                            } else if (r.qtdTotal <= 1) {
                              handleToggleManutencao(r, r.qtdTotal);
                            } else {
                              setManutQty(1);
                              setManutModal({ item: r });
                            }
                          }}
                          style={{ ...btnStyle, background: r.status === "Manutenção" ? "#F59E0B" : "#F59E0B18", color: r.status === "Manutenção" ? "#fff" : "#F59E0B", border: r.status === "Manutenção" ? "none" : "1px solid #F59E0B55" }}>
                          <FontAwesomeIcon icon={faWrench} style={{ marginRight: 4 }} />
                          {r.status === "Manutenção" ? "Retornar" : "Manut."}
                        </button>
                      )}
                      {podeEditar && (
                        <button onClick={() => setEditando(r)}
                          style={{ ...btnStyle, background: t.surface, color: t.text, border: `1px solid ${t.borderMed}` }}>
                          Editar
                        </button>
                      )}
                    </div>
                  );
                }
              },
            ]}
            rows={filtrados}
          />
        </div>
      </main>

      {selecionado && !editando && (
        <Modal titulo={selecionado.nome} onClose={() => setSelecionado(null)} t={t}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "12px 16px", background: t.bg, borderRadius: 12 }}>
            <span style={{ fontSize: 32, color: t.textMuted }}>
              {CAT_ICONS[selecionado.categoria] && <FontAwesomeIcon icon={CAT_ICONS[selecionado.categoria]} />}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: t.textFaint }}>{selecionado.categoria} · {selecionado.marca}</div>
              <StatusBadge status={selecionado.status} dark={dark} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Disponível</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: selecionado.qtdDisponivel === 0 ? t.danger : t.success }}>{selecionado.qtdDisponivel}<span style={{ fontSize: 13, color: t.textFaint }}>/{selecionado.qtdTotal}</span></div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 22px", marginBottom: 16 }}>
            {[["Modelo", selecionado.modelo], ["Nº de Série", selecionado.serial], ["Patrimônio", selecionado.patrimonio || "—"], ["Funcionário", selecionado.funcionario || "Não atribuído"], ["Departamento", selecionado.departamento === "—" ? "—" : selecionado.departamento], ["Data de Compra", selecionado.dataCompra], ["Status", selecionado.status]].map(([k, v]) => (
              <div key={k}><div style={{ fontSize: 10, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{k}</div><div style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{v}</div></div>
            ))}
          </div>
          {selecionado.notas && <div style={{ background: t.bg, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}><div style={{ fontSize: 10, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Observações</div><div style={{ fontSize: 13, color: t.textMuted }}>{selecionado.notas}</div></div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            {podeAdmin && (
              <Btn t={t} variant="danger" small onClick={() => { setMovModal({ tipo: "saida", item: selecionado }); setSelecionado(null); }}>
                −Saída
              </Btn>
            )}
            {podeAdmin && selecionado.funcionario && selecionado.funcionario !== "—" && (
              <Btn t={t} variant="warning" small onClick={() => { setMovModal({ tipo: "devolucao", item: selecionado }); setSelecionado(null); }}>
                <FontAwesomeIcon icon={faRotateLeft} style={{ marginRight: 5 }} /> Devolver
              </Btn>
            )}
            {podeEditar && <Btn t={t} variant="ghost" small onClick={() => { setEditando(selecionado); setSelecionado(null); }}>Editar</Btn>}
            <Btn t={t} variant="ghost" small onClick={() => setSelecionado(null)}>Fechar</Btn>
          </div>
        </Modal>
      )}

      {editando && (
        <Modal titulo={`Editar: ${editando.nome}`} onClose={() => setEditando(null)} t={t} maxW={620}>
          <FormItem item={editando} onSave={(f) => { handleSaveItem(f, editando); setEditando(null); }} onClose={() => setEditando(null)} t={t} />
        </Modal>
      )}

      {adicionando && (
        <Modal titulo="Adicionar Novo Equipamento" onClose={() => setAdicionando(false)} t={t} maxW={620}>
          <FormItem item={null} onSave={(f) => { handleSaveItem(f, null); setAdicionando(false); }} onClose={() => setAdicionando(false)} t={t} />
        </Modal>
      )}


      {movModal && (
        <ModalMovimento tipo={movModal.tipo} itemInicial={movModal.item} itens={itens}
          semFuncionario={movModal.tipo === "entrada"}
          onSave={async (params) => {
            setMovModal(null);
            if (movModal.tipo === "devolucao") {
              await handleDevolucao({ item: movModal.item, ...params });
            } else {
              await handleMovimento({ tipo: movModal.tipo, ...params });
            }
          }}
          onClose={() => setMovModal(null)} t={t} />
      )}

      {saidaModal && (
        <ModalSaida
          itens={itens}
          funcionarios={funcionarios}
          onSave={async (params) => {
            setSaidaModal(false);
            await handleMovimento({ tipo: "saida", ...params });
          }}
          onClose={() => setSaidaModal(false)}
          t={t}
        />
      )}

      {manutModal && (
        <Modal titulo="Enviar para Manutenção" onClose={() => setManutModal(null)} t={t} maxW={420}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Item info */}
            <div style={{ background: t.bg, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "#F59E0B18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FontAwesomeIcon icon={faWrench} style={{ color: "#F59E0B", fontSize: 18 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{manutModal.item.nome}</div>
                <div style={{ fontSize: 12, color: t.textFaint, marginTop: 2 }}>
                  {manutModal.item.qtdTotal} unidade{manutModal.item.qtdTotal !== 1 ? "s" : ""} com {manutModal.item.funcionario !== "—" ? manutModal.item.funcionario : "estoque"}
                </div>
              </div>
            </div>

            {/* Qty input */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                Quantas unidades entram em manutenção?
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button
                  onClick={() => setManutQty((q) => Math.max(1, q - 1))}
                  style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.borderMed}`, background: t.surface, color: t.text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  −
                </button>
                <input
                  type="number" min={1} max={manutModal.item.qtdTotal} value={manutQty}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 1;
                    setManutQty(Math.max(1, Math.min(manutModal.item.qtdTotal, v)));
                  }}
                  style={{ width: 70, textAlign: "center", padding: "8px 10px", borderRadius: 8, border: `1.5px solid #F59E0B`, background: t.bg, color: t.text, fontSize: 18, fontWeight: 700, fontFamily: "inherit", outline: "none" }}
                />
                <button
                  onClick={() => setManutQty((q) => Math.min(manutModal.item.qtdTotal, q + 1))}
                  style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.borderMed}`, background: t.surface, color: t.text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  +
                </button>
                <span style={{ fontSize: 13, color: t.textFaint }}>
                  de {manutModal.item.qtdTotal} total
                </span>
              </div>

              {/* Preview */}
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#F59E0B0D", border: "1px solid #F59E0B33", fontSize: 12, color: t.textMuted, lineHeight: 1.6 }}>
                {manutQty < manutModal.item.qtdTotal ? (
                  <>
                    <strong style={{ color: "#F59E0B" }}>{manutQty}</strong> unidade{manutQty !== 1 ? "s" : ""} → <strong>Manutenção</strong>
                    <br />
                    <strong style={{ color: t.text }}>{manutModal.item.qtdTotal - manutQty}</strong> unidade{manutModal.item.qtdTotal - manutQty !== 1 ? "s" : ""} → permanecem com {manutModal.item.funcionario !== "—" ? manutModal.item.funcionario : "estoque"}
                  </>
                ) : (
                  <>Todas as <strong style={{ color: "#F59E0B" }}>{manutQty}</strong> unidades → <strong>Manutenção</strong></>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setManutModal(null)}
                style={{ padding: "9px 18px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: "none", color: t.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
              <button onClick={async () => {
                  const item = manutModal.item;
                  setManutModal(null);
                  await handleToggleManutencao(item, manutQty);
                }}
                style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: "#F59E0B", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                <FontAwesomeIcon icon={faWrench} /> Confirmar Manutenção
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
