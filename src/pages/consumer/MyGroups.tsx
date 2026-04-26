import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getGroupsForConsumer } from "@/lib/mock-store";
import { Countdown } from "@/components/shared/Countdown";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { GroupStatusBadge, MemberStatusBadge } from "@/components/shared/StatusBadge";
import { formatEGP } from "@/lib/format";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeaveReviewModal } from "@/components/shared/LeaveReviewModal";

type TabKey = "active" | "pending" | "closed";

export default function MyGroups() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>("active");
  const [reviewGroupId, setReviewGroupId] = useState<string | null>(null);

  const myGroups = useMemo(() => {
    if (!user) return [];
    return getGroupsForConsumer(user.id);
  }, [user, reviewGroupId]);

  const buckets = useMemo(() => {
    const active: typeof myGroups = [];
    const pending: typeof myGroups = [];
    const closed: typeof myGroups = [];
    myGroups.forEach((g) => {
      const me = g.members.find((m) => m.userId === user?.id);
      if (g.status !== "active") closed.push(g);
      else if (me?.status === "pending") pending.push(g);
      else active.push(g);
    });
    return { active, pending, closed };
  }, [myGroups, user]);

  const list = buckets[tab];

  return (
    <div className="container max-w-4xl py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">مجموعاتي</h1>
          <p className="text-muted-foreground text-sm mt-1">تتبّع طلباتك وحالة كل مجموعة</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="grid w-full grid-cols-3 mb-5">
          <TabsTrigger value="active">
            النشطة {buckets.active.length > 0 && `(${buckets.active.length})`}
          </TabsTrigger>
          <TabsTrigger value="pending">
            قيد الدفع {buckets.pending.length > 0 && `(${buckets.pending.length})`}
          </TabsTrigger>
          <TabsTrigger value="closed">
            المنتهية {buckets.closed.length > 0 && `(${buckets.closed.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-3">
          {list.length === 0 ? (
            <div className="text-center py-16 surface-card">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-4">لا يوجد مجموعات في هذا القسم</p>
              <Link to="/">
                <Button>تصفّح الصفقات</Button>
              </Link>
            </div>
          ) : (
            list.map((g) => {
              const me = g.members.find((m) => m.userId === user?.id);
              const approvedCount = g.members.filter((m) => m.status === "approved").length;
              const showReview = g.status !== "active";
              return (
                <div key={g.id} className="surface-card p-4 hover:shadow-elevated transition-shadow">
                  <div className="flex gap-4">
                    <Link to={`/group/${g.id}`} className="shrink-0">
                      <img
                        src={g.images[0]}
                        alt={g.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-muted"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/group/${g.id}`} className="block min-w-0">
                          <h3 className="font-bold truncate hover:text-primary">{g.title}</h3>
                        </Link>
                        {g.status === "active" ? (
                          me && <MemberStatusBadge status={me.status} />
                        ) : (
                          <GroupStatusBadge status={g.status} />
                        )}
                      </div>
                      <p className="text-primary font-extrabold mt-1">{formatEGP(g.groupPrice)}</p>

                      <div className="mt-3">
                        <ProgressBar
                          current={approvedCount}
                          min={g.minBuyers}
                          max={g.maxBuyers}
                          showLabel={false}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {g.status === "active" ? (
                          <Countdown expiresAt={g.expiresAt} variant="badge" />
                        ) : (
                          <span className="text-xs text-muted-foreground">انتهت في {new Date(g.expiresAt).toLocaleDateString("ar-EG")}</span>
                        )}
                        {showReview && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReviewGroupId(g.id)}
                          >
                            تقييم المنظِّم
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {reviewGroupId && (
        <LeaveReviewModal
          groupId={reviewGroupId}
          open={!!reviewGroupId}
          onOpenChange={(o) => !o && setReviewGroupId(null)}
        />
      )}
    </div>
  );
}
