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
import { StarRating } from "./StarRating";
import { useAuth } from "@/contexts/AuthContext";
import { addReview, getGroupById, getUsers } from "@/lib/mock-store";
import { toast } from "sonner";
import { VerifiedBadge } from "./VerifiedBadge";

interface LeaveReviewModalProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveReviewModal({
  groupId,
  open,
  onOpenChange,
}: LeaveReviewModalProps) {
  const { user } = useAuth();
  const group = getGroupById(groupId);
  const organizer = group ? getUsers().find((u) => u.id === group.organizerId) : undefined;
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const submit = () => {
    if (!user || !group || !organizer) return;
    if (rating === 0) {
      toast.error("اختر تقييماً من 1 إلى 10");
      return;
    }
    addReview({
      id: `r-${Date.now()}`,
      organizerId: organizer.id,
      groupId: group.id,
      reviewerId: user.id,
      reviewerName: user.name,
      rating,
      text: text.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    toast.success("شكراً لتقييمك");
    onOpenChange(false);
  };

  if (!group || !organizer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تقييم المنظِّم</DialogTitle>
          <DialogDescription>
            ساعد بقية المشترين بمشاركة تجربتك مع هذا المنظِّم
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
            <div className="w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold">
              {organizer.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{organizer.name}</h3>
                {organizer.kycStatus === "approved" && <VerifiedBadge size="sm" showLabel={false} />}
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-56">{group.title}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-3">تقييمك (من ١ إلى ١٠)</label>
            <StarRating value={rating} onChange={setRating} size="md" />
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">رأيك (اختياري)</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب رأيك في تجربة الشراء..."
              className="min-h-24 resize-none"
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:flex-1">
            إلغاء
          </Button>
          <Button onClick={submit} className="sm:flex-1">
            إرسال التقييم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
