import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const normalizeSocketUrl = (value) => {
  if (!value) return 'http://localhost:5000';

  const trimmed = String(value).trim().replace(/\/$/, '');
  const withoutApiPath = trimmed.replace(/\/api\/?$/, '');
  const withoutDuplicateProtocol = withoutApiPath.replace(/^([a-z]+:\/\/)+/i, (match) => {
    return withoutApiPath.startsWith('https://') ? 'https://' : 'http://';
  });

  return withoutDuplicateProtocol.replace(/\/$/, '');
};

const SOCKET_URL = normalizeSocketUrl(import.meta.env.VITE_API_URL);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('upgk_token');
    const socket = io(SOCKET_URL, { auth: { token } });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
