import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users2, Plus, Loader2, CalendarDays, Shield, UserPlus, Building2, HardHat, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/cipa")({ component: CIPAPage });

interface Mandato {
  id: string; numero: number; inicio_em: string; fim_em: string;
  ativo: boolean; ata_url: string | null; observacoes: string | null; created_at: string;
  membros?: Membro[];
}

interface Membro {
  id: string; mandato_id: string; user_id: string;
  cargo: string; representacao: string; estabilidade_ate: string | null;
  profiles: { nome: string; email: string } | null;
}

const CARGO_LABELS: Record<string, string> = {
  presidente: "Presidente", vice_presidente: "Vice-Presidente",
  secretario: "Secretário(a)", membro_efetivo: "Membro Efetivo",
  membro_suplente: "Membro Suplente",
};

const REP_LABELS: Record<string, string> = {
  empregador: "Empregador", empregado: "Empregado",
};

function NovoMandatoDialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void;
}) {
  const [numero, setNumero] = useState("");
  const [inicioEm, setInicioEm] = useState("");
  const [fimEm, setFimEm] = useState("");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!numero || !inicioEm || !fimEm) return toast.error("Número e datas obrigatórios");
    setSaving(true);
    const { error } = await (supabase.from as any)("cipa_mandatos").insert({
      numero: Number(numero), inicio_em: inicioEm, fim_em: fimEm,
      observacoes: obs.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Mandato criado");
    setNumero(""); setInicioEm(""); setFimEm(""); setObs("");
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Novo Mandato CIPA</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Número do mandato <span className="text-destructive">*</span></Label>
            <Input type="number" min={1} value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 15" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Início <span className="text-destructive">*</span></Label>
              <Input type="date" value={inicioEm} onChange={(e) => setInicioEm(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Término <span className="text-destructive">*</span></Label>
              <Input type="date" value={fimEm} onChange={(e) => setFimEm(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ata de posse, observações, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !numero || !inicioEm || !fimEm}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : "Criar mandato"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdicionarMembroDialog({ open, onOpenChange, onCreated, mandatos }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void; mandatos: Mandato[];
}) {
  const [profiles, setProfiles] = useState<{ id: string; nome: string; email: string }[]>([]);
  const [mandatoId, setMandatoId] = useState("");
  const [userId, setUserId] = useState("");
  const [cargo, setCargo] = useState("membro_efetivo");
  const [representacao, setRepresentacao] = useState("empregado");
  const [estabilidadeAte, setEstabilidadeAte] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from("profiles").select("id, nome, email").order("nome")
        .then(({ data }) => setProfiles((data ?? []) as { id: string; nome: string; email: string }[]));
      if (mandatos.find((m) => m.ativo)) {
        setMandatoId(mandatos.find((m) => m.ativo)?.id ?? "");
      }
    } else {
      setUserId(""); setCargo("membro_efetivo"); setRepresentacao("empregado"); setEstabilidadeAte("");
    }
  }, [open, mandatos]);

  const submit = async () => {
    if (!mandatoId || !userId) return toast.error("Mandato e colaborador obrigatórios");
    setSaving(true);
    const { error } = await (supabase.from as any)("cipa_membros").insert({
      mandato_id: mandatoId, user_id: userId,
      cargo, representacao,
      estabilidade_ate: estabilidadeAte || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message === "duplicate key value violates unique constraint \"cipa_membros_mandato_id_user_id_key\"" ? "Este colaborador já é membro deste mandato" : error.message);
    toast.success("Membro adicionado");
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Adicionar Membro CIPA</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Mandato <span className="text-destructive">*</span></Label>
            <Select value={mandatoId} onValueChange={setMandatoId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {mandatos.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.numero}º Mandato ({new Date(m.inicio_em).getFullYear()})
                    {m.ativo ? " — Ativo" : ""}
                  </SelectItem>
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
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Select value={cargo} onValueChange={setCargo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CARGO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Representação</Label>
              <Select value={representacao} onValueChange={setRepresentacao}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empregador">Empregador</SelectItem>
                  <SelectItem value="empregado">Empregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Estabilidade até</Label>
            <Input type="date" value={estabilidadeAte} onChange={(e) => setEstabilidadeAte(e.target.value)} />
            <p className="text-[11px] text-text-tertiary">Empregados eleitos têm estabilidade de 1 ano após mandato (CLT art. 165)</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !mandatoId || !userId}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : "Adicionar membro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CIPAPage() {
  const [mandatos, setMandatos] = useState<Mandato[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [totalFuncionarios, setTotalFuncionarios] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mandatoDialogOpen, setMandatoDialogOpen] = useState(false);
  const [membroDialogOpen, setMembroDialogOpen] = useState(false);

  const load = async () => {
    const [{ data: mDat }, { data: memDat }, { count }] = await Promise.all([
      (supabase.from as any)("cipa_mandatos").select("*").order("inicio_em", { ascending: false }),
      (supabase.from as any)("cipa_membros").select("*, profiles:user_id(nome, email)").order("cargo"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("ativo", true),
    ]);
    setMandatos(mDat ?? []);
    setMembros(memDat ?? []);
    setTotalFuncionarios(count ?? 0);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const mandatoAtivo = mandatos.find((m) => m.ativo);

  // NR-5 Quadro I (dimensionamento simplificado — grau de risco médio)
  // Retorna mínimos exigidos por representação
  const dimensionamentoNR5 = (n: number) => {
    if (n <= 19) return { efet: 0, supl: 0, dispensa: true };
    if (n <= 50) return { efet: 1, supl: 1, dispensa: false };
    if (n <= 100) return { efet: 3, supl: 3, dispensa: false };
    if (n <= 500) return { efet: 4, supl: 4, dispensa: false };
    if (n <= 1000) return { efet: 6, supl: 4, dispensa: false };
    if (n <= 2500) return { efet: 9, supl: 7, dispensa: false };
    return { efet: 12, supl: 10, dispensa: false };
  };
  const exigido = dimensionamentoNR5(totalFuncionarios);

  const membrosAtivos = mandatoAtivo ? membros.filter((m) => m.mandato_id === mandatoAtivo.id) : [];
  const composicao = {
    empregador: {
      efetivos: membrosAtivos.filter((m) => m.representacao === "empregador" && m.cargo !== "membro_suplente"),
      suplentes: membrosAtivos.filter((m) => m.representacao === "empregador" && m.cargo === "membro_suplente"),
    },
    empregado: {
      efetivos: membrosAtivos.filter((m) => m.representacao === "empregado" && m.cargo !== "membro_suplente"),
      suplentes: membrosAtivos.filter((m) => m.representacao === "empregado" && m.cargo === "membro_suplente"),
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">SST</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">CIPA</h1>
          <p className="text-sm text-text-secondary mt-1">Comissão Interna de Prevenção de Acidentes — NR-5</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMembroDialogOpen(true)} disabled={mandatos.length === 0}>
            <UserPlus className="h-4 w-4 mr-1.5" />Adicionar membro
          </Button>
          <Button variant="lp-primary" onClick={() => setMandatoDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />Novo mandato
          </Button>
        </div>
      </div>

      {/* Dimensionamento NR-5 — sempre visível */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="lp-solid-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-text-tertiary font-semibold">Funcionários ativos</div>
          <div className="mt-1 text-2xl font-bold text-text-primary">{totalFuncionarios}</div>
          <div className="text-[11px] text-text-tertiary mt-1">Base para dimensionamento NR-5</div>
        </div>
        <div className="lp-solid-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-text-tertiary font-semibold">Exigido por representação</div>
          {exigido.dispensa ? (
            <div className="mt-1 text-sm text-text-primary">Dispensada de CIPA<div className="text-[11px] text-text-tertiary">(até 19 funcionários — designar 1 responsável)</div></div>
          ) : (
            <div className="mt-1 text-sm text-text-primary">
              <span className="text-2xl font-bold">{exigido.efet}</span> efetivos + <span className="font-semibold">{exigido.supl}</span> suplentes
              <div className="text-[11px] text-text-tertiary mt-0.5">de cada lado (empregador e empregado)</div>
            </div>
          )}
        </div>
        <div className="lp-solid-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-text-tertiary font-semibold">Mandato ativo</div>
          {mandatoAtivo ? (
            <>
              <div className="mt-1 text-2xl font-bold text-text-primary">{mandatoAtivo.numero}ª Gestão</div>
              <div className="text-[11px] text-text-tertiary mt-0.5 flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                até {new Date(mandatoAtivo.fim_em).toLocaleDateString("pt-BR")}
              </div>
            </>
          ) : (
            <div className="mt-1 text-sm text-text-tertiary">Nenhum mandato ativo</div>
          )}
        </div>
      </div>

      {/* Composição por representação */}
      {mandatoAtivo && !exigido.dispensa && (
        <div className="grid gap-4 md:grid-cols-2">
          {(["empregador", "empregado"] as const).map((rep) => {
            const grupo = composicao[rep];
            const totalEfet = grupo.efetivos.length;
            const totalSupl = grupo.suplentes.length;
            const okEfet = totalEfet >= exigido.efet;
            const okSupl = totalSupl >= exigido.supl;
            const okAll = okEfet && okSupl;
            return (
              <div key={rep} className={`lp-solid-card p-5 ${okAll ? "border-green-500/30" : "border-amber-500/40"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {rep === "empregador" ? <Building2 className="h-4 w-4 text-accent-primary" /> : <HardHat className="h-4 w-4 text-accent-primary" />}
                    <span className="font-semibold text-text-primary">Representação {REP_LABELS[rep]}</span>
                  </div>
                  {okAll
                    ? <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Completa</Badge>
                    : <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700"><AlertTriangle className="h-3 w-3 mr-1" />Incompleta</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-md bg-background-secondary p-3">
                    <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">Efetivos</div>
                    <div className={`mt-0.5 text-lg font-bold ${okEfet ? "text-text-primary" : "text-amber-600"}`}>
                      {totalEfet}<span className="text-sm font-normal text-text-tertiary">/{exigido.efet}</span>
                    </div>
                  </div>
                  <div className="rounded-md bg-background-secondary p-3">
                    <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">Suplentes</div>
                    <div className={`mt-0.5 text-lg font-bold ${okSupl ? "text-text-primary" : "text-amber-600"}`}>
                      {totalSupl}<span className="text-sm font-normal text-text-tertiary">/{exigido.supl}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {[...grupo.efetivos, ...grupo.suplentes].map((m) => (
                    <div key={m.id} className="flex items-center gap-2 text-sm">
                      <div className="h-7 w-7 rounded-full bg-accent-primary/10 grid place-items-center shrink-0">
                        <Users2 className="h-3.5 w-3.5 text-accent-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-text-primary truncate">{m.profiles?.nome ?? "—"}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{CARGO_LABELS[m.cargo] ?? m.cargo}</Badge>
                    </div>
                  ))}
                  {totalEfet + totalSupl === 0 && (
                    <div className="text-xs text-text-tertiary py-2 text-center">Nenhum representante {REP_LABELS[rep].toLowerCase()} cadastrado.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mandatoAtivo && exigido.dispensa && (
        <div className="lp-solid-card p-5 border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center gap-2 text-sm text-text-primary">
            <Shield className="h-4 w-4 text-blue-600" />
            Empresa com até 19 funcionários — dispensada de CIPA. Basta designar um responsável pelo cumprimento dos objetivos da NR-5.
          </div>
        </div>
      )}

      <Tabs defaultValue="membros">
        <TabsList>
          <TabsTrigger value="membros">Membros</TabsTrigger>
          <TabsTrigger value="mandatos">Histórico de Mandatos</TabsTrigger>
        </TabsList>

        <TabsContent value="membros" className="mt-4">
          {loading ? (
            <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
          ) : (
            <div className="space-y-6">
              {mandatos.map((mandato) => {
                const mems = membros.filter((m) => m.mandato_id === mandato.id);
                if (mems.length === 0) return null;
                return (
                  <div key={mandato.id} className="space-y-3">
                    <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                      {mandato.numero}ª Gestão
                      {mandato.ativo && <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-700">Ativo</Badge>}
                      <span className="font-normal text-text-tertiary">
                        {new Date(mandato.inicio_em).toLocaleDateString("pt-BR")} — {new Date(mandato.fim_em).toLocaleDateString("pt-BR")}
                      </span>
                    </h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      {mems.map((m) => (
                        <div key={m.id} className="lp-solid-card p-4 flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-accent-primary/10 grid place-items-center shrink-0">
                            <Users2 className="h-4 w-4 text-accent-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-text-primary truncate">{m.profiles?.nome ?? "—"}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px]">{CARGO_LABELS[m.cargo] ?? m.cargo}</Badge>
                              <span className="text-[10px] text-text-tertiary">{REP_LABELS[m.representacao]}</span>
                            </div>
                            {m.estabilidade_ate && (
                              <div className="text-[10px] text-text-tertiary mt-1">
                                Estabilidade até {new Date(m.estabilidade_ate).toLocaleDateString("pt-BR")}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {membros.length === 0 && (
                <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
                  Nenhum membro cadastrado. Crie um mandato e adicione os membros.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mandatos" className="mt-4">
          <div className="space-y-3">
            {mandatos.map((m) => (
              <div key={m.id} className="lp-solid-card p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-accent-primary/10 grid place-items-center shrink-0">
                  <span className="text-sm font-bold text-accent-primary">{m.numero}º</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-text-primary">{m.numero}ª Gestão</div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {new Date(m.inicio_em).toLocaleDateString("pt-BR")} — {new Date(m.fim_em).toLocaleDateString("pt-BR")}
                  </div>
                  {m.observacoes && <div className="text-xs text-text-tertiary mt-1">{m.observacoes}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {membros.filter((mb) => mb.mandato_id === m.id).length} membros
                  </Badge>
                  {m.ativo
                    ? <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-700">Ativo</Badge>
                    : <Badge variant="outline" className="text-[10px]">Encerrado</Badge>}
                </div>
              </div>
            ))}
            {mandatos.length === 0 && (
              <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">Nenhum mandato registrado.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <NovoMandatoDialog open={mandatoDialogOpen} onOpenChange={setMandatoDialogOpen} onCreated={load} />
      <AdicionarMembroDialog open={membroDialogOpen} onOpenChange={setMembroDialogOpen} onCreated={load} mandatos={mandatos} />
    </div>
  );
}
