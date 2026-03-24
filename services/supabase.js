import { createClient } from "@supabase/supabase-js";

const _mem = {};
const safeStorage = {
  getItem:    (k) => { try { return localStorage.getItem(k); }    catch { return _mem[k] ?? null; } },
  setItem:    (k, v) => { try { localStorage.setItem(k, v); }    catch { _mem[k] = v; } },
  removeItem: (k) => { try { localStorage.removeItem(k); }        catch { delete _mem[k]; } },
};

function makeClient(url, key, storageKey) {
  const mem = {};
  const storage = {
    getItem:    (k) => { try { return localStorage.getItem(storageKey + k); }    catch { return mem[k] ?? null; } },
    setItem:    (k, v) => { try { localStorage.setItem(storageKey + k, v); }    catch { mem[k] = v; } },
    removeItem: (k) => { try { localStorage.removeItem(storageKey + k); }        catch { delete mem[k]; } },
  };
  return createClient(url, key, {
    auth: { storage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
}

// Florianópolis
export const supabase = makeClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "fln_"
);

// Brasília
export const supabaseBsb = makeClient(
  process.env.NEXT_PUBLIC_SUPABASE_BSB_URL,
  process.env.NEXT_PUBLIC_SUPABASE_BSB_ANON_KEY,
  "bsb_"
);

/** Retorna o cliente correto conforme a unidade selecionada */
export function getDb(unidade) {
  return unidade === "brasilia" ? supabaseBsb : supabase;
}

/** Retorna a URL da Edge Function conforme a unidade */
export function getEdgeFnUrl(unidade) {
  return unidade === "brasilia"
    ? process.env.NEXT_PUBLIC_EDGE_FN_BSB_URL
    : process.env.NEXT_PUBLIC_EDGE_FN_URL;
}
