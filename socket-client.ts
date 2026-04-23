import { io } from "socket.io-client";

// This file should only be imported in client-side components (e.g., inside useEffect)
// to avoid issues with Server-Side Rendering (SSR).
export const socket = io({
  path: "/api/socket",
  // This should match the server configuration
  addTrailingSlash: false,
});