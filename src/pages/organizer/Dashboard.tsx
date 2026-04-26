import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Wallet,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getGroupsByOrganizer,
  getReviewsForOrganizer,
} from "@/lib/mock-store";
import { GroupStatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Countdown } from "@/components/shared/Countdown";
import { StarRating } from "@/components/shared/StarRating";
import { formatEGP, arabicNumber } from "@/lib/format";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const groups = useMemo(() => (user ? getGroupsByOrganizer(user.id) : []), [user]);
  const reviews = useMemo(
    () => (user ? getReviewsForOrganizer(user.id) : []),
    [user]
  );

  const activeGroups = groups.filter((g) => g.status === "active");
  const pendingTotal = groups.reduce(
    (sum, g) => sum + g.members.filter((m) => m.status === "pending").length,
    0
  );
  const revenue = groups.reduce(
    (sum, g) =>
      sum +
      g.members.filter((m) => m.status === "approved").length * g.groupPrice,
    0
  );

  if (!user) return null;

  return (
    <div className="container max-w-6xl py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">لوحة المنظِّم</h1>
          <p className="text-muted-foreground text-sm mt-1">
            أهلاً {user.name} — تابع مجموعاتك ومدفوعاتك من هنا
          </p>
        </div>
        <Button size="lg" onClick={() => navigate("/dashboard/create")}>
          <Plus className="w-4 h-4 ml-2" />
          إنشاء مجموعة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="مجموعات نشطة"
          value={arabicNumber(activeGroups.length)}
          tone="primary"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="مدفوعات تحتاج مراجعة"
          value={arabicNumber(pendingTotal)}
          tone={pendingTotal > 0 ? "warning" : "muted"}
          urgent={pendingTotal > 0}
        />
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="إجمالي المحصّل"
          value={formatEGP(revenue)}
          tone="success"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="عدد التقييمات"
          value={arabicNumber(reviews.length)}
          tone="info"
          extra={
            user.rating ? <StarRating value={user.rating} size="sm" showNumber /> : null
          }
        />
      </div>

      {/* Groups list */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">مجموعاتي</h2>

        {groups.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <p className="text-muted-foreground mb-4">لم تُنشئ أي مجموعة بعد</p>
            <Button onClick={() => navigate("/dashboard/create")}>
              <Plus className="w-4 h-4 ml-2" />
              ابدأ أول مجموعة
            </Button>
          </div>
        ) : (
          groups.map((g) => {
            const approvedCount = g.members.filter((m) => m.status === "approved").length;
            const pendingCount = g.members.filter((m) => m.status === "pending").length;
            return (
              <Link
                key={g.id}
                to={`/dashboard/group/${g.id}`}
                className="surface-card p-4 flex gap-4 hover:shadow-elevated transition-shadow"
              >
                <img
                  src={g.images[0]}
                  alt={g.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-muted shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold truncate">{g.title}</h3>
                    <GroupStatusBadge status={g.status} />
                  </div>
                  <p className="text-primary font-extrabold mt-1">
                    {formatEGP(g.groupPrice)}
                  </p>
                  <div className="mt-2">
                    <ProgressBar
                      current={approvedCount}
                      min={g.minBuyers}
                      max={g.maxBuyers}
                      showLabel={false}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                    {g.status === "active" && <Countdown expiresAt={g.expiresAt} variant="badge" />}
                    {pendingCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-warning-foreground bg-warning-soft border border-warning/30 px-2 py-1 rounded-full animate-pulse-glow">
                        <AlertCircle className="w-3 h-3" />
                        {arabicNumber(pendingCount)} مدفوعات للمراجعة
                      </span>
                    )}
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground self-center" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  urgent,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning" | "info" | "muted";
  urgent?: boolean;
  extra?: React.ReactNode;
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-foreground",
    info: "bg-info-soft text-info",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <div className={`surface-card p-4 ${urgent ? "ring-2 ring-warning" : ""}`}>
      <div className={`inline-flex w-9 h-9 rounded-lg items-center justify-center mb-2 ${toneClasses[tone]}`}>
        {icon}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl sm:text-2xl font-extrabold mt-1">{value}</div>
      {extra && <div className="mt-1">{extra}</div>}
    </div>
  );
}
