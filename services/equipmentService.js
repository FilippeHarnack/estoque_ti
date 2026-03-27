import { mapEquip } from "@/lib/mappers";

export async function getAllEquipamentos(db, unidade) {
  const { data, error } = await db
    .from("equipamentos")
    .select("*")
    .eq("unidade", unidade)
    .order("nome");
  if (error) throw error;
  return data.map(mapEquip);
}

export async function createEquipamento(db, unidade, payload) {
  const { data, error } = await db
    .from("equipamentos")
    .insert([{ ...payload, unidade }])
    .select()
    .single();
  if (error) throw error;
  return mapEquip(data);
}

export async function updateEquipamento(db, id, payload) {
  const { data, error } = await db
    .from("equipamentos")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapEquip(data);
}

export async function deleteEquipamento(db, id) {
  const { error } = await db.from("equipamentos").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Cria um registro separado de manutenção para qty unidades e reduz o item original.
 */
export async function splitEquipamentoManutencao(db, item, qty) {
  if (qty > item.qtdDisponivel) throw new Error(`Somente ${item.qtdDisponivel} unidade(s) disponível(is) para manutenção.`);
  const { data: orig, error: e1 } = await db
    .from("equipamentos")
    .update({ qtd_total: item.qtdTotal - qty, qtd_disponivel: item.qtdDisponivel - qty })
    .eq("id", item.id)
    .select()
    .single();
  if (e1) throw e1;

  const { data: manut, error: e2 } = await db
    .from("equipamentos")
    .insert([{
      nome:           item.nome,
      categoria:      item.categoria,
      marca:          item.marca,
      modelo:         item.modelo,
      serial:         item.serial || "—",
      patrimonio:     item.patrimonio || "—",
      funcionario:    item.funcionario || "—",
      departamento:   item.departamento || "—",
      status:         "Manutenção",
      data_compra:    item.dataCompra || null,
      notas:          `Em manutenção (${qty} un.)`,
      qtd_total:      qty,
      qtd_disponivel: 0,
      unidade:        item.unidade,
    }])
    .select()
    .single();
  if (e2) {
    // Rollback: restaura qtd_total e qtd_disponivel originais antes de lançar o erro
    await db.from("equipamentos").update({ qtd_total: item.qtdTotal, qtd_disponivel: item.qtdDisponivel }).eq("id", item.id);
    throw e2;
  }

  return { updatedOriginal: mapEquip(orig), createdManut: mapEquip(manut) };
}

export function buildEquipPayload(form) {
  return {
    nome:           form.nome,
    categoria:      form.categoria,
    marca:          form.marca,
    modelo:         form.modelo,
    serial:         form.serial,
    patrimonio:     form.patrimonio,
    funcionario:    form.funcionario,
    departamento:   form.departamento,
    status:         form.status,
    data_compra:    form.dataCompra || null,
    notas:          form.notas,
    qtd_total:      form.qtdTotal,
    qtd_disponivel: form.qtdDisponivel,
  };
}
