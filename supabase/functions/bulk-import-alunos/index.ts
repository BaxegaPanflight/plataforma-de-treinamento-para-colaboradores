import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImportRow {
  nome: string;
  email: string;
  cpf?: string;
  cargo?: string;
  setor?: string;
}

interface ImportResult {
  email: string;
  status: "convidado" | "atualizado" | "erro";
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader) return json({ error: "não autorizado" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Validate JWT
    const { data: { user }, error: authErr } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    ).auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) return json({ error: "não autorizado" }, 401);

    // Caller must be admin or gestor
    const { data: callerRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "gestor"])
      .maybeSingle();
    if (!callerRole) return json({ error: "acesso negado" }, 403);

    const body = await req.json() as { rows: ImportRow[] };
    const rows = (body.rows ?? []).slice(0, 200);
    if (!rows.length) return json({ error: "nenhuma linha enviada" }, 400);

    // Pre-fetch job_roles for cargo→id mapping
    const { data: jobRoles } = await supabase.from("job_roles").select("id, nome");
    const jobRoleMap = new Map((jobRoles ?? []).map((j) => [j.nome.toLowerCase(), j.id]));

    // Pre-fetch existing profiles by email (batch)
    const emails = rows.map((r) => r.email.toLowerCase().trim());
    const { data: existingProfiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("email", emails);
    const emailToId = new Map(
      (existingProfiles ?? []).map((p) => [(p.email ?? "").toLowerCase(), p.id]),
    );

    const results: ImportResult[] = [];
    const appUrl = Deno.env.get("APP_URL") ?? "https://learn-shine-hub-61.lovable.app";

    const BATCH = 10;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const batchResults = await Promise.all(
        batch.map(async (row): Promise<ImportResult> => {
          const email      = row.email.toLowerCase().trim();
          const nome       = row.nome.trim();
          const jobRoleId  = row.cargo ? (jobRoleMap.get(row.cargo.toLowerCase().trim()) ?? null) : null;

          try {
            let userId = emailToId.get(email);
            let status: ImportResult["status"];

            if (userId) {
              status = "atualizado";
            } else {
              const { data: invited, error: invErr } = await supabase.auth.admin.inviteUserByEmail(
                email,
                { redirectTo: `${appUrl}/convite`, data: { nome } },
              );
              if (invErr) return { email, status: "erro", error: invErr.message };
              userId = invited.user.id;
              status = "convidado";
            }

            await supabase.from("profiles").upsert({
              id: userId,
              nome,
              email,
              cpf:        row.cpf?.trim()   || null,
              cargo:      row.cargo?.trim() || null,
              setor:      row.setor?.trim() || null,
              job_role_id: jobRoleId,
            }, { onConflict: "id" });

            await supabase.from("user_roles").upsert(
              { user_id: userId, role: "aluno" },
              { ignoreDuplicates: true },
            );

            return { email, status };
          } catch (err) {
            return { email, status: "erro", error: err instanceof Error ? err.message : "erro inesperado" };
          }
        }),
      );
      results.push(...batchResults);
    }

    const created = results.filter((r) => r.status === "convidado").length;
    const updated = results.filter((r) => r.status === "atualizado").length;
    const errors  = results.filter((r) => r.status === "erro").length;

    return json({ results, created, updated, errors });
  } catch (err: unknown) {
    return json({ error: err instanceof Error ? err.message : "Erro interno" }, 500);
  }
});
