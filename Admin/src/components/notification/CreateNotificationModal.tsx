import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Button, 
  message, 
  Space, 
  Switch,
  Typography,
  Divider
} from 'antd';
import { 
  InfoCircleOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { createNotification } from '@/store/slices/notificationSlice';
import { Notification } from '@/types/notification.types';

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

interface CreateNotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({ 
  visible, 
  onClose 
}) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [hasRelatedObject, setHasRelatedObject] = useState(false);
  const [hasRedirectUrl, setHasRedirectUrl] = useState(false);

  // Hàm xử lý khi submit form
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Tạo dữ liệu thông báo
      const notificationData: Omit<Notification, 'id' | 'createdAt'> = {
        userId: values.userId || 'all', // Mặc định gửi cho tất cả người dùng
        title: values.title,
        content: values.content,
        type: values.type,
        isRead: false,
      };

      // Thêm các trường tùy chọn nếu có
      if (hasRelatedObject) {
        notificationData.relatedId = values.relatedId;
        notificationData.relatedType = values.relatedType;
      }

      if (hasRedirectUrl) {
        notificationData.redirectUrl = values.redirectUrl;
      }

      // Dispatch action tạo thông báo
      const resultAction = await dispatch(createNotification(notificationData));
      
      if (createNotification.fulfilled.match(resultAction)) {
        message.success('Đã tạo thông báo thành công');
        form.resetFields();
        onClose();
      }
    } catch (error) {
      console.error('Lỗi khi tạo thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm reset form và đóng modal
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Title level={4}>
          <Space>
            <InfoCircleOutlined />
            Tạo thông báo mới
          </Space>
        </Title>
      }
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
        >
          Tạo thông báo
        </Button>
      ]}
    >
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: 'info' }}
      >
        <Form.Item
          name="userId"
          label="Người nhận"
          tooltip="Nhập ID người dùng cụ thể hoặc để trống để gửi cho tất cả người dùng"
        >
          <Input placeholder="Nhập ID người dùng hoặc để trống cho tất cả người dùng" />
        </Form.Item>

        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề thông báo' }]}
        >
          <Input placeholder="Nhập tiêu đề thông báo" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Nội dung"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung thông báo' }]}
        >
          <TextArea 
            placeholder="Nhập nội dung thông báo" 
            rows={4} 
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="Loại thông báo"
          rules={[{ required: true, message: 'Vui lòng chọn loại thông báo' }]}
        >
          <Select>
            <Option value="info">
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                Thông tin
              </Space>
            </Option>
            <Option value="success">
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                Thành công
              </Space>
            </Option>
            <Option value="warning">
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                Cảnh báo
              </Space>
            </Option>
            <Option value="error">
              <Space>
                <CloseCircleOutlined style={{ color: '#f5222d' }} />
                Lỗi
              </Space>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item label="Có đối tượng liên quan">
          <Switch 
            checked={hasRelatedObject}
            onChange={setHasRelatedObject}
          />
        </Form.Item>

        {hasRelatedObject && (
          <>
            <Form.Item
              name="relatedId"
              label="ID đối tượng liên quan"
              rules={[{ required: hasRelatedObject, message: 'Vui lòng nhập ID đối tượng liên quan' }]}
            >
              <Input placeholder="Ví dụ: facility-123, booking-456" />
            </Form.Item>

            <Form.Item
              name="relatedType"
              label="Loại đối tượng liên quan"
              rules={[{ required: hasRelatedObject, message: 'Vui lòng chọn loại đối tượng liên quan' }]}
            >
              <Select placeholder="Chọn loại đối tượng">
                <Option value="booking">Đặt sân</Option>
                <Option value="facility">Cơ sở</Option>
                <Option value="event">Sự kiện</Option>
                <Option value="voucher">Voucher</Option>
                <Option value="approval">Phê duyệt</Option>
                <Option value="payment">Thanh toán</Option>
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item label="Có URL chuyển hướng">
          <Switch 
            checked={hasRedirectUrl}
            onChange={setHasRedirectUrl}
          />
        </Form.Item>

        {hasRedirectUrl && (
          <Form.Item
            name="redirectUrl"
            label="URL chuyển hướng"
            rules={[{ required: hasRedirectUrl, message: 'Vui lòng nhập URL chuyển hướng' }]}
          >
            <Input placeholder="Ví dụ: /facilities, /bookings/123" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CreateNotificationModal; 