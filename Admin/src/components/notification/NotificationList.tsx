import React, { useEffect, useState } from 'react';
import { List, Button, Spin, Empty, Tabs, Badge, message } from 'antd';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { RootState } from '@/store';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/store/slices/notificationSlice';
import { Notification } from '@/types/notification.types';
import { useNavigate } from 'react-router-dom';
import { CheckOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import NotificationDetailModal from './NotificationDetailModal';

interface NotificationListProps {
  onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useAppSelector((state: RootState) => state.notification);
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

  const renderNotification = (item: Notification) => {
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Màu sắc dựa trên loại thông báo
    const typeColors = {
      info: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
    };

    return (
      <List.Item
        className={`cursor-pointer hover:bg-gray-100 ${!item.isRead ? 'bg-blue-50' : ''}`}
        onClick={() => handleReadNotification(item)}
        actions={[
          <Button
            key="view"
            type="text"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleReadNotification(item);
            }}
          />,
          <Button
            key="delete"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => handleDeleteNotification(item.id, e)}
          />
        ]}
      >
        <List.Item.Meta
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: typeColors[item.type as keyof typeof typeColors] || typeColors.info,
                  marginRight: 8 
                }} 
              />
              <span style={{ fontWeight: item.isRead ? 'normal' : 'bold' }}>
                {item.title}
              </span>
            </div>
          }
          description={
            <div>
              <p style={{ margin: '4px 0', maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.content}
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>{formattedDate}</p>
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <>
      <div style={{ width: 360, maxHeight: '70vh', background: '#fff', boxShadow: '0 3px 6px rgba(0,0,0,0.1)', borderRadius: 4 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 'bold' }}>Thông báo</h3>
          {unreadCount > 0 && (
            <Button 
              type="link" 
              size="small" 
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: 'Tất cả',
              children: (
                <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0 8px' }}>
                  {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                      <Spin />
                    </div>
                  ) : notifications.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo" style={{ margin: '20px 0' }} />
                  ) : (
                    <List
                      dataSource={notifications}
                      renderItem={renderNotification}
                      split
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
                  {unreadCount > 0 && <Badge count={unreadCount} size="small" style={{ marginLeft: 5 }} />}
                </span>
              ),
              children: (
                <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0 8px' }}>
                  {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                      <Spin />
                    </div>
                  ) : notifications.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo chưa đọc" style={{ margin: '20px 0' }} />
                  ) : (
                    <List
                      dataSource={notifications}
                      renderItem={renderNotification}
                      split
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
        
        <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
          <Button type="link" onClick={() => { onClose(); navigate('/notifications'); }}>
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

export default NotificationList; 