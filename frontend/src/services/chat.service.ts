import api from './api';
import { Conversation } from '@/types/chat.type';

export const ChatService = {
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await api.get(`/chat`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  async createConversation(personId: string): Promise<Conversation> {
    try {
      const response = await api.post(
        `/chat/conversation`,
        { personId }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  async createGroupConversation(title: string, members: string[]): Promise<Conversation> {
    try {
      const response = await api.post(
        `/chat/group-conversation`,
        { title, members }
      );    
      return response.data;
    } catch (error) {
      console.error('Error creating group conversation:', error);
      throw error;
    }
  },

  async addPersonToConversation(conversationId: string, personId: string): Promise<Conversation> {
    try {
      const response = await api.post(
        `/chat/add-person`,
        { conversationId, personId }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding person to conversation:', error);
      throw error;
    }
  }
}

export default ChatService;