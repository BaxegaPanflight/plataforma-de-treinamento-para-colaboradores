import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/lp/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/convite/$token")({ component: Invite });

type Step = "loading" | "set-password" | "done" | "invalid";

interface Invitation {
  nome: string;
  email: string;
  role: string;
}

function Invite() {
  const { token } = Route.useParams();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("loading");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const validateToken = async () => {
    const { data: inv } = await supabase
      .from("invitations")
      .select("nome, email, role, expires_at, used_at")
      .eq("token", token)
      .maybeSingle();

    if (!inv || inv.used_at || new Date(inv.expires_at) < new Date()) {
      setStep("invalid");
      return false;
    }
    setInvitation({ nome: inv.nome, email: inv.email, role: inv.role ?? "aluno" });
    setStep("set-password");
    return true;
  };

  useEffect(() => {
    // Supabase sets session from URL hash after invite email click
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        await validateToken();
      }
    });

    // Also handle case where session is already set (page refresh)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await validateToken();
      } else {
        // No session yet — user must click the invite email link first
        // Show invalid after timeout if hash params never arrive
        setTimeout(() => {
          setStep((prev) => (prev === "loading" ? "invalid" : prev));
        }, 4000);
      }
    });

    return () => subscription.unsubscribe();
  }, [token]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Senha mínima de 6 caracteres");
    if (password !== confirm) return toast.error("As senhas não conferem");

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setSaving(false); return toast.error(error.message); }

    // Mark invitation as used
    await supabase
      .from("invitations")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    setSaving(false);
    setStep("done");
    const destination = invitation?.role === "aluno" ? "/aluno/catalogo" : "/admin/dashboard";
    setTimeout(() => nav({ to: destination }), 2000);
  };

  if (step === "loading") {
    return (
      <div className="min-h-screen grid place-items-center text-text-secondary text-sm">
        Validando convite…
      </div>
    );
  }

  if (step === "invalid") {
    return (
      <AuthShell title="Link inválido" subtitle="Este convite expirou, já foi utilizado ou o link está incorreto.">
        <Button className="w-full" onClick={() => nav({ to: "/login" })}>
          Ir para o login
        </Button>
      </AuthShell>
    );
  }

  if (step === "done") {
    return (
      <AuthShell title="Tudo certo!" subtitle="Senha definida. Redirecionando para a plataforma…">
        <div className="grid place-items-center py-6">
          <CheckCircle2 className="h-14 w-14 text-accent-success" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={`Olá, ${invitation?.nome?.split(" ")[0] ?? ""}!`}
      subtitle="Defina uma senha para acessar o painel de gestão."
    >
      <form onSubmit={handleSetPassword} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={invitation?.email ?? ""} disabled className="opacity-60" />
        </div>
        <div className="space-y-1.5">
          <Label>Nova senha</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label>Confirmar senha</Label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Salvando…" : "Definir senha e entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}
