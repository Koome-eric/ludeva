"use client";

import { useRealtime } from "@/hooks/use-realtime";

export function RealtimeListener({ event }: { event: string }) {
  // @ts-ignore
  useRealtime(event);
  return null;
}