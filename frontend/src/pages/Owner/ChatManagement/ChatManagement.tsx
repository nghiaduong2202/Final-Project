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
import { Message, Conversation } from '@/types/chat.type';
import { useSocketService } from '@/hooks/useSocketService';
import { ChatService } from '@/services/chat.service';
import { useAppSelector } from '@/hooks/reduxHooks';
import './ChatManagement.css';

const { Title, Text } = Typography;

const ChatManagement: React.FC = () => {
  const { user } = useAppSelector(state => state.user);
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedConversations, setSavedConversations] = useState<string[]>([]);
  
  // Get socket service
  const socketService = useSocketService();
  
  // Fetch conversations when component mounts
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const conversationsData = await ChatService.getConversations();
        setConversations(conversationsData);
        
        // Get saved conversations from localStorage
        const saved = localStorage.getItem('owner_saved_conversations');
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
    const subscription = socketService.getConversations().subscribe(
      convos => {
        if (convos.length > 0) {
          setConversations(convos);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [socketService]);
  
  // Scroll to bottom when messages change or conversation is opened
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;
    
    // Mark conversation as seen when opened
    socketService.markAsSeen(activeConversation);
    
    // Subscribe to messages for this conversation
    const subscription = socketService.getMessages(activeConversation)
      .subscribe(msgs => {
        setMessages(msgs);
      });
    
    return () => subscription.unsubscribe();
  }, [activeConversation, socketService]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !activeConversation) return;
    
    socketService.sendMessage(activeConversation, currentMessage);
    setCurrentMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
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

  const getCurrentConversation = () => {
    return conversations.find(c => c.id === activeConversation);
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation?.participants.find(p => p.person.id !== user?.id);
  };

  const handleTabChange = (key: string) => {
    setCurrentTab(key);
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
                    <Badge count={conversations.filter(c => (c.unreadMessageCount || 0) > 0).length} size="small">
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
                            icon: <CheckOutlined />,
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
            {activeConversation ? (
              <div className="chat-conversation">
                <div className="conversation-header">
                  <div className="conversation-info">
                    <Avatar 
                      src={getOtherParticipant(getCurrentConversation() as Conversation)?.person.avatar} 
                      size="small" 
                      icon={<UserOutlined />}
                      className="header-avatar"
                    />
                    <div className="header-info">
                      <span className="conversation-name">
                        {getOtherParticipant(getCurrentConversation() as Conversation)?.person.name || 'Không xác định'}
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
                          if (activeConversation) {
                            socketService.markAsSeen(activeConversation);
                          }
                        }
                      },
                      { 
                        key: '2', 
                        label: savedConversations.includes(activeConversation) ? 'Bỏ ghim' : 'Ghim trò chuyện',
                        icon: <PushpinOutlined />,
                        onClick: () => {
                          if (activeConversation) {
                            toggleSaveConversation(activeConversation);
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
                    messages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`message ${msg.sender.personId === user?.id ? 'sent' : 'received'}`}
                      >
                        {msg.sender.personId !== user?.id && (
                          <Avatar 
                            src={getOtherParticipant(getCurrentConversation() as Conversation)?.person.avatar} 
                            size="small"
                            icon={<UserOutlined />}
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
                            {msg.sender.personId === user?.id && (
                              <span className="message-status">
                                {msg.sender.seen ? ' · Đã xem' : ''}
                              </span>
                            )}
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
                        onClick={handleSendMessage}
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