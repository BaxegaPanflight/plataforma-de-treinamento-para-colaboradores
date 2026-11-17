import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export async function logAudit(
  acao: string,
  entidade: string,
  entidade_id?: string | null,
  payload_json?: Record<string, unknown> | null,
) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    acao,
    entidade,
    entidade_id: entidade_id ?? null,
    payload_json: (payload_json ?? null) as Json | null,
    user_id: user?.id ?? null,
  });
}
