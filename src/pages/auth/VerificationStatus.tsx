import { Link, useNavigate } from "react-router-dom";
import { Hourglass, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function VerificationStatus() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  if (!user) return null;

  // Dev helper: simulate approval
  const simulateApprove = () => {
    updateUser({ kycStatus: "approved" });
    navigate("/dashboard");
  };
  const simulateReject = () => {
    updateUser({
      kycStatus: "rejected",
      kycRejectionReason: "صورة البطاقة غير واضحة. يرجى إعادة الرفع بإضاءة جيدة.",
    });
  };

  const status = user.kycStatus;

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-warm flex items-center">
      <div className="max-w-md mx-auto w-full">
        <div className="surface-card p-8 text-center animate-scale-in">
          {status === "pending" && (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-warning-soft flex items-center justify-center mb-5">
                <Hourglass className="w-10 h-10 text-warning-foreground animate-pulse" />
              </div>
              <h1 className="text-2xl font-extrabold mb-2">طلبك قيد المراجعة</h1>
              <p className="text-muted-foreground mb-6">
                نراجع بياناتك حالياً وسنخبرك خلال ٢٤ ساعة عبر رسالة SMS و البريد
                الإلكتروني.
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    تصفّح الصفقات في الوقت الحالي
                  </Button>
                </Link>
                <button
                  onClick={simulateApprove}
                  className="text-xs text-muted-foreground hover:text-primary mt-2"
                >
                  (تجربة) محاكاة قبول التوثيق
                </button>
                <button
                  onClick={simulateReject}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  (تجربة) محاكاة رفض التوثيق
                </button>
              </div>
            </>
          )}

          {status === "rejected" && (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-destructive-soft flex items-center justify-center mb-5">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-extrabold mb-2">تم رفض التوثيق</h1>
              <div className="p-4 rounded-xl bg-destructive-soft border border-destructive/20 text-right mb-6">
                <p className="text-sm font-semibold mb-1">السبب:</p>
                <p className="text-sm text-foreground">
                  {user.kycRejectionReason ?? "لم يُحدّد سبب."}
                </p>
              </div>
              <Link to="/kyc">
                <Button className="w-full">إعادة رفع البطاقة</Button>
              </Link>
            </>
          )}

          {status === "approved" && (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-success-soft flex items-center justify-center mb-5">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-2xl font-extrabold mb-2">تم توثيق حسابك</h1>
              <p className="text-muted-foreground mb-6">
                مبروك! تستطيع الآن إنشاء مجموعات شراء واستقبال طلبات.
              </p>
              <Link to="/dashboard">
                <Button className="w-full">الذهاب للوحة المنظِّم</Button>
              </Link>
            </>
          )}

          {status === "none" && (
            <>
              <h1 className="text-2xl font-extrabold mb-2">لم تبدأ التوثيق بعد</h1>
              <Link to="/kyc">
                <Button className="w-full mt-4">ابدأ التوثيق</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
