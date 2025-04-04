import React, { useState } from 'react';
import { Input, Button, Space, Table, Card, Select, message, Popconfirm } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface ServiceData {
    id: string;
    serviceName: string;
    ownerName: string;
    facilityName: string;
    createdAt: string;
    typeSport: string;
    status: number;
    price: string;
}

const defaultData: ServiceData[] = [
  {
    id: '0001',
    serviceName: 'Tennis',
    ownerName: 'Nguyễn Tuấn Anh',
    facilityName: 'Nguyễn Tuấn Anh',
    createdAt: '14/07/2024',
    typeSport: 'Tennis',
    status: 20,
    price: '200.000đ'
  },
  {
    id: '0002',
    serviceName: 'Football',
    ownerName: 'Dương Văn Nghĩa',
    facilityName: 'Nguyễn Tuấn Anh',
    createdAt: '14/07/2024',
    typeSport: 'Football', 
    status: 20,
    price: '200.000đ'
  },
];

const ServicePage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const handleDelete = (id: string) => {
    message.success('Xóa dịch vụ thành công');
  };

  const columns: ColumnsType<ServiceData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: 'Chủ sở hữu',
      dataIndex: 'ownerName',
      key: 'ownerName',
    },
    {
      title: 'Cơ sở',
      dataIndex: 'facilityName',
      key: 'facilityName',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Loại thể thao',
      dataIndex: 'typeSport',
      key: 'typeSport',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} />
          <Popconfirm
            title="Bạn có chắc muốn xóa dịch vụ này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleReset = () => {
    setFilterType('');
    setFilterStatus('');
    setFilterDate('');
    setSearchText('');
  };

  return (
    <div className="p-5">
      <Space direction="vertical" size="middle" className="w-full">
        <Input
          placeholder="Tìm kiếm theo tên dịch vụ"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />

        <Card>
          <Space className="mb-4">
            <FilterOutlined />
            <span>Filter By</span>
            <Select
              placeholder="Ngày tạo"
              style={{ width: 150 }}
              value={filterDate}
              onChange={setFilterDate}
              allowClear
            >
              <Select.Option value="today">Hôm nay</Select.Option>
              <Select.Option value="week">Tuần này</Select.Option>
              <Select.Option value="month">Tháng này</Select.Option>
            </Select>

            <Select
              placeholder="Loại thể thao"
              style={{ width: 150 }}
              value={filterType}
              onChange={setFilterType}
              allowClear
            >
              <Select.Option value="football">Bóng đá</Select.Option>
              <Select.Option value="basketball">Bóng rổ</Select.Option>
              <Select.Option value="tennis">Tennis</Select.Option>
            </Select>

            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
            >
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="inactive">Không hoạt động</Select.Option>
            </Select>

            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleReset}
              type="text"
              danger
            >
              Reset Filter
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={defaultData}
            pagination={{
              total: 144,
              pageSize: 10,
              showTotal: (total) => `${total} Total`,
            }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default ServicePage;