import React, { useState, useEffect, useRef } from 'react';
import { 
  Badge, 
  Button, 
  Input, 
  Avatar, 
  Empty, 
  Dropdown, 
  Tooltip, 
  Tabs, 
  Card,
  Typography,
  Space,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  SendOutlined, 
  SmileOutlined, 
  PictureOutlined,
  PushpinOutlined,
  MoreOutlined,
  UserOutlined,
  EllipsisOutlined,
  CheckOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useChat } from '@/hooks/useChat';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import MessageBubbleOwner from './MessageBubbleOwner';
import './ChatManagement.css';
import { Participant, Conversation } from '@/types/chat.type';
import { setConversations } from '@/store/slices/chatSlice';

const { Title, Text } = Typography;

const ChatManagement: React.FC = () => {
  const { user } = useAppSelector(state => state.user);
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [savedConversations, setSavedConversations] = useState<string[]>([]);
  
  const dispatch = useAppDispatch();
  
  // Use the chat hook for shared logic with ChatWidget
  const {
    conversations,
    messages,
    isLoading,
    activeConversationId,
    isOnline,
    fetchConversations,
    handleConversationClick,
    handleSendMessage,
    getCurrentConversation,
    getOtherParticipant,
  } = useChat();
  
  // Fetch conversations when component mounts
  useEffect(() => {
    fetchConversations();
    
    // Get saved conversations from localStorage
    const saved = localStorage.getItem('owner_saved_conversations');
    if (saved) {
      setSavedConversations(JSON.parse(saved));
    }
  }, [fetchConversations]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Immediately update UI when conversation is clicked
  useEffect(() => {
    if (activeConversationId) {
      // Reset unread count in UI but only once when the activeConversationId changes
      const updatedConversations = conversations.map(conv => {
        if (conv.id === activeConversationId && conv.unreadMessageCount > 0) {
          return {
            ...conv,
            unreadMessageCount: 0
          };
        }
        return conv;
      });
      
      // Only dispatch if there's an actual change to prevent infinite loops
      if (conversations.some(conv => conv.id === activeConversationId && conv.unreadMessageCount > 0)) {
        dispatch(setConversations(updatedConversations));
      }
    }
  }, [activeConversationId]); // Remove conversations and dispatch from dependencies

  const handleSendClick = () => {
    if (!currentMessage.trim() || !activeConversationId) return;
    
    handleSendMessage(currentMessage);
    setCurrentMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    // Filter by search query
    const otherParticipant = getOtherParticipant(conv);
    const matchesSearch = searchQuery === '' || 
      (otherParticipant?.person.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    if (currentTab === 'unread') {
      // Kiểm tra tin nhắn cuối cùng
      const lastMessage = conv.messages?.[conv.messages.length - 1];
      // Chỉ tính tin nhắn chưa đọc nếu tin nhắn cuối cùng KHÔNG phải do người dùng hiện tại gửi
      const isLastMessageFromCurrentUser = lastMessage && lastMessage.sender.id === user?.id;
      const hasUnreadMessages = !isLastMessageFromCurrentUser && (conv.unreadMessageCount || 0) > 0;
      return matchesSearch && hasUnreadMessages;
    } else if (currentTab === 'saved') {
      return matchesSearch && savedConversations.includes(conv.id);
    }
    
    return matchesSearch;
  });

  const toggleSaveConversation = (conversationId: string) => {
    let updated;
    if (savedConversations.includes(conversationId)) {
      updated = savedConversations.filter(id => id !== conversationId);
    } else {
      updated = [...savedConversations, conversationId];
    }
    
    setSavedConversations(updated);
    localStorage.setItem('owner_saved_conversations', JSON.stringify(updated));
  };

  const handleTabChange = (key: string) => {
    setCurrentTab(key);
  };

  // Hàm an toàn để lấy thông tin người tham gia
  const getSafeOtherParticipant = (conversation: Conversation | undefined): Participant | undefined => {
    if (!conversation) return undefined;
    const participant = getOtherParticipant(conversation);
    return participant || undefined;
  };

  return (
    <div className="chat-management-container">
      <Card className="chat-management-card">
        <Title level={4}>Quản lý tin nhắn</Title>
        <Text type="secondary" className="subtitle">
          Quản lý tất cả các cuộc trò chuyện với khách hàng của bạn
        </Text>
        
        <div className="chat-dashboard">
          <div className="chat-sidebar">
            <Tabs 
              activeKey={currentTab} 
              onChange={handleTabChange}
              className="chat-tabs"
              items={[
                {
                  key: 'all',
                  label: 'Tất cả',
                  children: null
                },
                {
                  key: 'unread',
                  label: (
                    <Badge count={conversations.reduce((total, conv) => {
                      // Kiểm tra tin nhắn cuối cùng
                      const lastMessage = conv.messages?.[conv.messages.length - 1];
                      // Chỉ tính tin nhắn chưa đọc nếu tin nhắn cuối cùng KHÔNG phải do người dùng hiện tại gửi
                      const isLastMessageFromCurrentUser = lastMessage && lastMessage.sender.id === user?.id;
                      const unreadCount = !isLastMessageFromCurrentUser ? (conv.unreadMessageCount || 0) : 0;
                      return total + unreadCount;
                    }, 0)} size="small">
                      Chưa đọc
                    </Badge>
                  ),
                  children: null
                },
                {
                  key: 'saved',
                  label: 'Đã ghim',
                  children: null
                }
              ]}
            />
            
            <div className="chat-filter">
              <Input 
                placeholder="Tìm kiếm theo tên khách hàng" 
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="chat-list">
              {isLoading ? (
                <div className="loading-container">
                  <Spin size="large" />
                  <p className="mt-3">Đang tải dữ liệu...</p>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map(conversation => {
                  const otherParticipant = getOtherParticipant(conversation);
                  // Lấy thông tin thời gian tin nhắn cuối
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
                        <Avatar src={otherParticipant?.person?.avatarUrl || ''} size={40} icon={<UserOutlined />} />
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
                      <Dropdown menu={{ 
                        items: [
                          { 
                            key: '1', 
                            label: 'Đánh dấu đã đọc',
                            icon: <CheckOutlined />,
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                              handleConversationClick(conversation.id);
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
                          }
                        ] 
                      }} trigger={['click']} placement="bottomRight">
                        <Button 
                          type="text" 
                          icon={<EllipsisOutlined />} 
                          onClick={(e) => e.stopPropagation()}
                          className="chat-item-more"
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

          <div className="chat-conversation-wrapper">
            {activeConversationId ? (
              <div className="chat-conversation">
                <div className="conversation-header">
                  <div className="conversation-info">
                    <Avatar 
                      src={getSafeOtherParticipant(getCurrentConversation())?.person.avatarUrl || ''} 
                      size="small" 
                      icon={<UserOutlined />}
                      className="header-avatar"
                    />
                    <div className="header-info">
                      <span className="conversation-name">
                        {getSafeOtherParticipant(getCurrentConversation())?.person.name || 'Không xác định'}
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
                        icon: <CheckOutlined />,
                        onClick: () => {
                          if (activeConversationId) {
                            handleConversationClick(activeConversationId);
                          }
                        }
                      },
                      { 
                        key: '2', 
                        label: savedConversations.includes(activeConversationId) ? 'Bỏ ghim' : 'Ghim trò chuyện',
                        icon: <PushpinOutlined />,
                        onClick: () => {
                          if (activeConversationId) {
                            toggleSaveConversation(activeConversationId);
                          }
                        }
                      }
                    ] 
                  }} placement="bottomRight">
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>

                <div className="messages-container">
                  {messages.length > 0 ? (
                    <div className="messages-list">
                      {(() => {
                        let lastDate = '';
                        return messages.map((msg, index) => {
                          const messageDate = new Date(msg.createdAt).toLocaleDateString();
                          let dateHeader = null;
                          
                          if (messageDate !== lastDate) {
                            lastDate = messageDate;
                            const today = new Date().toLocaleDateString();
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            
                            let displayDate = messageDate;
                            if (messageDate === today) {
                              displayDate = 'Hôm nay';
                            } else if (messageDate === yesterday.toLocaleDateString()) {
                              displayDate = 'Hôm qua';
                            }
                            
                            dateHeader = (
                              <div key={`date-${index}`} className="messages-date-divider">
                                <span>{displayDate}</span>
                              </div>
                            );
                          }
                          
                          return (
                            <React.Fragment key={`msg-group-${index}`}>
                              {dateHeader}
                              <MessageBubbleOwner
                                key={msg.id}
                                message={msg}
                                isOwnMessage={msg.sender.id === user?.id}
                                otherParticipant={getSafeOtherParticipant(getCurrentConversation())}
                              />
                            </React.Fragment>
                          );
                        });
                      })()}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="empty-messages">
                      <p>Hãy bắt đầu cuộc trò chuyện</p>
                    </div>
                  )}
                </div>

                <div className="chat-input-container">
                  <Space className="input-actions">
                    <Tooltip title="Gửi hình ảnh">
                      <Button type="text" icon={<PictureOutlined />} />
                    </Tooltip>
                    <Tooltip title="Chèn biểu tượng cảm xúc">
                      <Button type="text" icon={<SmileOutlined />} />
                    </Tooltip>
                  </Space>
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
            ) : (
              <div className="empty-conversation">
                <ShopOutlined className="empty-icon" />
                <p>Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatManagement; 