import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HardHat, Plus, Loader2, PackageCheck, Calendar, AlertCircle, CheckCircle2, Search, UserCheck,
  ChevronDown, ChevronRight, Users, Package,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/epi")({ component: EPIPage });

interface EPI {
  id: string; nome: string; descricao: string | null;
  ca_numero: string | null; ca_validade: string | null;
  tipo: string; ativo: boolean; created_at: string;
}

interface Entrega {
  id: string; epi_id: string; user_id: string; quantidade: number;
  data_entrega: string; assinado_em: string | null; devolvido: boolean;
  data_devolucao: string | null; observacoes: string | null; created_at: string;
  epis: { nome: string } | null;
  profiles: { nome: string; email: string } | null;
}

const TIPO_LABELS: Record<string, string> = {
  protecao_cabeca: "Cabeça", protecao_olhos: "Olhos/Rosto",
  protecao_auditiva: "Auditiva", protecao_respiratoria: "Respiratória",
  protecao_maos: "Mãos/Braços", protecao_pes: "Pés/Pernas",
  protecao_quedas: "Quedas", protecao_corpo: "Corpo", outro: "Outro",
};

function isCaExpirando(validade: string | null): boolean {
  if (!validade) return false;
  const diff = new Date(validade).getTime() - Date.now();
  return diff > 0 && diff < 90 * 86400_000;
}

function isCaVencido(validade: string | null): boolean {
  if (!validade) return false;
  return new Date(validade) < new Date();
}

function NovoEPIDialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: (createdId?: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("protecao_corpo");
  const [caNro, setCaNro] = useState("");
  const [caValidade, setCaValidade] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setNome(""); setDescricao(""); setTipo("protecao_corpo"); setCaNro(""); setCaValidade(""); };

  const submit = async () => {
    if (!nome.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    const { data, error } = await (supabase.from as any)("epis").insert({
      nome: nome.trim(), descricao: descricao.trim() || null,
      tipo, ca_numero: caNro.trim() || null,
      ca_validade: caValidade || null,
    }).select("id").single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("EPI cadastrado");
    reset(); onOpenChange(false); onCreated(data?.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Novo EPI</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Nome <span className="text-destructive">*</span></Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Capacete de Segurança" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo de proteção</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nº do CA (MTE)</Label>
              <Input value={caNro} onChange={(e) => setCaNro(e.target.value)} placeholder="Ex: 12345" />
            </div>
            <div className="space-y-1.5">
              <Label>Validade do CA</Label>
              <Input type="date" value={caValidade} onChange={(e) => setCaValidade(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição adicional" />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !nome.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : "Cadastrar e entregar a um colaborador"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NovaEntregaDialog({ open, onOpenChange, onCreated, epis, defaultEpiId, defaultUserId }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void; epis: EPI[];
  defaultEpiId?: string; defaultUserId?: string;
}) {
  const [epiId, setEpiId] = useState("");
  const [userId, setUserId] = useState("");
  const [profiles, setProfiles] = useState<{ id: string; nome: string; email: string }[]>([]);
  const [quantidade, setQuantidade] = useState("1");
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from("profiles").select("id, nome, email").order("nome")
        .then(({ data }) => setProfiles((data ?? []) as { id: string; nome: string; email: string }[]));
      setEpiId(defaultEpiId ?? "");
      setUserId(defaultUserId ?? "");
    } else {
      setEpiId(""); setUserId(""); setQuantidade("1"); setObs("");
      setDataEntrega(new Date().toISOString().slice(0, 10));
    }
  }, [open, defaultEpiId, defaultUserId]);

  const submit = async () => {
    if (!epiId || !userId) return toast.error("EPI e colaborador obrigatórios");
    setSaving(true);
    const { error } = await (supabase.from as any)("epi_entregas").insert({
      epi_id: epiId, user_id: userId,
      quantidade: Number(quantidade) || 1,
      data_entrega: dataEntrega,
      observacoes: obs.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Entrega registrada");
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Registrar Entrega de EPI</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>EPI <span className="text-destructive">*</span></Label>
            <Select value={epiId} onValueChange={setEpiId}>
              <SelectTrigger><SelectValue placeholder="Selecione o EPI…" /></SelectTrigger>
              <SelectContent>
                {epis.filter((e) => e.ativo).map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              <Label>Quantidade</Label>
              <Input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data de entrega</Label>
              <Input type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Condições, substituição de EPI danificado, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !epiId || !userId}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : "Registrar entrega"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EPIPage() {
  const [epis, setEpis] = useState<EPI[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [novoEPIOpen, setNovoEPIOpen] = useState(false);
  const [novaEntregaOpen, setNovaEntregaOpen] = useState(false);
  const [entregaDefaults, setEntregaDefaults] = useState<{ epiId?: string; userId?: string }>({});
  const [expandedColab, setExpandedColab] = useState<Set<string>>(new Set());
  const [expandedEpi, setExpandedEpi] = useState<Set<string>>(new Set());

  const loadEPIs = async () => {
    const { data } = await (supabase.from as any)("epis").select("*").order("nome");
    setEpis(data ?? []);
  };

  const loadEntregas = async () => {
    const { data } = await (supabase.from as any)("epi_entregas")
      .select("*, epis(nome), profiles:user_id(nome, email)")
      .order("data_entrega", { ascending: false })
      .limit(200);
    setEntregas(data ?? []);
  };

  useEffect(() => {
    Promise.all([loadEPIs(), loadEntregas()]).finally(() => setLoading(false));
  }, []);

  const reloadAll = () => Promise.all([loadEPIs(), loadEntregas()]);

  const openEntregaFor = (defaults: { epiId?: string; userId?: string } = {}) => {
    setEntregaDefaults(defaults);
    setNovaEntregaOpen(true);
  };

  const handleEPICreated = async (createdId?: string) => {
    await loadEPIs();
    if (createdId) openEntregaFor({ epiId: createdId });
  };

  const toggle = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const n = new Set(set);
    if (n.has(key)) n.delete(key); else n.add(key);
    setter(n);
  };

  // Aggregations
  const porColaborador = useMemo(() => {
    const map = new Map<string, { nome: string; email: string; items: Entrega[] }>();
    for (const e of entregas) {
      const key = e.user_id;
      const cur = map.get(key) ?? { nome: e.profiles?.nome ?? "—", email: e.profiles?.email ?? "", items: [] };
      cur.items.push(e);
      map.set(key, cur);
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [entregas]);

  const porEpi = useMemo(() => {
    const map = new Map<string, { nome: string; items: Entrega[] }>();
    for (const e of entregas) {
      const key = e.epi_id;
      const cur = map.get(key) ?? { nome: e.epis?.nome ?? "—", items: [] };
      cur.items.push(e);
      map.set(key, cur);
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [entregas]);

  const filteredEPIs = epis.filter((e) =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    (e.ca_numero ?? "").includes(search)
  );

  const pendingAssinatura = entregas.filter((e) => !e.assinado_em && !e.devolvido).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">SST</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Gestão de EPIs</h1>
          <p className="text-sm text-text-secondary mt-1">
            Catálogo de Equipamentos de Proteção Individual e fichas de entrega
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openEntregaFor()}>
            <PackageCheck className="h-4 w-4 mr-1.5" />Registrar entrega
          </Button>
          <Button variant="lp-primary" onClick={() => setNovoEPIOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />Novo EPI
          </Button>
        </div>
      </div>

      {pendingAssinatura > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{pendingAssinatura}</strong> entrega{pendingAssinatura > 1 ? "s" : ""} aguardando assinatura do colaborador
          </p>
        </div>
      )}

      <Tabs defaultValue="catalogo">
        <TabsList>
          <TabsTrigger value="catalogo">Catálogo <Badge variant="secondary" className="ml-1.5">{epis.length}</Badge></TabsTrigger>
          <TabsTrigger value="colaboradores"><Users className="h-3.5 w-3.5 mr-1" />Por Colaborador <Badge variant="secondary" className="ml-1.5">{porColaborador.length}</Badge></TabsTrigger>
          <TabsTrigger value="por-epi"><Package className="h-3.5 w-3.5 mr-1" />Por EPI <Badge variant="secondary" className="ml-1.5">{porEpi.length}</Badge></TabsTrigger>
          <TabsTrigger value="entregas">Fichas de Entrega <Badge variant="secondary" className="ml-1.5">{entregas.length}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value="catalogo" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar EPI ou nº CA…" />
          </div>

          {loading ? (
            <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredEPIs.map((epi) => {
                const vencido = isCaVencido(epi.ca_validade);
                const expirando = !vencido && isCaExpirando(epi.ca_validade);
                return (
                  <div key={epi.id} className="lp-solid-card p-4 space-y-3 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <HardHat className="h-4 w-4 text-accent-primary shrink-0" />
                        <span className="font-semibold text-sm text-text-primary leading-snug">{epi.nome}</span>
                      </div>
                      {!epi.ativo && <Badge variant="secondary" className="text-[10px] shrink-0">Inativo</Badge>}
                    </div>
                    <Badge variant="outline" className="text-[10px]">{TIPO_LABELS[epi.tipo] ?? epi.tipo}</Badge>
                    {epi.ca_numero && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-text-tertiary">CA:</span>
                        <span className="font-mono font-semibold">{epi.ca_numero}</span>
                        {epi.ca_validade && (
                          <span className={`flex items-center gap-1 ${vencido ? "text-destructive" : expirando ? "text-amber-600" : "text-green-600"}`}>
                            {vencido ? <AlertCircle className="h-3 w-3" /> : expirando ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                            <Calendar className="h-3 w-3" />
                            {new Date(epi.ca_validade).toLocaleDateString("pt-BR")}
                            {vencido ? " — VENCIDO" : expirando ? " — Expirando" : ""}
                          </span>
                        )}
                      </div>
                    )}
                    {epi.descricao && <p className="text-xs text-text-tertiary">{epi.descricao}</p>}
                    <div className="pt-2 mt-auto border-t border-border-subtle flex items-center justify-between">
                      <span className="text-[11px] text-text-tertiary">
                        {entregas.filter((x) => x.epi_id === epi.id).length} entrega(s)
                      </span>
                      <Button size="sm" variant="outline" onClick={() => openEntregaFor({ epiId: epi.id })} disabled={!epi.ativo}>
                        <PackageCheck className="h-3.5 w-3.5 mr-1" />Entregar
                      </Button>
                    </div>
                  </div>
                );
              })}
              {filteredEPIs.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 lp-solid-card p-12 text-center text-text-tertiary text-sm">
                  {search ? `Nenhum EPI encontrado para "${search}".` : "Nenhum EPI cadastrado."}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="colaboradores" className="mt-4 space-y-2">
          {loading ? (
            <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
          ) : porColaborador.length === 0 ? (
            <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">Nenhuma entrega registrada ainda.</div>
          ) : (
            porColaborador.map((c) => {
              const open = expandedColab.has(c.id);
              const emUso = c.items.filter((i) => !i.devolvido).length;
              const pend = c.items.filter((i) => !i.assinado_em && !i.devolvido).length;
              return (
                <div key={c.id} className="lp-solid-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(expandedColab, c.id, setExpandedColab)}
                    className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/10 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {open ? <ChevronDown className="h-4 w-4 text-text-tertiary shrink-0" /> : <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />}
                      <div className="min-w-0">
                        <div className="font-medium text-text-primary truncate">{c.nome}</div>
                        <div className="text-xs text-text-tertiary truncate">{c.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">{c.items.length} entrega(s)</Badge>
                      <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-700 border-green-500/30">{emUso} em uso</Badge>
                      {pend > 0 && <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30">{pend} pend.</Badge>}
                      <Button
                        size="sm" variant="ghost"
                        onClick={(e) => { e.stopPropagation(); openEntregaFor({ userId: c.id }); }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />EPI
                      </Button>
                    </div>
                  </button>
                  {open && (
                    <div className="border-t border-border-subtle divide-y divide-border-subtle">
                      {c.items.map((it) => (
                        <div key={it.id} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                          <HardHat className="h-3.5 w-3.5 text-accent-primary shrink-0" />
                          <div className="flex-1 min-w-0 truncate">{it.epis?.nome ?? "—"}</div>
                          <span className="text-xs text-text-tertiary">Qtd {it.quantidade}</span>
                          <span className="text-xs text-text-tertiary">{new Date(it.data_entrega).toLocaleDateString("pt-BR")}</span>
                          {it.devolvido
                            ? <Badge variant="outline" className="text-[10px]">Devolvido</Badge>
                            : <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-700">Em uso</Badge>}
                          {!it.assinado_em && !it.devolvido && (
                            <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                              <UserCheck className="h-3 w-3" />Assinatura pend.
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="por-epi" className="mt-4 space-y-2">
          {loading ? (
            <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
          ) : porEpi.length === 0 ? (
            <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">Nenhuma entrega registrada ainda.</div>
          ) : (
            porEpi.map((g) => {
              const open = expandedEpi.has(g.id);
              const colabsUnicos = new Set(g.items.map((i) => i.user_id)).size;
              return (
                <div key={g.id} className="lp-solid-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(expandedEpi, g.id, setExpandedEpi)}
                    className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/10 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {open ? <ChevronDown className="h-4 w-4 text-text-tertiary shrink-0" /> : <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />}
                      <HardHat className="h-4 w-4 text-accent-primary shrink-0" />
                      <div className="font-medium text-text-primary truncate">{g.nome}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">{g.items.length} entrega(s)</Badge>
                      <Badge variant="outline" className="text-[10px]">{colabsUnicos} colaborador(es)</Badge>
                      <Button
                        size="sm" variant="ghost"
                        onClick={(e) => { e.stopPropagation(); openEntregaFor({ epiId: g.id }); }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />Entregar
                      </Button>
                    </div>
                  </button>
                  {open && (
                    <div className="border-t border-border-subtle divide-y divide-border-subtle">
                      {g.items.map((it) => (
                        <div key={it.id} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-text-primary">{it.profiles?.nome ?? "—"}</div>
                            <div className="text-xs text-text-tertiary truncate">{it.profiles?.email ?? ""}</div>
                          </div>
                          <span className="text-xs text-text-tertiary">Qtd {it.quantidade}</span>
                          <span className="text-xs text-text-tertiary">{new Date(it.data_entrega).toLocaleDateString("pt-BR")}</span>
                          {it.devolvido
                            ? <Badge variant="outline" className="text-[10px]">Devolvido</Badge>
                            : <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-700">Em uso</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="entregas" className="mt-4">
          {loading ? (
            <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
          ) : (
            <div className="lp-solid-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-border-subtle">
                  <tr className="text-xs text-text-tertiary uppercase tracking-widest">
                    <th className="text-left p-4 font-medium">Colaborador</th>
                    <th className="text-left p-4 font-medium">EPI</th>
                    <th className="text-left p-4 font-medium">Qtd</th>
                    <th className="text-left p-4 font-medium">Data</th>
                    <th className="text-left p-4 font-medium">Assinatura</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {entregas.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/10">
                      <td className="p-4">
                        <div className="font-medium text-text-primary">{e.profiles?.nome ?? "—"}</div>
                        <div className="text-xs text-text-tertiary">{e.profiles?.email ?? ""}</div>
                      </td>
                      <td className="p-4 text-text-secondary">{e.epis?.nome ?? "—"}</td>
                      <td className="p-4 text-text-secondary">{e.quantidade}</td>
                      <td className="p-4 text-text-secondary">{new Date(e.data_entrega).toLocaleDateString("pt-BR")}</td>
                      <td className="p-4">
                        {e.assinado_em ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            {new Date(e.assinado_em).toLocaleDateString("pt-BR")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 text-xs">
                            <UserCheck className="h-3 w-3" />Pendente
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {e.devolvido
                          ? <Badge variant="outline" className="text-[10px]">Devolvido</Badge>
                          : <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-700">Em uso</Badge>}
                      </td>
                    </tr>
                  ))}
                  {entregas.length === 0 && (
                    <tr><td colSpan={6} className="p-12 text-center text-text-tertiary text-sm">Nenhuma entrega registrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NovoEPIDialog open={novoEPIOpen} onOpenChange={setNovoEPIOpen} onCreated={handleEPICreated} />
      <NovaEntregaDialog
        open={novaEntregaOpen}
        onOpenChange={setNovaEntregaOpen}
        onCreated={reloadAll}
        epis={epis}
        defaultEpiId={entregaDefaults.epiId}
        defaultUserId={entregaDefaults.userId}
      />
    </div>
  );
}
