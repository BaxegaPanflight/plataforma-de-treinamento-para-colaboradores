import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND = rgb(0.24, 0.39, 0.89);
const DARK  = rgb(0.09, 0.09, 0.12);
const MID   = rgb(0.45, 0.45, 0.52);
const LIGHT = rgb(0.94, 0.95, 0.98);
const WHITE = rgb(1, 1, 1);

const STATUS_PT: Record<string, string> = {
  concluido:    "Concluído",
  vencido:      "Vencido",
  em_andamento: "Em andamento",
  pendente:     "Pendente",
};

function statusColor(s: string) {
  if (s === "concluido")    return rgb(0.13, 0.77, 0.37);
  if (s === "vencido")      return rgb(0.94, 0.27, 0.27);
  if (s === "em_andamento") return rgb(0.24, 0.39, 0.89);
  return rgb(0.60, 0.60, 0.67);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const datePart = iso.includes("T") ? iso.split("T")[0] : iso;
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function clip(text: string, font: any, size: number, maxW: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxW) return text;
  let t = text;
  while (t.length > 0 && font.widthOfTextAtSize(t + "…", size) > maxW) t = t.slice(0, -1);
  return t + "…";
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

    const body = await req.json() as { nr_filter?: string | null };
    const nrFilter = body.nr_filter ?? null;

    // Fetch branding
    const { data: branding } = await supabase
      .from("branding")
      .select("razao_social, cnpj")
      .limit(1)
      .maybeSingle();

    // Fetch compliance data
    const { data: allRows } = await supabase
      .from("vw_compliance")
      .select("user_id, nome, cargo, setor, nr_codigo, curso_titulo, compliance_status, due_date")
      .order("nome");

    const rows = nrFilter
      ? (allRows ?? []).filter((r) => (r.nr_codigo as string[] | null)?.includes(nrFilter))
      : (allRows ?? []);

    // Compute stats per user
    const byUser = new Map<string, string[]>();
    for (const r of rows) {
      if (!byUser.has(r.user_id ?? "")) byUser.set(r.user_id ?? "", []);
      byUser.get(r.user_id ?? "")!.push(r.compliance_status ?? "pendente");
    }
    const totalUsers   = byUser.size;
    const conformeUsers = [...byUser.values()].filter((ss) => ss.every((s) => s === "concluido")).length;
    const pctOk        = totalUsers > 0 ? Math.round((conformeUsers / totalUsers) * 100) : 0;

    // PDF — A4 portrait 595 × 842
    const pdfDoc = await PDFDocument.create();
    const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const reg    = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const PW = 595, PH = 842;
    const ML = 36, MR = 36, MT = 36, MB = 36;

    // Column widths summing to PW - ML - MR = 523
    const COLS = [
      { header: "Colaborador",   w: 118 },
      { header: "Cargo / Setor", w: 85  },
      { header: "NR",            w: 45  },
      { header: "Treinamento",   w: 138 },
      { header: "Status",        w: 80  },
      { header: "Prazo",         w: 57  },
    ];

    const HEADER_H = 120;
    const COL_H    = 24;
    const ROW_H    = 20;
    const FOOTER_H = 28;

    const firstPageRows = Math.floor((PH - MT - HEADER_H - COL_H - FOOTER_H - MB) / ROW_H);
    const otherPageRows = Math.floor((PH - MT - COL_H - FOOTER_H - MB) / ROW_H);

    const pages: typeof rows[] = [];
    if (rows.length === 0) {
      pages.push([]);
    } else {
      pages.push(rows.slice(0, firstPageRows));
      let i = firstPageRows;
      while (i < rows.length) {
        pages.push(rows.slice(i, i + otherPageRows));
        i += otherPageRows;
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const [ty, tm, td] = today.split("-");
    const todayPt = `${td}/${tm}/${ty}`;

    for (let pi = 0; pi < pages.length; pi++) {
      const page     = pdfDoc.addPage([PW, PH]);
      const pageRows = pages[pi];
      const isFirst  = pi === 0;

      // Header (first page only)
      if (isFirst) {
        page.drawRectangle({ x: 0, y: PH - MT - 6, width: PW, height: 6, color: BRAND });

        const companyName = (branding?.razao_social as string | null) ?? "Empresa";
        page.drawText(companyName, { x: ML, y: PH - MT - 34, font: bold, size: 15, color: DARK });
        if (branding?.cnpj) {
          page.drawText(`CNPJ: ${branding.cnpj as string}`, { x: ML, y: PH - MT - 52, font: reg, size: 10, color: MID });
        }

        const titleText = "RELATÓRIO DE CONFORMIDADE NR";
        const titleW = bold.widthOfTextAtSize(titleText, 12);
        page.drawText(titleText, { x: PW - MR - titleW, y: PH - MT - 34, font: bold, size: 12, color: BRAND });
        const dateText = `Emitido em: ${todayPt}`;
        const dateW = reg.widthOfTextAtSize(dateText, 9);
        page.drawText(dateText, { x: PW - MR - dateW, y: PH - MT - 50, font: reg, size: 9, color: MID });
        if (nrFilter) {
          const nrText = `Filtro: ${nrFilter}`;
          const nrW = reg.widthOfTextAtSize(nrText, 9);
          page.drawText(nrText, { x: PW - MR - nrW, y: PH - MT - 63, font: reg, size: 9, color: MID });
        }

        page.drawLine({ start: { x: ML, y: PH - MT - 76 }, end: { x: PW - MR, y: PH - MT - 76 }, color: LIGHT, thickness: 1 });

        // Stats
        const statY    = PH - MT - 100;
        const statW    = (PW - ML - MR) / 4;
        const stats    = [
          { label: "Colaboradores",  value: String(totalUsers)        },
          { label: "Treinamentos",   value: String(rows.length)       },
          { label: "Em conformidade",value: `${pctOk}%`               },
          { label: "Não conformes",  value: String(totalUsers - conformeUsers) },
        ];
        for (let si = 0; si < stats.length; si++) {
          const sx = ML + si * statW;
          page.drawText(stats[si].value, { x: sx, y: statY,      font: bold, size: 18, color: BRAND });
          page.drawText(stats[si].label, { x: sx, y: statY - 16, font: reg,  size: 8,  color: MID  });
        }

        page.drawLine({ start: { x: ML, y: PH - MT - HEADER_H }, end: { x: PW - MR, y: PH - MT - HEADER_H }, color: LIGHT, thickness: 1 });
      }

      // Column header row
      const tableStartY = isFirst
        ? PH - MT - HEADER_H - COL_H
        : PH - MT - COL_H;

      page.drawRectangle({ x: ML, y: tableStartY, width: PW - ML - MR, height: COL_H, color: BRAND });
      let cx = ML;
      for (const col of COLS) {
        page.drawText(col.header, { x: cx + 4, y: tableStartY + 8, font: bold, size: 8.5, color: WHITE });
        cx += col.w;
      }

      // Data rows
      let ry = tableStartY - ROW_H;
      for (let ri = 0; ri < pageRows.length; ri++) {
        const r  = pageRows[ri];
        const bg = ri % 2 === 0 ? LIGHT : WHITE;
        page.drawRectangle({ x: ML, y: ry, width: PW - ML - MR, height: ROW_H, color: bg });

        cx = ML;
        const rowY = ry + 6;

        // Colaborador
        page.drawText(clip(r.nome ?? "", reg, 9, COLS[0].w - 8), { x: cx + 4, y: rowY, font: reg, size: 9, color: DARK });
        cx += COLS[0].w;

        // Cargo / Setor
        const cargoSetor = [r.cargo, r.setor].filter(Boolean).join(" / ") || "—";
        page.drawText(clip(cargoSetor, reg, 8.5, COLS[1].w - 8), { x: cx + 4, y: rowY, font: reg, size: 8.5, color: MID });
        cx += COLS[1].w;

        // NR
        const nrText = (r.nr_codigo as string[] | null)?.join(", ") ?? "—";
        page.drawText(clip(nrText, bold, 8.5, COLS[2].w - 8), { x: cx + 4, y: rowY, font: bold, size: 8.5, color: BRAND });
        cx += COLS[2].w;

        // Treinamento
        page.drawText(clip(r.curso_titulo ?? "—", reg, 8.5, COLS[3].w - 8), { x: cx + 4, y: rowY, font: reg, size: 8.5, color: DARK });
        cx += COLS[3].w;

        // Status
        const status    = r.compliance_status ?? "pendente";
        const statusTxt = STATUS_PT[status] ?? status;
        page.drawText(clip(statusTxt, bold, 8.5, COLS[4].w - 8), { x: cx + 4, y: rowY, font: bold, size: 8.5, color: statusColor(status) });
        cx += COLS[4].w;

        // Prazo
        page.drawText(fmtDate(r.due_date as string | null), { x: cx + 4, y: rowY, font: reg, size: 8.5, color: MID });

        ry -= ROW_H;
      }

      if (pageRows.length === 0) {
        page.drawText("Nenhum dado encontrado para os filtros selecionados.", {
          x: ML + 4, y: ry + 6, font: reg, size: 10, color: MID,
        });
      }

      // Footer
      page.drawLine({ start: { x: ML, y: MB + FOOTER_H - 4 }, end: { x: PW - MR, y: MB + FOOTER_H - 4 }, color: LIGHT, thickness: 1 });
      page.drawText("Documento gerado automaticamente — uso interno / fiscalização MTE", {
        x: ML, y: MB + 8, font: reg, size: 8, color: MID,
      });
      const pageNumTxt = `Página ${pi + 1} de ${pages.length}`;
      const pnW = reg.widthOfTextAtSize(pageNumTxt, 8);
      page.drawText(pageNumTxt, { x: PW - MR - pnW, y: MB + 8, font: reg, size: 8, color: MID });
    }

    const pdfBytes = await pdfDoc.save();

    // Upload to storage
    const fname = `compliance-${today}-${Date.now()}.pdf`;
    const { error: upErr } = await supabase.storage
      .from("public")
      .upload(`compliance-reports/${fname}`, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (upErr) return json({ error: upErr.message }, 500);

    const { data: { publicUrl } } = supabase.storage.from("public").getPublicUrl(`compliance-reports/${fname}`);
    return json({ pdf_url: publicUrl });

  } catch (err: unknown) {
    return json({ error: err instanceof Error ? err.message : "Erro interno" }, 500);
  }
});
