import React, { useEffect, useRef } from 'react';
import { Badge, Button, Input, Avatar, Empty, Dropdown } from 'antd';
import { 
  MessageOutlined, 
  CloseOutlined, 
  SendOutlined, 
  MoreOutlined,
  SearchOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useChat } from '@/hooks/useChat';
import { useAppSelector } from '@/hooks/reduxHooks';
import MessageBubble from './MessageBubble';
import './ChatWidget.css';
import { useSocketService } from '@/hooks/useSocketService';

const ChatWidget: React.FC = () => {
  const [currentMessage, setCurrentMessage] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  
  const { user } = useAppSelector(state => state.user);
  const {
    conversations,
    messages,
    isLoading,
    isChatWidgetOpen,
    isConversationOpen,
    activeConversationId,
    isOnline,
    fetchConversations,
    handleConversationClick,
    handleSendMessage,
    toggleChat,
    toggleConversationView,
    getCurrentConversation,
    getOtherParticipant,
  } = useChat();

  const socketService = useSocketService();

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial fetch when component mounts
  useEffect(() => {
    if (isChatWidgetOpen) {
      fetchConversations();
    }
  }, [isChatWidgetOpen, fetchConversations]);

  // Reset unread counts when a conversation is active
  useEffect(() => {
    if (activeConversationId && isChatWidgetOpen) {
      // Mark the active conversation as read
      const convo = conversations.find(c => c.id === activeConversationId);
      if (convo && convo.messages && convo.messages.length > 0) {
        const lastMessage = convo.messages[convo.messages.length - 1];
        if (lastMessage.sender.id !== user?.id) {
          socketService.markAsSeen(activeConversationId, lastMessage.id);
        }
      }
    }
  }, [activeConversationId, isChatWidgetOpen, conversations, user, socketService]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversationId]);

  // Listen for "open_chat" events
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      const { conversationId } = event.detail;
      if (conversationId) {
        // Mở chat widget nếu đang đóng
        if (!isChatWidgetOpen) {
          toggleChat();
        }
        // Chọn conversation
        handleConversationClick(conversationId);
        // Mở conversation view nếu đang ở mobile
        if (isMobile && !isConversationOpen) {
          toggleConversationView();
        }
      }
    };
    
    window.addEventListener('open_chat', handleOpenChat as EventListener);
    return () => window.removeEventListener('open_chat', handleOpenChat as EventListener);
  }, [toggleChat, handleConversationClick, isChatWidgetOpen, isMobile, isConversationOpen, toggleConversationView]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentMessage.trim()) {
      handleSendMessage(currentMessage);
      setCurrentMessage('');
    }
  };

  const handleSendClick = () => {
    if (currentMessage.trim()) {
      console.log('ChatWidget sending message:', currentMessage);
      handleSendMessage(currentMessage);
      setCurrentMessage('');
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = getOtherParticipant(conv);
    const matchesSearch = searchQuery === '' || 
      (otherParticipant?.person?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (currentTab === 'unread') {
      return matchesSearch && (conv.unreadMessageCount || 0) > 0;
    }
    
    return matchesSearch;
  });

  const renderChatSidebar = () => (
    <div className="chat-sidebar">
      <div className="chat-header">
        <h3>Tin nhắn</h3>
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={toggleChat}
        />
      </div>

      <div className="chat-filter">
        <div className="filter-tabs">
          <div 
            className={`filter-tab ${currentTab === 'all' ? 'active' : ''}`}
            onClick={() => setCurrentTab('all')}
          >
            Tất cả
          </div>
          <div 
            className={`filter-tab ${currentTab === 'unread' ? 'active' : ''}`}
            onClick={() => setCurrentTab('unread')}
          >
            Chưa đọc
          </div>
        </div>
        <Input
          placeholder="Tìm kiếm cuộc trò chuyện..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="chat-list">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => {
            const otherParticipant = getOtherParticipant(conversation);
            const lastMessage = conversation.messages?.[conversation.messages.length - 1];
            
            // Kiểm tra xem tin nhắn cuối cùng có phải do người dùng hiện tại gửi không
            const isLastMessageFromCurrentUser = lastMessage && lastMessage.sender.id === user?.id;
            
            // Chỉ hiển thị số tin nhắn chưa đọc nếu tin nhắn cuối cùng KHÔNG phải do người dùng hiện tại gửi
            const displayUnreadCount = !isLastMessageFromCurrentUser ? (conversation.unreadMessageCount || 0) : 0;
            
            return (
              <div 
                key={conversation.id} 
                className={`chat-item ${activeConversationId === conversation.id ? 'active' : ''} ${displayUnreadCount > 0 ? 'unread' : ''}`}
                onClick={() => handleConversationClick(conversation.id)}
              >
                <Badge count={displayUnreadCount} size="small" className="badge-notify">
                  <Avatar src={otherParticipant?.person?.avatarUrl} size={40} icon={<UserOutlined />} />
                </Badge>
                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <span className="chat-item-name">{otherParticipant?.person?.name || 'Không xác định'}</span>
                    <span className="chat-item-time">
                      {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <div className="chat-item-message">
                    {lastMessage ? (
                      <div className="truncate-text">
                        {lastMessage.sender.id === user?.id && <span className="message-status-inline"><CheckOutlined /></span>}
                        {lastMessage.content}
                      </div>
                    ) : 'Bắt đầu cuộc trò chuyện'}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <Empty description="Không có cuộc trò chuyện nào" />
        )}
      </div>
    </div>
  );

  const renderChatDetail = () => {
    if (!activeConversationId) {
      if (!isMobile) {
        return (
          <div className="chat-conversation-wrapper">
            <div className="empty-conversation">
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        );
      }
      return null;
    }

    const currentConversation = getCurrentConversation();
    const otherParticipant = currentConversation ? getOtherParticipant(currentConversation) : null;
    
    return (
      <div className={`chat-conversation-wrapper ${isMobile && !isConversationOpen ? 'hidden' : ''}`}>
        <div className="chat-conversation">
          <div className="conversation-header">
            {isMobile && (
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={toggleConversationView}
                className="conversation-back-btn"
              />
            )}
            <div className="conversation-info">
              <Avatar 
                src={otherParticipant?.person?.avatarUrl} 
                size="small" 
                icon={<UserOutlined />} 
                className="mr-2" 
              />
              <div>
                <span className="conversation-name">
                  {otherParticipant?.person?.name || 'Không xác định'}
                </span>
                <span className={`conversation-status ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                </span>
              </div>
            </div>
            <Dropdown menu={{ 
              items: [
                { 
                  key: '1', 
                  label: 'Đánh dấu đã đọc',
                  onClick: () => handleConversationClick(activeConversationId)
                }
              ] 
            }} placement="bottomRight">
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </div>

          <div className="messages-container">
            {messages.length > 0 ? (
              <div className="messages-list">
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwnMessage={msg.sender.id === user?.id}
                    otherParticipant={otherParticipant || undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-messages">
                <p>Chưa có tin nhắn nào</p>
                <p className="text-sm text-gray-500">Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <Input 
              placeholder="Nhập tin nhắn..." 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              suffix={
                <Button 
                  type="text" 
                  icon={<SendOutlined />} 
                  onClick={handleSendClick}
                  disabled={!currentMessage.trim()}
                  className="send-button"
                />
              }
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-widget">
      <Badge 
        count={conversations.reduce((total, conv) => {
          // Kiểm tra tin nhắn cuối cùng
          const lastMessage = conv.messages?.[conv.messages.length - 1];
          // Chỉ tính tin nhắn chưa đọc nếu tin nhắn cuối cùng KHÔNG phải do người dùng hiện tại gửi
          const isLastMessageFromCurrentUser = lastMessage && lastMessage.sender.id === user?.id;
          const unreadCount = !isLastMessageFromCurrentUser ? (conv.unreadMessageCount || 0) : 0;
          return total + unreadCount;
        }, 0)} 
        className="badge-notify"
      >
        <Button 
          className="chat-toggle-button"
          type="primary" 
          shape="circle" 
          icon={<MessageOutlined />} 
          onClick={toggleChat}
        />
      </Badge>

      {isChatWidgetOpen && (
        <div className={`chat-container ${!isMobile && activeConversationId ? 'split-view' : ''}`}>
          {renderChatSidebar()}
          {(activeConversationId || !isMobile) && renderChatDetail()}
        </div>
      )}
    </div>
  );
};

export default ChatWidget; 