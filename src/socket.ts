import { io, Socket } from 'socket.io-client';
let sock: Socket;
export const socket = () => {
  if (!sock)
    sock = io(import.meta.env.VITE_API_BASE_URL!.replace('/api', ''));
  return sock;
};
