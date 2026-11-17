import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Plus, Loader2, AlertCircle, CheckCircle2, Clock, ExternalLink, Download,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/sst-docs")({ component: SSTDocsPage });

interface SSTDoc {
  id: string; tipo: string; nome: string; versao: string | null;
  arquivo_url: string | null; validade: string | null; vigente: boolean;
  responsavel_nome: string | null; responsavel_crea: string | null;
  observacoes: string | null; created_at: string;
}

const TIPO_INFO: Record<string, { label: string; desc: string; cor: string }> = {
  PGR:   { label: "PGR",   desc: "Programa de Gerenciamento de Riscos (NR-1)",        cor: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
  PCMSO: { label: "PCMSO", desc: "Programa de Controle Médico de Saúde Ocupacional (NR-7)", cor: "bg-green-500/10 text-green-700 border-green-500/30" },
  LTCAT: { label: "LTCAT", desc: "Laudo Técnico das Condições Ambientais do Trabalho", cor: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  PPP:   { label: "PPP",   desc: "Perfil Profissiográfico Previdenciário (eSocial)",  cor: "bg-purple-500/10 text-purple-700 border-purple-500/30" },
  AET:   { label: "AET",   desc: "Análise Ergonômica do Trabalho (NR-17)",           cor: "bg-orange-500/10 text-orange-700 border-orange-500/30" },
  SPCT:  { label: "SPCT",  desc: "Serviço Especializado em Segurança e Medicina",    cor: "bg-red-500/10 text-red-700 border-red-500/30" },
  LIPE:  { label: "LIPE",  desc: "Laudo de Insalubridade/Periculosidade",            cor: "bg-rose-500/10 text-rose-700 border-rose-500/30" },
  outro: { label: "Outro", desc: "Documento SST diverso",                            cor: "bg-gray-500/10 text-gray-700 border-gray-500/30" },
};

function isVencido(validade: string | null): boolean {
  if (!validade) return false;
  return new Date(validade) < new Date();
}

function isExpirando(validade: string | null): boolean {
  if (!validade) return false;
  const diff = new Date(validade).getTime() - Date.now();
  return diff > 0 && diff < 60 * 86400_000;
}

function NovoDocDialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void;
}) {
  const [tipo, setTipo] = useState("PGR");
  const [nome, setNome] = useState("");
  const [versao, setVersao] = useState("");
  const [validade, setValidade] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [crea, setCrea] = useState("");
  const [arquivoUrl, setArquivoUrl] = useState("");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setTipo("PGR"); setNome(""); setVersao(""); setValidade(""); setResponsavel(""); setCrea(""); setArquivoUrl(""); setObs(""); };

  const submit = async () => {
    if (!nome.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    const { error } = await (supabase.from as any)("sst_documentos").insert({
      tipo, nome: nome.trim(), versao: versao.trim() || null,
      validade: validade || null,
      responsavel_nome: responsavel.trim() || null,
      responsavel_crea: crea.trim() || null,
      arquivo_url: arquivoUrl.trim() || null,
      observacoes: obs.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Documento registrado");
    reset(); onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Novo Documento SST</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo <span className="text-destructive">*</span></Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_INFO).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label} — {v.desc.split(" (")[0].slice(0, 30)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Versão / Revisão</Label>
              <Input value={versao} onChange={(e) => setVersao(e.target.value)} placeholder="Ex: Rev. 03 / 2026" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Nome do documento <span className="text-destructive">*</span></Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: PGR 2026 — Fábrica Unidade I" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Responsável técnico</Label>
              <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome do profissional" />
            </div>
            <div className="space-y-1.5">
              <Label>CREA / Registro</Label>
              <Input value={crea} onChange={(e) => setCrea(e.target.value)} placeholder="Ex: CREA 123456/SP" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Validade / Revisão prevista</Label>
              <Input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>URL do arquivo</Label>
              <Input value={arquivoUrl} onChange={(e) => setArquivoUrl(e.target.value)} placeholder="https://…" type="url" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Escopo, localidade, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !nome.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : "Registrar documento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SSTDocsPage() {
  const [docs, setDocs] = useState<SSTDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState("all");

  const load = async () => {
    const { data } = await (supabase.from as any)("sst_documentos")
      .select("*")
      .order("tipo")
      .order("created_at", { ascending: false });
    setDocs(data ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const filtered = docs.filter((d) => filterTipo === "all" || d.tipo === filterTipo);
  const vencidos = docs.filter((d) => isVencido(d.validade)).length;
  const expirando = docs.filter((d) => isExpirando(d.validade)).length;

  // Group by tipo
  const grouped = filtered.reduce<Record<string, SSTDoc[]>>((acc, doc) => {
    if (!acc[doc.tipo]) acc[doc.tipo] = [];
    acc[doc.tipo].push(doc);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">SST</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Documentos SST</h1>
          <p className="text-sm text-text-secondary mt-1">
            PGR, PCMSO, LTCAT, PPP, AET e demais documentos obrigatórios
          </p>
        </div>
        <Button variant="lp-primary" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />Novo documento
        </Button>
      </div>

      {(vencidos > 0 || expirando > 0) && (
        <div className="space-y-2">
          {vencidos > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                <strong>{vencidos}</strong> documento{vencidos > 1 ? "s" : ""} vencido{vencidos > 1 ? "s" : ""} — atualize imediatamente para evitar autuação
              </p>
            </div>
          )}
          {expirando > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                <strong>{expirando}</strong> documento{expirando > 1 ? "s" : ""} a vencer em 60 dias
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filtrar tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(TIPO_INFO).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-text-tertiary self-center">{filtered.length} documento{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([tipo, items]) => {
            const info = TIPO_INFO[tipo] ?? TIPO_INFO.outro;
            return (
              <div key={tipo} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={`${info.cor} border font-mono`}>{info.label}</Badge>
                  <span className="text-xs text-text-tertiary">{info.desc}</span>
                </div>
                <div className="space-y-2">
                  {items.map((doc) => {
                    const v = isVencido(doc.validade);
                    const e = isExpirando(doc.validade);
                    return (
                      <div key={doc.id} className="lp-solid-card p-4 flex items-center gap-4">
                        <FileText className="h-5 w-5 text-text-tertiary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-text-primary">{doc.nome}</div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-text-secondary">
                            {doc.versao && <span>Versão: {doc.versao}</span>}
                            {doc.responsavel_nome && (
                              <span>{doc.responsavel_nome}{doc.responsavel_crea && ` (${doc.responsavel_crea})`}</span>
                            )}
                            {doc.validade && (
                              <span className={`flex items-center gap-1 font-medium ${v ? "text-destructive" : e ? "text-amber-600" : "text-green-600"}`}>
                                {v ? <AlertCircle className="h-3 w-3" /> : e ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                Válido até {new Date(doc.validade).toLocaleDateString("pt-BR")}
                                {v && " — VENCIDO"}
                              </span>
                            )}
                          </div>
                        </div>
                        {!doc.vigente && <Badge variant="outline" className="text-[10px] shrink-0">Obsoleto</Badge>}
                        {doc.arquivo_url && (
                          <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-8 px-2 shrink-0">
                              <Download className="h-3.5 w-3.5 mr-1" />Baixar
                              <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                            </Button>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
              {filterTipo !== "all" ? `Nenhum documento do tipo ${filterTipo} cadastrado.` : "Nenhum documento SST cadastrado."}
            </div>
          )}
        </div>
      )}

      <NovoDocDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={load} />
    </div>
  );
}
