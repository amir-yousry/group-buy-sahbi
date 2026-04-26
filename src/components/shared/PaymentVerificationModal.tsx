import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { updateMemberStatus } from "@/lib/mock-store";
import { formatEGP } from "@/lib/format";
import type { Group, GroupMember } from "@/lib/types";

interface PaymentVerificationModalProps {
  group: Group;
  member: GroupMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecided: () => void;
}

export function PaymentVerificationModal({
  group,
  member,
  open,
  onOpenChange,
  onDecided,
}: PaymentVerificationModalProps) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const approve = () => {
    updateMemberStatus(group.id, member.userId, { status: "approved" });
    toast.success(`تم قبول دفعة ${member.userName}`);
    onDecided();
  };

  const reject = () => {
    if (!reason.trim()) {
      toast.error("اكتب سبب الرفض");
      return;
    }
    updateMemberStatus(group.id, member.userId, {
      status: "rejected",
      rejectionReason: reason.trim(),
    });
    toast.success("تم رفض الدفعة");
    onDecided();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>مراجعة إثبات الدفع</DialogTitle>
          <DialogDescription>
            من <span className="font-semibold text-foreground">{member.userName}</span> — مبلغ متوقع{" "}
            <span className="font-bold text-primary">{formatEGP(group.groupPrice)}</span>
          </DialogDescription>
        </DialogHeader>

        {member.proofImage ? (
          <div className="rounded-xl overflow-hidden bg-muted border border-border">
            <img
              src={member.proofImage}
              alt="إيصال"
              className="w-full max-h-[60vh] object-contain bg-muted"
            />
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground bg-muted rounded-xl">
            لا توجد صورة مرفقة
          </div>
        )}

        {showReject && (
          <div className="space-y-2 animate-fade-in-up">
            <label className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              سبب الرفض
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: المبلغ غير مطابق / الاسم في التحويل لا يخص هذا الحساب"
              className="min-h-20"
            />
          </div>
        )}

        <DialogFooter className="grid grid-cols-2 gap-2 sm:gap-3">
          {!showReject ? (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowReject(true)}
                className="border-destructive/40 text-destructive hover:bg-destructive-soft"
              >
                <X className="w-4 h-4 ml-1" />
                رفض
              </Button>
              <Button
                size="lg"
                onClick={approve}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                <Check className="w-4 h-4 ml-1" />
                قبول
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="lg" onClick={() => setShowReject(false)}>
                إلغاء
              </Button>
              <Button size="lg" variant="destructive" onClick={reject}>
                تأكيد الرفض
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
