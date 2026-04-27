import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, TrendingUp, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GroupCard } from "@/components/shared/GroupCard";
import { getGroups } from "@/lib/mock-store";
import type { Group } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { getUsers } from "@/lib/mock-store";
import { formatEGP } from "@/lib/format";

type SortMode = "ending-soon" | "highest-rated" | "newest";

const CATEGORIES = ["الكل", "بقالة", "إلكترونيات", "ملابس"];

export default function HomeFeed() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("ending-soon");
  const [category, setCategory] = useState("الكل");

  useEffect(() => {
    setGroups(getGroups());
  }, []);

  const usersById = useMemo(() => {
    return Object.fromEntries(getUsers().map((u) => [u.id, u]));
  }, []);

  const visible = useMemo(() => {
    let list = groups.filter((g) => g.status === "active");
    if (search.trim())
      list = list.filter((g) =>
        g.title.toLowerCase().includes(search.trim().toLowerCase())
      );
    if (category !== "الكل") list = list.filter((g) => g.category === category);
    if (sort === "ending-soon")
      list = [...list].sort(
        (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
      );
    if (sort === "highest-rated")
      list = [...list].sort(
        (a, b) =>
          (usersById[b.organizerId]?.rating ?? 0) -
          (usersById[a.organizerId]?.rating ?? 0)
      );
    if (sort === "newest")
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return list;
  }, [groups, search, category, sort, usersById]);

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground">
        <div className="container py-10 sm:py-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-primary-foreground/20">
              <Sparkles className="w-3.5 h-3.5" />
              منصة موثَّقة بالهوية القومية
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
              اشترِ مع غيرك،<br />
              ووفّر حتى ٥٠٪
            </h1>
            <p className="text-primary-foreground/85 text-sm sm:text-base mb-6 max-w-md">
              انضم لمجموعات شراء جماعية ينظّمها تجار وأشخاص موثَّقون من حيّك،
              وادفع مباشرة بالإنستاباي أو التحويل البنكي.
            </p>
            <div className="flex flex-wrap gap-3">
              {!user && (
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="font-bold">
                    سجّل مجاناً
                  </Button>
                </Link>
              )}
              <a href="#feed">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 font-bold">
                  تصفّح الصفقات
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Search & filters */}
      <section id="feed" className="container py-6 sm:py-8 space-y-5">
        <div className="flex gap-2 sticky top-16 z-30 bg-background/85 backdrop-blur-md py-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:static sm:bg-transparent sm:backdrop-blur-none sm:py-0">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 h-11"
            />
          </div>
          <Button variant="outline" size="lg" className="shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Sort chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <SortChip
            active={sort === "ending-soon"}
            onClick={() => setSort("ending-soon")}
            icon={<Clock className="w-3.5 h-3.5" />}
            label="ينتهي قريباً"
          />
          <SortChip
            active={sort === "highest-rated"}
            onClick={() => setSort("highest-rated")}
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label="الأعلى تقييماً"
          />
          <SortChip
            active={sort === "newest"}
            onClick={() => setSort("newest")}
            icon={<Sparkles className="w-3.5 h-3.5" />}
            label="الأحدث"
          />
        </div>

        {/* Category chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Feed */}
        {visible.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">لا توجد مجموعات مطابقة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 animate-fade-in-up">
            {visible.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SortChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-card border border-border text-foreground hover:border-primary/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
