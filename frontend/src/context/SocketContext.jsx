import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL);
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        setAuthenticated(false);
        
        // Authenticate with token
        const token = localStorage.getItem('token');
        if (token) {
          newSocket.emit('authenticate', token);
        }
      });

      // Listen for authentication success
      newSocket.on('authenticated', (data) => {
        if (data.success) {
          console.log('Authentication successful:', data.userId);
          setAuthenticated(true);
        } else {
          console.error('Authentication failed:', data.error);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
        setAuthenticated(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.off('authenticated');
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
        setAuthenticated(false);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected, authenticated }}>
      {children}
    </SocketContext.Provider>
  );
};
