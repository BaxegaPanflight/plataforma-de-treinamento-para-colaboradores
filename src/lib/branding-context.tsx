import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BrandingCtx {
  logoUrl: string | null;
  appName: string;
  primaryColor: string | null;
  onboardingCompleto: boolean | null; // null = still loading
  markOnboardingComplete: () => void;
  markOnboardingIncomplete: () => void;
}

/** Cor default do Design System Viver de IA — quando é ela, o tema fica intacto. */
export const VIA_DEFAULT_COLOR = "#0A4F95";

/** Flag local: o admin saiu do wizard de onboarding e prefere terminar depois. */
export const ONBOARDING_ADIADO_KEY = "onboarding-adiado";

const BrandingContext = createContext<BrandingCtx>({
  logoUrl: null,
  appName: "LMS",
  primaryColor: null,
  onboardingCompleto: null,
  markOnboardingComplete: () => {},
  markOnboardingIncomplete: () => {},
});

export function useBranding() {
  return useContext(BrandingContext);
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [appName, setAppName] = useState("LMS");
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [onboardingCompleto, setOnboardingCompleto] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("branding")
        .select("primary_color, logo_url, nome_empresa, onboarding_completo")
        .eq("id", 1)
        .maybeSingle();

      if (!data) {
        setOnboardingCompleto(false);
        return;
      }

      const name = (data as { nome_empresa?: string | null }).nome_empresa ?? "LMS";

      if (data.primary_color && data.primary_color.toUpperCase() !== VIA_DEFAULT_COLOR) {
        const rgb = hexToRgb(data.primary_color);
        if (rgb) {
          const [r, g, b] = rgb;
          document.documentElement.style.setProperty("--color-accent-primary-raw", `${r} ${g} ${b}`);
          document.documentElement.style.setProperty("--brand-hex", data.primary_color);
        }
        document.documentElement.style.setProperty("--primary", data.primary_color);
      }

      if (name) document.title = name;

      setLogoUrl(data.logo_url ?? null);
      setAppName(name);
      setPrimaryColor(data.primary_color ?? null);
      setOnboardingCompleto((data as { onboarding_completo?: boolean }).onboarding_completo ?? false);
    })();
  }, []);

  return (
    <BrandingContext.Provider value={{
      logoUrl,
      appName,
      primaryColor,
      onboardingCompleto,
      markOnboardingComplete: () => setOnboardingCompleto(true),
      markOnboardingIncomplete: () => setOnboardingCompleto(false),
    }}>
      {children}
    </BrandingContext.Provider>
  );
}
