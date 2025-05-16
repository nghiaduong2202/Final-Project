import { useCallback, useEffect, useState } from 'react';
import { useSocketService } from './useSocketService';
import { ChatService } from '@/services/chat.service';
import {
  setConversations,
  setActiveConversation,
  setLoading,
  setError,
  toggleChatWidget,
  openConversation,
  closeConversation,
  addMessage,
  setMessages
} from '@/store/slices/chatSlice';
import { useAppSelector, useAppDispatch } from './reduxHooks';
import { Conversation, Message } from '@/types/chat.type';

export const useChat = () => {
  const dispatch = useAppDispatch();
  const socketService = useSocketService();
  const [isOnline, setIsOnline] = useState(false);
  const [currentChatParticipantId, setCurrentChatParticipantId] = useState<string | null>(null);
  
  const {
    conversations,
    messages,
    isLoading,
    isChatWidgetOpen,
    isConversationOpen,
    activeConversationId
  } = useAppSelector(state => state.chat);
  const { user } = useAppSelector(state => state.user);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const conversationsData = await ChatService.getConversations();
      
      // If there's an active conversation, make sure its unreadMessageCount is 0
      if (activeConversationId) {
        const updatedData = conversationsData.map(conv => {
          if (conv.id === activeConversationId) {
            return { ...conv, unreadMessageCount: 0 };
          }
          return conv;
        });
        dispatch(setConversations(updatedData));
      } else {
        dispatch(setConversations(conversationsData));
      }
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch conversations'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, activeConversationId]);

  // Handle conversation selection
  const handleConversationClick = useCallback(async (conversationId: string) => {
    try {
      dispatch(setLoading(true));
      
      // Get conversation
      const conversation = conversations.find(c => c.id === conversationId);
      
      if (conversation) {
        // Đặt số tin nhắn chưa đọc về 0 ngay lập tức trong UI
        // Điều này phải được thực hiện trước khi đặt active conversation
        if (conversation.unreadMessageCount > 0) {
          console.log('Resetting unread count for conversation:', conversationId);
          const updatedConversations = conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                unreadMessageCount: 0
              };
            }
            return conv;
          });
          
          dispatch(setConversations(updatedConversations));
        }
        
        // Set messages from conversation
        dispatch(setMessages(conversation.messages));
        
        // Set active conversation
        dispatch(setActiveConversation(conversationId));
        
        // Tell the socket service which conversation is active
        socketService.setActiveConversation(conversationId);
        
        // Mark messages as seen when opening conversation
        if (conversation.messages?.length) {
          const lastMessage = conversation.messages[conversation.messages.length - 1];
          
          // Mark as seen if the last message is not from current user
          if (lastMessage.sender.id !== user?.id) {
            console.log('Marking last message as seen:', lastMessage.id);
            socketService.markAsSeen(conversationId, lastMessage.id);
          }
        }
        
        // Get the other participant and set their ID for online status checking
        const otherParticipant = getOtherParticipant(conversation);
        if (otherParticipant && otherParticipant.person && otherParticipant.person.id) {
          setCurrentChatParticipantId(otherParticipant.person.id);
        }
      }
    } catch (error) {
      console.error('Error handling conversation click:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to load conversation'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, conversations, socketService, user]);

  // Handle sending message
  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim() || !activeConversationId) return;
    
    console.log('Sending message to conversation:', activeConversationId);
    
    // Gửi tin nhắn qua socket
    socketService.sendMessage(activeConversationId, content);
    
    // Đảm bảo conversation này không có tin nhắn chưa đọc đối với người gửi
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversationId) {
        // Đặt unreadMessageCount = 0 cho conversation hiện tại
        return {
          ...conv,
          unreadMessageCount: 0
        };
      }
      return conv;
    });
    
    dispatch(setConversations(updatedConversations));
  }, [activeConversationId, socketService, conversations, dispatch]);

  // Handle chat widget toggle
  const toggleChat = useCallback(() => {
    dispatch(toggleChatWidget());
  }, [dispatch]);

  // Handle conversation toggle
  const toggleConversationView = useCallback(() => {
    if (isConversationOpen) {
      dispatch(closeConversation());
    } else {
      dispatch(openConversation());
    }
  }, [dispatch, isConversationOpen]);

  // Get current conversation
  const getCurrentConversation = useCallback(() => {
    return conversations.find(c => c.id === activeConversationId);
  }, [conversations, activeConversationId]);

  // Get other participant
  const getOtherParticipant = useCallback((conversation: Conversation) => {
    if (!conversation || !conversation.participants) return null;
    return conversation.participants.find(p => p.person && p.person.id !== user?.id);
  }, [user]);

  // Listen for new messages
  useEffect(() => {
    // console.log('Setting up message subscription for conversation:', activeConversationId);
    
    const subscription = socketService.getMessages(activeConversationId || '').subscribe(
      (newMessages: Message[]) => {
        // console.log('New messages received:', newMessages.length, activeConversationId);
        
        if (activeConversationId && newMessages.length > 0) {
          // Add each message individually
          newMessages.forEach(message => {
            // Thêm kiểm tra để tránh trường hợp duplicate
            const messageExists = messages.some(m => m.id === message.id);
            if (!messageExists) {
              console.log('Adding new message to UI:', message.content);
              dispatch(addMessage(message));
              
              // Nếu tin nhắn mới là từ người khác và đang xem conversation này,
              // đánh dấu là đã đọc
              if (message.sender.id !== user?.id) {
                console.log('Marking message as seen (from other user)');
                socketService.markAsSeen(activeConversationId, message.id);
                
                // Đảm bảo unreadMessageCount = 0 cho conversation này
                const updatedConversations = conversations.map(conv => {
                  if (conv.id === activeConversationId) {
                    return {
                      ...conv,
                      unreadMessageCount: 0
                    };
                  }
                  return conv;
                });
                
                dispatch(setConversations(updatedConversations));
              }
            }
          });
        }
      }
    );

    return () => {
      console.log('Cleaning up message subscription');
      subscription.unsubscribe();
    };
  }, [activeConversationId, dispatch, socketService, messages, user, conversations]);

  // Listen for online status changes for current chat participant
  useEffect(() => {
    if (!currentChatParticipantId) {
      setIsOnline(false);
      return () => {};
    }

    // Subscribe to online status changes for the current chat participant
    const subscription = socketService.getUserOnlineStatus(currentChatParticipantId).subscribe(
      (online: boolean) => {
        // console.log(`User ${currentChatParticipantId} online status:`, online);
        setIsOnline(online);
      }
    );

    return () => subscription.unsubscribe();
  }, [currentChatParticipantId, socketService]);

  // Listen for conversation updates
  useEffect(() => {
    // console.log('Setting up conversation update subscription');
    
    const subscription = socketService.getConversations().subscribe(
      (updatedConversations: Conversation[]) => {
        // console.log('Received updated conversations:', updatedConversations.length);
        
        // Process the updated conversations, maintaining unread count for active conversation
        let processedConversations = updatedConversations;
        if (activeConversationId) {
          processedConversations = updatedConversations.map(conv => {
            if (conv.id === activeConversationId) {
              return {
                ...conv,
                unreadMessageCount: 0
              };
            }
            return conv;
          });
        }
        
        dispatch(setConversations(processedConversations));
      }
    );

    return () => {
      console.log('Cleaning up conversation update subscription');
      subscription.unsubscribe();
    };
  }, [dispatch, socketService, activeConversationId]);
  
  // Listen for conversation updates - fetch conversations when widget is opened
  useEffect(() => {
    if (isChatWidgetOpen) {
      // console.log('Chat widget opened, fetching conversations');
      fetchConversations();
    }
  }, [isChatWidgetOpen, fetchConversations]);

  return {
    // State
    conversations,
    messages,
    isLoading,
    isChatWidgetOpen,
    isConversationOpen,
    activeConversationId,
    isOnline,

    // Actions
    fetchConversations,
    handleConversationClick,
    handleSendMessage,
    toggleChat,
    toggleConversationView,
    getCurrentConversation,
    getOtherParticipant,
  };
}; 