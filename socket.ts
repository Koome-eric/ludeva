import { Server, Socket as SocketIOSocket } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { NextApiRequest, NextApiResponse } from "next";
import { initRealtime } from "@/lib/realtime";

// Extend NextApiResponse to include the socket property from the underlying Node.js server
interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: Server;
    };
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log("✅ Socket.IO is already running");
  } else {
    console.log("✅ Initializing Socket.IO server...");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: "*" }, // Adjust for production environments
    });
    res.socket.server.io = io;

    io.on("connection", (socket: SocketIOSocket) => {
      console.log(`🔌 New client connected: ${socket.id}`);
      socket.on("join-room", ({ role, userId }: { role?: string; userId?: string }) => {
        if (role) socket.join(role);
        if (userId) socket.join(`user:${userId}`);
      });
      socket.on("disconnect", () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });

    await initRealtime(io);
  }
  res.end();
}