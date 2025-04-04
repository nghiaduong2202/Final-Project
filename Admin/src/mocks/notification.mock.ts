import { Notification, NotificationFilter } from '@/types/notification.types';

// Tạo các ID ngẫu nhiên cho thông báo
const createId = () => Math.random().toString(36).substring(2, 10);

// Tạo mảng thông báo mẫu với các loại khác nhau
export const mockNotifications: Notification[] = [
  // Admin notifications
  {
    id: createId(),
    userId: 'admin-1',
    title: 'Yêu cầu phê duyệt mới',
    content: 'Có yêu cầu phê duyệt cơ sở mới từ chủ sân Trần Văn C.',
    type: 'info',
    isRead: false,
    relatedId: 'approval-xyz',
    relatedType: 'approval',
    redirectUrl: '/approvals/pending',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 phút trước
  },
  {
    id: createId(),
    userId: 'admin-1',
    title: 'Báo cáo vi phạm',
    content: 'Người dùng báo cáo nội dung không phù hợp từ cơ sở Sports Center.',
    type: 'error',
    isRead: false,
    redirectUrl: '/reports/violations',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 giờ trước
  },
  {
    id: createId(),
    userId: 'admin-1',
    title: 'Người dùng mới đăng ký',
    content: '15 người dùng mới đã đăng ký trong 24 giờ qua.',
    type: 'info',
    isRead: true,
    redirectUrl: '/users',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 ngày trước
  },
  {
    id: createId(),
    userId: 'admin-1',
    title: 'Cập nhật hệ thống',
    content: 'Hệ thống sẽ bảo trì từ 23:00 ngày 15/04/2023 đến 02:00 ngày 16/04/2023.',
    type: 'warning',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 ngày trước
  },
  {
    id: createId(),
    userId: 'admin-1',
    title: 'Báo cáo doanh thu',
    content: 'Báo cáo doanh thu quý I/2023 đã sẵn sàng để xem xét.',
    type: 'success',
    isRead: true,
    redirectUrl: '/reports/income',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 ngày trước
  },
  {
    id: createId(),
    userId: 'admin-1',
    title: 'Phê duyệt cơ sở mới',
    content: 'Cơ sở "Tennis Pro Center" cần được phê duyệt.',
    type: 'info',
    isRead: false,
    relatedId: 'facility-123',
    relatedType: 'facility',
    redirectUrl: '/facilities/approval/facility-123',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(), // 1 giờ trước
  },
  {
    id: createId(),
    userId: 'admin-1',
    title: 'Thông báo lỗi hệ thống',
    content: 'Đã phát hiện lỗi trong module thanh toán. Vui lòng kiểm tra ngay.',
    type: 'error',
    isRead: false,
    redirectUrl: '/settings/system',
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(), // 50 phút trước
  },
  {
    id: createId(),
    userId: 'admin-1',
    title: 'Chủ sân mới đăng ký',
    content: 'Có 3 chủ sân mới đăng ký trong tuần này.',
    type: 'info',
    isRead: true,
    redirectUrl: '/users?role=owner',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 ngày trước
  },
  {
    id: createId(),
    userId: 'admin-1',
    title: 'Cập nhật chính sách',
    content: 'Chính sách bảo mật đã được cập nhật. Vui lòng xem xét và phê duyệt.',
    type: 'warning',
    isRead: true,
    redirectUrl: '/settings/policies',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 ngày trước
  },
  {
    id: createId(),
    userId: 'admin-1',
    title: 'Tổng kết tuần',
    content: 'Báo cáo tổng kết tuần đã sẵn sàng để xem xét.',
    type: 'info',
    isRead: true,
    redirectUrl: '/reports/weekly',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 ngày trước
  },
];

// Hàm lấy thông báo dựa vào userId và filter
export const getMockNotifications = (userId: string, filter: NotificationFilter = {}) => {
  let notifications = mockNotifications.filter(n => n.userId === userId);
  
  if (filter.isRead !== undefined) {
    notifications = notifications.filter(n => n.isRead === filter.isRead);
  }

  if (filter.type) {
    notifications = notifications.filter(n => n.type === filter.type);
  }

  // Sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Phân trang nếu có
  if (filter.page !== undefined && filter.limit !== undefined) {
    const start = (filter.page - 1) * filter.limit;
    notifications = notifications.slice(start, start + filter.limit);
  }

  return {
    notifications,
    total: mockNotifications.filter(n => n.userId === userId).length,
    unreadCount: mockNotifications.filter(n => n.userId === userId && !n.isRead).length
  };
};

// Hàm lấy số lượng thông báo chưa đọc
export const getMockUnreadCount = (userId: string) => {
  return mockNotifications.filter(n => n.userId === userId && !n.isRead).length;
};

// Mock data cho admin hiện tại
export const CURRENT_ADMIN_ID = 'admin-1'; 