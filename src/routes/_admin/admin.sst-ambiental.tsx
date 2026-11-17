import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wind, Plus, Loader2, Clock, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/sst-ambiental")({ component: SSTAmbientalPage });

interface QueueRow {
  id: string;
  status: string;
  prazo_envio: string | null;
  xml_gerado: string | null;
  created_at: string;
  payload_json: { setor?: string; agente?: string; descricao?: string; data_inicio?: string } | null;
  profiles: { nome: string } | null;
}

const AGENTES = [
  "Ruído", "Vibração", "Calor", "Frio", "Radiação ionizante",
  "Radiação não-ionizante", "Poeira", "Fumos metálicos",
  "Neblinas / névoas", "Gases e vapores", "Agentes biológicos",
  "Carga química — solventes", "Ergonômico", "Acidente — altura",
  "Acidente — espaço confinado", "Acidente — eletricidade", "Outro",
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendente:    { label: "Pendente",    color: "text-amber-600",   icon: Clock },
  processando: { label: "Processando", color: "text-blue-600",    icon: Loader2 },
  enviado:     { label: "Enviado",     color: "text-green-600",   icon: CheckCircle2 },
  erro:        { label: "Erro",        color: "text-destructive", icon: AlertCircle },
};

function XMLModal({ xml, onClose }: { xml: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader><DialogTitle>XML S-2240</DialogTitle></DialogHeader>
        <pre className="flex-1 overflow-auto text-xs font-mono bg-muted rounded-lg p-4 whitespace-pre-wrap break-all">{xml}</pre>
      </DialogContent>
    </Dialog>
  );
}

function NovaCondicaoDialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void;
}) {
  const [profiles, setProfiles] = useState<{ id: string; nome: string }[]>([]);
  const [userId, setUserId] = useState("");
  const [setor, setSetor] = useState("");
  const [agente, setAgente] = useState("Ruído");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from("profiles").select("id, nome").order("nome")
        .then(({ data }) => setProfiles((data ?? []) as { id: string; nome: string }[]));
    } else {
      setUserId(""); setSetor(""); setAgente("Ruído"); setDescricao("");
      setDataInicio(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  const submit = async () => {
    if (!userId || !setor.trim()) return toast.error("Colaborador e setor obrigatórios");
    setSaving(true);
    const prazoDate = new Date();
    prazoDate.setDate(15);
    prazoDate.setMonth(prazoDate.getMonth() + 1);
    const { error } = await (supabase.from as any)("esocial_queue").insert({
      evento: "S-2240",
      status: "pendente",
      user_id: userId,
      payload_json: {
        setor: setor.trim(),
        descricao: descricao.trim() || `Exposição a ${agente} no setor ${setor.trim()}`,
        agente,
        data_inicio: dataInicio,
      },
      prazo_envio: prazoDate.toISOString().slice(0, 10),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Condição ambiental registrada — evento S-2240 criado na fila eSocial");
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Registrar Condição Ambiental — S-2240</DialogTitle></DialogHeader>
        <p className="text-xs text-blue-700 bg-blue-500/10 rounded p-2 border border-blue-500/30">
          O evento S-2240 documenta exposição a fatores de risco ambiental (físico, químico, biológico ou ergonômico).
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
              <Label>Setor <span className="text-destructive">*</span></Label>
              <Input value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Ex: Produção, Manutenção…" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Data de início da exposição</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Agente de risco</Label>
            <Select value={agente} onValueChange={setAgente}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AGENTES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição da atividade / exposição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Descreva a atividade e o agente de risco ao qual o trabalhador está exposto…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !userId || !setor.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SSTAmbientalPage() {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingXml, setViewingXml] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await (supabase.from as any)("esocial_queue")
      .select("id, status, prazo_envio, xml_gerado, created_at, payload_json, profiles:user_id(nome)")
      .eq("evento", "S-2240")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows(data ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

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
    const { error } = await (supabase.from as any)("esocial_queue")
      .update({ status: "enviado", enviado_em: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marcado como enviado");
    load();
  };

  const pendentes = rows.filter((r) => r.status === "pendente").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">SST · eSocial</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Condições Ambientais</h1>
          <p className="text-sm text-text-secondary mt-1">
            Exposição a fatores de risco ambiental — evento S-2240 eSocial
          </p>
        </div>
        <Button variant="lp-primary" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />Registrar exposição
        </Button>
      </div>

      <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3">
        <p className="text-sm text-blue-700">
          <strong>S-2240</strong> — Condições Ambientais do Trabalho: Fatores de Risco. Deve ser enviado sempre que houver exposição a agentes físicos, químicos, biológicos ou ergonômicos acima dos limites de tolerância. Prazo: até o dia 15 do mês seguinte ao início da condição.
        </p>
      </div>

      {pendentes > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700"><strong>{pendentes}</strong> evento{pendentes > 1 ? "s" : ""} S-2240 pendente{pendentes > 1 ? "s" : ""} de envio ao eSocial</p>
        </div>
      )}

      {loading ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
      ) : (
        <div className="lp-solid-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border-subtle">
              <tr className="text-xs text-text-tertiary uppercase tracking-widest">
                <th className="text-left p-4 font-medium">Colaborador</th>
                <th className="text-left p-4 font-medium">Setor</th>
                <th className="text-left p-4 font-medium">Agente de risco</th>
                <th className="text-left p-4 font-medium">Prazo</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.map((r) => {
                const sc = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pendente;
                return (
                  <tr key={r.id} className="hover:bg-muted/10">
                    <td className="p-4 text-text-secondary">{r.profiles?.nome ?? "—"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Wind className="h-3.5 w-3.5 text-accent-primary shrink-0" />
                        <span className="text-sm font-medium">{r.payload_json?.setor ?? "—"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">{r.payload_json?.agente ?? "—"}</Badge>
                    </td>
                    <td className="p-4 text-xs text-text-secondary">
                      {r.prazo_envio ? new Date(r.prazo_envio).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-xs font-medium ${sc.color}`}>
                        <sc.icon className="h-3 w-3" />{sc.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {r.xml_gerado ? (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setViewingXml(r.xml_gerado)}>
                            <Eye className="h-3 w-3 mr-1" />XML
                          </Button>
                        ) : r.status === "pendente" && (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={generatingId === r.id} onClick={() => generateXml(r.id)}>
                            {generatingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Gerar XML"}
                          </Button>
                        )}
                        {r.status === "pendente" && (
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => markSent(r.id)}>
                            Enviado
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-text-tertiary text-sm">Nenhuma condição ambiental registrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <NovaCondicaoDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={load} />
      {viewingXml && <XMLModal xml={viewingXml} onClose={() => setViewingXml(null)} />}
    </div>
  );
}
