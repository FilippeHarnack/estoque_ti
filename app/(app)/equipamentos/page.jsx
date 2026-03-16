"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { Btn, Table, StatusBadge, Modal } from "@/components/ui";
import FormItem from "@/components/forms/FormItem";
import ModalMovimento from "@/components/forms/ModalMovimento";
import { CAT_ICONS, CAT_FILTROS, STATUS_FILTROS, DEPARTAMENTOS } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faArrowDown, faArrowUp, faFilter, faXmark, faTag, faCircleDot, faBuilding } from "@fortawesome/free-solid-svg-icons";

export default function EquipamentosPage() {
  const { t, dark, itens, podeAdmin, podeEditar, handleSaveItem, handleDelete, handleMovimento, funcionarios } = useApp();

  const [busca, setBusca]       = useState("");
  const [catFil, setCatFil]     = useState("Todas");
  const [statusFil, setStatusFil] = useState("Todos");
  const [deptFil, setDeptFil]   = useState("Todos");
  const [funcFil, setFuncFil]   = useState("Todos");
  const [selecionado, setSelecionado] = useState(null);
  const [editando, setEditando] = useState(null);
  const [adicionando, setAdicionando] = useState(false);
  const [confirmDel, setConfirmDel]   = useState(null);
  const [movModal, setMovModal] = useState(null);

  const sel = { padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.borderMed}`, fontSize: 13, color: t.text, background: t.inputBg, cursor: "pointer", fontFamily: "inherit", outline: "none" };

  const filtrados = useMemo(() => itens.filter((a) => {
    const q = busca.toLowerCase();
    const mB = !q || [a.nome, a.marca, a.modelo, a.serial, a.funcionario, a.departamento].some((v) => v?.toLowerCase().includes(q));
    return mB && (catFil === "Todas" || a.categoria === catFil) && (statusFil === "Todos" || a.status === statusFil) && (deptFil === "Todos" || a.departamento === deptFil) && (funcFil === "Todos" || a.funcionario === funcFil);
  }), [itens, busca, catFil, statusFil, deptFil, funcFil]);

  const temFiltros = catFil !== "Todas" || statusFil !== "Todos" || deptFil !== "Todos" || funcFil !== "Todos" || busca;

  return (
    <>
      <Header title="Equipamentos" search={busca} onSearch={setBusca}
        actions={podeEditar && <Btn onClick={() => setAdicionando(true)} t={t} variant="primary">+ Adicionar Item</Btn>}
      />
      <main style={{ flex: 1, overflowY: "auto", padding: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, padding: "14px 16px" }}>
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
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              {[
                { label: "Categoria", icon: faTag,      value: catFil,    onChange: setCatFil,    opts: CAT_FILTROS,    active: catFil    !== "Todas" },
                { label: "Status",    icon: faCircleDot, value: statusFil, onChange: setStatusFil, opts: STATUS_FILTROS, active: statusFil !== "Todos" },
                { label: "Depto.",    icon: faBuilding,  value: deptFil,   onChange: setDeptFil,   opts: DEPARTAMENTOS,  active: deptFil   !== "Todos" },
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
                <button onClick={() => { setCatFil("Todas"); setStatusFil("Todos"); setDeptFil("Todos"); setFuncFil("Todos"); setBusca(""); }}
                  style={{ padding: "7px 13px", borderRadius: 8, border: `1px solid ${t.dangerBdr}`, background: t.dangerBg, color: t.danger, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5, alignSelf: "flex-end" }}>
                  <FontAwesomeIcon icon={faXmark} /> Limpar
                </button>
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
                label: "Ações", render: (r) => (
                  <div style={{ display: "flex", gap: 5 }} onClick={(e) => e.stopPropagation()}>
                    {podeAdmin  && <Btn small t={t} variant="success" onClick={() => setMovModal({ tipo: "entrada", item: r })}>+Entrada</Btn>}
                    {podeAdmin  && <Btn small t={t} variant="danger"  onClick={() => setMovModal({ tipo: "saida",   item: r })}>−Saída</Btn>}
                    {podeEditar && <Btn small t={t} variant="ghost"   onClick={() => setEditando(r)}>Editar</Btn>}
                    {podeAdmin  && <Btn small t={t} variant="danger"  onClick={() => setConfirmDel(r)}>Excluir</Btn>}
                  </div>
                )
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
            {podeAdmin  && (
              <Btn t={t} variant="success" small onClick={() => { setMovModal({ tipo: "entrada", item: selecionado }); setSelecionado(null); }}>
                <FontAwesomeIcon icon={faArrowDown} style={{ marginRight: 5 }} /> Entrada
              </Btn>
            )}
            {podeAdmin  && (
              <Btn t={t} variant="danger" small onClick={() => { setMovModal({ tipo: "saida", item: selecionado }); setSelecionado(null); }}>
                <FontAwesomeIcon icon={faArrowUp} style={{ marginRight: 5 }} /> Saída
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

      {confirmDel && (
        <Modal titulo="Excluir Equipamento?" onClose={() => setConfirmDel(null)} t={t} maxW={420}>
          <div style={{ background: t.dangerBg, border: `1px solid ${t.dangerBdr}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
            <p style={{ color: t.text, fontSize: 14, margin: 0 }}>Tem certeza que deseja excluir <strong>{confirmDel.nome}</strong>?<br /><span style={{ color: t.textFaint, fontSize: 13 }}>Esta ação não pode ser desfeita.</span></p>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => setConfirmDel(null)} variant="ghost" t={t}>Cancelar</Btn>
            <Btn onClick={() => { handleDelete(confirmDel.id); setConfirmDel(null); }} variant="danger" t={t}>Sim, Excluir</Btn>
          </div>
        </Modal>
      )}

      {movModal && (
        <ModalMovimento tipo={movModal.tipo} itemInicial={movModal.item} itens={itens} onSave={(params) => { handleMovimento({ tipo: movModal.tipo, ...params }); setMovModal(null); }} onClose={() => setMovModal(null)} t={t} />
      )}
    </>
  );
}
