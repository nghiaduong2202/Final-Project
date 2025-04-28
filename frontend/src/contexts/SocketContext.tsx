import { createContext } from 'react';
import { SocketService } from '@/services/socket.service';

export const SocketContext = createContext<SocketService | null>(null); 