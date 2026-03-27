import { mapMov, mapEquip } from "@/lib/mappers";
import { hoje } from "@/lib/constants";

export async function getAllMovimentos(db, unidade) {
  const { data, error } = await db
    .from("movimentacoes")
    .select("*")
    .eq("unidade", unidade)
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data.map(mapMov);
}

/**
 * Processa uma movimentação (entrada ou saída) e atualiza o equipamento.
 */
export async function processarMovimento({ db, unidade, tipo, itemSel, itens, nomeItem, serial, patrimonio, qty, func, depto, obs, operador }) {
  const isEntrada = tipo === "entrada";
  const itemExistente = itens.find((a) => a.id === itemSel?.id);

  const isEntregaDireta = isEntrada && !!func?.trim() && !!itemExistente;
  const tipoEfetivo = isEntregaDireta ? "saida" : tipo;
  const isEntradaReal = tipoEfetivo === "entrada";

  let equipId = itemSel?.id;
  let qtdTotalFinal = itemExistente?.qtdTotal ?? qty;
  let qtdDispFinal = itemExistente?.qtdDisponivel ?? qty;
  let nomeRegistro = itemExistente?.nome || nomeItem || "Item desconhecido";
  let catRegistro = itemExistente?.categoria || "—";
  let serialReg = serial || itemExistente?.serial || "—";
  let patReg = patrimonio || itemExistente?.patrimonio || "—";
  let novoEquip = null;

  if (itemExistente) {
    const novas = isEntradaReal
      ? { qtd_total: itemExistente.qtdTotal + qty, qtd_disponivel: itemExistente.qtdDisponivel + qty, status: "Disponível", funcionario: "—", departamento: "—" }
      : {
          qtd_disponivel: itemExistente.qtdDisponivel - qty,
          funcionario: func || itemExistente.funcionario,
          departamento: depto || itemExistente.departamento,
          status: itemExistente.qtdDisponivel - qty <= 0 ? "Em Uso" : itemExistente.status,
        };
    qtdTotalFinal = novas.qtd_total ?? itemExistente.qtdTotal;
    qtdDispFinal = novas.qtd_disponivel ?? itemExistente.qtdDisponivel - qty;
    const { data, error: updErr } = await db.from("equipamentos").update(novas).eq("id", itemSel.id).select().single();
    if (updErr) throw new Error(updErr.message || JSON.stringify(updErr));
    if (data) novoEquip = mapEquip(data);
  } else if (isEntradaReal && nomeItem) {
    const novoP = {
      nome: nomeItem, categoria: "Periférico", marca: "—", modelo: "—",
      serial: serial || "—", patrimonio: patrimonio || "—", funcionario: "—",
      departamento: "—", status: "Disponível", data_compra: hoje(),
      notas: "Cadastrado via entrada", qtd_total: qty, qtd_disponivel: qty,
      unidade,
    };
    const { data } = await db.from("equipamentos").insert([novoP]).select().single();
    if (data) { equipId = data.id; qtdTotalFinal = qty; qtdDispFinal = qty; novoEquip = mapEquip(data); }
  }

  const movP = {
    data: hoje(), tipo: tipoEfetivo, equipamento_id: equipId || null,
    item_nome: nomeRegistro, serial: serialReg, patrimonio: patReg,
    categoria: catRegistro, qty, qtd_total: qtdTotalFinal, qtd_disponivel: qtdDispFinal,
    funcionario: func || null, departamento: depto || null,
    operador, obs: obs || null, unidade,
  };
  const { data: movData, error: movErr } = await db.from("movimentacoes").insert([movP]).select().single();

  // Rollback do equipamento se o registro de movimentação falhou
  if (movErr && itemExistente) {
    await db.from("equipamentos").update({
      qtd_total:      itemExistente.qtdTotal,
      qtd_disponivel: itemExistente.qtdDisponivel,
      status:         itemExistente.status,
      funcionario:    itemExistente.funcionario,
      departamento:   itemExistente.departamento,
    }).eq("id", itemSel.id).catch(() => {});
    throw new Error(movErr.message || JSON.stringify(movErr));
  }

  return { novoEquip, novaMovimentacao: movData ? mapMov(movData) : null };
}

/**
 * Processa devolução de equipamento ao estoque.
 */
export async function processarDevolucao({ db, item, qty, obs, operador }) {
  const qtyReg = qty || 1;
  // Calcula nova quantidade disponível sem ultrapassar o total
  const novaDisp = Math.min(item.qtdDisponivel + qtyReg, item.qtdTotal);
  const devolucaoTotal = novaDisp >= item.qtdTotal;

  const obsFinal = `[devolucao] ${obs || `Devolvido por ${item.funcionario || "—"}`}`;
  const movP = {
    data: hoje(),
    tipo: "entrada",
    equipamento_id: item.id,
    item_nome: item.nome,
    serial: item.serial || "—",
    patrimonio: item.patrimonio || "—",
    categoria: item.categoria || "—",
    qty: qtyReg,
    qtd_total: item.qtdTotal,
    qtd_disponivel: novaDisp,
    funcionario: item.funcionario || null,
    departamento: item.departamento || null,
    operador,
    obs: obsFinal,
    unidade: item.unidade,
  };

  const { data: movData, error: movErr } = await db.from("movimentacoes").insert([movP]).select().single();
  if (movErr) throw new Error(movErr.message || JSON.stringify(movErr));

  if (devolucaoTotal) {
    // Todos os itens devolvidos: tenta remover o registro do equipamento
    const { error: delErr } = await db.from("equipamentos").delete().eq("id", item.id);
    if (delErr) {
      // Fallback: atualiza o registro marcando como disponível
      const { error: updErr } = await db.from("equipamentos")
        .update({ status: "Disponível", funcionario: "Estoque", departamento: "—", qtd_disponivel: novaDisp })
        .eq("id", item.id);
      if (updErr) throw new Error(updErr.message || JSON.stringify(updErr));
    }
    return { itemDeletado: !delErr, itemId: item.id, novaMovimentacao: movData ? mapMov(movData) : null };
  } else {
    // Devolução parcial: apenas incrementa qtd_disponivel
    const { error: updErr } = await db.from("equipamentos")
      .update({ qtd_disponivel: novaDisp })
      .eq("id", item.id);
    if (updErr) throw new Error(updErr.message || JSON.stringify(updErr));
    return { itemDeletado: false, itemId: item.id, novaMovimentacao: movData ? mapMov(movData) : null };
  }
}

/**
 * Registra entrada no momento do cadastro de um novo equipamento no estoque.
 */
export async function registrarEntradaCadastro({ db, item, qty, operador }) {
  const temFunc = item.funcionario && item.funcionario !== "—";
  const movP = {
    data: hoje(),
    tipo: "entrada",
    equipamento_id: item.id,
    item_nome: item.nome,
    serial: item.serial || "—",
    patrimonio: item.patrimonio || "—",
    categoria: item.categoria || "—",
    qty,
    qtd_total: item.qtdTotal,
    qtd_disponivel: item.qtdDisponivel,
    funcionario: temFunc ? item.funcionario : null,
    departamento: temFunc && item.departamento && item.departamento !== "—" ? item.departamento : null,
    operador,
    obs: "Cadastro de novo equipamento",
    unidade: item.unidade,
  };
  const { data, error } = await db.from("movimentacoes").insert([movP]).select().single();
  if (error) throw error;
  return mapMov(data);
}

/**
 * Registra saída no momento do cadastro de um equipamento já atribuído.
 */
export async function registrarSaidaCadastro({ db, item, qty, func, depto, operador }) {
  const movP = {
    data: hoje(),
    tipo: "saida",
    equipamento_id: item.id,
    item_nome: item.nome,
    serial: item.serial || "—",
    patrimonio: item.patrimonio || "—",
    categoria: item.categoria || "—",
    qty,
    qtd_total: item.qtdTotal,
    qtd_disponivel: item.qtdDisponivel,
    funcionario: func || null,
    departamento: depto || null,
    operador,
    obs: "Atribuído no cadastro do equipamento",
    unidade: item.unidade,
  };
  const { data, error } = await db.from("movimentacoes").insert([movP]).select().single();
  if (error) throw error;
  return mapMov(data);
}

/**
 * Transfere um equipamento de um funcionário para outro.
 */
export async function processarTransferencia({ db, item, novoFuncionario, novoDepto, obs, operador }) {
  const novas = { funcionario: novoFuncionario, departamento: novoDepto, status: "Em Uso" };
  const { data: equip, error: updErr } = await db.from("equipamentos").update(novas).eq("id", item.id).select().single();
  if (updErr) throw new Error(updErr.message || JSON.stringify(updErr));

  const obsFinal = `[transferencia] ${item.funcionario} → ${novoFuncionario}${obs ? ` · ${obs}` : ""}`;
  const movP = {
    data: hoje(), tipo: "saida", equipamento_id: item.id,
    item_nome: item.nome, serial: item.serial || "—", patrimonio: item.patrimonio || "—",
    categoria: item.categoria || "—", qty: 1,
    qtd_total: item.qtdTotal, qtd_disponivel: item.qtdDisponivel,
    funcionario: novoFuncionario, departamento: novoDepto,
    operador, obs: obsFinal, unidade: item.unidade,
  };
  const { data: movData, error: movErr } = await db.from("movimentacoes").insert([movP]).select().single();
  if (movErr) {
    // Rollback: restaura funcionário/departamento originais
    await db.from("equipamentos").update({
      funcionario:  item.funcionario,
      departamento: item.departamento,
      status:       item.status,
    }).eq("id", item.id).catch(() => {});
    throw new Error(movErr.message || JSON.stringify(movErr));
  }

  return { novoEquip: equip ? mapEquip(equip) : null, novaMovimentacao: movData ? mapMov(movData) : null };
}

/**
 * Registra um ajuste manual de estoque.
 */
export async function registrarAjusteManual({ db, item, novoTotal, novoDisp, operador }) {
  const obsFinal = `[ajuste] Ajuste manual: total ${item.qtdTotal}→${novoTotal}, disponível ${item.qtdDisponivel}→${novoDisp}`;
  const movP = {
    data: hoje(),
    tipo: "entrada",
    equipamento_id: item.id,
    item_nome: item.nome,
    serial: item.serial || "—",
    patrimonio: item.patrimonio || "—",
    categoria: item.categoria || "—",
    qty: Math.abs(novoDisp - item.qtdDisponivel) || Math.abs(novoTotal - item.qtdTotal) || 0,
    qtd_total: novoTotal,
    qtd_disponivel: novoDisp,
    funcionario: item.funcionario || null,
    departamento: item.departamento || null,
    operador,
    obs: obsFinal,
    unidade: item.unidade,
  };
  const { data, error } = await db.from("movimentacoes").insert([movP]).select().single();
  if (error) throw new Error(error.message || JSON.stringify(error));
  return mapMov(data);
}
