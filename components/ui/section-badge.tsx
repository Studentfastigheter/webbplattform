interface SectionBadgeProps {
  text: string;
  color?: string; // T.ex. "text-brand-green-light"
  className?: string;
}

export const SectionBadge = ({ text, color = "text-foreground", className = "" }: SectionBadgeProps) => (
  <div className={`section-marker ${color} ${className}`}>
    {text}
  </div>
);
