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
import { mockConversations, mockMessages, Conversation, Message } from "./mockData";
import './ChatWidget.css';

const ChatWidget: React.FC = () => {
  const { isAuthenticated } = useAppSelector(state => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all' | 'unread' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Scroll to bottom when messages change or conversation is opened
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !activeConversation) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation,
      senderId: 'current-user', // ID của người dùng hiện tại
      content: currentMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
    };
    
    setMessages([...messages, newMessage]);
    setCurrentMessage('');
    
    // Update conversation's last message
    setConversations(prev => prev.map((conv: Conversation) => 
      conv.id === activeConversation 
        ? { ...conv, lastMessage: currentMessage, lastMessageTime: new Date().toISOString() } 
        : conv
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((conv: Conversation) => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    if (currentTab === 'unread') {
      return matchesSearch && conv.unreadCount > 0;
    } else if (currentTab === 'saved') {
      return matchesSearch && conv.isSaved;
    }
    
    return matchesSearch;
  });

  const conversationMessages = messages.filter((msg: Message) => 
    msg.conversationId === activeConversation
  );

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map((conv: Conversation) => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 } 
        : conv
    ));

    setMessages(prev => prev.map((msg: Message) => 
      msg.conversationId === conversationId 
        ? { ...msg, isRead: true } 
        : msg
    ));
  };

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    markAsRead(conversationId);
  };

  const closeConversation = () => {
    if (isMobile) {
      setActiveConversation(null);
    }
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
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => (
            <div 
              key={conversation.id} 
              className={`chat-item ${activeConversation === conversation.id ? 'active' : ''} ${conversation.unreadCount > 0 ? 'unread' : ''}`}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <Badge count={conversation.unreadCount} size="small" className="badge-notify">
                <Avatar src={conversation.avatar} size={40} icon={<UserOutlined />} />
              </Badge>
              <div className="chat-item-content">
                <div className="chat-item-header">
                  <span className="chat-item-name">{conversation.name}</span>
                  <span className="chat-item-time">
                    {new Date(conversation.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="chat-item-message">
                  {conversation.lastMessage}
                </div>
              </div>
              <Dropdown menu={{ 
                items: [
                  { 
                    key: '1', 
                    label: 'Đánh dấu đã đọc',
                    onClick: () => markAsRead(conversation.id)
                  },
                  { 
                    key: '2', 
                    label: conversation.isSaved ? 'Bỏ ghim' : 'Ghim trò chuyện',
                    icon: <PushpinOutlined />,
                    onClick: () => {
                      setConversations(prev => prev.map((conv: Conversation) => 
                        conv.id === conversation.id 
                          ? { ...conv, isSaved: !conv.isSaved } 
                          : conv
                      ));
                    }
                  },
                  { 
                    key: '3', 
                    label: 'Xóa trò chuyện',
                    danger: true,
                    onClick: () => {
                      setConversations(prev => 
                        prev.filter((conv: Conversation) => conv.id !== conversation.id)
                      );
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
          ))
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
                {currentConversation?.name}
              </span>
              <span className="conversation-status">Online</span>
            </div>
            <Dropdown menu={{ 
              items: [
                { key: '1', label: 'Đánh dấu chưa đọc' },
                { key: '2', label: 'Lưu trò chuyện' },
                { key: '3', label: 'Xóa trò chuyện' },
              ] 
            }} placement="bottomRight">
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </div>

          <div className="shop-info">
            <Avatar src={currentConversation?.avatar} size={40} icon={<ShopOutlined />} className="shop-avatar" />
            <div className="shop-detail">
              <div className="shop-name">{currentConversation?.name}</div>
              <div className="shop-description">Thường phản hồi trong vòng 5 phút</div>
            </div>
          </div>

          <div className="messages-container">
            {conversationMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`message ${msg.senderId === 'current-user' ? 'sent' : 'received'}`}
              >
                {msg.senderId !== 'current-user' && (
                  <Avatar 
                    src={currentConversation?.avatar} 
                    size="small"
                  />
                )}
                <div className="message-content">
                  <div className="message-bubble">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
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
      <Badge count={conversations.reduce((acc: number, conv: Conversation) => acc + conv.unreadCount, 0)} className="badge-notify">
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