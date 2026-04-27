import { cn } from "@/lib/utils";
import { arabicNumber } from "@/lib/format";
import { CheckCircle2, Users } from "lucide-react";

interface ProgressBarProps {
  current: number;
  min: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  current,
  min,
  max,
  className,
  showLabel = true,
}: ProgressBarProps) {
  const pct = Math.min(100, (current / max) * 100);
  const minPct = Math.min(100, (min / max) * 100);
  const reachedMin = current >= min;
  const almostThere = !reachedMin && current / min >= 0.7;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs gap-2">
          <span className="font-bold text-foreground inline-flex items-center gap-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            {arabicNumber(current)} / {arabicNumber(max)} مشتري
          </span>
          <span
            className={cn(
              "font-semibold inline-flex items-center gap-1",
              reachedMin
                ? "text-success"
                : almostThere
                ? "text-accent"
                : "text-muted-foreground"
            )}
          >
            {reachedMin ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                اكتمل الحد الأدنى
              </>
            ) : almostThere ? (
              <>🔥 اقترب الاكتمال</>
            ) : (
              `الحد الأدنى ${arabicNumber(min)}`
            )}
          </span>
        </div>
      )}
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute top-0 right-0 h-full rounded-full transition-all duration-700 ease-out",
            reachedMin
              ? "bg-gradient-primary"
              : almostThere
              ? "bg-gradient-accent"
              : "bg-gradient-to-l from-primary/70 to-primary-glow/70"
          )}
          style={{ width: `${pct}%` }}
        />
        {/* Live shimmer overlay when active and not full */}
        {!reachedMin && pct > 5 && (
          <div
            className="absolute top-0 right-0 h-full rounded-full overflow-hidden pointer-events-none"
            style={{ width: `${pct}%` }}
          >
            <div
              className="h-full w-1/3 bg-gradient-to-l from-transparent via-white/40 to-transparent"
              style={{ animation: "shimmer 2s linear infinite" }}
            />
          </div>
        )}
        {/* min threshold marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3.5 w-0.5 bg-foreground/40 rounded-full"
          style={{ right: `${minPct}%` }}
          title={`الحد الأدنى: ${min}`}
        />
      </div>
    </div>
  );
}
