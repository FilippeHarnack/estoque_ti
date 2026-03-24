export async function getAllMarcas(db, unidade) {
  const { data, error } = await db
    .from("marcas")
    .select("*")
    .eq("unidade", unidade)
    .order("nome");
  if (error) throw error;
  return data;
}

export async function createMarca(db, unidade, nome) {
  const { data, error } = await db
    .from("marcas")
    .insert([{ nome: nome.trim(), unidade }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMarca(db, id) {
  const { error } = await db.from("marcas").delete().eq("id", id);
  if (error) throw error;
}
