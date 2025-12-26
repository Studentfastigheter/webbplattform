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
  Twitter // Används ofta för X
} from "lucide-react";

export function ShareDialog({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Hämta URL på klient-sidan för att undvika hydration mismatch
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

  // Social Media Länkar
  const encodedUrl = encodeURIComponent(currentUrl);
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
      name: "E-post",
      icon: <Mail className="w-5 h-5" />,
      href: `mailto:?subject=Kolla in denna bostad&body=Hittade denna länk som jag trodde du skulle gilla: ${encodedUrl}`,
      color: "hover:bg-gray-600 hover:text-white",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Här renderas knappen du skickar in (Share2-ikonen) */}
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle>Dela bostad</DialogTitle>
          <DialogDescription>
            Dela länken till denna bostad via sociala medier eller kopiera länken direkt.
          </DialogDescription>
        </DialogHeader>
        
        {/* Sociala Medier Ikoner */}
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
              title={`Dela på ${social.name}`}
            >
              {social.icon}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Länk
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
            <span className="sr-only">Kopiera</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}