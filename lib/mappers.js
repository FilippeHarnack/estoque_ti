import { hoje } from "./constants";

export function mapEquip(r) {
  const funcionario = r.funcionario || "—";
  const NOMES_ESTOQUE = ["estoque da t.i", "estoque ti", "sem funcionário", "sem funcionario", "ti"];
  const temFunc = funcionario !== "—" && funcionario.trim() !== "" && !NOMES_ESTOQUE.includes(funcionario.trim().toLowerCase());
  // Se tem funcionário vinculado: status = Em Uso e qtdDisponivel = 0
  // (corrige dados subidos diretamente no DB sem decrementar disponível)
  let status = r.status || "Disponível";
  if (status === "Novo") status = temFunc ? "Em Uso" : "Disponível";
  if (temFunc && status === "Disponível") status = "Em Uso";
  const qtdTotal     = r.qtd_total     || 0;
  const qtdDisponivel = temFunc ? 0 : (r.qtd_disponivel || 0);
  return {
    id:           r.id,
    nome:         r.nome         || "",
    categoria:    r.categoria    || "",
    marca:        r.marca        || "—",
    modelo:       r.modelo       || "—",
    serial:       r.serial       || "—",
    patrimonio:   r.patrimonio   || "—",
    funcionario,
    departamento: r.departamento || "—",
    status,
    dataCompra:   r.data_compra  || "",
    notas:        r.notas        || "",
    qtdTotal,
    qtdDisponivel,
    unidade:      r.unidade      || "",
  };
}

export function mapMov(r) {
  // Subtipos codificados no obs para compatibilidade com constraints do DB
  let tipo = r.tipo || "entrada";
  let obs  = r.obs  || "";
  if (obs.startsWith("[devolucao] "))      { tipo = "devolucao";     obs = obs.slice(12); }
  else if (obs.startsWith("[ajuste] "))     { tipo = "ajuste";        obs = obs.slice(9);  }
  else if (obs.startsWith("[transferencia] ")) { tipo = "transferencia"; obs = obs.slice(16); }
  return {
    id:           r.id,
    data:         r.data         || hoje(),
    tipo,
    itemId:       r.equipamento_id,
    itemNome:     r.item_nome    || "",
    serial:       r.serial       || "—",
    patrimonio:   r.patrimonio   || "—",
    categoria:    r.categoria    || "—",
    qty:          r.qty          || 0,
    qtdTotal:     r.qtd_total,
    qtdDisponivel:r.qtd_disponivel,
    usuario:      r.operador     || "",
    funcionario:  r.funcionario  || "—",
    depto:        r.departamento || "—",
    obs,
  };
}

export function mapUsuario(r) {
  const perfil = r.perfil || "viewer";
  return {
    id:          r.id,
    authId:      r.auth_id,
    usuario:     r.usuario,
    nome:        r.nome || r.usuario,
    perfil,
    avatar:      (r.avatar?.startsWith("http") || r.avatar?.startsWith("data:image")) ? r.avatar : (perfil === "super_admin" ? "bolt" : perfil === "admin" ? "crown" : "user"),
    ativo:       r.ativo !== false,
    ultimoLogin: r.ultimo_login || null,
    email:       r.email || "",
  };
}
