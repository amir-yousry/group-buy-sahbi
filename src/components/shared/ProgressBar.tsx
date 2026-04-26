import { cn } from "@/lib/utils";
import { arabicNumber } from "@/lib/format";

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

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-foreground">
            {arabicNumber(current)} / {arabicNumber(max)} مشتري
          </span>
          <span
            className={cn(
              "font-medium",
              reachedMin ? "text-success" : "text-muted-foreground"
            )}
          >
            {reachedMin
              ? "✓ اكتمل الحد الأدنى"
              : `الحد الأدنى ${arabicNumber(min)}`}
          </span>
        </div>
      )}
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute top-0 right-0 h-full rounded-full transition-all duration-500",
            reachedMin ? "bg-gradient-primary" : "bg-gradient-accent"
          )}
          style={{ width: `${pct}%` }}
        />
        {/* min threshold marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/30"
          style={{ right: `${minPct}%` }}
          title={`الحد الأدنى: ${min}`}
        />
      </div>
    </div>
  );
}
