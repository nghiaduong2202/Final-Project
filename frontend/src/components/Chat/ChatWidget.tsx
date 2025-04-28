import React, { useState, useEffect, useRef } from 'react';
import { Badge, Button, Input, Avatar, Empty, Dropdown, Tooltip } from 'antd';
import { 
  MessageOutlined, 
  CloseOutlined, 
  SendOutlined, 
  SmileOutlined, 
  PictureOutlined,
  PushpinOutlined,
  MoreOutlined,
  SearchOutlined,
  UserOutlined,
  EllipsisOutlined,
  ArrowLeftOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useAppSelector } from '@/hooks/reduxHooks';
import { Message, Conversation } from "@/types/chat.type";
import { useSocketService } from '@/hooks/useSocketService';
import { ChatService } from '@/services/chat.service';
import './ChatWidget.css';

const ChatWidget: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector(state => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all' | 'unread' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);
  const [savedConversations, setSavedConversations] = useState<string[]>([]);
  
  // Get socket service
  const socketService = useSocketService();
  
  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fetch conversations when component mounts or auth state changes
  useEffect(() => {
    const fetchConversations = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const conversationsData = await ChatService.getConversations();
        setConversations(conversationsData);
        
        // Get saved conversations from localStorage
        const saved = localStorage.getItem('saved_conversations');
        if (saved) {
          setSavedConversations(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
    
    // Listen for new conversations from socket
    if (isAuthenticated) {
      const subscription = socketService.getConversations().subscribe(
        convos => {
          if (convos.length > 0) {
            setConversations(convos);
          }
        }
      );
      
      return () => subscription.unsubscribe();
    }
  }, [isAuthenticated, socketService]);
  
  // Listen for "open_chat" events
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      const { conversationId } = event.detail;
      if (conversationId) {
        setIsOpen(true);
        setActiveConversation(conversationId);
      }
    };
    
    window.addEventListener('open_chat', handleOpenChat as EventListener);
    
    return () => {
      window.removeEventListener('open_chat', handleOpenChat as EventListener);
    };
  }, []);
  
  // Check for active_conversation in localStorage on mount
  useEffect(() => {
    const activeConvId = localStorage.getItem('active_conversation');
    if (activeConvId) {
      setActiveConversation(activeConvId);
      setIsOpen(true);
      localStorage.removeItem('active_conversation'); // Clear after use
    }
  }, []);
  
  // Scroll to bottom when messages change or conversation is opened
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeConversation || !isAuthenticated) return;
    
    // Mark conversation as seen when opened
    socketService.markAsSeen(activeConversation);
    
    // Subscribe to messages for this conversation
    const subscription = socketService.getMessages(activeConversation)
      .subscribe(msgs => {
        setMessages(msgs);
      });
    
    return () => subscription.unsubscribe();
  }, [activeConversation, socketService, isAuthenticated]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !activeConversation || !isAuthenticated) return;
    
    socketService.sendMessage(activeConversation, currentMessage);
    setCurrentMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const calculateUnreadCount = (conversations: Conversation[]) => {
    return conversations.reduce((total, conv) => total + (conv.unreadMessageCount || 0), 0);
  };

  const filteredConversations = conversations.filter((conv: Conversation) => {
    // Filter by search query
    const otherParticipant = conv.participants.find(p => p.person.id !== user?.id);
    const matchesSearch = searchQuery === '' || 
      (otherParticipant?.person.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    if (currentTab === 'unread') {
      return matchesSearch && (conv.unreadMessageCount || 0) > 0;
    } else if (currentTab === 'saved') {
      return matchesSearch && savedConversations.includes(conv.id);
    }
    
    return matchesSearch;
  });

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    socketService.markAsSeen(conversationId);
  };

  const closeConversation = () => {
    if (isMobile) {
      setActiveConversation(null);
    }
  };

  const toggleSaveConversation = (conversationId: string) => {
    let updated;
    if (savedConversations.includes(conversationId)) {
      updated = savedConversations.filter(id => id !== conversationId);
    } else {
      updated = [...savedConversations, conversationId];
    }
    
    setSavedConversations(updated);
    localStorage.setItem('saved_conversations', JSON.stringify(updated));
  };

  // Render chat sidebar (conversation list)
  const renderChatSidebar = () => (
    <div className={`chat-sidebar ${isMobile && activeConversation ? 'hidden' : ''}`}>
      <div className="chat-header">
        <h3>Chat</h3>
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={toggleChat} 
          className="close-button"
        />
      </div>

      <div className="chat-filter">
        <div className="filter-tabs">
          <span 
            className={`filter-tab ${currentTab === 'all' ? 'active' : ''}`}
            onClick={() => setCurrentTab('all')}
          >
            Tất cả
          </span>
          <span 
            className={`filter-tab ${currentTab === 'unread' ? 'active' : ''}`}
            onClick={() => setCurrentTab('unread')}
          >
            Chưa đọc
          </span>
          <span 
            className={`filter-tab ${currentTab === 'saved' ? 'active' : ''}`}
            onClick={() => setCurrentTab('saved')}
          >
            Đã Ghim
          </span>
        </div>
        <Input 
          placeholder="Tìm theo tên" 
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
            // Tìm người tham gia khác (không phải user hiện tại)
            const otherParticipant = conversation.participants.find(
              p => p.person.id !== user?.id
            );
            
            // Lấy thông tin thời gian tin nhắn cuối
            const lastMessage = conversation.messages && conversation.messages.length > 0 
              ? conversation.messages[conversation.messages.length - 1]
              : null;
              
            return (
              <div 
                key={conversation.id} 
                className={`chat-item ${activeConversation === conversation.id ? 'active' : ''} ${(conversation.unreadMessageCount || 0) > 0 ? 'unread' : ''}`}
                onClick={() => handleConversationClick(conversation.id)}
              >
                <Badge count={conversation.unreadMessageCount || 0} size="small" className="badge-notify">
                  <Avatar src={otherParticipant?.person.avatar} size={40} icon={<UserOutlined />} />
                </Badge>
                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <span className="chat-item-name">{otherParticipant?.person.name || 'Không xác định'}</span>
                    <span className="chat-item-time">
                      {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <div className="chat-item-message">
                    {lastMessage ? lastMessage.content : 'Bắt đầu cuộc trò chuyện'}
                  </div>
                </div>
                <Dropdown menu={{ 
                  items: [
                    { 
                      key: '1', 
                      label: 'Đánh dấu đã đọc',
                      onClick: (e) => {
                        e.domEvent.stopPropagation();
                        socketService.markAsSeen(conversation.id);
                      }
                    },
                    { 
                      key: '2', 
                      label: savedConversations.includes(conversation.id) ? 'Bỏ ghim' : 'Ghim trò chuyện',
                      icon: <PushpinOutlined />,
                      onClick: (e) => {
                        e.domEvent.stopPropagation();
                        toggleSaveConversation(conversation.id);
                      }
                    },
                  ] 
                }} trigger={['click']} placement="bottomRight">
                  <Button 
                    type="text" 
                    icon={<EllipsisOutlined />} 
                    onClick={(e) => e.stopPropagation()}
                    className="chat-item-more"
                    style={{ position: 'absolute', right: 8, top: 12 }}
                  />
                </Dropdown>
              </div>
            );
          })
        ) : (
          <Empty 
            description="Không tìm thấy cuộc trò chuyện nào" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        )}
      </div>
    </div>
  );

  // Render chat detail view
  const renderChatDetail = () => {
    if (!activeConversation) {
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

    const currentConversation = conversations.find(c => c.id === activeConversation);
    // Tìm người tham gia khác (không phải user hiện tại)
    const otherParticipant = currentConversation?.participants.find(
      p => p.person.id !== user?.id
    );
    
    return (
      <div className={`chat-conversation-wrapper ${isMobile && !activeConversation ? 'hidden' : ''}`}>
        <div className="chat-conversation">
          <div className="conversation-header">
            {isMobile && (
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={closeConversation}
                className="conversation-back-btn"
              />
            )}
            <div className="conversation-info">
              <span className="conversation-name">
                {otherParticipant?.person.name || 'Không xác định'}
              </span>
              <span className="conversation-status">Online</span>
            </div>
            <Dropdown menu={{ 
              items: [
                { 
                  key: '1', 
                  label: 'Đánh dấu đã đọc',
                  onClick: () => {
                    socketService.markAsSeen(activeConversation);
                  }
                },
                { 
                  key: '2', 
                  label: savedConversations.includes(activeConversation) ? 'Bỏ ghim' : 'Ghim trò chuyện',
                  onClick: () => {
                    toggleSaveConversation(activeConversation);
                  }
                }
              ] 
            }} placement="bottomRight">
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </div>

          <div className="shop-info">
            <Avatar src={otherParticipant?.person.avatar} size={40} icon={<ShopOutlined />} className="shop-avatar" />
            <div className="shop-detail">
              <div className="shop-name">{otherParticipant?.person.name || 'Không xác định'}</div>
              <div className="shop-description">Thường phản hồi trong vòng 5 phút</div>
            </div>
          </div>

          <div className="messages-container">
            {messages.length > 0 ? (
              messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.sender.personId === user?.id ? 'sent' : 'received'}`}
                >
                  {msg.sender.personId !== user?.id && (
                    <Avatar 
                      src={otherParticipant?.person.avatar} 
                      size="small"
                    />
                  )}
                  <div className="message-content">
                    <div className="message-bubble">
                      {msg.content}
                      {msg.imageUrls && msg.imageUrls.length > 0 && (
                        <div className="message-images">
                          {msg.imageUrls.map((url, idx) => (
                            <img key={idx} src={url} alt="Hình ảnh" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-messages">
                <p>Hãy bắt đầu cuộc trò chuyện</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="input-actions">
              <Tooltip title="Gửi hình ảnh">
                <Button type="text" icon={<PictureOutlined />} />
              </Tooltip>
              <Tooltip title="Chèn biểu tượng cảm xúc">
                <Button type="text" icon={<SmileOutlined />} />
              </Tooltip>
            </div>
            <Input 
              placeholder="Nhập tin nhắn..." 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              suffix={
                <Button 
                  type="text" 
                  icon={<SendOutlined />} 
                  onClick={handleSendMessage}
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

  if (!isAuthenticated) {
    return (
      <div className="chat-widget">
        <Button 
          className="chat-toggle-button"
          type="primary" 
          shape="circle" 
          icon={<MessageOutlined />} 
          onClick={toggleChat}
        />
        
        {isOpen && (
          <div className="chat-container login-required">
            <div className="chat-header">
              <h3>Chat</h3>
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={toggleChat} 
                className="close-button"
              />
            </div>
            <div className="chat-login-prompt">
              <MessageOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <p>Vui lòng đăng nhập để sử dụng tính năng chat</p>
              <Button type="primary">Đăng nhập</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main chat interface for authenticated users
  return (
    <div className="chat-widget">
      <Badge count={calculateUnreadCount(conversations)} className="badge-notify">
        <Button 
          className="chat-toggle-button"
          type="primary" 
          shape="circle" 
          icon={<MessageOutlined />} 
          onClick={toggleChat}
        />
      </Badge>

      {isOpen && (
        <div className={`chat-container ${!isMobile && activeConversation ? 'split-view' : ''}`}>
          {renderChatSidebar()}
          {(activeConversation || !isMobile) && renderChatDetail()}
        </div>
      )}
    </div>
  );
};

export default ChatWidget; 