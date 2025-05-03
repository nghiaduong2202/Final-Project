export interface Person {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  gender: string | null;
  dob: string | null;
  bankAccount: string | null;
  role: 'owner' | 'player';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  images: string[] | null;
  sender: Person;
  isRead?: boolean;
}

export interface SocketMessage extends Message {
  conversation: {
    id: string;
    isGroup: boolean;
    title: string | null;
    createdAt: string;
  };
}

export interface Participant {
  conversationId: string;
  personId: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  person: Person;
  seen: {
    id: string;
    content: string;
    createdAt: string;
    images: string[] | null;
  } | null;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  title: string | null;
  createdAt: string;
  participants: Participant[];
  messages: Message[];
  unreadMessageCount: number;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isChatWidgetOpen: boolean;
  isChatManagementOpen: boolean;
  activeConversationId: string | null;    
  isConversationOpen: boolean;
}