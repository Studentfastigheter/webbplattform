"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import SwitchSelect from "@/components/ui/switchSelect";
import { ConversationsHeader } from "../ui/conversations-header";
import { ConversationItem } from "../ui/conversation-item";

export type ConversationListItemVM = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
};

type Props = {
  conversations: ConversationListItemVM[];
  selectedId: string;
  query: string;
  tab: "all" | "unread";
  onQueryChange: (v: string) => void;
  onTabChange: (v: "all" | "unread") => void;
  onSelect: (id: string) => void;
};

export function ConversationsPanel({
  conversations,
  selectedId,
  query,
  tab,
  onQueryChange,
  onTabChange,
  onSelect,
}: Props) {
  const switchValue = tab === "unread" ? "karta" : "lista";

  return (
    <aside className="flex h-full flex-col border-r">
      <div className="p-4">
        <ConversationsHeader query={query} onQueryChange={onQueryChange} />
        <div className="mt-3">
          <SwitchSelect
            value={switchValue}
            labels={{ lista: "Alla", karta: "Olästa" }}
            fullWidth
            className="w-full"
            onChange={(next) => onTabChange(next === "karta" ? "unread" : "all")}
          />
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Inga konversationer matchar.</div>
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => (
                <ConversationItem
                  key={c.id}
                  title={c.title}
                  lastMessage={c.lastMessage}
                  updatedAt={c.updatedAt}
                  unreadCount={c.unreadCount}
                  selected={c.id === selectedId}
                  onClick={() => onSelect(c.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
