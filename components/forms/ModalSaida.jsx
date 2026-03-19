import { useState } from "react";
import { DEPARTAMENTOS, CAT_ICONS } from "@/lib/constants";
import { Modal, Btn } from "@/components/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faUser, faTriangleExclamation, faTruck, faPen } from "@fortawesome/free-solid-svg-icons";

export default function ModalSaida({ itens, funcionarios, onSave, onClose, t }) {
  // funcionarios vem do context: ["Todos", "Ana", "Gustavo", ...]
  const funcLista = funcionarios.filter((f) => f !== "Todos");

  const [funcSel, setFuncSel] = useState("");
  const [funcNovo, setFuncNovo] = useState("");
  const isNovo = funcSel === "__novo__";
  const funcFinal = isNovo ? funcNovo.trim() : funcSel;

  const [depto, setDepto] = useState("TI");
  const [busca, setBusca] = useState("");
  const [itemSel, setItemSel] = useState(null);
  const [showDrop, setShowDrop] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [qty, setQty] = useState(1);
  const [obs, setObs] = useState("");

  const maxQty = itemSel?.qtdDisponivel ?? 0;
  const canSave = funcFinal.length > 0 && !!itemSel && qty >= 1 && qty <= maxQty;

  const handleBusca = (val) => {
    setBusca(val);
    setItemSel(null);
    if (!val.trim()) { setSugestoes([]); setShowDrop(false); return; }
    const q = val.toLowerCase();
    const res = itens
      .filter((i) => i.qtdDisponivel > 0)
      .filter((i) =>
        i.nome.toLowerCase().includes(q) ||
        i.marca.toLowerCase().includes(q) ||
        i.serial?.toLowerCase().includes(q)
      )
      .slice(0, 8);
    setSugestoes(res);
    setShowDrop(true);
  };

  const selecionarItem = (item) => {
    setItemSel(item);
    setBusca(item.nome);
    setSugestoes([]);
    setShowDrop(false);
    setQty(1);
  };

  const limparItem = () => {
    setItemSel(null);
    setBusca("");
    setSugestoes([]);
    setShowDrop(false);
  };

  const inp = {
    padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`,
    fontSize: 14, color: t.text, background: t.inputBg,
    fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box",
  };
  const lbl = {
    fontSize: 11, fontWeight: 700, color: t.textMuted,
    textTransform: "uppercase", letterSpacing: 0.5,
    display: "block", marginBottom: 6,
  };

  return (
    <Modal
      titulo={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <FontAwesomeIcon icon={faArrowUp} />
          Saída do Estoque
        </span>
      }
      onClose={onClose} t={t} maxW={500}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

        {/* ── Funcionário ── */}
        <div>
          <label style={lbl}>
            <FontAwesomeIcon icon={faUser} style={{ marginRight: 5 }} />
            Funcionário <span style={{ fontWeight: 400, color: t.danger, textTransform: "none" }}>*obrigatório</span>
          </label>
          <select
            value={funcSel}
            onChange={(e) => { setFuncSel(e.target.value); setFuncNovo(""); }}
            style={{ ...inp, cursor: "pointer", border: !funcSel ? `1px solid ${t.danger}66` : `1.5px solid ${t.accent}` }}
          >
            <option value="">Selecione um funcionário...</option>
            {funcLista.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
            <option value="__novo__">+ Novo funcionário...</option>
          </select>
          {isNovo && (
            <input
              value={funcNovo}
              onChange={(e) => setFuncNovo(e.target.value)}
              placeholder="Nome completo do funcionário"
              style={{ ...inp, marginTop: 8, border: !funcNovo.trim() ? `1px solid ${t.danger}66` : `1px solid ${t.borderMed}` }}
              autoFocus
            />
          )}
        </div>

        {/* ── Departamento ── */}
        <div>
          <label style={lbl}>Departamento</label>
          <select value={depto} onChange={(e) => setDepto(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
            {DEPARTAMENTOS.slice(1).map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* ── Item ── */}
        <div style={{ position: "relative" }}>
          <label style={lbl}>Item <span style={{ fontWeight: 400, color: t.danger, textTransform: "none" }}>*obrigatório</span></label>
          <div style={{ position: "relative" }}>
            <input
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              onFocus={() => { if (sugestoes.length > 0) setShowDrop(true); }}
              placeholder="Buscar item disponível no estoque..."
              style={{
                ...inp,
                paddingRight: itemSel ? 36 : 12,
                border: itemSel ? `1.5px solid ${t.success}` : `1px solid ${t.borderMed}`,
              }}
            />
            {itemSel && (
              <button
                onClick={limparItem}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textFaint, fontSize: 16, padding: 0 }}>
                ✕
              </button>
            )}
          </div>
          {showDrop && sugestoes.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: t.surface, border: `1px solid ${t.borderMed}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", marginTop: 4, overflow: "hidden" }}>
              {sugestoes.map((i) => (
                <div
                  key={i.id}
                  onClick={() => selecionarItem(i)}
                  style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceHov)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <span style={{ fontSize: 18, color: t.textMuted }}>
                    {CAT_ICONS[i.categoria] && <FontAwesomeIcon icon={CAT_ICONS[i.categoria]} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{i.nome}</div>
                    <div style={{ fontSize: 11, color: t.textFaint }}>{i.marca} · {i.modelo}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: t.textFaint }}>Disponível</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: i.qtdDisponivel === 0 ? t.danger : t.success }}>
                      {i.qtdDisponivel}/{i.qtdTotal}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {busca.trim() && !itemSel && !showDrop && sugestoes.length === 0 && (
            <div style={{ marginTop: 6, fontSize: 12, color: t.textFaint, display: "flex", alignItems: "center", gap: 5 }}>
              <FontAwesomeIcon icon={faPen} /> Nenhum item disponível encontrado.
            </div>
          )}
        </div>

        {/* Preview card */}
        {itemSel && (
          <div style={{ background: t.dangerBg, border: `1px solid ${t.danger}44`, borderRadius: 12, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.danger, display: "flex", alignItems: "center", gap: 6 }}>
                {CAT_ICONS[itemSel.categoria] && <FontAwesomeIcon icon={CAT_ICONS[itemSel.categoria]} />}
                {itemSel.nome}
              </div>
              <div style={{ fontSize: 11, color: t.textFaint, marginTop: 2 }}>
                Disponível: {itemSel.qtdDisponivel} · Total: {itemSel.qtdTotal}
                {funcFinal && <> · Para: <strong>{funcFinal}</strong></>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: t.textFaint }}>Após saída</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: t.danger }}>
                −{qty} → {Math.max(0, itemSel.qtdDisponivel - qty)}
              </div>
            </div>
          </div>
        )}

        {/* ── Quantidade ── */}
        <div>
          <label style={lbl}>Quantidade</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#EF4444", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              −
            </button>
            <input
              type="number" min={1} max={maxQty} value={qty}
              onChange={(e) => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{ width: 80, textAlign: "center", padding: "8px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 18, fontWeight: 700, fontFamily: "inherit", outline: "none" }}
            />
            <button
              onClick={() => setQty(Math.min(maxQty, qty + 1))}
              style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#10B981", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              +
            </button>
            <span style={{ fontSize: 12, color: qty > maxQty ? t.danger : t.textFaint }}>
              máx {maxQty}
            </span>
          </div>
          {qty > maxQty && (
            <div style={{ marginTop: 6, fontSize: 12, color: t.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} /> Quantidade maior que o disponível.
            </div>
          )}
        </div>

        {/* ── Observação ── */}
        <div>
          <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional)</span></label>
          <input
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ex: empréstimo temporário, substituição…"
            style={inp}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <Btn onClick={onClose} variant="ghost" t={t}>Cancelar</Btn>
        <Btn
          onClick={() => onSave({
            itemSel,
            nomeItem: busca.trim(),
            serial: itemSel?.serial || "—",
            patrimonio: itemSel?.patrimonio || "—",
            qty,
            func: funcFinal,
            depto,
            obs,
          })}
          variant="danger" t={t} disabled={!canSave}
        >
          <FontAwesomeIcon icon={faTruck} style={{ marginRight: 6 }} />
          Confirmar Saída (−{qty})
        </Btn>
      </div>
    </Modal>
  );
}
