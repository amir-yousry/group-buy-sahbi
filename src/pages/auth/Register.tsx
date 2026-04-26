import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: pretend we created a user; sign in as default consumer for demo
    login("u-consumer");
    toast.success("تم إنشاء الحساب");
    navigate("/role-selection");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-warm">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
            <ShoppingBag className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold">انضم إلى جمّع</h1>
          <p className="text-muted-foreground mt-2 text-center">
            سجّل في دقيقة وابدأ توفير حتى ٥٠٪ على مشترياتك
          </p>
        </div>

        <div className="surface-card p-6 sm:p-8 animate-scale-in">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك بالكامل"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الموبايل</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة السر</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="على الأقل ٨ أحرف"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              إنشاء الحساب
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            عندك حساب؟{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              سجّل دخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
