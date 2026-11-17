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

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const { data: { user }, error: authErr } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (authErr || !user) return json({ error: "Unauthorized" }, 401);

  const { data: roleData } = await supabase
    .from("user_roles").select("role").eq("user_id", user.id).single();
  if (!roleData || roleData.role !== "admin") return json({ error: "Forbidden" }, 403);

  // Parse body
  const { nrs, titulo, descricao } = await req.json() as {
    nrs: string[];
    titulo: string;
    descricao: string;
  };

  if (!nrs || nrs.length === 0) return json({ error: "nrs array required" }, 400);

  // Fetch full NR content from catalog
  const { data: nrsData } = await supabase
    .from("nrs_catalog" as never)
    .select("numero, titulo, descricao, objetivo, conteudo_programatico, publico_alvo, requisitos, ementa_padrao")
    .in("numero", nrs)
    .eq("vigente", true);

  const nrItems = (nrsData ?? []) as Array<{
    numero: string;
    titulo: string;
    descricao: string;
    objetivo: string | null;
    conteudo_programatico: string | null;
    publico_alvo: string | null;
    requisitos: string | null;
    ementa_padrao: string | null;
  }>;

  // Build NR context for the prompt
  const nrContext = nrItems.map((nr) => {
    const parts = [`NR: ${nr.numero} — ${nr.titulo}`, `Descrição: ${nr.descricao}`];
    if (nr.objetivo) parts.push(`Objetivo: ${nr.objetivo}`);
    if (nr.publico_alvo) parts.push(`Público-alvo: ${nr.publico_alvo}`);
    if (nr.conteudo_programatico) parts.push(`Conteúdo programático:\n${nr.conteudo_programatico}`);
    if (nr.requisitos) parts.push(`Requisitos legais: ${nr.requisitos}`);
    return parts.join("\n");
  }).join("\n\n---\n\n");

  // Get OpenAI key from vault
  const { data: keyReg } = await supabase
    .from("api_keys_registry").select("vault_secret_id, is_active").eq("service_name", "openai").maybeSingle();

  if (!keyReg?.is_active) {
    return json({ error: "Chave OpenAI não configurada. Configure em Admin → Chaves de API." }, 400);
  }

  const { data: openaiKey } = await supabase.rpc("vault_read_secret", { p_id: keyReg.vault_secret_id });

  if (!openaiKey) {
    return json({ error: "Não foi possível ler a chave OpenAI." }, 400);
  }

  const prompt = `Você é um especialista em Saúde e Segurança no Trabalho (SST) e instrutor sênior de cursos de NRs com mais de 20 anos de experiência. Sua tarefa é criar uma ementa profissional, persuasiva e completa para um curso de treinamento em NRs.

INFORMAÇÕES DO CURSO:
- Título: ${titulo || "(não definido)"}
- NRs abordadas: ${nrs.join(", ")}
- Descrição atual (use como base, mas melhore): ${descricao || "(vazia)"}

CONTEÚDO DAS NRs:
${nrContext}

INSTRUÇÕES:
- Escreva a ementa em português brasileiro, tom profissional e acessível
- A ementa deve ter entre 3 e 5 parágrafos
- Primeiro parágrafo: apresentação do curso, sua relevância legal e contexto da norma
- Parágrafos intermediários: principais temas abordados, destacando aspectos práticos e legais
- Último parágrafo: o que o participante estará apto a fazer ao concluir (outcomes)
- Mencione os números das NRs, portarias e exigências legais relevantes
- Use linguagem que convença gestores de RH e SST da importância do treinamento
- Não use marcadores ou listas — apenas parágrafos corridos
- Não inclua cabeçalhos ou títulos

Responda APENAS com o texto da ementa, sem explicações adicionais.`;

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });

  if (!aiRes.ok) {
    const errBody = await aiRes.text();
    console.error("OpenAI error:", errBody);
    return json({ error: "Falha ao consultar OpenAI" }, 502);
  }

  const aiBody = await aiRes.json();
  const ementa = aiBody.choices?.[0]?.message?.content?.trim();

  if (!ementa) {
    return json({ error: "Resposta inválida da IA" }, 502);
  }

  return json({ ementa });
});
