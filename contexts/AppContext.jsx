"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/services/supabase";
import { buildTheme } from "@/lib/theme";
import { mapUsuario } from "@/lib/mappers";
import { getAllEquipamentos, createEquipamento, updateEquipamento, deleteEquipamento, buildEquipPayload } from "@/services/equipmentService";
import { getAllMovimentos, processarMovimento } from "@/services/movementService";
import { getAllUsuarios, updateLastLogin, renameUsuario, toggleUsuario, resetUserPassword, createUsuario, changePassword, uploadAvatar } from "@/services/userService";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("ti_dark") === "1"; } catch { return false; }
  });
  useEffect(() => { try { localStorage.setItem("ti_dark", dark ? "1" : "0"); } catch {} }, [dark]);
  const t = useMemo(() => buildTheme(dark), [dark]);

  const [sessao, setSessao]       = useState(null);
  const [authUser, setAuthUser]   = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroDb, setErroDb]       = useState("");

  const [itens, setItens]         = useState([]);
  const [historico, setHistorico] = useState([]);
  const [usuarios, setUsuarios]   = useState([]);

  const carregarDados = useCallback(async (authUserObj) => {
    setCarregando(true);
    setErroDb("");
    try {
      const [equip, movs, usrs] = await Promise.all([
        getAllEquipamentos(),
        getAllMovimentos(),
        getAllUsuarios(),
      ]);
      setItens(equip);
      setHistorico(movs);
      setUsuarios(usrs);

      const perfil = usrs.find((u) => u.authId === authUserObj.id);
      if (perfil) {
        const agora = await updateLastLogin(authUserObj.id);
        setSessao({ ...perfil, email: perfil.email || authUserObj.email, ultimoLogin: agora });
      } else {
        setSessao({
          id: null, authId: authUserObj.id, usuario: authUserObj.email,
          nome: authUserObj.email, perfil: "super_admin", avatar: "bolt",
          ativo: true, email: authUserObj.email, ultimoLogin: new Date().toISOString(),
        });
      }
    } catch {
      setErroDb("Erro ao conectar com o banco de dados.");
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!ativo) return;
      if (session?.user) { setAuthUser(session.user); carregarDados(session.user); }
      else setCarregando(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!ativo) return;
      if (event === "SIGNED_IN" && session?.user) {
        setAuthUser(session.user); carregarDados(session.user);
      }
      if (event === "SIGNED_OUT") {
        setAuthUser(null); setSessao(null);
        setItens([]); setHistorico([]); setUsuarios([]);
        setCarregando(false);
      }
    });
    return () => { ativo = false; subscription.unsubscribe(); };
  }, [carregarDados]);

  const stats = useMemo(() => ({
    total:      itens.length,
    emUso:      itens.filter((a) => a.status === "Em Uso").length,
    disponivel: itens.filter((a) => a.status === "Disponível").length,
    manutencao: itens.filter((a) => a.status === "Manutenção").length,
    desativado: itens.filter((a) => a.status === "Desativado").length,
    totalUnid:  itens.reduce((s, a) => s + a.qtdTotal, 0),
    dispUnid:   itens.reduce((s, a) => s + a.qtdDisponivel, 0),
  }), [itens]);

  const funcionarios = useMemo(() => {
    const lista = [...new Set(itens.map((i) => i.funcionario).filter((f) => f && f !== "—"))].sort();
    return ["Todos", ...lista];
  }, [itens]);

  const podeSuperAdmin = sessao?.perfil === "super_admin";
  const podeAdmin      = sessao?.perfil === "admin" || sessao?.perfil === "super_admin";
  const podeEditar     = ["super_admin", "admin", "operador"].includes(sessao?.perfil);

  const handleSaveItem = useCallback(async (form, editandoItem) => {
    const payload = buildEquipPayload(form);
    if (editandoItem) {
      const updated = await updateEquipamento(editandoItem.id, payload);
      setItens((p) => p.map((a) => (a.id === editandoItem.id ? updated : a)));
    } else {
      const created = await createEquipamento(payload);
      setItens((p) => [...p, created]);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    await deleteEquipamento(id);
    setItens((p) => p.filter((a) => a.id !== id));
  }, []);

  const handleMovimento = useCallback(async (params) => {
    const { novoEquip, novaMovimentacao } = await processarMovimento({
      ...params,
      itens,
      operador: sessao?.usuario,
    });
    if (novoEquip) {
      setItens((p) => {
        const existe = p.find((a) => a.id === novoEquip.id);
        return existe ? p.map((a) => (a.id === novoEquip.id ? novoEquip : a)) : [...p, novoEquip];
      });
    }
    if (novaMovimentacao) setHistorico((p) => [novaMovimentacao, ...p]);
  }, [itens, sessao]);

  const handleToggleUsuario = useCallback(async (u) => {
    const novoAtivo = await toggleUsuario(u);
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, ativo: novoAtivo } : x)));
  }, []);

  const handleResetUserPassword = useCallback(async (u) => {
    if (!u.email) throw new Error("Este usuário não tem e-mail cadastrado.");
    await resetUserPassword(u.email);
  }, []);

  const handleRenomearUsuario = useCallback(async (u, novoNome) => {
    await renameUsuario(u.id, novoNome);
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, nome: novoNome.trim() } : x)));
    if (u.id === sessao?.id) setSessao((p) => ({ ...p, nome: novoNome.trim() }));
  }, [sessao]);

  const handleAlterarSenha = useCallback(async (nova, confirmar) => {
    if (nova.length < 8)        throw new Error("Nova senha deve ter pelo menos 8 caracteres.");
    if (!/[A-Z]/.test(nova))    throw new Error("Nova senha deve conter ao menos uma maiúscula.");
    if (!/[0-9]/.test(nova))    throw new Error("Nova senha deve conter ao menos um número.");
    if (nova !== confirmar)     throw new Error("Senhas não coincidem.");
    await changePassword(nova);
  }, []);

  const handleCriarUsuario = useCallback(async (form) => {
    const { email, usuario, nome, senha, perfil } = form;
    if (!email || !usuario || !nome || !senha) throw new Error("Preencha todos os campos.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("E-mail inválido.");
    if (usuario.length < 3) throw new Error("Usuário deve ter ao menos 3 caracteres.");
    if (!/^[a-z0-9._]+$/.test(usuario)) throw new Error("Usuário: use apenas letras minúsculas, números, ponto ou underscore.");
    if (usuarios.find((u) => u.usuario === usuario)) throw new Error("Usuário já existe.");
    if (senha.length < 8) throw new Error("Senha deve ter pelo menos 8 caracteres.");
    if (!/[A-Z]/.test(senha)) throw new Error("Senha deve conter ao menos uma maiúscula.");
    if (!/[0-9]/.test(senha)) throw new Error("Senha deve conter ao menos um número.");
    const avatar = perfil === "super_admin" ? "bolt" : perfil === "admin" ? "crown" : "user";
    const novoUser = await createUsuario({ ...form, avatar });
    setUsuarios((prev) => [...prev, novoUser]);
    return novoUser;
  }, [usuarios]);

  const handleUploadAvatar = useCallback(async (file) => {
    if (!authUser) throw new Error("Não autenticado.");
    const url = await uploadAvatar(authUser.id, file);
    setSessao((p) => ({ ...p, avatar: url }));
    setUsuarios((prev) => prev.map((u) => u.authId === authUser.id ? { ...u, avatar: url } : u));
    return url;
  }, [authUser]);

  const handleLogout = useCallback(() => supabase.auth.signOut(), []);

  return (
    <AppContext.Provider value={{
      dark, setDark, t,
      sessao, authUser, carregando, erroDb,
      itens, historico, usuarios,
      stats, funcionarios,
      podeSuperAdmin, podeAdmin, podeEditar,
      handleSaveItem, handleDelete, handleMovimento,
      handleToggleUsuario, handleResetUserPassword,
      handleRenomearUsuario, handleAlterarSenha,
      handleCriarUsuario, handleUploadAvatar, handleLogout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
