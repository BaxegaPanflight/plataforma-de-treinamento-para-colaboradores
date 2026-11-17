import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Plus, Loader2, CheckCircle2, AlertTriangle, Clock, XCircle, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/pt-apr")({ component: PtAprPage });

interface PtApr {
  id: string; tipo: string; nr_ref: string | null; titulo: string;
  solicitante_id: string | null; local_trabalho: string | null;
  descricao_atividade: string | null; riscos_identificados: string | null;
  medidas_controle: string | null; status: string;
  bloqueado_vencimento: boolean; data_inicio: string | null; data_fim: string | null;
  created_at: string;
  profiles: { nome: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  aberto:    { label: "Aberto",    color: "text-blue-600",    icon: Clock },
  aprovado:  { label: "Aprovado",  color: "text-green-600",   icon: CheckCircle2 },
  encerrado: { label: "Encerrado", color: "text-text-tertiary", icon: XCircle },
  cancelado: { label: "Cancelado", color: "text-destructive",  icon: XCircle },
};

const NR_REFS = ["NR-10","NR-11","NR-12","NR-13","NR-33","NR-35","NR-36","Outro"];

function NovoPtAprDialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void;
}) {
  const [profiles, setProfiles] = useState<{ id: string; nome: string }[]>([]);
  const [tipo, setTipo] = useState("PT");
  const [nrRef, setNrRef] = useState("");
  const [titulo, setTitulo] = useState("");
  const [solicitanteId, setSolicitanteId] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [riscos, setRiscos] = useState("");
  const [medidas, setMedidas] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from("profiles").select("id, nome").order("nome")
        .then(({ data }) => setProfiles((data ?? []) as { id: string; nome: string }[]));
    } else {
      setTipo("PT"); setNrRef(""); setTitulo(""); setSolicitanteId(""); setLocal("");
      setDescricao(""); setRiscos(""); setMedidas(""); setDataInicio(""); setDataFim("");
    }
  }, [open]);

  const submit = async () => {
    if (!titulo.trim()) return toast.error("Título obrigatório");
    setSaving(true);
    const { error } = await (supabase.from as any)("pt_apr").insert({
      tipo, nr_ref: nrRef || null, titulo: titulo.trim(),
      solicitante_id: solicitanteId || null,
      local_trabalho: local.trim() || null,
      descricao_atividade: descricao.trim() || null,
      riscos_identificados: riscos.trim() || null,
      medidas_controle: medidas.trim() || null,
      data_inicio: dataInicio || null,
      data_fim: dataFim || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${tipo} criada`);
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nova {tipo}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PT">PT — Permissão de Trabalho</SelectItem>
                  <SelectItem value="APR">APR — Análise de Risco</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>NR de referência</Label>
              <Select value={nrRef} onValueChange={setNrRef}>
                <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
                <SelectContent>
                  {NR_REFS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Solicitante</Label>
              <Select value={solicitanteId} onValueChange={setSolicitanteId}>
                <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Título <span className="text-destructive">*</span></Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: PT-NR10-2026-001 — Manutenção painel elétrico" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Local de trabalho</Label>
            <Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex: Sala elétrica — Bloco A" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data fim prevista</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição da atividade</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} placeholder="Descreva o serviço a ser executado…" />
          </div>
          <div className="space-y-1.5">
            <Label>Riscos identificados</Label>
            <Textarea value={riscos} onChange={(e) => setRiscos(e.target.value)} rows={3} placeholder="Ex: Choque elétrico, queda de altura, arco elétrico…" />
          </div>
          <div className="space-y-1.5">
            <Label>Medidas de controle</Label>
            <Textarea value={medidas} onChange={(e) => setMedidas(e.target.value)} rows={3} placeholder="Ex: Desenergização e bloqueio LOTO, uso de EPI classe II…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !titulo.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : `Criar ${tipo}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PtAprPage() {
  const [items, setItems] = useState<PtApr[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTipo, setFilterTipo] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<PtApr | null>(null);

  const load = async () => {
    const { data } = await (supabase.from as any)("pt_apr")
      .select("*, profiles:solicitante_id(nome)")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase.from as any)("pt_apr").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    load();
    setSelected(null);
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    if (q && !i.titulo.toLowerCase().includes(q) && !(i.local_trabalho ?? "").toLowerCase().includes(q)) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (filterTipo !== "all" && i.tipo !== filterTipo) return false;
    return true;
  });

  const abertos = items.filter((i) => i.status === "aberto").length;
  const bloqueados = items.filter((i) => i.bloqueado_vencimento).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">SST</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">PT / APR</h1>
          <p className="text-sm text-text-secondary mt-1">Permissões de Trabalho e Análises de Risco — NR-10, NR-12, NR-33, NR-35</p>
        </div>
        <Button variant="lp-primary" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />Nova PT/APR
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: items.length, icon: ClipboardList, color: "text-accent-primary" },
          { label: "Em aberto", value: abertos, icon: Clock, color: "text-blue-600" },
          { label: "Bloqueadas por vencimento", value: bloqueados, icon: AlertTriangle, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="lp-solid-card p-5 flex items-center gap-4">
            <Icon className={`h-8 w-8 ${color}`} />
            <div><div className="text-2xl font-bold text-text-primary">{value}</div><div className="text-xs text-text-tertiary">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar por título ou local…" />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PT">PT</SelectItem>
            <SelectItem value="APR">APR</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.aberto;
            return (
              <div key={item.id} className="lp-solid-card p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/10" onClick={() => setSelected(item)}>
                <Badge className="shrink-0 font-mono">{item.tipo}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-text-primary">{item.titulo}</div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-text-tertiary">
                    {item.nr_ref && <span>{item.nr_ref}</span>}
                    {item.local_trabalho && <span>{item.local_trabalho}</span>}
                    {item.profiles?.nome && <span>{item.profiles.nome}</span>}
                    {item.data_inicio && <span>{new Date(item.data_inicio).toLocaleDateString("pt-BR")}</span>}
                  </div>
                </div>
                {item.bloqueado_vencimento && (
                  <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 shrink-0">
                    <AlertTriangle className="h-3 w-3 mr-1" />Bloqueada
                  </Badge>
                )}
                <span className={`flex items-center gap-1 text-xs font-medium shrink-0 ${sc.color}`}>
                  <sc.icon className="h-3 w-3" />{sc.label}
                </span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">Nenhuma PT/APR encontrada.</div>
          )}
        </div>
      )}

      {/* Detail dialog */}
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge className="font-mono">{selected.tipo}</Badge>
                <DialogTitle className="text-base">{selected.titulo}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              {selected.nr_ref && <div><span className="text-text-tertiary">NR: </span>{selected.nr_ref}</div>}
              {selected.local_trabalho && <div><span className="text-text-tertiary">Local: </span>{selected.local_trabalho}</div>}
              {selected.profiles?.nome && <div><span className="text-text-tertiary">Solicitante: </span>{selected.profiles.nome}</div>}
              {selected.data_inicio && <div><span className="text-text-tertiary">Período: </span>{new Date(selected.data_inicio).toLocaleDateString("pt-BR")}{selected.data_fim && ` — ${new Date(selected.data_fim).toLocaleDateString("pt-BR")}`}</div>}
              {selected.descricao_atividade && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Descrição da atividade</div>
                  <p className="whitespace-pre-line leading-relaxed">{selected.descricao_atividade}</p>
                </div>
              )}
              {selected.riscos_identificados && (
                <div className="space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <div className="text-xs font-semibold uppercase tracking-widest text-amber-600">Riscos identificados</div>
                  <p className="whitespace-pre-line leading-relaxed">{selected.riscos_identificados}</p>
                </div>
              )}
              {selected.medidas_controle && (
                <div className="space-y-1 rounded-lg border border-green-500/30 bg-green-500/5 p-3">
                  <div className="text-xs font-semibold uppercase tracking-widest text-green-700">Medidas de controle</div>
                  <p className="whitespace-pre-line leading-relaxed">{selected.medidas_controle}</p>
                </div>
              )}
            </div>
            {selected.status === "aberto" && (
              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => updateStatus(selected.id, "cancelado")} className="text-destructive border-destructive/30 hover:bg-destructive/5">Cancelar PT/APR</Button>
                <Button variant="outline" size="sm" onClick={() => updateStatus(selected.id, "encerrado")}>Encerrar</Button>
                <Button variant="lp-primary" size="sm" onClick={() => updateStatus(selected.id, "aprovado")}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Aprovar
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}

      <NovoPtAprDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={load} />
    </div>
  );
}
