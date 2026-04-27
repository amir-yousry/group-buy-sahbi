import { BadgeCheck } from "lucide-react";
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
        "inline-flex items-center gap-1 rounded-full bg-info-soft text-info border border-info/30 font-bold shadow-sm",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
      title="منظِّم موثَّق بالهوية"
    >
      <BadgeCheck className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} fill="currentColor" stroke="hsl(var(--info-soft))" strokeWidth={2.5} />
      {showLabel && "موثَّق"}
    </span>
  );
}
