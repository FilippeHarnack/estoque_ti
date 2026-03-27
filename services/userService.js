import { mapUsuario } from "@/lib/mappers";

export async function getAllUsuarios(db) {
  const { data, error } = await db
    .from("usuarios_app")
    .select("id,auth_id,usuario,nome,perfil,avatar,ativo,ultimo_login,email")
    .order("id");
  if (error) throw error;
  const users = data.map(mapUsuario);
  // Gera URLs assinadas frescas para avatares armazenados como paths de storage
  await Promise.all(users.map(async (u) => {
    if (u.avatar?.startsWith("avatars/")) {
      const url = await getAvatarUrl(db, u.avatar).catch(() => null);
      if (url) u.avatar = url;
    }
  }));
  return users;
}

export async function updateLastLogin(db, authId) {
  const agora = new Date().toISOString();
  await db.from("usuarios_app").update({ ultimo_login: agora }).eq("auth_id", authId);
  return agora;
}

export async function renameUsuario(db, id, nome) {
  const { error } = await db.from("usuarios_app").update({ nome: nome.trim() }).eq("id", id);
  if (error) throw error;
}

export async function toggleUsuario(db, edgeFnUrl, u) {
  const novoAtivo = !u.ativo;
  if (u.authId) {
    const { data: { session }, error: sessErr } = await db.auth.getSession();
    if (sessErr || !session) throw new Error("Sessão inválida. Faça login novamente.");
    const res = await fetch(edgeFnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.access_token },
      body: JSON.stringify({ action: novoAtivo ? "enable" : "disable", auth_id: u.authId }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || `Erro ao ${novoAtivo ? "ativar" : "desativar"} usuário no Auth (status ${res.status}).`);
    }
  }
  const { error } = await db.from("usuarios_app").update({ ativo: novoAtivo }).eq("id", u.id);
  if (error) throw error;
  return novoAtivo;
}

export async function resetUserPassword(db, email) {
  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
}

export async function createUsuario(db, edgeFnUrl, { email, usuario, nome, senha, perfil, avatar }) {
  const { data: { session } } = await db.auth.getSession();
  const res = await fetch(edgeFnUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.access_token },
    body: JSON.stringify({ action: "create", email, password: senha, usuario, nome, perfil, avatar }),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || "Erro status " + res.status);
  if (!json.user) throw new Error("Função não retornou dados.");
  return mapUsuario(json.user);
}

function resizeToBlob(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob falhou")), "image/jpeg", 0.88);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const AVATAR_SIGNED_URL_TTL = 7 * 24 * 60 * 60; // 7 dias em segundos

export async function uploadAvatar(db, authId, file) {
  const blob = await resizeToBlob(file, 256);
  const storagePath = `avatars/${authId}.jpg`;

  const { error: uploadError } = await db.storage
    .from("photos")
    .upload(storagePath, blob, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw uploadError;

  // Salva o path no DB (não a URL assinada) para poder gerar URLs frescas depois
  const { error: dbError } = await db.from("usuarios_app").update({ avatar: storagePath }).eq("auth_id", authId);
  if (dbError) throw dbError;

  // Retorna URL assinada de curta duração apenas para exibição imediata
  const { data, error: signError } = await db.storage.from("photos").createSignedUrl(storagePath, AVATAR_SIGNED_URL_TTL);
  if (signError) throw signError;

  return data.signedUrl;
}

export async function getAvatarUrl(db, storagePath) {
  if (!storagePath || storagePath.startsWith("http") || storagePath.startsWith("data:")) return storagePath;
  const { data, error } = await db.storage.from("photos").createSignedUrl(storagePath, AVATAR_SIGNED_URL_TTL);
  if (error) return null;
  return data.signedUrl;
}

export async function changePassword(db, novaSenha) {
  const { error } = await db.auth.updateUser({ password: novaSenha });
  if (error) throw error;
}
