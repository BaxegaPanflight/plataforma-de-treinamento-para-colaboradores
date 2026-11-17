import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Upload, LogOut, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/_aluno/aluno/perfil")({ component: Perfil });

interface Profile {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  avatar_url: string | null;
  cargo: string | null;
  setor: string | null;
  telefone: string | null;
}

interface AttemptRow {
  id: string;
  created_at: string;
  score: number;
  aprovado: boolean;
  curso: string;
}

function formatCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function Perfil() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [cargo, setCargo] = useState("");
  const [setor, setSetor] = useState("");
  const [telefone, setTelefone] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setProfile(data as Profile);
        setNome(data.nome ?? "");
        setCpf(data.cpf ?? "");
        setCargo(data.cargo ?? "");
        setSetor(data.setor ?? "");
        setTelefone(data.telefone ?? "");
      }
    });

    (async () => {
      setLoadingAttempts(true);
      const { data: enrs } = await supabase
        .from("enrollments")
        .select("id, course_id, courses(titulo)")
        .eq("user_id", user.id);

      if (!enrs?.length) { setLoadingAttempts(false); return; }

      const enrollmentIds = enrs.map((e) => e.id);
      const courseMap = new Map(enrs.map((e) => [e.id, (e.courses as { titulo: string } | null)?.titulo ?? "Curso"]));

      const { data: atts } = await supabase
        .from("attempts")
        .select("id, created_at, score, aprovado, enrollment_id")
        .in("enrollment_id", enrollmentIds)
        .order("created_at", { ascending: false })
        .limit(30);

      setAttempts(
        (atts ?? []).map((a) => ({
          id: a.id,
          created_at: a.created_at,
          score: a.score,
          aprovado: a.aprovado,
          curso: courseMap.get(a.enrollment_id) ?? "Curso",
        }))
      );
      setLoadingAttempts(false);
    })();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ nome, cpf: cpf || null, cargo: cargo || null, setor: setor || null, telefone: telefone || null }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setProfile((p) => p ? { ...p, nome, cpf: cpf || null } : p);
    toast.success("Perfil atualizado");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Imagem deve ter no máximo 2MB");

    setAvatarUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("public").upload(path, file, { upsert: true });
    if (uploadErr) { setAvatarUploading(false); return toast.error(uploadErr.message); }

    const { data: { publicUrl } } = supabase.storage.from("public").getPublicUrl(path);
    const { error: updateErr } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    setAvatarUploading(false);
    if (updateErr) return toast.error(updateErr.message);
    setProfile((p) => p ? { ...p, avatar_url: publicUrl } : p);
    toast.success("Foto atualizada");
  };

  const handleSignOut = async () => {
    await signOut();
    nav({ to: "/login" });
  };

  const initials = (profile?.nome || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Conta</span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Meu perfil</h1>
      </div>

      {/* Avatar + basic info */}
      <ScrollReveal>
        <div className="lp-solid-card p-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-20 w-20 rounded-full object-cover border-2 border-border-subtle" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-accent-primary/10 text-accent-primary text-2xl font-bold grid place-items-center border-2 border-border-subtle">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-accent-primary text-white grid place-items-center shadow-md hover:bg-accent-primary/90 transition-colors"
              >
                {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-text-primary truncate">{profile?.nome || "(sem nome)"}</div>
              <div className="text-sm text-text-secondary truncate">{profile?.email || user?.email}</div>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
              </div>
              <div className="space-y-1.5">
                <Label>CPF</Label>
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cargo</Label>
                <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Operador de Empilhadeira" />
              </div>
              <div className="space-y-1.5">
                <Label>Setor / Departamento</Label>
                <Input value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Ex: Logística" />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp</Label>
                <Input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  inputMode="tel"
                />
                <p className="text-xs text-text-tertiary">Para receber alertas de vencimento de treinamento.</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile?.email || user?.email || ""} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-xs text-text-tertiary">O email não pode ser alterado por aqui.</p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando…</> : "Salvar alterações"}
            </Button>
          </form>
        </div>
      </ScrollReveal>

      {/* Attempts history */}
      <ScrollReveal delay={0.1}>
        <div className="lp-solid-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h2 className="text-base font-semibold text-text-primary">Histórico de avaliações</h2>
            <p className="text-sm text-text-secondary mt-0.5">Suas últimas tentativas de prova.</p>
          </div>
          {loadingAttempts ? (
            <div className="p-8 flex items-center justify-center gap-2 text-text-tertiary text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />Carregando…
            </div>
          ) : !attempts.length ? (
            <div className="p-8 text-center text-text-tertiary text-sm">
              Nenhuma avaliação realizada ainda.
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {attempts.map((a) => (
                <div key={a.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{a.curso}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">
                      {new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-lg font-bold tabular-nums ${a.aprovado ? "text-accent-success" : "text-destructive"}`}>
                      {Math.round(a.score)}%
                    </span>
                    {a.aprovado
                      ? <CheckCircle2 className="h-5 w-5 text-accent-success" />
                      : <XCircle className="h-5 w-5 text-destructive" />
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Sign out */}
      <ScrollReveal delay={0.15}>
        <div className="lp-solid-card p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-text-primary">Sair da conta</div>
            <div className="text-xs text-text-tertiary mt-0.5">Você será redirecionado para o login.</div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60">
            <LogOut className="h-4 w-4 mr-2" />Sair
          </Button>
        </div>
      </ScrollReveal>
    </div>
  );
}
