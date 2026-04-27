import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  MessageCircle,
  Calendar,
  Users,
  Package,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Countdown } from "@/components/shared/Countdown";
import { StarRating } from "@/components/shared/StarRating";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { GroupStatusBadge } from "@/components/shared/StatusBadge";
import { JoinGroupModal } from "@/components/shared/JoinGroupModal";
import {
  ensureDirectConversation,
  ensureGroupConversation,
  getGroupById,
  getUsers,
} from "@/lib/mock-store";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatEGP, arabicNumber } from "@/lib/format";
import type { Group } from "@/lib/types";
import { toast } from "sonner";

export default function GroupDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | undefined>();
  const [showJoin, setShowJoin] = useState(false);

  const refresh = () => {
    if (id) setGroup(getGroupById(id));
  };
  useEffect(refresh, [id]);

  if (!group) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">لم يتم العثور على المجموعة</p>
        <Link to="/" className="text-primary mt-4 inline-block">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const organizer = getUsers().find((u) => u.id === group.organizerId);
  const approvedCount = group.members.filter((m) => m.status === "approved").length;
  const myMembership = user
    ? group.members.find((m) => m.userId === user.id)
    : undefined;
  const isFull = approvedCount >= group.maxBuyers;
  const discount = group.originalPrice
    ? Math.round(((group.originalPrice - group.groupPrice) / group.originalPrice) * 100)
    : 0;

  const onJoinClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowJoin(true);
  };

  const onChatClick = () => {
    if (!user) return navigate("/login");
    if (myMembership?.status === "approved") {
      const conv = ensureGroupConversation(group);
      navigate(`/chats/${conv.id}`);
    } else if (organizer) {
      const conv = ensureDirectConversation({
        userA: user.id,
        userAName: user.name,
        userB: organizer.id,
        userBName: organizer.name,
        groupId: group.id,
      });
      navigate(`/chats/${conv.id}`);
    }
  };

  const buttonState = (() => {
    if (group.status !== "active") return { text: "المجموعة مغلقة", disabled: true };
    if (myMembership?.status === "approved")
      return { text: "✓ أنت في هذه المجموعة", disabled: true, success: true };
    if (myMembership?.status === "pending")
      return { text: "إثبات الدفع قيد المراجعة", disabled: true, pending: true };
    if (isFull) return { text: "اكتملت المجموعة", disabled: true };
    return { text: "انضم للمجموعة", disabled: false };
  })();

  return (
    <div className="container max-w-5xl py-6 pb-32">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowRight className="w-4 h-4" />
        رجوع
      </button>

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Image gallery */}
        <div className="lg:col-span-2">
          <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden border border-border">
            <img
              src={group.images[0]}
              alt={group.title}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-gradient-accent text-accent-foreground font-extrabold px-3 py-1.5 rounded-full shadow-accent-glow">
                خصم {arabicNumber(discount)}%
              </div>
            )}
            <div className="absolute top-4 right-4">
              <GroupStatusBadge status={group.status} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-3 space-y-5">
          {group.category && (
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {group.category}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            {group.title}
          </h1>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-extrabold text-primary">
              {formatEGP(group.groupPrice)}
            </span>
            {group.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatEGP(group.originalPrice)}
                </span>
                <span className="text-sm font-bold text-success">
                  وفّر {formatEGP(group.originalPrice - group.groupPrice)}
                </span>
              </>
            )}
          </div>

          {/* Progress */}
          <div className="surface-card p-4 space-y-3">
            <ProgressBar
              current={approvedCount}
              min={group.minBuyers}
              max={group.maxBuyers}
            />
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
              <Stat icon={<Users className="w-4 h-4" />} label="المُسجَّلون" value={arabicNumber(approvedCount)} />
              <Stat icon={<Package className="w-4 h-4" />} label="الحد الأدنى" value={arabicNumber(group.minBuyers)} />
              <Stat icon={<Calendar className="w-4 h-4" />} label="الحد الأقصى" value={arabicNumber(group.maxBuyers)} />
            </div>
            <div className="pt-3 border-t border-border">
              <Countdown expiresAt={group.expiresAt} />
              <p className="text-xs text-muted-foreground mt-1">
                تنتهي: {formatDate(group.expiresAt)}
              </p>
            </div>
          </div>

          {/* Organizer */}
          {organizer && (
            <div className="surface-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {organizer.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{organizer.name}</h3>
                    {organizer.kycStatus === "approved" && <VerifiedBadge />}
                  </div>
                  {organizer.reviewsCount && organizer.reviewsCount > 0 ? (
                    <div className="mt-1 flex items-center gap-3 flex-wrap">
                      <StarRating
                        value={organizer.rating ?? 0}
                        size="sm"
                        reviewsCount={organizer.reviewsCount}
                      />
                      <span className="text-xs text-muted-foreground">
                        <span className="text-success font-semibold">
                          {arabicNumber(organizer.successCount ?? 0)} نجاح
                        </span>
                        {" / "}
                        <span className="text-destructive font-semibold">
                          {arabicNumber(organizer.failedCount ?? 0)} فشل
                        </span>
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">منظِّم جديد — لا يوجد تقييمات بعد</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="surface-card p-4">
            <h3 className="font-bold mb-2">وصف المنتج</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {group.description}
            </p>
          </div>

          {/* Trust */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-info-soft border border-info/20">
            <ShieldCheck className="w-5 h-5 text-info shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-foreground mb-1">معاملة بين الطرفين مباشرةً</p>
              <p className="text-muted-foreground">
                جمّع لا تحتفظ بأموالك — تحوّل المبلغ مباشرةً للمنظِّم. اطمئن
                لأن المنظِّم موثَّق بالبطاقة، وتقدر تشوف سجلّه بالكامل.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chat button */}
      <button
        onClick={onChatClick}
        className="fixed bottom-24 md:bottom-8 left-4 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center hover:scale-105 transition-transform"
        title={myMembership?.status === "approved" ? "محادثة المجموعة" : "محادثة المنظِّم"}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Sticky bottom action */}
      <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="container py-3 flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <div className="text-xs text-muted-foreground">سعر المجموعة</div>
            <div className="text-2xl font-extrabold text-primary">
              {formatEGP(group.groupPrice)}
            </div>
          </div>
          <Button
            size="lg"
            className={`flex-1 sm:flex-none sm:min-w-64 ${
              buttonState.success ? "bg-success hover:bg-success/90" : ""
            }`}
            disabled={buttonState.disabled}
            onClick={onJoinClick}
          >
            {buttonState.success && <CheckCircle2 className="w-5 h-5 ml-2" />}
            {buttonState.text}
          </Button>
        </div>
      </div>

      <JoinGroupModal
        group={group}
        open={showJoin}
        onOpenChange={setShowJoin}
        onJoined={() => {
          refresh();
          toast.message("سيراجع المنظِّم إثبات الدفع وسيُحدَّث وضعك قريباً", {
            action: { label: "تتبّع طلبي", onClick: () => navigate("/my-groups") },
          });
        }}
      />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground mb-1">
        {icon}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
