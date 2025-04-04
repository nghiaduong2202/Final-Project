import { Notification, NotificationFilter } from '@/types/notification.types';

// Tạo các ID ngẫu nhiên cho thông báo
const createId = () => Math.random().toString(36).substring(2, 10);

// Tạo mảng thông báo mẫu với các loại khác nhau
export const mockNotifications: Notification[] = [
  // Player notifications
  {
    id: createId(),
    userId: 'user-1',
    title: 'Đặt sân thành công',
    content: 'Bạn đã đặt sân Tennis số 3 thành công vào ngày 15/04/2023, 15:00-17:00',
    type: 'success',
    isRead: false,
    relatedId: 'booking-123',
    relatedType: 'booking',
    redirectUrl: '/user/booking/details/booking-123',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(), // 25 phút trước
  },
  {
    id: createId(),
    userId: 'user-1',
    title: 'Voucher mới',
    content: 'Bạn nhận được voucher giảm 20% khi đặt sân vào cuối tuần.',
    type: 'info',
    isRead: false,
    relatedId: 'voucher-456',
    relatedType: 'voucher',
    redirectUrl: '/user/vouchers',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 giờ trước
  },
  {
    id: createId(),
    userId: 'user-1',
    title: 'Nhắc nhở lịch đặt sân',
    content: 'Bạn có lịch đặt sân Tennis số 5 vào ngày mai lúc 9:00-11:00',
    type: 'info',
    isRead: true,
    relatedId: 'booking-234',
    relatedType: 'booking',
    redirectUrl: '/user/booking/details/booking-234',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 ngày trước
  },
  {
    id: createId(),
    userId: 'user-1',
    title: 'Sự kiện gần bạn',
    content: 'Giải đấu Tennis mùa hè sẽ diễn ra tại sân Thống Nhất từ ngày 20/04/2023.',
    type: 'info',
    isRead: true,
    relatedId: 'event-789',
    relatedType: 'event',
    redirectUrl: '/user/events/event-789',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 ngày trước
  },
  {
    id: createId(),
    userId: 'user-1',
    title: 'Thanh toán thành công',
    content: 'Bạn đã thanh toán thành công 300.000 VNĐ cho đơn đặt sân Tennis số 3.',
    type: 'success',
    isRead: true,
    relatedId: 'payment-567',
    relatedType: 'payment',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 ngày trước
  },
  
  // Owner notifications
  {
    id: createId(),
    userId: 'owner-1',
    title: 'Đơn đặt sân mới',
    content: 'Nguyễn Văn A đã đặt sân Tennis số 3 vào ngày 15/04/2023.',
    type: 'info',
    isRead: false,
    relatedId: 'booking-123',
    relatedType: 'booking',
    redirectUrl: '/owner/bookings/details/booking-123',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 phút trước
  },
  {
    id: createId(),
    userId: 'owner-1',
    title: 'Phê duyệt cơ sở thành công',
    content: 'Cơ sở Tennis Center của bạn đã được Admin phê duyệt.',
    type: 'success',
    isRead: false,
    relatedId: 'facility-abc',
    relatedType: 'facility',
    redirectUrl: '/owner/facilities/facility-abc',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 giờ trước
  },
  {
    id: createId(),
    userId: 'owner-1',
    title: 'Đánh giá mới',
    content: 'Cơ sở của bạn vừa nhận được đánh giá 5 sao từ Nguyễn Văn B.',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 ngày trước
  },
  {
    id: createId(),
    userId: 'owner-1',
    title: 'Cảnh báo cập nhật thông tin',
    content: 'Vui lòng cập nhật thông tin ngân hàng để nhận thanh toán.',
    type: 'warning',
    isRead: true,
    redirectUrl: '/owner/profile',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 ngày trước
  },
  {
    id: createId(),
    userId: 'owner-1',
    title: 'Doanh thu tháng',
    content: 'Doanh thu tháng 3/2023 của bạn là 12.500.000 VNĐ.',
    type: 'info',
    isRead: true,
    redirectUrl: '/owner/revenue',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 ngày trước
  },
  
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

// Mock data cho user, owner và admin hiện tại
export const CURRENT_USER_ID = {
  player: 'user-1',
  owner: 'owner-1',
  admin: 'admin-1'
}; 