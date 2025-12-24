"use client";

import { CircleQuestionMark, Upload } from "lucide-react";
import Container from "./Container";
import { cn } from "@/lib/utils";



type DragAndDropProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string,
};

export default function DragAndDrop({
  className,
  ...props
}: DragAndDropProps) {
  return (
    <Container {...props} borderStyle="dashed" className={cn(`border-neutral-400`, className)} onClick={() => {}}>
      <div className="absolute top-3 right-4 p-2 group">
        <CircleQuestionMark size={24} className="group-hover:text-neutral-700 transition-all duration-75" onClick={() => {}} />
      </div>
      <div className="flex items-center justify-center flex-col gap-6 py-6">
        <Upload size={48} />
        <div>
          <p className="text-2xl font-bold mb-1 text-center">Släpp din CSV-fil här!</p>
          <p className="text-sm text-neutral-600 text-center">Ladda upp flera objekt samtidigt.</p>
        </div>
      </div>
    </Container>
  )
}