"use client";
import { useState } from "react";
import { DEPARTAMENTOS, CAT_ICONS } from "@/lib/constants";
import { Modal, Btn } from "@/components/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightArrowLeft, faUser, faBoxOpen,
  faArrowRight, faXmark, faCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function ModalTransferencia({ itens, funcionarios, funcionarioInicial, onTransferir, onClose, t }) {
  const funcLista = funcionarios.filter((f) => f !== "Todos" && f !== "—");

  const [origem, setOrigem]         = useState(funcionarioInicial || "");
  const [itemSel, setItemSel]       = useState(null);
  const [destino, setDestino]       = useState("");
  const [destinoNovo, setDestinoNovo] = useState("");
  const [depto, setDepto]           = useState("TI");
  const [obs, setObs]               = useState("");
  const [transferindo, setTransferindo] = useState(false);

  const isDestinoNovo = destino === "__novo__";
  const destinoFinal  = isDestinoNovo ? destinoNovo.trim() : destino;

  const itensDaOrigem = itens.filter((i) => i.funcionario === origem);

  const canConfirm = !!itemSel && destinoFinal.length > 0 && destinoFinal !== origem;

  const inp = {
    padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`,
    fontSize: 14, color: t.text, background: t.inputBg,
    fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box",
  };
  const lbl = { fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 };

  const handleConfirmar = async () => {
    if (!canConfirm) return;
    setTransferindo(true);
    try {
      await onTransferir({ item: itemSel, novoFuncionario: destinoFinal, novoDepto: depto, obs });
      // Reset para transferir outro item
      setItemSel(null);
      setDestino("");
      setDestinoNovo("");
      setObs("");
    } finally {
      setTransferindo(false);
    }
  };

  return (
    <Modal
      titulo={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <FontAwesomeIcon icon={faArrowRightArrowLeft} />
          Transferir Equipamento
        </span>
      }
      onClose={onClose} t={t} maxW={540}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Origem ── */}
        <div>
          <label style={lbl}><FontAwesomeIcon icon={faUser} style={{ marginRight: 5 }} />De (origem)</label>
          <select
            value={origem}
            onChange={(e) => { setOrigem(e.target.value); setItemSel(null); }}
            style={{ ...inp, cursor: "pointer", border: !origem ? `1px solid ${t.danger}66` : `1.5px solid ${t.accent}` }}
          >
            <option value="">Selecione o funcionário de origem...</option>
            {funcLista.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* ── Lista de itens da origem ── */}
        {origem && (
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14 }}>
            {itensDaOrigem.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: t.textFaint }}>
                <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: 24, display: "block", margin: "0 auto 8px" }} />
                <div style={{ fontSize: 13 }}>Nenhum item com <strong style={{ color: t.text }}>{origem}</strong></div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  Selecione o item a transferir
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {itensDaOrigem.map((item) => {
                    const sel = itemSel?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setItemSel(sel ? null : item)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          background: sel ? `${t.accent}18` : t.bg,
                          border: `1.5px solid ${sel ? t.accent : t.border}`,
                          borderRadius: 12, padding: "10px 14px",
                          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                          transition: "border-color 0.15s, background 0.15s",
                          width: "100%",
                        }}
                      >
                        <span style={{ fontSize: 18, color: sel ? t.accent : t.textMuted, width: 22, textAlign: "center", flexShrink: 0 }}>
                          {CAT_ICONS[item.categoria] && <FontAwesomeIcon icon={CAT_ICONS[item.categoria]} />}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: sel ? t.accent : t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.nome}
                          </div>
                          <div style={{ fontSize: 11, color: t.textFaint, marginTop: 1 }}>
                            {item.categoria}
                            {item.serial && item.serial !== "—" && <> · <span style={{ fontFamily: "monospace" }}>{item.serial}</span></>}
                            {item.patrimonio && item.patrimonio !== "—" && <> · Pat. {item.patrimonio}</>}
                          </div>
                        </div>
                        {sel && (
                          <span style={{ fontSize: 14, color: t.accent, flexShrink: 0 }}>
                            <FontAwesomeIcon icon={faCheck} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Destino (só aparece após selecionar item) ── */}
        {itemSel && (
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Seta visual de transferência */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: t.bg, borderRadius: 12, padding: "10px 14px", border: `1px solid ${t.border}` }}>
              <span style={{ fontSize: 16, color: t.textMuted }}>
                {CAT_ICONS[itemSel.categoria] && <FontAwesomeIcon icon={CAT_ICONS[itemSel.categoria]} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{itemSel.nome}</div>
                <div style={{ fontSize: 11, color: t.textFaint }}>
                  {itemSel.serial !== "—" && <span style={{ fontFamily: "monospace" }}>{itemSel.serial}</span>}
                  {itemSel.patrimonio !== "—" && <> · Pat. {itemSel.patrimonio}</>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.danger }}>{origem}</span>
                <FontAwesomeIcon icon={faArrowRight} style={{ color: "#F59E0B", fontSize: 14 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: destinoFinal ? t.success : t.textFaint }}>
                  {destinoFinal || "?"}
                </span>
              </div>
            </div>

            {/* Para */}
            <div>
              <label style={lbl}><FontAwesomeIcon icon={faUser} style={{ marginRight: 5 }} />Para (destino)</label>
              <select
                value={destino}
                onChange={(e) => { setDestino(e.target.value); setDestinoNovo(""); }}
                style={{ ...inp, cursor: "pointer", border: !destino ? `1px solid ${t.danger}66` : `1.5px solid ${t.success}` }}
              >
                <option value="">Selecione o destinatário...</option>
                {funcLista.filter((f) => f !== origem).map((f) => <option key={f} value={f}>{f}</option>)}
                <option value="__novo__">+ Novo funcionário...</option>
              </select>
              {isDestinoNovo && (
                <input
                  value={destinoNovo}
                  onChange={(e) => setDestinoNovo(e.target.value)}
                  placeholder="Nome completo do funcionário"
                  autoFocus
                  style={{ ...inp, marginTop: 8 }}
                />
              )}
            </div>

            {/* Departamento */}
            <div>
              <label style={lbl}>Departamento</label>
              <select value={depto} onChange={(e) => setDepto(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {DEPARTAMENTOS.slice(1).map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Observação */}
            <div>
              <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional)</span></label>
              <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: substituição, mudança de setor…" style={inp} />
            </div>

            {/* Ações */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button
                onClick={() => { setItemSel(null); setDestino(""); setDestinoNovo(""); setObs(""); }}
                style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: "transparent", color: t.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
              >
                <FontAwesomeIcon icon={faXmark} /> Cancelar seleção
              </button>
              <Btn
                onClick={handleConfirmar}
                variant="warning" t={t}
                disabled={!canConfirm || transferindo}
              >
                <FontAwesomeIcon icon={faArrowRightArrowLeft} style={{ marginRight: 6 }} />
                {transferindo ? "Transferindo…" : `Transferir para ${destinoFinal || "?"}`}
              </Btn>
            </div>
          </div>
        )}

        {/* Fechar quando sem seleção ativa */}
        {!itemSel && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={onClose} variant="ghost" t={t}>Fechar</Btn>
          </div>
        )}
      </div>
    </Modal>
  );
}
