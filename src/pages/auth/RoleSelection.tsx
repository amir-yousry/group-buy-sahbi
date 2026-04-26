import { useNavigate } from "react-router-dom";
import { ShoppingCart, Store, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [selected, setSelected] = useState<"consumer" | "organizer" | null>(null);

  const onContinue = () => {
    if (!selected || !user) return;
    if (selected === "consumer") {
      updateUser({ role: "consumer" });
      toast.success("أهلاً بك! استكشف صفقات اليوم");
      navigate("/");
    } else {
      updateUser({ role: "organizer", kycStatus: "none" });
      navigate("/kyc");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-warm">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold">كيف تريد استخدام جمّع؟</h1>
          <p className="text-muted-foreground mt-3">
            تقدر تغيّر الاختيار لاحقاً من إعدادات حسابك
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <RoleCard
            selected={selected === "consumer"}
            onClick={() => setSelected("consumer")}
            icon={<ShoppingCart className="w-8 h-8" />}
            title="مستهلك"
            subtitle="(باحث عن صفقات)"
            description="تصفح المجموعات النشطة، انضم لها وادفع للمنظِّم مباشرة لتوفر حتى ٥٠٪."
            badge="ابدأ فوراً"
          />
          <RoleCard
            selected={selected === "organizer"}
            onClick={() => setSelected("organizer")}
            icon={<Store className="w-8 h-8" />}
            title="منظِّم"
            subtitle="(تاجر / قائد مجموعة)"
            description="أنشئ مجموعات شراء، استلم الدفع مباشرة، وكوّن سمعتك. يتطلب توثيق بالبطاقة."
            badge="يتطلب توثيق"
          />
        </div>

        <div className="mt-10 flex justify-center">
          <Button size="lg" onClick={onContinue} disabled={!selected} className="min-w-48">
            <ArrowLeft className="w-4 h-4 ml-2" />
            متابعة
          </Button>
        </div>
      </div>
    </div>
  );
}

interface RoleCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
}

function RoleCard({
  selected,
  onClick,
  icon,
  title,
  subtitle,
  description,
  badge,
}: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={`text-right p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 ${
        selected
          ? "border-primary bg-primary/5 shadow-glow"
          : "border-border bg-card hover:border-primary/40 hover:shadow-card"
      }`}
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
          selected
            ? "bg-gradient-primary text-primary-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
        selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      }`}>
        {badge}
      </span>
    </button>
  );
}
