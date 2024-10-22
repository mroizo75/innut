import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (userId: string | null) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (userId) {
      // Initialiser Socket.IO-klienten
      socketRef.current = io();

      // Bli med i brukerens unike rom
      socketRef.current.emit('join', userId);

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [userId]);

  return socketRef.current;
};