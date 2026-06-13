// components/ShareDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Check,
  Facebook,
  Linkedin,
  Mail,
  Twitter,
} from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type ShareDialogProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  mailSubject?: string;
  mailBody?: string;
};

export function ShareDialog({
  children,
  title,
  description,
  mailSubject,
  mailBody,
}: ShareDialogProps) {
  const { locale } = useI18n();
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const resolvedTitle =
    title ?? localizedText(locale, "Dela bostad", "Share listing");
  const resolvedDescription =
    description ??
    localizedText(
      locale,
      "Dela länken till denna sida via sociala medier eller kopiera länken direkt.",
      "Share this page through social channels or copy the link directly.",
    );
  const resolvedMailSubject =
    mailSubject ?? localizedText(locale, "Kolla in den här sidan", "Check out this page");
  const resolvedMailBody =
    mailBody ??
    localizedText(
      locale,
      "Hittade den här länken som jag trodde du skulle gilla:",
      "I found this link and thought you might like it:",
    );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedMailSubject = encodeURIComponent(resolvedMailSubject);
  const encodedMailBody = encodeURIComponent(`${resolvedMailBody} ${currentUrl}`);

  const socialLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-600 hover:text-white",
    },
    {
      name: "X (Twitter)",
      icon: <Twitter className="w-5 h-5" />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
      color: "hover:bg-black hover:text-white",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-blue-700 hover:text-white",
    },
    {
      name: localizedText(locale, "E-post", "Email"),
      icon: <Mail className="w-5 h-5" />,
      href: `mailto:?subject=${encodedMailSubject}&body=${encodedMailBody}`,
      color: "hover:bg-gray-600 hover:text-white",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle>{resolvedTitle}</DialogTitle>
          <DialogDescription>{resolvedDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-4 py-4">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                p-3 rounded-full bg-gray-100 transition-colors text-gray-700
                ${social.color}
              `}
              title={localizedText(locale, `Dela på ${social.name}`, `Share on ${social.name}`)}
            >
              {social.icon}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              {localizedText(locale, "Länk", "Link")}
            </Label>
            <Input
              id="link"
              defaultValue={currentUrl}
              readOnly
              className="h-9 bg-gray-50 border-gray-200"
            />
          </div>
          <Button
            size="sm"
            className="px-3 bg-black text-white hover:bg-gray-800"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">{localizedText(locale, "Kopiera", "Copy")}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
