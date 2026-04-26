import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: any credentials work — log in as default consumer
    login("u-consumer");
    toast.success("تم تسجيل الدخول");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-warm">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
            <ShoppingBag className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold">أهلاً بعودتك</h1>
          <p className="text-muted-foreground mt-2 text-center">
            ادخل لتتصفح أحدث صفقات الشراء الجماعي
          </p>
        </div>

        <div className="surface-card p-6 sm:p-8 animate-scale-in">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الموبايل أو البريد</Label>
              <Input
                id="phone"
                type="text"
                placeholder="01xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">كلمة السر</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  نسيت كلمة السر؟
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              تسجيل الدخول
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">أو</span>
            </div>
          </div>

          <Link to="/register">
            <Button variant="outline" className="w-full" size="lg">
              إنشاء حساب جديد
            </Button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          بالاستمرار فأنت توافق على شروط الاستخدام وسياسة الخصوصية.
        </p>
      </div>
    </div>
  );
}
