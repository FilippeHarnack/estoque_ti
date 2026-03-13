'use client'
import { useState, useMemo, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const _mem = {};
const safeStorage = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return _mem[k] ?? null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { _mem[k] = v; } },
  removeItem: (k) => { try { localStorage.removeItem(k); } catch { delete _mem[k]; } },
};

const supabase = createClient(
  "https://amwlloisddlqkvphupol.supabase.co",
  "sb_publishable_EchE2Kefq-B11z-8QCC1vg_sF0nl40v",
  {
    auth: {
      storage: safeStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    }
  }
);

const CATEGORIAS_ITENS = ["Monitor", "Teclado", "Mouse", "Notebook", "HUB", "Suporte de Tela", "Capa Notebook", "Fone/Headset", "Computador", "Rede", "Periférico"];
const DEPARTAMENTOS = ["Todos", "Engenharia", "Marketing", "Financeiro", "RH", "Operações", "TI", "Diretoria"];
const STATUS_LIST = ["Em Uso", "Disponível", "Manutenção", "Desativado"];
const STATUS_FILTROS = ["Todos", ...STATUS_LIST];
const CAT_FILTROS = ["Todas", ...CATEGORIAS_ITENS];
const hoje = () => new Date().toISOString().slice(0, 10);

const STATUSES = {
  "Em Uso": { color: "#3B82F6", bg: "#EFF6FF", bgDk: "#1e3a5f", dot: "#3B82F6" },
  "Disponível": { color: "#10B981", bg: "#ECFDF5", bgDk: "#14432a", dot: "#10B981" },
  "Manutenção": { color: "#F59E0B", bg: "#FFFBEB", bgDk: "#422006", dot: "#F59E0B" },
  "Desativado": { color: "#6B7280", bg: "#F9FAFB", bgDk: "#1f2937", dot: "#9CA3AF" },
};
const CAT_ICONS = {
  Monitor: "🖥️", Teclado: "⌨️", Mouse: "🖱️", Notebook: "💻", HUB: "🔌",
  "Suporte de Tela": "🖥️", "Capa Notebook": "🎒", "Fone/Headset": "🎧",
  Computador: "🖥️", Rede: "📡", "Periférico": "🖱️",
};

function useTheme(dark) {
  return {
    bg: dark ? "#0F172A" : "#F8FAFC",
    surface: dark ? "#1E293B" : "#FFFFFF",
    surfaceHov: dark ? "#2d3f55" : "#EEF2FF",
    border: dark ? "#334155" : "#F1F5F9",
    borderMed: dark ? "#475569" : "#E2E8F0",
    text: dark ? "#F1F5F9" : "#0F172A",
    textMuted: dark ? "#94A3B8" : "#64748B",
    textFaint: dark ? "#475569" : "#94A3B8",
    inputBg: dark ? "#0F172A" : "#F8FAFC",
    rowAlt: dark ? "#1a2740" : "#FAFBFC",
    accent: "#6366F1",
    danger: "#EF4444", dangerBg: dark ? "#3f0a0a" : "#FEF2F2", dangerBdr: dark ? "#7f1d1d" : "#FCA5A5",
    success: "#10B981", successBg: dark ? "#052e16" : "#ECFDF5",
    gold: "#F59E0B",
    dark,
  };
}

function Btn({ onClick, children, variant = "primary", small, t, disabled }) {
  const styles = {
    primary: { background: t.accent, color: "#fff", border: "none" },
    danger: { background: t.danger, color: "#fff", border: "none" },
    ghost: { background: t.surface, color: t.textMuted, border: `1px solid ${t.borderMed}` },
    success: { background: t.success, color: "#fff", border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], padding: small ? "5px 11px" : "9px 20px",
      borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "inherit", fontWeight: 600, fontSize: small ? 12 : 14,
      opacity: disabled ? 0.5 : 1, transition: "opacity 0.15s",
    }}>{children}</button>
  );
}

function StatusBadge({ status, dark }) {
  const s = STATUSES[status] || STATUSES["Disponível"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, background: dark ? s.bgDk : s.bg, border: `1px solid ${s.color}33` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
}

function Modal({ titulo, onClose, children, t, maxW = 560 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: t.surface, borderRadius: 20, padding: 30, width: "100%", maxWidth: maxW, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${t.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: t.text }}>{titulo}</h2>
          <button onClick={onClose} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14, color: t.textMuted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent, sub, onClick, t }) {
  return (
    <div onClick={onClick} style={{ background: t.surface, borderRadius: 16, padding: "18px 20px", border: `1px solid ${t.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 7, flex: 1, minWidth: 140, cursor: onClick ? "pointer" : "default", transition: "transform 0.15s", userSelect: "none" }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = "translateY(-2px)" }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = "translateY(0)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 12, color: t.textFaint, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 17, background: accent + "22", borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: t.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: t.textFaint }}>{sub}</div>}
    </div>
  );
}

function InputField({ label, value, onChange, type, t, half, readOnly, mono }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: half ? "calc(50% - 6px)" : "100%" }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
      <input type={type || "text"} value={value} onChange={onChange} readOnly={readOnly} style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, fontSize: 14, color: t.text, background: readOnly ? t.bg : t.inputBg, fontFamily: mono ? "monospace" : "inherit", outline: "none", width: "100%", boxSizing: "border-box", opacity: readOnly ? 0.7 : 1 }} />
    </div>
  );
}

function SelectField({ label, value, onChange, opts, t, half }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: half ? "calc(50% - 6px)" : "100%" }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
      <select value={value} onChange={onChange} style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, fontSize: 14, color: t.text, background: t.inputBg, fontFamily: "inherit", outline: "none", cursor: "pointer", width: "100%", boxSizing: "border-box" }}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Table({ cols, rows, onRowClick, emptyMsg, t }) {
  return (
    <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: t.bg }}>
            {cols.map(c => <th key={c.label} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={cols.length} style={{ padding: 40, textAlign: "center", color: t.textFaint, fontSize: 14 }}>{emptyMsg || "Nenhum resultado."}</td></tr>
            : rows.map((row, i) => (
              <tr key={row.id || i} style={{ borderTop: `1px solid ${t.border}`, background: i % 2 === 0 ? t.surface : t.rowAlt, cursor: onRowClick ? "pointer" : "default" }}
                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = t.surfaceHov }}
                onMouseLeave={e => { if (onRowClick) e.currentTarget.style.background = i % 2 === 0 ? t.surface : t.rowAlt }}
                onClick={() => onRowClick && onRowClick(row)}>
                {cols.map(c => <td key={c.label} style={{ padding: "10px 12px", fontSize: 13, color: t.textMuted, verticalAlign: "middle" }}>{c.render ? c.render(row) : row[c.key]}</td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

function TelaLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const handleLogin = useCallback(async () => {
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    setLoading(true); setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) {
      setErro(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message === "Email not confirmed" ? "E-mail não confirmado." : error.message);
      setSenha("");
    }
    setLoading(false);
  }, [email, senha]);

  const handleReset = useCallback(async () => {
    if (!email) { setErro("Digite seu e-mail primeiro."); return; }
    setLoading(true); setErro("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    if (error) { setErro(error.message); }
    else { setResetMsg("E-mail de redefinição enviado! Verifique sua caixa de entrada."); }
    setLoading(false);
  }, [email]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#0F172A 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: 20 }}>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle,#6366F122 0%,transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle,#8B5CF622 0%,transparent 70%)", borderRadius: "50%" }} />
      </div>
      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 8px 32px #6366F155" }}>⬡</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#F1F5F9", letterSpacing: -0.5 }}>TI Inventário</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748B" }}>Sistema de Gestão de Equipamentos</p>
        </div>
        <div style={{ background: "#1E293B", borderRadius: 20, padding: 32, border: "1px solid #334155", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 600, color: "#94A3B8", textAlign: "center" }}>{resetMode ? "Redefinir Senha" : "Faça seu login"}</h2>
          {erro && (
            <div style={{ background: "#3f0a0a", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <span style={{ fontSize: 13, color: "#FCA5A5", fontWeight: 500 }}>{erro}</span>
            </div>
          )}
          {resetMsg && (
            <div style={{ background: "#052e16", border: "1px solid #10B98144", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#10B981", fontWeight: 500 }}>✅ {resetMsg}</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>E-mail</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" type="email"
                onKeyDown={e => e.key === "Enter" && !resetMode && handleLogin()}
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, border: "1px solid #475569", background: "#0F172A", fontSize: 14, color: "#F1F5F9", outline: "none", fontFamily: "inherit" }} />
            </div>
            {!resetMode && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Senha</label>
                <div style={{ position: "relative" }}>
                  <input value={senha} onChange={e => setSenha(e.target.value)} type={mostrarSenha ? "text" : "password"} placeholder="••••••••" autoComplete="current-password"
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    style={{ width: "100%", boxSizing: "border-box", padding: "11px 40px 11px 14px", borderRadius: 10, border: "1px solid #475569", background: "#0F172A", fontSize: 14, color: "#F1F5F9", outline: "none", fontFamily: "inherit" }} />
                  <button onClick={() => setMostrarSenha(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#64748B" }}>
                    {mostrarSenha ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            )}
            <button onClick={resetMode ? handleReset : handleLogin} disabled={loading || !email || (!resetMode && !senha)}
              style={{ marginTop: 4, padding: "12px", borderRadius: 12, border: "none", background: loading ? "#4338CA" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", opacity: (!email || (!resetMode && !senha)) ? 0.6 : 1 }}>
              {loading ? "Aguarde..." : (resetMode ? "Enviar e-mail de redefinição" : "Entrar")}
            </button>
            <button onClick={() => { setResetMode(p => !p); setErro(""); setResetMsg(""); }}
              style={{ background: "none", border: "none", color: "#6366F1", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, padding: 0 }}>
              {resetMode ? "← Voltar ao login" : "Esqueci minha senha"}
            </button>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#334155", marginTop: 16 }}>🔒 Supabase Auth · Senhas criptografadas</p>
      </div>
    </div>
  );
}
function FormItem({ item, onSave, onClose, t }) {
  const [f, setF] = useState({
    nome: item?.nome || "", categoria: item?.categoria || "Notebook", marca: item?.marca || "",
    modelo: item?.modelo || "", serial: item?.serial || "", patrimonio: item?.patrimonio || "",
    funcionario: item?.funcionario || "", departamento: item?.departamento || "TI",
    status: item?.status || "Disponível", dataCompra: item?.dataCompra || hoje(),
    notas: item?.notas || "", qtdTotal: item?.qtdTotal ?? 1, qtdDisponivel: item?.qtdDisponivel ?? 1,
  });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <InputField label="Nome do Item" value={f.nome} onChange={e => s("nome", e.target.value)} t={t} />
        <SelectField label="Categoria" value={f.categoria} onChange={e => s("categoria", e.target.value)} opts={CATEGORIAS_ITENS} t={t} half />
        <InputField label="Marca" value={f.marca} onChange={e => s("marca", e.target.value)} t={t} half />
        <InputField label="Modelo" value={f.modelo} onChange={e => s("modelo", e.target.value)} t={t} half />
        <InputField label="Nº de Série" value={f.serial} onChange={e => s("serial", e.target.value)} t={t} half mono />
        <InputField label="Nº de Patrimônio" value={f.patrimonio} onChange={e => s("patrimonio", e.target.value)} t={t} half mono />
        <InputField label="Funcionário" value={f.funcionario} onChange={e => s("funcionario", e.target.value)} t={t} half />
        <SelectField label="Departamento" value={f.departamento} onChange={e => s("departamento", e.target.value)} opts={DEPARTAMENTOS.slice(1)} t={t} half />
        <SelectField label="Status" value={f.status} onChange={e => s("status", e.target.value)} opts={STATUS_LIST} t={t} half />
        <InputField label="Data de Compra" value={f.dataCompra} onChange={e => s("dataCompra", e.target.value)} type="date" t={t} half />
      </div>
      <div style={{ background: t.bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${t.border}` }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Controle de Estoque</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[["qtdTotal", "Qtd. Total"], ["qtdDisponivel", "Qtd. Disponível"]].map(([key, lbl]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 120 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => s(key, Math.max(0, f[key] - 1))} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#EF4444", fontWeight: 700, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>−</button>
                <input type="number" min={0} value={f[key]} onChange={e => s(key, parseInt(e.target.value) || 0)} style={{ width: 60, textAlign: "center", padding: "7px", borderRadius: 8, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 15, fontWeight: 700, fontFamily: "inherit", outline: "none" }} />
                <button onClick={() => s(key, f[key] + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#10B981", fontWeight: 700, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Observações</label>
        <textarea value={f.notas} onChange={e => s("notas", e.target.value)} rows={2} style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, fontSize: 14, color: t.text, background: t.inputBg, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <Btn onClick={onClose} variant="ghost" t={t}>Cancelar</Btn>
        <Btn onClick={() => onSave(f)} variant="primary" t={t} disabled={!f.nome.trim()}>Salvar Item</Btn>
      </div>
    </div>
  );
}

function ModalMovimento({ tipo, itemInicial, itens, onSave, onClose, t }) {
  const isEntrada = tipo === "entrada";
  const [busca, setBusca] = useState(itemInicial?.nome ?? "");
  const [sugestoes, setSugestoes] = useState([]);
  const [itemSel, setItemSel] = useState(itemInicial ?? null);
  const [showDrop, setShowDrop] = useState(false);
  const [qty, setQty] = useState(1);
  const [serial, setSerial] = useState(itemInicial?.serial ?? "");
  const [patrimonio, setPatrimonio] = useState(itemInicial?.patrimonio ?? "");
  const [func, setFunc] = useState("");
  const [depto, setDepto] = useState("TI");
  const [obs, setObs] = useState("");

  const maxQty = isEntrada ? 9999 : (itemSel?.qtdDisponivel ?? 0);
  const canSave = isEntrada ? (busca.trim().length > 0 && qty >= 1) : (!!itemSel && qty >= 1 && qty <= maxQty);
  const inp = { padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, fontSize: 14, color: t.text, background: t.inputBg, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" };
  const lbl = { fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 };

  const handleBusca = (val) => {
    setBusca(val); setItemSel(null);
    if (!val.trim()) { setSugestoes([]); setShowDrop(false); return; }
    const q = val.toLowerCase();
    const res = itens.filter(i => i.nome.toLowerCase().includes(q) || i.marca.toLowerCase().includes(q) || i.serial.toLowerCase().includes(q)).slice(0, 8);
    setSugestoes(res); setShowDrop(true);
  };
  const selecionarItem = (item) => {
    setItemSel(item); setBusca(item.nome); setSerial(item.serial); setPatrimonio(item.patrimonio || "");
    setSugestoes([]); setShowDrop(false); setQty(1);
  };
  const limparItem = () => {
    setItemSel(null); setBusca(""); setSerial(""); setPatrimonio("");
    setSugestoes([]); setShowDrop(false);
  };

  return (
    <Modal titulo={isEntrada ? "📥 Entrada no Estoque" : "📤 Saída do Estoque"} onClose={onClose} t={t} maxW={500}>
      <div style={{ marginBottom: 16, position: "relative" }}>
        <label style={lbl}>Equipamento {isEntrada && <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint, marginLeft: 6 }}>(busque ou escreva livremente)</span>}</label>
        <div style={{ position: "relative" }}>
          <input value={busca} onChange={e => handleBusca(e.target.value)} onFocus={() => { if (sugestoes.length > 0) setShowDrop(true); }}
            placeholder={isEntrada ? "Nome do equipamento…" : "Digite para buscar…"}
            style={{ ...inp, paddingRight: itemSel ? 36 : 12, border: itemSel ? `1.5px solid ${t.success}` : `1px solid ${t.borderMed}` }} />
          {itemSel && <button onClick={limparItem} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textFaint, fontSize: 16, padding: 0 }}>✕</button>}
        </div>
        {showDrop && sugestoes.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: t.surface, border: `1px solid ${t.borderMed}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", marginTop: 4, overflow: "hidden" }}>
            {sugestoes.map(i => (
              <div key={i.id} onClick={() => selecionarItem(i)}
                style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}
                onMouseEnter={e => e.currentTarget.style.background = t.surfaceHov}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
                <span style={{ fontSize: 20 }}>{CAT_ICONS[i.categoria]}</span>
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
            {isEntrada && <div onClick={() => { setSugestoes([]); setShowDrop(false); }} style={{ padding: "9px 14px", fontSize: 12, color: t.accent, fontWeight: 600, cursor: "pointer", background: t.bg, textAlign: "center" }}>✏️ Usar "{busca}" como novo</div>}
          </div>
        )}
      </div>

      {itemSel && isEntrada && (
        <div style={{ background: t.successBg, border: `1px solid ${t.success}44`, borderRadius: 12, padding: "10px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: t.success }}>{CAT_ICONS[itemSel.categoria]} {itemSel.nome}</div><div style={{ fontSize: 11, color: t.textFaint }}>Atual: {itemSel.qtdDisponivel}/{itemSel.qtdTotal}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: t.textFaint }}>Após entrada</div><div style={{ fontSize: 17, fontWeight: 800, color: t.success }}>+{qty} → {itemSel.qtdDisponivel + qty}</div></div>
        </div>
      )}
      {itemSel && !isEntrada && (
        <div style={{ background: t.dangerBg, border: `1px solid ${t.danger}44`, borderRadius: 12, padding: "10px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: t.danger }}>{CAT_ICONS[itemSel.categoria]} {itemSel.nome}</div><div style={{ fontSize: 11, color: t.textFaint }}>Disponível: {itemSel.qtdDisponivel} · Total: {itemSel.qtdTotal}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: t.textFaint }}>Após saída</div><div style={{ fontSize: 17, fontWeight: 800, color: t.danger }}>−{qty} → {Math.max(0, itemSel.qtdDisponivel - qty)}</div></div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <div>
          <label style={lbl}>Nº de Série <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional)</span></label>
          <input value={serial} onChange={e => setSerial(e.target.value)} readOnly={!!itemSel} placeholder="Ex: SN-APL-001"
            style={{ ...inp, fontFamily: "monospace", fontSize: 13, background: itemSel ? t.bg : t.inputBg, color: itemSel ? t.textMuted : t.text }} />
          {itemSel && <div style={{ fontSize: 11, color: t.textFaint, marginTop: 4 }}>Preenchido automaticamente.</div>}
        </div>
        <div>
          <label style={lbl}>Nº de Patrimônio <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional)</span></label>
          <input value={patrimonio} onChange={e => setPatrimonio(e.target.value)} readOnly={!!itemSel} placeholder="Ex: PAT-0001"
            style={{ ...inp, fontFamily: "monospace", fontSize: 13, background: itemSel ? t.bg : t.inputBg, color: itemSel ? t.textMuted : t.text }} />
        </div>
        <div>
          <label style={lbl}>Quantidade</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#EF4444", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>−</button>
            <input type="number" min={1} max={isEntrada ? 9999 : maxQty} value={qty}
              onChange={e => setQty(Math.min(isEntrada ? 9999 : maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{ width: 80, textAlign: "center", padding: "8px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 18, fontWeight: 700, fontFamily: "inherit", outline: "none" }} />
            <button onClick={() => setQty(Math.min(isEntrada ? 9999 : maxQty, qty + 1))} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.surface, color: "#10B981", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</button>
            {!isEntrada && <span style={{ fontSize: 12, color: qty > maxQty ? t.danger : t.textFaint }}>máx {maxQty}</span>}
          </div>
          {!isEntrada && qty > maxQty && <div style={{ marginTop: 6, fontSize: 12, color: t.danger, fontWeight: 600 }}>⚠️ Quantidade maior que o disponível.</div>}
        </div>
        {!isEntrada && (
          <>
            <div>
              <label style={lbl}>Funcionário que recebe</label>
              <input value={func} onChange={e => setFunc(e.target.value)} placeholder="Nome completo" style={inp} />
            </div>
            <div>
              <label style={lbl}>Departamento</label>
              <select value={depto} onChange={e => setDepto(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {DEPARTAMENTOS.slice(1).map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </>
        )}
        <div>
          <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: "none", color: t.textFaint }}>(opcional)</span></label>
          <input value={obs} onChange={e => setObs(e.target.value)} placeholder="Ex: compra emergencial, empréstimo…" style={inp} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <Btn onClick={onClose} variant="ghost" t={t}>Cancelar</Btn>
        <Btn onClick={() => onSave({ itemId: itemSel?.id, nomeItem: busca.trim(), serial, patrimonio, qty, func, depto, obs })}
          variant={isEntrada ? "success" : "danger"} t={t} disabled={!canSave}>
          {isEntrada ? `✅ Confirmar Entrada (+${qty})` : `🚚 Confirmar Saída (−${qty})`}
        </Btn>
      </div>
    </Modal>
  );
}

function mapEquip(r) { return { id: r.id, nome: r.nome || "", categoria: r.categoria || "", marca: r.marca || "—", modelo: r.modelo || "—", serial: r.serial || "—", patrimonio: r.patrimonio || "—", funcionario: r.funcionario || "—", departamento: r.departamento || "—", status: r.status || "Disponível", dataCompra: r.data_compra || "", notas: r.notas || "", qtdTotal: r.qtd_total || 0, qtdDisponivel: r.qtd_disponivel || 0 }; }
function mapMov(r) { return { id: r.id, data: r.data || hoje(), tipo: r.tipo, itemId: r.equipamento_id, itemNome: r.item_nome || "", serial: r.serial || "—", patrimonio: r.patrimonio || "—", categoria: r.categoria || "—", qty: r.qty || 0, qtdTotal: r.qtd_total, qtdDisponivel: r.qtd_disponivel, usuario: r.operador || "", funcionario: r.funcionario || "—", depto: r.departamento || "—", obs: r.obs || "" }; }
function mapUsuario(r) { return { id: r.id, authId: r.auth_id, usuario: r.usuario, nome: r.nome || r.usuario, perfil: r.perfil || "viewer", avatar: r.perfil === "super_admin" ? "⚡" : r.perfil === "admin" ? "👑" : "👤", ativo: r.ativo !== false, ultimoLogin: r.ultimo_login || null, email: r.email || "" }; }

export default function App() {
  const [dark, setDark] = useState(() => { try { return localStorage.getItem("ti_dark") === "1"; } catch { return false; } });
  useEffect(() => { try { localStorage.setItem("ti_dark", dark ? "1" : "0"); } catch { } }, [dark]);
  const t = useTheme(dark);
  const [sessao, setSessao] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroDb, setErroDb] = useState("");
  const [itens, setItens] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [pagina, setPagina] = useState("overview");
  const [busca, setBusca] = useState("");
  const [catFil, setCatFil] = useState("Todas");
  const [statusFil, setStatusFil] = useState("Todos");
  const [deptFil, setDeptFil] = useState("Todos");
  // ── NOVO: filtro por funcionário ──────────────────────────────
  const [funcFil, setFuncFil] = useState("Todos");
  // ─────────────────────────────────────────────────────────────
  const [selecionado, setSelecionado] = useState(null);
  const [editando, setEditando] = useState(null);
  const [adicionando, setAdicionando] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [movModal, setMovModal] = useState(null);
  const [sidebar, setSidebar] = useState(true);
  const [relPeriodo, setRelPeriodo] = useState("todos");
  const [senhaForm, setSenhaForm] = useState({ nova: "", confirmar: "" });
  const [senhaMsg, setSenhaMsg] = useState("");
  const [novoUserForm, setNovoUserForm] = useState({ email: "", usuario: "", nome: "", senha: "", perfil: "operador" });
  const [novoUserMsg, setNovoUserMsg] = useState("");
  const [criandoUser, setCriandoUser] = useState(false);
  const [editandoNome, setEditandoNome] = useState(null);
  const [novoNome, setNovoNome] = useState("");

  useEffect(() => {
    let ativo = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!ativo) return;
      if (session?.user) {
        setAuthUser(session.user);
        carregarDados(session.user);
      } else {
        setCarregando(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!ativo) return;
      console.log("[Auth]", event, session?.user?.email);
      if (event === "SIGNED_IN" && session?.user) {
        setAuthUser(session.user);
        carregarDados(session.user);
      }
      if (event === "SIGNED_OUT") {
        setAuthUser(null); setSessao(null);
        setItens([]); setHistorico([]); setUsuarios([]);
        setCarregando(false);
      }
    });

    return () => { ativo = false; subscription.unsubscribe(); };
  }, []);

  async function carregarDados(authUserObj, accessToken) {
    console.log("[carregarDados] iniciando para", authUserObj.email);
    setCarregando(true);
    try {
      const [{ data: equip, error: e1 }, { data: movs, error: e2 }, { data: usrs, error: e3 }] = await Promise.all([
        supabase.from("equipamentos").select("*").order("nome"),
        supabase.from("movimentacoes").select("*").order("criado_em", { ascending: false }),
        supabase.from("usuarios_app").select("id,auth_id,usuario,nome,perfil,avatar,ativo,ultimo_login,email").order("id"),
      ]);
      console.log("[carregarDados] erros:", e1?.message, e2?.message, e3?.message);
      console.log("[carregarDados] dados:", equip?.length, movs?.length, usrs?.length);
      if (e1 || e2 || e3) { setErroDb("Erro ao conectar com o banco de dados."); }
      else {
        if (equip) setItens(equip.map(mapEquip));
        if (movs) setHistorico(movs.map(mapMov));
        if (usrs && usrs.length > 0) {
          const listaUsers = usrs.map(mapUsuario);
          setUsuarios(listaUsers);
          const perfil = listaUsers.find(u => u.authId === authUserObj.id);
          console.log("[carregarDados] perfil encontrado:", perfil?.usuario);
          if (perfil) {
            const agora = new Date().toISOString();
            await supabase.from("usuarios_app").update({ ultimo_login: agora }).eq("auth_id", authUserObj.id);
            setSessao({ ...perfil, email: perfil.email || authUserObj.email, ultimoLogin: agora });
          } else {
            setSessao({ id: null, authId: authUserObj.id, usuario: authUserObj.email, nome: authUserObj.email, perfil: "super_admin", avatar: "⚡", ativo: true, email: authUserObj.email, ultimoLogin: new Date().toISOString() });
          }
        }
      }
    } catch (err) { setErroDb("Falha na conexão com o Supabase."); }
    setCarregando(false);
  }

  const stats = useMemo(() => ({
    total: itens.length,
    emUso: itens.filter(a => a.status === "Em Uso").length,
    disponivel: itens.filter(a => a.status === "Disponível").length,
    manutencao: itens.filter(a => a.status === "Manutenção").length,
    desativado: itens.filter(a => a.status === "Desativado").length,
    totalUnid: itens.reduce((s, a) => s + a.qtdTotal, 0),
    dispUnid: itens.reduce((s, a) => s + a.qtdDisponivel, 0),
  }), [itens]);

  // ── NOVO: lista dinâmica de funcionários ──────────────────────
  const funcionarios = useMemo(() => {
    const lista = [...new Set(
      itens.map(i => i.funcionario).filter(f => f && f !== "—")
    )].sort();
    return ["Todos", ...lista];
  }, [itens]);
  // ─────────────────────────────────────────────────────────────

  const filtrados = useMemo(() => itens.filter(a => {
    const q = busca.toLowerCase();
    const mB = !q || [a.nome, a.marca, a.modelo, a.serial, a.funcionario, a.departamento].some(v => v?.toLowerCase().includes(q));
    return mB
      && (catFil === "Todas" || a.categoria === catFil)
      && (statusFil === "Todos" || a.status === statusFil)
      && (deptFil === "Todos" || a.departamento === deptFil)
      && (funcFil === "Todos" || a.funcionario === funcFil); // ← NOVO
  }), [itens, busca, catFil, statusFil, deptFil, funcFil]);

  const histFiltrado = useMemo(() => {
    const agora = new Date(); const hj = hoje();
    return historico.filter(h => {
      if (relPeriodo === "hoje") return h.data === hj;
      if (relPeriodo === "mes") { const d = new Date(h.data); return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear(); }
      return true;
    });
  }, [historico, relPeriodo]);

  const relCategoria = useMemo(() => CATEGORIAS_ITENS.map(cat => {
    const lista = itens.filter(i => i.categoria === cat);
    return { cat, total: lista.length, unidades: lista.reduce((s, i) => s + i.qtdTotal, 0), disponiveis: lista.reduce((s, i) => s + i.qtdDisponivel, 0) };
  }).filter(r => r.total > 0), [itens]);

  if (carregando) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A", flexDirection: "column", gap: 16, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ fontSize: 36 }}>📦</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>TI Inventário</div>
      <div style={{ fontSize: 13, color: "#64748B" }}>Conectando ao banco de dados...</div>
      {erroDb && <div style={{ marginTop: 8, color: "#EF4444", fontSize: 13, background: "#1E293B", padding: "10px 18px", borderRadius: 10 }}>{erroDb}</div>}
    </div>
  );

  if (!sessao) return <TelaLogin />;

  const podeSuperAdmin = sessao.perfil === "super_admin";
  const podeAdmin = sessao.perfil === "admin" || sessao.perfil === "super_admin";
  const podeEditar = ["super_admin", "admin", "operador"].includes(sessao.perfil);

  const handleSaveItem = async (form) => {
    const payload = {
      nome: form.nome, categoria: form.categoria, marca: form.marca, modelo: form.modelo,
      serial: form.serial, patrimonio: form.patrimonio, funcionario: form.funcionario,
      departamento: form.departamento, status: form.status, data_compra: form.dataCompra || null,
      notas: form.notas, qtd_total: form.qtdTotal, qtd_disponivel: form.qtdDisponivel,
    };
    if (editando) {
      const { data, error } = await supabase.from("equipamentos").update(payload).eq("id", editando.id).select().single();
      if (!error && data) setItens(p => p.map(a => a.id === editando.id ? mapEquip(data) : a));
      setEditando(null);
    } else {
      const { data, error } = await supabase.from("equipamentos").insert([payload]).select().single();
      if (!error && data) setItens(p => [...p, mapEquip(data)]);
      setAdicionando(false);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("equipamentos").delete().eq("id", id);
    if (!error) setItens(p => p.filter(a => a.id !== id));
    setConfirmDel(null); setSelecionado(null);
  };

  const handleMovimento = async ({ itemId, nomeItem, serial, patrimonio, qty, func, depto, obs }) => {
    const { tipo } = movModal;
    const isEntrada = tipo === "entrada";
    const itemExistente = itens.find(a => a.id === itemId);
    let equipId = itemId;
    let qtdTotalFinal = itemExistente?.qtdTotal ?? qty;
    let qtdDispFinal = itemExistente?.qtdDisponivel ?? qty;
    let nomeRegistro = itemExistente?.nome || nomeItem || "Item desconhecido";
    let catRegistro = itemExistente?.categoria || "—";
    let serialReg = serial || itemExistente?.serial || "—";
    let patReg = patrimonio || itemExistente?.patrimonio || "—";

    if (itemExistente) {
      const novas = isEntrada
        ? { qtd_total: itemExistente.qtdTotal + qty, qtd_disponivel: itemExistente.qtdDisponivel + qty, status: "Disponível" }
        : { qtd_disponivel: itemExistente.qtdDisponivel - qty, funcionario: func || itemExistente.funcionario, departamento: depto || itemExistente.departamento, status: itemExistente.qtdDisponivel - qty <= 0 ? "Em Uso" : itemExistente.status };
      qtdTotalFinal = novas.qtd_total ?? itemExistente.qtdTotal;
      qtdDispFinal = novas.qtd_disponivel ?? itemExistente.qtdDisponivel - qty;
      const { data } = await supabase.from("equipamentos").update(novas).eq("id", itemId).select().single();
      if (data) setItens(p => p.map(a => a.id !== itemId ? a : mapEquip(data)));
    } else if (isEntrada && nomeItem) {
      const novoP = { nome: nomeItem, categoria: "Periférico", marca: "—", modelo: "—", serial: serial || "—", patrimonio: patrimonio || "—", funcionario: "—", departamento: "—", status: "Disponível", data_compra: hoje(), notas: "Cadastrado via entrada", qtd_total: qty, qtd_disponivel: qty };
      const { data } = await supabase.from("equipamentos").insert([novoP]).select().single();
      if (data) { equipId = data.id; qtdTotalFinal = qty; qtdDispFinal = qty; setItens(p => [...p, mapEquip(data)]); }
    }

    const movP = { data: hoje(), tipo, equipamento_id: equipId || null, item_nome: nomeRegistro, serial: serialReg, patrimonio: patReg, categoria: catRegistro, qty, qtd_total: qtdTotalFinal, qtd_disponivel: qtdDispFinal, funcionario: func || null, departamento: depto || null, operador: sessao.usuario, obs: obs || null };
    const { data: movData } = await supabase.from("movimentacoes").insert([movP]).select().single();
    if (movData) setHistorico(p => [mapMov(movData), ...p]);
    setMovModal(null);
  };

  const handleToggleUsuario = async (u) => {
    const novoAtivo = !u.ativo;
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (u.authId) {
        await fetch("https://amwlloisddlqkvphupol.supabase.co/functions/v1/smooth-action", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.access_token },
          body: JSON.stringify({ action: novoAtivo ? "enable" : "disable", auth_id: u.authId }),
        });
      }
      const { error } = await supabase.from("usuarios_app").update({ ativo: novoAtivo }).eq("id", u.id);
      if (!error) setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ativo: novoAtivo } : x));
    } catch (err) { console.error("Erro ao toggle usuário:", err); }
  };

  const handleResetUserPassword = async (u) => {
    if (!u.email) { alert("Este usuário não tem e-mail cadastrado."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(u.email, { redirectTo: window.location.origin });
    if (error) { alert("Erro ao enviar: " + error.message); }
    else { alert("E-mail de redefinição enviado para " + u.email); }
  };

  const handleRenomearUsuario = async () => {
    if (!novoNome.trim()) { return; }
    const { error } = await supabase.from("usuarios_app").update({ nome: novoNome.trim() }).eq("id", editandoNome.id);
    if (!error) {
      setUsuarios(prev => prev.map(u => u.id === editandoNome.id ? { ...u, nome: novoNome.trim() } : u));
      if (editandoNome.id === sessao.id) setSessao(p => ({ ...p, nome: novoNome.trim() }));
    }
    setEditandoNome(null); setNovoNome("");
  };

  const handleAlterarSenha = async () => {
    setSenhaMsg("");
    if (senhaForm.nova.length < 8) { setSenhaMsg("Nova senha deve ter pelo menos 8 caracteres."); return; }
    if (!/[A-Z]/.test(senhaForm.nova)) { setSenhaMsg("Nova senha deve conter ao menos uma maiúscula."); return; }
    if (!/[0-9]/.test(senhaForm.nova)) { setSenhaMsg("Nova senha deve conter ao menos um número."); return; }
    if (senhaForm.nova !== senhaForm.confirmar) { setSenhaMsg("Senhas não coincidem."); return; }
    const { error } = await supabase.auth.updateUser({ password: senhaForm.nova });
    if (error) { setSenhaMsg("Erro ao alterar senha: " + error.message); return; }
    setSenhaMsg("✅ Senha alterada com sucesso!");
    setSenhaForm({ nova: "", confirmar: "" });
    setTimeout(() => { setSenhaMsg(""); }, 1500);
  };

  const handleCriarUsuario = async () => {
    setNovoUserMsg("");
    const { email, usuario, nome, senha, perfil } = novoUserForm;
    if (!email || !usuario || !nome || !senha) { setNovoUserMsg("Preencha todos os campos."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setNovoUserMsg("E-mail inválido."); return; }
    if (usuario.length < 3) { setNovoUserMsg("Usuário deve ter ao menos 3 caracteres."); return; }
    if (!/^[a-z0-9._]+$/.test(usuario)) { setNovoUserMsg("Usuário: use apenas letras minúsculas, números, ponto ou underscore."); return; }
    if (usuarios.find(u => u.usuario === usuario)) { setNovoUserMsg("Usuário já existe."); return; }
    if (senha.length < 8) { setNovoUserMsg("Senha deve ter pelo menos 8 caracteres."); return; }
    if (!/[A-Z]/.test(senha)) { setNovoUserMsg("Senha deve conter ao menos uma maiúscula."); return; }
    if (!/[0-9]/.test(senha)) { setNovoUserMsg("Senha deve conter ao menos um número."); return; }
    const avatar = perfil === "super_admin" ? "⚡" : perfil === "admin" ? "👑" : "👤";
    setNovoUserMsg("⏳ Criando usuário...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("https://amwlloisddlqkvphupol.supabase.co/functions/v1/smooth-action", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.access_token },
        body: JSON.stringify({ action: "create", email, password: senha, usuario, nome, perfil, avatar }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setNovoUserMsg("❌ " + (json.error || "Erro status " + res.status)); return; }
      if (!json.user) { setNovoUserMsg("❌ Função não retornou dados. Veja logs da Edge Function no Supabase."); return; }
      setUsuarios(prev => [...prev, mapUsuario(json.user)]);
      setNovoUserMsg("✅ Usuário @" + usuario + " criado com sucesso!");
      setNovoUserForm({ email: "", usuario: "", nome: "", senha: "", perfil: "operador" });
      setTimeout(() => { setNovoUserMsg(""); setCriandoUser(false); }, 3000);
    } catch (err) { setNovoUserMsg("❌ Erro: " + err.message); }
  };

  const navItems = [
    { id: "overview", icon: "◉", label: "Visão Geral" },
    { id: "itens", icon: "⊞", label: "Equipamentos" },
    { id: "movimentacoes", icon: "↕", label: "Movimentações" },
    { id: "historico", icon: "📋", label: "Histórico" },
    { id: "relatorios", icon: "📊", label: "Relatórios" },
    ...(podeAdmin ? [{ id: "seguranca", icon: "🔐", label: "Segurança" }] : []),
  ];

  const sel = { padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.borderMed}`, fontSize: 13, color: t.text, background: t.inputBg, cursor: "pointer", fontFamily: "inherit", outline: "none" };

  const renderOverview = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: `linear-gradient(135deg,${t.accent},#8B5CF6)`, borderRadius: 16, padding: "20px 24px", color: "#fff" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Olá, {sessao.nome.split(" ")[0]}! {sessao.avatar}</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Perfil: <strong style={{ textTransform: "capitalize" }}>{sessao.perfil}</strong> · {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard t={t} label="Total de Itens" value={stats.total} icon="📦" accent="#6366F1" sub={`${stats.totalUnid} unidades`} onClick={() => setPagina("itens")} />
        <StatCard t={t} label="Em Uso" value={stats.emUso} icon="💼" accent="#3B82F6" sub={`${stats.total ? Math.round(stats.emUso / stats.total * 100) : 0}% da frota`} />
        <StatCard t={t} label="Disponível" value={stats.disponivel} icon="✅" accent="#10B981" sub={`${stats.dispUnid} unidades livres`} />
        <StatCard t={t} label="Manutenção" value={stats.manutencao} icon="🔧" accent="#F59E0B" sub="Necessita atenção" />
        <StatCard t={t} label="Desativado" value={stats.desativado} icon="🗄️" accent="#6B7280" sub="Fim de vida" />
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 260, background: t.surface, borderRadius: 16, padding: "18px 22px", border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 13, color: t.textFaint, fontWeight: 600, marginBottom: 14 }}>Distribuição de Status</div>
          <div style={{ display: "flex", height: 10, borderRadius: 10, overflow: "hidden", gap: 2, marginBottom: 14, background: t.bg }}>
            {Object.entries({ "Em Uso": stats.emUso, "Disponível": stats.disponivel, "Manutenção": stats.manutencao, "Desativado": stats.desativado }).map(([s, c]) => (
              <div key={s} style={{ width: `${stats.total ? (c / stats.total) * 100 : 0}%`, background: STATUSES[s]?.dot, borderRadius: 10, minWidth: c > 0 ? 4 : 0 }} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
            {Object.entries({ "Em Uso": stats.emUso, "Disponível": stats.disponivel, "Manutenção": stats.manutencao, "Desativado": stats.desativado }).map(([s, c]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.textMuted }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUSES[s]?.dot }} />{s}: <strong style={{ color: t.text }}>{c}</strong>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200, background: t.surface, borderRadius: 16, padding: "18px 22px", border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 13, color: t.textFaint, fontWeight: 600, marginBottom: 14 }}>Por Categoria</div>
          {CATEGORIAS_ITENS.map(cat => {
            const c = itens.filter(i => i.categoria === cat).length;
            if (!c) return null;
            const max = Math.max(...CATEGORIAS_ITENS.map(c2 => itens.filter(i => i.categoria === c2).length), 1);
            return (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, width: 18, textAlign: "center" }}>{CAT_ICONS[cat]}</span>
                <span style={{ fontSize: 12, color: t.textMuted, width: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat}</span>
                <div style={{ flex: 1, height: 5, background: t.bg, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ width: `${(c / max) * 100}%`, height: "100%", background: t.accent, borderRadius: 10 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.text, width: 16, textAlign: "right" }}>{c}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Últimas Movimentações</span>
          <button onClick={() => setPagina("historico")} style={{ background: "none", border: "none", color: t.accent, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Ver todas →</button>
        </div>
        <Table t={t} emptyMsg="Sem movimentações registradas."
          cols={[
            { label: "Data", render: r => <span style={{ color: t.textFaint, fontSize: 12 }}>{r.data}</span> },
            { label: "Tipo", render: r => <span style={{ fontWeight: 700, fontSize: 12, color: r.tipo === "entrada" ? t.success : t.danger, background: r.tipo === "entrada" ? t.successBg : t.dangerBg, padding: "2px 8px", borderRadius: 20 }}>{r.tipo === "entrada" ? "📥 Entrada" : "📤 Saída"}</span> },
            { label: "Item", render: r => <span style={{ color: t.text, fontWeight: 500 }}>{r.itemNome}</span> },
            { label: "Qtd.", render: r => <span style={{ fontWeight: 700, color: r.tipo === "entrada" ? t.success : t.danger }}>{r.tipo === "entrada" ? "+" : "-"}{r.qty}</span> },
            { label: "Usuário", render: r => <span style={{ color: t.textFaint, fontSize: 12 }}>{r.usuario}</span> },
          ]}
          rows={historico.slice(0, 5)}
        />
      </div>
    </div>
  );

  const renderItens = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>Filtrar:</span>
        <select value={catFil} onChange={e => setCatFil(e.target.value)} style={sel}>{CAT_FILTROS.map(o => <option key={o}>{o}</option>)}</select>
        <select value={statusFil} onChange={e => setStatusFil(e.target.value)} style={sel}>{STATUS_FILTROS.map(o => <option key={o}>{o}</option>)}</select>
        <select value={deptFil} onChange={e => setDeptFil(e.target.value)} style={sel}>{DEPARTAMENTOS.map(o => <option key={o}>{o}</option>)}</select>

        {/* ── NOVO: filtro por funcionário ── */}
        <select value={funcFil} onChange={e => setFuncFil(e.target.value)} style={{ ...sel, maxWidth: 180 }}>
          {funcionarios.map(o => (
            <option key={o} value={o}>
              {o === "Todos" ? "👤 Todos Funcionários" : `👤 ${o}`}
            </option>
          ))}
        </select>
        {/* ─────────────────────────────── */}

        {(catFil !== "Todas" || statusFil !== "Todos" || deptFil !== "Todos" || funcFil !== "Todos" || busca) && (
          <button onClick={() => { setCatFil("Todas"); setStatusFil("Todos"); setDeptFil("Todos"); setFuncFil("Todos"); setBusca(""); }} style={{ padding: "5px 11px", borderRadius: 8, border: `1px solid ${t.dangerBdr}`, background: t.dangerBg, color: t.danger, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>✕ Limpar</button>
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: t.textFaint }}>{filtrados.length} item{filtrados.length !== 1 ? "s" : ""}</span>
      </div>
      <Table t={t} emptyMsg="Nenhum item encontrado." onRowClick={r => setSelecionado(r)}
        cols={[
          { label: "Item", render: r => <div style={{ display: "flex", alignItems: "center", gap: 9 }}><span style={{ fontSize: 18 }}>{CAT_ICONS[r.categoria]}</span><div><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{r.nome}</div><div style={{ fontSize: 11, color: t.textFaint }}>{r.marca} · {r.modelo}</div></div></div> },
          { label: "Categoria", render: r => <span style={{ color: t.textMuted }}>{r.categoria}</span> },
          { label: "Série", render: r => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.serial}</span> },
          { label: "Patrimônio", render: r => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.patrimonio || "—"}</span> },
          { label: "Total", render: r => <span style={{ fontWeight: 700, color: t.text }}>{r.qtdTotal}</span> },
          { label: "Disponível", render: r => <span style={{ fontWeight: 700, color: r.qtdDisponivel === 0 ? t.danger : t.success }}>{r.qtdDisponivel}</span> },
          { label: "Status", render: r => <StatusBadge status={r.status} dark={dark} /> },
          { label: "Funcionário", render: r => <span style={{ color: t.text, fontSize: 12 }}>{r.funcionario && r.funcionario !== "—" ? r.funcionario : <span style={{ color: t.textFaint }}>—</span>}</span> },
          {
            label: "Ações", render: r => (
              <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
                {podeAdmin && <Btn small t={t} variant="success" onClick={() => setMovModal({ tipo: "entrada", item: r })}>+Entrada</Btn>}
                {podeAdmin && <Btn small t={t} variant="danger" onClick={() => setMovModal({ tipo: "saida", item: r })}>−Saída</Btn>}
                {podeEditar && <Btn small t={t} variant="ghost" onClick={() => setEditando(r)}>Editar</Btn>}
                {podeAdmin && <Btn small t={t} variant="danger" onClick={() => setConfirmDel(r)}>Excluir</Btn>}
              </div>
            )
          },
        ]}
        rows={filtrados}
      />
    </div>
  );

  const renderMovimentacoes = () => (
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
        <StatCard t={t} label="Total Entradas" icon="📥" accent="#10B981" value={historico.filter(h => h.tipo === "entrada").reduce((s, h) => s + h.qty, 0)} sub="unidades recebidas" />
        <StatCard t={t} label="Total Saídas" icon="📤" accent="#EF4444" value={historico.filter(h => h.tipo === "saida").reduce((s, h) => s + h.qty, 0)} sub="unidades distribuídas" />
        <StatCard t={t} label="Registros" icon="📋" accent="#6366F1" value={historico.length} sub="movimentações no total" />
      </div>
      {podeAdmin && itens.filter(i => i.qtdDisponivel > 0).length > 0 && (
        <div style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, padding: "16px 18px" }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: t.text }}>Movimentação Rápida</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {itens.filter(i => i.qtdDisponivel > 0).slice(0, 4).map(i => (
              <div key={i.id} style={{ background: t.bg, borderRadius: 12, padding: "10px 14px", border: `1px solid ${t.border}`, minWidth: 180 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4 }}>{CAT_ICONS[i.categoria]} {i.nome}</div>
                <div style={{ fontSize: 11, color: t.textFaint, marginBottom: 8 }}>Disponível: <strong style={{ color: t.success }}>{i.qtdDisponivel}</strong></div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn small t={t} variant="success" onClick={() => setMovModal({ tipo: "entrada", item: i })}>+</Btn>
                  <Btn small t={t} variant="danger" onClick={() => setMovModal({ tipo: "saida", item: i })}>−</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Table t={t} emptyMsg="Sem movimentações registradas."
        cols={[
          { label: "Data", render: r => <span style={{ color: t.textFaint, fontSize: 12, whiteSpace: "nowrap" }}>{r.data}</span> },
          { label: "Tipo", render: r => <span style={{ fontWeight: 700, fontSize: 12, color: r.tipo === "entrada" ? t.success : t.danger, background: r.tipo === "entrada" ? t.successBg : t.dangerBg, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>{r.tipo === "entrada" ? "📥 Entrada" : "📤 Saída"}</span> },
          { label: "Item", render: r => <div><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{r.itemNome}</div><div style={{ fontSize: 11, color: t.textFaint }}>{r.categoria || "—"}</div></div> },
          { label: "Nº Série", render: r => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.serial || "—"}</span> },
          { label: "Patrimônio", render: r => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.patrimonio || "—"}</span> },
          { label: "Qtd.", render: r => <span style={{ fontWeight: 800, fontSize: 15, color: r.tipo === "entrada" ? t.success : t.danger }}>{r.tipo === "entrada" ? "+" : "-"}{r.qty}</span> },
          { label: "Total", render: r => <span style={{ fontWeight: 600, color: t.text }}>{r.qtdTotal ?? "—"}</span> },
          { label: "Disponível", render: r => <span style={{ fontWeight: 600, color: r.qtdDisponivel === 0 ? t.danger : t.success }}>{r.qtdDisponivel ?? r.qtdTotal ?? "—"}</span> },
          { label: "Funcionário", render: r => <span style={{ color: t.text, fontSize: 12 }}>{r.funcionario && r.funcionario !== "—" ? r.funcionario : <span style={{ color: t.textFaint }}>—</span>}</span> },
          { label: "Depto.", render: r => <span style={{ color: t.textMuted, fontSize: 12 }}>{r.depto && r.depto !== "—" ? r.depto : <span style={{ color: t.textFaint }}>—</span>}</span> },
          { label: "Operador", render: r => <span style={{ color: t.textFaint, fontSize: 11 }}>{r.usuario}</span> },
          { label: "Obs.", render: r => <span style={{ color: t.textFaint, fontSize: 11, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{r.obs || "—"}</span> },
        ]}
        rows={historico}
      />
    </div>
  );

  const renderHistorico = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 600 }}>Período:</span>
        {[{ v: "hoje", l: "Hoje" }, { v: "mes", l: "Este Mês" }, { v: "todos", l: "Todos" }].map(p => (
          <button key={p.v} onClick={() => setRelPeriodo(p.v)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${relPeriodo === p.v ? t.accent : t.borderMed}`, background: relPeriodo === p.v ? t.accent : "transparent", color: relPeriodo === p.v ? "#fff" : t.textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            {p.l}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: t.textFaint }}>{histFiltrado.length} registro{histFiltrado.length !== 1 ? "s" : ""}</span>
      </div>
      {itens.map(item => {
        const hItem = histFiltrado.filter(h => h.itemId === item.id);
        if (!hItem.length) return null;
        return (
          <div key={item.id} style={{ background: t.surface, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10, background: t.bg, flexWrap: "wrap" }}>
              <span style={{ fontSize: 18 }}>{CAT_ICONS[item.categoria]}</span>
              <span style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{item.nome}</span>
              <StatusBadge status={item.status} dark={dark} />
              {item.serial && item.serial !== "—" && <span style={{ fontSize: 11, color: t.textFaint, background: t.border, borderRadius: 6, padding: "2px 8px", fontFamily: "monospace" }}>S/N: {item.serial}</span>}
              {item.patrimonio && item.patrimonio !== "—" && <span style={{ fontSize: 11, color: t.textFaint, background: t.border, borderRadius: 6, padding: "2px 8px", fontFamily: "monospace" }}>PAT: {item.patrimonio}</span>}
              <span style={{ marginLeft: "auto", fontSize: 12, color: t.textFaint }}>{hItem.length} registro{hItem.length !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ padding: "8px 0" }}>
              {hItem.map(h => (
                <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${t.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: h.tipo === "entrada" ? t.success : t.danger, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: t.textFaint, width: 88, flexShrink: 0 }}>{h.data}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: h.tipo === "entrada" ? t.success : t.danger, width: 70, flexShrink: 0 }}>{h.tipo === "entrada" ? "+" : "-"}{h.qty} un.</span>
                  <span style={{ fontSize: 13, color: t.text, flex: 1 }}>{h.tipo === "entrada" ? "Entrada em estoque" : `Saído para ${h.funcionario}`}</span>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {h.serial && h.serial !== "—" && <span style={{ fontSize: 10, color: t.textFaint, fontFamily: "monospace", background: t.bg, borderRadius: 5, padding: "1px 6px", border: `1px solid ${t.border}` }}>S/N {h.serial}</span>}
                    {h.patrimonio && h.patrimonio !== "—" && <span style={{ fontSize: 10, color: t.accent, fontFamily: "monospace", background: t.bg, borderRadius: 5, padding: "1px 6px", border: `1px solid ${t.accent}44` }}>PAT {h.patrimonio}</span>}
                  </div>
                  {h.obs && <span style={{ fontSize: 11, color: t.textFaint, fontStyle: "italic", flexShrink: 0 }}>{h.obs}</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {histFiltrado.length === 0 && <div style={{ textAlign: "center", padding: 40, color: t.textFaint, fontSize: 14 }}>Nenhuma movimentação encontrada.</div>}
    </div>
  );

  const renderRelatorios = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 600 }}>Período:</span>
        {[{ v: "hoje", l: "Hoje" }, { v: "mes", l: "Este Mês" }, { v: "todos", l: "Todos" }].map(p => (
          <button key={p.v} onClick={() => setRelPeriodo(p.v)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${relPeriodo === p.v ? t.accent : t.borderMed}`, background: relPeriodo === p.v ? t.accent : "transparent", color: relPeriodo === p.v ? "#fff" : t.textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            {p.l}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard t={t} label="Entradas no Período" icon="📥" accent="#10B981" value={histFiltrado.filter(h => h.tipo === "entrada").reduce((s, h) => s + h.qty, 0)} sub="unidades recebidas" />
        <StatCard t={t} label="Saídas no Período" icon="📤" accent="#EF4444" value={histFiltrado.filter(h => h.tipo === "saida").reduce((s, h) => s + h.qty, 0)} sub="unidades distribuídas" />
        <StatCard t={t} label="Em Uso" icon="💼" accent="#3B82F6" value={stats.emUso} sub={`de ${stats.total} itens`} />
        <StatCard t={t} label="Em Manutenção" icon="🔧" accent="#F59E0B" value={stats.manutencao} sub="necessitam atenção" />
      </div>
      <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>📊 Relatório por Categoria</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: t.bg }}>
              {["Categoria", "Itens", "Unid. Total", "Unid. Disponível", "% Disponível"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {relCategoria.map((r, i) => {
              const pct = r.unidades ? Math.round((r.disponiveis / r.unidades) * 100) : 0;
              return (
                <tr key={r.cat} style={{ borderTop: `1px solid ${t.border}`, background: i % 2 === 0 ? t.surface : t.rowAlt }}>
                  <td style={{ padding: "11px 14px" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>{CAT_ICONS[r.cat]}</span><span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{r.cat}</span></div></td>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: t.text }}>{r.total}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: t.textMuted }}>{r.unidades}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: r.disponiveis === 0 ? t.danger : t.success }}>{r.disponiveis}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: t.bg, borderRadius: 10, overflow: "hidden", maxWidth: 80 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: pct > 50 ? t.success : pct > 20 ? t.gold : t.danger, borderRadius: 10 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: pct > 50 ? t.success : pct > 20 ? t.gold : t.danger }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>👤 Equipamentos em Uso por Funcionário</span>
        </div>
        <Table t={t} emptyMsg="Nenhum item em uso."
          cols={[
            { label: "Item", render: r => <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>{CAT_ICONS[r.categoria]}</span><span style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{r.nome}</span></div> },
            { label: "Categoria", render: r => <span style={{ color: t.textMuted }}>{r.categoria}</span> },
            { label: "Funcionário", render: r => <span style={{ fontWeight: 600, color: t.text }}>{r.funcionario || "—"}</span> },
            { label: "Departamento", render: r => <span style={{ color: t.textMuted }}>{r.departamento === "-" ? "—" : r.departamento}</span> },
            { label: "Status", render: r => <StatusBadge status={r.status} dark={dark} /> },
          ]}
          rows={itens.filter(i => i.status === "Em Uso")}
        />
      </div>
    </div>
  );

  const renderSeguranca = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${t.accent},#8B5CF6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{sessao.avatar}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{sessao.nome}</div>
            <div style={{ fontSize: 13, color: t.textMuted }}>@{sessao.usuario} · <strong style={{ color: t.accent, textTransform: "capitalize" }}>{sessao.perfil}</strong></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: t.bg, borderRadius: 12, padding: "12px 16px", flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Sessão</div>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>🟢 Ativa</div>
          </div>
          <div style={{ background: t.bg, borderRadius: 12, padding: "12px 16px", flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Movimentações</div>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>{historico.filter(h => h.usuario === sessao.usuario).length}</div>
          </div>
          <div style={{ background: t.bg, borderRadius: 12, padding: "12px 16px", flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Acesso a edição</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: podeEditar ? t.success : t.danger }}>{podeEditar ? "✅ Permitido" : "🚫 Somente leitura"}</div>
          </div>
        </div>
      </div>

      <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, padding: "22px 24px" }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: t.text }}>🔑 Alterar Senha</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
          {["nova", "confirmar"].map(k => (
            <div key={k}>
              <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 5 }}>
                {k === "nova" ? "Nova Senha" : "Confirmar Nova Senha"}
              </label>
              <input type="password" value={senhaForm[k]} onChange={e => setSenhaForm(p => ({ ...p, [k]: e.target.value }))}
                style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
          ))}
          <div style={{ background: t.bg, borderRadius: 10, padding: "9px 14px", fontSize: 12, color: t.textFaint, border: `1px solid ${t.border}` }}>
            🔐 Logado como <strong style={{ color: t.text }}>{sessao.email}</strong>
          </div>
          {senhaMsg && <div style={{ padding: "9px 14px", borderRadius: 10, background: senhaMsg.startsWith("✅") ? t.successBg : t.dangerBg, border: `1px solid ${senhaMsg.startsWith("✅") ? t.success + "44" : t.dangerBdr}`, fontSize: 13, color: senhaMsg.startsWith("✅") ? t.success : t.danger, fontWeight: 500 }}>{senhaMsg}</div>}
          <Btn onClick={handleAlterarSenha} variant="primary" t={t}>Alterar Senha</Btn>
          <div style={{ background: t.bg, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: t.textFaint }}>
            <strong style={{ color: t.textMuted }}>Requisitos:</strong> mínimo 8 caracteres, 1 maiúscula, 1 número.
          </div>
        </div>
      </div>

      <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, padding: "22px 24px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: t.text }}>👥 Usuários do Sistema</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {[{ p: "super_admin", l: "Super Admin", bg: "#1e1b4b", cor: "#c4b5fd" }, { p: "admin", l: "Admin", bg: "#312e81", cor: "#a5b4fc" }, { p: "operador", l: "Operador", bg: t.successBg, cor: t.success }, { p: "viewer", l: "Viewer", bg: t.bg, cor: t.textMuted }].map(x => (
            <span key={x.p} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: x.bg, color: x.cor }}>{x.l}</span>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: t.bg }}>
              {["Usuário", "E-mail", "Perfil", "Status", "Último Login", "Sessão", ...(podeSuperAdmin ? ["Ação"] : [])].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => {
              const isSelf = u.usuario === sessao.usuario;
              const isSuperAdm = u.perfil === "super_admin";
              const ps = { super_admin: { bg: "#1e1b4b", cor: "#c4b5fd" }, admin: { bg: "#312e81", cor: "#a5b4fc" }, operador: { bg: t.successBg, cor: t.success }, viewer: { bg: t.bg, cor: t.textMuted } }[u.perfil] || { bg: t.bg, cor: t.textMuted };
              return (
                <tr key={u.id} style={{ borderTop: `1px solid ${t.border}`, background: i % 2 === 0 ? t.surface : t.rowAlt, opacity: u.ativo ? 1 : 0.55 }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${t.accent},#8B5CF6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, opacity: u.ativo ? 1 : 0.5 }}>{u.avatar}</div>
                      <div>
                        {editandoNome?.id === u.id ? (
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <input autoFocus value={novoNome} onChange={e => setNovoNome(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") handleRenomearUsuario(); if (e.key === "Escape") { setEditandoNome(null); } }}
                              style={{ padding: "4px 8px", borderRadius: 7, border: "1.5px solid " + t.accent, background: t.inputBg, color: t.text, fontSize: 13, fontFamily: "inherit", outline: "none", width: 130 }} />
                            <button onClick={handleRenomearUsuario} style={{ background: t.accent, border: "none", borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 8px", cursor: "pointer", fontFamily: "inherit" }}>✓</button>
                            <button onClick={() => setEditandoNome(null)} style={{ background: t.bg, border: "1px solid " + t.borderMed, borderRadius: 6, color: t.textMuted, fontSize: 11, padding: "4px 8px", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{u.nome}</div>
                            {(isSelf || podeSuperAdmin) && <button onClick={() => { setEditandoNome(u); setNovoNome(u.nome); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: t.textFaint, padding: 0, lineHeight: 1 }} title="Renomear">✏️</button>}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: t.textFaint }}>@{u.usuario}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 12, color: t.textMuted }}>{u.email || <span style={{ color: t.textFaint, fontStyle: "italic" }}>—</span>}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: ps.bg, color: ps.cor }}>
                      {u.perfil === "super_admin" ? "⚡ Super Admin" : u.perfil.charAt(0).toUpperCase() + u.perfil.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: u.ativo ? t.success : t.danger, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: u.ativo ? t.success : t.danger, display: "inline-block" }} />
                      {u.ativo ? "Ativo" : "Desativado"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {u.ultimoLogin ? (
                      <div>
                        <div style={{ fontSize: 12, color: t.text, fontWeight: 500 }}>{new Date(u.ultimoLogin).toLocaleDateString("pt-BR")}</div>
                        <div style={{ fontSize: 11, color: t.textFaint }}>{new Date(u.ultimoLogin).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    ) : <span style={{ fontSize: 12, color: t.textFaint, fontStyle: "italic" }}>Nunca</span>}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 12, color: isSelf ? t.accent : t.textFaint, fontWeight: isSelf ? 700 : 400 }}>{isSelf ? "● Você" : "—"}</span>
                  </td>
                  {podeSuperAdmin && (
                    <td style={{ padding: "12px 14px" }}>
                      {isSelf ? (
                        <span style={{ fontSize: 11, color: t.textFaint, fontStyle: "italic" }}>—</span>
                      ) : (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {(
                            <button onClick={() => handleToggleUsuario(u)} style={{ padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 11, background: u.ativo ? t.dangerBg : "#052e16", color: u.ativo ? t.danger : t.success, border: `1px solid ${u.ativo ? t.dangerBdr : t.success + "44"}` }}>
                              {u.ativo ? "🔒 Desativar" : "✅ Ativar"}
                            </button>
                          )}
                          {u.email && (
                            <button onClick={() => handleResetUserPassword(u)} style={{ padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 11, background: "#1e1b4b", color: "#c4b5fd", border: "1px solid #4c1d95" }}>
                              🔑 Redefinir
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {!podeSuperAdmin && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: t.bg, borderRadius: 10, border: `1px solid ${t.border}`, fontSize: 12, color: t.textFaint }}>
            🔒 Somente o <strong style={{ color: t.text }}>Super Admin</strong> pode ativar ou desativar usuários.
          </div>
        )}
      </div>

      {podeSuperAdmin && (
        <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>📧 Criar Novo Usuário</h3>
            <button onClick={() => { setCriandoUser(p => !p); setNovoUserMsg(""); }} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.borderMed}`, background: criandoUser ? t.dangerBg : t.accent, color: criandoUser ? t.danger : "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {criandoUser ? "✕ Cancelar" : "+ Novo Usuário"}
            </button>
          </div>
          {criandoUser && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Nome completo</label>
                  <input value={novoUserForm.nome} onChange={e => setNovoUserForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: João Silva"
                    style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                </div>
                <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Usuário (login)</label>
                  <input value={novoUserForm.usuario} onChange={e => setNovoUserForm(p => ({ ...p, usuario: e.target.value.toLowerCase() }))} placeholder="Ex: ti.joao"
                    style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 14, fontFamily: "monospace", outline: "none" }} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>E-mail (para acesso)</label>
                <input type="email" value={novoUserForm.email} onChange={e => setNovoUserForm(p => ({ ...p, email: e.target.value }))} placeholder="Ex: joao@empresa.com"
                  style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                <span style={{ fontSize: 11, color: t.textFaint }}>Usado para login e recuperação de senha</span>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Senha inicial</label>
                  <input type="password" value={novoUserForm.senha} onChange={e => setNovoUserForm(p => ({ ...p, senha: e.target.value }))} placeholder="Mín. 8 chars, 1 maiúscula, 1 número"
                    style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                </div>
                <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Perfil</label>
                  <select value={novoUserForm.perfil} onChange={e => setNovoUserForm(p => ({ ...p, perfil: e.target.value }))}
                    style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                    <option value="viewer">Viewer — só visualiza</option>
                    <option value="operador">Operador — pode editar itens</option>
                    <option value="admin">Admin — movimentações e segurança</option>
                    <option value="super_admin">Super Admin — acesso total</option>
                  </select>
                </div>
              </div>
              {novoUserMsg && (
                <div style={{ padding: "9px 14px", borderRadius: 10, background: novoUserMsg.startsWith("✅") ? t.successBg : t.dangerBg, border: `1px solid ${novoUserMsg.startsWith("✅") ? t.success + "44" : t.dangerBdr}`, fontSize: 13, color: novoUserMsg.startsWith("✅") ? t.success : t.danger, fontWeight: 500 }}>
                  {novoUserMsg}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <Btn onClick={handleCriarUsuario} variant="success" t={t}>✅ Criar Usuário</Btn>
                <div style={{ padding: "9px 14px", background: t.bg, borderRadius: 10, border: `1px solid ${t.border}`, fontSize: 12, color: t.textFaint, display: "flex", alignItems: "center" }}>
                  Senha mínima: 8 caracteres, 1 maiúscula, 1 número
                </div>
              </div>
            </div>
          )}
          {!criandoUser && (
            <p style={{ margin: 0, fontSize: 13, color: t.textFaint }}>
              Clique em <strong style={{ color: t.text }}>+ Novo Usuário</strong> para criar um acesso ao sistema. O usuário poderá alterar a própria senha após o primeiro login.
            </p>
          )}
        </div>
      )}

      <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, padding: "22px 24px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: t.text }}>📜 Controle de Movimentações ({historico.length} registros)</h3>
        <Table t={t} emptyMsg="Sem registros."
          cols={[
            { label: "Data", render: r => <span style={{ fontSize: 12, color: t.textFaint }}>{r.data}</span> },
            { label: "Tipo", render: r => <span style={{ fontSize: 12, fontWeight: 700, color: r.tipo === "entrada" ? t.success : t.danger }}>{r.tipo === "entrada" ? "📥" : "📤"} {r.tipo}</span> },
            { label: "Item", render: r => <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{r.itemNome}</span> },
            { label: "Nº Série", render: r => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.serial || "—"}</span> },
            { label: "Patrimônio", render: r => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.accent }}>{r.patrimonio || "—"}</span> },
            { label: "Qtd.", render: r => <span style={{ fontWeight: 700, color: r.tipo === "entrada" ? t.success : t.danger }}>{r.tipo === "entrada" ? "+" : "-"}{r.qty}</span> },
            { label: "Operador", render: r => <span style={{ fontSize: 12, color: t.textFaint }}>{r.usuario}</span> },
          ]}
          rows={historico.slice(0, 10)}
        />
      </div>
    </div>
  );

  const pageMap = { overview: renderOverview, itens: renderItens, movimentacoes: renderMovimentacoes, historico: renderHistorico, relatorios: renderRelatorios, seguranca: renderSeguranca };
  const pageTitles = { overview: "Visão Geral", itens: "Equipamentos", movimentacoes: "Movimentações", historico: "Histórico por Item", relatorios: "Relatórios", seguranca: "Segurança" };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", height: "100vh", background: t.bg, color: t.text, overflow: "hidden" }}>

      <aside style={{ width: sidebar ? 230 : 64, background: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", transition: "width 0.25s", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⬡</div>
          {sidebar && <span style={{ fontWeight: 700, fontSize: 14, color: t.text, whiteSpace: "nowrap" }}>TI Inventário</span>}
        </div>
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPagina(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 2, background: pagina === item.id ? (dark ? "#312e81" : "#EEF2FF") : "transparent", color: pagina === item.id ? t.accent : t.textMuted, fontWeight: pagina === item.id ? 700 : 400, fontSize: 14, fontFamily: "inherit", whiteSpace: "nowrap", textAlign: "left" }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
              {sidebar && item.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: `1px solid ${t.border}`, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${t.accent},#8B5CF6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{sessao.avatar}</div>
          {sidebar && (
            <>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sessao.nome}</div>
                <div style={{ fontSize: 10, color: t.textFaint, textTransform: "capitalize" }}>{sessao.perfil}</div>
              </div>
              <button onClick={() => supabase.auth.signOut()} style={{ background: t.dangerBg, border: `1px solid ${t.dangerBdr}`, borderRadius: 8, cursor: "pointer", fontSize: 11, color: t.danger, fontWeight: 700, padding: "4px 9px", fontFamily: "inherit", flexShrink: 0 }}>Sair</button>
            </>
          )}
          {!sidebar && (
            <button onClick={() => supabase.auth.signOut()} style={{ background: t.dangerBg, border: `1px solid ${t.dangerBdr}`, borderRadius: 8, cursor: "pointer", fontSize: 13, color: t.danger, fontWeight: 700, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>⏻</button>
          )}
        </div>
        <button onClick={() => setSidebar(p => !p)} style={{ margin: "0 8px 10px", padding: "7px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.bg, cursor: "pointer", color: t.textFaint, fontSize: 12, fontFamily: "inherit" }}>
          {sidebar ? "← Recolher" : "→"}
        </button>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text, flex: 1 }}>{pageTitles[pagina]}</h1>
          <div style={{ position: "relative", width: 240 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: t.textFaint, fontSize: 13 }}>🔍</span>
            <input value={busca} onChange={e => { setBusca(e.target.value); if (pagina !== "itens") setPagina("itens"); }} placeholder="Buscar equipamentos…"
              style={{ width: "100%", padding: "7px 12px 7px 30px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, fontSize: 13, color: t.text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          {pagina === "itens" && podeEditar && <Btn onClick={() => setAdicionando(true)} t={t} variant="primary">+ Adicionar Item</Btn>}
          {pagina === "movimentacoes" && podeAdmin && (
            <div style={{ display: "flex", gap: 8 }}>
              <Btn t={t} variant="success" onClick={() => setMovModal({ tipo: "entrada", item: itens[0] || null })}>📥 Nova Entrada</Btn>
              <Btn t={t} variant="danger" onClick={() => setMovModal({ tipo: "saida", item: itens.find(i => i.qtdDisponivel > 0) || itens[0] || null })}>📤 Nova Saída</Btn>
            </div>
          )}
          <button onClick={() => setDark(d => !d)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.bg, cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {dark ? "☀️" : "🌙"}
          </button>
        </header>
        <main style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {pageMap[pagina]?.()}
        </main>
      </div>
      {selecionado && !editando && (
        <Modal titulo={selecionado.nome} onClose={() => setSelecionado(null)} t={t}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "12px 16px", background: t.bg, borderRadius: 12 }}>
            <span style={{ fontSize: 36 }}>{CAT_ICONS[selecionado.categoria]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: t.textFaint }}>{selecionado.categoria} · {selecionado.marca}</div>
              <div style={{ marginTop: 4 }}><StatusBadge status={selecionado.status} dark={dark} /></div>
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
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 10 }}>Histórico</div>
            {historico.filter(h => h.itemId === selecionado.id).slice(0, 5).map(h => (
              <div key={h.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: h.tipo === "entrada" ? t.success : t.danger, marginTop: 4, flexShrink: 0 }} />
                <div><div style={{ fontSize: 13, color: t.text }}>{h.tipo === "entrada" ? `+${h.qty} entrada` : `−${h.qty} → ${h.funcionario}`}</div><div style={{ fontSize: 11, color: t.textFaint }}>{h.data}{h.obs ? ` · ${h.obs}` : ""}</div></div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            {podeAdmin && <Btn t={t} variant="success" small onClick={() => { setMovModal({ tipo: "entrada", item: selecionado }); setSelecionado(null); }}>📥 Entrada</Btn>}
            {podeAdmin && <Btn t={t} variant="danger" small onClick={() => { setMovModal({ tipo: "saida", item: selecionado }); setSelecionado(null); }}>📤 Saída</Btn>}
            {podeEditar && <Btn t={t} variant="ghost" small onClick={() => { setEditando(selecionado); setSelecionado(null); }}>Editar</Btn>}
            <Btn t={t} variant="ghost" small onClick={() => setSelecionado(null)}>Fechar</Btn>
          </div>
        </Modal>
      )}
      {editando && (
        <Modal titulo={`Editar: ${editando.nome}`} onClose={() => setEditando(null)} t={t} maxW={620}>
          <FormItem item={editando} onSave={handleSaveItem} onClose={() => setEditando(null)} t={t} />
        </Modal>
      )}
      {adicionando && (
        <Modal titulo="Adicionar Novo Equipamento" onClose={() => setAdicionando(false)} t={t} maxW={620}>
          <FormItem item={null} onSave={handleSaveItem} onClose={() => setAdicionando(false)} t={t} />
        </Modal>
      )}
      {confirmDel && (
        <Modal titulo="Excluir Equipamento?" onClose={() => setConfirmDel(null)} t={t} maxW={420}>
          <div style={{ background: t.dangerBg, border: `1px solid ${t.dangerBdr}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
            <p style={{ color: t.text, fontSize: 14, margin: 0 }}>Tem certeza que deseja excluir <strong>{confirmDel.nome}</strong>?<br /><span style={{ color: t.textFaint, fontSize: 13 }}>Esta ação não pode ser desfeita.</span></p>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => setConfirmDel(null)} variant="ghost" t={t}>Cancelar</Btn>
            <Btn onClick={() => handleDelete(confirmDel.id)} variant="danger" t={t}>Sim, Excluir</Btn>
          </div>
        </Modal>
      )}
      {movModal && (
        <ModalMovimento tipo={movModal.tipo} itemInicial={movModal.item} itens={itens} onSave={handleMovimento} onClose={() => setMovModal(null)} t={t} />
      )}
    </div>
  );
}