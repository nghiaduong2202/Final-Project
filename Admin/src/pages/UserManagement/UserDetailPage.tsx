import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tag, Tabs, Table, Avatar, message, Modal, Space, Form, Input, Select, Statistic } from 'antd';
import { UserOutlined, EditOutlined, LockOutlined, UnlockOutlined, IdcardOutlined, HistoryOutlined, MessageOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  avatar: string;
  address: string;
  createdAt: string;
  lastLogin: string;
  bookingsCount: number;
  facilitiesCount: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUserDetails();
    fetchUserActivities();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      // Trong môi trường thực tế, bạn sẽ gọi API thực sự
      // const response = await apiClient.get(`/admin/users/${userId}`);
      // setUser(response.data);
      
      // Mock data for development
      setTimeout(() => {
        const mockUser: UserDetail = {
          id: userId || '1',
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          phone: '0987654321',
          role: 'player',
          status: 'active',
          avatar: 'https://picsum.photos/200',
          address: '123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
          createdAt: '2023-01-15T10:30:00Z',
          lastLogin: '2023-05-20T15:45:00Z',
          bookingsCount: 12,
          facilitiesCount: 0,
        };
        
        setUser(mockUser);
        form.setFieldsValue({
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          address: mockUser.address,
          role: mockUser.role,
          status: mockUser.status,
        });
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching user details:', error);
      setLoading(false);
      message.error('Không thể tải thông tin người dùng');
    }
  };

  const fetchUserActivities = async () => {
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API thực sự
      // const response = await apiClient.get(`/admin/users/${userId}/activities`);
      // setActivities(response.data);
      
      // Mock data for development
      setTimeout(() => {
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'LOGIN',
            description: 'Đăng nhập vào hệ thống',
            timestamp: '2023-05-20T15:45:00Z',
          },
          {
            id: '2',
            type: 'BOOKING',
            description: 'Đặt sân cầu lông tại Sân cầu lông Victory',
            timestamp: '2023-05-18T09:30:00Z',
          },
          {
            id: '3',
            type: 'PROFILE_UPDATE',
            description: 'Cập nhật thông tin cá nhân',
            timestamp: '2023-05-15T11:20:00Z',
          },
          {
            id: '4',
            type: 'PAYMENT',
            description: 'Thanh toán đặt sân bóng đá tại Sân bóng đá mini Thủ Đức',
            timestamp: '2023-05-10T16:15:00Z',
          },
          {
            id: '5',
            type: 'REVIEW',
            description: 'Đánh giá Sân Tennis Hòa Bình',
            timestamp: '2023-05-05T14:30:00Z',
          },
        ];
        
        setActivities(mockActivities);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching user activities:', error);
      message.error('Không thể tải lịch sử hoạt động của người dùng');
    }
  };

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API update
      // await apiClient.patch(`/admin/users/${userId}/status`, { status: newStatus });
      
      // Mock status update
      setUser(prevUser => prevUser ? { ...prevUser, status: newStatus } : null);
      
      message.success(`Đã cập nhật trạng thái người dùng thành ${newStatus === 'active' ? 'Hoạt động' : 'Bị chặn'}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error('Không thể cập nhật trạng thái người dùng');
    }
  };

  const handleSaveEdit = async (values: UserDetail) => {
    try {
      setLoading(true);
      // Trong môi trường thực tế, bạn sẽ gọi API update
      // await apiClient.put(`/admin/users/${userId}`, values);
      
      // Mock update
      setTimeout(() => {
        setUser(prevUser => prevUser ? { ...prevUser, ...values } : null);
        setEditModalVisible(false);
        setLoading(false);
        message.success('Cập nhật thông tin người dùng thành công');
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error('Error updating user:', error);
      message.error('Không thể cập nhật thông tin người dùng');
    }
  };

  const activityColumns = [
    {
      title: 'Loại hoạt động',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let color = '';
        let icon = null;
        
        switch (type) {
          case 'LOGIN':
            color = 'blue';
            icon = <UserOutlined />;
            break;
          case 'BOOKING':
            color = 'green';
            icon = <IdcardOutlined />;
            break;
          case 'PROFILE_UPDATE':
            color = 'purple';
            icon = <EditOutlined />;
            break;
          case 'PAYMENT':
            color = 'gold';
            icon = <HistoryOutlined />;
            break;
          case 'REVIEW':
            color = 'cyan';
            icon = <MessageOutlined />;
            break;
          default:
            color = 'default';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {type}
          </Tag>
        );
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN');
      },
    },
  ];

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={handleEdit}
          >
            Chỉnh sửa
          </Button>
          {user?.status === 'active' ? (
            <Button 
              icon={<LockOutlined />} 
              danger
              onClick={() => handleStatusChange('blocked')}
            >
              Chặn người dùng
            </Button>
          ) : (
            <Button 
              icon={<UnlockOutlined />} 
              type="primary"
              onClick={() => handleStatusChange('active')}
            >
              Mở khóa người dùng
              </Button>
          )}
          <Button onClick={() => navigate('/users')} type="default">
            Quay lại danh sách
          </Button>
        </Space>
      </div>
      
      <Card className="mb-6">
        <div className="flex">
          <div className="mr-8">
            <Avatar 
              size={120} 
              src={user?.avatar}
              icon={<UserOutlined />}
            />
          </div>
          <div className="flex-1">
            <Descriptions title="Thông tin người dùng" bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Họ và tên">{user?.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{user?.phone}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color={
                  user?.role === 'admin' ? 'purple' : 
                  user?.role === 'owner' ? 'green' : 
                  user?.role === 'player' ? 'blue' : 'default'
                }>
                  {
                    user?.role === 'admin' ? 'Quản trị viên' :
                    user?.role === 'owner' ? 'Chủ sân' :
                    user?.role === 'player' ? 'Người chơi' : user?.role
                  }
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={user?.status === 'active' ? 'green' : 'red'}>
                  {user?.status === 'active' ? 'Hoạt động' : 'Bị chặn'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(user?.createdAt || '').toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={3}>{user?.address}</Descriptions.Item>
            </Descriptions>
            
            <div className="mt-4 flex gap-4">
              <Card className="flex-1 text-center">
                <Statistic 
                  title={user?.role === 'player' ? "Tổng số lần đặt sân" : "Tổng số cơ sở"} 
                  value={user?.role === 'player' ? user?.bookingsCount : user?.facilitiesCount} 
                />
              </Card>
              <Card className="flex-1 text-center">
                <Statistic 
                  title="Đăng nhập gần nhất" 
                  value={new Date(user?.lastLogin || '').toLocaleDateString('vi-VN')} 
                />
              </Card>
            </div>
          </div>
        </div>
      </Card>
      
      <Tabs defaultActiveKey="activities">
        <TabPane tab="Lịch sử hoạt động" key="activities">
          <Card>
            <Table
              columns={activityColumns}
              dataSource={activities}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        {user?.role === 'player' && (
          <TabPane tab="Lịch sử đặt sân" key="bookings">
            <Card>
              <BookingHistory userId={userId} />
            </Card>
          </TabPane>
        )}
        
        {user?.role === 'owner' && (
          <TabPane tab="Danh sách cơ sở" key="facilities">
            <Card>
              <FacilityList ownerId={userId} />
            </Card>
          </TabPane>
        )}
      </Tabs>
      
      {/* Modal chỉnh sửa thông tin */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveEdit}
          initialValues={{
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
            address: user?.address,
            role: user?.role,
            status: user?.status,
          }}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select>
              <Option value="admin">Quản trị viên</Option>
              <Option value="owner">Chủ sân</Option>
              <Option value="player">Người chơi</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="blocked">Bị chặn</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setEditModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Mock component cho lịch sử đặt sân
const BookingHistory: React.FC<{ userId?: string }> = ({ userId }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Trong môi trường thực tế, gọi API để lấy lịch sử đặt sân
      // const response = await apiClient.get(`/admin/users/${userId}/bookings`);
      // setBookings(response.data);
      
      // Mock data
      setTimeout(() => {
        const mockBookings = [
          {
            id: '1',
            facilityName: 'Sân cầu lông Victory',
            fieldName: 'Sân A1',
            sportType: 'badminton',
            date: '2023-05-15',
            startTime: '09:00',
            endTime: '11:00',
            totalAmount: 200000,
            status: 'completed',
          },
          {
            id: '2',
            facilityName: 'Sân bóng đá mini Thủ Đức',
            fieldName: 'Sân B2',
            sportType: 'football',
            date: '2023-05-10',
            startTime: '16:00',
            endTime: '18:00',
            totalAmount: 350000,
            status: 'cancelled',
          },
          {
            id: '3',
            facilityName: 'Sân Tennis Hòa Bình',
            fieldName: 'Sân C3',
            sportType: 'tennis',
            date: '2023-05-05',
            startTime: '14:00',
            endTime: '16:00',
            totalAmount: 300000,
            status: 'completed',
          },
        ];
        
        setBookings(mockBookings);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã đặt sân',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Cơ sở',
      dataIndex: 'facilityName',
      key: 'facilityName',
    },
    {
      title: 'Sân',
      dataIndex: 'fieldName',
      key: 'fieldName',
    },
    {
      title: 'Loại sân',
      dataIndex: 'sportType',
      key: 'sportType',
      render: (type: string) => {
        const sportMap: Record<string, string> = {
          'football': 'Bóng đá',
          'basketball': 'Bóng rổ',
          'badminton': 'Cầu lông',
          'tennis': 'Tennis',
          'volleyball': 'Bóng chuyền',
        };
        
        return sportMap[type] || type;
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: any, record: any) => (
        `${record.startTime} - ${record.endTime}`
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        `${amount.toLocaleString('vi-VN')}đ`
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'completed':
            color = 'green';
            text = 'Hoàn thành';
            break;
          case 'pending':
            color = 'orange';
            text = 'Đang chờ';
            break;
          case 'cancelled':
            color = 'red';
            text = 'Đã hủy';
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={bookings}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 5 }}
    />
  );
};

// Mock component cho danh sách cơ sở
const FacilityList: React.FC<{ ownerId?: string }> = ({ ownerId }) => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFacilities();
  }, [ownerId]);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      // Trong môi trường thực tế, gọi API để lấy danh sách cơ sở
      // const response = await apiClient.get(`/admin/users/${ownerId}/facilities`);
      // setFacilities(response.data);
      
      // Mock data
      setTimeout(() => {
        const mockFacilities = [
          {
            id: '1',
            name: 'Sân cầu lông Victory',
            address: '456 Lê Lợi, Quận 3, TP.HCM',
            sportType: 'badminton',
            status: 'active',
            totalFields: 8,
            createdAt: '2023-02-15',
          },
          {
            id: '2',
            name: 'Sân Tennis Hòa Bình',
            address: '789 Cách Mạng Tháng 8, Quận 10, TP.HCM',
            sportType: 'tennis',
            status: 'active',
            totalFields: 5,
            createdAt: '2023-03-10',
          },
        ];
        
        setFacilities(mockFacilities);
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên cơ sở',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <a href={`/facilities/${record.id}`} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Loại sân',
      dataIndex: 'sportType',
      key: 'sportType',
      render: (type: string) => {
        const sportMap: Record<string, string> = {
          'football': 'Bóng đá',
          'basketball': 'Bóng rổ',
          'badminton': 'Cầu lông',
          'tennis': 'Tennis',
          'volleyball': 'Bóng chuyền',
        };
        
        return sportMap[type] || type;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'active':
            color = 'green';
            text = 'Hoạt động';
            break;
          case 'pending':
            color = 'orange';
            text = 'Chờ duyệt';
            break;
          case 'blocked':
            color = 'red';
            text = 'Bị chặn';
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Số sân',
      dataIndex: 'totalFields',
      key: 'totalFields',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={facilities}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 5 }}
    />
  );
};

export default UserDetailPage;