import React from 'react';
import { Modal, Card, Button, Typography, Row, Col } from 'antd';
import { UserOutlined, HomeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface RoleSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRole: (role: 'player' | 'owner') => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  visible,
  onClose,
  onSelectRole,
}) => {
  return (
    <Modal
      title="Chọn vai trò đăng nhập"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
    >
      <Row gutter={16} className="mt-4">
        <Col span={12}>
          <Card 
            hoverable 
            className="text-center h-full"
            onClick={() => onSelectRole('player')}
          >
            <UserOutlined className="text-4xl text-blue-500 mb-2" />
            <Title level={4}>Người chơi</Title>
            <Paragraph className="text-gray-600">
              Đặt sân, xem lịch sử đặt sân và tìm kiếm sân chơi phù hợp
            </Paragraph>
            <Button 
              type="primary" 
              icon={<UserOutlined />}
              className="mt-2 w-full"
            >
              Đăng nhập với vai trò Người Chơi
            </Button>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card 
            hoverable 
            className="text-center h-full"
            onClick={() => onSelectRole('owner')}
          >
            <HomeOutlined className="text-4xl text-green-500 mb-2" />
            <Title level={4}>Chủ sân</Title>
            <Paragraph className="text-gray-600">
              Quản lý cơ sở, xem lịch đặt và quản lý hoạt động kinh doanh
            </Paragraph>
            <Button 
              type="primary" 
              icon={<HomeOutlined />}
              className="mt-2 w-full"
              style={{ backgroundColor: '#52c41a' }}
            >
              Đăng nhập với vai trò Chủ Sân
            </Button>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default RoleSelectionModal;