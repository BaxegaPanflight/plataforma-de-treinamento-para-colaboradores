import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  BookOpen, Users, GraduationCap, Award, TrendingUp, AlertTriangle, CalendarDays, ShieldCheck, ShieldAlert, ShieldX,
  Package, Stethoscope, Radio, Clipboard, Brain,
} from "lucide-react";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/_admin/admin/dashboard")({ component: Dashboard });

interface MonthData {
  mes: string;
  Aprovados: number;
  Reprovados: number;
}

interface ExpiringRow {
  id: string;
  due_date: string;
  user_id: string;
  courses: { titulo: string } | null;
}

interface Metrics {
  cursos: number;
  alunos: number;
  matriculas: number;
  certs: number;
}

interface ComplianceMetrics {
  total: number;
  conforme: number;
  vencido: number;
  expirando30: number;
}

interface SSTKpis {
  asos_vencidos: number;
  epis_sem_assinatura: number;
  esocial_pendentes: number;
  esocial_criticos: number;
  cats_mes: number;
  riscos_altos: number;
  docs_vencidos: number;
}

function Dashboard() {
  const [m, setM] = useState<Metrics>({ cursos: 0, alunos: 0, matriculas: 0, certs: 0 });
  const [comp, setComp] = useState<ComplianceMetrics>({ total: 0, conforme: 0, vencido: 0, expirando30: 0 });
  const [sst, setSst] = useState<SSTKpis>({ asos_vencidos: 0, epis_sem_assinatura: 0, esocial_pendentes: 0, esocial_criticos: 0, cats_mes: 0, riscos_altos: 0, docs_vencidos: 0 });
  const [chartData, setChartData] = useState<MonthData[]>([]);
  const [expiring, setExpiring] = useState<ExpiringRow[]>([]);
  const [expiringNames, setExpiringNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Metrics
    (async () => {
      const [c, a, e, cert] = await Promise.all([
        supabase.from("courses").select("*", { count: "exact", head: true }).eq("publicado", true),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "aluno"),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
        supabase.from("certificates").select("*", { count: "exact", head: true }),
      ]);
      setM({ cursos: c.count ?? 0, alunos: a.count ?? 0, matriculas: e.count ?? 0, certs: cert.count ?? 0 });
    })();

    // Compliance KPIs from vw_compliance
    (async () => {
      const { data: compRows } = await supabase
        .from("vw_compliance")
        .select("user_id, compliance_status, due_date");

      if (!compRows?.length) return;

      const byUser = new Map<string, string[]>();
      const thirtyDays = new Date(); thirtyDays.setDate(thirtyDays.getDate() + 30);
      let expirando30 = 0;

      for (const r of compRows) {
        const uid = r.user_id ?? "";
        const cs  = r.compliance_status ?? "";
        if (!byUser.has(uid)) byUser.set(uid, []);
        byUser.get(uid)!.push(cs);
        if (cs !== "concluido" && r.due_date) {
          const due = new Date(r.due_date);
          if (due <= thirtyDays && due >= new Date()) expirando30++;
        }
      }

      const total    = byUser.size;
      const conforme = [...byUser.values()].filter((ss) => ss.every((s) => s === "concluido")).length;
      const vencido  = [...byUser.values()].filter((ss) => ss.some((s) => s === "vencido")).length;
      setComp({ total, conforme, vencido, expirando30 });
    })();

    // Monthly chart (last 6 months)
    (async () => {
      const sixAgo = new Date();
      sixAgo.setMonth(sixAgo.getMonth() - 6);
      const { data: attempts } = await supabase
        .from("attempts")
        .select("created_at, aprovado")
        .gte("created_at", sixAgo.toISOString());

      const monthMap = new Map<string, MonthData>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const mes = d.toLocaleString("pt-BR", { month: "short" });
        monthMap.set(key, { mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3), Aprovados: 0, Reprovados: 0 });
      }

      for (const a of attempts ?? []) {
        const d = new Date(a.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthMap.get(key);
        if (entry) {
          if (a.aprovado) entry.Aprovados++;
          else entry.Reprovados++;
        }
      }

      setChartData(Array.from(monthMap.values()));
    })();

    // SST KPIs
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const in3d  = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
      const in30d = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10);
      const startMonth = new Date(); startMonth.setDate(1);

      const [asoV, epiS, esocP, esocC, catM, riscA, docV] = await Promise.all([
        (supabase.from as any)("asos").select("id", { count: "exact", head: true }).lt("validade_ate", today),
        (supabase.from as any)("epi_entregas").select("id", { count: "exact", head: true }).is("assinado_em", null).eq("devolvido", false),
        (supabase.from as any)("esocial_queue").select("id", { count: "exact", head: true }).eq("status", "pendente"),
        (supabase.from as any)("esocial_queue").select("id", { count: "exact", head: true }).eq("status", "pendente").lte("prazo_envio", in3d),
        (supabase.from as any)("cats").select("id", { count: "exact", head: true }).gte("data_acidente", startMonth.toISOString().slice(0, 10)),
        (supabase.from as any)("riscos_psicossociais").select("id", { count: "exact", head: true }).in("probabilidade", ["alta"]).neq("status", "controlado"),
        (supabase.from as any)("sst_documentos").select("id", { count: "exact", head: true }).eq("vigente", true).lt("validade", today),
      ]);
      setSst({
        asos_vencidos: asoV.count ?? 0,
        epis_sem_assinatura: epiS.count ?? 0,
        esocial_pendentes: esocP.count ?? 0,
        esocial_criticos: esocC.count ?? 0,
        cats_mes: catM.count ?? 0,
        riscos_altos: riscA.count ?? 0,
        docs_vencidos: docV.count ?? 0,
      });
    })();

    // Expiring enrollments
    (async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id, due_date, user_id, courses(titulo)")
        .eq("status", "expirando")
        .order("due_date")
        .limit(10);

      const rows = (data ?? []) as ExpiringRow[];
      setExpiring(rows);

      if (rows.length) {
        const ids = [...new Set(rows.map((r) => r.user_id))];
        const { data: profiles } = await supabase.from("profiles").select("id, nome").in("id", ids);
        const map = new Map((profiles ?? []).map((p) => [p.id, p.nome as string]));
        setExpiringNames(map);
      }
    })();
  }, []);

  const cards = [
    { label: "Cursos publicados", value: m.cursos, icon: BookOpen, tint: "accent-primary" },
    { label: "Alunos ativos",     value: m.alunos, icon: Users,    tint: "accent-success" },
    { label: "Matrículas",        value: m.matriculas, icon: GraduationCap, tint: "accent-warm" },
    { label: "Certificados",      value: m.certs,  icon: Award,    tint: "accent-primary" },
  ] as const;

  const totalAttempts = chartData.reduce((acc, d) => acc + d.Aprovados + d.Reprovados, 0);

  return (
    <div className="space-y-10">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Visão geral</span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">LMS · Compliance & SST — indicadores em tempo real.</p>
      </div>

      {/* ── LMS ─────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <BookOpen className="h-4 w-4 text-accent-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent-primary">LMS — Aprendizagem & Capacitação</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <ScrollReveal key={c.label} delay={i * 0.08}>
              <div className="lp-solid-card p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-widest text-text-tertiary font-semibold">{c.label}</div>
                  <div className={`h-9 w-9 rounded-lg bg-${c.tint}/10 text-${c.tint} grid place-items-center`}>
                    <c.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 text-3xl font-bold text-text-primary tabular-nums">{c.value}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {comp.total > 0 && (
          <ScrollReveal delay={0.1}>
            <div className="lp-solid-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Conformidade NR</span>
                  <p className="text-sm text-text-secondary mt-0.5">{comp.total} colaborador{comp.total !== 1 ? "es" : ""} na matriz</p>
                </div>
                <Link to="/admin/conformidade" className="text-xs text-accent-primary hover:underline">Ver painel →</Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-accent-success/10 p-3 text-center">
                  <ShieldCheck className="h-5 w-5 text-accent-success mx-auto mb-1" />
                  <div className="text-2xl font-bold text-accent-success tabular-nums">{comp.total > 0 ? Math.round((comp.conforme / comp.total) * 100) : 0}%</div>
                  <div className="text-[11px] text-accent-success/80 mt-0.5">Conformes</div>
                </div>
                <div className="rounded-xl bg-accent-warm/10 p-3 text-center">
                  <ShieldAlert className="h-5 w-5 text-accent-warm mx-auto mb-1" />
                  <div className="text-2xl font-bold text-accent-warm tabular-nums">{comp.expirando30}</div>
                  <div className="text-[11px] text-accent-warm/80 mt-0.5">Expirando (30d)</div>
                </div>
                <div className="rounded-xl bg-destructive/10 p-3 text-center">
                  <ShieldX className="h-5 w-5 text-destructive mx-auto mb-1" />
                  <div className="text-2xl font-bold text-destructive tabular-nums">{comp.vencido}</div>
                  <div className="text-[11px] text-destructive/80 mt-0.5">Vencidos</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <ScrollReveal delay={0.15} className="lg:col-span-2">
            <div className="lp-solid-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Tentativas de avaliação</h2>
                  <p className="text-sm text-text-secondary">Aprovados vs reprovados nos últimos 6 meses.</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-accent-success/10 text-accent-success grid place-items-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              {totalAttempts === 0 ? (
                <div className="h-56 grid place-items-center text-text-tertiary text-sm border border-dashed border-border-subtle rounded-xl">
                  Nenhuma tentativa registrada ainda.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border-subtle) / 0.5)" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "oklch(var(--text-tertiary))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "oklch(var(--text-tertiary))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "oklch(var(--bg-elevated))", border: "1px solid oklch(var(--border-subtle))", borderRadius: "8px", fontSize: 13 }} cursor={{ fill: "oklch(var(--bg-surface-2) / 0.5)" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    <Bar dataKey="Aprovados" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Reprovados" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="lp-solid-card p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-text-primary">Expirando em breve</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Matrículas com status "expirando".</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-accent-warm/10 text-accent-warm grid place-items-center shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              {expiring.length === 0 ? (
                <div className="flex-1 grid place-items-center text-text-tertiary text-sm border border-dashed border-border-subtle rounded-xl">
                  Nenhuma expirando.
                </div>
              ) : (
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {expiring.map((e) => (
                    <div key={e.id} className="rounded-lg bg-bg-surface-2 px-3 py-2.5">
                      <div className="text-sm font-medium text-text-primary truncate">{e.courses?.titulo ?? "Curso"}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                        <span className="truncate">{expiringNames.get(e.user_id) ?? "Aluno"}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 shrink-0 text-accent-warm">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(e.due_date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link to="/admin/relatorios" className="block text-xs text-accent-primary hover:underline text-center pt-1">
                    Ver relatório completo →
                  </Link>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Compliance & SST ────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-accent-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent-primary">Compliance & SST — Conformidade Regulatória</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <ScrollReveal delay={0.12}>
          <div className="lp-solid-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">SST — Saúde e Segurança do Trabalho</span>
                <p className="text-sm text-text-secondary mt-0.5">Indicadores de conformidade NR em tempo real</p>
              </div>
              <Link to="/admin/esocial" className="text-xs text-accent-primary hover:underline">Ver eSocial →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "ASOs vencidos",       value: sst.asos_vencidos,       icon: Stethoscope,   alert: sst.asos_vencidos > 0,       to: "/admin/aso" },
                { label: "EPIs s/ assinatura",  value: sst.epis_sem_assinatura, icon: Package,       alert: sst.epis_sem_assinatura > 0, to: "/admin/epi" },
                { label: "eSocial pendentes",   value: sst.esocial_pendentes,   icon: Radio,         alert: sst.esocial_criticos > 0,    to: "/admin/esocial" },
                { label: "CATs este mês",       value: sst.cats_mes,            icon: Clipboard,     alert: sst.cats_mes > 0,            to: "/admin/esocial" },
                { label: "Riscos psicossoc.",   value: sst.riscos_altos,        icon: Brain,         alert: sst.riscos_altos > 0,        to: "/admin/riscos-psicossociais" },
                { label: "Docs SST vencidos",   value: sst.docs_vencidos,       icon: AlertTriangle, alert: sst.docs_vencidos > 0,       to: "/admin/sst-docs" },
              ].map((k) => (
                <Link key={k.label} to={k.to} className={`rounded-xl p-3 flex flex-col gap-1 transition-colors hover:bg-muted/20 ${k.alert && k.value > 0 ? "bg-destructive/5 border border-destructive/20" : "bg-muted/10"}`}>
                  <k.icon className={`h-4 w-4 ${k.alert && k.value > 0 ? "text-destructive" : "text-text-tertiary"}`} />
                  <div className={`text-xl font-bold tabular-nums ${k.alert && k.value > 0 ? "text-destructive" : "text-text-primary"}`}>{k.value}</div>
                  <div className="text-[11px] text-text-tertiary leading-tight">{k.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

