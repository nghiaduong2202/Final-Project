import React from 'react';
import { Modal, Card, Button, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface PlayerRoleModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const PlayerRoleModal: React.FC<PlayerRoleModalProps> = ({
  visible,
  onClose,
  onLogin,
}) => {
  return (
    <Modal
      title="Khu vực dành cho Người chơi"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Card 
        className="text-center"
      >
        <UserOutlined className="text-4xl text-blue-500 mb-2" />
        <Title level={4}>Đăng nhập với vai trò Người chơi</Title>
        <Paragraph className="text-gray-600">
          Tính năng này yêu cầu bạn đăng nhập với vai trò Người chơi
        </Paragraph>
        <Button 
          type="primary" 
          icon={<UserOutlined />}
          className="mt-2 w-full"
          onClick={onLogin}
        >
          Đăng nhập với vai trò Người chơi
        </Button>
      </Card>
    </Modal>
  );
};

export default PlayerRoleModal;