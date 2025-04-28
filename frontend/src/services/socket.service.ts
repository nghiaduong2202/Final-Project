// src/services/socket.service.ts
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message, Conversation, Participant } from '@/types/chat.type';
import api from './api';

export class SocketService {
  private socket: Socket | null = null;
  private connectedUsers = new BehaviorSubject<string[]>([]);
  private conversations = new BehaviorSubject<Conversation[]>([]);
  private messages = new BehaviorSubject<{ [key: string]: Message[] }>({});
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    // Không kết nối ngay lập tức, đợi token sẵn sàng
    this.setupSocketListeners();
    
    // Lắng nghe sự thay đổi token
    window.addEventListener('storage', (event) => {
      if (event.key === 'access_token') {
        this.reconnect();
      }
    });
  }

  private getToken(): string {
    return localStorage.getItem('access_token') || '';
  }

  private setupSocketListeners(): void {
    // Không thiết lập socket ở đây, sẽ được gọi trong connect()
  }

  private connect(): void {
    if (this.isConnecting || this.socket?.connected) return;
    
    const token = this.getToken();
    if (!token) {
      console.log('No token available, socket connection delayed');
      return;
    }

    this.isConnecting = true;
    
    try {
      // Ngắt kết nối cũ nếu có
      if (this.socket) {
        this.socket.disconnect();
      }

      // Tạo kết nối mới
      this.socket = io('http://localhost:3000/ws/message', {
        extraHeaders: {
          Authorization: token
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000
      });

      // Thiết lập các event listeners
      this.socket.on('connect', () => {
        console.log('Connected to chat server');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      });
      
      this.socket.on('exception', (error: string) => {
        console.error('Socket error:', error);
      });

      this.socket.on('connected-users', (users: string[]) => {
        this.connectedUsers.next(users);
      });

      this.socket.on('receive-message', (message: Message) => {
        const currentMessages = this.messages.value;
        const conversationId = message.conversation.id;
        
        if (!currentMessages[conversationId]) {
          currentMessages[conversationId] = [];
        }
        
        currentMessages[conversationId].push(message);
        this.messages.next({...currentMessages});
      });

      this.socket.on('seen-message', (participant: Participant) => {
        // Xử lý khi có người xem tin nhắn
        const convos = this.conversations.value;
        const index = convos.findIndex((c: Conversation) => 
          c.participants.some((p: Participant) => p.id === participant.id)
        );
        
        if (index !== -1) {
          const updatedConvos = [...convos];
          const participantIndex = updatedConvos[index].participants
            .findIndex((p: Participant) => p.id === participant.id);
          
          if (participantIndex !== -1) {
            updatedConvos[index].participants[participantIndex] = participant;
            this.conversations.next(updatedConvos);
          }
        }
      });

      this.socket.on('join-conversation', (conversation: Conversation) => {
        const convos = this.conversations.value;
        this.conversations.next([...convos, conversation]);
      });

      this.socket.on('add-person-notificate', (participant: Participant) => {
        // Xử lý thông báo khi có người được thêm vào cuộc trò chuyện
        console.log('Person added notification:', participant);
      });

      this.socket.on('add-person', (conversation: Conversation) => {
        const convos = this.conversations.value;
        this.conversations.next([...convos, conversation]);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnecting = false;
        
        // Nếu bị ngắt kết nối do token hết hạn, thử refresh token
        if (reason === 'io server disconnect' || reason === 'transport close') {
          this.handleTokenError();
        }
      });

    } catch (error) {
      console.error('Error setting up socket:', error);
      this.isConnecting = false;
    }
  }

  private handleTokenError(): void {
    // Thử refresh token nếu có thể
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      // Gọi API refresh token
      fetch('http://localhost:3000/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })
      .then(response => response.json())
      .then(data => {
        if (data.accessToken) {
          localStorage.setItem('access_token', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken);
          }
          // Kết nối lại sau khi refresh token
          this.reconnect();
        } else {
          // Nếu không refresh được, đăng xuất
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      })
      .catch(error => {
        console.error('Error refreshing token:', error);
        // Nếu lỗi, đăng xuất
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      });
    } else {
      // Không có refresh token, đăng xuất
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    this.connect();
  }

  // Các phương thức để emit events
  sendMessage(conversationId: string, content: string): void {
    if (!this.socket?.connected) {
      this.connect();
      // Đợi kết nối thành công trước khi gửi tin nhắn
      setTimeout(() => {
        this.socket?.emit('send-message', {
          conversationId,
          content
        });
      }, 1000);
    } else {
      this.socket.emit('send-message', {
        conversationId,
        content
      });
    }
  }

  sendImages(conversationId: string, imageUrls: string[]): void {
    if (!this.socket?.connected) {
      this.connect();
      // Đợi kết nối thành công trước khi gửi hình ảnh
      setTimeout(() => {
        this.socket?.emit('send-images', {
          conversationId,
          imageUrls
        });
      }, 1000);
    } else {
      this.socket.emit('send-images', {
        conversationId,
        imageUrls
      });
    }
  }

  markAsSeen(conversationId: string): void {
    if (!this.socket?.connected) {
      this.connect();
      // Đợi kết nối thành công trước khi đánh dấu đã xem
      setTimeout(() => {
        this.socket?.emit('seen-message', {
          conversationId
        });
      }, 1000);
    } else {
      this.socket.emit('seen-message', {
        conversationId
      });
    }
  }

  // Observables để component có thể đăng ký nghe sự kiện
  getConnectedUsers(): Observable<string[]> {
    return this.connectedUsers.asObservable();
  }

  getConversations(): Observable<Conversation[]> {
    return this.conversations.asObservable(); 
  }

  getMessages(conversationId: string): Observable<Message[]> {
    return new Observable((observer: { next: (value: Message[]) => void }) => {
      observer.next(this.messages.value[conversationId] || []);
      
      const subscription = this.messages.subscribe((messagesMap: { [key: string]: Message[] }) => {
        observer.next(messagesMap[conversationId] || []);
      });
      
      return () => subscription.unsubscribe();
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default api;