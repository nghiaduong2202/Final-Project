import React, { useState } from 'react';
import { 
  Input, 
  Select, 
  Button, 
  Table, 
  Pagination, 
  Badge, 
  Tooltip, 
  Tag,
  Breadcrumb
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Link } from 'react-router-dom';

interface Field {
  id: string;
  fieldName: string;
  facilityName: string;
  createdAt: string;
  typeSport: string | string[];
  price: string;
  status: 'Available' | 'Unavailable';
}

// Default data
const defaultFields: Field[] = [
  {id: '0001', fieldName: 'Nguyễn Tuấn Anh', facilityName: 'Nguyễn Tuấn Anh', createdAt: '14/07/2024', typeSport: 'Tennis', price: '500.000đ/h', status: 'Available'},
  {id: '0002', fieldName: 'Dương Văn Nghĩa', facilityName: 'Nguyễn Tuấn Anh', createdAt: '14/07/2024', typeSport: 'Football', price: '300.000đ/h', status: 'Available'},
  {id: '0003', fieldName: 'Nguyễn Tuấn Anh', facilityName: 'Nguyễn Tuấn Anh', createdAt: '14/07/2024', typeSport: 'Badminton', price: '120.000đ/h', status: 'Unavailable'},
  {id: '0004', fieldName: 'Dương Văn Nghĩa', facilityName: 'Nguyễn Tuấn Anh', createdAt: '14/07/2024', typeSport: ['Tennis', 'Badminton'], price: '200.000đ/h', status: 'Unavailable'},
  {id: '0005', fieldName: 'Dương Văn Nghĩa', facilityName: 'Nguyễn Tuấn Anh', createdAt: '14/07/2024', typeSport: 'Table Tennis', price: '70.000đ/h', status: 'Available'},
  {id: '0006', fieldName: 'Dương Văn Nghĩa', facilityName: 'Nguyễn Tuấn Anh', createdAt: '14/07/2024', typeSport: 'Basketball', price: '200.000đ/h', status: 'Available'},
  {id: '0007', fieldName: 'Dương Văn Nghĩa', facilityName: 'Nguyễn Tuấn Anh', createdAt: '14/07/2024', typeSport: 'Badminton', price: '120.000đ/h', status: 'Available'},
  {id: '0008', fieldName: 'Dương Văn Nghĩa', facilityName: 'Nguyễn Tuấn Anh', createdAt: '14/07/2024', typeSport: 'Badminton', price: '120.000đ/h', status: 'Available'}
];

const FieldPage: React.FC = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    createdAt: '',
    typeSport: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 144
  });

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ createdAt: '', typeSport: '', status: '' });
    setPagination({ ...pagination, current: 1 });
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ ...pagination, current: page, pageSize });
  };

  // Table columns
  const columns: TableColumnsType<Field> = [
    {
      title: 'Field ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Field Name',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Facility Name',
      dataIndex: 'facilityName',
      key: 'facilityName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: 'Type Sport',
      dataIndex: 'typeSport',
      key: 'typeSport',
      width: 150,
      render: (sports) => {
        if (Array.isArray(sports)) {
          return (
            <>
              {sports.map(sport => (
                <Tag color="blue" key={sport}>
                  {sport}
                </Tag>
              ))}
            </>
          );
        }
        return <Tag color="blue">{sports}</Tag>;
      }
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        return (
          <Badge 
            status={status === 'Available' ? 'success' : 'warning'} 
            text={status}
          />
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Tooltip title="View">
            <Link to={`/fields/${record.id}`}>
              <Button type="text" icon={<EyeOutlined />} size="small" />
            </Link>
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full p-6 bg-[#f5f6fa]">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Field Management' },
          ]}
        />
        <div className="mt-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Field Management</h1>
            <p className="text-gray-500">Manage all available fields</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />}>
            Add New Field
          </Button>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="flex justify-between mb-6 flex-wrap gap-4">
        {/* Search */}
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search by field name or facility"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            size="large"
          />
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span>Created At:</span>
            <Select
              style={{ width: 140 }}
              value={filters.createdAt}
              onChange={(value) => handleFilterChange('createdAt', value)}
              options={[
                { value: '', label: 'All' },
                { value: 'today', label: 'Today' },
                { value: 'this_week', label: 'This Week' },
                { value: 'this_month', label: 'This Month' }
              ]}
              size="middle"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span>Type Sport:</span>
            <Select
              style={{ width: 140 }}
              value={filters.typeSport}
              onChange={(value) => handleFilterChange('typeSport', value)}
              options={[
                { value: '', label: 'All' },
                { value: 'football', label: 'Football' },
                { value: 'basketball', label: 'Basketball' },
                { value: 'tennis', label: 'Tennis' },
                { value: 'badminton', label: 'Badminton' }
              ]}
              size="middle"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Select
              style={{ width: 140 }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { value: '', label: 'All' },
                { value: 'Available', label: 'Available' },
                { value: 'Unavailable', label: 'Unavailable' }
              ]}
              size="middle"
            />
          </div>
          
          <Button
            type="primary"
            danger
            icon={<ReloadOutlined />}
            onClick={handleResetFilters}
          >
            Reset
          </Button>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md">
        <Table
          columns={columns}
          dataSource={defaultFields}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1100 }}
        />
        
        <div className="flex justify-end p-4">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handleTableChange}
            showSizeChanger={false}
            showTotal={(total) => `Total ${total} items`}
          />
        </div>
      </div>
    </div>
  );
};

export default FieldPage;