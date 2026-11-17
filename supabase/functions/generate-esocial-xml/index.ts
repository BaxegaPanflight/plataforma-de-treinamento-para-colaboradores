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
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authErr || !user) return json({ error: "Unauthorized" }, 401);

  const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();
  if (!roleData || !["admin", "gestor"].includes(roleData.role)) return json({ error: "Forbidden" }, 403);

  const { queue_id } = await req.json();
  if (!queue_id) return json({ error: "queue_id obrigatório" }, 400);

  const { data: qRow } = await (supabase.from as any)("esocial_queue")
    .select(`
      *,
      profiles:user_id (nome, cpf, telefone),
      asos:aso_id (tipo, data_exame, resultado, medico_nome, crm, cargo_avaliado),
      enrollments:enrollment_id (
        courses:course_id (titulo, nr_codigo, carga_horaria_horas, instrutor_nome, instrutor_habilitacao)
      )
    `)
    .eq("id", queue_id)
    .single();

  if (!qRow) return json({ error: "Evento não encontrado" }, 404);

  const { data: branding } = await supabase.from("branding").select("cnpj, razao_social").single();
  const cnpj = (branding?.cnpj ?? "00000000000191").replace(/\D/g, "").padStart(14, "0");
  const razaoSocial = branding?.razao_social ?? "Empresa";
  const cpf = (qRow.profiles?.cpf ?? "00000000000").replace(/\D/g, "").padStart(11, "0");
  const nome = qRow.profiles?.nome ?? "Colaborador";
  const perApur = new Date().toISOString().slice(0, 7);
  const tpAmb = "2";

  let xml = "";

  switch (qRow.evento) {
    case "S-2245": {
      const course = qRow.enrollments?.courses;
      const dtConc = qRow.payload_json?.data_conclusao ?? new Date().toISOString().slice(0, 10);
      const qtdHrs = course?.carga_horaria_horas ?? 0;
      const nrCodigos: string[] = course?.nr_codigo ?? [];

      xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtTreiCap/v_S_01_00_00"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <evtTreiCap>
    <ideEvento>
      <indRetif>1</indRetif>
      <perApur>${perApur}</perApur>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>1.0.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpj}</nrInsc>
    </ideEmpregador>
    <ideVinculo>
      <cpfTrab>${cpf}</cpfTrab>
    </ideVinculo>
    <treiCap>
      <codTrein>${nrCodigos.length > 0 ? "00001" : "00002"}</codTrein>
      <dtTrein>${dtConc}</dtTrein>
      <qtdHrsTrein>${Number(qtdHrs).toFixed(0)}</qtdHrsTrein>
      <nrInscInstEns>
        <tpInsc>1</tpInsc>
        <nrInsc>${cnpj}</nrInsc>
      </nrInscInstEns>${course?.instrutor_nome ? `
      <cpfRespTrein>${cpf}</cpfRespTrein>` : ""}${nrCodigos.map((nr) => `
      <atividade>
        <codAtiv>${nr.replace("NR-", "").padStart(4, "0")}</codAtiv>
      </atividade>`).join("")}
    </treiCap>
  </evtTreiCap>
</eSocial>`;
      break;
    }

    case "S-2220": {
      const aso = qRow.asos;
      const TIPO_EXAME: Record<string, string> = {
        admissional: "0",
        periodico: "1",
        retorno: "2",
        mudanca_funcao: "3",
        demissional: "9",
      };
      const tpExame = TIPO_EXAME[aso?.tipo ?? "periodico"] ?? "1";
      const dtExm = aso?.data_exame ?? new Date().toISOString().slice(0, 10);
      const crm = (aso?.crm ?? "000000SP").replace(/\D/g, "");
      const crmUf = (aso?.crm ?? "SP").replace(/[^A-Z]/gi, "").toUpperCase().slice(-2) || "SP";

      xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtMonit/v_S_01_00_00"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <evtMonit>
    <ideEvento>
      <indRetif>1</indRetif>
      <perApur>${perApur}</perApur>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>1.0.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpj}</nrInsc>
    </ideEmpregador>
    <ideVinculo>
      <cpfTrab>${cpf}</cpfTrab>
    </ideVinculo>
    <exMedOcup>
      <tpExame>${tpExame}</tpExame>
      <dtExm>${dtExm}</dtExm>
      <ordExame>1</ordExame>
      <dtRetAtiv>${dtExm}</dtRetAtiv>
      <indResultado>${aso?.resultado === "apto" ? "1" : aso?.resultado === "apto_com_restricoes" ? "2" : "3"}</indResultado>
      <respMonit>
        <cpfResp>${cpf}</cpfResp>
        <consClasse>CRM</consClasse>
        <numCRM>${crm || "000000"}</numCRM>
        <ufCRM>${crmUf}</ufCRM>
      </respMonit>
    </exMedOcup>
  </evtMonit>
</eSocial>`;
      break;
    }

    case "S-2210": {
      const catId = qRow.payload_json?.cat_id;
      let catData: any = null;
      if (catId) {
        const { data } = await (supabase.from as any)("cats").select("*").eq("id", catId).single();
        catData = data;
      }
      const dtAcid = catData?.data_acidente ?? new Date().toISOString().slice(0, 10);
      const TIPO_CAT: Record<string, string> = { tipico: "1", trajeto: "3", doenca_ocupacional: "2" };
      const tpCat = TIPO_CAT[catData?.tipo ?? "tipico"] ?? "1";

      xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtCat/v_S_01_00_00"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <evtCat>
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>1.0.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpj}</nrInsc>
    </ideEmpregador>
    <ideVinculo>
      <cpfTrab>${cpf}</cpfTrab>
    </ideVinculo>
    <cat>
      <dtAcid>${dtAcid}</dtAcid>
      <tpCat>${tpCat}</tpCat>
      <localAcid>
        <tpLocal>${catData?.tipo === "trajeto" ? "2" : "1"}</tpLocal>
        <dscLocal>${(catData?.local_acidente ?? "Não informado").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</dscLocal>
      </localAcid>
      <partAtingExt>
        <codParteAting>99</codParteAting>
        <lad>0</lad>
      </partAtingExt>
      <agentCausador>
        <codAgntCausador>099</codAgntCausador>
      </agentCausador>
      <atestado>
        <dtAtestado>${dtAcid}</dtAtestado>
        <indAfast>${catData?.afastamento ? "1" : "0"}</indAfast>
        <dscLesao>99</dscLesao>
        <diagProvavel>${catData?.descricao?.slice(0, 100)?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") ?? "Acidente de trabalho"}</diagProvavel>
        ${catData?.cid10 ? `<codCID>${catData.cid10}</codCID>` : ""}
        <durTrat>0</durTrat>
        <indAcidTransito>${catData?.tipo === "trajeto" ? "S" : "N"}</indAcidTransito>
        <medico>
          <nmMed>${(catData?.medico_nome ?? "Não informado").replace(/&/g, "&amp;")}</nmMed>
          <nrCRM>${(catData?.crm ?? "000000").replace(/\D/g, "") || "000000"}</nrCRM>
          <ufCRM>SP</ufCRM>
        </medico>
      </atestado>
    </cat>
  </evtCat>
</eSocial>`;
      break;
    }

    case "S-2240": {
      const descricao = qRow.payload_json?.descricao ?? "Exposição a agentes de risco";
      const setor = qRow.payload_json?.setor ?? "Produção";

      xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtExpRisco/v_S_01_00_00"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <evtExpRisco>
    <ideEvento>
      <indRetif>1</indRetif>
      <perApur>${perApur}</perApur>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>1.0.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpj}</nrInsc>
    </ideEmpregador>
    <ideVinculo>
      <cpfTrab>${cpf}</cpfTrab>
    </ideVinculo>
    <infoExpRisco>
      <dtIniCondicao>${perApur}-01</dtIniCondicao>
      <localAmb>
        <tpLocal>1</tpLocal>
        <dscSetor>${setor.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</dscSetor>
      </localAmb>
      <infoAtiv>
        <dscAtivDes>${descricao.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 999)}</dscAtivDes>
      </infoAtiv>
    </infoExpRisco>
  </evtExpRisco>
</eSocial>`;
      break;
    }

    default:
      return json({ error: `Evento ${qRow.evento} não suportado para geração de XML` }, 400);
  }

  await (supabase.from as any)("esocial_queue")
    .update({ xml_gerado: xml, status: "processando" })
    .eq("id", queue_id);

  return json({ xml, queue_id });
});
