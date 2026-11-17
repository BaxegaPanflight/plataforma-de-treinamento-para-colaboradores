import { createFileRoute, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen, Loader2, Search, Wand2, Sparkles, AlertTriangle, Clock, RotateCw, Award, Info, ChevronDown, ChevronUp, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_admin/admin/cursos")({ component: Cursos });

interface Course { id: string; titulo: string; descricao: string | null; publicado: boolean; nr_codigo: string[] }

interface NRItem {
  id: string;
  numero: string;
  titulo: string;
  horas_minimas: number;
  periodicidade_meses: number;
  ementa_padrao: string | null;
  requisitos: string | null;
  publico_alvo: string | null;
}

// Derived NR constraints for the selected NRs
interface NRConstraints {
  minHoras: number;         // max of all selected horas_minimas
  minValidade: number;      // min of non-zero periodicidade_meses (most restrictive)
  precisaCert: boolean;     // any NR with horas_minimas > 0 implies certification
  precisaPresencial: boolean; // NRs that require hands-on practice
}

const NRS_PRESENCIAIS = ["NR-10", "NR-11", "NR-13", "NR-20", "NR-33", "NR-35", "NR-36"];

function computeConstraints(nrs: NRItem[], selected: string[]): NRConstraints | null {
  const items = nrs.filter((n) => selected.includes(n.numero));
  if (items.length === 0) return null;

  const minHoras = Math.max(...items.map((n) => n.horas_minimas));
  const validadeCandidates = items.map((n) => n.periodicidade_meses).filter((v) => v > 0);
  const minValidade = validadeCandidates.length > 0 ? Math.min(...validadeCandidates) : 0;
  const precisaCert = minHoras > 0;
  const precisaPresencial = items.some((n) => NRS_PRESENCIAIS.includes(n.numero));

  return { minHoras, minValidade, precisaCert, precisaPresencial };
}

function NRRequirementsPanel({ nrs, selected }: { nrs: NRItem[]; selected: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const items = nrs.filter((n) => selected.includes(n.numero));
  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
      <button
        type="button"
        className="w-full flex items-center justify-between"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
            Requisitos das NRs selecionadas
          </span>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-amber-500" /> : <ChevronDown className="h-3.5 w-3.5 text-amber-500" />}
      </button>

      {expanded && (
        <div className="space-y-4 pt-1">
          {items.map((nr) => (
            <div key={nr.numero} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="font-mono text-xs">{nr.numero}</Badge>
                <span className="text-xs font-medium text-text-primary truncate">{nr.titulo}</span>
              </div>
              <div className="flex flex-wrap gap-3 ml-1">
                {nr.horas_minimas > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                    <Clock className="h-3 w-3 text-amber-500" />
                    Mín. <strong>{nr.horas_minimas}h</strong>
                  </span>
                )}
                {nr.periodicidade_meses > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                    <RotateCw className="h-3 w-3 text-amber-500" />
                    Reciclagem <strong>{nr.periodicidade_meses}m</strong>
                  </span>
                )}
                {NRS_PRESENCIAIS.includes(nr.numero) && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    Exige prática presencial
                  </span>
                )}
              </div>
              {nr.requisitos && (
                <p className="text-xs text-text-tertiary leading-relaxed ml-1 border-l-2 border-amber-200 pl-2">
                  {nr.requisitos}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateCourseDialog({ open, onOpenChange, onCreated }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const [nrs, setNrs] = useState<NRItem[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [modalidade, setModalidade] = useState("ead");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [validadeMeses, setValidadeMeses] = useState("");
  const [emiteCert, setEmiteCert] = useState(true);
  const [selectedNRs, setSelectedNRs] = useState<string[]>([]);
  const [nrSearch, setNrSearch] = useState("");
  const [instrutorNome, setInstrutorNome] = useState("");
  const [instrutorHabilitacao, setInstrutorHabilitacao] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatingEmenta, setGeneratingEmenta] = useState(false);
  const [refiningEmenta, setRefiningEmenta] = useState(false);
  const [ementaGenerated, setEmentaGenerated] = useState(false);

  useEffect(() => {
    if (open) {
      (supabase.from as any)("nrs_catalog")
        .select("id, numero, titulo, horas_minimas, periodicidade_meses, ementa_padrao, requisitos, publico_alvo")
        .eq("vigente", true)
        .order("numero")
        .then(({ data }: { data: NRItem[] | null }) => setNrs(data ?? []));
    } else {
      setTitulo(""); setDescricao(""); setModalidade("ead"); setCargaHoraria("");
      setValidadeMeses(""); setEmiteCert(true); setSelectedNRs([]); setNrSearch("");
      setInstrutorNome(""); setInstrutorHabilitacao(""); setEmentaGenerated(false);
    }
  }, [open]);

  const constraints = useMemo(() => computeConstraints(nrs, selectedNRs), [nrs, selectedNRs]);

  // When NRs change, auto-suggest values if fields are still empty / at zero
  useEffect(() => {
    if (!constraints) return;
    if (!cargaHoraria || cargaHoraria === "0") {
      if (constraints.minHoras > 0) setCargaHoraria(String(constraints.minHoras));
    }
    if (!validadeMeses || validadeMeses === "0") {
      if (constraints.minValidade > 0) setValidadeMeses(String(constraints.minValidade));
    }
    if (constraints.precisaCert) setEmiteCert(true);
    if (constraints.precisaPresencial && modalidade === "ead") setModalidade("hibrido");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constraints]);

  const horasAbaixoDoMinimo =
    constraints && constraints.minHoras > 0 && Number(cargaHoraria) > 0 && Number(cargaHoraria) < constraints.minHoras;

  const validadeAcimaDoLimite =
    constraints && constraints.minValidade > 0 && Number(validadeMeses) > constraints.minValidade;

  const toggleNR = (numero: string) =>
    setSelectedNRs((prev) => prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero]);

  const filteredNRs = nrs.filter((n) =>
    n.numero.toLowerCase().includes(nrSearch.toLowerCase()) ||
    n.titulo.toLowerCase().includes(nrSearch.toLowerCase())
  );

  const handleGerarEmenta = async () => {
    if (selectedNRs.length === 0) return;
    setGeneratingEmenta(true);
    try {
      const { data } = await (supabase.from as any)("nrs_catalog")
        .select("numero, titulo, ementa_padrao")
        .in("numero", selectedNRs)
        .eq("vigente", true);

      const nrsData: Pick<NRItem, "numero" | "titulo" | "ementa_padrao">[] = data ?? [];
      const parts = nrsData.filter((n) => n.ementa_padrao).map(
        (n) => `## ${n.numero} — ${n.titulo}\n\n${n.ementa_padrao}`
      );

      if (parts.length === 0) { toast.error("Nenhuma ementa padrão encontrada"); return; }
      setDescricao(parts.join("\n\n---\n\n"));
      setEmentaGenerated(true);
      toast.success("Ementa gerada com base nas NRs selecionadas");
    } catch {
      toast.error("Erro ao gerar ementa");
    } finally {
      setGeneratingEmenta(false);
    }
  };

  const handleRefinarEmenta = async () => {
    setRefiningEmenta(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ementa", {
        body: { nrs: selectedNRs, titulo, descricao },
      });
      if (error) { toast.error((error as { message?: string }).message ?? "Erro ao refinar ementa"); return; }
      if (data?.ementa) { setDescricao(data.ementa); toast.success("Ementa refinada com IA"); }
      else if (data?.error) toast.error(data.error);
    } catch {
      toast.error("Erro ao conectar com a IA");
    } finally {
      setRefiningEmenta(false);
    }
  };

  const submit = async () => {
    if (!titulo.trim()) return toast.error("Título obrigatório");
    setSaving(true);
    const { data, error } = await supabase.from("courses").insert({
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      modalidade,
      carga_horaria_horas: Number(cargaHoraria) || 0,
      validade_meses: Number(validadeMeses) || 0,
      emite_certificado: emiteCert,
      nr_codigo: selectedNRs,
      instrutor_nome: instrutorNome.trim() || null,
      instrutor_habilitacao: instrutorHabilitacao.trim() || null,
      publicado: false,
    }).select("id").single();
    setSaving(false);
    if (error || !data) return toast.error(error?.message ?? "Erro ao criar curso");
    logAudit("curso_criado", "courses", data.id, { titulo: titulo.trim(), nr_codigo: selectedNRs });
    onCreated(data.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo curso</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* NR selection — first, drives everything else */}
          <div className="space-y-2">
            <Label>Normas Regulamentadoras <span className="text-text-tertiary text-xs">(selecione antes de preencher)</span></Label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <Input value={nrSearch} onChange={(e) => setNrSearch(e.target.value)} className="pl-8 h-8 text-sm" placeholder="Filtrar NRs…" />
            </div>
            <div className="border border-border rounded-lg max-h-44 overflow-y-auto divide-y divide-border-subtle">
              {filteredNRs.length === 0 && (
                <div className="p-3 text-xs text-text-tertiary text-center">Nenhuma NR encontrada</div>
              )}
              {filteredNRs.map((nr) => (
                <label key={nr.id} className="flex items-start gap-3 p-2.5 cursor-pointer hover:bg-muted/30">
                  <Checkbox
                    checked={selectedNRs.includes(nr.numero)}
                    onCheckedChange={() => toggleNR(nr.numero)}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs font-semibold text-accent-primary">{nr.numero}</span>
                    <span className="text-xs text-text-secondary ml-2 leading-snug">{nr.titulo}</span>
                  </div>
                  <div className="shrink-0 flex gap-2 text-[10px] text-text-tertiary">
                    {nr.horas_minimas > 0 && <span>{nr.horas_minimas}h</span>}
                    {nr.periodicidade_meses > 0 && <span>{nr.periodicidade_meses}m</span>}
                  </div>
                </label>
              ))}
            </div>
            {selectedNRs.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedNRs.map((n) => <Badge key={n} variant="secondary" className="text-xs font-mono">{n}</Badge>)}
              </div>
            )}
          </div>

          {/* NR requirements panel */}
          {selectedNRs.length > 0 && (
            <NRRequirementsPanel nrs={nrs} selected={selectedNRs} />
          )}

          {/* Título */}
          <div className="space-y-1.5">
            <Label>Título <span className="text-destructive">*</span></Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: NR-35 — Trabalho em Altura" autoFocus />
          </div>

          {/* Descrição / ementa */}
          <div className="space-y-1.5">
            <Label>Descrição / Ementa</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} placeholder="Objetivos e público-alvo do curso" />
            {selectedNRs.length > 0 && (
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleGerarEmenta} disabled={generatingEmenta} className="gap-1.5 text-xs">
                  {generatingEmenta ? <><Loader2 className="h-3 w-3 animate-spin" />Gerando…</> : <><Wand2 className="h-3 w-3" />Gerar Ementa</>}
                </Button>
                {ementaGenerated && (
                  <Button type="button" variant="outline" size="sm" onClick={handleRefinarEmenta} disabled={refiningEmenta}
                    className="gap-1.5 text-xs border-accent-primary/40 text-accent-primary hover:bg-accent-primary/10">
                    {refiningEmenta ? <><Loader2 className="h-3 w-3 animate-spin" />Refinando…</> : <><Sparkles className="h-3 w-3" />Refinar com IA</>}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Modalidade */}
          <div className="space-y-1.5">
            <Label>Modalidade</Label>
            {constraints?.precisaPresencial && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-1">
                <AlertTriangle className="h-3 w-3" />
                NR(s) selecionada(s) exige(m) prática presencial — EAD puro não é permitido
              </div>
            )}
            <Select value={modalidade} onValueChange={setModalidade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ead" disabled={constraints?.precisaPresencial ?? false}>
                  EAD — 100% online {constraints?.precisaPresencial ? "(não permitido)" : ""}
                </SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="hibrido">Híbrido (EAD + prática presencial)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Carga horária */}
            <div className="space-y-1.5">
              <Label>
                Carga horária (horas)
                {constraints && constraints.minHoras > 0 && (
                  <span className="ml-1.5 text-[10px] text-amber-600 font-normal">
                    mín. exigido: {constraints.minHoras}h
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  type="number" min={0} step={0.5}
                  value={cargaHoraria}
                  onChange={(e) => setCargaHoraria(e.target.value)}
                  className={horasAbaixoDoMinimo ? "border-amber-500 focus-visible:ring-amber-500" : ""}
                />
              </div>
              {horasAbaixoDoMinimo && (
                <p className="text-[11px] text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Abaixo do mínimo exigido pela NR ({constraints!.minHoras}h)
                </p>
              )}
            </div>

            {/* Validade */}
            <div className="space-y-1.5">
              <Label>
                Validade em meses
                {constraints && constraints.minValidade > 0 && (
                  <span className="ml-1.5 text-[10px] text-amber-600 font-normal">
                    máx. permitido: {constraints.minValidade}m
                  </span>
                )}
              </Label>
              <Input
                type="number" min={0}
                value={validadeMeses}
                onChange={(e) => setValidadeMeses(e.target.value)}
                className={validadeAcimaDoLimite ? "border-amber-500 focus-visible:ring-amber-500" : ""}
                placeholder="0 = sem validade"
              />
              {validadeAcimaDoLimite && (
                <p className="text-[11px] text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Validade excede o prazo de reciclagem exigido pela NR ({constraints!.minValidade}m)
                </p>
              )}
            </div>
          </div>

          {/* Certificado */}
          <div className="space-y-1.5 flex flex-col">
            <Label className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              Emite certificado ao concluir
            </Label>
            <div className="flex items-center gap-2">
              <Switch checked={emiteCert} onCheckedChange={setEmiteCert} disabled={constraints?.precisaCert} />
              <span className="text-sm text-text-secondary">{emiteCert ? "Sim" : "Não"}</span>
              {constraints?.precisaCert && (
                <span className="text-[11px] text-amber-600">obrigatório pela NR</span>
              )}
            </div>
          </div>

          {/* Instrutor habilitado */}
          <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-accent-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-primary">
                Instrutor / Responsável Técnico
              </span>
              {constraints?.precisaPresencial && (
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600">obrigatório</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome completo</Label>
                <Input
                  value={instrutorNome}
                  onChange={(e) => setInstrutorNome(e.target.value)}
                  placeholder="Ex: João Silva"
                  className={constraints?.precisaPresencial && !instrutorNome.trim() ? "border-amber-500/60" : ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Habilitação / Registro</Label>
                <Input
                  value={instrutorHabilitacao}
                  onChange={(e) => setInstrutorHabilitacao(e.target.value)}
                  placeholder="Ex: TST — CRT 12345/SP"
                />
              </div>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Será impresso no certificado. NR-10, NR-33 e NR-35 exigem instrutor com habilitação específica.
            </p>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !titulo.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Criando…</> : "Criar curso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Cursos() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChildRoute = pathname !== "/admin/cursos" && pathname.startsWith("/admin/cursos/");
  const [list, setList] = useState<Course[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoadingList(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from("courses")
      .select("id, titulo, descricao, publicado, nr_codigo")
      .order("created_at", { ascending: false });
    if (error) setLoadError(error.message);
    setList((data ?? []) as Course[]);
    setLoadingList(false);
  };

  useEffect(() => { load(); }, []);

  // Quando estiver em /admin/cursos/$id, renderiza apenas o editor (Outlet)
  if (isChildRoute) {
    return <Outlet />;
  }

  const filtered = list.filter((c) => {
    const q = search.toLowerCase();
    return c.titulo.toLowerCase().includes(q) || (c.descricao ?? "").toLowerCase().includes(q);
  });

  const published = list.filter((c) => c.publicado).length;
  const drafts = list.length - published;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Conteúdo</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Cursos</h1>
          {list.length > 0 && (
            <p className="text-sm text-text-secondary mt-1">
              {published} publicado{published !== 1 ? "s" : ""} · {drafts} rascunho{drafts !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button variant="lp-primary" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Criar curso
        </Button>
      </div>

      {list.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar cursos…" />
        </div>
      )}

      <div className="grid gap-3">
        {loadingList && (
          <div className="lp-solid-card p-12 flex items-center justify-center gap-2 text-text-tertiary text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando cursos…
          </div>
        )}
        {!loadingList && loadError && (
          <div className="lp-solid-card p-8 text-center space-y-3 border-destructive/40">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
            <div className="text-text-primary font-semibold">Erro ao carregar cursos</div>
            <p className="text-sm text-text-secondary">{loadError}</p>
            <Button variant="outline" onClick={load}>Tentar novamente</Button>
          </div>
        )}
        {!loadingList && !loadError && filtered.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => nav({ to: "/admin/cursos/$id", params: { id: c.id } })}
            className="lp-solid-card p-5 flex items-center justify-between gap-4 w-full text-left hover:border-accent-primary/40 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-accent-primary/10 text-accent-primary grid place-items-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-text-primary truncate">{c.titulo}</div>
                <div className="text-sm text-text-secondary truncate">{c.descricao}</div>
                {c.nr_codigo && c.nr_codigo.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {c.nr_codigo.map((nr) => (
                      <Badge key={nr} variant="outline" className="text-[10px] font-mono py-0">{nr}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Badge variant={c.publicado ? "default" : "secondary"} className="shrink-0">
              {c.publicado ? "Publicado" : "Rascunho"}
            </Badge>
          </button>
        ))}
        {!loadingList && !loadError && list.length === 0 && (
          <div className="lp-solid-card p-16 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-text-tertiary mx-auto" />
            <div className="text-text-primary font-semibold">Nenhum curso ainda</div>
            <p className="text-sm text-text-secondary">Crie seu primeiro curso de treinamento.</p>
            <Button variant="lp-primary" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Criar primeiro curso
            </Button>
          </div>
        )}
        {!loadingList && !loadError && list.length > 0 && filtered.length === 0 && (
          <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
            Nenhum curso encontrado para "{search}".
          </div>
        )}
      </div>

      <CreateCourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(id) => {
          setDialogOpen(false);
          toast.success("Curso criado — configure o conteúdo abaixo");
          nav({ to: "/admin/cursos/$id", params: { id } });
        }}
      />
    </div>
  );
}
