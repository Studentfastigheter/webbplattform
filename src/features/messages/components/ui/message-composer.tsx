"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

export function MessageComposer({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = React.useState("");

  function submit() {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  }

  return (
    <div className="border-t p-3 bg-background">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Skriv ett meddelande…"
          className="min-h-[44px] resize-none max-h-32 py-3"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button onClick={submit} size="icon" className="shrink-0 h-11 w-11">
          <SendHorizontal className="h-5 w-5" />
          <span className="sr-only">Skicka</span>
        </Button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground px-1 hidden sm:block">
        Enter för att skicka • Shift+Enter för ny rad
      </div>
    </div>
  );
}