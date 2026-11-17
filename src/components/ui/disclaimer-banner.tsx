import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclaimerBannerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function DisclaimerBanner({ title, children, className }: DisclaimerBannerProps) {
  return (
    <div className={cn(
      "flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm",
      className,
    )}>
      <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-amber-800 dark:text-amber-300 leading-relaxed">
        {title && <span className="font-semibold">{title} — </span>}
        {children}
      </div>
    </div>
  );
}
