import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '@/services/notification.service';
import { Notification, NotificationFilter } from '@/types/notification.types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  isLoading: false,
  error: null,
};

// Async thunks for notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (filter: NotificationFilter = {}, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications(filter);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Không thể tải thông báo';
      return rejectWithValue(errorMsg);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      return await notificationService.markAsRead(notificationId);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Không thể đánh dấu đã đọc';
      return rejectWithValue(errorMsg);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Không thể đánh dấu tất cả đã đọc';
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Không thể xóa thông báo';
      return rejectWithValue(errorMsg);
    }
  }
);

export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notification: Omit<Notification, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      return await notificationService.createNotification(notification);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Không thể tạo thông báo';
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Không thể tải số lượng thông báo chưa đọc';
      return rejectWithValue(errorMsg);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload.notifications;
      state.total = action.payload.total;
      state.unreadCount = action.payload.unreadCount;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Mark as read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
        if (state.unreadCount > 0) state.unreadCount -= 1;
      }
    });

    // Mark all as read
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    });

    // Delete notification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const deletedNotification = state.notifications.find(n => n.id === action.payload);
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      if (deletedNotification && !deletedNotification.isRead && state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
      state.total -= 1;
    });

    // Create notification
    builder.addCase(createNotification.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createNotification.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications.unshift(action.payload); // Thêm vào đầu danh sách
      state.total += 1;
      // Nếu là thông báo chưa đọc thì tăng số lượng
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    });
    builder.addCase(createNotification.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch unread count
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
  },
});

export const { clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer; 