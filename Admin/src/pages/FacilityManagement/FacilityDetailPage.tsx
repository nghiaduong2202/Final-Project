import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tag, Tabs, Table, Image, message, Modal, Space, Form, Input, Select, Typography, Row, Col, Statistic } from 'antd';
import { EditOutlined, StopOutlined, CheckCircleOutlined, HistoryOutlined, UserOutlined, HomeOutlined, EnvironmentOutlined, FieldTimeOutlined, PhoneOutlined, MailOutlined, StarOutlined } from '@ant-design/icons';
import { apiClient } from '@/services/api.service';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

interface FacilityDetail {
  id: string;
  name: string;
  address: string;
  sportType: string;
  status: string;
  description: string;
  phone: string;
  email: string;
  openTime: string;
  closeTime: string;
  images: string[];
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  fieldsCount: number;
  servicesCount: number;
  averageRating: number;
  reviewsCount: number;
}

interface Field {
  id: string;
  name: string;
  type: string;
  status: string;
  price: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Review {
  id: string;
  user: {
    id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const FacilityDetailPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const [facility, setFacility] = useState<FacilityDetail | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFacilityDetails();
    fetchFields();
    fetchServices();
    fetchReviews();
  }, [facilityId]);

  const fetchFacilityDetails = async () => {
    try {
      setLoading(true);
      // Trong môi trường thực tế, bạn sẽ gọi API thực sự
      // const response = await apiClient.get(`/admin/facilities/${facilityId}`);
      // setFacility(response.data);
      
      // Mock data for development
      setTimeout(() => {
        const mockFacility: FacilityDetail = {
          id: facilityId || '1',
          name: 'Sân vận động Thống Nhất',
          address: '123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
          sportType: 'football',
          status: 'active',
          description: 'Sân vận động Thống Nhất là một sân vận động đa năng tại Thành phố Hồ Chí Minh, Việt Nam. Sân vận động này được xây dựng từ năm 1982 và đã trải qua nhiều lần nâng cấp, sửa chữa.',
          phone: '0123456789',
          email: 'info@thongnhatstadium.com',
          openTime: '06:00',
          closeTime: '22:00',
          images: [
            'https://picsum.photos/500/300',
            'https://picsum.photos/500/301',
            'https://picsum.photos/500/302',
          ],
          owner: {
            id: '101',
            name: 'Nguyễn Văn X',
            email: 'nguyenvanx@example.com'
          },
          createdAt: '2023-01-15T10:30:00Z',
          fieldsCount: 5,
          servicesCount: 3,
          averageRating: 4.5,
          reviewsCount: 12,
        };
        
        setFacility(mockFacility);
        form.setFieldsValue({
          name: mockFacility.name,
          address: mockFacility.address,
          sportType: mockFacility.sportType,
          description: mockFacility.description,
          phone: mockFacility.phone,
          email: mockFacility.email,
          openTime: mockFacility.openTime,
          closeTime: mockFacility.closeTime,
          status: mockFacility.status,
        });
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching facility details:', error);
      setLoading(false);
      message.error('Không thể tải thông tin cơ sở');
    }
  };

  const fetchFields = async () => {
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API thực sự
      // const response = await apiClient.get(`/admin/facilities/${facilityId}/fields`);
      // setFields(response.data);
      
      // Mock data for development
      setTimeout(() => {
        const mockFields: Field[] = [
          {
            id: '1',
            name: 'Sân A1',
            type: 'football',
            status: 'active',
            price: 200000,
          },
          {
            id: '2',
            name: 'Sân A2',
            type: 'football',
            status: 'active',
            price: 200000,
          },
          {
            id: '3',
            name: 'Sân B1',
            type: 'football',
            status: 'maintenance',
            price: 250000,
          },
          {
            id: '4',
            name: 'Sân B2',
            type: 'football',
            status: 'active',
            price: 250000,
          },
          {
            id: '5',
            name: 'Sân C1',
            type: 'football',
            status: 'active',
            price: 300000,
          },
        ];
        
        setFields(mockFields);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching fields:', error);
      message.error('Không thể tải danh sách sân');
    }
  };

  const fetchServices = async () => {
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API thực sự
      // const response = await apiClient.get(`/admin/facilities/${facilityId}/services`);
      // setServices(response.data);
      
      // Mock data for development
      setTimeout(() => {
        const mockServices: Service[] = [
          {
            id: '1',
            name: 'Cho thuê giày',
            description: 'Giày đá bóng các loại',
            price: 50000,
          },
          {
            id: '2',
            name: 'Cho thuê áo',
            description: 'Áo bóng đá các loại',
            price: 30000,
          },
          {
            id: '3',
            name: 'Nước uống',
            description: 'Các loại nước giải khát',
            price: 15000,
          },
        ];
        
        setServices(mockServices);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error('Không thể tải danh sách dịch vụ');
    }
  };

  const fetchReviews = async () => {
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API thực sự
      // const response = await apiClient.get(`/admin/facilities/${facilityId}/reviews`);
      // setReviews(response.data);
      
      // Mock data for development
      setTimeout(() => {
        const mockReviews: Review[] = [
          {
            id: '1',
            user: {
              id: '201',
              name: 'Nguyễn Văn A',
            },
            rating: 5,
            comment: 'Sân rất đẹp và sạch sẽ. Nhân viên phục vụ tận tình.',
            createdAt: '2023-05-10T15:30:00Z',
          },
          {
            id: '2',
            user: {
              id: '202',
              name: 'Trần Thị B',
            },
            rating: 4,
            comment: 'Sân tốt, giá cả hợp lý. Tuy nhiên phòng thay đồ hơi nhỏ.',
            createdAt: '2023-05-05T09:45:00Z',
          },
          {
            id: '3',
            user: {
              id: '203',
              name: 'Lê Văn C',
            },
            rating: 5,
            comment: 'Đây là sân yêu thích của tôi. Mặt sân rất tốt, không bị trơn trượt.',
            createdAt: '2023-04-28T18:20:00Z',
          },
        ];
        
        setReviews(mockReviews);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải danh sách đánh giá');
    }
  };

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API update
      // await apiClient.patch(`/admin/facilities/${facilityId}/status`, { status: newStatus });
      
      // Mock status update
      setFacility(prevFacility => prevFacility ? { ...prevFacility, status: newStatus } : null);
      
      message.success(`Đã cập nhật trạng thái cơ sở thành ${newStatus === 'active' ? 'Hoạt động' : 'Bị chặn'}`);
    } catch (error) {
      console.error('Error updating facility status:', error);
      message.error('Không thể cập nhật trạng thái cơ sở');
    }
  };

  const handleSaveEdit = async (values: any) => {
    try {
      setLoading(true);
      // Trong môi trường thực tế, bạn sẽ gọi API update
      // await apiClient.put(`/admin/facilities/${facilityId}`, values);
      
      // Mock update
      setTimeout(() => {
        setFacility(prevFacility => prevFacility ? { ...prevFacility, ...values } : null);
        setEditModalVisible(false);
        setLoading(false);
        message.success('Cập nhật thông tin cơ sở thành công');
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error('Error updating facility:', error);
      message.error('Không thể cập nhật thông tin cơ sở');
    }
  };

  const fieldColumns = [
    {
      title: 'Tên sân',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại sân',
      dataIndex: 'type',
      key: 'type',
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
      title: 'Giá thuê',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        `${price.toLocaleString('vi-VN')}đ/giờ`
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
          case 'active':
            color = 'green';
            text = 'Hoạt động';
            break;
          case 'maintenance':
            color = 'orange';
            text = 'Bảo trì';
            break;
          case 'inactive':
            color = 'red';
            text = 'Không hoạt động';
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  const serviceColumns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        `${price.toLocaleString('vi-VN')}đ`
      ),
    },
  ];

  const reviewColumns = [
    {
      title: 'Người dùng',
      dataIndex: ['user', 'name'],
      key: 'userName',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <Rate disabled defaultValue={rating} />
      ),
    },
    {
      title: 'Bình luận',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN');
      },
    },
  ];

  if (loading && !facility) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chi tiết cơ sở</h1>
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={handleEdit}
          >
            Chỉnh sửa
          </Button>
          {facility?.status === 'active' ? (
            <Button 
              icon={<StopOutlined />} 
              danger
              onClick={() => handleStatusChange('blocked')}
            >
              Chặn cơ sở
            </Button>
          ) : (
            <Button 
              icon={<CheckCircleOutlined />} 
              type="primary"
              onClick={() => handleStatusChange('active')}
            >
              Mở khóa cơ sở
            </Button>
          )}
          <Button onClick={() => navigate('/facilities')} type="default">
            Quay lại danh sách
          </Button>
        </Space>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:gap-8">
          <div className="mb-6 md:mb-0 md:w-1/3">
            {facility?.images && facility.images.length > 0 ? (
              <Image.PreviewGroup>
                <div className="grid grid-cols-1 gap-2">
                  {facility.images.map((image, index) => (
                    <Image 
                      key={index}
                      src={image}
                      alt={`${facility.name} - ${index + 1}`}
                      className="rounded-lg object-cover"
                      style={{ height: index === 0 ? '250px' : '120px' }}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            ) : (
              <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
                <HomeOutlined style={{ fontSize: 48, opacity: 0.5 }} />
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Title level={3}>{facility?.name}</Title>
                <Tag color={
                  facility?.status === 'active' ? 'green' : 
                  facility?.status === 'pending' ? 'orange' : 
                  facility?.status === 'blocked' ? 'red' : 'default'
                }>
                  {
                    facility?.status === 'active' ? 'Hoạt động' :
                    facility?.status === 'pending' ? 'Chờ duyệt' :
                    facility?.status === 'blocked' ? 'Bị chặn' : 'Không xác định'
                  }
                </Tag>
              </Col>
              
              <Col span={24} md={12}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <EnvironmentOutlined className="mr-2 text-blue-500" />
                    <Text>{facility?.address}</Text>
                  </div>
                  <div className="flex items-center">
                    <FieldTimeOutlined className="mr-2 text-blue-500" />
                    <Text>Thời gian hoạt động: {facility?.openTime} - {facility?.closeTime}</Text>
                  </div>
                  <div className="flex items-center">
                    <PhoneOutlined className="mr-2 text-blue-500" />
                    <Text>Số điện thoại: {facility?.phone}</Text>
                  </div>
                  <div className="flex items-center">
                    <MailOutlined className="mr-2 text-blue-500" />
                    <Text>Email: {facility?.email}</Text>
                  </div>
                </div>
              </Col>
              
              <Col span={24} md={12}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <UserOutlined className="mr-2 text-blue-500" />
                    <Text>Chủ sân: <Link to={`/users/${facility?.owner.id}`}>{facility?.owner.name}</Link></Text>
                  </div>
                  <div className="flex items-center">
                    <MailOutlined className="mr-2 text-blue-500" />
                    <Text>Email chủ sân: {facility?.owner.email}</Text>
                  </div>
                  <div className="flex items-center">
                    <StarOutlined className="mr-2 text-blue-500" />
                    <Text>Đánh giá: <Rate disabled defaultValue={facility?.averageRating || 0} allowHalf /> ({facility?.reviewsCount} đánh giá)</Text>
                  </div>
                  <div className="flex items-center">
                    <HistoryOutlined className="mr-2 text-blue-500" />
                    <Text>Ngày tạo: {new Date(facility?.createdAt || '').toLocaleDateString('vi-VN')}</Text>
                  </div>
                </div>
              </Col>
              
              <Col span={24}>
                <Title level={5} className="mt-4">Loại sân</Title>
                <div>
                  <Tag color="blue">{
                    facility?.sportType === 'football' ? 'Bóng đá' :
                    facility?.sportType === 'badminton' ? 'Cầu lông' :
                    facility?.sportType === 'tennis' ? 'Tennis' :
                    facility?.sportType === 'basketball' ? 'Bóng rổ' :
                    facility?.sportType
                  }</Tag>
                </div>
              </Col>
              
              <Col span={24}>
                <Title level={5} className="mt-4">Mô tả</Title>
                <Text>{facility?.description}</Text>
              </Col>
              
              <Col span={24}>
                <Row gutter={16} className="mt-4">
                  <Col span={8}>
                    <Card className="text-center">
                      <Statistic 
                        title="Số lượng sân" 
                        value={facility?.fieldsCount || 0} 
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="text-center">
                      <Statistic 
                        title="Số dịch vụ" 
                        value={facility?.servicesCount || 0} 
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="text-center">
                      <Statistic 
                        title="Đánh giá trung bình" 
                        value={facility?.averageRating || 0} 
                        suffix={<StarOutlined />}
                        precision={1}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>
      </Card>
      
      <Tabs defaultActiveKey="fields">
        <TabPane tab="Danh sách sân" key="fields">
          <Card>
            <Table
              columns={fieldColumns}
              dataSource={fields}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="Dịch vụ" key="services">
          <Card>
            <Table
              columns={serviceColumns}
              dataSource={services}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="Đánh giá" key="reviews">
          <Card>
            <Table
              columns={reviewColumns}
              dataSource={reviews}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>
      
      {/* Modal chỉnh sửa thông tin */}
      <Modal
        title="Chỉnh sửa thông tin cơ sở"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveEdit}
          initialValues={{
            name: facility?.name,
            address: facility?.address,
            sportType: facility?.sportType,
            description: facility?.description,
            phone: facility?.phone,
            email: facility?.email,
            openTime: facility?.openTime,
            closeTime: facility?.closeTime,
            status: facility?.status,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên cơ sở"
                rules={[{ required: true, message: 'Vui lòng nhập tên cơ sở' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="sportType"
                label="Loại sân"
                rules={[{ required: true, message: 'Vui lòng chọn loại sân' }]}
              >
                <Select>
                  <Option value="football">Bóng đá</Option>
                  <Option value="badminton">Cầu lông</Option>
                  <Option value="tennis">Tennis</Option>
                  <Option value="basketball">Bóng rổ</Option>
                  <Option value="volleyball">Bóng chuyền</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="openTime"
                label="Giờ mở cửa"
                rules={[{ required: true, message: 'Vui lòng nhập giờ mở cửa' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="closeTime"
                label="Giờ đóng cửa"
                rules={[{ required: true, message: 'Vui lòng nhập giờ đóng cửa' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="pending">Chờ duyệt</Option>
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

export default FacilityDetailPage;