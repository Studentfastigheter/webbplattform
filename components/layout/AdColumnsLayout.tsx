import { type ReactNode } from "react";

type AdColumnsLayoutProps = {
  children: ReactNode;
};

const AdColumnsLayout = ({ children }: AdColumnsLayoutProps) => {
  return (
    <div className="grid w-full grid-cols-[minmax(120px,15vw)_minmax(0,1fr)_minmax(120px,15vw)] items-start gap-6">
      <div className="h-full min-h-[520px] rounded-2xl bg-red-500" aria-hidden />
      <div className="min-w-0">{children}</div>
      <div className="h-full min-h-[520px] rounded-2xl bg-red-500" aria-hidden />
    </div>
  );
};

export default AdColumnsLayout;
