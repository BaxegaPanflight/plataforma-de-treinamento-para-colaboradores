import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { email, nome } = await req.json();
    if (!email || !nome) {
      return new Response(JSON.stringify({ error: "email e nome são obrigatórios" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: cors });

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401, headers: cors });

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleRow?.role !== "admin" && roleRow?.role !== "gestor") {
      return new Response("Forbidden", { status: 403, headers: cors });
    }

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return new Response(JSON.stringify({ error: "Este email já possui uma conta na plataforma." }), {
        status: 409,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: invErr } = await supabaseAdmin.from("invitations").insert({
      token,
      email,
      nome,
      role: "aluno",
      invited_by: user.id,
      expires_at: expiresAt,
    });
    if (invErr) throw invErr;

    const appUrl = Deno.env.get("APP_URL") ?? req.headers.get("origin") ?? "https://localhost:8080";
    const { error: authErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { invited_role: "aluno", nome },
      redirectTo: `${appUrl}/convite/${token}`,
    });

    if (authErr) {
      await supabaseAdmin.from("invitations").delete().eq("token", token);
      throw authErr;
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
