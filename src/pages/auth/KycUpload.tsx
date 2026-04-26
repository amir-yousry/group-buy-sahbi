import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function KycUpload() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);

  const onSubmit = () => {
    if (!front || !back) {
      toast.error("يرجى رفع صورتي البطاقة (الوجه والظهر)");
      return;
    }
    updateUser({ role: "organizer", kycStatus: "pending" });
    toast.success("تم إرسال طلب التوثيق للمراجعة");
    navigate("/verification-status");
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-warm">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold">توثيق هويتك</h1>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            للحفاظ على ثقة المشترين، نطلب صورة واضحة من بطاقة الرقم القومي
          </p>
        </div>

        <div className="surface-card p-6 sm:p-8 space-y-6 animate-scale-in">
          <div>
            <h3 className="font-bold mb-3">الوجه الأمامي للبطاقة</h3>
            <ImageUploader
              value={front}
              onChange={setFront}
              label="ارفع صورة الوجه الأمامي"
              hint="تأكد من وضوح الصورة وقراءة كل البيانات"
            />
          </div>

          <div>
            <h3 className="font-bold mb-3">الوجه الخلفي للبطاقة</h3>
            <ImageUploader
              value={back}
              onChange={setBack}
              label="ارفع صورة الوجه الخلفي"
              hint="تأكد من وضوح الصورة"
            />
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-info-soft border border-info/20">
            <Lock className="w-5 h-5 text-info shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">صورتك مشفّرة وآمنة</p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                لن يطّلع على البطاقة سوى فريق المراجعة الإداري. لن يتم نشرها
                أو مشاركتها مع أي مستهلك.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-soft border border-warning/30">
            <AlertTriangle className="w-5 h-5 text-warning-foreground shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">ما يحدث بعد الإرسال</p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                ستتم مراجعة طلبك خلال ٢٤ ساعة. ستصلك رسالة على الهاتف والبريد
                عند الاعتماد. حتى ذلك الحين لن تستطيع إنشاء مجموعات.
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={onSubmit}
            disabled={!front || !back}
          >
            إرسال للمراجعة
          </Button>
        </div>
      </div>
    </div>
  );
}
