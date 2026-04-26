import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function VerifiedBadge({
  className,
  size = "sm",
  showLabel = true,
}: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-info-soft text-info border border-info/20 font-semibold",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
      title="منظِّم موثَّق بالهوية"
    >
      <ShieldCheck className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {showLabel && "موثَّق"}
    </span>
  );
}
