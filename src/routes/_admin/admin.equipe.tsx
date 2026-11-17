import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserCog } from "lucide-react";
import { toast } from "sonner";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/_admin/admin/equipe")({ component: Equipe });

interface Gestor {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
}

function Equipe() {
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "gestor");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (!ids.length) { setGestores([]); return; }
    const { data } = await supabase.from("profiles").select("id, nome, email, ativo").in("id", ids);
    setGestores((data ?? []) as Gestor[]);
  };

  useEffect(() => { load(); }, []);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !nome) return toast.error("Preencha nome e email");
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-gestor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email, nome }),
    });
    setLoading(false);
    const body = await res.json();
    if (!res.ok) return toast.error(body.error ?? "Erro ao enviar convite");
    toast.success(`Convite enviado para ${email}`);
    setEmail(""); setNome(""); setOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Acesso</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Equipe</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="lp-primary">
              <UserPlus className="h-4 w-4 mr-2" />Convidar gestor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar gestor</DialogTitle>
            </DialogHeader>
            <form onSubmit={invite} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ana Lima"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email corporativo</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ana@empresa.com"
                  required
                />
              </div>
              <p className="text-xs text-text-tertiary">
                O gestor receberá um email com o link para definir sua senha e acessar o painel.
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando…" : "Enviar convite"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2">
        {gestores.map((g, i) => (
          <ScrollReveal key={g.id} delay={i * 0.03}>
            <div className="lp-solid-card p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-accent-warm/10 text-accent-warm grid place-items-center shrink-0">
                  <UserCog className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-text-primary truncate">{g.nome || "(sem nome)"}</div>
                  <div className="text-sm text-text-secondary truncate">{g.email}</div>
                </div>
              </div>
              <Badge variant={g.ativo ? "default" : "secondary"}>
                {g.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </ScrollReveal>
        ))}
        {gestores.length === 0 && (
          <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
            Nenhum gestor ainda. Convide alguém acima.
          </div>
        )}
      </div>
    </div>
  );
}
