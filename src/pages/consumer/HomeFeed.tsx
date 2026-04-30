import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, TrendingUp, Clock, X, ShieldCheck, Flame, PackageSearch } from "lucide-react";
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
import { GroupCardSkeleton } from "@/components/shared/GroupCardSkeleton";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { getGroups } from "@/lib/mock-store";
import type { Group } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { getUsers } from "@/lib/mock-store";
import { formatEGP } from "@/lib/format";

type SortMode = "ending-soon" | "highest-rated" | "newest";

const CATEGORIES = ["الكل", "بقالة", "إلكترونيات", "ملابس"];

const PRICE_MIN = 0;
const PRICE_MAX = 10000;

export default function HomeFeed() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("ending-soon");
  const [category, setCategory] = useState("الكل");

  // Advanced filters
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [almostThereOnly, setAlmostThereOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    // Tiny artificial delay so the skeleton is visible on first paint
    const t = setTimeout(() => {
      setGroups(getGroups());
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  const usersById = useMemo(() => {
    return Object.fromEntries(getUsers().map((u) => [u.id, u]));
  }, []);

  const activeFiltersCount =
    (priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (almostThereOnly ? 1 : 0);

  const resetFilters = () => {
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setVerifiedOnly(false);
    setAlmostThereOnly(false);
  };

  const visible = useMemo(() => {
    let list = groups.filter((g) => g.status === "active");
    if (search.trim())
      list = list.filter((g) =>
        g.title.toLowerCase().includes(search.trim().toLowerCase())
      );
    if (category !== "الكل") list = list.filter((g) => g.category === category);

    // Price filter
    list = list.filter(
      (g) => g.groupPrice >= priceRange[0] && g.groupPrice <= priceRange[1]
    );

    // Verified organizer only
    if (verifiedOnly) {
      list = list.filter((g) => usersById[g.organizerId]?.kycStatus === "approved");
    }

    // Almost full (>= 70% of min buyers reached)
    if (almostThereOnly) {
      list = list.filter((g) => {
        const approved = g.members.filter((m) => m.status === "approved").length;
        return approved / Math.max(1, g.minBuyers) >= 0.7;
      });
    }

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
  }, [groups, search, category, sort, usersById, priceRange, verifiedOnly, almostThereOnly]);

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
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document
                    .getElementById("feed")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 font-bold"
              >
                تصفّح الصفقات
              </Button>
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
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" className="shrink-0 relative">
                <SlidersHorizontal className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">الفلاتر</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      مسح الكل
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">نطاق السعر</Label>
                    <span className="text-xs text-muted-foreground">
                      {formatEGP(priceRange[0])} – {formatEGP(priceRange[1])}
                    </span>
                  </div>
                  <Slider
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={50}
                    value={priceRange}
                    onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
                    className="py-2"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <Label className="text-sm">منظِّمون موثَّقون فقط</Label>
                    <p className="text-[11px] text-muted-foreground">حسابات تم التحقق منها</p>
                  </div>
                  <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-sm">قاربت على الاكتمال</Label>
                    <p className="text-[11px] text-muted-foreground">٧٠٪ من الحد الأدنى</p>
                  </div>
                  <Switch checked={almostThereOnly} onCheckedChange={setAlmostThereOnly} />
                </div>

                <Button className="w-full" onClick={() => setFilterOpen(false)}>
                  عرض النتائج ({visible.length})
                </Button>
              </div>
            </PopoverContent>
          </Popover>
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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                category === c
                  ? "bg-foreground text-background shadow-sm scale-[1.02]"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Active filter chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap animate-fade-in-up">
            <span className="text-xs text-muted-foreground">الفلاتر النشطة:</span>
            {(priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX) && (
              <FilterChip
                label={`${formatEGP(priceRange[0])} – ${formatEGP(priceRange[1])}`}
                onRemove={() => setPriceRange([PRICE_MIN, PRICE_MAX])}
              />
            )}
            {verifiedOnly && (
              <FilterChip
                label="موثَّقون فقط"
                icon={<ShieldCheck className="w-3 h-3" />}
                onRemove={() => setVerifiedOnly(false)}
              />
            )}
            {almostThereOnly && (
              <FilterChip
                label="قاربت على الاكتمال"
                icon={<Flame className="w-3 h-3" />}
                onRemove={() => setAlmostThereOnly(false)}
              />
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              مسح الكل
            </button>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <GroupCardSkeleton key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="surface-card text-center py-16 px-6 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-muted text-muted-foreground/60 flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-1">لا توجد مجموعات مطابقة</h3>
            <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
              جرّب توسيع نطاق السعر أو إزالة بعض الفلاتر للعثور على صفقات أخرى.
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={resetFilters}>
                <X className="w-4 h-4 ml-2" />
                مسح كل الفلاتر
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 animate-fade-in-up">
            {visible.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
        )}
      </section>

      <ScrollToTop />
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

function FilterChip({
  label,
  icon,
  onRemove,
}: {
  label: string;
  icon?: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 animate-bounce-in">
      {icon}
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 -ml-1"
        aria-label="إزالة الفلتر"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
