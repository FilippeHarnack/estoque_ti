"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { supabase, getDb, getEdgeFnUrl } from "@/services/supabase";
import { buildTheme } from "@/lib/theme";
import { getAllEquipamentos, createEquipamento, updateEquipamento, deleteEquipamento, buildEquipPayload, splitEquipamentoManutencao } from "@/services/equipmentService";
import { getAllMovimentos, processarMovimento, processarDevolucao, processarTransferencia, registrarAjusteManual, registrarSaidaCadastro } from "@/services/movementService";
import { getAllUsuarios, updateLastLogin, renameUsuario, toggleUsuario, resetUserPassword, createUsuario, changePassword, uploadAvatar } from "@/services/userService";
import { getAllMarcas, createMarca, deleteMarca } from "@/services/marcasService";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("ti_dark") === "1"; } catch { return false; }
  });
  useEffect(() => { try { localStorage.setItem("ti_dark", dark ? "1" : "0"); } catch {} }, [dark]);
  const t = useMemo(() => buildTheme(dark), [dark]);

  const [unidade, setUnidadeState] = useState(() => {
    try { return localStorage.getItem("ti_unidade") || null; } catch { return null; }
  });
  const setUnidade = useCallback((val) => {
    try { localStorage.setItem("ti_unidade", val); } catch {}
    if (unidade && val !== unidade) {
      setTrocandoFilial(true);
      setUnidadeOrigem(unidade);
      setUnidadeAlvo(val);
    }
    setCarregando(true);
    setUnidadeState(val);
    setSessao(null);
    setItens([]); setHistorico([]); setUsuarios([]);
  }, [unidade]);

  // Cliente Supabase correto para a unidade atual
  const db = useMemo(() => getDb(unidade), [unidade]);
  const edgeFnUrl = useMemo(() => getEdgeFnUrl(unidade), [unidade]);

  const [sessao, setSessao]           = useState(null);
  const [authUser, setAuthUser]       = useState(null);
  const [authNome, setAuthNome]       = useState("");
  const [carregando, setCarregando]   = useState(true);
  const [erroDb, setErroDb]           = useState("");
  const [trocandoFilial, setTrocandoFilial] = useState(false);
  const [unidadeAlvo, setUnidadeAlvo]       = useState(null);
  const [unidadeOrigem, setUnidadeOrigem]   = useState(null);

  const [itens, setItens]         = useState([]);
  const [historico, setHistorico] = useState([]);
  const [usuarios, setUsuarios]   = useState([]);
  const [marcas, setMarcas]       = useState([]);

  const sessaoFallback = useCallback((authUserObj) => ({
    id: null, authId: authUserObj.id, usuario: authUserObj.email,
    nome: authUserObj.email, perfil: "super_admin", avatar: "bolt",
    ativo: true, email: authUserObj.email, ultimoLogin: new Date().toISOString(),
  }), []);

  const carregarDados = useCallback(async (authUserObj) => {
    const animStart = Date.now();
    setCarregando(true);
    setErroDb("");
    try {
      const [equip, movs, usrs, mrcs] = await Promise.all([
        getAllEquipamentos(db, unidade).catch(() => []),
        getAllMovimentos(db, unidade).catch(() => []),
        getAllUsuarios(db).catch(() => []),
        getAllMarcas(db, unidade).catch(() => []),
      ]);
      setItens(equip);
      setHistorico(movs);
      setUsuarios(usrs);
      setMarcas(mrcs);

      const perfil = usrs.find((u) => u.authId === authUserObj.id);
      if (perfil) {
        const agora = await updateLastLogin(db, authUserObj.id).catch(() => new Date().toISOString());
        setSessao({ ...perfil, email: perfil.email || authUserObj.email, ultimoLogin: agora });
      } else {
        setSessao(sessaoFallback(authUserObj));
      }
    } catch (err) {
      setErroDb(err?.message || JSON.stringify(err) || "Erro ao conectar com o banco de dados.");
      setSessao(sessaoFallback(authUserObj));
      setCarregando(false);
      setTrocandoFilial(false);
      return;
    }
    // Garante tempo mínimo de 3.2s para a animação de pouso/voo completar
    const elapsed = Date.now() - animStart;
    const delay = Math.max(0, 3200 - elapsed);
    setTimeout(() => {
      setCarregando(false);
      setTrocandoFilial(false);
    }, delay);
  }, [db, unidade]);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    const buscarNome = async (uid) => {
      try {
        const { data } = await supabase
          .from("usuarios_app")
          .select("nome")
          .eq("auth_id", uid)
          .maybeSingle();
        if (data?.nome) setAuthNome(data.nome.split(" ")[0]);
      } catch {}
    };

    // Sempre usa o cliente Florianópolis para autenticação (independente da unidade)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!ativo) return;
      if (session?.user) {
        setAuthUser(session.user);
        buscarNome(session.user.id);
        if (unidade) carregarDados(session.user);
        else setCarregando(false); // Logado mas sem unidade → mostra TelaUnidade
      } else {
        setCarregando(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!ativo) return;
      if (event === "SIGNED_IN" && session?.user) {
        setAuthUser(session.user);
        buscarNome(session.user.id);
        if (unidade) carregarDados(session.user);
        else setCarregando(false); // Logado mas sem unidade → mostra TelaUnidade
      }
      if (event === "SIGNED_OUT") {
        setAuthUser(null); setSessao(null);
        setItens([]); setHistorico([]); setUsuarios([]);
        setCarregando(false);
      }
    });
    return () => { ativo = false; subscription.unsubscribe(); };
  }, [unidade, carregarDados]);

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
    const lista = [...new Set(
      itens.filter((i) => !unidade || i.unidade === unidade)
           .map((i) => i.funcionario)
           .filter((f) => f && f !== "—")
    )].sort();
    return ["Todos", ...lista];
  }, [itens, unidade]);

  const podeSuperAdmin = sessao?.perfil === "super_admin";
  const podeAdmin      = sessao?.perfil === "admin" || sessao?.perfil === "super_admin";
  const podeEditar     = ["super_admin", "admin", "operador"].includes(sessao?.perfil);

  const handleSaveItem = useCallback(async (form, editandoItem) => {
    const payload = buildEquipPayload(form);
    if (editandoItem) {
      const updated = await updateEquipamento(db, editandoItem.id, payload);
      setItens((p) => p.map((a) => (a.id === editandoItem.id ? updated : a)));
      const qtdMudou = form.qtdTotal !== editandoItem.qtdTotal || form.qtdDisponivel !== editandoItem.qtdDisponivel;
      if (qtdMudou) {
        const mov = await registrarAjusteManual({
          db,
          item: editandoItem,
          novoTotal: form.qtdTotal,
          novoDisp: form.qtdDisponivel,
          operador: sessao?.usuario,
        });
        if (mov) setHistorico((p) => [mov, ...p]);
      }
    } else {
      const created = await createEquipamento(db, unidade, payload);
      setItens((p) => [...p, created]);
      const qtdFora = form.qtdTotal - form.qtdDisponivel;
      if (form.funcionario && form.funcionario !== "—" && qtdFora > 0) {
        const mov = await registrarSaidaCadastro({
          db,
          item: created,
          qty: qtdFora,
          func: form.funcionario,
          depto: form.departamento !== "—" ? form.departamento : "TI",
          operador: sessao?.usuario,
        });
        if (mov) setHistorico((p) => [mov, ...p]);
      }
    }
  }, [db, sessao]);

  const handleDelete = useCallback(async (id) => {
    await deleteEquipamento(db, id);
    setItens((p) => p.filter((a) => a.id !== id));
  }, [db]);

  const handleMovimento = useCallback(async (params) => {
    const { novoEquip, novaMovimentacao } = await processarMovimento({
      ...params,
      db,
      unidade,
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
  }, [db, itens, sessao]);

  const handleDevolucao = useCallback(async ({ item, qty, obs }) => {
    try {
      const { itemDeletado, itemId, novaMovimentacao } = await processarDevolucao({
        db, item, qty, obs, operador: sessao?.usuario,
      });
      if (itemDeletado) {
        setItens((p) => p.filter((a) => a.id !== itemId));
      } else {
        setItens((p) => p.map((a) => a.id === itemId
          ? { ...a, status: "Disponível", funcionario: "—", departamento: "—", qtdDisponivel: a.qtdTotal }
          : a
        ));
      }
      if (novaMovimentacao) setHistorico((p) => [novaMovimentacao, ...p]);
    } catch (err) {
      console.error("Erro ao devolver equipamento:", err);
      alert(`Erro ao devolver: ${err.message || err}`);
    }
  }, [db, sessao]);

  const handleTransferencia = useCallback(async ({ item, novoFuncionario, novoDepto, obs }) => {
    const { novoEquip, novaMovimentacao } = await processarTransferencia({
      db, item, novoFuncionario, novoDepto, obs, operador: sessao?.usuario,
    });
    if (novoEquip) setItens((p) => p.map((a) => (a.id === novoEquip.id ? novoEquip : a)));
    if (novaMovimentacao) setHistorico((p) => [novaMovimentacao, ...p]);
  }, [db, sessao]);

  const handleToggleUsuario = useCallback(async (u) => {
    const novoAtivo = await toggleUsuario(db, edgeFnUrl, u);
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, ativo: novoAtivo } : x)));
  }, [db, edgeFnUrl]);

  const handleResetUserPassword = useCallback(async (u) => {
    if (!u.email) throw new Error("Este usuário não tem e-mail cadastrado.");
    await resetUserPassword(db, u.email);
  }, [db]);

  const handleRenomearUsuario = useCallback(async (u, novoNome) => {
    await renameUsuario(db, u.id, novoNome);
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, nome: novoNome.trim() } : x)));
    if (u.id === sessao?.id) setSessao((p) => ({ ...p, nome: novoNome.trim() }));
  }, [db, sessao]);

  const handleAlterarSenha = useCallback(async (nova, confirmar) => {
    if (nova.length < 8)        throw new Error("Nova senha deve ter pelo menos 8 caracteres.");
    if (!/[A-Z]/.test(nova))    throw new Error("Nova senha deve conter ao menos uma maiúscula.");
    if (!/[0-9]/.test(nova))    throw new Error("Nova senha deve conter ao menos um número.");
    if (nova !== confirmar)     throw new Error("Senhas não coincidem.");
    await changePassword(db, nova);
  }, [db]);

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
    const novoUser = await createUsuario(db, edgeFnUrl, { ...form, avatar });
    setUsuarios((prev) => [...prev, novoUser]);
    return novoUser;
  }, [db, edgeFnUrl, usuarios]);

  const handleUploadAvatar = useCallback(async (file) => {
    if (!authUser) throw new Error("Não autenticado.");
    const url = await uploadAvatar(db, authUser.id, file);
    setSessao((p) => ({ ...p, avatar: url }));
    setUsuarios((prev) => prev.map((u) => u.authId === authUser.id ? { ...u, avatar: url } : u));
    return url;
  }, [db, authUser]);

  const handleAddMarca = useCallback(async (nome) => {
    const nova = await createMarca(db, unidade, nome);
    setMarcas((p) => [...p, nova].sort((a, b) => a.nome.localeCompare(b.nome)));
    return nova;
  }, [db, unidade]);

  const handleDeleteMarca = useCallback(async (id) => {
    await deleteMarca(db, id);
    setMarcas((p) => p.filter((m) => m.id !== id));
  }, [db]);

  const handleToggleManutencao = useCallback(async (item, qty) => {
    if (item.status === "Manutenção") {
      const novoStatus = item.funcionario && item.funcionario !== "—" ? "Em Uso" : "Disponível";
      const updated = await updateEquipamento(db, item.id, { status: novoStatus });
      setItens((p) => p.map((a) => (a.id === item.id ? updated : a)));
    } else if (qty && qty < item.qtdTotal) {
      const { updatedOriginal, createdManut } = await splitEquipamentoManutencao(db, item, qty);
      setItens((p) => [...p.map((a) => a.id === item.id ? updatedOriginal : a), createdManut]);
    } else {
      const updated = await updateEquipamento(db, item.id, { status: "Manutenção" });
      setItens((p) => p.map((a) => (a.id === item.id ? updated : a)));
    }
  }, [db]);

  const handleLogout = useCallback(() => {
    try { localStorage.removeItem("ti_unidade"); } catch {}
    setUnidadeState(null);
    supabase.auth.signOut(); // Sempre faz signOut pelo cliente de auth principal
  }, []);

  return (
    <AppContext.Provider value={{
      dark, setDark, t,
      unidade, setUnidade, db,
      sessao, authUser, authNome, carregando, erroDb,
      trocandoFilial, unidadeAlvo, unidadeOrigem,
      itens, historico, usuarios, marcas,
      stats, funcionarios,
      podeSuperAdmin, podeAdmin, podeEditar,
      handleSaveItem, handleDelete, handleMovimento, handleDevolucao, handleTransferencia,
      handleToggleUsuario, handleResetUserPassword,
      handleRenomearUsuario, handleAlterarSenha,
      handleCriarUsuario, handleUploadAvatar,
      handleAddMarca, handleDeleteMarca,
      handleToggleManutencao,
      handleLogout,
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
