import { useEffect, useState } from "react";
import { Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeRemaining } from "@/lib/format";

interface CountdownProps {
  expiresAt: string;
  className?: string;
  variant?: "inline" | "badge";
}

export function Countdown({
  expiresAt,
  className,
  variant = "inline",
}: CountdownProps) {
  const [, force] = useState(0);
  const t = timeRemaining(expiresAt);

  // Tick faster when under an hour for live feel
  const fast = !t.expired && (t.short.includes("د") || t.short.includes("ساعة"));

  useEffect(() => {
    const interval = fast ? 1_000 : 60_000;
    const i = setInterval(() => force((n) => n + 1), interval);
    return () => clearInterval(i);
  }, [fast]);

  // Urgent: < 1 hour left
  const urgent = !t.expired && t.short.includes("د");
  // Warning: < 24h left
  const warning = !t.expired && (urgent || t.short.includes("ساعة"));

  if (variant === "badge") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md",
          t.expired
            ? "bg-muted/90 text-muted-foreground"
            : urgent
            ? "bg-destructive text-destructive-foreground shadow-sm animate-pulse"
            : warning
            ? "bg-accent-soft text-accent border border-accent/40"
            : "bg-success-soft text-success border border-success/30",
          className
        )}
      >
        {urgent ? <Flame className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {t.short}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        t.expired
          ? "text-muted-foreground"
          : urgent
          ? "text-destructive font-semibold"
          : "text-foreground",
        className
      )}
    >
      {urgent ? <Flame className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
      <span className="font-medium">{t.label}</span>
    </span>
  );
}
