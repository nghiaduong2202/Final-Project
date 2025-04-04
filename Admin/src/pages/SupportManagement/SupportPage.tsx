import React from 'react';
import { Typography, Card, Space, Button } from 'antd';
import { CustomerServiceOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SupportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f6fa] p-5">
      <Card className="text-center">
        <Space direction="vertical" size="large" className="w-full">
          <CustomerServiceOutlined style={{ fontSize: 64, color: '#1890ff' }} />
          
          <Title level={2}>
            Welcome to Support Management!
          </Title>
          
          <Text className="text-lg">
            Bắt đầu trả lời người dùng!
          </Text>

          <Button type="primary" size="large">
            Bắt đầu
          </Button>
        </Space>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-[#e6e6e6] h-[60px] flex items-center px-5">
        <div className="flex justify-between items-center w-full">
          <Text className="text-sm">
            Copyright @ 2023 Safelet. All rights reserved.
          </Text>

          <Space split={<div className="w-[1px] h-5 bg-black" />}>
            <Button type="link" className="font-bold">
              Terms of Use
            </Button>
            <Button type="link" className="font-bold">
              Privacy Policy
            </Button>
            <Text className="text-sm ml-4">
              Hand Crafted & made with Love
            </Text>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;