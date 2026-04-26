import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import type { Group } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";
import { Countdown } from "./Countdown";
import { StarRating } from "./StarRating";
import { VerifiedBadge } from "./VerifiedBadge";
import { formatEGP, arabicNumber } from "@/lib/format";
import { getUsers } from "@/lib/mock-store";

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const organizer = getUsers().find((u) => u.id === group.organizerId);
  const approvedCount = group.members.filter((m) => m.status === "approved").length;
  const discount = group.originalPrice
    ? Math.round(((group.originalPrice - group.groupPrice) / group.originalPrice) * 100)
    : 0;

  return (
    <Link
      to={`/group/${group.id}`}
      className="group block surface-card overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img
          src={group.images[0]}
          alt={group.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Countdown expiresAt={group.expiresAt} variant="badge" />
        </div>
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-accent-glow">
            خصم {arabicNumber(discount)}%
          </div>
        )}
        {group.category && (
          <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {group.category}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {group.title}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-primary">
            {formatEGP(group.groupPrice)}
          </span>
          {group.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatEGP(group.originalPrice)}
            </span>
          )}
        </div>

        <ProgressBar
          current={approvedCount}
          min={group.minBuyers}
          max={group.maxBuyers}
        />

        {organizer && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                {organizer.name[0]}
              </div>
              <span className="text-xs font-medium truncate">{organizer.name}</span>
              {organizer.kycStatus === "approved" && (
                <VerifiedBadge size="sm" showLabel={false} />
              )}
            </div>
            {organizer.rating ? (
              <StarRating value={organizer.rating} size="sm" showNumber />
            ) : (
              <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                <Users className="w-3 h-3" /> جديد
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
