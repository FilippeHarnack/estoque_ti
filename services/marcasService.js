import { supabase } from "./supabase";

export async function getAllMarcas() {
  const { data, error } = await supabase
    .from("marcas")
    .select("*")
    .order("nome");
  if (error) throw error;
  return data;
}

export async function createMarca(nome) {
  const { data, error } = await supabase
    .from("marcas")
    .insert([{ nome: nome.trim() }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMarca(id) {
  const { error } = await supabase.from("marcas").delete().eq("id", id);
  if (error) throw error;
}
