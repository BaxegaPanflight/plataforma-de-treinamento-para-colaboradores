import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, Plus, Loader2, AlertCircle, CheckCircle2, Clock, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/aso")({ component: ASOPage });

interface ASO {
  id: string; user_id: string; tipo: string; data_exame: string;
  validade_ate: string | null; resultado: string; medico_nome: string | null;
  crm: string | null; cargo_avaliado: string | null;
  arquivo_url: string | null; observacoes: string | null; created_at: string;
  profiles: { nome: string; email: string } | null;
}

const TIPO_LABELS: Record<string, string> = {
  admissional: "Admissional", periodico: "Periódico",
  retorno: "Retorno ao trabalho", mudanca_funcao: "Mudança de função", demissional: "Demissional",
};

const RESULTADO_LABELS: Record<string, { label: string; color: string }> = {
  apto: { label: "Apto", color: "text-green-600" },
  apto_com_restricoes: { label: "Apto c/ restrições", color: "text-amber-600" },
  inapto: { label: "Inapto", color: "text-destructive" },
};

function isVencido(validade: string | null): boolean {
  if (!validade) return false;
  return new Date(validade) < new Date();
}

function isExpirando(validade: string | null): boolean {
  if (!validade) return false;
  const diff = new Date(validade).getTime() - Date.now();
  return diff > 0 && diff < 30 * 86400_000;
}

function NovoASODialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void;
}) {
  const [profiles, setProfiles] = useState<{ id: string; nome: string; email: string }[]>([]);
  const [userId, setUserId] = useState("");
  const [tipo, setTipo] = useState("periodico");
  const [dataExame, setDataExame] = useState(new Date().toISOString().slice(0, 10));
  const [validadeAte, setValidadeAte] = useState("");
  const [resultado, setResultado] = useState("apto");
  const [medicoNome, setMedicoNome] = useState("");
  const [crm, setCrm] = useState("");
  const [cargo, setCargo] = useState("");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from("profiles").select("id, nome, email").order("nome")
        .then(({ data }) => setProfiles((data ?? []) as { id: string; nome: string; email: string }[]));
    } else {
      setUserId(""); setTipo("periodico"); setDataExame(new Date().toISOString().slice(0, 10));
      setValidadeAte(""); setResultado("apto"); setMedicoNome(""); setCrm(""); setCargo(""); setObs("");
    }
  }, [open]);

  const submit = async () => {
    if (!userId || !dataExame) return toast.error("Colaborador e data do exame obrigatórios");
    setSaving(true);
    const { error } = await (supabase.from as any)("asos").insert({
      user_id: userId, tipo, data_exame: dataExame,
      validade_ate: validadeAte || null,
      resultado, medico_nome: medicoNome.trim() || null,
      crm: crm.trim() || null, cargo_avaliado: cargo.trim() || null,
      observacoes: obs.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("ASO registrado");
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Novo ASO</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Colaborador <span className="text-destructive">*</span></Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome} <span className="text-text-tertiary text-xs">({p.email})</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo de exame</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Resultado</Label>
              <Select value={resultado} onValueChange={setResultado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apto">Apto</SelectItem>
                  <SelectItem value="apto_com_restricoes">Apto com restrições</SelectItem>
                  <SelectItem value="inapto">Inapto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data do exame <span className="text-destructive">*</span></Label>
              <Input type="date" value={dataExame} onChange={(e) => setDataExame(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Validade até</Label>
              <Input type="date" value={validadeAte} onChange={(e) => setValidadeAte(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Médico responsável</Label>
              <Input value={medicoNome} onChange={(e) => setMedicoNome(e.target.value)} placeholder="Nome do médico" />
            </div>
            <div className="space-y-1.5">
              <Label>CRM</Label>
              <Input value={crm} onChange={(e) => setCrm(e.target.value)} placeholder="Ex: 12345/SP" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Cargo avaliado</Label>
            <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Técnico de Segurança" />
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Restrições, encaminhamentos, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !userId || !dataExame}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : "Registrar ASO"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ASOPage() {
  const [asos, setAsos] = useState<ASO[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "vencidos" | "expirando">("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    const { data } = await (supabase.from as any)("asos")
      .select("*, profiles:user_id(nome, email)")
      .order("data_exame", { ascending: false });
    setAsos(data ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const filtered = asos.filter((a) => {
    const nome = a.profiles?.nome?.toLowerCase() ?? "";
    const email = a.profiles?.email?.toLowerCase() ?? "";
    const q = search.toLowerCase();
    if (q && !nome.includes(q) && !email.includes(q)) return false;
    if (filterStatus === "vencidos" && !isVencido(a.validade_ate)) return false;
    if (filterStatus === "expirando" && !isExpirando(a.validade_ate)) return false;
    return true;
  });

  const vencidos = asos.filter((a) => isVencido(a.validade_ate)).length;
  const expirando = asos.filter((a) => isExpirando(a.validade_ate)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">SST</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Atestados de Saúde Ocupacional</h1>
          <p className="text-sm text-text-secondary mt-1">Controle de ASOs por colaborador — exigência do PCMSO (NR-7)</p>
        </div>
        <Button variant="lp-primary" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />Novo ASO
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total de ASOs", value: asos.length, icon: Stethoscope, color: "text-accent-primary" },
          { label: "Vencidos", value: vencidos, icon: AlertCircle, color: "text-destructive" },
          { label: "A vencer (30d)", value: expirando, icon: Clock, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="lp-solid-card p-5 flex items-center gap-4">
            <Icon className={`h-8 w-8 ${color}`} />
            <div>
              <div className="text-2xl font-bold text-text-primary">{value}</div>
              <div className="text-xs text-text-tertiary">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar colaborador…" />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os ASOs</SelectItem>
            <SelectItem value="vencidos">Apenas vencidos</SelectItem>
            <SelectItem value="expirando">A vencer em 30d</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
      ) : (
        <div className="lp-solid-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border-subtle">
              <tr className="text-xs text-text-tertiary uppercase tracking-widest">
                <th className="text-left p-4 font-medium">Colaborador</th>
                <th className="text-left p-4 font-medium">Tipo</th>
                <th className="text-left p-4 font-medium">Data exame</th>
                <th className="text-left p-4 font-medium">Validade</th>
                <th className="text-left p-4 font-medium">Resultado</th>
                <th className="text-left p-4 font-medium">Médico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((a) => {
                const v = isVencido(a.validade_ate);
                const e = isExpirando(a.validade_ate);
                const res = RESULTADO_LABELS[a.resultado];
                return (
                  <tr key={a.id} className="hover:bg-muted/10">
                    <td className="p-4">
                      <div className="font-medium text-text-primary">{a.profiles?.nome ?? "—"}</div>
                      <div className="text-xs text-text-tertiary">{a.profiles?.email ?? ""}</div>
                    </td>
                    <td className="p-4 text-text-secondary">{TIPO_LABELS[a.tipo] ?? a.tipo}</td>
                    <td className="p-4 text-text-secondary">{new Date(a.data_exame).toLocaleDateString("pt-BR")}</td>
                    <td className="p-4">
                      {a.validade_ate ? (
                        <span className={`flex items-center gap-1 text-xs font-medium ${v ? "text-destructive" : e ? "text-amber-600" : "text-green-600"}`}>
                          {v ? <AlertCircle className="h-3 w-3" /> : e ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                          {new Date(a.validade_ate).toLocaleDateString("pt-BR")}
                          {v && " — VENCIDO"}
                        </span>
                      ) : <span className="text-text-tertiary text-xs">—</span>}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-medium ${res?.color ?? ""}`}>{res?.label ?? a.resultado}</span>
                    </td>
                    <td className="p-4 text-text-secondary text-xs">
                      {a.medico_nome ?? "—"}
                      {a.crm && <span className="text-text-tertiary ml-1">({a.crm})</span>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-text-tertiary text-sm">
                  {search || filterStatus !== "all" ? "Nenhum ASO encontrado com os filtros aplicados." : "Nenhum ASO registrado."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <NovoASODialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={load} />
    </div>
  );
}
