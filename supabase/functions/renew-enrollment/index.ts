import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const { course_id } = await req.json() as { course_id: string };
    if (!course_id) return json({ error: "course_id obrigatório" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, status, courses(validade_meses, titulo)")
      .eq("course_id", course_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!enr) return json({ error: "Matrícula não encontrada" }, 404);
    if (enr.status !== "vencido") return json({ error: "Matrícula não está vencida" }, 400);

    const course = enr.courses as { validade_meses: number; titulo: string };
    const meses = course.validade_meses ?? 12;
    const newDue = new Date();
    newDue.setMonth(newDue.getMonth() + meses);
    const dueDateStr = newDue.toISOString().slice(0, 10);

    await supabase.from("enrollments").update({ status: "ativo", due_date: dueDateStr }).eq("id", enr.id);
    await supabase.from("lesson_progress").delete().eq("enrollment_id", enr.id);

    await supabase.from("notifications").insert({
      user_id: user.id, course_id, canal: "inapp", template: "matricula_realizada",
      payload_json: { curso: course.titulo },
      status: "sent", sent_at: new Date().toISOString(), lida: false,
    });

    return json({ ok: true, due_date: dueDateStr });
  } catch (err: unknown) {
    return json({ error: err instanceof Error ? err.message : "Erro interno" }, 500);
  }
});
