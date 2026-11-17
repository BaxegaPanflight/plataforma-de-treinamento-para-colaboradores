/**
 * Server-only helpers for API key management.
 * MUST NOT be imported by client code (`.server.ts` is enforced by the bundler).
 *
 * All vault reads/writes route through `public.vault_*` SECURITY DEFINER
 * helpers, executable only by service_role. Callers must use `supabaseAdmin`.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getService } from "./api-keys.catalog";

const VAULT_NAME_PREFIX = "lms_";

export type ValidationStatus = "valid" | "invalid" | "error";

export async function assertAdmin(userId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("auth check failed");
  if (!data) throw new Error("forbidden: admin required");
}

export function vaultName(serviceName: string): string {
  return `${VAULT_NAME_PREFIX}${serviceName}`;
}

export async function upsertVaultKey(opts: {
  serviceName: string;
  key: string;
  label: string | null;
  userId: string;
}): Promise<void> {
  const existing = await supabaseAdmin
    .from("api_keys_registry")
    .select("id, vault_secret_id")
    .eq("service_name", opts.serviceName)
    .maybeSingle();

  if (existing.data) {
    const { error: updErr } = await supabaseAdmin.rpc("vault_update_secret", {
      p_id: existing.data.vault_secret_id,
      p_secret: opts.key,
    });
    if (updErr) throw new Error("vault update failed");

    const { error: regErr } = await supabaseAdmin
      .from("api_keys_registry")
      .update({
        label: opts.label,
        is_active: true,
        last_validation_status: null,
        last_validated_at: null,
      })
      .eq("id", existing.data.id);
    if (regErr) throw new Error("registry update failed");
    return;
  }

  const { data: createdId, error: createErr } = await supabaseAdmin.rpc(
    "vault_create_secret",
    {
      p_name: vaultName(opts.serviceName),
      p_secret: opts.key,
      p_description: `LMS ${opts.serviceName} key`,
    },
  );
  if (createErr || !createdId) throw new Error("vault create failed");

  const { error: insErr } = await supabaseAdmin.from("api_keys_registry").insert({
    service_name: opts.serviceName,
    vault_secret_id: createdId,
    label: opts.label,
    created_by: opts.userId,
  });
  if (insErr) {
    await supabaseAdmin.rpc("vault_delete_secret", { p_id: createdId });
    throw new Error("registry insert failed");
  }
}

export async function deleteVaultKey(serviceName: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("api_keys_registry")
    .select("id, vault_secret_id")
    .eq("service_name", serviceName)
    .maybeSingle();
  if (error) throw new Error("registry read failed");
  if (!data) return;

  await supabaseAdmin.rpc("vault_delete_secret", { p_id: data.vault_secret_id });
  await supabaseAdmin.from("api_keys_registry").delete().eq("id", data.id);
}

/** SERVER-ONLY. Never expose the return value to clients. */
export async function readApiKey(serviceName: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("api_keys_registry")
    .select("vault_secret_id, is_active")
    .eq("service_name", serviceName)
    .maybeSingle();
  if (error || !data || !data.is_active) return null;

  const { data: value, error: readErr } = await supabaseAdmin.rpc("vault_read_secret", {
    p_id: data.vault_secret_id,
  });
  if (readErr || !value) return null;
  return value as string;
}

export async function validateKey(
  serviceName: string,
): Promise<{ status: ValidationStatus; message?: string }> {
  const svc = getService(serviceName);
  if (!svc) return { status: "error", message: "unknown service" };
  const key = await readApiKey(serviceName);
  if (!key) return { status: "error", message: "not configured" };

  try {
    let res: Response;
    switch (serviceName) {
      case "panda_video":
        res = await fetch("https://api-v2.pandavideo.com.br/videos?limit=1", {
          headers: { Authorization: key },
        });
        break;
      case "resend":
        res = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${key}` },
        });
        break;
      case "openai":
        res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${key}` },
        });
        break;
      default:
        return { status: "error", message: "no validator" };
    }

    if (res.ok) return { status: "valid" };
    if (res.status === 401 || res.status === 403) return { status: "invalid" };
    return { status: "error", message: `upstream ${res.status}` };
  } catch {
    return { status: "error", message: "network" };
  }
}

export async function recordValidation(
  serviceName: string,
  status: ValidationStatus,
): Promise<void> {
  await supabaseAdmin
    .from("api_keys_registry")
    .update({
      last_validated_at: new Date().toISOString(),
      last_validation_status: status,
    })
    .eq("service_name", serviceName);
}
