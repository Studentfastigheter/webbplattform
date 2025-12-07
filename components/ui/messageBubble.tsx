"use client";

import { Field, FieldContent } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// 1) Importera din befintliga domän-typ
import type { Message } from "@/types";

// 2) Lokal UI-typ som bygger vidare på Message
export type MessageWithUI = Message & {
  fromMe?: boolean;   // styr om bubblan hamnar höger/vänster
  metaText?: string;  // t.ex. "Läst 20:40"
  isTyping?: boolean; // för "Skriver..."-state om du vill
};

// 3) Props för komponenten
type MessageBubbleProps = {
  message: MessageWithUI;
};

// 4) Själva komponenten
export function MessageBubble({ message }: MessageBubbleProps) {
  const {
    body,          // kommer från din domän-Message
    fromMe = false,
    metaText,
    isTyping,
  } = message;

  return (
    <Field
      orientation="horizontal"
      className={cn(
        "items-end",
        fromMe ? "justify-end" : "justify-start"
      )}
    >
      {/* Visa avatar endast om det INTE är ditt meddelande */}
      {!fromMe && <Avatar className="mr-2 h-8 w-8" />}

      <FieldContent
        className={cn(
          "max-w-[65%]",
          fromMe && "items-end text-right"
        )}
      >
        {/* Själva bubblan */}
        <div className="inline-block rounded-3xl px-4 py-2 text-sm shadow-sm bg-white">
          {body}
        </div>

        {/* Liten grå text under, t.ex. "Läst 20:40" */}
        {metaText && (
          <span className="mt-1 text-[11px] text-muted-foreground">
            {metaText}
          </span>
        )}

        {/* "Skriver..."-state om du vill visa typing */}
        {isTyping && (
          <span className="mt-1 text-[11px] text-muted-foreground">
            Skriver...
          </span>
        )}
      </FieldContent>
    </Field>
  );
}
