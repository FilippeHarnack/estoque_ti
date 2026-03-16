"use client";
import { useState, useCallback } from "react";
import { supabase } from "@/services/supabase";

export default function TelaLogin() {
  const [email, setEmail]               = useState("");
  const [senha, setSenha]               = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro]                 = useState("");
  const [loading, setLoading]           = useState(false);
  const [resetMode, setResetMode]       = useState(false);
  const [resetMsg, setResetMsg]         = useState("");

  const handleLogin = useCallback(async () => {
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    setLoading(true); setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) {
      setErro(
        error.message === "Invalid login credentials" ? "E-mail ou senha incorretos."
        : error.message === "Email not confirmed"     ? "E-mail não confirmado."
        : error.message
      );
      setSenha("");
    }
    setLoading(false);
  }, [email, senha]);

  const handleReset = useCallback(async () => {
    if (!email) { setErro("Digite seu e-mail primeiro."); return; }
    setLoading(true); setErro("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    if (error) setErro(error.message);
    else setResetMsg("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
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
          <h2 style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 600, color: "#94A3B8", textAlign: "center" }}>
            {resetMode ? "Redefinir Senha" : "Faça seu login"}
          </h2>
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
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" type="email"
                onKeyDown={(e) => e.key === "Enter" && !resetMode && handleLogin()}
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, border: "1px solid #475569", background: "#0F172A", fontSize: 14, color: "#F1F5F9", outline: "none", fontFamily: "inherit" }} />
            </div>
            {!resetMode && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Senha</label>
                <div style={{ position: "relative" }}>
                  <input value={senha} onChange={(e) => setSenha(e.target.value)} type={mostrarSenha ? "text" : "password"} placeholder="••••••••" autoComplete="current-password"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    style={{ width: "100%", boxSizing: "border-box", padding: "11px 40px 11px 14px", borderRadius: 10, border: "1px solid #475569", background: "#0F172A", fontSize: 14, color: "#F1F5F9", outline: "none", fontFamily: "inherit" }} />
                  <button onClick={() => setMostrarSenha((p) => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#64748B" }}>
                    {mostrarSenha ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            )}
            <button onClick={resetMode ? handleReset : handleLogin} disabled={loading || !email || (!resetMode && !senha)}
              style={{ marginTop: 4, padding: "12px", borderRadius: 12, border: "none", background: loading ? "#4338CA" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", opacity: (!email || (!resetMode && !senha)) ? 0.6 : 1 }}>
              {loading ? "Aguarde..." : (resetMode ? "Enviar e-mail de redefinição" : "Entrar")}
            </button>
            <button onClick={() => { setResetMode((p) => !p); setErro(""); setResetMsg(""); }}
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
