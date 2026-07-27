import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

/** Service-role Supabase client (server only). Never expose this to the browser. */
export function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Admin PIN gate. Overridable via ADMIN_PIN env; defaults to the owner's chosen PIN. */
const ADMIN_PIN = process.env.ADMIN_PIN ?? "786110";

export function verifyAdminPin(request: Request): boolean {
  const pin = request.headers.get("x-admin-pin") ?? "";
  const a = Buffer.from(pin, "utf8");
  const b = Buffer.from(ADMIN_PIN, "utf8");
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
