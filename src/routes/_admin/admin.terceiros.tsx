import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Loader2, Search, CheckCircle2, AlertCircle, PhoneCall, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/terceiros")({ component: TerceirosPage });

interface Terceiro {
  id: string; razao_social: string; cnpj: string | null;
  contato_nome: string | null; contato_email: string | null; contato_tel: string | null;
  servico: string | null; nrs_aplicaveis: string[];
  status: string; docs_ok: boolean; observacoes: string | null; created_at: string;
}

const NRS_OPTIONS = ["NR-1","NR-5","NR-6","NR-7","NR-9","NR-10","NR-11","NR-12","NR-13","NR-15","NR-17","NR-18","NR-20","NR-23","NR-33","NR-35","NR-36"];

function NovoTerceiroDialog({ open, onOpenChange, onCreated, editing }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void; editing?: Terceiro | null;
}) {
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contatoNome, setContatoNome] = useState("");
  const [contatoEmail, setContatoEmail] = useState("");
  const [contatoTel, setContatoTel] = useState("");
  const [servico, setServico] = useState("");
  const [selectedNRs, setSelectedNRs] = useState<string[]>([]);
  const [docsOk, setDocsOk] = useState(false);
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setRazaoSocial(editing.razao_social); setCnpj(editing.cnpj ?? "");
      setContatoNome(editing.contato_nome ?? ""); setContatoEmail(editing.contato_email ?? "");
      setContatoTel(editing.contato_tel ?? ""); setServico(editing.servico ?? "");
      setSelectedNRs(editing.nrs_aplicaveis ?? []); setDocsOk(editing.docs_ok); setObs(editing.observacoes ?? "");
    } else if (!open) {
      setRazaoSocial(""); setCnpj(""); setContatoNome(""); setContatoEmail(""); setContatoTel("");
      setServico(""); setSelectedNRs([]); setDocsOk(false); setObs("");
    }
  }, [open, editing]);

  const toggleNR = (nr: string) =>
    setSelectedNRs((p) => p.includes(nr) ? p.filter((n) => n !== nr) : [...p, nr]);

  const submit = async () => {
    if (!razaoSocial.trim()) return toast.error("Razão social obrigatória");
    setSaving(true);
    const payload = {
      razao_social: razaoSocial.trim(), cnpj: cnpj.trim() || null,
      contato_nome: contatoNome.trim() || null, contato_email: contatoEmail.trim() || null,
      contato_tel: contatoTel.trim() || null, servico: servico.trim() || null,
      nrs_aplicaveis: selectedNRs, docs_ok: docsOk, observacoes: obs.trim() || null,
    };
    const { error } = editing
      ? await (supabase.from as any)("terceiros").update(payload).eq("id", editing.id)
      : await (supabase.from as any)("terceiros").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Prestador atualizado" : "Prestador cadastrado");
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Editar Prestador" : "Novo Prestador / Terceiro"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Razão social <span className="text-destructive">*</span></Label>
            <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Nome ou razão social da empresa" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>CNPJ</Label>
            <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
          </div>
          <div className="space-y-1.5">
            <Label>Serviço prestado</Label>
            <Input value={servico} onChange={(e) => setServico(e.target.value)} placeholder="Ex: Manutenção elétrica, limpeza, vigilância…" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Contato</Label>
              <Input value={contatoNome} onChange={(e) => setContatoNome(e.target.value)} placeholder="Nome" />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input value={contatoEmail} onChange={(e) => setContatoEmail(e.target.value)} placeholder="email@empresa.com" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={contatoTel} onChange={(e) => setContatoTel(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>NRs aplicáveis ao serviço</Label>
            <div className="flex flex-wrap gap-1.5">
              {NRS_OPTIONS.map((nr) => (
                <button
                  key={nr}
                  type="button"
                  onClick={() => toggleNR(nr)}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                    selectedNRs.includes(nr)
                      ? "bg-accent-primary text-white border-accent-primary"
                      : "border-border text-text-secondary hover:border-accent-primary hover:text-accent-primary"
                  }`}
                >{nr}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="docsOk" checked={docsOk} onChange={(e) => setDocsOk(e.target.checked)} className="h-4 w-4 accent-accent-primary" />
            <Label htmlFor="docsOk" className="cursor-pointer">Documentação verificada e aprovada</Label>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Contratos, validade, pendências…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !razaoSocial.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : (editing ? "Salvar" : "Cadastrar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TerceirosPage() {
  const [items, setItems] = useState<Terceiro[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Terceiro | null>(null);

  const load = async () => {
    const { data } = await (supabase.from as any)("terceiros").select("*").order("razao_social");
    setItems(data ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const openEdit = (t: Terceiro) => { setEditing(t); setDialogOpen(true); };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    if (q && !i.razao_social.toLowerCase().includes(q) && !(i.cnpj ?? "").includes(q)) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    return true;
  });

  const docsNok = items.filter((i) => !i.docs_ok && i.status === "ativo").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">SST</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Prestadores / Terceiros</h1>
          <p className="text-sm text-text-secondary mt-1">Gestão de responsabilidade solidária — documentação e NRs aplicáveis</p>
        </div>
        <Button variant="lp-primary" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />Novo prestador
        </Button>
      </div>

      {docsNok > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{docsNok}</strong> prestador{docsNok > 1 ? "es ativos com documentação não verificada" : " ativo com documentação não verificada"} — risco de responsabilidade solidária
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar por razão social ou CNPJ…" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="suspenso">Suspensos</SelectItem>
            <SelectItem value="encerrado">Encerrados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((t) => (
            <div key={t.id} className="lp-solid-card p-5 space-y-3 cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => openEdit(t)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-accent-primary shrink-0" />
                  <div>
                    <div className="font-semibold text-sm text-text-primary">{t.razao_social}</div>
                    {t.cnpj && <div className="text-xs text-text-tertiary font-mono">{t.cnpj}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.docs_ok
                    ? <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium"><CheckCircle2 className="h-3 w-3" />Docs OK</span>
                    : <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium"><AlertCircle className="h-3 w-3" />Docs pendentes</span>}
                  <Badge variant={t.status === "ativo" ? "secondary" : "outline"} className={`text-[10px] ${t.status === "ativo" ? "bg-green-500/10 text-green-700" : ""}`}>
                    {t.status}
                  </Badge>
                </div>
              </div>
              {t.servico && <p className="text-xs text-text-secondary">{t.servico}</p>}
              <div className="flex flex-wrap gap-1.5">
                {t.nrs_aplicaveis?.map((nr) => (
                  <Badge key={nr} variant="outline" className="text-[10px] font-mono">{nr}</Badge>
                ))}
              </div>
              {(t.contato_nome || t.contato_email || t.contato_tel) && (
                <div className="flex gap-3 text-xs text-text-tertiary pt-1 border-t border-border-subtle">
                  {t.contato_nome && <span>{t.contato_nome}</span>}
                  {t.contato_email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{t.contato_email}</span>}
                  {t.contato_tel && <span className="flex items-center gap-1"><PhoneCall className="h-3 w-3" />{t.contato_tel}</span>}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="md:col-span-2 lp-solid-card p-12 text-center text-text-tertiary text-sm">
              {search || filterStatus !== "all" ? "Nenhum prestador encontrado." : "Nenhum prestador cadastrado."}
            </div>
          )}
        </div>
      )}

      <NovoTerceiroDialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }} onCreated={load} editing={editing} />
    </div>
  );
}
