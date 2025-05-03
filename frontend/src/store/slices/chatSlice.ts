import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Conversation, Message } from '@/types/chat.type';

const initialState: ChatState = {
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,
  isChatWidgetOpen: false, // Trạng thái mở/đóng hộp chat
  isChatManagementOpen: false, // Trạng thái mở/đóng chat management phía Owner
  activeConversationId: null, // ID của conversation đang active
  isConversationOpen: false, // Trạng thái mở/đóng conversation detail
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Quản lý trạng thái hộp chat
    toggleChatWidget: (state) => {
      state.isChatWidgetOpen = !state.isChatWidgetOpen;
    },
    openChatWidget: (state) => {
      state.isChatWidgetOpen = true;
    },
    closeChatWidget: (state) => {
      state.isChatWidgetOpen = false;
    },

    // Quản lý chat management phía Owner    
    openChatManagement: (state) => {
      state.isChatManagementOpen = true;
    },
    closeChatManagement: (state) => {
      state.isChatManagementOpen = false;
    },

    // Quản lý conversation
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      state.isConversationOpen = !!action.payload; // Tự động mở conversation khi có ID
    },
    toggleConversation: (state) => {
      state.isConversationOpen = !state.isConversationOpen;
    },
    openConversation: (state) => {
      state.isConversationOpen = true;
    },
    closeConversation: (state) => {
      state.isConversationOpen = false;
      state.activeConversationId = null; // Reset active conversation khi đóng
    },
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.push(action.payload);
    },
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex(conv => conv.id === action.payload.id);
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
    },

    // Quản lý messages
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Add message to messages array
      state.messages.push(action.payload);
      
      // Update conversation's last message and unread count
      const conversation = state.conversations.find(c => c.id === state.activeConversationId);
      if (conversation) {
        if (!conversation.messages) {
          conversation.messages = [];
        }
        conversation.messages.push(action.payload);
        
        // Update unread count if message is from other participant
        if (action.payload.sender.id !== state.activeConversationId) {
          conversation.unreadMessageCount = (conversation.unreadMessageCount || 0) + 1;
        }
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },

    // Loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Reset state
    resetChatState: () => {
      return initialState;
    },
  },
});

export const {
  toggleChatWidget,
  openChatWidget,
  closeChatWidget,
  setActiveConversation,
  toggleConversation,
  openConversation,
  closeConversation,
  setConversations,
  addConversation,
  updateConversation,
  setMessages,
  addMessage,
  updateMessage,
  setLoading,
  setError,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer; 