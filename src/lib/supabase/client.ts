import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rlotxrtdbqtnbglbmyea.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_xft8dx8s2qhtL4Upw0oHVQ__trf1mEy";

  return createBrowserClient(supabaseUrl, supabaseKey);
}
