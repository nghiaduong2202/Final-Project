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
  Space
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
  DeleteOutlined,
  CheckOutlined,
  ShopOutlined
} from '@ant-design/icons';
import './ChatManagement.css';

const { Title, Text } = Typography;

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isSaved: boolean;
  facility?: string;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Nguyễn Tuấn Anh',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'Tôi muốn đặt sân ngày mai có được không?',
    lastMessageTime: '2023-07-10T14:30:00',
    unreadCount: 3,
    isSaved: true,
    facility: 'Sân bóng đá Mini 5v5'
  },
  {
    id: '2',
    name: 'Trần Thị Hoa',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage: 'Sân có mở cửa vào chủ nhật không?',
    lastMessageTime: '2023-07-09T18:45:00',
    unreadCount: 0,
    isSaved: false,
    facility: 'Sân cầu lông số 3'
  },
  {
    id: '3',
    name: 'Phạm Văn Đức',
    avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    lastMessage: 'Cảm ơn bạn đã hỗ trợ!',
    lastMessageTime: '2023-07-08T09:15:00',
    unreadCount: 0,
    isSaved: false,
    facility: 'Sân bóng đá 7v7'
  },
  {
    id: '4',
    name: 'Lê Minh Tâm',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    lastMessage: 'Tôi sẽ đến vào lúc 7h tối',
    lastMessageTime: '2023-07-07T20:30:00',
    unreadCount: 1,
    isSaved: true,
    facility: 'Sân cầu lông số 1'
  },
  {
    id: '5',
    name: 'Hoàng Quốc Bảo',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    lastMessage: 'Giá thuê sân trong bao lâu vậy?',
    lastMessageTime: '2023-07-06T15:20:00',
    unreadCount: 0,
    isSaved: false,
    facility: 'Sân bóng rổ'
  }
];

const mockMessages: Message[] = [
  {
    id: 'm1',
    conversationId: '1',
    senderId: 'customer',
    content: 'Xin chào! Tôi muốn đặt sân ngày mai, cụ thể là sân bóng đá Mini 5v5 từ 18h-20h có được không?',
    timestamp: '2023-07-10T14:30:00',
    isRead: false
  },
  {
    id: 'm2',
    conversationId: '1',
    senderId: 'owner',
    content: 'Chào bạn! Cảm ơn bạn đã liên hệ với chúng tôi. Để mình kiểm tra lịch đặt sân ngay.',
    timestamp: '2023-07-10T14:35:00',
    isRead: true
  },
  {
    id: 'm3',
    conversationId: '1',
    senderId: 'owner',
    content: 'Sân bóng đá Mini 5v5 vào ngày mai từ 18h-20h vẫn còn trống. Bạn có muốn đặt luôn không?',
    timestamp: '2023-07-10T14:38:00',
    isRead: true
  },
  {
    id: 'm4',
    conversationId: '1',
    senderId: 'customer',
    content: 'Tốt quá! Vâng, tôi muốn đặt ngay. Giá thuê sân là bao nhiêu vậy?',
    timestamp: '2023-07-10T14:40:00',
    isRead: false
  },
  {
    id: 'm5',
    conversationId: '1',
    senderId: 'customer',
    content: 'Và tôi có thể thanh toán qua hình thức nào?',
    timestamp: '2023-07-10T14:41:00',
    isRead: false
  },
  {
    id: 'm6',
    conversationId: '2',
    senderId: 'customer',
    content: 'Xin chào, sân có mở cửa vào chủ nhật không?',
    timestamp: '2023-07-09T18:45:00',
    isRead: true
  },
  {
    id: 'm7',
    conversationId: '2',
    senderId: 'owner',
    content: 'Chào bạn, sân chúng tôi mở cửa tất cả các ngày trong tuần từ 6h sáng đến 22h tối.',
    timestamp: '2023-07-09T18:50:00',
    isRead: true
  },
  {
    id: 'm8',
    conversationId: '4',
    senderId: 'customer',
    content: 'Tôi đã đặt sân cầu lông số 1 vào tối nay. Tôi sẽ đến vào lúc 7h tối.',
    timestamp: '2023-07-07T20:30:00',
    isRead: false
  }
];

const ChatManagement: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change or conversation is opened
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !activeConversation) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation,
      senderId: 'owner',
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

  const getCurrentConversation = () => {
    return conversations.find(c => c.id === activeConversation);
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
                    <Badge count={conversations.filter(c => c.unreadCount > 0).length} size="small">
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
                      <div className="chat-item-facility">{conversation.facility}</div>
                      <div className="chat-item-message">
                        {conversation.lastMessage}
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
                            markAsRead(conversation.id);
                          }
                        },
                        { 
                          key: '2', 
                          label: conversation.isSaved ? 'Bỏ ghim' : 'Ghim trò chuyện',
                          icon: <PushpinOutlined />,
                          onClick: (e) => {
                            e.domEvent.stopPropagation();
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
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: (e) => {
                            e.domEvent.stopPropagation();
                            setConversations(prev => 
                              prev.filter((conv: Conversation) => conv.id !== conversation.id)
                            );
                            if (activeConversation === conversation.id) {
                              setActiveConversation(null);
                            }
                          }
                        },
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
                ))
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
                      src={getCurrentConversation()?.avatar} 
                      size="small" 
                      icon={<UserOutlined />}
                      className="header-avatar"
                    />
                    <div className="header-info">
                      <span className="conversation-name">
                        {getCurrentConversation()?.name}
                      </span>
                      <span className="conversation-facility">
                        {getCurrentConversation()?.facility}
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
                            markAsRead(activeConversation);
                          }
                        }
                      },
                      { 
                        key: '2', 
                        label: getCurrentConversation()?.isSaved ? 'Bỏ ghim' : 'Ghim trò chuyện',
                        icon: <PushpinOutlined />,
                        onClick: () => {
                          if (activeConversation) {
                            setConversations(prev => prev.map((conv: Conversation) => 
                              conv.id === activeConversation 
                                ? { ...conv, isSaved: !conv.isSaved } 
                                : conv
                            ));
                          }
                        }
                      },
                      { 
                        key: '3', 
                        label: 'Xóa trò chuyện',
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => {
                          if (activeConversation) {
                            setConversations(prev => 
                              prev.filter((conv: Conversation) => conv.id !== activeConversation)
                            );
                            setActiveConversation(null);
                          }
                        }
                      },
                    ] 
                  }} placement="bottomRight">
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>

                <div className="messages-container">
                  {conversationMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`message ${msg.senderId === 'owner' ? 'sent' : 'received'}`}
                    >
                      {msg.senderId !== 'owner' && (
                        <Avatar 
                          src={getCurrentConversation()?.avatar} 
                          size="small"
                          icon={<UserOutlined />}
                        />
                      )}
                      <div className="message-content">
                        <div className="message-bubble">{msg.content}</div>
                        <div className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {msg.senderId === 'owner' && (
                            <span className="message-status">
                              {msg.isRead ? ' · Đã xem' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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