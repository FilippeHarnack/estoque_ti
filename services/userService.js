import { mapUsuario } from "@/lib/mappers";

export async function getAllUsuarios(db, unidade) {
  const { data, error } = await db
    .from("usuarios_app")
    .select("id,auth_id,usuario,nome,perfil,avatar,ativo,ultimo_login,email")
    .eq("unidade", unidade)
    .order("id");
  if (error) throw error;
  return data.map(mapUsuario);
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
  const { data: { session } } = await db.auth.getSession();
  if (u.authId) {
    await fetch(edgeFnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.access_token },
      body: JSON.stringify({ action: novoAtivo ? "enable" : "disable", auth_id: u.authId }),
    });
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

export async function createUsuario(db, edgeFnUrl, unidade, { email, usuario, nome, senha, perfil, avatar }) {
  const { data: { session } } = await db.auth.getSession();
  const res = await fetch(edgeFnUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.access_token },
    body: JSON.stringify({ action: "create", email, password: senha, usuario, nome, perfil, avatar, unidade }),
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

export async function uploadAvatar(db, authId, file) {
  const blob = await resizeToBlob(file, 256);
  const path = `avatars/${authId}.jpg`;

  const { error: uploadError } = await db.storage
    .from("photos")
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw uploadError;

  const { data, error: signError } = await db.storage.from("photos").createSignedUrl(path, 315360000);
  if (signError) throw signError;
  const url = data.signedUrl;

  const { error: dbError } = await db.from("usuarios_app").update({ avatar: url }).eq("auth_id", authId);
  if (dbError) throw dbError;

  return url;
}

export async function changePassword(db, novaSenha) {
  const { error } = await db.auth.updateUser({ password: novaSenha });
  if (error) throw error;
}
