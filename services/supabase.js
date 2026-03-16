import { createClient } from "@supabase/supabase-js";

const _mem = {};
const safeStorage = {
  getItem:    (k) => { try { return localStorage.getItem(k); }    catch { return _mem[k] ?? null; } },
  setItem:    (k, v) => { try { localStorage.setItem(k, v); }    catch { _mem[k] = v; } },
  removeItem: (k) => { try { localStorage.removeItem(k); }        catch { delete _mem[k]; } },
};

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: safeStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
