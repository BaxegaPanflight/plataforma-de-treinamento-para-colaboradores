import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Send, Clock, CheckCircle2, AlertCircle, Ban, Loader2, RefreshCw, FileCode2, Eye, Plus,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/esocial")({ component: ESocialPage });

interface QueueItem {
  id: string; evento: string; status: string; prazo_envio: string | null;
  protocolo: string | null; erro_msg: string | null; enviado_em: string | null;
  created_at: string; xml_gerado: string | null;
  profiles: { nome: string } | null;
  courses: { titulo: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendente:      { label: "Pendente",       color: "text-amber-600",    icon: Clock },
  processando:   { label: "Processando",    color: "text-blue-600",     icon: Loader2 },
  enviado:       { label: "Enviado",        color: "text-green-600",    icon: CheckCircle2 },
  erro:          { label: "Erro",           color: "text-destructive",  icon: AlertCircle },
  nao_aplicavel: { label: "N/A",            color: "text-text-tertiary", icon: Ban },
};

const EVENTO_INFO: Record<string, { desc: string; prazo: string }> = {
  "S-2210": { desc: "Comunicação de Acidente de Trabalho (CAT)", prazo: "1 dia útil" },
  "S-2220": { desc: "Monitoramento da Saúde do Trabalhador (ASO)", prazo: "até o dia 15 do mês seguinte" },
  "S-2240": { desc: "Condições Ambientais do Trabalho", prazo: "até o dia 15 do mês seguinte" },
  "S-2245": { desc: "Treinamentos, Capacitações e Exercícios Simulados", prazo: "15 dias após conclusão" },
};

function isPrazoVencendo(prazo: string | null): boolean {
  if (!prazo) return false;
  const diff = new Date(prazo).getTime() - Date.now();
  return diff > 0 && diff < 3 * 86400_000;
}

function isPrazoVencido(prazo: string | null): boolean {
  if (!prazo) return false;
  return new Date(prazo) < new Date();
}

function XMLViewer({ xml, onClose }: { xml: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><FileCode2 className="h-4 w-4" />XML Gerado</DialogTitle></DialogHeader>
        <pre className="flex-1 overflow-auto text-xs font-mono bg-muted rounded-lg p-4 whitespace-pre-wrap break-all">{xml}</pre>
      </DialogContent>
    </Dialog>
  );
}

function CATDialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void;
}) {
  const [profiles, setProfiles] = useState<{ id: string; nome: string }[]>([]);
  const [userId, setUserId] = useState("");
  const [dataAcidente, setDataAcidente] = useState(new Date().toISOString().slice(0, 10));
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("tipico");
  const [afastamento, setAfastamento] = useState(false);
  const [diasAfastamento, setDiasAfastamento] = useState("0");
  const [cid10, setCid10] = useState("");
  const [medicoNome, setMedicoNome] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from("profiles").select("id, nome").order("nome")
        .then(({ data }) => setProfiles((data ?? []) as { id: string; nome: string }[]));
    } else {
      setUserId(""); setLocal(""); setDescricao(""); setTipo("tipico");
      setAfastamento(false); setDiasAfastamento("0"); setCid10(""); setMedicoNome("");
      setDataAcidente(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  const submit = async () => {
    if (!userId || !local.trim() || !descricao.trim()) return toast.error("Colaborador, local e descrição obrigatórios");
    setSaving(true);
    const { error } = await (supabase.from as any)("cats").insert({
      user_id: userId, data_acidente: dataAcidente, local_acidente: local.trim(),
      descricao: descricao.trim(), tipo, afastamento,
      dias_afastamento: afastamento ? Number(diasAfastamento) || 0 : 0,
      cid10: cid10.trim() || null, medico_nome: medicoNome.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("CAT registrada — evento S-2210 criado na fila eSocial");
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Registrar CAT — S-2210</DialogTitle></DialogHeader>
        <p className="text-xs text-amber-700 bg-amber-500/10 rounded p-2 border border-amber-500/30">
          A CAT cria automaticamente um evento S-2210 na fila eSocial com prazo de 1 dia útil.
        </p>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Colaborador <span className="text-destructive">*</span></Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data do acidente</Label>
              <Input type="date" value={dataAcidente} onChange={(e) => setDataAcidente(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tipico">Típico (trabalho)</SelectItem>
                  <SelectItem value="trajeto">Trajeto</SelectItem>
                  <SelectItem value="doenca_ocupacional">Doença ocupacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Local do acidente <span className="text-destructive">*</span></Label>
            <Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex: Setor de produção — linha 3" />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição <span className="text-destructive">*</span></Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} placeholder="Descreva o acidente, causa e parte atingida…" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="afastamento" checked={afastamento} onChange={(e) => setAfastamento(e.target.checked)} className="h-4 w-4 accent-accent-primary" />
            <Label htmlFor="afastamento" className="cursor-pointer">Houve afastamento</Label>
            {afastamento && (
              <Input type="number" min={0} value={diasAfastamento} onChange={(e) => setDiasAfastamento(e.target.value)} placeholder="Dias" className="w-20 h-8 text-sm" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>CID-10</Label>
              <Input value={cid10} onChange={(e) => setCid10(e.target.value)} placeholder="Ex: S60.0" />
            </div>
            <div className="space-y-1.5">
              <Label>Médico assistente</Label>
              <Input value={medicoNome} onChange={(e) => setMedicoNome(e.target.value)} placeholder="Nome" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !userId || !local.trim() || !descricao.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : "Registrar CAT"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ESocialPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEvento, setFilterEvento] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingXml, setViewingXml] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [catDialogOpen, setCatDialogOpen] = useState(false);

  const load = async () => {
    const { data } = await (supabase.from as any)("esocial_queue")
      .select("*, profiles:user_id(nome), enrollments:enrollment_id(courses:course_id(titulo))")
      .order("created_at", { ascending: false })
      .limit(300);
    // flatten courses from enrollment
    const rows: QueueItem[] = (data ?? []).map((r: any) => ({
      ...r,
      courses: r.enrollments?.courses ?? null,
    }));
    setQueue(rows);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const filtered = queue.filter((q) => {
    if (filterEvento !== "all" && q.evento !== filterEvento) return false;
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    return true;
  });

  const pendentes = queue.filter((q) => q.status === "pendente").length;
  const erros = queue.filter((q) => q.status === "erro").length;
  const prazosCriticos = queue.filter((q) => q.status === "pendente" && (isPrazoVencido(q.prazo_envio) || isPrazoVencendo(q.prazo_envio))).length;

  const generateXml = async (id: string) => {
    setGeneratingId(id);
    const { data, error } = await supabase.functions.invoke("generate-esocial-xml", { body: { queue_id: id } });
    setGeneratingId(null);
    if (error) return toast.error(`Erro ao gerar XML: ${error.message}`);
    if (data?.error) return toast.error(data.error);
    toast.success("XML gerado com sucesso");
    load();
  };

  const markSent = async (id: string) => {
    setMarkingId(id);
    const { error } = await (supabase.from as any)("esocial_queue")
      .update({ status: "enviado", enviado_em: new Date().toISOString() })
      .eq("id", id);
    setMarkingId(null);
    if (error) return toast.error(error.message);
    toast.success("Marcado como enviado");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">SST</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">eSocial SST</h1>
          <p className="text-sm text-text-secondary mt-1">
            Fila de eventos SST — S-2210, S-2220, S-2240, S-2245
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCatDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />Registrar CAT
          </Button>
          <Button variant="outline" size="sm" onClick={() => load()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />Atualizar
          </Button>
        </div>
      </div>

      <DisclaimerBanner title="Requer configuração pelo cliente">
        Esta plataforma <strong>gera os XMLs</strong> dos eventos SST (S-2210, S-2220, S-2240, S-2245) no leiaute oficial do eSocial.
        A <strong>transmissão efetiva ao governo</strong> é de responsabilidade do contratante e requer:
        (1) certificado digital e-CNPJ ICP-Brasil (A1 ou A3) para assinatura dos XMLs;
        (2) cadastro ativo do CNPJ no portal eSocial;
        (3) envio via webservice da Receita Federal ou TSS (transmissor autorizado).
        Consulte seu contador ou departamento de TI para configurar o fluxo de transmissão.
      </DisclaimerBanner>

      {/* Evento descriptions */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(EVENTO_INFO).map(([ev, info]) => {
          const count = queue.filter((q) => q.evento === ev && q.status === "pendente").length;
          return (
            <div key={ev} className="lp-solid-card p-4 flex gap-3">
              <Badge className="font-mono shrink-0 mt-0.5 h-fit">{ev}</Badge>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-text-primary">{info.desc}</div>
                <div className="text-xs text-text-tertiary mt-0.5">Prazo: {info.prazo}</div>
              </div>
              {count > 0 && <Badge variant="secondary" className="shrink-0 h-fit">{count} pendente{count > 1 ? "s" : ""}</Badge>}
            </div>
          );
        })}
      </div>

      {(prazosCriticos > 0 || erros > 0) && (
        <div className="space-y-2">
          {prazosCriticos > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                <strong>{prazosCriticos}</strong> evento{prazosCriticos > 1 ? "s" : ""} com prazo crítico — envie imediatamente para evitar multas
              </p>
            </div>
          )}
          {erros > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700"><strong>{erros}</strong> evento{erros > 1 ? "s com erros precisam de atenção" : " com erro precisa de atenção"}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Select value={filterEvento} onValueChange={setFilterEvento}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Evento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {["S-2210","S-2220","S-2240","S-2245"].map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-text-tertiary self-center">
          {pendentes} pendente{pendentes !== 1 ? "s" : ""} · {queue.length} total
        </div>
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
      ) : (
        <div className="lp-solid-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border-subtle">
              <tr className="text-xs text-text-tertiary uppercase tracking-widest">
                <th className="text-left p-4 font-medium">Evento</th>
                <th className="text-left p-4 font-medium">Colaborador</th>
                <th className="text-left p-4 font-medium">Treinamento</th>
                <th className="text-left p-4 font-medium">Prazo</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((item) => {
                const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pendente;
                const vencido = isPrazoVencido(item.prazo_envio);
                const vencendo = isPrazoVencendo(item.prazo_envio);
                return (
                  <tr key={item.id} className="hover:bg-muted/10">
                    <td className="p-4">
                      <Badge className="font-mono">{item.evento}</Badge>
                    </td>
                    <td className="p-4 text-text-secondary">{item.profiles?.nome ?? "—"}</td>
                    <td className="p-4 text-text-secondary text-xs max-w-[200px] truncate">
                      {item.courses?.titulo ?? "—"}
                    </td>
                    <td className="p-4">
                      {item.prazo_envio ? (
                        <span className={`text-xs font-medium ${vencido ? "text-destructive" : vencendo ? "text-amber-600" : "text-text-secondary"}`}>
                          {new Date(item.prazo_envio).toLocaleDateString("pt-BR")}
                          {vencido && " ⚠ VENCIDO"}
                        </span>
                      ) : <span className="text-text-tertiary text-xs">—</span>}
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-xs font-medium ${sc.color}`}>
                        <sc.icon className="h-3 w-3" />{sc.label}
                      </span>
                      {item.erro_msg && <p className="text-[10px] text-destructive mt-0.5 max-w-[200px] truncate">{item.erro_msg}</p>}
                      {item.protocolo && <p className="text-[10px] text-text-tertiary mt-0.5">Prot: {item.protocolo}</p>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {item.xml_gerado ? (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setViewingXml(item.xml_gerado)}>
                            <Eye className="h-3 w-3 mr-1" />XML
                          </Button>
                        ) : item.status === "pendente" && (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={generatingId === item.id} onClick={() => generateXml(item.id)}>
                            {generatingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileCode2 className="h-3 w-3 mr-1" />}
                            Gerar XML
                          </Button>
                        )}
                        {item.status === "pendente" && (
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={markingId === item.id} onClick={() => markSent(item.id)}>
                            {markingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                            Enviado
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-text-tertiary text-sm">Nenhum evento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewingXml && <XMLViewer xml={viewingXml} onClose={() => setViewingXml(null)} />}
      <CATDialog open={catDialogOpen} onOpenChange={setCatDialogOpen} onCreated={load} />
    </div>
  );
}
