import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Tag, Space, Tabs, Badge, message, Popconfirm, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/store/slices/notificationSlice';
import { Notification } from '@/types/notification.types';
import { DeleteOutlined, CheckOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import NotificationDetailModal from '@/components/notification/NotificationDetailModal';
import CreateNotificationModal from '@/components/notification/CreateNotificationModal';

const { Title } = Typography;

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, total, isLoading } = useAppSelector((state) => state.notification);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    const filter = activeTab === 'unread' ? { isRead: false } : {};
    dispatch(fetchNotifications(filter));
  }, [dispatch, activeTab]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
    message.success('Đã đánh dấu thông báo là đã đọc');
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    message.success('Đã đánh dấu tất cả thông báo là đã đọc');
  };

  const handleDelete = (id: string) => {
    dispatch(deleteNotification(id));
    message.success('Đã xóa thông báo');
  };

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailModalVisible(true);
    
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedNotification(null);
  };

  const handleOpenCreateModal = () => {
    setCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
  };

  const getTagColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'processing'; // info
    }
  };

  const columns = [
    {
      title: 'Trạng thái',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 100,
      render: (isRead: boolean) => (
        isRead ? 
          <Tag color="default">Đã đọc</Tag> : 
          <Tag color="blue">Chưa đọc</Tag>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={getTagColor(type)}>
          {type === 'info' ? 'Thông tin' : 
           type === 'success' ? 'Thành công' : 
           type === 'warning' ? 'Cảnh báo' : 'Lỗi'}
        </Tag>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Notification) => (
        <span style={{ fontWeight: record.isRead ? 'normal' : 'bold' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        return formattedDate;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 240,
      render: (_: unknown, record: Notification) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
          >
            Chi tiết
          </Button>
          
          {!record.isRead && (
            <Button 
              icon={<CheckOutlined />} 
              onClick={() => handleMarkAsRead(record.id)}
            >
              Đánh dấu đã đọc
            </Button>
          )}
          
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thông báo này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: 'all',
      label: 'Tất cả thông báo',
      children: (
        <Table 
          dataSource={notifications} 
          columns={columns} 
          rowKey="id" 
          loading={isLoading} 
          pagination={{
            pageSize: 10,
            total,
            showSizeChanger: false,
            showTotal: (total) => `Tổng cộng ${total} thông báo`,
          }}
        />
      ),
    },
    {
      key: 'unread',
      label: (
        <span>
          Chưa đọc
          {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: 8 }} />}
        </span>
      ),
      children: (
        <Table 
          dataSource={notifications} 
          columns={columns} 
          rowKey="id" 
          loading={isLoading} 
          pagination={{
            pageSize: 10,
            total: unreadCount,
            showSizeChanger: false,
            showTotal: (total) => `Tổng cộng ${total} thông báo chưa đọc`,
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Quản lý thông báo</Title>
        
        <Space>
          {unreadCount > 0 && (
            <Button
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu tất cả đã đọc ({unreadCount})
            </Button>
          )}
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
          >
            Tạo thông báo mới
          </Button>
        </Space>
      </div>
      
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          type="card"
          items={items}
        />
      </Card>
      
      {/* Modal chi tiết thông báo */}
      <NotificationDetailModal
        notification={selectedNotification}
        visible={detailModalVisible}
        onClose={handleCloseDetailModal}
        onMarkAsRead={handleMarkAsRead}
      />
      
      {/* Modal tạo thông báo mới */}
      <CreateNotificationModal
        visible={createModalVisible}
        onClose={handleCloseCreateModal}
      />
    </div>
  );
};

export default NotificationsPage; 