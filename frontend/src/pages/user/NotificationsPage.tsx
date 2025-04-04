import React, { useEffect, useState } from 'react';
import { List, Button, Spin, Empty, Tabs, Badge, message, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/store/slices/notificationSlice';
import { Notification } from '@/types/notification.types';
import { useNavigate } from 'react-router-dom';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useSelector((state: RootState) => state.notification);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Fetch notifications when component mounts or tab changes
    const filter = activeTab === 'unread' ? { isRead: false } : {};
    dispatch(fetchNotifications(filter));
  }, [dispatch, activeTab]);

  const handleReadNotification = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
    if (notification.redirectUrl) {
      navigate(notification.redirectUrl);
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    message.success('Đã đánh dấu tất cả thông báo là đã đọc');
  };

  const handleDeleteNotification = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteNotification(notificationId));
    message.success('Đã xóa thông báo');
  };

  const renderNotification = (notification: Notification) => {
    const notificationDate = new Date(notification.createdAt);
    const formattedDate = notificationDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Lấy màu dựa vào type
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'success': return '#52c41a';
        case 'error': return '#f5222d';
        case 'warning': return '#faad14';
        default: return '#1890ff'; // info
      }
    };

    return (
      <List.Item
        key={notification.id}
        className={`cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-4 my-2 shadow-sm border ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'border-gray-100'}`}
        onClick={() => handleReadNotification(notification)}
        actions={[
          <Button 
            key="delete" 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={(e) => handleDeleteNotification(notification.id, e)} 
            className="float-right"
          />
        ]}
      >
        <div className="flex items-start space-x-3 w-full">
          <div 
            className="w-3 h-3 mt-2 rounded-full flex-shrink-0" 
            style={{ backgroundColor: getTypeColor(notification.type) }}
          />
          <div className="flex-grow">
            <div className="flex justify-between items-start w-full">
              <h4 className={`text-lg ${!notification.isRead ? 'font-bold' : 'font-medium'}`}>
                {notification.title}
              </h4>
            </div>
            <p className="text-base text-gray-600 mt-2">{notification.content}</p>
            <p className="text-sm text-gray-400 mt-2">{formattedDate}</p>
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thông báo của tôi</h1>
        <div className="flex space-x-4">
          {unreadCount > 0 && (
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={handleMarkAllAsRead}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>

      <Divider />
      
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="mb-6"
        items={[
          {
            key: 'all',
            label: 'Tất cả thông báo',
          },
          {
            key: 'unread',
            label: (
              <span>
                Chưa đọc
                {unreadCount > 0 && <Badge count={unreadCount} className="ml-2" />}
              </span>
            ),
          },
        ]}
      />

      <div className="bg-white rounded-lg p-4">
        {isLoading ? (
          <div className="flex justify-center my-8">
            <Spin size="large" />
          </div>
        ) : notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={renderNotification}
            pagination={{
              onChange: () => {
                window.scrollTo(0, 0);
              },
              pageSize: 10,
              showSizeChanger: false,
            }}
          />
        ) : (
          <Empty 
            description={activeTab === 'unread' ? "Không có thông báo nào chưa đọc" : "Không có thông báo nào"} 
            className="py-16" 
          />
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 