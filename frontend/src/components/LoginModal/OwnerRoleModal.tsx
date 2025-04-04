import React from 'react';
import { Modal, Card, Button, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface OwnerRoleModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const OwnerRoleModal: React.FC<OwnerRoleModalProps> = ({
  visible,
  onClose,
  onLogin,
}) => {
  return (
    <Modal
      title="Khu vực dành cho Chủ sân"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Card 
        className="text-center"
      >
        <HomeOutlined className="text-4xl text-green-500 mb-2" />
        <Title level={4}>Đăng nhập với vai trò Chủ sân</Title>
        <Paragraph className="text-gray-600">
          Tính năng này yêu cầu bạn đăng nhập với vai trò Chủ sân
        </Paragraph>
        <Button 
          type="primary" 
          icon={<HomeOutlined />}
          className="mt-2 w-full"
          style={{ backgroundColor: '#52c41a' }}
          onClick={onLogin}
        >
          Đăng nhập với vai trò Chủ sân
        </Button>
      </Card>
    </Modal>
  );
};

export default OwnerRoleModal;