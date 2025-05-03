import React, { useEffect, useMemo, ReactNode } from 'react';
import { SocketService } from '@/services/socket.service';
import { SocketContext } from '@/contexts/SocketContext';

interface SocketServiceProviderProps {
  children: ReactNode;
}

export const SocketServiceProvider: React.FC<SocketServiceProviderProps> = ({ children }) => {
  const socketService = useMemo(() => new SocketService(), []);

  useEffect(() => {
    return () => {
      socketService.disconnect();
      
    };
  }, [socketService]);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
}; 