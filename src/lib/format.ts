import { format, formatDistanceToNow, isPast } from "date-fns";
import { arEG } from "date-fns/locale";

export const formatEGP = (n: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(n) + " ج.م";

export const arabicNumber = (n: number) =>
  new Intl.NumberFormat("ar-EG").format(n);

export const timeAgo = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true, locale: arEG });

export const formatDate = (iso: string) =>
  format(new Date(iso), "d MMM yyyy - h:mm a", { locale: arEG });

export function timeRemaining(iso: string): {
  expired: boolean;
  label: string;
  short: string;
} {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0 || isPast(new Date(iso))) {
    return { expired: true, label: "انتهى الوقت", short: "انتهى" };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  if (days > 0) return { expired: false, label: `باقي ${arabicNumber(days)} يوم و ${arabicNumber(hours)} ساعة`, short: `${arabicNumber(days)} يوم` };
  if (hours > 0) return { expired: false, label: `باقي ${arabicNumber(hours)} ساعة و ${arabicNumber(mins)} دقيقة`, short: `${arabicNumber(hours)} ساعة` };
  return { expired: false, label: `باقي ${arabicNumber(mins)} دقيقة`, short: `${arabicNumber(mins)} د` };
}

export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
