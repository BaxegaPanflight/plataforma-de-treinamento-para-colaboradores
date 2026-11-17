import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, Search, Loader2, ChevronUp, ChevronDown, ChevronsUpDown, FileText, Building2, CheckCircle2, Archive } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/relatorios")({ component: Relatorios });

interface ReportRow {
  enrollment_id: string;
  user_id: string;
  course_id: string;
  nome: string;
  email: string;
  curso: string;
  status: string;
  enrolled_at: string;
  due_date: string | null;
  score: number | null;
  aprovado: boolean | null;
  nr_codigo?: string[] | null;
}

interface CourseLite { id: string; titulo: string }

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  ativo:     { label: "Em andamento", variant: "secondary" },
  concluido: { label: "Concluído",    variant: "default" },
  expirando: { label: "Expirando",    variant: "secondary" },
  vencido:   { label: "Vencido",      variant: "destructive" },
};

type SortKey = "nome" | "curso" | "status" | "enrolled_at" | "due_date" | "score";
type SortDir = "asc" | "desc";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function Relatorios() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [courses, setCourses] = useState<CourseLite[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("enrolled_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // MTE report state
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [nrCodes, setNrCodes] = useState<string[]>([]);
  const [nrFilter, setNrFilter] = useState("all");
  const [mteLoading, setMteLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: br }, { data: nrRows }] = await Promise.all([
        supabase.from("branding").select("razao_social, cnpj").limit(1).maybeSingle(),
        supabase.from("vw_compliance").select("nr_codigo"),
      ]);
      if (br) {
        setRazaoSocial(br.razao_social ?? "");
        setCnpj(br.cnpj ?? "");
      }
      const codes = [...new Set(
        (nrRows ?? []).flatMap((r) => (r.nr_codigo as string[] | null) ?? [])
      )].sort();
      setNrCodes(codes);
    })();
  }, []);

  const saveBranding = async () => {
    await supabase.from("branding").update({ razao_social: razaoSocial, cnpj }).eq("id", 1);
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 2500);
  };

  const generateMteReport = async () => {
    setMteLoading(true);
    const { data, error } = await supabase.functions.invoke("generate-compliance-report", {
      body: { nr_filter: nrFilter === "all" ? null : nrFilter },
    });
    setMteLoading(false);
    if (error) { console.error(error); return; }
    if (data?.pdf_url) window.open(data.pdf_url as string, "_blank");
  };

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, user_id, course_id, status, enrolled_at, due_date, courses(titulo)")
        .order("enrolled_at", { ascending: false });

      if (!enrollments?.length) { setLoading(false); return; }

      const { data: courseList } = await supabase.from("courses").select("id, titulo").order("titulo");
      setCourses((courseList ?? []) as CourseLite[]);

      const userIds = [...new Set(enrollments.map((e) => e.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", userIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, { nome: p.nome as string, email: p.email as string }]));

      const enrollmentIds = enrollments.map((e) => e.id);
      const { data: attempts } = await supabase
        .from("attempts")
        .select("enrollment_id, score, aprovado")
        .in("enrollment_id", enrollmentIds)
        .order("score", { ascending: false });

      const bestAttempt = new Map<string, { score: number; aprovado: boolean }>();
      for (const a of attempts ?? []) {
        if (!bestAttempt.has(a.enrollment_id) || a.score > (bestAttempt.get(a.enrollment_id)?.score ?? -1)) {
          bestAttempt.set(a.enrollment_id, { score: a.score, aprovado: a.aprovado });
        }
      }

      const report: ReportRow[] = enrollments.map((e) => {
        const profile = profileMap.get(e.user_id);
        const att = bestAttempt.get(e.id);
        return {
          enrollment_id: e.id,
          user_id: e.user_id,
          course_id: e.course_id,
          nome: profile?.nome ?? "—",
          email: profile?.email ?? "—",
          curso: (e.courses as { titulo: string } | null)?.titulo ?? "—",
          status: e.status,
          enrolled_at: e.enrolled_at,
          due_date: e.due_date,
          score: att?.score ?? null,
          aprovado: att?.aprovado ?? null,
        };
      });

      setRows(report);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      if (filterCourse !== "all" && r.course_id !== filterCourse) return false;
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterFrom && r.enrolled_at < filterFrom) return false;
      if (filterTo && r.enrolled_at > filterTo + "T23:59:59") return false;
      if (q && !r.nome.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q) && !r.curso.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, filterCourse, filterStatus, filterFrom, filterTo]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = sortKey === "score" ? (a.score ?? -1) : (a[sortKey] ?? "");
      const vb = sortKey === "score" ? (b.score ?? -1) : (b[sortKey] ?? "");
      const cmp = String(va).localeCompare(String(vb), "pt-BR", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronsUpDown className="h-3 w-3 text-text-tertiary" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-accent-primary" />
      : <ChevronDown className="h-3 w-3 text-accent-primary" />;
  };

  const exportAuditPackage = async () => {
    const date = new Date().toISOString().slice(0, 10);
    const sections: string[] = [];

    // 1. Conformidade NR
    sections.push("=== MATRIZ DE CONFORMIDADE NR ===");
    sections.push(["Nome","Email","Curso","NRs","Status","Vencimento"].join(";"));
    for (const r of rows) {
      sections.push([r.nome, r.email, r.curso, (r.nr_codigo ?? []).join("|"), r.status, r.due_date ?? ""].join(";"));
    }

    // 2. ASOs
    const { data: asos } = await (supabase.from as any)("asos")
      .select("data_exame, validade_ate, resultado, tipo, medico_nome, profiles:user_id(nome,email)")
      .order("data_exame", { ascending: false });
    sections.push("\n=== ASOs — ATESTADOS DE SAÚDE OCUPACIONAL ===");
    sections.push(["Nome","Email","Tipo","Data Exame","Validade","Resultado","Médico"].join(";"));
    for (const a of asos ?? []) {
      sections.push([a.profiles?.nome ?? "", a.profiles?.email ?? "", a.tipo, a.data_exame, a.validade_ate ?? "", a.resultado, a.medico_nome ?? ""].join(";"));
    }

    // 3. EPIs
    const { data: epis } = await (supabase.from as any)("epi_entregas")
      .select("data_entrega, quantidade, assinado_em, devolvido, epis(nome,ca_numero), profiles:user_id(nome)")
      .order("data_entrega", { ascending: false });
    sections.push("\n=== FICHAS DE ENTREGA DE EPI ===");
    sections.push(["Colaborador","EPI","CA","Qtd","Data Entrega","Assinado","Devolvido"].join(";"));
    for (const e of epis ?? []) {
      sections.push([e.profiles?.nome ?? "", e.epis?.nome ?? "", e.epis?.ca_numero ?? "", e.quantidade, e.data_entrega, e.assinado_em ? "Sim" : "Não", e.devolvido ? "Sim" : "Não"].join(";"));
    }

    // 4. eSocial pendentes
    const { data: esocial } = await (supabase.from as any)("esocial_queue")
      .select("evento, status, prazo_envio, profiles:user_id(nome)")
      .eq("status", "pendente")
      .order("prazo_envio");
    sections.push("\n=== eSocial SST — EVENTOS PENDENTES ===");
    sections.push(["Evento","Colaborador","Prazo","Status"].join(";"));
    for (const e of esocial ?? []) {
      sections.push([e.evento, e.profiles?.nome ?? "", e.prazo_envio ?? "", e.status].join(";"));
    }

    // 5. Docs SST vencidos
    const { data: docs } = await (supabase.from as any)("sst_documentos")
      .select("tipo, nome, validade, vigente").eq("vigente", true).order("tipo");
    sections.push("\n=== DOCUMENTOS SST ===");
    sections.push(["Tipo","Nome","Validade","Status"].join(";"));
    for (const d of docs ?? []) {
      const v = d.validade ? (new Date(d.validade) < new Date() ? "VENCIDO" : "Válido") : "Sem validade";
      sections.push([d.tipo, d.nome, d.validade ?? "", v].join(";"));
    }

    const blob = new Blob([sections.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pacote-auditoria-mte-${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = ["Nome", "Email", "Curso", "Status", "Data Matrícula", "Vencimento", "Melhor Nota", "Aprovado"];
    const csvData = [header, ...sorted.map((r) => [
      r.nome, r.email, r.curso,
      STATUS_META[r.status]?.label ?? r.status,
      fmt(r.enrolled_at), fmt(r.due_date),
      r.score !== null ? String(Math.round(r.score)) : "",
      r.aprovado === null ? "" : r.aprovado ? "Sim" : "Não",
    ])];
    const csv = csvData.map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Análise</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Relatórios</h1>
          <p className="text-sm text-text-secondary mt-1">
            {loading ? "Carregando…" : `${sorted.length} de ${rows.length} matrícula${rows.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAuditPackage} disabled={loading}>
            <Archive className="h-4 w-4 mr-2" />Pacote Auditoria MTE
          </Button>
          <Button variant="outline" onClick={exportCSV} disabled={loading || !sorted.length}>
            <Download className="h-4 w-4 mr-2" />Exportar CSV
          </Button>
        </div>
      </div>

      {/* MTE Compliance Report card */}
      <div className="lp-solid-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Fiscalização</span>
            <h2 className="text-base font-semibold text-text-primary mt-0.5">Relatório NR para MTE</h2>
            <p className="text-xs text-text-secondary mt-0.5">Gera um PDF com a matriz de conformidade NR para apresentar à fiscalização do trabalho.</p>
          </div>
          <FileText className="h-8 w-8 text-accent-primary/25 shrink-0" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs text-text-tertiary uppercase tracking-widest">Razão Social</Label>
            <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Empresa Ltda." />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-text-tertiary uppercase tracking-widest">CNPJ</Label>
            <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-text-tertiary uppercase tracking-widest">Filtrar por NR</Label>
            <Select value={nrFilter} onValueChange={setNrFilter}>
              <SelectTrigger><SelectValue placeholder="Todas as NRs" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as NRs</SelectItem>
                {nrCodes.map((nr) => <SelectItem key={nr} value={nr}>{nr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={saveBranding}>
              {brandingSaved
                ? <CheckCircle2 className="h-4 w-4 mr-1.5 text-accent-success" />
                : <Building2 className="h-4 w-4 mr-1.5" />}
              {brandingSaved ? "Salvo!" : "Salvar"}
            </Button>
            <Button size="sm" className="flex-1" onClick={generateMteReport} disabled={mteLoading}>
              {mteLoading
                ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                : <FileText className="h-4 w-4 mr-1.5" />}
              Gerar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="lp-solid-card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar aluno ou curso…"
            className="pl-9"
          />
        </div>

        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger><SelectValue placeholder="Todos os cursos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cursos</SelectItem>
            {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger><SelectValue placeholder="Todos os status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ativo">Em andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="expirando">Expirando</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <div className="space-y-0.5 flex-1">
            <Label className="text-[11px] text-text-tertiary uppercase tracking-widest">De</Label>
            <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-0.5 flex-1">
            <Label className="text-[11px] text-text-tertiary uppercase tracking-widest">Até</Label>
            <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="text-sm" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="lp-solid-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-text-tertiary text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />Carregando dados…
          </div>
        ) : !sorted.length ? (
          <div className="p-12 text-center text-text-tertiary text-sm">
            Nenhuma matrícula encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface-2/50">
                  {([
                    ["nome",        "Aluno"],
                    ["curso",       "Curso"],
                    ["status",      "Status"],
                    ["enrolled_at", "Matrícula"],
                    ["due_date",    "Vencimento"],
                    ["score",       "Nota"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-tertiary cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort(key)}
                    >
                      <span className="flex items-center gap-1.5">
                        {label} <SortIcon k={key} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {sorted.map((r) => {
                  const meta = STATUS_META[r.status];
                  return (
                    <tr key={r.enrollment_id} className="hover:bg-bg-surface-2/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-primary">{r.nome}</div>
                        <div className="text-xs text-text-tertiary">{r.email}</div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary max-w-[200px]">
                        <div className="truncate">{r.curso}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={meta?.variant ?? "secondary"}
                          className={r.status === "expirando" ? "bg-yellow-500/15 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/15" : ""}
                        >
                          {meta?.label ?? r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{fmt(r.enrolled_at)}</td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{fmt(r.due_date)}</td>
                      <td className="px-4 py-3">
                        {r.score !== null ? (
                          <span className={`font-semibold tabular-nums ${r.aprovado ? "text-accent-success" : "text-destructive"}`}>
                            {Math.round(r.score)}%
                          </span>
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
