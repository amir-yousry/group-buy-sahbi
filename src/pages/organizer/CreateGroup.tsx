import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAuth } from "@/contexts/AuthContext";
import { createGroup } from "@/lib/mock-store";
import { toast } from "sonner";
import type { Group } from "@/lib/types";

export default function CreateGroup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [groupPrice, setGroupPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [minBuyers, setMinBuyers] = useState("10");
  const [maxBuyers, setMaxBuyers] = useState("50");
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 16);
  });
  const [category, setCategory] = useState("بقالة");

  // Payment template
  const [instapay, setInstapay] = useState(user?.payment?.instapay ?? "");
  const [bankName, setBankName] = useState(user?.payment?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(user?.payment?.accountNumber ?? "");
  const [accountHolder, setAccountHolder] = useState(user?.payment?.accountHolder ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!image) {
      toast.error("يرجى رفع صورة المنتج");
      return;
    }
    if (!instapay && !accountNumber) {
      toast.error("أضف رقم إنستاباي أو حساب بنكي للتحويل");
      return;
    }
    const g: Group = {
      id: `g-${Date.now()}`,
      organizerId: user.id,
      title,
      description,
      images: [image],
      groupPrice: Number(groupPrice),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      minBuyers: Number(minBuyers),
      maxBuyers: Number(maxBuyers),
      expiresAt: new Date(expiresAt).toISOString(),
      createdAt: new Date().toISOString(),
      status: "active",
      members: [],
      payment: { instapay, bankName, accountNumber, accountHolder },
      category,
    };
    createGroup(g);
    toast.success("تم إنشاء المجموعة بنجاح");
    navigate(`/dashboard/group/${g.id}`);
  };

  return (
    <div className="container max-w-3xl py-6 sm:py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowRight className="w-4 h-4" />
        رجوع للوحة
      </button>

      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">مجموعة جديدة</h1>
      <p className="text-muted-foreground mb-6">املأ التفاصيل وابدأ استقبال طلبات الشراء الجماعي</p>

      <form onSubmit={submit} className="space-y-6">
        {/* Product */}
        <Section title="بيانات المنتج">
          <div className="space-y-2">
            <Label htmlFor="title">اسم المنتج</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="مثال: زيت زيتون عضوي 1 لتر" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">الوصف</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} required className="min-h-28" placeholder="الجودة، المنشأ، حجم العبوة، تفاصيل التوصيل..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat">الفئة</Label>
            <select
              id="cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option>بقالة</option>
              <option>إلكترونيات</option>
              <option>ملابس</option>
              <option>منزل</option>
              <option>أخرى</option>
            </select>
          </div>
          <div>
            <Label className="block mb-2">صورة المنتج</Label>
            <ImageUploader value={image} onChange={setImage} />
          </div>
        </Section>

        {/* Pricing */}
        <Section title="السعر والحدود">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>سعر المجموعة (ج.م)</Label>
              <Input type="number" min="1" value={groupPrice} onChange={(e) => setGroupPrice(e.target.value)} required placeholder="180" />
            </div>
            <div className="space-y-2">
              <Label>السعر الأصلي (اختياري)</Label>
              <Input type="number" min="1" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="320" />
            </div>
            <div className="space-y-2">
              <Label>الحد الأدنى للمشترين</Label>
              <Input type="number" min="2" value={minBuyers} onChange={(e) => setMinBuyers(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>الحد الأقصى للمشترين</Label>
              <Input type="number" min="2" value={maxBuyers} onChange={(e) => setMaxBuyers(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>تاريخ انتهاء المجموعة</Label>
            <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required />
          </div>
        </Section>

        {/* Payment */}
        <Section title="بيانات استلام التحويلات">
          <p className="text-xs text-muted-foreground -mt-2">سيراها المشتري بعد الانضمام للمجموعة فقط.</p>
          <div className="space-y-2">
            <Label>رقم الإنستاباي</Label>
            <Input value={instapay} onChange={(e) => setInstapay(e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>اسم البنك</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="البنك الأهلي" />
            </div>
            <div className="space-y-2">
              <Label>رقم الحساب</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="xxxxxxxxxx" dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>اسم صاحب الحساب</Label>
            <Input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="بالإنجليزية كما في البنك" />
          </div>
        </Section>

        <Button type="submit" size="lg" className="w-full">
          <Save className="w-4 h-4 ml-2" />
          نشر المجموعة
        </Button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5 sm:p-6 space-y-4">
      <h2 className="font-bold text-lg">{title}</h2>
      {children}
    </div>
  );
}
