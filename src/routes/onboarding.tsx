import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { listApiKeys, storeApiKey } from "@/lib/api-keys.functions";
import { useBranding, VIA_DEFAULT_COLOR, ONBOARDING_ADIADO_KEY } from "@/lib/branding-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2, Building2, Video, Mail, Zap, CheckCircle2,
  ExternalLink, Eye, EyeOff, Upload, ArrowLeft, LogOut,
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const STEPS = [
  { label: "Empresa", icon: Building2 },
  { label: "Vídeos",  icon: Video     },
  { label: "Email",   icon: Mail      },
  { label: "Extras",  icon: Zap       },
];

function Onboarding() {
  const { user, role, loading: authLoading } = useAuth();
  const { onboardingCompleto, markOnboardingComplete } = useBranding();
  const nav = useNavigate();
  const store = useServerFn(storeApiKey);
  const listKeys = useServerFn(listApiKeys);

  const [step, setStep]     = useState(0);
  const [saving, setSaving] = useState(false);
  // Chaves já registradas (wizard bidirecional: mostra o que está configurado)
  const [configured, setConfigured] = useState<Record<string, boolean>>({});

  // Step 1 — Empresa
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [corPrimaria, setCorPrimaria] = useState(VIA_DEFAULT_COLOR);
  const [logoFile, setLogoFile]       = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 2 — Panda Video
  const [pandaKey, setPandaKey]     = useState("");
  const [showPanda, setShowPanda]   = useState(false);

  // Step 3 — Resend
  const [resendKey, setResendKey]   = useState("");
  const [showResend, setShowResend] = useState(false);

  // Step 4 — Extras
  const [evoUrl, setEvoUrl]           = useState("");
  const [evoInstance, setEvoInstance] = useState("");
  const [evoKey, setEvoKey]           = useState("");
  const [showEvo, setShowEvo]         = useState(false);
  const [openaiKey, setOpenaiKey]     = useState("");
  const [showOai, setShowOai]         = useState(false);

  // Guards
  useEffect(() => {
    if (authLoading || onboardingCompleto === null) return;
    if (!user)                   { nav({ to: "/login" });           return; }
    if (role !== "admin")        { nav({ to: "/aluno/catalogo" });  return; }
    if (onboardingCompleto)      { nav({ to: "/admin/dashboard" }); return; }
  }, [user, role, authLoading, onboardingCompleto, nav]);

  // Bidirecional: relê o que já foi salvo (branding + chaves registradas)
  useEffect(() => {
    if (authLoading || !user || role !== "admin") return;
    (async () => {
      const { data } = await supabase
        .from("branding")
        .select("nome_empresa, primary_color, logo_url")
        .eq("id", 1)
        .maybeSingle();
      if (data) {
        if (data.nome_empresa) setNomeEmpresa(data.nome_empresa);
        if (data.primary_color) setCorPrimaria(data.primary_color);
        if (data.logo_url) setLogoPreview(data.logo_url);
      }
      try {
        const entries = await listKeys();
        const map: Record<string, boolean> = {};
        for (const e of entries) map[e.service_name] = e.is_active;
        setConfigured(map);
      } catch {
        // sem status das chaves o wizard segue funcionando, só sem os badges
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, role]);

  const exitWizard = () => {
    localStorage.setItem(ONBOARDING_ADIADO_KEY, "1");
    nav({ to: "/admin/dashboard" });
  };

  if (authLoading || onboardingCompleto === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-bg-base">
        <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
      </div>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const saveEmpresa = async () => {
    setSaving(true);
    try {
      let logoUrl: string | undefined;
      if (logoFile) {
        const ext  = logoFile.name.split(".").pop();
        const path = `logo.${ext}`;
        const { error } = await supabase.storage.from("branding").upload(path, logoFile, { upsert: true });
        if (error) throw new Error(error.message);
        const { data: { publicUrl } } = supabase.storage.from("branding").getPublicUrl(path);
        logoUrl = publicUrl;
      }
      await supabase.from("branding").update({
        nome_empresa:  nomeEmpresa.trim() || null,
        primary_color: corPrimaria,
        ...(logoUrl ? { logo_url: logoUrl } : {}),
      }).eq("id", 1);
      setStep(1);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const savePanda = async (skip: boolean) => {
    if (skip) { setStep(2); return; }
    setSaving(true);
    try {
      await store({ data: { service_name: "panda_video", key: pandaKey.trim(), label: "Panda Video" } });
      setStep(2);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Erro ao salvar chave");
    } finally {
      setSaving(false);
    }
  };

  const saveResend = async (skip: boolean) => {
    if (skip) { setStep(3); return; }
    setSaving(true);
    try {
      await store({ data: { service_name: "resend", key: resendKey.trim(), label: "Resend" } });
      setStep(3);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Erro ao salvar chave");
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      if (evoUrl.trim() && evoInstance.trim() && evoKey.trim()) {
        await store({
          data: {
            service_name: "evolution_api",
            key: JSON.stringify({ url: evoUrl.trim(), instance: evoInstance.trim(), key: evoKey.trim() }),
            label: "Evolution API (WhatsApp)",
          },
        });
      }
      if (openaiKey.trim()) {
        await store({ data: { service_name: "openai", key: openaiKey.trim(), label: "OpenAI (opcional)" } });
      }
      await supabase.from("branding").update({ onboarding_completo: true }).eq("id", 1);
      localStorage.removeItem(ONBOARDING_ADIADO_KEY);
      markOnboardingComplete();
      nav({ to: "/admin/dashboard" });
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Erro ao finalizar setup");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            type="button"
            onClick={exitWizard}
            className="absolute right-0 top-0 inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Configurar depois
          </button>
          <div className="h-12 w-12 rounded-xl bg-accent-primary/10 text-accent-primary grid place-items-center mx-auto mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Configuração inicial</h1>
          <p className="text-sm text-text-secondary mt-1">
            Vamos deixar sua plataforma pronta para uso. Você pode sair e retomar quando quiser —
            tudo fica salvo e também pode ser ajustado depois em Configurações e Chaves de API.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done   = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full grid place-items-center transition-colors ${
                  done   ? "bg-accent-success text-white"
                  : active ? "bg-accent-primary text-white"
                  : "bg-bg-surface-2 text-text-tertiary"
                }`}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs hidden sm:block ${active ? "text-text-primary font-medium" : "text-text-tertiary"}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-6 ${done ? "bg-accent-success" : "bg-border-subtle"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="lp-solid-card p-6 space-y-5">

          {/* ── Step 1: Empresa ─────────────────────────────────────────────── */}
          {step === 0 && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Sua empresa</h2>
                <p className="text-sm text-text-secondary mt-0.5">
                  Personalize a plataforma com a identidade da sua empresa.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border-subtle rounded-xl p-6 text-center cursor-pointer hover:border-accent-primary/40 transition-colors"
                >
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo" className="h-12 object-contain mx-auto" />
                    : <>
                        <Upload className="h-6 w-6 text-text-tertiary mx-auto mb-2" />
                        <p className="text-sm text-text-tertiary">PNG, JPG ou SVG · máx. 2MB</p>
                      </>
                  }
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setLogoFile(f);
                    setLogoPreview(URL.createObjectURL(f));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome da empresa</Label>
                <Input
                  id="nome"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  placeholder="Ex: Viver de IA"
                  maxLength={60}
                />
              </div>

              <div className="space-y-2">
                <Label>Cor principal</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border border-border-subtle"
                  />
                  <Input
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="font-mono w-32"
                    maxLength={7}
                  />
                  <span className="h-8 w-8 rounded-lg border border-border-subtle" style={{ backgroundColor: corPrimaria }} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="lp-primary" onClick={saveEmpresa} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Salvar e continuar →
                </Button>
              </div>
            </>
          )}

          {/* ── Step 2: Panda Video ─────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-text-primary">Panda Video</h2>
                  {configured["panda_video"] ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-success/10 text-accent-success font-semibold uppercase tracking-widest">
                      <CheckCircle2 className="h-3 w-3" /> Configurada
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold uppercase tracking-widest">
                      Obrigatório
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">
                  Plataforma de hospedagem de vídeos das aulas. Necessário para exibir conteúdo em vídeo.
                </p>
              </div>

              <div className="bg-bg-surface rounded-xl p-4 text-sm text-text-secondary space-y-1">
                <p className="font-medium text-text-primary">Como obter sua chave:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Acesse pandavideo.com.br e faça login</li>
                  <li>Vá em Configurações → API</li>
                  <li>Copie a chave de API e cole abaixo</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label>Chave de API</Label>
                <div className="relative">
                  <Input
                    type={showPanda ? "text" : "password"}
                    value={pandaKey}
                    onChange={(e) => setPandaKey(e.target.value)}
                    placeholder="panda-..."
                    className="pr-10 font-mono"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPanda((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    {showPanda ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <a
                  href="https://pandavideo.readme.io/reference/auth"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent-primary hover:underline"
                >
                  Ver documentação <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex justify-between pt-2">
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => setStep(0)} disabled={saving} className="text-text-tertiary">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </Button>
                  <Button variant="ghost" onClick={() => savePanda(true)} disabled={saving} className="text-text-tertiary">
                    {configured["panda_video"] ? "Manter atual" : "Configurar depois"}
                  </Button>
                </div>
                <Button variant="lp-primary" onClick={() => savePanda(false)} disabled={saving || !pandaKey.trim()}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {configured["panda_video"] ? "Substituir e continuar →" : "Salvar e continuar →"}
                </Button>
              </div>
            </>
          )}

          {/* ── Step 3: Resend ──────────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-text-primary">Resend (Email)</h2>
                  {configured["resend"] ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-success/10 text-accent-success font-semibold uppercase tracking-widest">
                      <CheckCircle2 className="h-3 w-3" /> Configurada
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold uppercase tracking-widest">
                      Obrigatório
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">
                  Serviço de envio de emails. Necessário para convites, notificações e recuperação de senha.
                </p>
              </div>

              <div className="bg-bg-surface rounded-xl p-4 text-sm text-text-secondary space-y-1">
                <p className="font-medium text-text-primary">Como obter sua chave:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Acesse resend.com e crie uma conta gratuita</li>
                  <li>Vá em API Keys → Create API Key</li>
                  <li>Copie a chave (começa com <code className="font-mono">re_</code>) e cole abaixo</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label>Chave de API</Label>
                <div className="relative">
                  <Input
                    type={showResend ? "text" : "password"}
                    value={resendKey}
                    onChange={(e) => setResendKey(e.target.value)}
                    placeholder="re_..."
                    className="pr-10 font-mono"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResend((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    {showResend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <a
                  href="https://resend.com/docs/dashboard/api-keys/introduction"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent-primary hover:underline"
                >
                  Ver documentação <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex justify-between pt-2">
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => setStep(1)} disabled={saving} className="text-text-tertiary">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </Button>
                  <Button variant="ghost" onClick={() => saveResend(true)} disabled={saving} className="text-text-tertiary">
                    {configured["resend"] ? "Manter atual" : "Configurar depois"}
                  </Button>
                </div>
                <Button variant="lp-primary" onClick={() => saveResend(false)} disabled={saving || !resendKey.trim()}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {configured["resend"] ? "Substituir e continuar →" : "Salvar e continuar →"}
                </Button>
              </div>
            </>
          )}

          {/* ── Step 4: Extras + Finish ─────────────────────────────────────── */}
          {step === 3 && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Integrações opcionais</h2>
                <p className="text-sm text-text-secondary mt-0.5">
                  Configure agora ou depois em Chaves de API.
                </p>
              </div>

              {/* Evolution API */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-text-primary text-sm">WhatsApp (Evolution API)</h3>
                  {configured["evolution_api"] ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-success/10 text-accent-success font-semibold uppercase tracking-widest">
                      <CheckCircle2 className="h-3 w-3" /> Configurada
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-bg-surface-2 text-text-tertiary font-semibold uppercase tracking-widest">
                      Opcional
                    </span>
                  )}
                </div>
                <Input
                  placeholder="URL Base — https://evolution.suaempresa.com"
                  value={evoUrl}
                  onChange={(e) => setEvoUrl(e.target.value)}
                  type="url"
                />
                <Input
                  placeholder="Nome da instância"
                  value={evoInstance}
                  onChange={(e) => setEvoInstance(e.target.value)}
                />
                <div className="relative">
                  <Input
                    type={showEvo ? "text" : "password"}
                    placeholder="API Key"
                    value={evoKey}
                    onChange={(e) => setEvoKey(e.target.value)}
                    className="pr-10 font-mono"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEvo((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    {showEvo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <hr className="border-border-subtle" />

              {/* OpenAI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-text-primary text-sm">OpenAI (geração de quizzes)</h3>
                  {configured["openai"] ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-success/10 text-accent-success font-semibold uppercase tracking-widest">
                      <CheckCircle2 className="h-3 w-3" /> Configurada
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-bg-surface-2 text-text-tertiary font-semibold uppercase tracking-widest">
                      Opcional
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showOai ? "text" : "password"}
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="pr-10 font-mono"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOai((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    {showOai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(2)} disabled={saving} className="text-text-tertiary">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>
                <Button variant="lp-primary" onClick={finish} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Finalizar setup →
                </Button>
              </div>
            </>
          )}

        </div>

        <p className="text-center text-xs text-text-tertiary mt-6">
          Todas as chaves são armazenadas em cofre seguro e nunca expostas no frontend.
        </p>
      </div>
    </div>
  );
}
