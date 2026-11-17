import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Pencil, Trash2, Sparkles, ArrowUp, ArrowDown,
  CheckCircle2, AlertTriangle, Loader2, BookOpen,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/cargos")({ component: Cargos });

interface JobRole { id: string; nome: string; descricao: string | null }
interface CourseLite { id: string; titulo: string; nr_codigo: string[]; publicado: boolean }
interface PathReq {
  id: string; job_role_id: string; course_id: string; ordem: number;
  obrigatorio: boolean; prerequisite_course_id: string | null;
}
interface AISuggestion { numero: string; obrigatorio: boolean; justificativa: string }

function Cargos() {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [courses, setCourses] = useState<CourseLite[]>([]);
  const [selected, setSelected] = useState<JobRole | null>(null);
  const [reqs, setReqs] = useState<PathReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReqs, setLoadingReqs] = useState(false);

  // Dialogs
  const [roleDialog, setRoleDialog] = useState<"new" | "edit" | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JobRole | null>(null);

  // Add course to trail
  const [addCourseId, setAddCourseId] = useState("");
  const [addingCourse, setAddingCourse] = useState(false);

  // AI suggestion
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[] | null>(null);
  const [aiSelected, setAiSelected] = useState<Set<string>>(new Set());

  const loadRoles = useCallback(async () => {
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase.from("job_roles").select("*").order("nome"),
      supabase.from("courses").select("id, titulo, nr_codigo, publicado").order("titulo"),
    ]);
    setRoles((r ?? []) as JobRole[]);
    setCourses((c ?? []) as CourseLite[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const loadReqs = useCallback(async (roleId: string) => {
    setLoadingReqs(true);
    const { data } = await supabase
      .from("path_requirements")
      .select("*")
      .eq("job_role_id", roleId)
      .order("ordem");
    setReqs((data ?? []) as PathReq[]);
    setLoadingReqs(false);
  }, []);

  const selectRole = (role: JobRole) => {
    setSelected(role);
    loadReqs(role.id);
    setAddCourseId("");
    setAiSuggestions(null);
  };

  // CRUD role
  const openNew = () => { setEditNome(""); setEditDesc(""); setRoleDialog("new"); };
  const openEdit = (r: JobRole) => { setEditNome(r.nome); setEditDesc(r.descricao ?? ""); setRoleDialog("edit"); };

  const saveRole = async () => {
    if (!editNome.trim()) return toast.error("Nome obrigatório");
    setSavingRole(true);
    if (roleDialog === "new") {
      const { data, error } = await supabase.from("job_roles").insert({ nome: editNome.trim(), descricao: editDesc.trim() || null }).select().single();
      if (error) { toast.error(error.message); setSavingRole(false); return; }
      await loadRoles();
      selectRole(data as JobRole);
    } else if (selected) {
      const { error } = await supabase.from("job_roles").update({ nome: editNome.trim(), descricao: editDesc.trim() || null }).eq("id", selected.id);
      if (error) { toast.error(error.message); setSavingRole(false); return; }
      await loadRoles();
      setSelected((prev) => prev ? { ...prev, nome: editNome.trim(), descricao: editDesc.trim() || null } : prev);
    }
    setSavingRole(false);
    setRoleDialog(null);
  };

  const deleteRole = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("job_roles").delete().eq("id", deleteTarget.id);
    if (error) return toast.error(error.message);
    toast.success("Cargo removido");
    if (selected?.id === deleteTarget.id) { setSelected(null); setReqs([]); }
    setDeleteTarget(null);
    await loadRoles();
  };

  // Trail management
  const addCourse = async () => {
    if (!selected || !addCourseId) return;
    setAddingCourse(true);
    const nextOrdem = reqs.length ? Math.max(...reqs.map((r) => r.ordem)) + 1 : 0;
    const { error } = await supabase.from("path_requirements").insert({
      job_role_id: selected.id, course_id: addCourseId, ordem: nextOrdem, obrigatorio: true,
    });
    setAddingCourse(false);
    if (error) return toast.error(error.message);
    setAddCourseId("");
    await loadReqs(selected.id);
  };

  const removeReq = async (reqId: string) => {
    const { error } = await supabase.from("path_requirements").delete().eq("id", reqId);
    if (error) return toast.error(error.message);
    if (selected) await loadReqs(selected.id);
  };

  const toggleObrigatorio = async (req: PathReq) => {
    const { error } = await supabase.from("path_requirements").update({ obrigatorio: !req.obrigatorio }).eq("id", req.id);
    if (error) return toast.error(error.message);
    setReqs((prev) => prev.map((r) => r.id === req.id ? { ...r, obrigatorio: !r.obrigatorio } : r));
  };

  const moveReq = async (req: PathReq, dir: -1 | 1) => {
    const idx = reqs.findIndex((r) => r.id === req.id);
    const other = reqs[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from("path_requirements").update({ ordem: other.ordem }).eq("id", req.id),
      supabase.from("path_requirements").update({ ordem: req.ordem }).eq("id", other.id),
    ]);
    if (selected) await loadReqs(selected.id);
  };

  // AI trail suggestion
  const suggestTrail = async () => {
    if (!selected) return;
    setAiLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-trail`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ job_role_nome: selected.nome, job_role_descricao: selected.descricao }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string })?.error ?? `Erro ${res.status}`);
      }
      const body = await res.json();
      const suggestions = (body.nrs ?? []) as AISuggestion[];
      setAiSuggestions(suggestions);
      setAiSelected(new Set(suggestions.map((s) => s.numero)));
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Erro ao consultar IA");
    } finally {
      setAiLoading(false);
    }
  };

  // NR coverage analysis (split by publish status)
  const reqCourses = reqs
    .map((r) => courses.find((c) => c.id === r.course_id))
    .filter((c): c is CourseLite => !!c);
  const coveredNRs = new Set(reqCourses.flatMap((c) => c.nr_codigo ?? []));
  const coveredPublishedNRs = new Set(
    reqCourses.filter((c) => c.publicado).flatMap((c) => c.nr_codigo ?? [])
  );
  const hasDraftInTrail = reqCourses.some((c) => !c.publicado);

  // courses in trail
  const trailCourseIds = new Set(reqs.map((r) => r.course_id));
  const availableCourses = courses.filter((c) => !trailCourseIds.has(c.id));

  if (loading) return <div className="text-text-secondary text-sm">Carregando…</div>;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Estrutura</span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Cargos e Trilhas</h1>
        <p className="text-sm text-text-secondary mt-1">Defina quais treinamentos cada cargo deve concluir.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: role list */}
        <div className="space-y-3">
          <Button variant="lp-primary" className="w-full" onClick={openNew}>
            <Plus className="h-4 w-4" /> Novo cargo
          </Button>
          {roles.length === 0 && (
            <div className="lp-solid-card p-8 text-center text-text-tertiary text-sm">Nenhum cargo cadastrado.</div>
          )}
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => selectRole(role)}
              className={`lp-solid-card p-4 w-full text-left transition-colors ${
                selected?.id === role.id ? "border-accent-primary/50 bg-accent-primary/5" : "hover:border-accent-primary/30"
              }`}
            >
              <div className="font-semibold text-text-primary text-sm">{role.nome}</div>
              {role.descricao && <div className="text-xs text-text-secondary mt-0.5 truncate">{role.descricao}</div>}
            </button>
          ))}
        </div>

        {/* Right: trail editor */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="lp-solid-card p-16 text-center text-text-tertiary">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Selecione um cargo para editar sua trilha de treinamento.</p>
            </div>
          ) : (
            <>
              <div className="lp-solid-card p-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">{selected.nome}</h2>
                  {selected.descricao && <p className="text-sm text-text-secondary mt-0.5">{selected.descricao}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => openEdit(selected)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(selected)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* AI suggestion button */}
              <div className="lp-solid-card p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-text-primary">Sugestão de trilha por IA</div>
                  <div className="text-xs text-text-secondary">A IA analisa o cargo e sugere quais NRs se aplicam com justificativa legal.</div>
                </div>
                <Button variant="outline" size="sm" onClick={suggestTrail} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {aiLoading ? "Consultando…" : "Sugerir com IA"}
                </Button>
              </div>

              {/* NR coverage */}
              {reqs.length > 0 && coveredNRs.size > 0 && (
                <div className="lp-solid-card p-4 space-y-2">
                  <div className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">Cobertura de NRs na trilha</div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(coveredNRs).map((nr) => (
                      <Badge key={nr} variant="secondary" className="text-xs gap-1">
                        {coveredPublishedNRs.has(nr)
                          ? <CheckCircle2 className="h-3 w-3 text-accent-success" />
                          : <AlertTriangle className="h-3 w-3 text-accent-warm" />}
                        {nr}
                      </Badge>
                    ))}
                  </div>
                  {hasDraftInTrail && (
                    <div className="text-[11px] text-accent-warm flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Esta trilha contém cursos em rascunho. Publique-os para que a cobertura fique efetiva para os alunos.
                    </div>
                  )}
                </div>
              )}

              {/* Trail courses */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-text-primary">Trilha de treinamento</div>
                {loadingReqs && <div className="text-xs text-text-tertiary">Carregando…</div>}
                {!loadingReqs && reqs.length === 0 && (
                  <div className="lp-solid-card p-8 text-center text-text-tertiary text-sm">
                    Nenhum treinamento na trilha. Adicione abaixo.
                  </div>
                )}
                {reqs.map((req, idx) => {
                  const course = courses.find((c) => c.id === req.course_id);
                  return (
                    <div key={req.id} className="lp-solid-card p-4 flex items-center gap-3">
                      <div className="text-xs text-text-tertiary w-5 text-right shrink-0">{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate flex items-center gap-2">
                          <span className="truncate">{course?.titulo ?? "Curso removido"}</span>
                          {course && !course.publicado && (
                            <Badge variant="outline" className="text-[10px] border-accent-warm/50 text-accent-warm shrink-0">Rascunho</Badge>
                          )}
                        </div>
                        {course && !course.publicado && (
                          <div className="text-[11px] text-accent-warm/80 mt-0.5">
                            Não publicado — alunos não verão até publicar.
                          </div>
                        )}
                        {course?.nr_codigo && course.nr_codigo.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {course.nr_codigo.map((nr) => (
                              <Badge key={nr} variant="outline" className="text-[10px] font-mono py-0">{nr}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-text-tertiary mr-1">Obrig.</span>
                        <Switch checked={req.obrigatorio} onCheckedChange={() => toggleObrigatorio(req)} />
                        <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => moveReq(req, -1)}>
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === reqs.length - 1} onClick={() => moveReq(req, 1)}>
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeReq(req.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Add course */}
                {courses.length === 0 ? (
                  <div className="lp-solid-card p-4 text-sm text-text-secondary flex items-center justify-between gap-3">
                    <span>Nenhum curso cadastrado ainda.</span>
                    <Button asChild size="sm" variant="lp-primary">
                      <Link to="/admin/cursos">Criar curso</Link>
                    </Button>
                  </div>
                ) : availableCourses.length === 0 ? (
                  <div className="lp-solid-card p-4 text-sm text-text-tertiary flex items-center justify-between gap-3">
                    <span>Todos os cursos disponíveis já estão nesta trilha.</span>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/cursos">Gerenciar cursos</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select value={addCourseId} onValueChange={setAddCourseId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Adicionar curso à trilha…" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="flex items-center gap-2">
                              <span>{c.titulo}</span>
                              {c.nr_codigo?.length > 0 && (
                                <span className="text-xs text-text-tertiary">({c.nr_codigo.join(", ")})</span>
                              )}
                              {!c.publicado && (
                                <Badge variant="outline" className="text-[10px] border-accent-warm/50 text-accent-warm">Rascunho</Badge>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addCourse} disabled={!addCourseId || addingCourse} variant="lp-primary">
                      {addingCourse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Role dialog */}
      <Dialog open={!!roleDialog} onOpenChange={(o) => { if (!o) setRoleDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{roleDialog === "new" ? "Novo cargo" : "Editar cargo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome do cargo <span className="text-destructive">*</span></Label>
              <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} placeholder="Ex: Operador de Empilhadeira" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} placeholder="Atividades e responsabilidades do cargo" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog(null)} disabled={savingRole}>Cancelar</Button>
            <Button variant="lp-primary" onClick={saveRole} disabled={savingRole || !editNome.trim()}>
              {savingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cargo "{deleteTarget?.nome}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o cargo e sua trilha de treinamento. Alunos já matriculados não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteRole} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI suggestions modal */}
      <Dialog open={!!aiSuggestions} onOpenChange={(o) => { if (!o) setAiSuggestions(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sugestão de NRs para "{selected?.nome}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {aiSuggestions?.map((s) => (
              <label key={s.numero} className="lp-solid-card p-4 flex gap-3 cursor-pointer hover:bg-muted/20">
                <Checkbox
                  checked={aiSelected.has(s.numero)}
                  onCheckedChange={(c) => setAiSelected((prev) => {
                    const n = new Set(prev);
                    if (c) n.add(s.numero); else n.delete(s.numero);
                    return n;
                  })}
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge className="font-mono text-xs">{s.numero}</Badge>
                    {s.obrigatorio
                      ? <Badge variant="destructive" className="text-[10px]">Obrigatório</Badge>
                      : <Badge variant="secondary" className="text-[10px]">Recomendado</Badge>}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{s.justificativa}</p>
                  {coveredNRs.has(s.numero) && (
                    <div className="flex items-center gap-1 text-xs text-accent-success mt-1">
                      <CheckCircle2 className="h-3 w-3" />Já coberta por curso na trilha
                    </div>
                  )}
                  {!coveredNRs.has(s.numero) && (
                    <div className="flex items-center gap-1 text-xs text-accent-warm mt-1">
                      <AlertTriangle className="h-3 w-3" />Sem curso cobrindo esta NR
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAiSuggestions(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
