export interface Person {
    id: string;
    name: string;
    avatar?: string;
  }
  
  export interface Message {
    id: string;
    content: string;
    imageUrls?: string[];
    createdAt: Date;
    sender: Participant;
    conversation: Conversation;
  }
  
  export interface Participant {
    id: string;
    personId: string;
    person: Person;
    isAdmin: boolean;
    conversation: Conversation;
    seen?: {
      id: string;
      createdAt: Date;
    };
  }
  
  export interface Conversation {
    id: string;
    isGroup: boolean;
    title?: string;
    participants: Participant[];
    messages: Message[];
    unreadMessageCount?: number;
  }