import React, { useEffect, useState } from 'react';
import { List, Button, Spin, Empty, Tabs, Badge, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/store/slices/notificationSlice';
import { Notification } from '@/types/notification.types';
import { useNavigate } from 'react-router-dom';
import { CheckOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import NotificationDetailModal from './NotificationDetailModal';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useSelector((state: RootState) => state.notification);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const filter = activeTab === 'unread' ? { isRead: false } : {};
    dispatch(fetchNotifications(filter));
  }, [dispatch, activeTab]);

  const handleReadNotification = (notification: Notification) => {
    // Hiển thị popup chi tiết thay vì chuyển hướng ngay lập tức
    setSelectedNotification(notification);
    setModalVisible(true);
    
    // Đánh dấu là đã đọc nếu chưa đọc
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
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

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
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
        className={`cursor-pointer hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
        onClick={() => handleReadNotification(notification)}
        actions={[
          <Button 
            key="view" 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              handleReadNotification(notification);
            }} 
          />,
          <Button 
            key="delete" 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={(e) => handleDeleteNotification(notification.id, e)} 
          />
        ]}
      >
        <div className="flex items-start space-x-2 w-full">
          <div 
            className="w-2 h-2 mt-2 rounded-full flex-shrink-0" 
            style={{ backgroundColor: getTypeColor(notification.type) }}
          />
          <div className="flex-grow">
            <div className="flex justify-between items-start w-full">
              <h4 className={`text-base ${!notification.isRead ? 'font-bold' : 'font-medium'}`}>
                {notification.title}
              </h4>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.content}</p>
            <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg border w-80 sm:w-96 max-h-[70vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Thông báo</h3>
          {unreadCount > 0 && (
            <Button 
              type="text" 
              icon={<CheckOutlined />} 
              onClick={handleMarkAllAsRead}
              className="text-blue-500 hover:text-blue-700"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="px-4 pt-2"
          items={[
            {
              key: 'all',
              label: 'Tất cả',
              children: (
                <div className="overflow-y-auto max-h-[50vh]">
                  {isLoading ? (
                    <div className="flex justify-center my-4">
                      <Spin />
                    </div>
                  ) : notifications.length > 0 ? (
                    <List
                      dataSource={notifications}
                      renderItem={renderNotification}
                      className="divide-y"
                    />
                  ) : (
                    <Empty 
                      description="Không có thông báo nào" 
                      className="py-8" 
                    />
                  )}
                </div>
              ),
            },
            {
              key: 'unread',
              label: (
                <span>
                  Chưa đọc
                  {unreadCount > 0 && <Badge count={unreadCount} size="small" className="ml-1" />}
                </span>
              ),
              children: (
                <div className="overflow-y-auto max-h-[50vh]">
                  {isLoading ? (
                    <div className="flex justify-center my-4">
                      <Spin />
                    </div>
                  ) : notifications.length > 0 ? (
                    <List
                      dataSource={notifications}
                      renderItem={renderNotification}
                      className="divide-y"
                    />
                  ) : (
                    <Empty 
                      description="Không có thông báo nào chưa đọc" 
                      className="py-8" 
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
        
        <div className="p-3 border-t text-center">
          <Button 
            type="link" 
            onClick={() => {
              onClose();
              navigate('/user/notifications');
            }}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      </div>
      
      <NotificationDetailModal
        notification={selectedNotification}
        visible={modalVisible}
        onClose={handleCloseModal}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
};

export default NotificationPanel; 