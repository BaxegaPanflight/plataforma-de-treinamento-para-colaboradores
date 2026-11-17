import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBranding, VIA_DEFAULT_COLOR, ONBOARDING_ADIADO_KEY } from "@/lib/branding-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/configuracoes")({ component: Cfg });

function Cfg() {
  const nav = useNavigate();
  const { markOnboardingIncomplete } = useBranding();
  const [redoing, setRedoing] = useState(false);
  const [color, setColor] = useState(VIA_DEFAULT_COLOR);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingNome, setSavingNome] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("branding")
      .select("primary_color, logo_url, nome_empresa")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.primary_color) setColor(data.primary_color);
        if (data?.logo_url) setLogoUrl(data.logo_url);
        if (data?.nome_empresa) setNomeEmpresa(data.nome_empresa);
      });
  }, []);

  const uploadLogo = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Selecione uma imagem");
    if (file.size > 2 * 1024 * 1024) return toast.error("Imagem deve ter no máximo 2MB");

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logo-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("branding")
      .upload(path, file, { upsert: true });

    if (upErr) { setUploading(false); return toast.error(upErr.message); }

    const { data } = supabase.storage.from("branding").getPublicUrl(path);
    const url = data.publicUrl;

    const { error: dbErr } = await supabase
      .from("branding")
      .update({ logo_url: url })
      .eq("id", 1);

    setUploading(false);
    if (dbErr) return toast.error(dbErr.message);
    setLogoUrl(url);
    toast.success("Logo atualizado");
  };

  const removeLogo = async () => {
    const { error } = await supabase
      .from("branding")
      .update({ logo_url: null })
      .eq("id", 1);
    if (error) return toast.error(error.message);
    setLogoUrl(null);
    toast.success("Logo removido");
  };

  const saveColor = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("branding")
      .update({ primary_color: color })
      .eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty("--ring", color);
    toast.success("Cor salva");
  };

  const saveNome = async () => {
    if (!nomeEmpresa.trim()) return toast.error("Informe o nome da empresa");
    setSavingNome(true);
    const { error } = await supabase
      .from("branding")
      .update({ nome_empresa: nomeEmpresa.trim() })
      .eq("id", 1);
    setSavingNome(false);
    if (error) return toast.error(error.message);
    document.title = nomeEmpresa.trim();
    toast.success("Nome salvo");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Branding</span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Configurações</h1>
      </div>

      {/* Nome da empresa */}
      <div className="lp-solid-card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Nome da empresa</h2>
          <p className="text-sm text-text-secondary">Exibido no título do browser e na navbar quando não há logo configurado.</p>
        </div>
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input
            value={nomeEmpresa}
            onChange={(e) => setNomeEmpresa(e.target.value)}
            placeholder="Ex: Acme Treinamentos"
            maxLength={60}
          />
        </div>
        <Button variant="lp-primary" onClick={saveNome} disabled={savingNome}>
          {savingNome ? "Salvando…" : "Salvar nome"}
        </Button>
      </div>

      {/* Logo */}
      <div className="lp-solid-card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Logo</h2>
          <p className="text-sm text-text-secondary">Exibido no topo do painel e na área do aluno. PNG ou SVG, máx 2MB.</p>
        </div>

        {logoUrl ? (
          <div className="flex items-center gap-4">
            <div className="h-16 w-40 rounded-xl border border-border-subtle bg-bg-surface-2 flex items-center justify-center p-3">
              <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
            </div>
            <Button variant="ghost" size="sm" onClick={removeLogo} className="text-destructive hover:text-destructive">
              <X className="h-4 w-4 mr-1" />Remover
            </Button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center cursor-pointer hover:border-accent-primary/40 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-text-tertiary mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Clique para selecionar o logo</p>
            <p className="text-xs text-text-tertiary mt-1">PNG, JPG ou SVG</p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ""; }}
        />

        {!logoUrl && (
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Enviando…" : "Selecionar logo"}
          </Button>
        )}
      </div>

      {/* Cor primária */}
      <div className="lp-solid-card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Cor primária</h2>
          <p className="text-sm text-text-secondary">Aplicada em botões, links e destaques em toda a plataforma.</p>
        </div>
        <div className="space-y-2">
          <Label>Cor</Label>
          <div className="flex gap-3 items-center">
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-12 p-1 cursor-pointer"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="font-mono w-36"
              maxLength={7}
            />
            <div className="h-12 w-20 rounded-xl border border-border-subtle" style={{ backgroundColor: color }} />
          </div>
        </div>
        <Button variant="lp-primary" onClick={saveColor} disabled={saving}>
          {saving ? "Salvando…" : "Salvar cor"}
        </Button>
      </div>

      {/* Refazer onboarding */}
      <div className="lp-solid-card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Assistente de configuração</h2>
          <p className="text-sm text-text-secondary">
            Reabra o passo a passo inicial para revisar branding e chaves de integração
            (Panda Video, Resend, WhatsApp, OpenAI). O que já está salvo é mantido.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={redoing}
          onClick={async () => {
            setRedoing(true);
            const { error } = await supabase
              .from("branding")
              .update({ onboarding_completo: false })
              .eq("id", 1);
            setRedoing(false);
            if (error) return toast.error(error.message);
            localStorage.removeItem(ONBOARDING_ADIADO_KEY);
            markOnboardingIncomplete();
            nav({ to: "/onboarding" });
          }}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {redoing ? "Abrindo…" : "Refazer onboarding"}
        </Button>
      </div>
    </div>
  );
}
