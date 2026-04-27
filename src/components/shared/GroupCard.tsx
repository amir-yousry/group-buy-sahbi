import { Link } from "react-router-dom";
import { Users, Flame, ImageIcon } from "lucide-react";
import { useState } from "react";
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
  const [imgLoaded, setImgLoaded] = useState(false);
  const organizer = getUsers().find((u) => u.id === group.organizerId);
  const approvedCount = group.members.filter((m) => m.status === "approved").length;
  const discount = group.originalPrice
    ? Math.round(((group.originalPrice - group.groupPrice) / group.originalPrice) * 100)
    : 0;
  const reachedMin = approvedCount >= group.minBuyers;
  const almostThere = !reachedMin && approvedCount / group.minBuyers >= 0.7;
  const spotsLeft = group.maxBuyers - approvedCount;
  const fewSpotsLeft = spotsLeft > 0 && spotsLeft <= 3;

  return (
    <Link
      to={`/group/${group.id}`}
      className="group block surface-card overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 focus-ring rounded-2xl"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 skeleton flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        <img
          src={group.images[0]}
          alt={group.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Gradient overlay for badge legibility */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        <div className="absolute top-3 right-3">
          <Countdown expiresAt={group.expiresAt} variant="badge" />
        </div>
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-accent text-accent-foreground text-xs font-extrabold px-2.5 py-1 rounded-full shadow-accent-glow">
            خصم {arabicNumber(discount)}%
          </div>
        )}

        {/* Bottom badges */}
        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between gap-2">
          {group.category && (
            <span className="bg-background/95 backdrop-blur-sm text-foreground text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm">
              {group.category}
            </span>
          )}
          {(almostThere || fewSpotsLeft) && (
            <span className="ms-auto inline-flex items-center gap-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
              <Flame className="w-3 h-3" />
              {fewSpotsLeft
                ? `باقي ${arabicNumber(spotsLeft)} مقاعد`
                : "اقترب الاكتمال"}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {group.title}
        </h3>

        <div className="flex items-baseline gap-2 flex-wrap">
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
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
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
