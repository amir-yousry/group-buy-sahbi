import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
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
  useEffect(() => {
    const i = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(i);
  }, []);

  const t = timeRemaining(expiresAt);
  const urgent = !t.expired && t.short.includes("ساعة") || t.short.includes("د");

  if (variant === "badge") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
          t.expired
            ? "bg-muted text-muted-foreground"
            : urgent
            ? "bg-accent-soft text-accent border border-accent/30"
            : "bg-success-soft text-success border border-success/20",
          className
        )}
      >
        <Clock className="w-3 h-3" />
        {t.short}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        t.expired ? "text-muted-foreground" : "text-foreground",
        className
      )}
    >
      <Clock className="w-4 h-4" />
      <span className="font-medium">{t.label}</span>
    </span>
  );
}
