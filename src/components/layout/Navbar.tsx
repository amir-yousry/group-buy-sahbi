import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  MessageCircle,
  Package,
  LogOut,
  ChevronDown,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import { useAuth, useAllUsers } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { resetMockStore } from "@/lib/mock-store";

export function Navbar() {
  const { user, logout, switchUser, refresh } = useAuth();
  const users = useAllUsers();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isOrganizer = user?.role === "organizer" && user.kycStatus === "approved";

  const navItems = isOrganizer
    ? [
        { to: "/dashboard", label: "اللوحة", icon: LayoutDashboard },
        { to: "/", label: "تصفّح", icon: Home },
        { to: "/chats", label: "المحادثات", icon: MessageCircle },
      ]
    : [
        { to: "/", label: "الرئيسية", icon: Home },
        { to: "/my-groups", label: "مجموعاتي", icon: Package },
        { to: "/chats", label: "المحادثات", icon: MessageCircle },
      ];

  const handleSwitch = (id: string) => {
    switchUser(id);
    setOpen(false);
    navigate("/");
  };

  const handleReset = () => {
    resetMockStore();
    refresh();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between gap-4 h-16">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-extrabold text-lg">ج</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-lg leading-none">جمّع</div>
            <div className="text-[10px] text-muted-foreground">سوق الشراء الجماعي</div>
          </div>
        </Link>

        {/* Nav */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Dev role switcher */}
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-dashed text-xs"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تبديل المستخدم</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-xs">
                وضع التطوير — اختر مستخدم
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {users.map((u) => (
                <DropdownMenuItem
                  key={u.id}
                  onClick={() => handleSwitch(u.id)}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {u.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{u.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {u.role === "organizer" ? "منظِّم" : "مستهلك"} ·{" "}
                        {u.kycStatus === "approved"
                          ? "موثَّق"
                          : u.kycStatus === "pending"
                          ? "قيد المراجعة"
                          : u.kycStatus === "rejected"
                          ? "مرفوض"
                          : "—"}
                      </div>
                    </div>
                  </div>
                  {u.role === "organizer" && u.kycStatus === "approved" && (
                    <VerifiedBadge size="sm" showLabel={false} />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleReset} className="text-destructive cursor-pointer">
                إعادة تعيين البيانات التجريبية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {user.name[0]}
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-semibold leading-none">{user.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {user.role === "organizer" ? "منظِّم" : "مستهلك"}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user.role === "organizer" && (
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    لوحة المنظِّم
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/my-groups")}>
                  مجموعاتي
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="text-destructive"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>
              دخول
            </Button>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      {user && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border">
          <div className="grid grid-cols-3 h-16">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
