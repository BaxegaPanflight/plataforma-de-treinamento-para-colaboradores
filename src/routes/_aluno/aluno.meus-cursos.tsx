import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, CalendarDays, Loader2, Shield, AlertTriangle, Ban } from "lucide-react";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/_aluno/aluno/meus-cursos")({ component: Mine });

type EnrollStatus = "ativo" | "concluido" | "expirando" | "vencido";

interface CourseLite {
  id: string;
  titulo: string;
  nr_codigo: string[] | null;
}

interface EnrollmentItem {
  id: string;
  course_id: string;
  status: EnrollStatus;
  due_date: string | null;
  bloqueado_acesso: boolean;
  courses: CourseLite | null;
  progressPct: number;
}

const STATUS_META: Record<EnrollStatus, { label: string; variant: "default" | "secondary" | "destructive"; className?: string }> = {
  ativo:      { label: "Em andamento", variant: "secondary" },
  concluido:  { label: "Concluído",    variant: "default" },
  expirando:  { label: "Expirando",    variant: "secondary", className: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" },
  vencido:    { label: "Vencido",      variant: "destructive" },
};

function daysLeft(due: string | null) {
  if (!due) return null;
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
}

function formatDate(iso: string | null): string {
  if (!iso) return "Sem validade";
  const [y, m, d] = iso.split("-");
  return `Válido até ${d}/${m}/${y}`;
}

function Mine() {
  const { user } = useAuth();
  const [list, setList] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Single batch query — no N+1
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, course_id, status, due_date, bloqueado_acesso, courses(id, titulo, nr_codigo)")
        .eq("user_id", user.id);

      if (!enrollments?.length) { setList([]); setLoading(false); return; }

      const courseIds    = [...new Set(enrollments.map((e) => e.course_id))];
      const enrollmentIds = enrollments.map((e) => e.id);

      // Parallel: modules (for lesson totals) + completed lesson_progress
      const [{ data: allMods }, { data: allProgress }] = await Promise.all([
        supabase.from("modules").select("id, course_id").in("course_id", courseIds),
        supabase.from("lesson_progress")
          .select("enrollment_id, lesson_id")
          .in("enrollment_id", enrollmentIds)
          .eq("concluida", true),
      ]);

      const modIds = (allMods ?? []).map((m) => m.id);
      const { data: allLessons } = modIds.length
        ? await supabase.from("lessons").select("id, module_id").in("module_id", modIds)
        : { data: [] as { id: string; module_id: string }[] };

      // Build maps
      const lessonCountByCourse = new Map<string, number>();
      const modToCourse = new Map((allMods ?? []).map((m) => [m.id, m.course_id]));
      for (const l of allLessons ?? []) {
        const cid = modToCourse.get(l.module_id) ?? "";
        lessonCountByCourse.set(cid, (lessonCountByCourse.get(cid) ?? 0) + 1);
      }

      const doneByEnrollment = new Map<string, number>();
      for (const p of allProgress ?? []) {
        doneByEnrollment.set(p.enrollment_id, (doneByEnrollment.get(p.enrollment_id) ?? 0) + 1);
      }

      const items: EnrollmentItem[] = (enrollments as EnrollmentItem[]).map((e) => {
        const total = lessonCountByCourse.get(e.course_id) ?? 0;
        const done  = doneByEnrollment.get(e.id) ?? 0;
        return { ...e, progressPct: total > 0 ? Math.round((done / total) * 100) : 0 };
      });

      // Sort: expirando/vencido first, then by due_date asc
      items.sort((a, b) => {
        const order: Record<EnrollStatus, number> = { vencido: 0, expirando: 1, ativo: 2, concluido: 3 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
        return 0;
      });

      setList(items);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Sua jornada</span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Meus cursos</h1>
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 flex items-center justify-center gap-2 text-text-tertiary text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : (
        <div className="grid gap-3">
          {list.map((e, i) => {
            const meta = STATUS_META[e.status];
            const days = daysLeft(e.due_date);
            const urgent = e.status === "expirando" || (days !== null && days <= 15 && days > 0);
            const bloqueado = e.bloqueado_acesso;

            const inner = (
              <div className={`lp-solid-card p-5 flex items-center justify-between gap-4 ${bloqueado ? "border-destructive/30 opacity-70" : urgent ? "border-yellow-500/40" : e.status === "vencido" ? "border-destructive/30" : ""}`}>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-text-primary truncate">{e.courses?.titulo}</div>
                  {e.courses?.nr_codigo?.length ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {e.courses.nr_codigo.map((nr) => (
                        <Badge key={nr} variant="secondary" className="text-[10px] bg-accent-primary/10 text-accent-primary border-accent-primary/20 font-mono py-0">
                          <Shield className="h-2.5 w-2.5 mr-0.5" />{nr}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-text-tertiary">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span>{formatDate(e.due_date)}</span>
                    {urgent && days !== null && days > 0 && (
                      <span className="text-yellow-600 font-medium flex items-center gap-0.5">
                        <AlertTriangle className="h-3 w-3" />{days}d restantes
                      </span>
                    )}
                    {e.status === "vencido" && (
                      <span className="text-destructive font-medium flex items-center gap-0.5">
                        <AlertTriangle className="h-3 w-3" />Vencido
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 max-w-xs">
                    <div className="h-1.5 rounded-full bg-bg-surface-2 overflow-hidden flex-1">
                      <div
                        className={`h-full transition-all ${e.status === "vencido" ? "bg-destructive/60" : urgent ? "bg-yellow-500" : "bg-accent-primary"}`}
                        style={{ width: `${e.progressPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-text-tertiary tabular-nums">{e.progressPct}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {bloqueado ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Ban className="h-3 w-3" />Bloqueado
                    </Badge>
                  ) : (
                    <>
                      <Badge variant={meta.variant} className={meta.className}>{meta.label}</Badge>
                      <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-accent-primary transition-colors" />
                    </>
                  )}
                </div>
              </div>
            );

            return (
              <ScrollReveal key={e.id} delay={i * 0.05}>
                {bloqueado ? (
                  <div>{inner}</div>
                ) : (
                  <Link to="/aluno/curso/$id" params={{ id: e.course_id }} className="block group">
                    {inner}
                  </Link>
                )}
              </ScrollReveal>
            );
          })}
          {!list.length && (
            <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
              Nenhuma matrícula ainda.{" "}
              <Link to="/aluno/catalogo" className="text-accent-primary hover:underline">Acesse o catálogo.</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
