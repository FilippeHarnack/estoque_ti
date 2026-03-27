import { useState } from "react";
import { DEPARTAMENTOS, CAT_ICONS } from "@/lib/constants";
import { Modal, Btn } from "@/components/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp, faUser, faTriangleExclamation, faTruck,
  faRotateLeft, faBoxOpen, faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

// ── Lista de itens da pessoa com botão Devolver ──────────────────────────────
function ListaItensFuncionario({ itens, funcSel, onDevolucao, t, devolvendo }) {
  const itensFuncionario = itens.filter((i) => i.funcionario === funcSel);

  if (!itensFuncionario.length) {
    return (
      <div style={{ textAlign: "center", padding: "28px 0", color: t.textFaint }}>
        <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: 28, marginBottom: 10, display: "block", margin: "0 auto 10px" }} />
        <div style={{ fontSize: 13 }}>Nenhum item em posse de <strong style={{ color: t.text }}>{funcSel}</strong></div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
        {itensFuncionario.length} item{itensFuncionario.length !== 1 ? "s" : ""} em posse
      </div>
      {itensFuncionario.map((item) => (
        <div key={item.id} style={{
          display: "flex", alignItems: "center", gap: 12,
          background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12,
          padding: "10px 14px",
        }}>
          <span style={{ fontSize: 18, color: t.textMuted, width: 22, textAlign: "center", flexShrink: 0 }}>
            {CAT_ICONS[item.categoria] && <FontAwesomeIcon icon={CAT_ICONS[item.categoria]} />}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.nome}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: t.textMuted }}>{item.categoria}</span>
              {item.serial && item.serial !== "—" && (
                <span style={{ fontSize: 10, fontFamily: "monospace", color: t.textMuted, background: t.border, borderRadius: 4, padding: "1px 6px" }}>S/N: {item.serial}</span>
              )}
              {item.patrimonio && item.patrimonio !== "—" && (
                <span style={{ fontSize: 10, fontFamily: "monospace", color: t.accent, background: `${t.accent}18`, border: `1px solid ${t.accent}55`, borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>PAT: {item.patrimonio}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => onDevolucao({ item, qty: Math.max(1, item.qtdTotal - item.qtdDisponivel), obs: "" })}
            disabled={devolvendo === item.id}
            style={{
              padding: "6px 14px", borderRadius: 9, border: "none",
              background: devolvendo === item.id ? t.surface : "#3B82F6",
              color: devolvendo === item.id ? t.textFaint : "#fff",
              fontSize: 12, fontWeight: 700, cursor: devolvendo === item.id ? "default" : "pointer",
              fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
            {devolvendo === item.id ? "Devolvendo…" : "Devolver"}
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Formulário de nova saída ─────────────────────────────────────────────────
function FormNovaSaida({ itens, funcFinal, depto, setDepto, onSave, onClose, t }) {
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
      .filter((i) => i.nome.toLowerCase().includes(q) || i.marca.toLowerCase().includes(q) || i.serial?.toLowerCase().includes(q))
      .slice(0, 8);
    setSugestoes(res);
    setShowDrop(true);
  };

  const selecionarItem = (item) => {
    setItemSel(item); setBusca(item.nome);
    setSugestoes([]); setShowDrop(false); setQty(1);
  };

  const inp = {
    padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`,
    fontSize: 14, color: t.text, background: t.inputBg,
    fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box",
  };
  const lbl = { fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13, paddingTop: 4 }}>
      {/* Item search */}
      <div style={{ position: "relative" }}>
        <label style={lbl}>Item <span style={{ fontWeight: 400, color: t.danger, textTransform: "none" }}>*obrigatório</span></label>
        <div style={{ position: "relative" }}>
          <input
            value={busca}
            onChange={(e) => handleBusca(e.target.value)}
            onFocus={() => { if (sugestoes.length > 0) setShowDrop(true); }}
            placeholder="Buscar item disponível no estoque..."
            style={{ ...inp, paddingRight: itemSel ? 36 : 12, border: itemSel ? `1.5px solid ${t.success}` : `1px solid ${t.borderMed}` }}
          />
          {itemSel && (
            <button onClick={() => { setItemSel(null); setBusca(""); setSugestoes([]); setShowDrop(false); }}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textFaint, fontSize: 16, padding: 0 }}>
              ✕
            </button>
          )}
        </div>
        {showDrop && sugestoes.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: t.surface, border: `1px solid ${t.borderMed}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", marginTop: 4, overflow: "hidden" }}>
            {sugestoes.map((i) => (
              <div key={i.id} onClick={() => selecionarItem(i)}
                style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceHov)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                <span style={{ fontSize: 18, color: t.textMuted }}>
                  {CAT_ICONS[i.categoria] && <FontAwesomeIcon icon={CAT_ICONS[i.categoria]} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{i.nome}</div>
                  <div style={{ fontSize: 11, color: t.textFaint }}>{i.marca} · {i.modelo}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: t.textFaint }}>Disponível</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: i.qtdDisponivel === 0 ? t.danger : t.success }}>{i.qtdDisponivel}/{i.qtdTotal}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      {itemSel && (
        <div style={{ background: t.dangerBg, border: `1px solid ${t.danger}44`, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.danger, display: "flex", alignItems: "center", gap: 6 }}>
              {CAT_ICONS[itemSel.categoria] && <FontAwesomeIcon icon={CAT_ICONS[itemSel.categoria]} />}
              {itemSel.nome}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
              <span style={{ fontSize: 11, color: t.textMuted }}>Para: <strong style={{ color: t.text }}>{funcFinal}</strong></span>
              <span style={{ fontSize: 11, color: t.textFaint }}>·</span>
              <span style={{ fontSize: 11, color: t.textMuted }}>Disp.: <strong style={{ color: t.success }}>{itemSel.qtdDisponivel}</strong></span>
              {itemSel.serial && itemSel.serial !== "—" && (
                <span style={{ fontSize: 10, fontFamily: "monospace", color: t.textMuted, background: t.border, borderRadius: 4, padding: "1px 6px" }}>S/N: {itemSel.serial}</span>
              )}
              {itemSel.patrimonio && itemSel.patrimonio !== "—" && (
                <span style={{ fontSize: 10, fontFamily: "monospace", color: t.accent, background: `${t.accent}18`, border: `1px solid ${t.accent}55`, borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>PAT: {itemSel.patrimonio}</span>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: t.textFaint }}>Após saída</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: t.danger }}>−{qty} → {Math.max(0, itemSel.qtdDisponivel - qty)}</div>
          </div>
        </div>
      )}

      {/* Departamento */}
      <div>
        <label style={lbl}>Departamento</label>
        <select value={depto} onChange={(e) => setDepto(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
          {DEPARTAMENTOS.slice(1).map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Quantidade */}
      <div>
        <label style={lbl}>Quantidade</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#EF4444", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>−</button>
          <input type="number" min={1} max={maxQty} value={qty} onChange={(e) => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))} style={{ width: 80, textAlign: "center", padding: "8px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 18, fontWeight: 700, fontFamily: "inherit", outline: "none" }} />
          <button onClick={() => setQty(Math.min(maxQty, qty + 1))} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#10B981", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</button>
          <span style={{ fontSize: 12, color: qty > maxQty ? t.danger : t.textFaint }}>máx {maxQty}</span>
        </div>
        {qty > maxQty && (
          <div style={{ marginTop: 6, fontSize: 12, color: t.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <FontAwesomeIcon icon={faTriangleExclamation} /> Quantidade maior que o disponível.
          </div>
        )}
      </div>

      {/* Observação */}
      <div>
        <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional)</span></label>
        <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: empréstimo temporário, substituição…" style={inp} />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <Btn onClick={onClose} variant="ghost" t={t}>Cancelar</Btn>
        <Btn
          onClick={() => onSave({ itemSel, nomeItem: busca.trim(), serial: itemSel?.serial || "—", patrimonio: itemSel?.patrimonio || "—", qty, func: funcFinal, depto, obs })}
          variant="danger" t={t} disabled={!canSave}
        >
          <FontAwesomeIcon icon={faTruck} style={{ marginRight: 6 }} />
          Confirmar Saída (−{qty})
        </Btn>
      </div>
    </div>
  );
}

// ── Modal principal ───────────────────────────────────────────────────────────
export default function ModalSaida({ itens, funcionarios, funcionarioInicial, onSave, onDevolucao, onClose, t }) {
  const funcLista = funcionarios.filter((f) => f !== "Todos" && f !== "—");

  const [funcSel, setFuncSel] = useState(funcionarioInicial || "");
  const [funcNovo, setFuncNovo] = useState("");
  const isNovo = funcSel === "__novo__";
  const funcFinal = isNovo ? funcNovo.trim() : funcSel;

  const [depto, setDepto] = useState("TI");
  const [mostraNovaSaida, setMostraNovaSaida] = useState(false);
  const [devolvendo, setDevolvendo] = useState(null); // id do item sendo devolvido

  const inp = {
    padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`,
    fontSize: 14, color: t.text, background: t.inputBg,
    fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box",
  };
  const lbl = { fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 };

  const handleDevolucaoItem = async (params) => {
    setDevolvendo(params.item.id);
    try {
      await onDevolucao(params);
    } finally {
      setDevolvendo(null);
    }
  };

  return (
    <Modal
      titulo={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <FontAwesomeIcon icon={faArrowUp} />
          Saída do Estoque
        </span>
      }
      onClose={onClose} t={t} maxW={520}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Funcionário selector ── */}
        <div>
          <label style={lbl}>
            <FontAwesomeIcon icon={faUser} style={{ marginRight: 5 }} />
            Funcionário <span style={{ fontWeight: 400, color: t.danger, textTransform: "none" }}>*obrigatório</span>
          </label>
          <select
            value={funcSel}
            onChange={(e) => { setFuncSel(e.target.value); setFuncNovo(""); setMostraNovaSaida(false); }}
            style={{ ...inp, cursor: "pointer", border: !funcSel ? `1px solid ${t.danger}66` : `1.5px solid ${t.accent}` }}
          >
            <option value="">Selecione um funcionário...</option>
            {funcLista.map((f) => <option key={f} value={f}>{f}</option>)}
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

        {/* ── Itens em posse (quando funcionário selecionado e não é novo) ── */}
        {funcFinal && !isNovo && (
          <>
            <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14 }}>
              <ListaItensFuncionario
                itens={itens}
                funcSel={funcFinal}
                onDevolucao={handleDevolucaoItem}
                t={t}
                devolvendo={devolvendo}
              />
            </div>

            {/* ── Toggle nova saída ── */}
            <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
              <button
                onClick={() => setMostraNovaSaida((v) => !v)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: t.accent, fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: 0 }}
              >
                <FontAwesomeIcon icon={faArrowUp} />
                Dar novo item a {funcFinal}
                <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 10, transition: "transform 0.2s", transform: mostraNovaSaida ? "rotate(180deg)" : "none" }} />
              </button>

              {mostraNovaSaida && (
                <div style={{ marginTop: 14 }}>
                  <FormNovaSaida
                    itens={itens}
                    funcFinal={funcFinal}
                    depto={depto}
                    setDepto={setDepto}
                    onSave={onSave}
                    onClose={onClose}
                    t={t}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Quando é novo funcionário: mostrar direto o formulário de saída ── */}
        {isNovo && funcNovo.trim() && (
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14 }}>
            <FormNovaSaida
              itens={itens}
              funcFinal={funcNovo.trim()}
              depto={depto}
              setDepto={setDepto}
              onSave={onSave}
              onClose={onClose}
              t={t}
            />
          </div>
        )}

        {/* ── Botão fechar quando sem funcionário ── */}
        {!funcFinal && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <Btn onClick={onClose} variant="ghost" t={t}>Cancelar</Btn>
          </div>
        )}
      </div>
    </Modal>
  );
}
