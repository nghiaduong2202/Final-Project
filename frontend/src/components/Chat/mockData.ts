// Định nghĩa kiểu dữ liệu cho các cuộc trò chuyện
export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isSaved: boolean;
}

// Định nghĩa kiểu dữ liệu cho tin nhắn
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

// Dữ liệu mẫu cho danh sách cuộc trò chuyện
export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    name: 'Sân Tân Sport',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    lastMessage: 'Chào bạn, sân vẫn còn slot trống vào thứ 7 tuần này nhé',
    lastMessageTime: '2023-04-20T10:30:00Z',
    unreadCount: 2,
    isSaved: true,
  },
  {
    id: 'conv2',
    name: 'Sân bóng đá Mini Thống Nhất',
    avatar: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    lastMessage: 'Vâng, anh có thể đặt sân vào khung giờ 19h-21h',
    lastMessageTime: '2023-04-19T18:15:00Z',
    unreadCount: 0,
    isSaved: false,
  },
  {
    id: 'conv3',
    name: 'Sân tennis Phú Nhuận',
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    lastMessage: 'Dạ, sân đã được dọn dẹp xong và sẵn sàng cho buổi tối nay',
    lastMessageTime: '2023-04-18T16:45:00Z',
    unreadCount: 1,
    isSaved: false,
  },
  {
    id: 'conv4',
    name: 'CLB Bóng rổ Quận 7',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    lastMessage: 'Chúng tôi sẽ mở đăng ký vào ngày mai, bạn nhớ đặt sớm nhé',
    lastMessageTime: '2023-04-17T14:20:00Z',
    unreadCount: 0,
    isSaved: true,
  },
  {
    id: 'conv5',
    name: 'Sân cầu lông Thủ Đức',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'Cảm ơn bạn đã đặt sân, hẹn gặp lại',
    lastMessageTime: '2023-04-16T09:10:00Z',
    unreadCount: 0,
    isSaved: false,
  }
];

// Dữ liệu mẫu cho tin nhắn
export const mockMessages: Message[] = [
  // Cuộc trò chuyện 1
  {
    id: 'msg1',
    conversationId: 'conv1',
    senderId: 'facility-1',
    content: 'Chào bạn, bạn cần tìm sân vào thời gian nào ạ?',
    timestamp: '2023-04-20T10:15:00Z',
    isRead: true,
  },
  {
    id: 'msg2',
    conversationId: 'conv1',
    senderId: 'current-user',
    content: 'Chào bạn, tôi đang tìm sân cho thứ 7 tuần này, khoảng 7h tối',
    timestamp: '2023-04-20T10:20:00Z',
    isRead: true,
  },
  {
    id: 'msg3',
    conversationId: 'conv1',
    senderId: 'facility-1',
    content: 'Dạ, sân chúng tôi còn slot trống vào 7h tối thứ 7. Bạn cần đặt cho mấy người ạ?',
    timestamp: '2023-04-20T10:25:00Z',
    isRead: true,
  },
  {
    id: 'msg4',
    conversationId: 'conv1',
    senderId: 'facility-1',
    content: 'Chào bạn, sân vẫn còn slot trống vào thứ 7 tuần này nhé',
    timestamp: '2023-04-20T10:30:00Z',
    isRead: false,
  },
  
  // Cuộc trò chuyện 2
  {
    id: 'msg5',
    conversationId: 'conv2',
    senderId: 'current-user',
    content: 'Chào admin, tôi muốn hỏi về giá cả của sân vào tối thứ 6',
    timestamp: '2023-04-19T18:00:00Z',
    isRead: true,
  },
  {
    id: 'msg6',
    conversationId: 'conv2',
    senderId: 'facility-2',
    content: 'Dạ chào anh, giá sân vào tối thứ 6 là 300k/giờ. Anh có nhu cầu đặt sân không ạ?',
    timestamp: '2023-04-19T18:05:00Z',
    isRead: true,
  },
  {
    id: 'msg7',
    conversationId: 'conv2',
    senderId: 'current-user',
    content: 'Có, tôi muốn đặt sân từ 19h-21h, có được không?',
    timestamp: '2023-04-19T18:10:00Z',
    isRead: true,
  },
  {
    id: 'msg8',
    conversationId: 'conv2',
    senderId: 'facility-2',
    content: 'Vâng, anh có thể đặt sân vào khung giờ 19h-21h',
    timestamp: '2023-04-19T18:15:00Z',
    isRead: true,
  },
  
  // Cuộc trò chuyện 3
  {
    id: 'msg9',
    conversationId: 'conv3',
    senderId: 'current-user',
    content: 'Sân tôi đặt tối nay có sẵn sàng chưa?',
    timestamp: '2023-04-18T16:30:00Z',
    isRead: true,
  },
  {
    id: 'msg10',
    conversationId: 'conv3',
    senderId: 'facility-3',
    content: 'Chúng tôi đang dọn dẹp sân, sẽ sẵn sàng vào lúc 6h chiều',
    timestamp: '2023-04-18T16:35:00Z',
    isRead: true,
  },
  {
    id: 'msg11',
    conversationId: 'conv3',
    senderId: 'current-user',
    content: 'Tôi sẽ đến lúc 7h, vậy có ổn không?',
    timestamp: '2023-04-18T16:40:00Z',
    isRead: true,
  },
  {
    id: 'msg12',
    conversationId: 'conv3',
    senderId: 'facility-3',
    content: 'Dạ, sân đã được dọn dẹp xong và sẵn sàng cho buổi tối nay',
    timestamp: '2023-04-18T16:45:00Z',
    isRead: false,
  }
]; 