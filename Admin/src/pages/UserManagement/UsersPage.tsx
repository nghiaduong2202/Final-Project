import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Popconfirm, message, Card } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Trong môi trường thực tế, bạn sẽ gọi API thực sự
        // const response = await apiClient.get('/admin/users');
        // setUsers(response.data);
        
        // Mock data for development
        setTimeout(() => {
          const mockUsers: User[] = [
            { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'player', status: 'active', createdAt: '2023-01-15' },
            { id: '2', name: 'Trần Thị B', email: 'tranthib@example.com', role: 'owner', status: 'active', createdAt: '2023-02-20' },
            { id: '3', name: 'Phạm Văn C', email: 'phamvanc@example.com', role: 'player', status: 'blocked', createdAt: '2023-03-10' },
            { id: '4', name: 'Lê Thị D', email: 'lethid@example.com', role: 'owner', status: 'pending', createdAt: '2023-04-05' },
            { id: '5', name: 'Hoàng Văn E', email: 'hoangvane@example.com', role: 'admin', status: 'active', createdAt: '2023-05-12' },
          ];
          
          setUsers(mockUsers);
          setLoading(false);
        }, 100);
        
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
        message.error('Không thể tải danh sách người dùng');
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API xóa
      // await apiClient.delete(`/admin/users/${id}`);
      
      // Mock deletion
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      message.success('Xóa người dùng thành công');
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Không thể xóa người dùng');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API update
      // await apiClient.patch(`/admin/users/${id}/status`, { status: newStatus });
      
      // Mock status update
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id ? { ...user, status: newStatus } : user
        )
      );
      
      message.success(`Đã cập nhật trạng thái người dùng thành ${newStatus === 'active' ? 'Hoạt động' : newStatus === 'blocked' ? 'Bị chặn' : 'Chờ duyệt'}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error('Không thể cập nhật trạng thái người dùng');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchText === '' || 
      user.name.toLowerCase().includes(searchText.toLowerCase()) || 
      user.email.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesRole = filterRole === null || user.role === filterRole;
    const matchesStatus = filterStatus === null || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: User) => (
        <Link to={`/users/${record.id}`} className="text-blue-500 hover:underline">
          {text}
        </Link>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = '';
        let text = '';
        
        switch (role) {
          case 'player':
            color = 'blue';
            text = 'Người chơi';
            break;
          case 'owner':
            color = 'green';
            text = 'Chủ sân';
            break;
          case 'admin':
            color = 'purple';
            text = 'Quản trị viên';
            break;
          default:
            color = 'default';
            text = role;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        let text = '';
        let icon = null;
        
        switch (status) {
          case 'active':
            color = 'green';
            text = 'Hoạt động';
            icon = <CheckCircleOutlined />;
            break;
          case 'blocked':
            color = 'red';
            text = 'Bị chặn';
            icon = <StopOutlined />;
            break;
          case 'pending':
            color = 'orange';
            text = 'Chờ duyệt';
            icon = <UserOutlined />;
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/users/${record.id}`)}
            type="link"
          />
          {record.status === 'active' ? (
            <Popconfirm
              title="Bạn có chắc muốn chặn người dùng này?"
              onConfirm={() => handleStatusChange(record.id, 'blocked')}
              okText="Có"
              cancelText="Không"
            >
              <Button 
                icon={<StopOutlined />} 
                danger
                type="link"
                title="Chặn người dùng"
              />
            </Popconfirm>
          ) : record.status === 'blocked' ? (
            <Button 
              icon={<CheckCircleOutlined />} 
              type="link"
              title="Mở khóa người dùng"
              style={{ color: 'green' }}
              onClick={() => handleStatusChange(record.id, 'active')}
            />
          ) : (
            <Button 
              icon={<CheckCircleOutlined />} 
              type="link"
              title="Duyệt người dùng"
              style={{ color: 'orange' }}
              onClick={() => handleStatusChange(record.id, 'active')}
            />
          )}
          <Popconfirm
            title="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger
              type="link"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => message.info('Chức năng thêm mới người dùng chưa được triển khai')}
        >
          Thêm người dùng
        </Button>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Select
            placeholder="Lọc theo vai trò"
            allowClear
            style={{ width: 200 }}
            onChange={value => setFilterRole(value)}
          >
            <Option value="player">Người chơi</Option>
            <Option value="owner">Chủ sân</Option>
            <Option value="admin">Quản trị viên</Option>
          </Select>
          
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 200 }}
            onChange={value => setFilterStatus(value)}
          >
            <Option value="active">Hoạt động</Option>
            <Option value="blocked">Bị chặn</Option>
            <Option value="pending">Chờ duyệt</Option>
          </Select>
        </div>
      </Card>
      
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default UsersPage;