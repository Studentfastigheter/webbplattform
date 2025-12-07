"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@heroui/button";
import OneFieldSearch from "@/components/Listings/Search/SearchFilter-1field";
import {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldLegend,
  FieldSet,
  FieldSeparator,
} from "@/components/ui/field";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import type { Conversation } from "@/types";
import type { MessageWithUI } from "@/components/ui/messageBubble";
import { MessageBubble } from "@/components/ui/messageBubble";

type MessageCardProps = {
  conversations: Conversation[];
  messages: MessageWithUI[];
};

export default function MessageCard({ conversations, messages }: MessageCardProps) {
  return (
    <Card className="m-10 rounded-3xl border border-gray-300 shadow-none bg-white flex"
          style={{ width: "1200px", height: "700px" }}>
      
      <CardContent className="p-0 w-full h-full flex">

        {/* ------------------------------ */}
        {/* VÄNSTER SIDFÄLT */}
        {/* ------------------------------ */}

        <FieldSet className="w-[500px] border-r p-4">
          <FieldLegend>Meddelanden</FieldLegend>

          <FieldGroup>

            {/* Sökfält */}
            <Field orientation="horizontal">
            <FieldContent>
                <OneFieldSearch
                field={{
                    id: "conversationSearch",
                    label: "",
                    placeholder: "Sök konversation",
                    searchable: true,
                }}
                onSubmit={(values) => {
                    console.log("Search value:", values.conversationSearch);
                    // Här kan du filtrera dina konversationer
                }}
                />
            </FieldContent>
        </Field>

            <FieldSeparator />

            {/* Lista */}
            <FieldGroup className="max-h-[520px] overflow-y-auto gap-3 mt-2">
              {conversations.map((c) => (
                <Field
                  key={c.conversationId}
                  orientation="horizontal"
                  className="cursor-pointer items-center rounded-2xl border bg-card px-3 py-2 hover:bg-muted"
                >
                  <Avatar className="h-10 w-10" />

                  <FieldContent>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">Konversation {c.conversationId}</span>
                      <span className="ml-auto text-[11px] text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("sv-SE")}
                      </span>
                    </div>
                    <FieldDescription className="text-xs">
                      (senaste meddelande här i framtiden)
                    </FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </FieldGroup>

          </FieldGroup>
        </FieldSet>

        {/* ------------------------------ */}
        {/* HÖGER CHATTDEL */}
        {/* ------------------------------ */}

        <div className="flex flex-1 flex-col p-4">

          {/* Header */}
          <Field orientation="horizontal" className="mb-4 items-center">
            <Avatar className="h-12 w-12" />
            <FieldContent>
              <div className="flex items-center">
                <span className="text-lg font-semibold">Elmo Elmosson</span>
                <button className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs">
                  i
                </button>
              </div>
              <FieldDescription>Aktiv: Nu</FieldDescription>
            </FieldContent>
          </Field>

          {/* Meddelanden */}
          <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl bg-muted/30 px-6 py-4">
            {messages.map((m) => (
              <MessageBubble key={m.messageId} message={m} />
            ))}
          </div>

          {/* Inputfält */}
        <Field orientation="horizontal">
            <FieldContent>
                <OneFieldSearch
                field={{
                    id: "conversationSearch",
                    placeholder: "Skriv meddelande",
                    label:"",
                    searchable: true,
                }}
                onSubmit={(values) => {
                    console.log("Search value:", values.conversationSearch);
                    // Här kan du filtrera dina konversationer
                }}
                className="text-sm"
                />
            </FieldContent>
        </Field>


        </div>
      </CardContent>
    </Card>
  );
}
