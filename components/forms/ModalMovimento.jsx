import { useState } from "react";
import { DEPARTAMENTOS, CAT_ICONS } from "@/lib/constants";
import { Modal, Btn } from "@/components/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown, faArrowUp, faPen, faTriangleExclamation,
  faCircleCheck, faTruck, faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function ModalMovimento({ tipo, itemInicial, itens, onSave, onClose, t, semFuncionario = false }) {
  const isEntrada   = tipo === "entrada";
  const isDevolucao = tipo === "devolucao";
  const [busca, setBusca]         = useState(itemInicial?.nome ?? "");
  const [sugestoes, setSugestoes] = useState([]);
  const [itemSel, setItemSel]     = useState(itemInicial ?? null);
  const [showDrop, setShowDrop]   = useState(false);
  const [qty, setQty]             = useState(1);
  const [serial, setSerial]       = useState(itemInicial?.serial ?? "");
  const [patrimonio, setPatrimonio] = useState(itemInicial?.patrimonio ?? "");
  const [func, setFunc]           = useState("");
  const [depto, setDepto]         = useState("TI");
  const [obs, setObs]             = useState("");

  // max(1, qtdFora) para cobrir dados inconsistentes subidos direto no DB
  const maxDevolver = isDevolucao ? Math.max(1, (itemInicial?.qtdTotal ?? 0) - (itemInicial?.qtdDisponivel ?? 0)) : 0;
  const maxQty   = isEntrada ? 9999 : isDevolucao ? maxDevolver : (itemSel?.qtdDisponivel ?? 0);
  const canSave  = isDevolucao ? (qty >= 1 && qty <= maxDevolver) : isEntrada ? (busca.trim().length > 0 && qty >= 1) : (!!itemSel && qty >= 1 && qty <= maxQty && func.trim().length > 0);
  // Quando semFuncionario=true, não há campo de destinatário na entrada
  const inp = { padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, fontSize: 14, color: t.text, background: t.inputBg, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" };
  const lbl = { fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 };

  const handleBusca = (val) => {
    setBusca(val); setItemSel(null);
    if (!val.trim()) { setSugestoes([]); setShowDrop(false); return; }
    const q = val.toLowerCase();
    const res = itens.filter((i) => i.nome.toLowerCase().includes(q) || i.marca.toLowerCase().includes(q) || i.serial.toLowerCase().includes(q)).slice(0, 8);
    setSugestoes(res); setShowDrop(true);
  };
  const selecionarItem = (item) => {
    setItemSel(item); setBusca(item.nome); setSerial(item.serial); setPatrimonio(item.patrimonio || "");
    setSugestoes([]); setShowDrop(false); setQty(1);
    if (!isEntrada) return;
    if (item.funcionario && item.funcionario !== "—") setFunc(item.funcionario);
  };
  const limparItem = () => { setItemSel(null); setBusca(""); setSerial(""); setPatrimonio(""); setSugestoes([]); setShowDrop(false); };

  if (isDevolucao) {
    const item = itemInicial;
    return (
      <Modal
        titulo={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><FontAwesomeIcon icon={faRotateLeft} /> Devolver ao Estoque</span>}
        onClose={onClose} t={t} maxW={460}
      >
        <div style={{ background: t.surface, borderRadius: 12, padding: "12px 16px", marginBottom: 16, border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4 }}>{item?.nome}</div>
          <div style={{ fontSize: 12, color: t.textFaint }}>Atualmente com: <strong style={{ color: t.danger }}>{item?.funcionario}</strong> · {item?.departamento}</div>
          <div style={{ fontSize: 12, color: t.textFaint, marginTop: 2 }}>Unidades fora: {maxDevolver} · Total: {item?.qtdTotal}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Quantidade a devolver</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#EF4444", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>−</button>
              <input type="number" min={1} max={maxDevolver} value={qty} onChange={(e) => setQty(Math.min(maxDevolver, Math.max(1, parseInt(e.target.value) || 1)))} style={{ width: 80, textAlign: "center", padding: "8px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 18, fontWeight: 700, fontFamily: "inherit", outline: "none" }} />
              <button onClick={() => setQty(Math.min(maxDevolver, qty + 1))} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#10B981", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</button>
              <span style={{ fontSize: 12, color: t.textFaint }}>máx {maxDevolver}</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Observação <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional)</span></label>
            <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: Funcionário desligado, equipamento substituído…" style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, fontSize: 14, color: t.text, background: t.inputBg, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <Btn onClick={onClose} variant="ghost" t={t}>Cancelar</Btn>
          <Btn onClick={() => onSave({ qty, obs })} variant="primary" t={t} disabled={!canSave}>
            <FontAwesomeIcon icon={faRotateLeft} style={{ marginRight: 6 }} />
            Confirmar Devolução (+{qty})
          </Btn>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      titulo={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <FontAwesomeIcon icon={isEntrada ? faArrowDown : faArrowUp} />
          {isEntrada ? "Entrada no Estoque" : "Saída do Estoque"}
        </span>
      }
      onClose={onClose} t={t} maxW={500}
    >
      <div style={{ marginBottom: 16, position: "relative" }}>
        <label style={lbl}>Equipamento {isEntrada && <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint, marginLeft: 6 }}>(busque ou escreva livremente)</span>}</label>
        <div style={{ position: "relative" }}>
          <input value={busca} onChange={(e) => handleBusca(e.target.value)} onFocus={() => { if (sugestoes.length > 0) setShowDrop(true); }}
            placeholder={isEntrada ? "Nome do equipamento…" : "Digite para buscar…"}
            style={{ ...inp, paddingRight: itemSel ? 36 : 12, border: itemSel ? `1.5px solid ${t.success}` : `1px solid ${t.borderMed}` }} />
          {itemSel && <button onClick={limparItem} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textFaint, fontSize: 16, padding: 0 }}>✕</button>}
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
                  <div style={{ fontSize: 11, color: t.textFaint }}>Disp.</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: i.qtdDisponivel === 0 ? t.danger : t.success }}>{i.qtdDisponivel}/{i.qtdTotal}</div>
                </div>
              </div>
            ))}
            {isEntrada && (
              <div onClick={() => { setSugestoes([]); setShowDrop(false); }} style={{ padding: "9px 14px", fontSize: 12, color: t.accent, fontWeight: 600, cursor: "pointer", background: t.bg, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <FontAwesomeIcon icon={faPen} /> Usar "{busca}" como novo
              </div>
            )}
          </div>
        )}
      </div>

      {itemSel && isEntrada && (!func.trim() || semFuncionario) && (
        <div style={{ background: t.successBg, border: `1px solid ${t.success}44`, borderRadius: 12, padding: "10px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.success, display: "flex", alignItems: "center", gap: 6 }}>
              {CAT_ICONS[itemSel.categoria] && <FontAwesomeIcon icon={CAT_ICONS[itemSel.categoria]} />}
              {itemSel.nome}
            </div>
            <div style={{ fontSize: 11, color: t.textFaint }}>Atual: {itemSel.qtdDisponivel}/{itemSel.qtdTotal}</div>
          </div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: t.textFaint }}>Após entrada</div><div style={{ fontSize: 17, fontWeight: 800, color: t.success }}>+{qty} → {itemSel.qtdDisponivel + qty}</div></div>
        </div>
      )}
      {itemSel && isEntrada && func.trim() && !semFuncionario && (
        <div style={{ background: t.dangerBg, border: `1px solid ${t.danger}44`, borderRadius: 12, padding: "10px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.danger, display: "flex", alignItems: "center", gap: 6 }}>
              {CAT_ICONS[itemSel.categoria] && <FontAwesomeIcon icon={CAT_ICONS[itemSel.categoria]} />}
              {itemSel.nome}
            </div>
            <div style={{ fontSize: 11, color: t.textFaint }}>Entrega direta para <strong>{func}</strong> · Disp.: {itemSel.qtdDisponivel}</div>
          </div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: t.textFaint }}>Após entrega</div><div style={{ fontSize: 17, fontWeight: 800, color: t.danger }}>−{qty} → {Math.max(0, itemSel.qtdDisponivel - qty)}</div></div>
        </div>
      )}
      {itemSel && !isEntrada && (
        <div style={{ background: t.dangerBg, border: `1px solid ${t.danger}44`, borderRadius: 12, padding: "10px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.danger, display: "flex", alignItems: "center", gap: 6 }}>
              {CAT_ICONS[itemSel.categoria] && <FontAwesomeIcon icon={CAT_ICONS[itemSel.categoria]} />}
              {itemSel.nome}
            </div>
            <div style={{ fontSize: 11, color: t.textFaint }}>Disponível: {itemSel.qtdDisponivel} · Total: {itemSel.qtdTotal}</div>
          </div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: t.textFaint }}>Após saída</div><div style={{ fontSize: 17, fontWeight: 800, color: t.danger }}>−{qty} → {Math.max(0, itemSel.qtdDisponivel - qty)}</div></div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <div>
          <label style={lbl}>Nº de Série <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional)</span></label>
          <input value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="Ex: SN-APL-001" style={{ ...inp, fontFamily: "monospace", fontSize: 13 }} />
        </div>
        <div>
          <label style={lbl}>Nº de Patrimônio <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional)</span></label>
          <input value={patrimonio} onChange={(e) => setPatrimonio(e.target.value)} placeholder="Ex: PAT-0001" style={{ ...inp, fontFamily: "monospace", fontSize: 13 }} />
        </div>

        <div>
          <label style={lbl}>Quantidade</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#EF4444", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>−</button>
            <input type="number" min={1} max={isEntrada ? 9999 : maxQty} value={qty} onChange={(e) => setQty(Math.min(isEntrada ? 9999 : maxQty, Math.max(1, parseInt(e.target.value) || 1)))} style={{ width: 80, textAlign: "center", padding: "8px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 18, fontWeight: 700, fontFamily: "inherit", outline: "none" }} />
            <button onClick={() => setQty(Math.min(isEntrada ? 9999 : maxQty, qty + 1))} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#10B981", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</button>
            {!isEntrada && <span style={{ fontSize: 12, color: qty > maxQty ? t.danger : t.textFaint }}>máx {maxQty}</span>}
          </div>
          {!isEntrada && qty > maxQty && (
            <div style={{ marginTop: 6, fontSize: 12, color: t.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} /> Quantidade maior que o disponível.
            </div>
          )}
        </div>

        {isEntrada && !semFuncionario && (
          <div>
            <label style={lbl}>
              Entregar para funcionário{" "}
              <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional — deixe vazio se for pro estoque)</span>
            </label>
            <input value={func} onChange={(e) => setFunc(e.target.value)} placeholder="Ex: Gustavo, Lara Souza… (deixe vazio p/ estoque)" style={{ ...inp, border: func.trim() ? `1.5px solid ${t.danger}88` : `1px solid ${t.borderMed}` }} />
            {func.trim() && (
              <div style={{ fontSize: 11, color: t.danger, marginTop: 4, fontWeight: 600 }}>
                ⚠ Entrega direta — o item será retirado do estoque e atribuído a {func}.
              </div>
            )}
          </div>
        )}

        {!isEntrada && (
          <>
            <div>
              <label style={lbl}>Funcionário que recebe <span style={{ fontWeight: 400, color: t.danger, textTransform: "none" }}>*obrigatório</span></label>
              <input value={func} onChange={(e) => setFunc(e.target.value)} placeholder="Nome completo" style={{ ...inp, border: !func.trim() ? `1px solid ${t.danger}88` : `1px solid ${t.borderMed}` }} />
              {!func.trim() && (
                <div style={{ fontSize: 11, color: t.danger, marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                  <FontAwesomeIcon icon={faTriangleExclamation} /> Informe quem vai receber o equipamento.
                </div>
              )}
            </div>
            <div>
              <label style={lbl}>Departamento</label>
              <select value={depto} onChange={(e) => setDepto(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {DEPARTAMENTOS.slice(1).map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </>
        )}

        <div>
          <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional)</span></label>
          <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: compra emergencial, empréstimo…" style={inp} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <Btn onClick={onClose} variant="ghost" t={t}>Cancelar</Btn>
        <Btn
          onClick={() => onSave({ itemSel, nomeItem: busca.trim(), serial, patrimonio, qty, func: semFuncionario ? "" : func, depto, obs })}
          variant={isEntrada && (semFuncionario || !func.trim()) ? "success" : "danger"} t={t} disabled={!canSave}
        >
          <FontAwesomeIcon icon={isEntrada && (semFuncionario || !func.trim()) ? faCircleCheck : faTruck} style={{ marginRight: 6 }} />
          {isEntrada && (semFuncionario || !func.trim()) ? `Confirmar Entrada (+${qty})` : isEntrada && func.trim() ? `Confirmar Entrega (−${qty})` : `Confirmar Saída (−${qty})`}
        </Btn>
      </div>
    </Modal>
  );
}
