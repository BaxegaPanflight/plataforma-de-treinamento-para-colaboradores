import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, Shield, AlertTriangle, CheckCircle2, Clock, ArrowRight, HardHat,
} from "lucide-react";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/_aluno/aluno/minha-trilha")({ component: MinhaTrilha });

interface TrilhaRow {
  course_id: string;
  curso_titulo: string;
  nr_codigo: string[] | null;
  compliance_status: string;
  due_date: string | null;
  job_role_nome: string;
  cargo: string | null;
  setor: string | null;
  obrigatorio: boolean;
}

const STATUS_ORDER: Record<string, number> = {
  vencido: 0, em_andamento: 1, pendente: 2, concluido: 3,
};

function daysLeft(due: string | null) {
  if (!due) return null;
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "Sem validade";
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

function StatusBadge({ status, days }: { status: string; days: number | null }) {
  const urgent = days !== null && days >= 0 && days <= 30 && status === "em_andamento";
  if (status === "concluido")
    return <Badge className="bg-accent-success/10 text-accent-success border-accent-success/20"><CheckCircle2 className="h-3 w-3 mr-1" />Concluído</Badge>;
  if (status === "vencido")
    return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Vencido</Badge>;
  if (urgent)
    return <Badge className="bg-yellow-500/15 text-yellow-600 border-yellow-500/30 gap-1"><AlertTriangle className="h-3 w-3" />Expirando</Badge>;
  if (status === "em_andamento")
    return <Badge className="bg-accent-primary/10 text-accent-primary border-accent-primary/20 gap-1"><Clock className="h-3 w-3" />Em andamento</Badge>;
  return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Não iniciado</Badge>;
}

function ActionBtn({ row }: { row: TrilhaRow }) {
  const label =
    row.compliance_status === "concluido"    ? "Acessar"   :
    row.compliance_status === "vencido"      ? "Renovar"   :
    row.compliance_status === "em_andamento" ? "Continuar" : "Iniciar";
  const variant = row.compliance_status === "vencido" ? "destructive" : "lp-primary";
  return (
    <Link to="/aluno/curso/$id" params={{ id: row.course_id }}>
      <Button size="sm" variant={variant as "destructive" | "lp-primary"} className="gap-1.5 shrink-0">
        {label} <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </Link>
  );
}

function MinhaTrilha() {
  const { user } = useAuth();
  const [rows, setRows]     = useState<TrilhaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRole, setHasRole] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Check if user has a job_role assigned
      const { data: prof } = await supabase
        .from("profiles")
        .select("job_role_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!prof?.job_role_id) {
        setHasRole(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("vw_compliance")
        .select("course_id, curso_titulo, nr_codigo, compliance_status, due_date, job_role_nome, cargo, setor, obrigatorio")
        .eq("user_id", user.id)
        .order("curso_titulo");

      const sorted = ((data ?? []) as TrilhaRow[]).sort((a, b) => {
        const oa = STATUS_ORDER[a.compliance_status] ?? 5;
        const ob = STATUS_ORDER[b.compliance_status] ?? 5;
        if (oa !== ob) return oa - ob;
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
        return 0;
      });

      setRows(sorted);
      setLoading(false);
    })();
  }, [user]);

  const total     = rows.length;
  const concluido = rows.filter((r) => r.compliance_status === "concluido").length;
  const vencido   = rows.filter((r) => r.compliance_status === "vencido").length;
  const pct       = total > 0 ? Math.round((concluido / total) * 100) : 0;
  const jobRole   = rows[0]?.job_role_nome ?? "";
  const cargo     = rows[0]?.cargo ?? "";

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">NR Compliance</span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Minha Trilha</h1>
        {(cargo || jobRole) && (
          <p className="text-sm text-text-secondary mt-1">
            {cargo && <span className="font-medium text-text-primary">{cargo}</span>}
            {cargo && jobRole && " · "}
            {jobRole && <span>Trilha: {jobRole}</span>}
          </p>
        )}
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 flex items-center justify-center gap-2 text-text-tertiary text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : !hasRole ? (
        <div className="lp-solid-card p-12 text-center space-y-3">
          <HardHat className="h-10 w-10 text-text-tertiary mx-auto" />
          <div className="text-text-primary font-semibold">Nenhuma trilha NR atribuída</div>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            Seu cargo ainda não tem uma trilha de treinamentos NR configurada. Fale com o RH ou administrador para configurar seu perfil.
          </p>
          <Link to="/aluno/perfil">
            <Button variant="outline" size="sm" className="mt-2">Ver meu perfil</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Overall progress */}
          <ScrollReveal>
            <div className="lp-solid-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-text-primary">
                    {concluido} de {total} treinamento{total !== 1 ? "s" : ""} concluído{concluido !== 1 ? "s" : ""}
                  </div>
                  {vencido > 0 && (
                    <div className="text-xs text-destructive font-medium flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="h-3 w-3" />
                      {vencido} vencido{vencido !== 1 ? "s" : ""} — ação necessária
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-text-primary tabular-nums">{pct}%</div>
              </div>
              <div className="h-2.5 rounded-full bg-bg-surface-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${vencido > 0 ? "bg-destructive/70" : pct === 100 ? "bg-accent-success" : "bg-accent-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Training cards */}
          <div className="space-y-3">
            {rows.map((row, i) => {
              const days  = daysLeft(row.due_date);
              const urgent = days !== null && days >= 0 && days <= 30 && row.compliance_status === "em_andamento";
              return (
                <ScrollReveal key={row.course_id} delay={i * 0.04}>
                  <div className={`lp-solid-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                    row.compliance_status === "vencido" ? "border-destructive/30" :
                    urgent ? "border-yellow-500/40" : ""
                  }`}>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* NR badges */}
                      {row.nr_codigo?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {row.nr_codigo.map((nr) => (
                            <Badge key={nr} variant="secondary" className="text-[10px] bg-accent-primary/10 text-accent-primary border-accent-primary/20 font-mono py-0">
                              <Shield className="h-2.5 w-2.5 mr-0.5" />{nr}
                            </Badge>
                          ))}
                        </div>
                      ) : null}

                      <div className="font-semibold text-text-primary leading-tight">{row.curso_titulo}</div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
                        {row.due_date && (
                          <span className={`flex items-center gap-1 ${row.compliance_status === "vencido" ? "text-destructive font-medium" : urgent ? "text-yellow-600 font-medium" : ""}`}>
                            <AlertTriangle className={`h-3 w-3 ${row.compliance_status !== "vencido" && !urgent ? "hidden" : ""}`} />
                            {row.compliance_status === "vencido" ? "Venceu em " : "Válido até "}
                            {fmtDate(row.due_date)}
                            {days !== null && row.compliance_status !== "vencido" && days <= 30 && (
                              <span> · {days}d restantes</span>
                            )}
                          </span>
                        )}
                        {!row.due_date && row.compliance_status === "concluido" && (
                          <span className="text-accent-success flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Sem expiração
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <StatusBadge status={row.compliance_status} days={days} />
                      <ActionBtn row={row} />
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
