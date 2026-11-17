import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Loader2, Search, CheckCircle2, Users, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/empresas")({ component: EmpresasPage });

interface Empresa {
  id: string;
  razao_social: string;
  cnpj: string | null;
  logo_url: string | null;
  status: string;
  created_at: string;
}

interface Membro {
  id: string;
  user_id: string;
  role: string;
  profiles: { nome: string; email: string } | null;
}

function NovaEmpresaDialog({ open, onOpenChange, onCreated, editing }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void; editing?: Empresa | null;
}) {
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [status, setStatus] = useState("ativa");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setRazaoSocial(editing.razao_social); setCnpj(editing.cnpj ?? "");
      setLogoUrl(editing.logo_url ?? ""); setStatus(editing.status);
    } else if (!open) {
      setRazaoSocial(""); setCnpj(""); setLogoUrl(""); setStatus("ativa");
    }
  }, [open, editing]);

  const submit = async () => {
    if (!razaoSocial.trim()) return toast.error("Razão social obrigatória");
    setSaving(true);
    const payload = {
      razao_social: razaoSocial.trim(),
      cnpj: cnpj.trim() || null,
      logo_url: logoUrl.trim() || null,
      status,
    };
    const { error } = editing
      ? await (supabase.from as any)("empresas").update(payload).eq("id", editing.id)
      : await (supabase.from as any)("empresas").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Empresa atualizada" : "Empresa cadastrada");
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{editing ? "Editar Empresa" : "Nova Empresa / Filial"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Razão social <span className="text-destructive">*</span></Label>
            <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Empresa Ltda." autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>CNPJ</Label>
            <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
          </div>
          <div className="space-y-1.5">
            <Label>URL do logo</Label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="inativa">Inativa</SelectItem>
              </SelectContent>
            </Select>
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

function AdicionarMembroDialog({ empresa, open, onOpenChange, onCreated }: {
  empresa: Empresa; open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void;
}) {
  const [profiles, setProfiles] = useState<{ id: string; nome: string; email: string }[]>([]);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("membro");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from("profiles").select("id, nome, email").order("nome")
        .then(({ data }) => setProfiles((data ?? []) as { id: string; nome: string; email: string }[]));
      setUserId(""); setRole("membro");
    }
  }, [open]);

  const submit = async () => {
    if (!userId) return toast.error("Selecione um colaborador");
    setSaving(true);
    const { error } = await (supabase.from as any)("empresa_membros").insert({
      empresa_id: empresa.id, user_id: userId, role,
    });
    setSaving(false);
    if (error) return toast.error(error.message === "duplicate key value violates unique constraint" ? "Membro já vinculado a esta empresa" : error.message);
    toast.success("Membro adicionado à empresa");
    onCreated(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Adicionar membro — {empresa.razao_social}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Colaborador</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome} ({p.email})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Papel nesta empresa</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="membro">Membro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !userId}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Adicionando…</> : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Empresa | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [membros, setMembros] = useState<Map<string, Membro[]>>(new Map());
  const [membroDialogEmpresa, setMembroDialogEmpresa] = useState<Empresa | null>(null);

  const load = async () => {
    const { data } = await (supabase.from as any)("empresas").select("*").order("razao_social");
    setEmpresas(data ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const loadMembros = async (empresaId: string) => {
    const { data } = await (supabase.from as any)("empresa_membros")
      .select("id, user_id, role, profiles:user_id(nome, email)")
      .eq("empresa_id", empresaId)
      .order("role");
    setMembros((prev) => new Map([...prev, [empresaId, data ?? []]]));
  };

  const toggleExpand = (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!membros.has(id)) loadMembros(id);
  };

  const removeMembro = async (membroId: string, empresaId: string) => {
    const { error } = await (supabase.from as any)("empresa_membros").delete().eq("id", membroId);
    if (error) return toast.error(error.message);
    toast.success("Membro removido");
    loadMembros(empresaId);
  };

  const filtered = empresas.filter((e) => {
    const q = search.toLowerCase();
    return !q || e.razao_social.toLowerCase().includes(q) || (e.cnpj ?? "").includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Multi-CNPJ</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Empresas / Filiais</h1>
          <p className="text-sm text-text-secondary mt-1">Gerencie múltiplos CNPJs e vínculos de colaboradores por empresa</p>
        </div>
        <Button variant="lp-primary" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />Nova empresa
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar por razão social ou CNPJ…" />
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((emp) => {
            const isExpanded = expanded === emp.id;
            const memsList = membros.get(emp.id);
            return (
              <div key={emp.id} className="lp-solid-card overflow-hidden">
                <div className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent-primary/10 grid place-items-center shrink-0">
                    {emp.logo_url
                      ? <img src={emp.logo_url} alt={emp.razao_social} className="h-8 w-8 object-contain rounded" />
                      : <Building2 className="h-5 w-5 text-accent-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-text-primary">{emp.razao_social}</div>
                    {emp.cnpj && <div className="text-xs text-text-tertiary font-mono">{emp.cnpj}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={emp.status === "ativa" ? "secondary" : "outline"} className={emp.status === "ativa" ? "bg-green-500/10 text-green-700" : ""}>
                      {emp.status === "ativa" ? <><CheckCircle2 className="h-3 w-3 mr-1" />Ativa</> : "Inativa"}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setEditing(emp); setDialogOpen(true); }}>Editar</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpand(emp.id)}>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border-subtle bg-bg-surface-2/50 px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />Membros
                      </span>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setMembroDialogEmpresa(emp)}>
                        <Plus className="h-3 w-3 mr-1" />Adicionar
                      </Button>
                    </div>
                    {!memsList ? (
                      <div className="flex items-center gap-2 text-sm text-text-tertiary py-1"><Loader2 className="h-3.5 w-3.5 animate-spin" />Carregando…</div>
                    ) : memsList.length === 0 ? (
                      <p className="text-sm text-text-tertiary">Nenhum membro vinculado.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {memsList.map((m) => (
                          <div key={m.id} className="flex items-center gap-3 bg-bg-elevated rounded-lg px-3 py-2">
                            <div className="h-7 w-7 rounded-full bg-accent-primary/10 text-accent-primary font-semibold grid place-items-center text-xs shrink-0">
                              {(m.profiles?.nome || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-text-primary truncate">{m.profiles?.nome ?? "—"}</div>
                              <div className="text-xs text-text-tertiary truncate">{m.profiles?.email ?? "—"}</div>
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0">{m.role}</Badge>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-destructive hover:text-destructive shrink-0" onClick={() => removeMembro(m.id, emp.id)}>
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
              {search ? "Nenhuma empresa encontrada." : "Nenhuma empresa cadastrada."}
            </div>
          )}
        </div>
      )}

      <NovaEmpresaDialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }} onCreated={load} editing={editing} />
      {membroDialogEmpresa && (
        <AdicionarMembroDialog
          empresa={membroDialogEmpresa}
          open={!!membroDialogEmpresa}
          onOpenChange={(v) => { if (!v) setMembroDialogEmpresa(null); }}
          onCreated={() => { loadMembros(membroDialogEmpresa.id); }}
        />
      )}
    </div>
  );
}
