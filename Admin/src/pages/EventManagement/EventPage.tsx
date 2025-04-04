import React, { useState } from 'react';
import { Input, Button, Table, Card, Space, Tag } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface EventData {
  userName: string;
  description: string;
  image: string;
  status: string;
  usageTime: string;
}

const EventPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const columns: ColumnsType<EventData> = [
    {
      title: 'Event Name',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
    },
    {
      title: 'Status | Usage Time',
      key: 'status',
      render: (_, record) => (
        <>
          <Tag color={record.status === 'In Progress' ? 'processing' : 'default'}>
            {record.status}
          </Tag>
          <div>{record.usageTime}</div>
        </>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="text" icon={<ExclamationCircleOutlined />} />
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  const mockData: EventData[] = [
    {
      userName: 'Nguyễn Tuấn Anh',
      description: 'Giải cầu lông được diễn ra,....',
      image: '=i&url=u-de-sports-ielts-',
      status: 'In Progress',
      usageTime: '20:00 05/12/2024 - 11:00 08/12/2024'
    },
  ];

  return (
    <div className="p-5">
      <Space className="mb-5">
        <Button type="primary">System</Button>
        <Button>Owner</Button>
      </Space>

      <div className="mb-5">
        <Input
          placeholder="Search by Event Name"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={mockData}
          pagination={{
            total: 144,
            pageSize: 10,
            showTotal: (total) => `${total} Total`,
          }}
        />
      </Card>
    </div>
  );
};

export default EventPage;