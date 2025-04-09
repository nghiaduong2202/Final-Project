import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { 
  Breadcrumb, 
  Card, 
  Tag, 
  Image, 
  Button, 
  Tabs, 
  Typography, 
  Rate, 
  Divider, 
  List, 
  Collapse,
  Space,
  Spin,
  Empty,
  message
} from 'antd';
import { 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  CommentOutlined,
  ExpandOutlined
} from '@ant-design/icons';
import { mockFacilities } from '@/mocks/facility/mockFacilities';
import { mockFieldGroups } from '@/mocks/field/Groupfield_Field';
import { mockServices } from '@/mocks/service/serviceData';
import type { Service } from '@/types/service.type';

const { Title, Text, Paragraph } = Typography;

// Interface for facility data based on mock data
interface FacilityDetail {
  id: string;
  name: string;
  description: string;
  location: string;
  openTime1: string;
  closeTime1: string;
  openTime2: string;
  closeTime2: string;
  openTime3: string;
  closeTime3: string;
  numberOfShifts: number;
  status: string;
  avgRating: number;
  numberOfRatings: number;
  imagesUrl: string[];
  sports: {
    id: number;
    name: string;
  }[];
}

interface FieldGroup {
  id: string;
  name: string;
  dimension: string;
  surface: string;
  basePrice: number;
  peakStartTime1: string;
  peakEndTime1: string;
  priceIncrease1: number;
  peakStartTime2?: string;
  peakEndTime2?: string;
  priceIncrease2?: number;
  peakStartTime3?: string;
  peakEndTime3?: string;
  priceIncrease3?: number;
  numberOfPeaks: number;
  fields: {
    id: string;
    name: string;
    status: string;
  }[];
  sports: {
    id: number;
    name: string;
  }[];
  facilityId: string;
}

const DetailFacility: React.FC = () => {
  const navigate = useNavigate();
  const { facilityId } = useParams<{ facilityId: string }>();
  const [activeTab, setActiveTab] = useState('general');
  
  // States for mock data
  const [facility, setFacility] = useState<FacilityDetail | null>(null);
  const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch facility data
  useEffect(() => {
    const fetchFacilityData = async () => {
      if (!facilityId) return;
      
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get facility details from mock data
        const facilityData = mockFacilities.find(f => f.id === facilityId);
        if (!facilityData) {
          throw new Error('Facility not found');
        }
        setFacility(facilityData);
        
        if (facilityData.imagesUrl && facilityData.imagesUrl.length > 0) {
          setMainImage(facilityData.imagesUrl[0]);
        }
        
        // Get field groups from mock data
        const fieldGroupsData = mockFieldGroups.filter(fg => fg.facilityId === facilityId);
        setFieldGroups(fieldGroupsData);
        
        // Get services from mock data
        const servicesData = mockServices.filter(s => s.facilityId === facilityId);
        setServices(servicesData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching facility data:', err);
        setError('Failed to load facility data. Please try again later.');
        message.error('Failed to load facility data');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilityData();
  }, [facilityId]);

  const handleImageClick = (image: string) => {
    setMainImage(image);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="success" className="text-sm md:text-base px-2 py-0.5 md:px-3 md:py-1">Đang hoạt động</Tag>;
      case 'pending':
        return <Tag color="warning" className="text-sm md:text-base px-2 py-0.5 md:px-3 md:py-1">Đang chờ phê duyệt</Tag>;
      case 'unactive':
        return <Tag color="error" className="text-sm md:text-base px-2 py-0.5 md:px-3 md:py-1">Đang đóng cửa</Tag>;
      default:
        return <Tag color="default" className="text-sm md:text-base px-2 py-0.5 md:px-3 md:py-1">Không xác định</Tag>;
    }
  };

  const handleBookingClick = () => {
    if (facility) {
      navigate(`/user/booking/${facility.id}`);
    }
  };

  // Define breadcrumb items
  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: <Link to="/result-search">Tìm kiếm</Link>,
    },
    {
      title: 'Thông tin cơ sở',
    },
  ];

  // Define tab items
  const tabItems = [
    {
      key: 'general',
      label: 'Thông tin chung',
    },
    {
      key: 'fields',
      label: 'Sân chơi',
    },
    {
      key: 'services',
      label: 'Dịch vụ',
    },
  ];

  // Define collapse items for field groups
  const getCollapseItems = () => {
    return fieldGroups.map(group => ({
      key: group.id,
      label: (
        <div>
          <div className="flex justify-between items-center">
            <span className="text-base md:text-lg font-medium">{group.name}</span>
            <span className="text-gray-500">{group.fields.length} sân</span>
          </div>
          <div>
            {/* Group information displayed once */}
            <div className="mb-4 p-2 md:p-3 bg-gray-50 rounded-lg">
              <Space direction="vertical" className="w-full">
                <div className="flex justify-between">
                  <Text strong>Thông tin chung:</Text>
                  <Text className="text-blue-600 font-semibold">
                    {group.basePrice.toLocaleString()}đ/giờ
                    {group.priceIncrease1 > 0 && 
                      <span className="text-xs text-gray-500 ml-1">
                        +{group.priceIncrease1.toLocaleString()}đ (giờ cao điểm)
                      </span>
                    }
                  </Text>
                </div>
                <Text>Bề mặt: {group.surface}</Text>
                <Text>Kích thước: {group.dimension}</Text>
                {group.peakStartTime1 && group.peakEndTime1 && (
                  <Text>Giờ cao điểm: {group.peakStartTime1.substring(0, 5)} - {group.peakEndTime1.substring(0, 5)}</Text>
                )}
              </Space>
            </div>
          </div>
        </div>
      ),
      children: (
        <div>      
          {/* List of fields with simplified display */}
          <List
            itemLayout="horizontal"
            dataSource={group.fields}
            renderItem={field => (
              <List.Item>
                <List.Item.Meta
                  title={<Text strong>{field.name}</Text>}
                  description={
                    <Text>Trạng thái: {
                      field.status === 'active' ? 'Hoạt động' : 
                      field.status === 'pending' ? 'Đang chờ' : 'Bảo trì'
                    }</Text>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      ),
    }));
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-6 flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="w-full px-4 py-6 flex flex-col justify-center items-center min-h-screen">
        <Empty description={error || "Không tìm thấy thông tin cơ sở"} />
        <Button 
          type="primary" 
          className="mt-4"
          onClick={() => navigate('/')}
        >
          Quay lại trang tìm kiếm
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Section 1: Breadcrumb, Facility Name, Status, and Images */}
        <section className="mb-6 md:mb-8">
          <Breadcrumb items={breadcrumbItems} className="mb-3 md:mb-4" />

          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 md:mb-6 gap-2">
            <Title level={2} className="m-0 text-xl md:text-2xl lg:text-3xl">{facility.name}</Title>
            {getStatusTag(facility.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            <div className="md:col-span-8">
              <Image
                src={mainImage || 'https://via.placeholder.com/800x400'}
                alt={facility.name}
                className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-lg"
                preview={{
                  mask: <div className="flex items-center justify-center"><ExpandOutlined /> Xem ảnh lớn</div>
                }}
              />
            </div>
            <div className="grid grid-cols-4 md:grid-cols-2 md:col-span-4 gap-2">
              {facility.imagesUrl.slice(1, 5).map((image, index) => (
                <div key={index} className="relative cursor-pointer" onClick={() => handleImageClick(image)}>
                  <Image
                    src={image}
                    alt={`${facility.name} ${index + 1}`}
                    className="rounded-lg h-16 sm:h-24 md:h-auto object-cover w-full"
                    style={{ aspectRatio: '1/1' }}
                    preview={false}
                  />
                  {index === 3 && facility.imagesUrl.length > 5 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <Text className="text-white text-sm md:text-lg font-bold">+{facility.imagesUrl.length - 5}</Text>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Main Content with Tabs */}
        <section className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4 md:mb-6 flex-wrap gap-3">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              className="w-full md:w-auto"
              size="middle"
              items={tabItems}
            />
            <Button 
              type="primary" 
              size="middle" 
              onClick={handleBookingClick}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Đặt sân ngay
            </Button>
          </div>

          <div className="bg-white p-3 md:p-6 rounded-lg shadow-md">
            {activeTab === 'general' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div>
                    <div className="mb-4 md:mb-6">
                      <Title level={4} className="mb-2 md:mb-3 text-lg md:text-xl">Giờ hoạt động</Title>
                      <div className="flex items-center">
                        <ClockCircleOutlined className="mr-2 text-blue-600" />
                        <Text>{facility.openTime1.substring(0, 5)} - {facility.closeTime1.substring(0, 5)}</Text>
                      </div>
                      {facility.numberOfShifts > 1 && (
                        <>
                          <div className="flex items-center mt-2">
                            <ClockCircleOutlined className="mr-2 text-blue-600" />
                            <Text>{facility.openTime2.substring(0, 5)} - {facility.closeTime2.substring(0, 5)}</Text>
                          </div>
                          {facility.numberOfShifts > 2 && (
                            <div className="flex items-center mt-2">
                              <ClockCircleOutlined className="mr-2 text-blue-600" />
                              <Text>{facility.openTime3.substring(0, 5)} - {facility.closeTime3.substring(0, 5)}</Text>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mb-4 md:mb-6">
                      <Title level={4} className="mb-2 md:mb-3 text-lg md:text-xl">Địa chỉ</Title>
                      <div className="flex items-center">
                        <EnvironmentOutlined className="mr-2 text-blue-600" />
                        <Text>{facility.location}</Text>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 md:mb-6">
                      <Title level={4} className="mb-2 md:mb-3 text-lg md:text-xl">Môn thể thao</Title>
                      <div className="flex flex-wrap gap-2">
                        {facility.sports.map(sport => (
                          <Tag key={sport.id} color="blue" className="px-2 py-1 text-sm md:text-base">{sport.name}</Tag>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Title level={4} className="mb-2 md:mb-3 text-lg md:text-xl">Mô tả</Title>
                      <Paragraph className="text-sm md:text-base">{facility.description}</Paragraph>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fields' && (
              <div>
                <Title level={4} className="mb-3 md:mb-4 text-lg md:text-xl">Danh sách sân</Title>
                {fieldGroups.length > 0 ? (
                  <Collapse 
                    defaultActiveKey={[fieldGroups[0]?.id]} 
                    className="mb-4"
                    items={getCollapseItems()}
                  />
                ) : (
                  <Empty description="Không có thông tin sân" />
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <Title level={4} className="mb-3 md:mb-4 text-lg md:text-xl">Dịch vụ</Title>
                {services.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={services}
                    renderItem={service => (
                      <List.Item
                        actions={[
                          <Text key="price" className="text-blue-600 font-semibold">{service.price.toLocaleString()}đ</Text>
                        ]}
                      >
                        <List.Item.Meta
                          title={<Text strong>{service.name}</Text>}
                          description={
                            <Space direction="vertical" className="text-sm">
                              <Text>{service.description}</Text>
                              <Text>Số lượng: {service.amount}</Text>
                              <Text>Môn thể thao: {service.sport?.name || 'Không có thông tin'}</Text>
                              <Text>Đơn vị: {service.unit}</Text>
                              <Text>Đã đặt: {service.bookedCount}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="Không có thông tin dịch vụ" />
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Reviews */}
        <section className="mb-6 md:mb-8">
          <Card className="shadow-md">
            <Title level={3} className="mb-4 md:mb-6 text-lg md:text-xl lg:text-2xl">Đánh giá</Title>
            
            <div className="flex flex-col md:flex-row md:items-center mb-4 md:mb-6 gap-4">
              <div className="text-center">
                <Title level={1} className="m-0 text-blue-600 text-2xl md:text-4xl">{facility.avgRating || 0}</Title>
                <Rate disabled defaultValue={facility.avgRating || 0} allowHalf />
                <Text className="block mt-1 md:mt-2 text-sm">{facility.numberOfRatings || 0} đánh giá</Text>
              </div>
              <Divider type="vertical" className="hidden md:block md:h-20" />
              <div>
                <Title level={4} className="mb-1 md:mb-2 text-base md:text-lg">Đánh giá của người chơi</Title>
                <Text className="text-sm">Dựa trên trải nghiệm thực tế của người chơi đã đặt sân tại cơ sở này</Text>
              </div>
            </div>

            {facility.numberOfRatings === 0 && (
              <Empty description="Chưa có đánh giá nào" />
            )}

            <div className="mt-4 text-center">
              <Button 
                type="default" 
                icon={<CommentOutlined />}
              >
                Viết đánh giá
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default DetailFacility;