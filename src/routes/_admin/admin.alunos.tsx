import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  UserPlus, Upload, ChevronDown, ChevronUp, BookOpen, CalendarDays,
  Trash2, Plus, Search, Loader2, CheckCircle2, XCircle, Lock, Unlock,
} from "lucide-react";
import { toast } from "sonner";
import ScrollReveal from "@/components/lp/ScrollReveal";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_admin/admin/alunos")({ component: Alunos });

interface Aluno {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  cpf: string | null;
}

interface CourseLite {
  id: string;
  titulo: string;
  validade_meses: number;
}

interface EnrollmentDetail {
  id: string;
  course_id: string;
  status: string;
  due_date: string | null;
  enrolled_at: string;
  bloqueado_acesso: boolean;
  courses: { titulo: string } | null;
  progressPct: number;
}

type CancelTarget = { enrollmentId: string; userId: string };
type CsvRow = { nome: string; email: string; cpf?: string; cargo?: string; setor?: string };
type CsvResultItem = { email: string; status: "convidado" | "atualizado" | "erro"; error?: string };
type CsvResult = { created: number; updated: number; errors: string[]; items: CsvResultItem[] };

const STATUS_META: Record<string, { label: string; cls: string }> = {
  ativo:     { label: "Em andamento", cls: "bg-accent-primary/10 text-accent-primary border-accent-primary/20" },
  concluido: { label: "Concluído",    cls: "bg-accent-success/10 text-accent-success border-accent-success/20" },
  expirando: { label: "Expirando",    cls: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" },
  vencido:   { label: "Vencido",      cls: "bg-destructive/10 text-destructive border-destructive/20" },
};

function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Map<string, EnrollmentDetail[]>>(new Map());
  const [loadingEnr, setLoadingEnr] = useState<Set<string>>(new Set());
  const [courses, setCourses] = useState<CourseLite[]>([]);

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteNome, setInviteNome] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  // Enroll dialog
  const [enrollTarget, setEnrollTarget] = useState<Aluno | null>(null);
  const [enrollCourseId, setEnrollCourseId] = useState("");
  const [enrollDue, setEnrollDue] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  // Cancel enrollment confirm
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);

  // CSV import
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvResult, setCsvResult] = useState<CsvResult | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const csvFileRef = useRef<HTMLInputElement>(null);

  const loadAlunos = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "aluno");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (!ids.length) { setAlunos([]); return; }
    const { data } = await supabase.from("profiles").select("id, nome, email, ativo, cpf").in("id", ids).order("nome");
    setAlunos((data ?? []) as Aluno[]);
  };

  const loadCourses = async () => {
    const { data } = await supabase.from("courses").select("id, titulo, validade_meses").eq("publicado", true).order("titulo");
    setCourses((data ?? []) as CourseLite[]);
  };

  useEffect(() => { loadAlunos(); loadCourses(); }, []);

  const loadEnrollments = async (userId: string) => {
    setLoadingEnr((prev) => new Set([...prev, userId]));

    const { data: enrs } = await supabase
      .from("enrollments")
      .select("id, course_id, status, due_date, enrolled_at, bloqueado_acesso, courses(titulo)")
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false });

    if (!enrs?.length) {
      setEnrollments((prev) => new Map([...prev, [userId, []]]));
      setLoadingEnr((prev) => { const s = new Set(prev); s.delete(userId); return s; });
      return;
    }

    const enrollmentIds = enrs.map((e) => e.id);
    const courseIds = [...new Set(enrs.map((e) => e.course_id))];

    const [{ data: progress }, { data: modules }] = await Promise.all([
      supabase.from("lesson_progress").select("enrollment_id").in("enrollment_id", enrollmentIds).eq("concluida", true),
      supabase.from("modules").select("id, course_id").in("course_id", courseIds),
    ]);

    const completedMap = new Map<string, number>();
    for (const p of progress ?? []) {
      completedMap.set(p.enrollment_id, (completedMap.get(p.enrollment_id) ?? 0) + 1);
    }

    const moduleIds = (modules ?? []).map((m) => m.id);
    const courseTotalMap = new Map<string, number>();
    if (moduleIds.length) {
      const { data: lessons } = await supabase.from("lessons").select("id, module_id").in("module_id", moduleIds);
      const modToCourse = new Map((modules ?? []).map((m) => [m.id, m.course_id]));
      for (const l of lessons ?? []) {
        const cid = modToCourse.get(l.module_id);
        if (cid) courseTotalMap.set(cid, (courseTotalMap.get(cid) ?? 0) + 1);
      }
    }

    const details: EnrollmentDetail[] = (enrs as EnrollmentDetail[]).map((e) => {
      const total = courseTotalMap.get(e.course_id) ?? 0;
      const done = completedMap.get(e.id) ?? 0;
      return { ...e, progressPct: total > 0 ? Math.round((done / total) * 100) : 0 };
    });

    setEnrollments((prev) => new Map([...prev, [userId, details]]));
    setLoadingEnr((prev) => { const s = new Set(prev); s.delete(userId); return s; });
  };

  const toggleExpand = (userId: string) => {
    if (expanded === userId) { setExpanded(null); return; }
    setExpanded(userId);
    if (!enrollments.has(userId)) loadEnrollments(userId);
  };

  const toggleAtivo = async (aluno: Aluno) => {
    const { error } = await supabase.from("profiles").update({ ativo: !aluno.ativo }).eq("id", aluno.id);
    if (error) return toast.error(error.message);
    toast.success(aluno.ativo ? "Aluno desativado" : "Aluno reativado");
    logAudit(aluno.ativo ? "aluno_desativado" : "aluno_reativado", "profiles", aluno.id, { email: aluno.email });
    setAlunos((prev) => prev.map((a) => a.id === aluno.id ? { ...a, ativo: !a.ativo } : a));
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteNome || !inviteEmail) return toast.error("Preencha nome e email");
    setInviting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-aluno`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email: inviteEmail, nome: inviteNome }),
    });
    setInviting(false);
    // A função pode responder texto simples (ex.: "Unauthorized"), não só JSON.
    const body = await res.json().catch(() => ({})) as { error?: string };
    if (!res.ok) return toast.error(body.error ?? `Erro ao enviar convite (${res.status})`);
    toast.success(`Convite enviado para ${inviteEmail}`);
    logAudit("aluno_convidado", "invitations", null, { email: inviteEmail, nome: inviteNome });
    setInviteNome(""); setInviteEmail(""); setInviteOpen(false);
  };

  const handleEnroll = async () => {
    if (!enrollTarget || !enrollCourseId) return;
    setEnrolling(true);
    const course = courses.find((c) => c.id === enrollCourseId);
    let due_date: string | null = enrollDue || null;
    if (!due_date && (course?.validade_meses ?? 0) > 0) {
      const d = new Date();
      d.setMonth(d.getMonth() + course!.validade_meses);
      due_date = d.toISOString().slice(0, 10);
    }
    const { error } = await supabase.from("enrollments").insert({
      user_id: enrollTarget.id, course_id: enrollCourseId, due_date,
    });
    setEnrolling(false);
    if (error) return toast.error(error.message === "duplicate key value violates unique constraint" ? "Aluno já matriculado neste curso" : error.message);
    toast.success("Matrícula realizada");
    logAudit("matricula_criada", "enrollments", null, { user_id: enrollTarget.id, course_id: enrollCourseId, due_date });
    setEnrollments((prev) => { const m = new Map(prev); m.delete(enrollTarget.id); return m; });
    if (expanded === enrollTarget.id) loadEnrollments(enrollTarget.id);
    setEnrollTarget(null); setEnrollCourseId(""); setEnrollDue("");
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    const { error } = await supabase.from("enrollments").delete().eq("id", cancelTarget.enrollmentId);
    if (error) return toast.error(error.message);
    logAudit("matricula_cancelada", "enrollments", cancelTarget.enrollmentId, { user_id: cancelTarget.userId });
    toast.success("Matrícula cancelada");
    loadEnrollments(cancelTarget.userId);
    setCancelTarget(null);
  };

  const toggleBloqueio = async (enr: EnrollmentDetail, userId: string) => {
    const novo = !enr.bloqueado_acesso;
    const { error } = await supabase.from("enrollments").update({ bloqueado_acesso: novo }).eq("id", enr.id);
    if (error) return toast.error(error.message);
    toast.success(novo ? "Acesso ao curso bloqueado" : "Acesso ao curso desbloqueado");
    logAudit(novo ? "acesso_bloqueado" : "acesso_desbloqueado", "enrollments", enr.id, { user_id: userId, course_id: enr.course_id });
    setEnrollments((prev) => {
      const list = prev.get(userId) ?? [];
      return new Map([...prev, [userId, list.map((e) => e.id === enr.id ? { ...e, bloqueado_acesso: novo } : e)]]);
    });
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { result.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    result.push(current.trim());
    return result;
  };

  const parseCSV = (text: string): { rows?: CsvRow[]; error?: string } => {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length) return { error: "Arquivo vazio" };
    const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/"/g, ""));
    const idx = (k: string) => header.indexOf(k);
    if (idx("nome") === -1 || idx("email") === -1)
      return { error: "CSV deve ter colunas 'nome' e 'email'" };
    const rows = lines.slice(1)
      .map((line) => {
        const cols = parseCSVLine(line);
        const get = (k: string) => (cols[idx(k)] ?? "").replace(/^"|"$/g, "").trim();
        return {
          nome:  get("nome"),
          email: get("email").toLowerCase(),
          cpf:   get("cpf")   || undefined,
          cargo: get("cargo") || undefined,
          setor: get("setor") || undefined,
        };
      })
      .filter((r) => r.email && r.nome);
    if (!rows.length) return { error: "Nenhuma linha válida encontrada" };
    return { rows };
  };

  const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = parseCSV(ev.target?.result as string);
      if (result.error) { toast.error(result.error); return; }
      setCsvRows(result.rows!);
      setCsvResult(null);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleCSVImport = async () => {
    if (!csvRows.length) return;
    setCsvImporting(true);
    const { data, error } = await supabase.functions.invoke("bulk-import-alunos", {
      body: { rows: csvRows },
    });
    setCsvImporting(false);
    if (error) { toast.error(error.message); return; }
    const { created, updated, errors: errCount, results } = data as {
      created: number; updated: number; errors: number;
      results: CsvResultItem[];
    };
    setCsvResult({
      created,
      updated,
      errors: results.filter((r) => r.status === "erro").map((r) => `${r.email}: ${r.error ?? "erro"}`),
      items: results,
    });
    logAudit("importacao_csv", "profiles", null, { created, updated, errors: errCount, total: csvRows.length });
    if (errCount === 0) loadAlunos();
    toast.success(`${created} convidado${created !== 1 ? "s" : ""} · ${updated} atualizado${updated !== 1 ? "s" : ""}`);
  };

  const filtered = alunos.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.nome?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Pessoas</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Alunos</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setCsvRows([]); setCsvResult(null); setCsvOpen(true); }}>
            <Upload className="h-4 w-4 mr-2" />Importar CSV
          </Button>
          <Button variant="lp-primary" size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />Convidar aluno
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email…"
          className="pl-9"
        />
      </div>

      {/* List */}
      <div className="grid gap-2">
        {filtered.map((aluno, i) => {
          const isExpanded = expanded === aluno.id;
          const enrs = enrollments.get(aluno.id);
          const isLoading = loadingEnr.has(aluno.id);

          return (
            <ScrollReveal key={aluno.id} delay={i * 0.03}>
              <div className="lp-solid-card overflow-hidden">
                {/* Card header */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-accent-primary/10 text-accent-primary font-semibold grid place-items-center shrink-0 text-sm">
                      {(aluno.nome || aluno.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-text-primary truncate">{aluno.nome || "(sem nome)"}</div>
                      <div className="text-sm text-text-secondary truncate">{aluno.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={aluno.ativo ? "default" : "secondary"}>
                      {aluno.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setEnrollTarget(aluno)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />Matricular
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs ${aluno.ativo ? "text-destructive hover:text-destructive" : "text-accent-success hover:text-accent-success"}`}
                      onClick={() => toggleAtivo(aluno)}
                    >
                      {aluno.ativo ? "Desativar" : "Reativar"}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpand(aluno.id)}>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded enrollments */}
                {isExpanded && (
                  <div className="border-t border-border-subtle bg-bg-surface-2/50 px-5 py-4">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-text-tertiary py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />Carregando matrículas…
                      </div>
                    ) : !enrs?.length ? (
                      <p className="text-sm text-text-tertiary py-1">Nenhuma matrícula.</p>
                    ) : (
                      <div className="space-y-2">
                        {enrs.map((enr) => {
                          const meta = STATUS_META[enr.status] ?? STATUS_META.ativo;
                          return (
                            <div key={enr.id} className={`flex items-center gap-3 bg-bg-elevated rounded-lg px-4 py-3 ${enr.bloqueado_acesso ? "border border-destructive/20" : ""}`}>
                              <BookOpen className={`h-4 w-4 shrink-0 ${enr.bloqueado_acesso ? "text-destructive/60" : "text-text-tertiary"}`} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-text-primary truncate">
                                  {enr.courses?.titulo ?? "Curso removido"}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  <span className={`inline-flex text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.cls}`}>
                                    {meta.label}
                                  </span>
                                  {enr.bloqueado_acesso && (
                                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-destructive">
                                      <Lock className="h-3 w-3" />Bloqueado
                                    </span>
                                  )}
                                  {enr.due_date && (
                                    <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                                      <CalendarDays className="h-3 w-3" />
                                      {new Date(enr.due_date).toLocaleDateString("pt-BR")}
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                                    <div className="w-16 h-1 rounded-full bg-bg-surface-2 overflow-hidden">
                                      <div className="h-full bg-accent-primary" style={{ width: `${enr.progressPct}%` }} />
                                    </div>
                                    {enr.progressPct}%
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 shrink-0 ${enr.bloqueado_acesso ? "text-accent-success hover:text-accent-success" : "text-amber-600 hover:text-amber-600"}`}
                                title={enr.bloqueado_acesso ? "Desbloquear acesso" : "Bloquear acesso"}
                                onClick={() => toggleBloqueio(enr, aluno.id)}
                              >
                                {enr.bloqueado_acesso ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                                onClick={() => setCancelTarget({ enrollmentId: enr.id, userId: aluno.id })}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollReveal>
          );
        })}

        {!filtered.length && (
          <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
            {search ? "Nenhum aluno encontrado para esta busca." : "Nenhum aluno cadastrado. Convide alguém acima."}
          </div>
        )}
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Convidar aluno</DialogTitle></DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input value={inviteNome} onChange={(e) => setInviteNome(e.target.value)} placeholder="João Silva" required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="joao@empresa.com" required />
            </div>
            <p className="text-xs text-text-tertiary">
              O aluno receberá um email com o link para definir sua senha e acessar a plataforma.
            </p>
            <Button type="submit" className="w-full" disabled={inviting}>
              {inviting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando…</> : "Enviar convite"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enroll dialog */}
      <Dialog open={!!enrollTarget} onOpenChange={(o) => { if (!o) { setEnrollTarget(null); setEnrollCourseId(""); setEnrollDue(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Matricular {enrollTarget?.nome?.split(" ")[0] ?? "aluno"} em curso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Curso</Label>
              <Select value={enrollCourseId} onValueChange={setEnrollCourseId}>
                <SelectTrigger><SelectValue placeholder="Selecione um curso…" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data de vencimento <span className="text-text-tertiary font-normal">(opcional — usa validade do curso se vazio)</span></Label>
              <Input type="date" value={enrollDue} onChange={(e) => setEnrollDue(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollTarget(null)}>Cancelar</Button>
            <Button onClick={handleEnroll} disabled={!enrollCourseId || enrolling}>
              {enrolling ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Matriculando…</> : "Matricular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel enrollment confirm */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => { if (!o) setCancelTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar matrícula?</AlertDialogTitle>
            <AlertDialogDescription>
              O progresso e as tentativas de avaliação deste aluno neste curso serão mantidos, mas a matrícula será removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">
              Cancelar matrícula
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSV Import dialog */}
      <Dialog open={csvOpen} onOpenChange={(o) => { if (!o && !csvImporting) { setCsvOpen(false); setCsvRows([]); setCsvResult(null); if (csvFileRef.current) csvFileRef.current.value = ""; } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Importar alunos via CSV</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-text-secondary">
              Colunas obrigatórias: <code className="bg-bg-surface-2 px-1 rounded text-xs">nome</code>,{" "}
              <code className="bg-bg-surface-2 px-1 rounded text-xs">email</code>. Opcionais:{" "}
              <code className="bg-bg-surface-2 px-1 rounded text-xs">cpf</code>,{" "}
              <code className="bg-bg-surface-2 px-1 rounded text-xs">cargo</code>,{" "}
              <code className="bg-bg-surface-2 px-1 rounded text-xs">setor</code>. Máx. 200 linhas.
            </p>

            {!csvResult && (
              <div>
                <input ref={csvFileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVFile} />
                <Button variant="outline" className="w-full" onClick={() => csvFileRef.current?.click()} disabled={csvImporting}>
                  <Upload className="h-4 w-4 mr-2" />
                  {csvRows.length ? `${csvRows.length} linha${csvRows.length !== 1 ? "s" : ""} carregada${csvRows.length !== 1 ? "s" : ""}` : "Selecionar arquivo…"}
                </Button>
              </div>
            )}

            {csvRows.length > 0 && !csvResult && (() => {
              const hasCpf   = csvRows.some((r) => r.cpf);
              const hasCargo = csvRows.some((r) => r.cargo);
              const hasSetor = csvRows.some((r) => r.setor);
              return (
                <div className="max-h-52 overflow-y-auto rounded-lg border border-border-subtle text-sm">
                  <table className="w-full">
                    <thead className="bg-bg-surface-2/80 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-text-tertiary uppercase tracking-widest">Nome</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-text-tertiary uppercase tracking-widest">Email</th>
                        {hasCpf   && <th className="px-3 py-2 text-left text-xs font-semibold text-text-tertiary uppercase tracking-widest">CPF</th>}
                        {hasCargo && <th className="px-3 py-2 text-left text-xs font-semibold text-text-tertiary uppercase tracking-widest">Cargo</th>}
                        {hasSetor && <th className="px-3 py-2 text-left text-xs font-semibold text-text-tertiary uppercase tracking-widest">Setor</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {csvRows.slice(0, 12).map((r, i) => (
                        <tr key={i} className="hover:bg-bg-surface-2/30">
                          <td className="px-3 py-2 font-medium text-text-primary">{r.nome}</td>
                          <td className="px-3 py-2 text-text-secondary truncate max-w-[180px]">{r.email}</td>
                          {hasCpf   && <td className="px-3 py-2 text-text-tertiary font-mono text-xs">{r.cpf ?? "—"}</td>}
                          {hasCargo && <td className="px-3 py-2 text-text-secondary">{r.cargo ?? "—"}</td>}
                          {hasSetor && <td className="px-3 py-2 text-text-secondary">{r.setor ?? "—"}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvRows.length > 12 && (
                    <div className="px-3 py-2 text-xs text-text-tertiary text-center border-t border-border-subtle">
                      +{csvRows.length - 12} linhas não exibidas
                    </div>
                  )}
                </div>
              );
            })()}

            {csvImporting && (
              <div className="flex items-center justify-center gap-3 py-6 text-text-secondary text-sm">
                <Loader2 className="h-5 w-5 animate-spin text-accent-primary" />
                Importando {csvRows.length} aluno{csvRows.length !== 1 ? "s" : ""}…
              </div>
            )}

            {csvResult && !csvImporting && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-accent-success/10 p-3 text-center">
                    <div className="text-2xl font-bold text-accent-success tabular-nums">{csvResult.created}</div>
                    <div className="text-xs text-accent-success/80 mt-0.5">Convidado{csvResult.created !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="rounded-xl bg-accent-primary/10 p-3 text-center">
                    <div className="text-2xl font-bold text-accent-primary tabular-nums">{csvResult.updated}</div>
                    <div className="text-xs text-accent-primary/80 mt-0.5">Atualizado{csvResult.updated !== 1 ? "s" : ""}</div>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${csvResult.errors.length ? "bg-destructive/10" : "bg-bg-surface-2"}`}>
                    <div className={`text-2xl font-bold tabular-nums ${csvResult.errors.length ? "text-destructive" : "text-text-tertiary"}`}>{csvResult.errors.length}</div>
                    <div className={`text-xs mt-0.5 ${csvResult.errors.length ? "text-destructive/80" : "text-text-tertiary"}`}>Erro{csvResult.errors.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                {csvResult.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto rounded-lg border border-destructive/20 bg-destructive/5 divide-y divide-destructive/10">
                    {csvResult.errors.map((err, i) => (
                      <div key={i} className="px-3 py-2 text-xs text-destructive flex items-start gap-2">
                        <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{err}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCsvOpen(false)} disabled={csvImporting}>Fechar</Button>
            {csvResult ? (
              <Button variant="outline" onClick={() => { setCsvRows([]); setCsvResult(null); if (csvFileRef.current) csvFileRef.current.value = ""; }}>
                Nova importação
              </Button>
            ) : (
              <Button onClick={handleCSVImport} disabled={!csvRows.length || csvImporting}>
                {csvImporting
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importando…</>
                  : `Importar ${csvRows.length} aluno${csvRows.length !== 1 ? "s" : ""}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
