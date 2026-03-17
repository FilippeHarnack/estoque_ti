import { useState } from "react";
import { CATEGORIAS_ITENS, DEPARTAMENTOS, STATUS_LIST } from "@/lib/constants";
import { InputField, SelectField, Btn } from "@/components/ui";
import { hoje } from "@/lib/constants";
import { useApp } from "@/contexts/AppContext";
import { faPlus, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function MarcaField({ value, onChange, marcas, onAddMarca, t }) {
  const [adicionando, setAdicionando] = useState(false);
  const [novaMarca, setNovaMarca]     = useState("");
  const [salvando, setSalvando]       = useState(false);
  const [erro, setErro]               = useState("");

  const salvar = async () => {
    const nome = novaMarca.trim();
    if (!nome) return;
    setSalvando(true);
    setErro("");
    try {
      const criada = await onAddMarca(nome);
      onChange(criada.nome);
      setNovaMarca("");
      setAdicionando(false);
    } catch {
      setErro("Marca já existe ou erro ao salvar.");
    }
    setSalvando(false);
  };

  return (
    <div style={{ flex: 1, minWidth: "45%", display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Marca</label>

      {adicionando ? (
        <div style={{ display: "flex", gap: 6 }}>
          <input
            autoFocus
            value={novaMarca}
            onChange={(e) => setNovaMarca(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") salvar(); if (e.key === "Escape") setAdicionando(false); }}
            placeholder="Nome da marca..."
            style={{ flex: 1, padding: "8px 10px", borderRadius: 9, border: `1px solid ${t.accent}`, background: t.inputBg, color: t.text, fontSize: 13, fontFamily: "inherit", outline: "none" }}
          />
          <button onClick={salvar} disabled={salvando || !novaMarca.trim()}
            style={{ padding: "0 12px", borderRadius: 9, border: "none", background: t.accent, color: "#fff", cursor: "pointer", fontSize: 13 }}>
            <FontAwesomeIcon icon={faCheck} />
          </button>
          <button onClick={() => { setAdicionando(false); setErro(""); }}
            style={{ padding: "0 10px", borderRadius: 9, border: `1px solid ${t.borderMed}`, background: "transparent", color: t.textMuted, cursor: "pointer", fontSize: 13 }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6 }}>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ flex: 1, padding: "8px 10px", borderRadius: 9, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: value ? t.text : t.textFaint, fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" }}
          >
            <option value="">Selecionar marca...</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.nome}>{m.nome}</option>
            ))}
          </select>
          <button onClick={() => setAdicionando(true)} title="Nova marca"
            style={{ padding: "0 12px", borderRadius: 9, border: `1px solid ${t.borderMed}`, background: t.surface, color: t.accent, cursor: "pointer", fontSize: 13, flexShrink: 0 }}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      )}
      {erro && <span style={{ fontSize: 11, color: "#EF4444" }}>{erro}</span>}
    </div>
  );
}

const MARCAS_LISTA = ["Apple", "Asus", "Acer", "HP", "Lenovo", "LG", "Logitech", "Microsoft", "Motorola", "My Max", "Samsung", "Generic"];

export default function FormItem({ item, onSave, onClose, t }) {
  const { handleAddMarca } = useApp();
  const marcas = MARCAS_LISTA.map((nome, i) => ({ id: i, nome }));

  const [f, setF] = useState({
    nome:          item?.nome         || "",
    categoria:     item?.categoria    || "Notebook",
    marca:         item?.marca        || "",
    modelo:        item?.modelo       || "",
    serial:        item?.serial       || "",
    patrimonio:    item?.patrimonio   || "",
    funcionario:   item?.funcionario  || "",
    departamento:  item?.departamento || "TI",
    status:        item?.status       || "Disponível",
    dataCompra:    item?.dataCompra   || hoje(),
    notas:         item?.notas        || "",
    qtdTotal:      item?.qtdTotal     ?? 1,
    qtdDisponivel: item?.qtdDisponivel ?? 1,
  });
  const s = (k, v) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <InputField label="Nome do Item"       value={f.nome}         onChange={(e) => s("nome", e.target.value)}          t={t} />
        <SelectField label="Categoria"         value={f.categoria}    onChange={(e) => s("categoria", e.target.value)}      opts={CATEGORIAS_ITENS} t={t} half />
        <MarcaField
          value={f.marca}
          onChange={(v) => s("marca", v)}
          marcas={marcas}
          onAddMarca={handleAddMarca}
          t={t}
        />
        <InputField label="Modelo"             value={f.modelo}       onChange={(e) => s("modelo", e.target.value)}         t={t} half />
        <InputField label="Nº de Série"        value={f.serial}       onChange={(e) => s("serial", e.target.value)}        t={t} half mono />
        <InputField label="Nº de Patrimônio"   value={f.patrimonio}   onChange={(e) => s("patrimonio", e.target.value)}    t={t} half mono />
        <InputField label="Funcionário"        value={f.funcionario}  onChange={(e) => s("funcionario", e.target.value)}   t={t} half />
        <SelectField label="Departamento"      value={f.departamento} onChange={(e) => s("departamento", e.target.value)}  opts={DEPARTAMENTOS.slice(1)} t={t} half />
        <SelectField label="Status"            value={f.status}       onChange={(e) => s("status", e.target.value)}        opts={STATUS_LIST} t={t} half />
        <InputField label="Data de Compra"     value={f.dataCompra}   onChange={(e) => s("dataCompra", e.target.value)}    type="date" t={t} half />
      </div>
      <div style={{ background: t.bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${t.border}` }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Controle de Estoque</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[["qtdTotal", "Qtd. Total"], ["qtdDisponivel", "Qtd. Disponível"]].map(([key, lbl]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 120 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => s(key, Math.max(0, f[key] - 1))} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#EF4444", fontWeight: 700, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>−</button>
                <input type="number" min={0} value={f[key]} onChange={(e) => s(key, parseInt(e.target.value) || 0)} style={{ width: 60, textAlign: "center", padding: "7px", borderRadius: 8, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 15, fontWeight: 700, fontFamily: "inherit", outline: "none" }} />
                <button onClick={() => s(key, f[key] + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#10B981", fontWeight: 700, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Observações</label>
        <textarea value={f.notas} onChange={(e) => s("notas", e.target.value)} rows={2} style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, fontSize: 14, color: t.text, background: t.inputBg, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <Btn onClick={onClose} variant="ghost" t={t}>Cancelar</Btn>
        <Btn onClick={() => onSave(f)} variant="primary" t={t} disabled={!f.nome.trim()}>Salvar Item</Btn>
      </div>
    </div>
  );
}
