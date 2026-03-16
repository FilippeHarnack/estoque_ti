"use client";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/layout/Header";
import { Btn, Table } from "@/components/ui";

export default function SegurancaPage() {
  const { t, sessao, historico, usuarios, podeEditar, podeSuperAdmin, handleToggleUsuario, handleResetUserPassword, handleRenomearUsuario, handleAlterarSenha, handleCriarUsuario } = useApp();

  const [senhaForm, setSenhaForm]       = useState({ nova: "", confirmar: "" });
  const [senhaMsg, setSenhaMsg]         = useState("");
  const [novoUserForm, setNovoUserForm] = useState({ email: "", usuario: "", nome: "", senha: "", perfil: "operador" });
  const [novoUserMsg, setNovoUserMsg]   = useState("");
  const [criandoUser, setCriandoUser]   = useState(false);
  const [editandoNome, setEditandoNome] = useState(null);
  const [novoNome, setNovoNome]         = useState("");

  const onAlterarSenha = async () => {
    setSenhaMsg("");
    try {
      await handleAlterarSenha(senhaForm.nova, senhaForm.confirmar);
      setSenhaMsg("✅ Senha alterada com sucesso!");
      setSenhaForm({ nova: "", confirmar: "" });
      setTimeout(() => setSenhaMsg(""), 1500);
    } catch (err) { setSenhaMsg(err.message); }
  };

  const onCriarUsuario = async () => {
    setNovoUserMsg("⏳ Criando usuário...");
    try {
      const novo = await handleCriarUsuario(novoUserForm);
      setNovoUserMsg(`✅ Usuário @${novoUserForm.usuario} criado com sucesso!`);
      setNovoUserForm({ email: "", usuario: "", nome: "", senha: "", perfil: "operador" });
      setTimeout(() => { setNovoUserMsg(""); setCriandoUser(false); }, 3000);
    } catch (err) { setNovoUserMsg("❌ " + err.message); }
  };

  const inp = { padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.borderMed}`, background: t.inputBg, color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none" };

  return (
    <>
      <Header title="Segurança" />
      <main style={{ flex: 1, overflowY: "auto", padding: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Profile card */}
          <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${t.accent},#8B5CF6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{sessao?.avatar}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{sessao?.nome}</div>
                <div style={{ fontSize: 13, color: t.textMuted }}>@{sessao?.usuario} · <strong style={{ color: t.accent, textTransform: "capitalize" }}>{sessao?.perfil}</strong></div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "Sessão",           value: "🟢 Ativa" },
                { label: "Movimentações",    value: historico.filter((h) => h.usuario === sessao?.usuario).length },
                { label: "Acesso a edição",  value: podeEditar ? "✅ Permitido" : "🚫 Somente leitura", color: podeEditar ? t.success : t.danger },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: t.bg, borderRadius: 12, padding: "12px 16px", flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: color || t.text }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Change password */}
          <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, padding: "22px 24px" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: t.text }}>🔑 Alterar Senha</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
              {["nova", "confirmar"].map((k) => (
                <div key={k}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 5 }}>
                    {k === "nova" ? "Nova Senha" : "Confirmar Nova Senha"}
                  </label>
                  <input type="password" value={senhaForm[k]} onChange={(e) => setSenhaForm((p) => ({ ...p, [k]: e.target.value }))} style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ background: t.bg, borderRadius: 10, padding: "9px 14px", fontSize: 12, color: t.textFaint, border: `1px solid ${t.border}` }}>
                🔐 Logado como <strong style={{ color: t.text }}>{sessao?.email}</strong>
              </div>
              {senhaMsg && <div style={{ padding: "9px 14px", borderRadius: 10, background: senhaMsg.startsWith("✅") ? t.successBg : t.dangerBg, border: `1px solid ${senhaMsg.startsWith("✅") ? t.success + "44" : t.dangerBdr}`, fontSize: 13, color: senhaMsg.startsWith("✅") ? t.success : t.danger, fontWeight: 500 }}>{senhaMsg}</div>}
              <Btn onClick={onAlterarSenha} variant="primary" t={t}>Alterar Senha</Btn>
              <div style={{ background: t.bg, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: t.textFaint }}>
                <strong style={{ color: t.textMuted }}>Requisitos:</strong> mínimo 8 caracteres, 1 maiúscula, 1 número.
              </div>
            </div>
          </div>

          {/* Users list */}
          <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, padding: "22px 24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: t.text }}>👥 Usuários do Sistema</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: t.bg }}>
                  {["Usuário", "E-mail", "Perfil", "Status", "Último Login", "Sessão", ...(podeSuperAdmin ? ["Ação"] : [])].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, i) => {
                  const isSelf  = u.usuario === sessao?.usuario;
                  const ps = { super_admin: { bg: "#1e1b4b", cor: "#c4b5fd" }, admin: { bg: "#312e81", cor: "#a5b4fc" }, operador: { bg: t.successBg, cor: t.success }, viewer: { bg: t.bg, cor: t.textMuted } }[u.perfil] || { bg: t.bg, cor: t.textMuted };
                  return (
                    <tr key={u.id} style={{ borderTop: `1px solid ${t.border}`, background: i % 2 === 0 ? t.surface : t.rowAlt, opacity: u.ativo ? 1 : 0.55 }}>
                      {/* Name cell */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${t.accent},#8B5CF6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, opacity: u.ativo ? 1 : 0.5 }}>{u.avatar}</div>
                          <div>
                            {editandoNome?.id === u.id ? (
                              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                                <input autoFocus value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") { handleRenomearUsuario(u, novoNome); setEditandoNome(null); } if (e.key === "Escape") setEditandoNome(null); }}
                                  style={{ padding: "4px 8px", borderRadius: 7, border: `1.5px solid ${t.accent}`, background: t.inputBg, color: t.text, fontSize: 13, fontFamily: "inherit", outline: "none", width: 130 }} />
                                <button onClick={() => { handleRenomearUsuario(u, novoNome); setEditandoNome(null); }} style={{ background: t.accent, border: "none", borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 8px", cursor: "pointer", fontFamily: "inherit" }}>✓</button>
                                <button onClick={() => setEditandoNome(null)} style={{ background: t.bg, border: `1px solid ${t.borderMed}`, borderRadius: 6, color: t.textMuted, fontSize: 11, padding: "4px 8px", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{u.nome}</div>
                                {(isSelf || podeSuperAdmin) && <button onClick={() => { setEditandoNome(u); setNovoNome(u.nome); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: t.textFaint, padding: 0, lineHeight: 1 }}>✏️</button>}
                              </div>
                            )}
                            <div style={{ fontSize: 11, color: t.textFaint }}>@{u.usuario}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}><span style={{ fontSize: 12, color: t.textMuted }}>{u.email || <span style={{ color: t.textFaint, fontStyle: "italic" }}>—</span>}</span></td>
                      <td style={{ padding: "12px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: ps.bg, color: ps.cor }}>{u.perfil === "super_admin" ? "⚡ Super Admin" : u.perfil.charAt(0).toUpperCase() + u.perfil.slice(1)}</span></td>
                      <td style={{ padding: "12px 14px" }}><span style={{ fontSize: 12, fontWeight: 600, color: u.ativo ? t.success : t.danger, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: u.ativo ? t.success : t.danger, display: "inline-block" }} />{u.ativo ? "Ativo" : "Desativado"}</span></td>
                      <td style={{ padding: "12px 14px" }}>
                        {u.ultimoLogin ? (
                          <div>
                            <div style={{ fontSize: 12, color: t.text, fontWeight: 500 }}>{new Date(u.ultimoLogin).toLocaleDateString("pt-BR")}</div>
                            <div style={{ fontSize: 11, color: t.textFaint }}>{new Date(u.ultimoLogin).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                        ) : <span style={{ fontSize: 12, color: t.textFaint, fontStyle: "italic" }}>Nunca</span>}
                      </td>
                      <td style={{ padding: "12px 14px" }}><span style={{ fontSize: 12, color: isSelf ? t.accent : t.textFaint, fontWeight: isSelf ? 700 : 400 }}>{isSelf ? "● Você" : "—"}</span></td>
                      {podeSuperAdmin && (
                        <td style={{ padding: "12px 14px" }}>
                          {isSelf ? <span style={{ fontSize: 11, color: t.textFaint, fontStyle: "italic" }}>—</span> : (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <button onClick={() => handleToggleUsuario(u)} style={{ padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 11, background: u.ativo ? t.dangerBg : "#052e16", color: u.ativo ? t.danger : t.success, border: `1px solid ${u.ativo ? t.dangerBdr : t.success + "44"}` }}>
                                {u.ativo ? "🔒 Desativar" : "✅ Ativar"}
                              </button>
                              {u.email && (
                                <button onClick={() => handleResetUserPassword(u).then(() => alert("E-mail enviado para " + u.email)).catch((e) => alert(e.message))} style={{ padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 11, background: "#1e1b4b", color: "#c4b5fd", border: "1px solid #4c1d95" }}>
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

          {/* Create user */}
          {podeSuperAdmin && (
            <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>📧 Criar Novo Usuário</h3>
                <button onClick={() => { setCriandoUser((p) => !p); setNovoUserMsg(""); }} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.borderMed}`, background: criandoUser ? t.dangerBg : t.accent, color: criandoUser ? t.danger : "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  {criandoUser ? "✕ Cancelar" : "+ Novo Usuário"}
                </button>
              </div>
              {criandoUser && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[["nome", "Nome completo", "text", "Ex: João Silva"], ["usuario", "Usuário (login)", "text", "Ex: ti.joao"]].map(([k, lbl, type, ph]) => (
                      <div key={k} style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 5 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</label>
                        <input value={novoUserForm[k]} onChange={(e) => setNovoUserForm((p) => ({ ...p, [k]: k === "usuario" ? e.target.value.toLowerCase() : e.target.value }))} placeholder={ph} type={type} style={{ ...inp, fontFamily: k === "usuario" ? "monospace" : "inherit" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>E-mail (para acesso)</label>
                    <input type="email" value={novoUserForm.email} onChange={(e) => setNovoUserForm((p) => ({ ...p, email: e.target.value }))} placeholder="Ex: joao@empresa.com" style={inp} />
                    <span style={{ fontSize: 11, color: t.textFaint }}>Usado para login e recuperação de senha</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 5 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Senha inicial</label>
                      <input type="password" value={novoUserForm.senha} onChange={(e) => setNovoUserForm((p) => ({ ...p, senha: e.target.value }))} placeholder="Mín. 8 chars, 1 maiúscula, 1 número" style={inp} />
                    </div>
                    <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 5 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Perfil</label>
                      <select value={novoUserForm.perfil} onChange={(e) => setNovoUserForm((p) => ({ ...p, perfil: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
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
                  <Btn onClick={onCriarUsuario} variant="success" t={t}>✅ Criar Usuário</Btn>
                </div>
              )}
              {!criandoUser && (
                <p style={{ margin: 0, fontSize: 13, color: t.textFaint }}>
                  Clique em <strong style={{ color: t.text }}>+ Novo Usuário</strong> para criar um acesso ao sistema.
                </p>
              )}
            </div>
          )}

          {/* Movement log */}
          <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`, padding: "22px 24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: t.text }}>📜 Controle de Movimentações ({historico.length} registros)</h3>
            <Table t={t} emptyMsg="Sem registros."
              cols={[
                { label: "Data",       render: (r) => <span style={{ fontSize: 12, color: t.textFaint }}>{r.data}</span> },
                { label: "Tipo",       render: (r) => <span style={{ fontSize: 12, fontWeight: 700, color: r.tipo === "entrada" ? t.success : t.danger }}>{r.tipo === "entrada" ? "📥" : "📤"} {r.tipo}</span> },
                { label: "Item",       render: (r) => <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{r.itemNome}</span> },
                { label: "Nº Série",   render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.textFaint }}>{r.serial || "—"}</span> },
                { label: "Patrimônio", render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: t.accent }}>{r.patrimonio || "—"}</span> },
                { label: "Qtd.",       render: (r) => <span style={{ fontWeight: 700, color: r.tipo === "entrada" ? t.success : t.danger }}>{r.tipo === "entrada" ? "+" : "-"}{r.qty}</span> },
                { label: "Operador",   render: (r) => <span style={{ fontSize: 12, color: t.textFaint }}>{r.usuario}</span> },
              ]}
              rows={historico.slice(0, 10)}
            />
          </div>
        </div>
      </main>
    </>
  );
}
