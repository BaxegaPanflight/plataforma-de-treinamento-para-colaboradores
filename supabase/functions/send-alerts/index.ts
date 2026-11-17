import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Days before expiry that trigger an alert
const ALERT_DAYS = [30, 15, 7, 0];

interface Profile { id: string; nome: string; email: string; telefone: string | null }
interface Course  { id: string; titulo: string }
interface EnrollRow {
  id: string;
  due_date: string;
  course_id: string;
  user_id: string;
  profiles: Profile | null;
  courses:  Course  | null;
}

interface EvoConfig { url: string; instance: string; key: string }

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : "55" + digits;
}

function dateStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function buildWhatsAppText(nome: string, curso: string, days: number, due: string): string {
  const fmtDue = new Date(due + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  if (days === 0) {
    return `🚨 Olá ${nome}! Seu treinamento *${curso}* venceu hoje. Acesse a plataforma e renove sua matrícula para manter a conformidade NR.`;
  }
  return `⚠️ Olá ${nome}! Seu treinamento *${curso}* vence em *${days} dia${days > 1 ? "s" : ""}* (${fmtDue}). Acesse a plataforma para continuar ou renovar.`;
}

function buildEmailHtml(nome: string, curso: string, days: number, due: string): { subject: string; html: string } {
  const fmtDue = new Date(due + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  if (days === 0) {
    return {
      subject: `⚠️ Treinamento vencido hoje: ${curso}`,
      html: `<h2>Olá, ${nome}!</h2><p>Seu treinamento <strong>${curso}</strong> venceu <strong>hoje</strong>. Acesse a plataforma imediatamente para renovar sua matrícula e manter a conformidade com as normas NR.</p>`,
    };
  }
  return {
    subject: `Lembrete: ${curso} vence em ${days} dia${days > 1 ? "s" : ""}`,
    html: `<h2>Olá, ${nome}!</h2><p>Seu treinamento <strong>${curso}</strong> vence em <strong>${days} dia${days > 1 ? "s" : ""}</strong> (${fmtDue}). Acesse a plataforma para continuar ou renovar.</p>`,
  };
}

serve(async (req) => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Verify cron token against the Vault secret provisioned by the migration
  // (never an env secret — env secrets make the remix agent ask for keys via chat)
  const cronKey = req.headers.get("x-cron-key");
  const { data: cronSecret } = await supabase.rpc("vault_read_secret_by_name", {
    p_name: "lms_cron_secret",
  });
  if (!cronSecret || cronKey !== cronSecret) {
    return new Response("Forbidden", { status: 403 });
  }

  // Resolve Resend key
  let resendKey: string | null = null;
  const { data: resendRow } = await supabase.from("api_keys_registry").select("vault_secret_id, is_active").eq("service_name", "resend").maybeSingle();
  if (resendRow?.is_active) {
    const { data } = await supabase.rpc("vault_read_secret", { p_id: resendRow.vault_secret_id });
    resendKey = data ?? null;
  }

  // Resolve Evolution API config
  let evoConfig: EvoConfig | null = null;
  const { data: evoRow } = await supabase.from("api_keys_registry").select("vault_secret_id, is_active").eq("service_name", "evolution_api").maybeSingle();
  if (evoRow?.is_active) {
    const { data } = await supabase.rpc("vault_read_secret", { p_id: evoRow.vault_secret_id });
    try { evoConfig = JSON.parse(data ?? "null"); } catch { /* ignore */ }
  }

  const fromName = Deno.env.get("APP_NAME") ?? "LMS";
  const fromAddr = Deno.env.get("RESEND_FROM") ?? "onboarding@resend.dev";

  let sent = 0, skipped = 0, errors = 0;

  for (const days of ALERT_DAYS) {
    const targetDate = dateStr(days);

    const { data: expiring } = await supabase
      .from("enrollments")
      .select("id, due_date, course_id, user_id, profiles:user_id(id, nome, email, telefone), courses:course_id(id, titulo)")
      .eq("due_date", targetDate)
      .in("status", ["ativo", "expirando"]) as { data: EnrollRow[] | null };

    for (const enr of expiring ?? []) {
      const profile = enr.profiles;
      const course  = enr.courses;
      if (!profile || !course) continue;

      const template = days === 0 ? "treinamento_vencido" : "treinamento_vencendo";

      // Dedup: skip if already sent today
      const today = dateStr(0);
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("template", template)
        .eq("course_id", enr.course_id)
        .gte("created_at", today + "T00:00:00Z");

      if ((count ?? 0) > 0) { skipped++; continue; }

      const channels: string[] = [];

      // WhatsApp via Evolution API
      if (evoConfig && profile.telefone) {
        const phone = formatPhone(profile.telefone);
        const text  = buildWhatsAppText(profile.nome, course.titulo, days, enr.due_date);
        try {
          const evoRes = await fetch(`${evoConfig.url}/message/sendText/${evoConfig.instance}`, {
            method: "POST",
            headers: { "apikey": evoConfig.key, "Content-Type": "application/json" },
            body: JSON.stringify({ number: phone, text, delay: 1200 }),
          });
          if (evoRes.ok) {
            channels.push("whatsapp");
            await supabase.from("notifications").insert({
              user_id: profile.id, course_id: enr.course_id, canal: "whatsapp", template,
              payload_json: { curso: course.titulo, days, due_date: enr.due_date },
              status: "sent", sent_at: new Date().toISOString(),
            });
          }
        } catch { /* continue to email */ }
      }

      // Email via Resend
      if (resendKey) {
        const email = buildEmailHtml(profile.nome, course.titulo, days, enr.due_date);
        try {
          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: `${fromName} <${fromAddr}>`, to: [profile.email], subject: email.subject, html: email.html }),
          });
          if (resendRes.ok) {
            channels.push("email");
            await supabase.from("notifications").insert({
              user_id: profile.id, course_id: enr.course_id, canal: "email", template,
              payload_json: { curso: course.titulo, days, due_date: enr.due_date },
              status: "sent", sent_at: new Date().toISOString(),
            });
          }
        } catch { errors++; }
      }

      // Sempre cria notificação in-app (independente de email/whatsapp)
      await supabase.from("notifications").insert({
        user_id: profile.id, course_id: enr.course_id, canal: "inapp", template,
        payload_json: { curso: course.titulo, days, due_date: enr.due_date },
        status: "sent", sent_at: new Date().toISOString(), lida: false,
      });
      channels.push("inapp");

      if (channels.length > 0) sent++; else errors++;
    }
  }

  return json({ ok: true, sent, skipped, errors });
});
