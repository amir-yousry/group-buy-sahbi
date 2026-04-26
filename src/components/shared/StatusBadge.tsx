import { cn } from "@/lib/utils";
import type { GroupStatus, MemberStatus } from "@/lib/types";

const GROUP_LABELS: Record<GroupStatus, { text: string; cls: string }> = {
  active: { text: "نشط", cls: "badge-success" },
  succeeded: { text: "اكتملت بنجاح", cls: "badge-info" },
  failed: { text: "فشلت", cls: "badge-danger" },
};

const MEMBER_LABELS: Record<MemberStatus, { text: string; cls: string }> = {
  pending: { text: "قيد المراجعة", cls: "badge-warning" },
  approved: { text: "تم القبول", cls: "badge-success" },
  rejected: { text: "مرفوض", cls: "badge-danger" },
};

export function GroupStatusBadge({ status }: { status: GroupStatus }) {
  const { text, cls } = GROUP_LABELS[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", cls)}>
      {text}
    </span>
  );
}

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const { text, cls } = MEMBER_LABELS[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", cls)}>
      {text}
    </span>
  );
}
