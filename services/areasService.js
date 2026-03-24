function tabelaAreas(unidade) {
  return unidade === "brasilia" ? "areas comuns brasilia" : "areas comuns florianopolis";
}

export async function getAllAreas(db, unidade) {
  const { data, error } = await db
    .from(tabelaAreas(unidade))
    .select("*")
    .order("Descrição do Bem");
  if (error) throw error;
  return data;
}

export async function createArea(db, unidade, payload) {
  const { data, error } = await db
    .from(tabelaAreas(unidade))
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateArea(db, unidade, id, payload) {
  const { data, error } = await db
    .from(tabelaAreas(unidade))
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteArea(db, unidade, id) {
  const { error } = await db
    .from(tabelaAreas(unidade))
    .delete()
    .eq("id", id);
  if (error) throw error;
}
