import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const { data: { user }, error: authErr } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (authErr || !user) return json({ error: "Unauthorized" }, 401);

  const { data: roleData } = await supabase
    .from("user_roles").select("role").eq("user_id", user.id).single();
  if (!roleData || roleData.role !== "admin") return json({ error: "Forbidden" }, 403);

  const { job_role_nome, job_role_descricao } = await req.json();
  if (!job_role_nome) return json({ error: "job_role_nome required" }, 400);

  // Get OpenAI key from vault via registry
  const { data: keyReg } = await supabase
    .from("api_keys_registry").select("vault_secret_id, is_active").eq("service_name", "openai").maybeSingle();

  if (!keyReg?.is_active) {
    return json({ error: "Chave OpenAI não configurada. Configure em Admin → Chaves de API." }, 400);
  }

  const { data: openaiKey } = await supabase.rpc("vault_read_secret", { p_id: keyReg.vault_secret_id });

  if (!openaiKey) {
    return json({ error: "Não foi possível ler a chave OpenAI." }, 400);
  }

  const prompt = `Você é um especialista em Saúde e Segurança no Trabalho (SST) brasileiro com profundo conhecimento das Normas Regulamentadoras (NRs) do Ministério do Trabalho e Emprego.

Para o cargo "${job_role_nome}"${job_role_descricao ? ` — ${job_role_descricao}` : ""}, indique quais Normas Regulamentadoras brasileiras são obrigatórias ou fortemente recomendadas.

Responda APENAS com JSON válido neste formato exato:
{
  "nrs": [
    {
      "numero": "NR-35",
      "obrigatorio": true,
      "justificativa": "Trabalho em altura acima de 2 metros é inerente ao cargo de acordo com a NR-35 (Portaria MTE 313/2012)."
    }
  ]
}

Inclua entre 3 e 8 NRs. Priorize as obrigatórias por lei. Seja específico na justificativa.`;

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!aiRes.ok) {
    const errBody = await aiRes.text();
    console.error("OpenAI error:", errBody);
    return json({ error: "Falha ao consultar OpenAI" }, 502);
  }

  const aiBody = await aiRes.json();
  const content = aiBody.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(content);
    return json(parsed);
  } catch {
    return json({ error: "Resposta inválida da IA" }, 502);
  }
});
