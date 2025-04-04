import React from 'react';
import { Modal, Button, Tag, Typography, Space, Divider } from 'antd';
import { Notification } from '@/types/notification.types';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface NotificationDetailModalProps {
  notification: Notification | null;
  visible: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  visible,
  onClose,
  onMarkAsRead
}) => {
  const navigate = useNavigate();
  
  if (!notification) return null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };
  
  const getTypeColor = () => {
    switch (notification.type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'processing';
    }
  };
  
  const getTypeText = () => {
    switch (notification.type) {
      case 'success':
        return 'Thành công';
      case 'error':
        return 'Lỗi';
      case 'warning':
        return 'Cảnh báo';
      default:
        return 'Thông tin';
    }
  };
  
  const handleViewDetails = () => {
    if (notification.redirectUrl) {
      if (!notification.isRead) {
        onMarkAsRead(notification.id);
      }
      onClose();
      navigate(notification.redirectUrl);
    }
  };
  
  return (
    <Modal
      title={
        <Space align="center">
          {getTypeIcon()}
          <span>Chi tiết thông báo</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        notification.redirectUrl && (
          <Button key="view" type="primary" onClick={handleViewDetails}>
            Xem chi tiết
          </Button>
        )
      ]}
      width={600}
    >
      <div className="notification-detail">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Space align="center">
              <Tag color={getTypeColor()}>{getTypeText()}</Tag>
              <Text type="secondary">
                {!notification.isRead && <span style={{ color: '#1890ff', fontWeight: 'bold', marginRight: 8 }}>[Chưa đọc]</span>}
                {formatDate(notification.createdAt)}
              </Text>
            </Space>
            
            <Title level={4} style={{ marginTop: 16 }}>
              {notification.title}
            </Title>
          </div>
          
          <Divider style={{ margin: '12px 0' }} />
          
          <Paragraph style={{ fontSize: 16 }}>
            {notification.content}
          </Paragraph>
          
          {notification.relatedType && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <div>
                <Text strong>Loại thông báo:</Text> {notification.relatedType.charAt(0).toUpperCase() + notification.relatedType.slice(1)}
                <br />
                {notification.relatedId && (
                  <>
                    <Text strong>ID tham chiếu:</Text> {notification.relatedId}
                  </>
                )}
              </div>
            </>
          )}
        </Space>
      </div>
    </Modal>
  );
};

export default NotificationDetailModal; 