import { Notification, NotificationFilter, NotificationResponse } from '@/types/notification.types';
import { CURRENT_ADMIN_ID, getMockNotifications, getMockUnreadCount } from '@/mocks/notification.mock';

class NotificationService {
  // Lấy danh sách thông báo
  async getNotifications(filter: NotificationFilter = {}): Promise<NotificationResponse> {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Gọi hàm mock data
      return getMockNotifications(CURRENT_ADMIN_ID, filter);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Đánh dấu đã đọc thông báo
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Trong môi trường thực tế, đây sẽ là API call để đánh dấu đã đọc
      // Trả về thông báo đã được đánh dấu đã đọc
      const result = getMockNotifications(CURRENT_ADMIN_ID);
      
      const notification = result.notifications.find(n => n.id === notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      // Cập nhật trạng thái thông báo (chỉ trong bộ nhớ, không lưu lại)
      const updatedNotification = {...notification, isRead: true};
      return updatedNotification;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Đánh dấu tất cả thông báo là đã đọc
  async markAllAsRead(): Promise<void> {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Trong môi trường thực tế, đây sẽ là API call để đánh dấu tất cả đã đọc
      return;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Xóa thông báo
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Trong môi trường thực tế, đây sẽ là API call để xóa thông báo
      console.log(`Deleting notification ${notificationId}`);
      return;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount(): Promise<number> {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Gọi hàm mock data
      return getMockUnreadCount(CURRENT_ADMIN_ID);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Tạo thông báo mới
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Trong môi trường thực tế, đây sẽ là API call để tạo thông báo mới
      // Tạo ID và thời gian cho thông báo mới
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substring(2, 10),
        createdAt: new Date().toISOString()
      };
      
      // Trả về thông báo mới đã được tạo
      console.log('Created new notification:', newNotification);
      return newNotification;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService(); 