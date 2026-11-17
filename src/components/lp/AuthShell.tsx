import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import ScrollReveal from "@/components/lp/ScrollReveal";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg-base">
      {/* left — dark brand panel */}
      <div className="hidden lg:flex lp-section-dark relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle at 30% 20%, oklch(0.62 0.214 274 / 0.45), transparent 60%)" }}
        />
        <Link to="/" className="relative flex items-center gap-2 text-text-on-dark font-bold">
          <div className="h-9 w-9 rounded-lg bg-accent-primary grid place-items-center text-white">L</div>
          LMS Compliance
        </Link>
        <ScrollReveal className="relative">
          <div className="lp-glass-card p-6 max-w-md">
            <ShieldCheck className="h-8 w-8 text-accent-primary-light mb-3" />
            <p className="text-text-on-dark text-lg font-medium leading-relaxed">
              "Reduzimos em 60% o tempo de onboarding de compliance e atingimos 100% de cobertura na trilha de LGPD."
            </p>
            <p className="mt-4 text-sm text-text-on-dark-muted">
              Joana Martins — Head de Pessoas
            </p>
          </div>
        </ScrollReveal>
        <p className="relative text-xs text-text-on-dark-muted">
          © {new Date().getFullYear()} LMS Compliance
        </p>
      </div>

      {/* right — form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <ScrollReveal>
            <div className="lp-solid-card p-8">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
              {subtitle && <p className="mt-1.5 text-sm text-text-secondary">{subtitle}</p>}
              <div className="mt-6">{children}</div>
              {footer && <div className="mt-6 text-sm text-center text-text-secondary">{footer}</div>}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
