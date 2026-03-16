import { supabase } from "./supabase";
import { mapUsuario } from "@/lib/mappers";

const EDGE_FN = process.env.NEXT_PUBLIC_EDGE_FN_URL;

export async function getAllUsuarios() {
  const { data, error } = await supabase
    .from("usuarios_app")
    .select("id,auth_id,usuario,nome,perfil,avatar,ativo,ultimo_login,email")
    .order("id");
  if (error) throw error;
  return data.map(mapUsuario);
}

export async function updateLastLogin(authId) {
  const agora = new Date().toISOString();
  await supabase.from("usuarios_app").update({ ultimo_login: agora }).eq("auth_id", authId);
  return agora;
}

export async function renameUsuario(id, nome) {
  const { error } = await supabase.from("usuarios_app").update({ nome: nome.trim() }).eq("id", id);
  if (error) throw error;
}

export async function toggleUsuario(u) {
  const novoAtivo = !u.ativo;
  const { data: { session } } = await supabase.auth.getSession();
  if (u.authId) {
    await fetch(EDGE_FN, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.access_token },
      body: JSON.stringify({ action: novoAtivo ? "enable" : "disable", auth_id: u.authId }),
    });
  }
  const { error } = await supabase.from("usuarios_app").update({ ativo: novoAtivo }).eq("id", u.id);
  if (error) throw error;
  return novoAtivo;
}

export async function resetUserPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
}

export async function createUsuario({ email, usuario, nome, senha, perfil, avatar }) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(EDGE_FN, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.access_token },
    body: JSON.stringify({ action: "create", email, password: senha, usuario, nome, perfil, avatar }),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || "Erro status " + res.status);
  if (!json.user) throw new Error("Função não retornou dados.");
  return mapUsuario(json.user);
}

export async function changePassword(novaSenha) {
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) throw error;
}
