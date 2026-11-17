import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND = rgb(0.24, 0.39, 0.89); // brand blue
const DARK  = rgb(0.09, 0.09, 0.12);
const MID   = rgb(0.38, 0.38, 0.45);
const LIGHT = rgb(0.88, 0.91, 0.97);

const MODALIDADE: Record<string, string> = {
  ead: "EAD — Online",
  presencial: "Presencial",
  hibrido: "Híbrido",
};

function ptCenter(page: ReturnType<PDFDocument["addPage"]>, text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, size: number, y: number, color = DARK) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - w) / 2, y, font, size, color });
}

function fmt(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const { token } = await req.json() as { token: string };
    if (!token) return json({ error: "token obrigatório" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Check cache
    const { data: existing } = await supabase
      .from("certificates")
      .select("pdf_url, qr_token")
      .eq("qr_token", token)
      .maybeSingle();

    if (!existing) return json({ error: "certificado não encontrado" }, 404);
    if (existing.pdf_url) return json({ pdf_url: existing.pdf_url });

    // Fetch full certificate data via RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (supabase.rpc as any)("get_certificate", { p_token: token });
    const c = rows?.[0];
    if (!c) return json({ error: "dados não encontrados" }, 404);

    // Build PDF — A4 landscape (842 × 595 pts)
    const pdfDoc  = await PDFDocument.create();
    const page    = pdfDoc.addPage([842, 595]);
    const W = page.getWidth();
    const H = page.getHeight();

    const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const reg    = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Outer border
    page.drawRectangle({ x: 18, y: 18, width: W - 36, height: H - 36, borderColor: BRAND, borderWidth: 2 });
    // Inner accent line
    page.drawRectangle({ x: 24, y: 24, width: W - 48, height: H - 48, borderColor: LIGHT, borderWidth: 1 });
    // Left color bar
    page.drawRectangle({ x: 18, y: 18, width: 10, height: H - 36, color: BRAND });

    // Header: CERTIFICADO DE CONCLUSÃO
    ptCenter(page, "CERTIFICADO DE CONCLUSÃO", bold, 22, H - 72, BRAND);

    // Divider
    page.drawLine({ start: { x: 44, y: H - 88 }, end: { x: W - 44, y: H - 88 }, color: LIGHT, thickness: 1 });

    // "Certifica-se que"
    ptCenter(page, "Certifica-se que", italic, 13, H - 120, MID);

    // Student name
    const nomeTxt = (c.aluno_nome as string).toUpperCase();
    ptCenter(page, nomeTxt, bold, 28, H - 168, DARK);

    // CPF sub
    if (c.aluno_cpf) {
      ptCenter(page, `CPF: ${c.aluno_cpf}`, reg, 10, H - 190, MID);
    }

    // "concluiu com êxito o treinamento"
    ptCenter(page, "concluiu com êxito o treinamento", italic, 13, H - 220, MID);

    // Course title
    const cursoLines = splitText(c.curso_titulo as string, bold, 20, W - 120);
    let cy = H - 258;
    for (const line of cursoLines) {
      ptCenter(page, line, bold, 20, cy, DARK);
      cy -= 26;
    }

    // Details row: NR | Carga | Modalidade
    const details: string[] = [];
    if (c.nr_codigos?.length) details.push((c.nr_codigos as string[]).join(" · "));
    if (c.carga_horaria_horas) details.push(`${c.carga_horaria_horas}h`);
    if (c.modalidade) details.push(MODALIDADE[c.modalidade as string] ?? c.modalidade as string);
    if (details.length) {
      ptCenter(page, details.join("   ·   "), reg, 11, cy - 20, MID);
    }

    // Divider
    const divY = 190;
    page.drawLine({ start: { x: 44, y: divY }, end: { x: W - 44, y: divY }, color: LIGHT, thickness: 1 });

    // Dates
    const emitido = fmt(c.emitido_at as string);
    const valido  = c.expires_at ? fmt(c.expires_at as string) : "Sem validade";
    page.drawText(`Emitido em: ${emitido}`, { x: 44, y: 165, font: reg, size: 11, color: MID });
    const validoTxt = `Válido até: ${valido}`;
    const validoW   = reg.widthOfTextAtSize(validoTxt, 11);
    page.drawText(validoTxt, { x: W - 44 - validoW, y: 165, font: reg, size: 11, color: MID });

    // Certificate number
    if (c.numero_certificado) {
      ptCenter(page, `Nº ${c.numero_certificado}`, bold, 10, 148, BRAND);
    }

    // Divider
    page.drawLine({ start: { x: 44, y: 132 }, end: { x: W - 220, y: 132 }, color: LIGHT, thickness: 1 });

    // Instructor / CNPJ (left)
    let sigY = 112;
    if (c.instrutor_nome) {
      page.drawText(c.instrutor_nome as string, { x: 44, y: sigY, font: bold, size: 11, color: DARK });
      sigY -= 16;
      if (c.instrutor_habilitacao) {
        page.drawText(c.instrutor_habilitacao as string, { x: 44, y: sigY, font: reg, size: 9, color: MID });
        sigY -= 14;
      } else {
        page.drawText("Responsável Técnico", { x: 44, y: sigY, font: reg, size: 9, color: MID });
        sigY -= 14;
      }
    }
    if (c.cnpj_empresa) {
      page.drawText(`CNPJ: ${c.cnpj_empresa}`, { x: 44, y: sigY, font: reg, size: 9, color: MID });
    }

    // QR code (right side) — fetch from qrserver
    const appUrl = Deno.env.get("APP_URL") ?? "https://learn-shine-hub-61.lovable.app";
    const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${appUrl}/certificado/${token}`)}`;
    try {
      const qrRes  = await fetch(qrUrl);
      const qrBuf  = await qrRes.arrayBuffer();
      const qrImg  = await pdfDoc.embedPng(new Uint8Array(qrBuf));
      page.drawImage(qrImg, { x: W - 160, y: 44, width: 100, height: 100 });
      page.drawText("Verificar autenticidade", { x: W - 168, y: 36, font: reg, size: 8, color: MID });
    } catch { /* QR optional */ }

    // Footer
    page.drawText(`${appUrl}/certificado/${token}`, { x: 44, y: 30, font: reg, size: 8, color: MID });

    const pdfBytes = await pdfDoc.save();

    // SHA-256 hash for authenticity verification
    const hashBuffer = await crypto.subtle.digest("SHA-256", pdfBytes);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

    // Embed hash in footer (truncated for display)
    page.drawText(`SHA-256: ${hashHex.slice(0, 32)}…`, { x: 44, y: 18, font: reg, size: 7, color: MID });

    const pdfBytesFinal = await pdfDoc.save();

    // Upload to storage
    const storagePath = `certs/${token}.pdf`;
    const { error: upErr } = await supabase.storage
      .from("public")
      .upload(storagePath, pdfBytesFinal, { contentType: "application/pdf", upsert: true });

    if (upErr) return json({ error: upErr.message }, 500);

    const { data: { publicUrl } } = supabase.storage.from("public").getPublicUrl(storagePath);

    await supabase.from("certificates").update({ pdf_url: publicUrl, pdf_hash: hashHex }).eq("qr_token", token);

    return json({ pdf_url: publicUrl, pdf_hash: hashHex });
  } catch (err: unknown) {
    return json({ error: err instanceof Error ? err.message : "Erro interno" }, 500);
  }
});

function splitText(text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, size: number, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxW) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}
