import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthSlideCard } from "@/components/auth/AuthSlideCard";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo!");
    nav({ to: "/" });
  };

  const handleRegister = async ({
    nome,
    email,
    password,
  }: {
    nome: string;
    email: string;
    password: string;
  }) => {
    if (password.length < 6) return toast.error("Senha mínima de 6 caracteres");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nome },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data.session) {
      // Acesso imediato: com autoconfirm ligado o signUp já devolve a sessão.
      toast.success("Conta criada! Bem-vindo.");
      nav({ to: "/" });
      return;
    }
    toast.success("Conta criada! Verifique seu email para confirmar.");
  };

  const handleReset = async (email: string) => {
    if (!email) return toast.error("Informe seu email no campo acima");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Email de recuperação enviado");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base p-5">
      <AuthSlideCard
        onLogin={handleLogin}
        onRegister={handleRegister}
        onResetPassword={handleReset}
        loading={loading}
      />
    </div>
  );
}
