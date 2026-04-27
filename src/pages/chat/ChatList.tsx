import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getConversationsForUser, getGroupById, getUnreadCount, getUsers } from "@/lib/mock-store";
import { MessageCircle, Users } from "lucide-react";
import { timeAgo } from "@/lib/format";

export default function ChatList() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"group" | "direct">("group");

  const conversations = useMemo(() => {
    if (!user) return [];
    return getConversationsForUser(user.id).map((c) => ({
      ...c,
      unread: getUnreadCount(c.id, user.id),
    }));
  }, [user]);
  const groups = conversations.filter((c) => c.type === "group");
  const directs = conversations.filter((c) => c.type === "direct");

  const usersById = useMemo(() => Object.fromEntries(getUsers().map((u) => [u.id, u])), []);

  return (
    <div className="container max-w-2xl py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">المحادثات</h1>
      <p className="text-muted-foreground text-sm mb-5">تواصل مع المنظِّم وأعضاء مجموعتك</p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "group" | "direct")}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="group">
            <Users className="w-4 h-4 ml-2" />
            مجموعات ({groups.length})
          </TabsTrigger>
          <TabsTrigger value="direct">
            <MessageCircle className="w-4 h-4 ml-2" />
            مباشر ({directs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="group" className="space-y-2">
          {groups.length === 0 ? (
            <Empty />
          ) : (
            groups.map((c) => {
              const g = c.groupId ? getGroupById(c.groupId) : undefined;
              return (
                <Link
                  key={c.id}
                  to={`/chats/${c.id}`}
                  className={`surface-card p-3 flex items-center gap-3 hover-lift transition-all ${
                    c.unread > 0 ? "ring-1 ring-primary/30 bg-primary/[0.03]" : ""
                  }`}
                >
                  <img
                    src={g?.images[0] ?? "/placeholder.svg"}
                    className="w-12 h-12 rounded-xl object-cover bg-muted shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className={`truncate ${c.unread > 0 ? "font-extrabold" : "font-bold"}`}>
                        {c.title}
                      </h3>
                      {c.lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgo(c.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${c.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {c.lastMessage
                        ? `${c.lastMessage.senderName}: ${c.lastMessage.text}`
                        : "ابدأ الحوار..."}
                    </p>
                  </div>
                  {c.unread ? (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center animate-bounce-in">
                      {c.unread > 99 ? "99+" : c.unread}
                    </span>
                  ) : null}
                </Link>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="direct" className="space-y-2">
          {directs.length === 0 ? (
            <Empty />
          ) : (
            directs.map((c) => {
              const otherId = c.participants.find((p) => p !== user?.id);
              const other = otherId ? usersById[otherId] : undefined;
              return (
                <Link
                  key={c.id}
                  to={`/chats/${c.id}`}
                  className={`surface-card p-3 flex items-center gap-3 hover-lift transition-all ${
                    c.unread > 0 ? "ring-1 ring-primary/30 bg-primary/[0.03]" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 shadow-sm">
                    {(other?.name ?? c.title)[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className={`truncate ${c.unread > 0 ? "font-extrabold" : "font-bold"}`}>
                        {other?.name ?? c.title}
                      </h3>
                      {c.lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgo(c.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${c.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {c.lastMessage?.text ?? "محادثة جديدة"}
                    </p>
                  </div>
                  {c.unread ? (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center animate-bounce-in">
                      {c.unread > 99 ? "99+" : c.unread}
                    </span>
                  ) : null}
                </Link>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty() {
  return (
    <div className="surface-card p-12 text-center animate-fade-in-up">
      <div className="w-14 h-14 rounded-2xl bg-muted/70 flex items-center justify-center mx-auto mb-3">
        <MessageCircle className="w-7 h-7 text-muted-foreground/60" />
      </div>
      <h3 className="font-bold mb-1">لا توجد محادثات بعد</h3>
      <p className="text-muted-foreground text-sm">
        ستظهر هنا محادثات المجموعات التي تنضم لها أو الرسائل المباشرة مع المنظِّمين.
      </p>
    </div>
  );
}
