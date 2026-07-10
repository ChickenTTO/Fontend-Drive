import { createContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}
