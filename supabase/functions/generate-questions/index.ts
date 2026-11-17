import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { course_id } = await req.json();
    if (!course_id) throw new Error("course_id obrigatório");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: cors });
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401, headers: cors });

    const { data: roleRow } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id).single();
    if (!["admin", "gestor"].includes(roleRow?.role ?? "")) return new Response("Forbidden", { status: 403, headers: cors });

    const { data: mods } = await supabaseAdmin.from("modules").select("id").eq("course_id", course_id);
    const modIds = (mods ?? []).map((m: { id: string }) => m.id);
    let content = "";
    if (modIds.length) {
      const { data: lessons } = await supabaseAdmin
        .from("lessons").select("titulo, rich_lessons(conteudo_html)").in("module_id", modIds).eq("tipo", "rich_text");
      for (const l of (lessons ?? []) as Array<{ titulo: string; rich_lessons: Array<{ conteudo_html: string }> | null }>) {
        const html = l.rich_lessons?.[0]?.conteudo_html ?? "";
        const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (text) content += `\n## ${l.titulo}\n${text}`;
      }
    }

    if (!content) {
      return new Response(JSON.stringify({ error: "Nenhum conteúdo de texto encontrado no curso. Adicione aulas do tipo Texto Rico primeiro." }), {
        status: 422, headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    const { data: registry } = await supabaseAdmin.from("api_keys_registry")
      .select("vault_secret_id, is_active").eq("service_name", "openai").maybeSingle();
    if (!registry?.is_active) throw new Error("Chave OpenAI não configurada. Configure em Admin → Chaves de API.");

    const { data: openaiKey } = await supabaseAdmin.rpc("vault_read_secret", { p_id: registry.vault_secret_id });
    if (!openaiKey) throw new Error("Não foi possível ler a chave OpenAI.");

    const prompt = `Você é um especialista em criação de avaliações. Com base no conteúdo abaixo, crie 15 questões de múltipla escolha.

CONTEÚDO:
${content.slice(0, 8000)}

REGRAS:
- Cada questão deve ter exatamente 4 alternativas
- Apenas 1 alternativa correta por questão
- Nível: "facil", "medio" ou "dificil"
- Retorne APENAS o JSON, sem explicações

FORMATO:
{
  "questions": [
    {
      "enunciado": "...",
      "nivel": "facil|medio|dificil",
      "alternatives": [
        { "texto": "...", "correta": true },
        { "texto": "...", "correta": false },
        { "texto": "...", "correta": false },
        { "texto": "...", "correta": false }
      ]
    }
  ]
}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!aiRes.ok) throw new Error(`OpenAI error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    const parsed = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});