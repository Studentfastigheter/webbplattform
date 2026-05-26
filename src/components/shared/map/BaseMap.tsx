"use client";

import dynamic from "next/dynamic";
import type { BaseMapProps, BaseMarker, PopupRenderer } from "./BaseMapClient";

const BaseMap = dynamic<BaseMapProps>(() => import("./BaseMapClient"), {
  ssr: false,
});

export type { BaseMarker, PopupRenderer };
export default BaseMap;
