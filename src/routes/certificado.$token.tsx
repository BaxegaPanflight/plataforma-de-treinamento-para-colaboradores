import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, CheckCircle2, XCircle, Loader2, Shield, Download, Copy, Hash } from "lucide-react";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/certificado/$token")({ component: Verify });

interface CertData {
  qr_token: string;
  emitido_at: string;
  expires_at: string | null;
  curso_titulo: string;
  aluno_nome: string;
  aluno_cpf: string | null;
  nr_codigos: string[] | null;
  carga_horaria_horas: number | null;
  modalidade: string | null;
  instrutor_nome: string | null;
  cnpj_empresa: string | null;
  numero_certificado: string | null;
  pdf_hash: string | null;
}

const MODALIDADE_LABEL: Record<string, string> = {
  ead: "EAD — Online",
  presencial: "Presencial",
  hibrido: "Híbrido",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function Verify() {
  const { token } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertData | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfHash, setPdfHash] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.rpc as any)("get_certificate", { p_token: token }).then(({ data }: { data: CertData[] | null }) => {
      const row = data?.[0] ?? null;
      setCert(row);
      if (row?.pdf_hash) setPdfHash(row.pdf_hash);
      setLoading(false);
    });
  }, [token]);

  const downloadPdf = async () => {
    setPdfLoading(true);
    const { data, error } = await supabase.functions.invoke("generate-certificate-pdf", { body: { token } });
    setPdfLoading(false);
    if (error || !data?.pdf_url) return;
    if (data.pdf_hash) setPdfHash(data.pdf_hash);
    window.open(data.pdf_url, "_blank");
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash).then(() => toast.success("Hash copiado!"));
  };

  return (
    <div className="min-h-screen lp-section-light grid place-items-center p-6">
      <ScrollReveal variant="scale-blur" className="w-full max-w-2xl">
        {loading ? (
          <div className="lp-solid-card p-16 flex items-center justify-center gap-2 text-text-tertiary">
            <Loader2 className="h-5 w-5 animate-spin" /> Verificando certificado…
          </div>
        ) : cert ? (
          <div className="lp-solid-card confetti-card p-8 sm:p-10 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-accent-success/10 text-accent-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Certificado verificado
              </div>
              <Award className="h-14 w-14 mx-auto text-accent-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                Certificado válido
              </h1>
              {cert.nr_codigos?.length ? (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {cert.nr_codigos.map((nr) => (
                    <Badge key={nr} variant="secondary" className="bg-accent-primary/10 text-accent-primary border-accent-primary/20 text-xs font-mono">
                      <Shield className="h-3 w-3 mr-1" />{nr}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Data grid */}
            <div className="grid sm:grid-cols-2 gap-3 text-left">
              <InfoCell label="Aluno" value={cert.aluno_nome} />
              {cert.aluno_cpf && <InfoCell label="CPF" value={cert.aluno_cpf} />}
              <InfoCell label="Curso" value={cert.curso_titulo} span />
              <InfoCell label="Emitido em" value={fmt(cert.emitido_at)} />
              <InfoCell label="Válido até" value={cert.expires_at ? fmt(cert.expires_at) : "Sem validade"} />
              {cert.carga_horaria_horas ? <InfoCell label="Carga horária" value={`${cert.carga_horaria_horas}h`} /> : null}
              {cert.modalidade && <InfoCell label="Modalidade" value={MODALIDADE_LABEL[cert.modalidade] ?? cert.modalidade} />}
              {cert.instrutor_nome && <InfoCell label="Instrutor" value={cert.instrutor_nome} />}
              {cert.cnpj_empresa && <InfoCell label="CNPJ Empresa" value={cert.cnpj_empresa} />}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-border-subtle space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-0.5">
                  {cert.numero_certificado && (
                    <p className="text-xs text-text-tertiary">Nº {cert.numero_certificado}</p>
                  )}
                  <p className="text-xs text-text-tertiary font-mono break-all">{cert.qr_token}</p>
                </div>
                <Button size="sm" variant="outline" onClick={downloadPdf} disabled={pdfLoading}>
                  {pdfLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Baixar PDF
                </Button>
              </div>

              {pdfHash && (
                <div className="rounded-lg bg-bg-surface-1 border border-border-subtle p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                    <Hash className="h-3.5 w-3.5 text-accent-primary" />
                    Assinatura digital SHA-256
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] font-mono text-text-tertiary break-all flex-1">{pdfHash}</code>
                    <button
                      onClick={() => copyHash(pdfHash)}
                      className="shrink-0 p-1 rounded hover:bg-muted/20 text-text-tertiary hover:text-text-primary transition-colors"
                      title="Copiar hash"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-text-tertiary">Gerado no momento da emissão do PDF. Confira no rodapé do documento.</p>
                </div>
              )}
            </div>

            <DisclaimerBanner>
              A verificação acima confirma a <strong>integridade do documento</strong> e sua emissão pela plataforma.
              A <strong>validade jurídica e trabalhista</strong> depende de requisitos definidos pelo contratante:
              qualificação do instrutor conforme a NR aplicável, aderência do conteúdo programático, modalidade permitida
              e registro no eSocial (S-2245). Em caso de auditoria, consulte o SESMT responsável pela emissão.
            </DisclaimerBanner>
          </div>
        ) : (
          <div className="lp-solid-card p-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-destructive/10 text-destructive">
              <XCircle className="h-3.5 w-3.5" /> Certificado inválido
            </div>
            <Award className="h-14 w-14 mx-auto text-text-tertiary" />
            <h1 className="text-2xl font-bold text-text-primary">Token não encontrado</h1>
            <p className="text-sm text-text-secondary">
              Este código não corresponde a nenhum certificado emitido pela plataforma.
            </p>
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}

function InfoCell({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={`rounded-xl bg-bg-surface-1 p-4 border border-border-subtle ${span ? "sm:col-span-2" : ""}`}>
      <div className="text-xs uppercase tracking-widest text-text-tertiary mb-1">{label}</div>
      <div className="text-sm font-semibold text-text-primary">{value}</div>
    </div>
  );
}
