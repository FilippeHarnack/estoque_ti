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
