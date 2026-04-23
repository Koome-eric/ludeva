import { useEffect } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useRouter } from "next/navigation";

type EventType = 
  | "user:update" 
  | "announcement:update" 
  | "product:update" 
  | "investment:update" 
  | "transaction:update";

export const useRealtime = (event: EventType, onUpdate?: (data: any) => void) => {
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (payload: any) => {
      console.log(`⚡ Realtime update: ${event}`, payload);
      
      // 1. Refresh Server Components (Server Actions / RSC)
      router.refresh();

      // 2. Custom callback for toasts or local state
      if (onUpdate) {
        onUpdate(payload);
      }
    };

    socket.on(event, handleUpdate);

    return () => {
      socket.off(event, handleUpdate);
    };
  }, [socket, event, router, onUpdate]);
};