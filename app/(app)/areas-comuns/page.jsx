"use client";
import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faFilter, faXmark, faPlus, faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import { getAllAreas, createArea, updateArea, deleteArea } from "@/services/areasService";
import { Modal } from "@/components/ui";

const CAMPO_VAZIO = {
  "Descrição do Bem": "",
  "Categoria": "",
  "Responsável": "",
  "Quantidade": 1,
  "Etiqueta do patrimônio": "",
  "Observações": "",
};

export default function AreasComuns() {
  const { t, db, unidade, podeEditar, podeAdmin } = useApp();

  const [itens, setItens]           = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState("");
  const [busca, setBusca]           = useState("");
  const [catFil, setCatFil]         = useState("Todas");

  const [modal, setModal]     = useState(false);   // true = novo, objeto = editar
  const [form, setForm]       = useState(CAMPO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  useEffect(() => {
    if (!db || !unidade) return;
    setCarregando(true);
    setErro("");
    getAllAreas(db, unidade)
      .then(setItens)
      .catch((e) => setErro(e.message || "Erro ao carregar dados."))
      .finally(() => setCarregando(false));
  }, [db, unidade]);

  const categorias = useMemo(() =>
    ["Todas", ...[...new Set(itens.map((i) => i["Categoria"]).filter(Boolean))].sort()],
  [itens]);

  const filtrados = useMemo(() => itens.filter((i) => {
    const q = busca.toLowerCase();
    const mB = !q || [i["Descrição do Bem"], i["Categoria"], i["Responsável"], i["Etiqueta do patrimônio"]]
      .some((v) => v?.toLowerCase().includes(q));
    return mB && (catFil === "Todas" || i["Categoria"] === catFil);
  }), [itens, busca, catFil]);

  const temFiltros = catFil !== "Todas" || busca;

  function abrirNovo() {
    setForm(CAMPO_VAZIO);
    setErroForm("");
    setModal(true);
  }

  function abrirEditar(item) {
    setForm({
      "Descrição do Bem": item["Descrição do Bem"] || "",
      "Categoria": item["Categoria"] || "",
      "Responsável": item["Responsável"] || "",
      "Quantidade": item["Quantidade"] ?? 1,
      "Etiqueta do patrimônio": item["Etiqueta do patrimônio"] || "",
      "Observações": item["Observações"] || "",
    });
    setErroForm("");
    setModal(item);
  }

  async function salvar() {
    if (!form["Descrição do Bem"].trim()) { setErroForm("Preencha a descrição do bem."); return; }
    if (!form["Categoria"].trim())        { setErroForm("Preencha a categoria."); return; }
    setSalvando(true);
    setErroForm("");
    try {
      const payload = { ...form, "Quantidade": Number(form["Quantidade"]) || 1 };
      if (modal === true) {
        const novo = await createArea(db, unidade, payload);
        setItens((p) => [...p, novo].sort((a, b) => (a["Descrição do Bem"] || "").localeCompare(b["Descrição do Bem"] || "")));
      } else {
        const atualizado = await updateArea(db, unidade, modal.id, payload);
        setItens((p) => p.map((i) => i.id === modal.id ? atualizado : i));
      }
      setModal(false);
    } catch (e) {
      setErroForm(e.message || "Erro ao salvar.");
    }
    setSalvando(false);
  }

  async function excluir(item) {
    if (!confirm(`Excluir "${item["Descrição do Bem"]}"?`)) return;
    try {
      await deleteArea(db, unidade, item.id);
      setItens((p) => p.filter((i) => i.id !== item.id));
    } catch (e) {
      alert(e.message || "Erro ao excluir.");
    }
  }

  const inp = {
    width: "100%", boxSizing: "border-box", padding: "9px 12px",
    borderRadius: 8, border: `1px solid ${t.borderMed}`,
    background: t.inputBg ?? t.bg, color: t.text,
    fontSize: 13, fontFamily: "inherit", outline: "none",
  };
  const sel = { ...inp, cursor: "pointer" };

  return (
    <>
      <Header title="Áreas Comuns" search={busca} onSearch={setBusca}
        actions={podeEditar && (
          <button onClick={abrirNovo} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }}>
            <FontAwesomeIcon icon={faPlus} /> Adicionar Item
          </button>
        )}
      />

      <main style={{ flex: 1, overflowY: "auto", padding: 22 }}>
        {carregando ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: t.textFaint, fontSize: 14 }}>
            Carregando...
          </div>
        ) : erro ? (
          <div style={{ background: "#3f0a0a", border: "1px solid #7f1d1d", borderRadius: 12, padding: "14px 18px", color: "#FCA5A5", fontSize: 14 }}>
            {erro}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Cards por categoria */}
            {(() => {
              const cats = categorias.slice(1).map((cat) => {
                const lista = itens.filter((i) => i["Categoria"] === cat);
                const total = lista.reduce((s, i) => s + (Number(i["Quantidade"]) || 0), 0);
                return { cat, qtd: lista.length, total };
              });
              if (!cats.length) return null;
              return (
                <div style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Itens por Categoria</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                    {cats.map(({ cat, qtd, total }) => {
                      const ativo = catFil === cat;
                      return (
                        <button key={cat} onClick={() => setCatFil(ativo ? "Todas" : cat)}
                          style={{ background: ativo ? `${t.accent}18` : t.bg, border: `1.5px solid ${ativo ? t.accent : t.border}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "border-color 0.15s" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: ativo ? t.accent : t.text, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat}</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: t.accent, lineHeight: 1 }}>{total}</div>
                          <div style={{ fontSize: 11, color: t.textFaint, marginTop: 2 }}>{qtd} tipo{qtd !== 1 ? "s" : ""}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Filtros */}
            <div style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: t.accent }}><FontAwesomeIcon icon={faFilter} /></span>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Filtros</span>
                {temFiltros && <span style={{ fontSize: 11, background: t.accent, color: "#fff", borderRadius: 20, padding: "1px 8px", fontWeight: 700 }}>ativos</span>}
                <span style={{ marginLeft: "auto", fontSize: 12, color: t.textFaint, fontWeight: 600 }}>{filtrados.length} item{filtrados.length !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: catFil !== "Todas" ? t.accent : t.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    <FontAwesomeIcon icon={faTag} /> Categoria
                  </span>
                  <select value={catFil} onChange={(e) => setCatFil(e.target.value)}
                    style={{ ...sel, border: catFil !== "Todas" ? `1.5px solid ${t.accent}` : `1px solid ${t.borderMed}`, color: catFil !== "Todas" ? t.accent : t.text, fontWeight: catFil !== "Todas" ? 700 : 400 }}>
                    {categorias.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                {temFiltros && (
                  <button onClick={() => { setCatFil("Todas"); setBusca(""); }}
                    style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${t.dangerBdr}`, background: t.dangerBg, color: t.danger, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                    <FontAwesomeIcon icon={faXmark} /> Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Tabela */}
            <div style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden" }}>
              {filtrados.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: t.textFaint, fontSize: 14 }}>Nenhum item encontrado.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: t.bg }}>
                      {["Descrição do Bem", "Categoria", "Responsável", "Qtd.", "Patrimônio", "Observações", ...(podeEditar ? ["Ações"] : [])].map((col) => (
                        <th key={col} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((item, idx) => (
                      <tr key={item.id ?? idx}
                        style={{ borderBottom: `1px solid ${t.border}`, transition: "background 0.1s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = t.bg}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: t.text }}>{item["Descrição do Bem"] || "—"}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{ fontSize: 12, background: `${t.accent}18`, color: t.accent, borderRadius: 6, padding: "3px 8px", fontWeight: 600 }}>{item["Categoria"] || "—"}</span>
                        </td>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: t.textMuted }}>{item["Responsável"] || "—"}</td>
                        <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: 700, color: t.text }}>{item["Quantidade"] ?? "—"}</td>
                        <td style={{ padding: "10px 16px", fontSize: 12, fontFamily: "monospace", color: t.textFaint }}>{item["Etiqueta do patrimônio"] || "—"}</td>
                        <td style={{ padding: "10px 16px", fontSize: 12, color: t.textFaint, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item["Observações"] || "—"}</td>
                        {podeEditar && (
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => abrirEditar(item)}
                                style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${t.borderMed}`, background: t.surface, color: t.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                                <FontAwesomeIcon icon={faPen} />
                              </button>
                              {podeAdmin && (
                                <button onClick={() => excluir(item)}
                                  style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${t.dangerBdr}`, background: t.dangerBg, color: t.danger, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal cadastro/edição */}
      {modal && (
        <Modal titulo={modal === true ? "Adicionar Item" : "Editar Item"} onClose={() => setModal(false)} t={t} maxW={500}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {erroForm && (
              <div style={{ background: "#3f0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "9px 12px", color: "#FCA5A5", fontSize: 13 }}>{erroForm}</div>
            )}
            {[
              { label: "Descrição do Bem *", key: "Descrição do Bem",       type: "text"   },
              { label: "Categoria *",        key: "Categoria",               type: "text"   },
              { label: "Responsável",        key: "Responsável",             type: "text"   },
              { label: "Quantidade",         key: "Quantidade",              type: "number" },
              { label: "Etiqueta do Patrimônio", key: "Etiqueta do patrimônio", type: "text" },
              { label: "Observações",        key: "Observações",             type: "text"   },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 5 }}>{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button onClick={() => setModal(false)}
                style={{ padding: "9px 18px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: "none", color: t.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando}
                style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: salvando ? 0.7 : 1 }}>
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
