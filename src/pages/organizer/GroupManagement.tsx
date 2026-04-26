import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowRight, Users, Clock, ImageIcon, MessageCircle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Countdown } from "@/components/shared/Countdown";
import { GroupStatusBadge } from "@/components/shared/StatusBadge";
import { PaymentVerificationModal } from "@/components/shared/PaymentVerificationModal";
import {
  ensureDirectConversation,
  ensureGroupConversation,
  getGroupById,
} from "@/lib/mock-store";
import { formatEGP, arabicNumber, timeAgo } from "@/lib/format";
import type { Group, GroupMember } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

export default function GroupManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | undefined>();
  const [reviewMember, setReviewMember] = useState<GroupMember | null>(null);

  const refresh = () => {
    if (id) setGroup(getGroupById(id));
  };
  useEffect(refresh, [id]);

  if (!group) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">المجموعة غير موجودة</p>
        <Link to="/dashboard" className="text-primary mt-4 inline-block">
          العودة للوحة
        </Link>
      </div>
    );
  }

  const approved = group.members.filter((m) => m.status === "approved");
  const pending = group.members.filter((m) => m.status === "pending");
  const rejected = group.members.filter((m) => m.status === "rejected");

  const openGroupChat = () => {
    const c = ensureGroupConversation(group);
    navigate(`/chats/${c.id}`);
  };

  const openDirect = (m: GroupMember) => {
    if (!user) return;
    const c = ensureDirectConversation({
      userA: user.id,
      userAName: user.name,
      userB: m.userId,
      userBName: m.userName,
      groupId: group.id,
    });
    navigate(`/chats/${c.id}`);
  };

  return (
    <div className="container max-w-5xl py-6 sm:py-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowRight className="w-4 h-4" />
        رجوع للوحة
      </button>

      {/* Header */}
      <div className="surface-card p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <img
            src={group.images[0]}
            alt={group.title}
            className="w-full sm:w-32 h-32 rounded-xl object-cover bg-muted"
          />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold">{group.title}</h1>
              <GroupStatusBadge status={group.status} />
            </div>
            <p className="text-2xl font-extrabold text-primary">
              {formatEGP(group.groupPrice)}
            </p>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                {arabicNumber(approved.length)} / {arabicNumber(group.maxBuyers)}
              </span>
              {group.status === "active" && <Countdown expiresAt={group.expiresAt} />}
            </div>
            <div className="pt-2">
              <ProgressBar
                current={approved.length}
                min={group.minBuyers}
                max={group.maxBuyers}
                showLabel={false}
              />
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={openGroupChat}>
              <MessageCircle className="w-4 h-4 ml-1" />
              محادثة المجموعة
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue={pending.length > 0 ? "pending" : "members"}>
        <TabsList className="grid w-full grid-cols-3 mb-5">
          <TabsTrigger value="pending" className="relative">
            مدفوعات للمراجعة
            {pending.length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-warning text-warning-foreground text-[10px] font-bold flex items-center justify-center">
                {arabicNumber(pending.length)}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="members">
            المشتركون ({arabicNumber(approved.length)})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            مرفوضة ({arabicNumber(rejected.length)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pending.length === 0 ? (
            <EmptyState text="لا توجد مدفوعات قيد المراجعة حالياً" />
          ) : (
            pending.map((m) => (
              <div key={m.userId} className="surface-card p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  {m.userName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">{m.userName}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {timeAgo(m.uploadedAt)}
                  </div>
                </div>
                {m.proofImage && (
                  <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden border border-border shrink-0">
                    <img src={m.proofImage} alt="إيصال" className="w-full h-full object-cover" />
                  </div>
                )}
                <Button size="sm" onClick={() => setReviewMember(m)}>
                  مراجعة
                </Button>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-2">
          {approved.length === 0 ? (
            <EmptyState text="لم ينضم أي مشتري بعد" />
          ) : (
            approved.map((m) => (
              <div key={m.userId} className="surface-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  {m.userName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{m.userName}</h4>
                  <span className="text-xs text-muted-foreground">انضم {timeAgo(m.uploadedAt)}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => openDirect(m)}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-2">
          {rejected.length === 0 ? (
            <EmptyState text="لا توجد مدفوعات مرفوضة" />
          ) : (
            rejected.map((m) => (
              <div key={m.userId} className="surface-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive-soft text-destructive flex items-center justify-center font-bold shrink-0">
                  {m.userName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{m.userName}</h4>
                  <span className="text-xs text-destructive">{m.rejectionReason ?? "تم الرفض"}</span>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {reviewMember && (
        <PaymentVerificationModal
          group={group}
          member={reviewMember}
          open={!!reviewMember}
          onOpenChange={(o) => !o && setReviewMember(null)}
          onDecided={() => {
            setReviewMember(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="surface-card p-12 text-center">
      <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}
