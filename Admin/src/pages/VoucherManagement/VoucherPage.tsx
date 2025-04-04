import React, { useState } from 'react';
import { Input, Button, Space, Table, Card, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface VoucherData {
  name: string;
  code: string;
  discountPercentage: string;
  amount: string;
  remain: string;
  maxDiscount: string;
  minPrice: string;
  status: string;
  usageTime: string;
}

const VoucherPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const columns: ColumnsType<VoucherData> = [
    {
      title: 'Voucher Name | Code',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <>
          <div>{record.name}</div>
          <div>{record.code}</div>
        </>
      ),
    },
    {
      title: 'Discount',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Remain',
      dataIndex: 'remain',
      key: 'remain',
    },
    {
      title: 'Max Discount',
      dataIndex: 'maxDiscount',
      key: 'maxDiscount',
    },
    {
      title: 'Min Price',
      dataIndex: 'minPrice',
      key: 'minPrice',
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
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<StopOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  const mockData: VoucherData[] = [
    {
      name: 'Nguyễn Tuấn Anh',
      code: 'TA2607',
      discountPercentage: '10%',
      amount: '100',
      remain: '30',
      maxDiscount: '200.000đ',
      minPrice: '300.000đ',
      status: 'In Progress',
      usageTime: '20:00 05/12/2024 - 11:00 08/12/2024'
    },
  ];

  return (
    <div className="p-5">
      <div className="mb-5 flex justify-between items-center">
        <Input
          placeholder="Search by Voucher Name/Code"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />}>
          Create Voucher
        </Button>
      </div>

      <Space className="mb-5">
        <Button>All</Button>
        <Button>In Progress</Button>
        <Button>Coming Soon</Button>
        <Button>Finished</Button>
      </Space>

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

export default VoucherPage;