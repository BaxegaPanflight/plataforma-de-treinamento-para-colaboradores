import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Payload = Record<string, unknown>;
type Canal = "email" | "whatsapp" | "ambos";

interface EvoConfig { url: string; instance: string; key: string }

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : "55" + digits;
}

function buildEmail(template: string, payload: Payload, name: string): { subject: string; html: string } | null {
  const curso = String(payload.curso ?? "");

  if (template === "matricula_realizada") {
    const due = payload.due_date ? `<p>Sua matrícula é válida até <strong>${payload.due_date}</strong>.</p>` : "";
    return {
      subject: `Matrícula confirmada: ${curso}`,
      html: `<h2>Olá, ${name}!</h2><p>Sua matrícula no curso <strong>${curso}</strong> foi confirmada. Acesse a plataforma para começar.</p>${due}<p>Bons estudos!</p>`,
    };
  }
  if (template === "prova_aprovada") {
    const score = String(payload.score ?? "");
    return {
      subject: `Aprovado! Nota ${score}% em ${curso}`,
      html: `<h2>Parabéns, ${name}!</h2><p>Você foi aprovado na prova de <strong>${curso}</strong> com nota <strong>${score}%</strong>.</p>`,
    };
  }
  if (template === "certificado_emitido") {
    const link = payload.cert_url
      ? `<p><a href="${payload.cert_url}" style="color:#6366f1">Clique aqui para visualizar seu certificado</a></p>` : "";
    return {
      subject: `Certificado disponível: ${curso}`,
      html: `<h2>Olá, ${name}!</h2><p>Seu certificado de conclusão do curso <strong>${curso}</strong> está disponível.</p>${link}`,
    };
  }
  return null;
}

function buildWhatsApp(template: string, payload: Payload, name: string): string | null {
  const curso = String(payload.curso ?? "");

  if (template === "matricula_realizada") {
    return `✅ Olá ${name}! Sua matrícula no curso *${curso}* foi confirmada. Acesse a plataforma e bons estudos!`;
  }
  if (template === "prova_aprovada") {
    const score = String(payload.score ?? "");
    return `🎉 Parabéns, ${name}! Você foi aprovado na prova de *${curso}* com nota *${score}%*.`;
  }
  if (template === "certificado_emitido") {
    const link = payload.cert_url ? `\n📄 ${payload.cert_url}` : "";
    return `📜 Olá ${name}! Seu certificado de *${curso}* está disponível.${link}`;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: cors });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401, headers: cors });

    const { template, payload = {}, canal = "ambos" } = await req.json() as {
      template: string; payload?: Payload; canal?: Canal;
    };
    if (!template) return json({ error: "template obrigatório" }, 400);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("nome, email, telefone")
      .eq("id", user.id)
      .maybeSingle();

    const toEmail = profile?.email ?? user.email ?? "";
    const toName  = profile?.nome || toEmail.split("@")[0] || "Aluno";
    const toPhone = profile?.telefone ?? null;

    const fromName = Deno.env.get("APP_NAME") ?? "LMS";
    const fromAddr = Deno.env.get("RESEND_FROM") ?? "onboarding@resend.dev";

    const results: Record<string, boolean> = {};

    // ── Email ──────────────────────────────────────────────────────
    if (canal === "email" || canal === "ambos") {
      const emailBody = buildEmail(template, payload, toName);
      if (emailBody) {
        const { data: keyRow } = await supabaseAdmin
          .from("api_keys_registry")
          .select("vault_secret_id, is_active")
          .eq("service_name", "resend")
          .maybeSingle();

        let emailOk = false;
        if (keyRow?.is_active) {
          const { data: resendKey } = await supabaseAdmin.rpc("vault_read_secret", { p_id: keyRow.vault_secret_id });
          if (resendKey) {
            const r = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({ from: `${fromName} <${fromAddr}>`, to: [toEmail], subject: emailBody.subject, html: emailBody.html }),
            });
            emailOk = r.ok;
          }
        }
        await supabaseAdmin.from("notifications").insert({
          user_id: user.id, canal: "email", template, payload_json: payload,
          status: emailOk ? "sent" : "error",
          sent_at: emailOk ? new Date().toISOString() : null,
        });
        results.email = emailOk;
      }
    }

    // ── WhatsApp via Evolution API ─────────────────────────────────
    if ((canal === "whatsapp" || canal === "ambos") && toPhone) {
      const waText = buildWhatsApp(template, payload, toName);
      if (waText) {
        const { data: evoRow } = await supabaseAdmin
          .from("api_keys_registry")
          .select("vault_secret_id, is_active")
          .eq("service_name", "evolution_api")
          .maybeSingle();

        let waOk = false;
        if (evoRow?.is_active) {
          const { data: evoRaw } = await supabaseAdmin.rpc("vault_read_secret", { p_id: evoRow.vault_secret_id });
          try {
            const evo: EvoConfig = JSON.parse(evoRaw ?? "null");
            const phone = formatPhone(toPhone);
            const r = await fetch(`${evo.url}/message/sendText/${evo.instance}`, {
              method: "POST",
              headers: { "apikey": evo.key, "Content-Type": "application/json" },
              body: JSON.stringify({ number: phone, text: waText, delay: 1200 }),
            });
            waOk = r.ok;
          } catch { /* no evo config */ }
        }
        await supabaseAdmin.from("notifications").insert({
          user_id: user.id, canal: "whatsapp", template, payload_json: payload,
          status: waOk ? "sent" : "error",
          sent_at: waOk ? new Date().toISOString() : null,
        });
        results.whatsapp = waOk;
      }
    }

    return json({ ok: true, results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return json({ error: message }, 500);
  }
});
