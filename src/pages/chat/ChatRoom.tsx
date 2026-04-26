import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  addMessage,
  getConversations,
  getGroupById,
  getMessages,
  getUsers,
} from "@/lib/mock-store";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";

export default function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [tick, setTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useMemo(
    () => getConversations().find((c) => c.id === id),
    [id, tick]
  );
  const messages = useMemo(() => (id ? getMessages(id) : []), [id, tick]);
  const group = conversation?.groupId ? getGroupById(conversation.groupId) : undefined;
  const otherUser = useMemo(() => {
    if (!conversation || conversation.type !== "direct" || !user) return undefined;
    const otherId = conversation.participants.find((p) => p !== user.id);
    return otherId ? getUsers().find((u) => u.id === otherId) : undefined;
  }, [conversation, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  if (!conversation || !user) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">المحادثة غير موجودة</p>
      </div>
    );
  }

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addMessage({
      id: `m-${Date.now()}`,
      conversationId: conversation.id,
      senderId: user.id,
      senderName: user.name,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    });
    setText("");
    setTick((t) => t + 1);
  };

  const headerTitle = conversation.type === "group" ? conversation.title : otherUser?.name ?? conversation.title;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-4rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container py-3 flex items-center gap-3">
          <button onClick={() => navigate("/chats")} className="p-1 -mr-1 text-muted-foreground hover:text-foreground">
            <ArrowRight className="w-5 h-5" />
          </button>
          {conversation.type === "group" && group ? (
            <img src={group.images[0]} className="w-10 h-10 rounded-xl object-cover bg-muted" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold">
              {headerTitle[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold truncate">{headerTitle}</h2>
              {otherUser?.kycStatus === "approved" && <VerifiedBadge size="sm" showLabel={false} />}
            </div>
            {conversation.type === "group" && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {conversation.participants.length} أعضاء
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/30">
        <div className="container py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-12">
              ابدأ المحادثة الآن
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === user.id;
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-start" : "justify-end")}>
                  <div className={cn("max-w-[80%] sm:max-w-[60%]", mine ? "items-start" : "items-end")}>
                    {!mine && conversation.type === "group" && (
                      <div className="text-[10px] text-muted-foreground mb-0.5 px-2">
                        {m.senderName}
                      </div>
                    )}
                    <div
                      className={cn(
                        "px-3.5 py-2 rounded-2xl text-sm leading-relaxed",
                        mine
                          ? "bg-primary text-primary-foreground rounded-bl-md"
                          : "bg-card border border-border text-foreground rounded-br-md"
                      )}
                    >
                      {m.text}
                    </div>
                    <div className={cn("text-[10px] text-muted-foreground mt-0.5 px-2", mine ? "text-left" : "text-right")}>
                      {format(new Date(m.createdAt), "h:mm a", { locale: arEG })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={send} className="border-t border-border bg-background">
        <div className="container py-3 flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب رسالة..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!text.trim()}>
            <Send className="w-4 h-4 -scale-x-100" />
          </Button>
        </div>
      </form>
    </div>
  );
}
