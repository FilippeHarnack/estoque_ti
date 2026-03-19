import { supabase } from "./supabase";
import { mapEquip } from "@/lib/mappers";

export async function getAllEquipamentos() {
  const { data, error } = await supabase
    .from("equipamentos")
    .select("*")
    .order("nome");
  if (error) throw error;
  return data.map(mapEquip);
}

export async function createEquipamento(payload) {
  const { data, error } = await supabase
    .from("equipamentos")
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return mapEquip(data);
}

export async function updateEquipamento(id, payload) {
  const { data, error } = await supabase
    .from("equipamentos")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapEquip(data);
}

export async function deleteEquipamento(id) {
  const { error } = await supabase.from("equipamentos").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Cria um registro separado de manutenção para qty unidades e reduz o item original.
 * Usado quando apenas parte das unidades de um item vai para manutenção.
 */
export async function splitEquipamentoManutencao(item, qty) {
  // 1. Reduz o item original
  const { data: orig, error: e1 } = await supabase
    .from("equipamentos")
    .update({ qtd_total: item.qtdTotal - qty })
    .eq("id", item.id)
    .select()
    .single();
  if (e1) throw e1;

  // 2. Cria novo registro de manutenção
  const { data: manut, error: e2 } = await supabase
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
    }])
    .select()
    .single();
  if (e2) throw e2;

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
