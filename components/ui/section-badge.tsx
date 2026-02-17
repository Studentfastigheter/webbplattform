import React from 'react';

interface SectionBadgeProps {
  text: string;
  color?: string; // T.ex. "text-brand-green-light"
  className?: string;
}

export const SectionBadge = ({ text, color = "text-muted-foreground", className = "" }: SectionBadgeProps) => (
  <div className={`text-xs font-bold tracking-[0.2em] uppercase mb-4 ${color} ${className}`}>
    {text}
  </div>
);