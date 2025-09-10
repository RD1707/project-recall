import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const socket = io(SERVER_URL, {
  autoConnect: false
});

socket.onAny((event, ...args) => {
  console.log(`[Socket.IO] evento recebido: ${event}`, args);
});

export default socket;