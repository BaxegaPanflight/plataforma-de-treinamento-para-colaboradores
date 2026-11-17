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
import { Brain, Plus, Loader2, AlertTriangle, CheckCircle2, Clock, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/riscos-psicossociais")({ component: RiscosPsicossociaisPage });

interface Risco {
  id: string; setor: string; descricao: string; fator: string;
  probabilidade: string; severidade: string; medidas_controle: string | null;
  responsavel: string | null; prazo: string | null; status: string; created_at: string;
}

const FATOR_LABELS: Record<string, string> = {
  carga_trabalho: "Carga de trabalho excessiva",
  pressao_tempo: "Pressão por tempo/metas",
  conflito_papel: "Conflito ou ambiguidade de papel",
  falta_autonomia: "Falta de autonomia/controle",
  violencia_assedio: "Violência/assédio moral ou sexual",
  relacionamento_interpessoal: "Relacionamento interpessoal",
  inseguranca_emprego: "Insegurança no emprego",
  trabalho_emocional: "Trabalho emocional intenso",
  jornada_excessiva: "Jornada excessiva/turnos",
  outro: "Outro fator",
};

const NIVEL_COLOR: Record<string, string> = {
  baixa:     "text-green-600",
  media:     "text-amber-600",
  alta:      "text-orange-600",
  muito_alta: "text-destructive",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  identificado:   { label: "Identificado",   color: "text-amber-600",   icon: AlertTriangle },
  em_tratamento:  { label: "Em tratamento",  color: "text-blue-600",    icon: Clock },
  controlado:     { label: "Controlado",     color: "text-green-600",   icon: CheckCircle2 },
  monitorando:    { label: "Monitorando",    color: "text-text-secondary", icon: Clock },
};

function getRiscoLevel(prob: string, sev: string): "critico" | "alto" | "medio" | "baixo" {
  if (prob === "alta" && (sev === "alta" || sev === "muito_alta")) return "critico";
  if (prob === "alta" || sev === "alta" || sev === "muito_alta") return "alto";
  if (prob === "media" || sev === "media") return "medio";
  return "baixo";
}

function NovoRiscoDialog({ open, onOpenChange, onCreated, editing }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void; editing?: Risco | null;
}) {
  const [setor, setSetor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fator, setFator] = useState("carga_trabalho");
  const [probabilidade, setProbabilidade] = useState("media");
  const [severidade, setSeveridade] = useState("media");
  const [medidas, setMedidas] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [prazo, setPrazo] = useState("");
  const [status, setStatus] = useState("identificado");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setSetor(editing.setor); setDescricao(editing.descricao); setFator(editing.fator);
      setProbabilidade(editing.probabilidade); setSeveridade(editing.severidade);
      setMedidas(editing.medidas_controle ?? ""); setResponsavel(editing.responsavel ?? "");
      setPrazo(editing.prazo ?? ""); setStatus(editing.status);
    } else if (!open) {
      setSetor(""); setDescricao(""); setFator("carga_trabalho"); setProbabilidade("media");
      setSeveridade("media"); setMedidas(""); setResponsavel(""); setPrazo(""); setStatus("identificado");
    }
  }, [open, editing]);

  const submit = async () => {
    if (!setor.trim() || !descricao.trim()) return toast.error("Setor e descrição obrigatórios");
    setSaving(true);
    const payload = {
      setor: setor.trim(), descricao: descricao.trim(), fator, probabilidade, severidade,
      medidas_controle: medidas.trim() || null, responsavel: responsavel.trim() || null,
      prazo: prazo || null, status,
    };
    const { error } = editing
      ? await (supabase.from as any)("riscos_psicossociais").update(payload).eq("id", editing.id)
      : await (supabase.from as any)("riscos_psicossociais").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Risco atualizado" : "Risco registrado");
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Editar Risco" : "Registrar Risco Psicossocial"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Setor <span className="text-destructive">*</span></Label>
              <Input value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Ex: Produção, Vendas…" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Fator psicossocial</Label>
              <Select value={fator} onValueChange={setFator}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FATOR_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição do risco <span className="text-destructive">*</span></Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} placeholder="Descreva o risco identificado…" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Probabilidade</Label>
              <Select value={probabilidade} onValueChange={setProbabilidade}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Severidade</Label>
              <Select value={severidade} onValueChange={setSeveridade}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="muito_alta">Muito alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Medidas de controle / intervenção</Label>
            <Textarea value={medidas} onChange={(e) => setMedidas(e.target.value)} rows={3} placeholder="Ações para reduzir ou eliminar o risco…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome do gestor responsável" />
            </div>
            <div className="space-y-1.5">
              <Label>Prazo de tratamento</Label>
              <Input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !setor.trim() || !descricao.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : (editing ? "Salvar" : "Registrar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RiscosPsicossociaisPage() {
  const [riscos, setRiscos] = useState<Risco[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Risco | null>(null);

  const load = async () => {
    const { data } = await (supabase.from as any)("riscos_psicossociais").select("*").order("created_at", { ascending: false });
    setRiscos(data ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const filtered = riscos.filter((r) => {
    const q = search.toLowerCase();
    if (q && !r.setor.toLowerCase().includes(q) && !r.descricao.toLowerCase().includes(q)) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const criticos = riscos.filter((r) => getRiscoLevel(r.probabilidade, r.severidade) === "critico" && r.status !== "controlado").length;
  const altos = riscos.filter((r) => getRiscoLevel(r.probabilidade, r.severidade) === "alto" && r.status !== "controlado").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">NR-1 / 2026</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Riscos Psicossociais</h1>
          <p className="text-sm text-text-secondary mt-1">
            Inventário de riscos psicossociais — exigência da NR-1 revisada (vigência maio/2026)
          </p>
        </div>
        <Button variant="lp-primary" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />Registrar risco
        </Button>
      </div>

      <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3">
        <p className="text-sm text-blue-700">
          <strong>NR-1 revisada</strong> — A partir de maio/2026 toda empresa deve incluir riscos psicossociais no GRO/PGR. Este inventário documenta a conformidade com a nova exigência.
        </p>
      </div>

      {(criticos > 0 || altos > 0) && (
        <div className="flex gap-3">
          {criticos > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-2 flex-1">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive"><strong>{criticos}</strong> risco{criticos > 1 ? "s" : ""} crítico{criticos > 1 ? "s" : ""} sem controle</p>
            </div>
          )}
          {altos > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center gap-2 flex-1">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700"><strong>{altos}</strong> risco{altos > 1 ? "s" : ""} alto{altos > 1 ? "s" : ""} em aberto</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar por setor ou descrição…" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
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
          {filtered.map((r) => {
            const nivel = getRiscoLevel(r.probabilidade, r.severidade);
            const sc = STATUS_CONFIG[r.status];
            const nivelLabels = { critico: "Crítico", alto: "Alto", medio: "Médio", baixo: "Baixo" };
            const nivelColors = { critico: "border-destructive/40 text-destructive", alto: "border-orange-500/40 text-orange-600", medio: "border-amber-500/40 text-amber-600", baixo: "border-green-500/40 text-green-600" };
            return (
              <div key={r.id} className="lp-solid-card p-4 flex items-start gap-4 cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => { setEditing(r); setDialogOpen(true); }}>
                <Brain className="h-4 w-4 text-accent-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-text-primary">{r.setor}</span>
                    <Badge variant="outline" className={`text-[10px] ${nivelColors[nivel]}`}>{nivelLabels[nivel]}</Badge>
                    <Badge variant="outline" className="text-[10px]">{FATOR_LABELS[r.fator] ?? r.fator}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{r.descricao}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-text-tertiary">
                    <span className={NIVEL_COLOR[r.probabilidade]}>Prob: {r.probabilidade}</span>
                    <span className={NIVEL_COLOR[r.severidade]}>Sev: {r.severidade}</span>
                    {r.responsavel && <span>Resp: {r.responsavel}</span>}
                    {r.prazo && <span>Prazo: {new Date(r.prazo).toLocaleDateString("pt-BR")}</span>}
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium shrink-0 ${sc.color}`}>
                  <sc.icon className="h-3 w-3" />{sc.label}
                </span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
              {search || filterStatus !== "all" ? "Nenhum risco encontrado." : "Nenhum risco psicossocial registrado. Inicie o inventário para conformidade com a NR-1."}
            </div>
          )}
        </div>
      )}

      <NovoRiscoDialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }} onCreated={load} editing={editing} />
    </div>
  );
}
