import { hoje } from "./constants";

export function mapEquip(r) {
  return {
    id:           r.id,
    nome:         r.nome         || "",
    categoria:    r.categoria    || "",
    marca:        r.marca        || "—",
    modelo:       r.modelo       || "—",
    serial:       r.serial       || "—",
    patrimonio:   r.patrimonio   || "—",
    funcionario:  r.funcionario  || "—",
    departamento: r.departamento || "—",
    status:       r.status       || "Disponível",
    dataCompra:   r.data_compra  || "",
    notas:        r.notas        || "",
    qtdTotal:     r.qtd_total    || 0,
    qtdDisponivel:r.qtd_disponivel || 0,
  };
}

export function mapMov(r) {
  return {
    id:           r.id,
    data:         r.data         || hoje(),
    tipo:         r.tipo,
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
    obs:          r.obs          || "",
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
