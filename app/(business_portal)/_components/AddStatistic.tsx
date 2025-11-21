"use client";
import { CopyPlus } from "lucide-react";
import Container from "./Container";

export default function AddStatistic({
  columnSpan,
}: {
  columnSpan: number;
}) {
  return (
    <Container onClick={() => {}} columnSpan={columnSpan} padding="sm" borderStyle="dashed" className="hover:!border-solid hover:!shadow-xs transition-all duration-75">
      <CopyPlus size={24} className="text-neutral-400 mb-2 mx-auto" />
      <p className="text-sm text-brand font-bold text-center tracking-wide">Add data</p>
    </Container>
  )
}