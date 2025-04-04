import React, { useState } from 'react';
import { Input, Select, Button, Table, Pagination, Badge, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';

// Định nghĩa interface
interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  fieldFacility: string;
  status: 'approved' | 'pending' | 'rejected';
}

// Dữ liệu mẫu
const defaultReviews: Review[] = [
  {
    id: '001',
    userName: "Nguyễn Tuấn Anh",
    rating: 5,
    comment: "Chất lượng",
    createdAt: "14/07/2024",
    fieldFacility: "sân A/ sân cầu lông Phạm Kha",
    status: 'approved'
  },
  {
    id: '002',
    userName: "Dương Văn Nghĩa",
    rating: 4,
    comment: "Dịch vụ tốt",
    createdAt: "13/07/2024",
    fieldFacility: "sân B/ sân bóng đá Mini",
    status: 'pending'
  },
  {
    id: '003',
    userName: "Trần Văn Hoàng",
    rating: 3,
    comment: "Tạm được",
    createdAt: "12/07/2024",
    fieldFacility: "sân C/ sân tennis",
    status: 'approved'
  },
  {
    id: '004',
    userName: "Lê Thị Hương",
    rating: 2,
    comment: "Cần cải thiện hơn",
    createdAt: "11/07/2024",
    fieldFacility: "sân D/ sân bóng rổ",
    status: 'rejected'
  },
];

const ReviewPage: React.FC = () => {
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
  const columns: TableColumnsType<Review> = [
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
      width: 160,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating) => {
        // Star rating display
        return Array(5).fill(0).map((_, i) => (
          <span key={i} style={{ color: i < rating ? '#fadb14' : '#d9d9d9' }}>★</span>
        ));
      }
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: 'Field/Facility',
      dataIndex: 'fieldFacility',
      key: 'fieldFacility',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'green';
        let text = 'Approved';
        
        if (status === 'pending') {
          color = 'gold';
          text = 'Pending';
        } else if (status === 'rejected') {
          color = 'red';
          text = 'Rejected';
        }
        
        return <Badge color={color} text={text} />;
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Tooltip title="View">
            <Button type="text" icon={<EyeOutlined />} size="small" />
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
        <h1 className="text-2xl font-semibold mb-2">Review Management</h1>
        <p className="text-gray-500">Manage all reviews from users</p>
      </div>
      
      {/* Search and Filter Section */}
      <div className="flex justify-between mb-6 flex-wrap gap-4">
        {/* Search */}
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search by user name or comment"
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
                { value: 'approved', label: 'Approved' },
                { value: 'pending', label: 'Pending' },
                { value: 'rejected', label: 'Rejected' }
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
          dataSource={defaultReviews}
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

export default ReviewPage;