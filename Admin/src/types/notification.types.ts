export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  relatedId?: string; // ID của đối tượng liên quan (đặt sân, sự kiện...)
  relatedType?: 'booking' | 'facility' | 'event' | 'voucher' | 'approval' | 'payment';
  redirectUrl?: string; // URL để chuyển đến khi click vào thông báo
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface NotificationFilter {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
} 