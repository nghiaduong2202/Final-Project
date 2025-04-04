import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Image, 
  Descriptions, 
  Button, 
  Breadcrumb, 
  Divider,
  Space
} from 'antd';
import { 
  LeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  StarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  MailOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

interface FieldDetailProps {
  id?: string;
  title?: string;
  description?: string;
  ownerName?: string;
  email?: string;
  facilityName?: string;
  createdAt?: string;
  updatedAt?: string;
  price?: string;
  dimension?: string;
  yardSurface?: string;
  totalReview?: string;
  avgReview?: string;
  typeSport?: string;
  location?: string;
  status?: 'Available' | 'Unavailable';
  images?: string[];
}

const FieldDetailPage: React.FC<FieldDetailProps> = ({
  id = "123",
  title = "Sân A",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad laborum.",
  ownerName = "Nguyễn Tuấn Anh", 
  email = "anhhello564@gmail.com",
  facilityName = "Sân Cầu Lông Phạm Kha",
  createdAt = "24/12/2024",
  updatedAt = "24/12/2024",
  price = "200.000đ /h",
  dimension = "4.8",
  yardSurface = "4.8",
  totalReview = "20",
  avgReview = "4.8",
  typeSport = "Badminton",
  location = "Số 34 Đường 3/2 quận 10 tp Hồ Chí Minh",
  status = 'Available',
  images = [
    "https://dashboard.codeparrot.ai/api/image/Z7oJylCHtJJZ6wCn/frame-37.png",
    "https://dashboard.codeparrot.ai/api/image/Z7oJylCHtJJZ6wCn/frame-37-2.png",
    "https://dashboard.codeparrot.ai/api/image/Z7oJylCHtJJZ6wCn/frame.png"
  ],
}) => {
  return (
    <div className="p-6 bg-[#f5f6fa] min-h-screen">
      {/* Breadcrumb & Actions */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { title: <Link to="/dashboard">Dashboard</Link> },
            { title: <Link to="/fields">Field Management</Link> },
            { title: 'Field Detail' },
          ]}
        />
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/fields">
              <Button icon={<LeftOutlined />}>Back</Button>
            </Link>
            <Title level={3} style={{ margin: 0 }}>{title}</Title>
            <Tag color={status === 'Available' ? 'success' : 'warning'} className="ml-2">
              {status}
            </Tag>
          </div>
          
          <Space>
            <Button icon={<EditOutlined />} type="primary">
              Edit Field
            </Button>
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Space>
        </div>
      </div>
      
      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Field Information */}
        <Col xs={24} lg={16}>
          <Card className="shadow-sm">
            <div className="mb-6">
              <Paragraph className="text-lg">{description}</Paragraph>
            </div>
            
            <Divider />
            
            <Descriptions
              bordered
              column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Field ID">{id}</Descriptions.Item>
              <Descriptions.Item label="Type Sport">
                <Tag color="blue">{typeSport}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Price">
                <Text strong>{price}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Owner Name">
                <Space>
                  <UserOutlined />
                  {ownerName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  {email}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Facility Name">
                <Space>
                  <ShopOutlined />
                  {facilityName}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Created At">
                <Space>
                  <ClockCircleOutlined />
                  {createdAt}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                <Space>
                  <ClockCircleOutlined />
                  {updatedAt}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Dimension">{dimension} m</Descriptions.Item>
              
              <Descriptions.Item label="Yard Surface">{yardSurface}</Descriptions.Item>
              <Descriptions.Item label="Total Reviews">{totalReview}</Descriptions.Item>
              <Descriptions.Item label="Avg. Rating">
                <Space>
                  <StarOutlined style={{ color: '#fadb14' }} />
                  {avgReview}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Location" span={3}>
                <Space>
                  <EnvironmentOutlined />
                  {location}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        
        {/* Right Column - Images & Other Details */}
        <Col xs={24} lg={8}>
          <Card title="Field Images" className="shadow-sm mb-6">
            <div className="mb-4">
              <Image.PreviewGroup>
                <Row gutter={[16, 16]}>
                  {images.map((img, index) => (
                    <Col span={12} key={index}>
                      <Image
                        src={img}
                        alt={`Field Image ${index + 1}`}
                        className="rounded-lg"
                        height={120}
                        style={{ objectFit: 'cover' }}
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </div>
            <Button type="dashed" block>View All Images</Button>
          </Card>
          
          <Card title="Booking Statistics" className="shadow-sm mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <Text type="secondary">Total Bookings</Text>
                <div className="text-xl font-semibold">127</div>
              </div>
              <div>
                <Text type="secondary">This Month</Text>
                <div className="text-xl font-semibold">42</div>
              </div>
              <div>
                <Text type="secondary">Avg. Booking Duration</Text>
                <div className="text-xl font-semibold">2.5 hours</div>
              </div>
            </div>
          </Card>
          
          <Card title="Recent Reviews" className="shadow-sm">
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Text strong>Nguyễn Văn A</Text>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarOutlined key={star} style={{ color: star <= 5 ? '#fadb14' : '#ccc' }} />
                    ))}
                  </div>
                </div>
                <Text type="secondary">Great field, very clean and well-maintained!</Text>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Text strong>Trần Thị B</Text>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarOutlined key={star} style={{ color: star <= 4 ? '#fadb14' : '#ccc' }} />
                    ))}
                  </div>
                </div>
                <Text type="secondary">Good service but the facility needs better lighting.</Text>
              </div>
              <Button type="link" style={{ padding: 0 }}>View All Reviews</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FieldDetailPage;