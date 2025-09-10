import { io } from 'socket.io-client';

const socket = io({
  autoConnect: false,
});

socket.onAny((event, ...args) => {
  console.log(`[Socket.IO] evento recebido: ${event}`, args);
});

export default socket;