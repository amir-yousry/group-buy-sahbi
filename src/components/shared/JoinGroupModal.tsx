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
import { ImageUploader } from "@/components/shared/ImageUploader";
import { Copy, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Group } from "@/lib/types";
import { formatEGP } from "@/lib/format";
import { joinGroup } from "@/lib/mock-store";
import { useAuth } from "@/contexts/AuthContext";

interface JoinGroupModalProps {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoined: () => void;
}

export function JoinGroupModal({
  group,
  open,
  onOpenChange,
  onJoined,
}: JoinGroupModalProps) {
  const { user } = useAuth();
  const [proof, setProof] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const submit = () => {
    if (!proof || !user) {
      toast.error("ارفع صورة إيصال التحويل أولاً");
      return;
    }
    setSubmitting(true);
    joinGroup(group.id, {
      userId: user.id,
      userName: user.name,
      status: "pending",
      proofImage: proof,
      uploadedAt: new Date().toISOString(),
    });
    setTimeout(() => {
      setSubmitting(false);
      toast.success("تم إرسال إثبات الدفع للمراجعة");
      onJoined();
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">إكمال التحويل</DialogTitle>
          <DialogDescription>
            حوّل المبلغ بالضبط ثم ارفع صورة الإيصال للمنظِّم لمراجعته.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount */}
          <div className="bg-gradient-primary text-primary-foreground rounded-2xl p-5 text-center">
            <div className="text-xs opacity-80 mb-1">المبلغ المطلوب تحويله</div>
            <div className="text-3xl font-extrabold">{formatEGP(group.groupPrice)}</div>
          </div>

          {/* Payment info */}
          <div className="surface-card p-4 space-y-3">
            <h3 className="font-bold text-sm">بيانات الدفع للمنظِّم</h3>

            {group.payment.instapay && (
              <PaymentRow
                label="إنستاباي"
                value={group.payment.instapay}
                onCopy={() => copy(group.payment.instapay!, "رقم الإنستاباي")}
              />
            )}
            {group.payment.bankName && (
              <PaymentRow label="البنك" value={group.payment.bankName} />
            )}
            {group.payment.accountNumber && (
              <PaymentRow
                label="رقم الحساب"
                value={group.payment.accountNumber}
                onCopy={() => copy(group.payment.accountNumber!, "رقم الحساب")}
              />
            )}
            {group.payment.accountHolder && (
              <PaymentRow label="اسم صاحب الحساب" value={group.payment.accountHolder} />
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-warning-soft border border-warning/30">
            <AlertTriangle className="w-5 h-5 text-warning-foreground shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold mb-1">مهم</p>
              <p className="text-foreground/80">
                حوّل المبلغ بالضبط ({formatEGP(group.groupPrice)}). بعد التحويل
                ارفع صورة الإيصال أو لقطة شاشة من تطبيق البنك. منصّة جمّع لا
                تحتفظ بأموال — التحويل مباشرةً للمنظِّم.
              </p>
            </div>
          </div>

          {/* Upload */}
          <div>
            <h3 className="font-bold text-sm mb-2">إيصال التحويل</h3>
            <ImageUploader
              value={proof}
              onChange={setProof}
              label="ارفع صورة إيصال التحويل"
              hint="صورة واضحة تظهر بها المبلغ والاسم والوقت"
            />
          </div>

          {proof && (
            <div className="flex items-center gap-2 text-xs text-success">
              <CheckCircle2 className="w-4 h-4" />
              تم تحميل الإيصال بنجاح
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            className="w-full"
            size="lg"
            onClick={submit}
            disabled={!proof || submitting}
          >
            {submitting ? "جارٍ الإرسال..." : "إرسال إثبات الدفع"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="font-semibold text-sm truncate" dir="ltr">
          {value}
        </div>
      </div>
      {onCopy && (
        <Button size="sm" variant="ghost" onClick={onCopy}>
          <Copy className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
