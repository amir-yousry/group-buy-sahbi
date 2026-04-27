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
                  className="surface-card p-3 flex items-center gap-3 hover:shadow-elevated transition-shadow"
                >
                  <img
                    src={g?.images[0] ?? "/placeholder.svg"}
                    className="w-12 h-12 rounded-xl object-cover bg-muted shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-bold truncate">{c.title}</h3>
                      {c.lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgo(c.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.lastMessage
                        ? `${c.lastMessage.senderName}: ${c.lastMessage.text}`
                        : "ابدأ الحوار..."}
                    </p>
                  </div>
                  {c.unread ? (
                    <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                      {c.unread}
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
                  className="surface-card p-3 flex items-center gap-3 hover:shadow-elevated transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    {(other?.name ?? c.title)[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{other?.name ?? c.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.lastMessage?.text ?? "محادثة جديدة"}
                    </p>
                  </div>
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
    <div className="surface-card p-12 text-center">
      <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
      <p className="text-muted-foreground text-sm">لا توجد محادثات</p>
    </div>
  );
}
