import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { arabicNumber } from "@/lib/format";

interface StarRatingProps {
  /** rating from 0 to 10 */
  value: number;
  /** if interactive, called with new value */
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  reviewsCount?: number;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  size = "md",
  showNumber = true,
  reviewsCount,
  className,
}: StarRatingProps) {
  const interactive = !!onChange;
  // Display: collapse 10 stars to 5 visual stars (0-10 -> 0-5)
  const visual = value / 2;
  const sizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  if (interactive) {
    // 10-star interactive
    return (
      <div className={cn("flex items-center gap-0.5", className)} dir="ltr">
        {Array.from({ length: 10 }).map((_, i) => {
          const filled = i < value;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange?.(i + 1)}
              className="transition-transform hover:scale-110"
              aria-label={`${i + 1} نجمة`}
            >
              <Star
                className={cn(
                  sizes[size],
                  filled
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/40"
                )}
              />
            </button>
          );
        })}
        <span className="mr-2 text-sm font-bold text-foreground">
          {arabicNumber(value)}/10
        </span>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5" dir="ltr">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, visual - i));
          return (
            <div key={i} className="relative">
              <Star className={cn(sizes[size], "text-muted-foreground/30")} />
              {fill > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className={cn(sizes[size], "fill-accent text-accent")} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showNumber && (
        <span
          className={cn(
            "font-semibold text-foreground",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          {arabicNumber(Math.round(value * 10) / 10)}
        </span>
      )}
      {reviewsCount !== undefined && (
        <span
          className={cn(
            "text-muted-foreground",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          ({arabicNumber(reviewsCount)})
        </span>
      )}
    </div>
  );
}
