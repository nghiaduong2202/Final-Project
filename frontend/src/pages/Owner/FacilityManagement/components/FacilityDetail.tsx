import React, { useState, useEffect } from 'react';
import { 
  Spin, 
  Tabs, 
  Button, 
  Tag, 
  Image, 
  Typography, 
  Card, 
  List, 
  Empty, 
  Divider,
  Table,
  Timeline,
  message
} from 'antd';
import { 
  EnvironmentOutlined, 
  EditOutlined,
  FileOutlined,
  StarOutlined,
  CalendarOutlined,
  TagOutlined,
  FieldTimeOutlined,
  DollarOutlined,
  CommentOutlined,
  UpOutlined,
  DownOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  GiftOutlined,
  HistoryOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { Facility } from '@/types/facility.type';
import { Event, EventDetail, EventPrize } from '@/types/event.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchFacilityById } from '@/store/slices/facilitySlice';
import { FieldGroup } from '@/types/field.type';

const { Title, Text, Paragraph } = Typography;

interface FacilityDetailProps {
  facilityId: string;
  onClose: () => void;
  onEdit: () => void;
}

// Thêm component con cho mỗi FieldGroup
const FieldGroupComponent: React.FC<{group: FieldGroup, facilityStatus: string}> = ({ group, facilityStatus = 'active' }) => {
  const [showFields, setShowFields] = useState(true);
  
  // Đơn giản hóa hiển thị trạng thái sân
  const renderFieldStatus = (fieldStatus: string) => {
    // Chỉ hiển thị trạng thái khi cơ sở đang hoạt động và sân đang đóng cửa
    if (facilityStatus === 'active' && fieldStatus === 'closed') {
      return <Tag color="default">Đang đóng cửa</Tag>;
    }
    // Trong các trường hợp khác không hiển thị trạng thái
    return null;
  };
  
  return (
    <Card 
      key={group.id} 
      title={
        <div className="flex justify-between items-center">
          <span>{group.name}</span>
          <Tag color="blue">{group.fields.length} sân</Tag>
        </div>
      }
      className="mb-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Text type="secondary">Kích thước:</Text>
            <Text strong className="ml-2">{group.dimension}</Text>
          </div>
          <div>
            <Text type="secondary">Mặt sân:</Text>
            <Text strong className="ml-2">{group.surface}</Text>
          </div>
          <div>
            <Text type="secondary">Giá cơ bản:</Text>
            <Text strong className="ml-2 text-blue-600">{group.basePrice?.toLocaleString()}đ/giờ</Text>
          </div>
          <div>
            <Text type="secondary">Môn thể thao:</Text>
            <span className="ml-2">
              {group.sports.map(sport => (
                <Tag key={sport.id} color="blue">{getSportNameInVietnamese(sport.name)}</Tag>
              ))}
            </span>
          </div>
        </div>
        
        {/* Giờ cao điểm */}
        <Divider orientation="left">Giờ cao điểm</Divider>
        <div className="mb-4">
          {(group.peakStartTime1 && group.peakEndTime1) || 
           (group.peakStartTime2 && group.peakEndTime2) || 
           (group.peakStartTime3 && group.peakEndTime3) ? (
            <div className="grid grid-cols-1 gap-2">
              {group.peakStartTime1 && group.peakEndTime1 && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <Text strong>Giờ cao điểm 1: {group.peakStartTime1} - {group.peakEndTime1}</Text>
                    <Text className="text-green-600 font-semibold">+{group.priceIncrease1?.toLocaleString()}đ/giờ</Text>
                  </div>
                </div>
              )}
              
              {group.peakStartTime2 && group.peakEndTime2 && group.priceIncrease2 && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <Text strong>Giờ cao điểm 2: {group.peakStartTime2} - {group.peakEndTime2}</Text>
                    <Text className="text-green-600 font-semibold">+{group.priceIncrease2?.toLocaleString()}đ/giờ</Text>
                  </div>
                </div>
              )}
              
              {group.peakStartTime3 && group.peakEndTime3 && group.priceIncrease3 && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <Text strong>Giờ cao điểm 3: {group.peakStartTime3} - {group.peakEndTime3}</Text>
                    <Text className="text-green-600 font-semibold">+{group.priceIncrease3?.toLocaleString()}đ/giờ</Text>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Empty description="Không có thông tin giờ cao điểm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4 mb-3">
          <Divider orientation="left" style={{ margin: 0, marginRight: '16px', minWidth: '100px' }}>
            Danh sách sân
          </Divider>
          <Button 
            type="primary"
            ghost
            onClick={(e) => {
              e.stopPropagation();
              setShowFields(!showFields);
            }}
            size="small"
            className="flex items-center hover:shadow-sm"
            icon={showFields ? <UpOutlined /> : <DownOutlined />}
          >
            {showFields ? 'Ẩn danh sách' : 'Hiện danh sách'}
          </Button>
        </div>
        
        {showFields && (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={group.fields}
            renderItem={field => (
              <List.Item>
                <Card size="small" hoverable className="text-center">
                  <div className="text-center">
                    <Text strong>{field.name}</Text>
                    <div className="mt-1">
                      {renderFieldStatus(field.status)}
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </Card>
  );
};

type TabKey = 'info' | 'images' | 'fields' | 'services' | 'events' | 'vouchers' | 'documents' | 'history';

const FacilityDetail: React.FC<FacilityDetailProps> = ({ facilityId, onClose, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { facility: reduxFacility, isLoading: reduxLoading, error: reduxError } = useSelector((state: RootState) => state.facility);
  
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [mainImage, setMainImage] = useState<string>('');
  
  // Add an effect to handle Redux errors
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
      message.error('Không thể tải thông tin cơ sở: ' + reduxError);
    }
  }, [reduxError]);
  
  // Fetch facility data
  useEffect(() => {
    const fetchFacilityData = async () => {
      try {
        // Nếu đã có dữ liệu trong Redux store và đúng facilityId, không cần fetch lại
        if (reduxFacility && reduxFacility.id === facilityId) {
          setFacility(reduxFacility);
          if (reduxFacility.imagesUrl && reduxFacility.imagesUrl.length > 0) {
            setMainImage(reduxFacility.imagesUrl[0]);
          }
          setLoading(false);
          return;
        }
        
        setLoading(true);
        
        // Chỉ sử dụng Redux để fetch dữ liệu
        await dispatch(fetchFacilityById(facilityId));
        // Không gọi service.getFacilityById nữa để tránh trùng lặp
      } catch (error) {
        console.error('Failed to fetch facility details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (facilityId) {
      fetchFacilityData();
    }
  }, [facilityId, dispatch, reduxFacility]);
  
  // Also add a useEffect to update component state when Redux state changes
  useEffect(() => {
    if (reduxFacility && reduxFacility.id === facilityId) {
      setFacility(reduxFacility);
      if (reduxFacility.imagesUrl && reduxFacility.imagesUrl.length > 0) {
        setMainImage(reduxFacility.imagesUrl[0]);
      }
      setLoading(reduxLoading);
    }
  }, [reduxFacility, reduxLoading, facilityId]);  
 
  // Trích xuất danh sách môn thể thao từ fieldGroups
  const sportsList = React.useMemo(() => {
    if (!facility?.fieldGroups || facility.fieldGroups.length === 0) return [];
    
    // Thu thập tất cả các thông tin sport từ tất cả các fieldGroups
    const allSports: Array<{id: number, name: string}> = [];
    
    facility.fieldGroups.forEach(group => {
      if (group.sports && Array.isArray(group.sports)) {
        group.sports.forEach(sport => {
          if (!allSports.some(s => s.id === sport.id)) {
            allSports.push(sport);
          }
        });
      }
    });
    
    return allSports;
  }, [facility?.fieldGroups]);
  
  const getStatusTag = (status: string) => {
    switch(status) {
      case 'active': return <Tag color="success">Đang hoạt động</Tag>;
      case 'unactive': return <Tag color="default">Đang đóng cửa</Tag>;
      case 'pending': return <Tag color="warning">Đang chờ phê duyệt</Tag>;
      case 'rejected': return <Tag color="error">Đã bị từ chối</Tag>;
      default: return <Tag color="default">Không xác định</Tag>;
    }
  };
  
  const handleThumbnailClick = (imageUrl: string) => {
    setMainImage(imageUrl);
  };
  
  // Function to get status with proper format for vouchers
  const getVoucherStatus = (startDate: string, endDate: string): 'active' | 'upcoming' | 'expired' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
  };
  
  // Định dạng giá trị giảm giá dựa trên loại voucher
  const formatDiscountValue = (type: 'cash' | 'percent', value: number): string => {
    return type === 'percent' ? `${value}%` : `${value.toLocaleString()}đ`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-64 flex-col">
        <Empty description={`Lỗi khi tải dữ liệu: ${error}`} />
        <Button className="mt-4" onClick={() => onClose()}>Đóng</Button>
      </div>
    );
  }
  
  if (!facility) {
    return (
      <div className="p-8">
        <Empty description="Không tìm thấy thông tin cơ sở" />
        <div className="flex justify-center mt-4">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    );
  }
  
  const tabItems = [
    { key: 'info' as TabKey, label: 'Thông tin cơ bản', icon: <InfoCircleOutlined /> },
    { key: 'images' as TabKey, label: 'Hình ảnh', icon: <PictureOutlined /> },
    { key: 'fields' as TabKey, label: 'Nhóm sân', icon: <AppstoreOutlined /> },
    { key: 'services' as TabKey, label: 'Dịch vụ', icon: <ShoppingOutlined /> },
    { key: 'events' as TabKey, label: 'Sự kiện', icon: <CalendarOutlined /> },
    { key: 'vouchers' as TabKey, label: 'Khuyến mãi', icon: <GiftOutlined /> },
    { key: 'documents' as TabKey, label: 'Giấy tờ xác thực', icon: <SafetyOutlined /> },
    { key: 'history' as TabKey, label: 'Lịch sử xác thực', icon: <HistoryOutlined /> }
  ];
  
  return (
    <div className="facility-detail w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b shadow-sm">
        {/* Facility title and edit button row */}
        <div className="flex justify-between items-center px-5 mt-8">
          <div>
            <div className="flex items-center">
              <Title level={3} className="m-0 mr-3">{facility.name}</Title>
              {getStatusTag(facility.status)}
            </div>
          </div>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={onEdit}
            size="middle"
          >
            Chỉnh sửa
          </Button>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key as TabKey)}
          items={tabItems.map(item => ({
            key: item.key,
            label: (
              <span>
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            )
          }))}
          className="px-6"
          size="large"
        />
      </div>
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'info' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản - khối thông tin ngắn */}
              <Card 
                title={<div className="flex items-center"><FieldTimeOutlined className="mr-2 text-blue-600" /> Thông tin cơ sở</div>}
                className="h-full shadow-sm hover:shadow-md transition-shadow"
              >
                <ul className="list-none p-0 m-0 space-y-4">
                  <li className="flex items-start">                    
                    <FieldTimeOutlined className="text-blue-600 mr-3 mt-1" />                 
                    <div className="flex-1">
                      <Text strong className="block mb-2">Giờ mở cửa:</Text>                      
                      <div className='pl-2 space-y-1'>
                        <Text className="block">Ca 1: {facility.openTime1?.substring(0, 5) || ''} - {facility.closeTime1?.substring(0, 5) || ''}</Text>
                        {facility.numberOfShifts > 1 && (
                          <Text className="block">Ca 2: {facility.openTime2?.substring(0, 5) || ''} - {facility.closeTime2?.substring(0, 5) || ''}</Text>
                        )}
                        {facility.numberOfShifts > 2 && (
                          <Text className="block">Ca 3: {facility.openTime3?.substring(0, 5) || ''} - {facility.closeTime3?.substring(0, 5) || ''}</Text>
                        )}
                      </div>
                    </div>
                  </li>
                  <Divider className="my-3" />
                  <li className="flex items-start">
                    <DollarOutlined className="text-blue-600 mr-3 mt-1" />
                    <div className="flex-1">
                      <Text strong className="block mb-2">Giá dao động:</Text>
                      <div className="pl-2">
                        {facility.minPrice && facility.maxPrice ? (
                          <Text className="block">{facility.minPrice.toLocaleString()}đ - {facility.maxPrice.toLocaleString()}đ</Text>
                        ) : (
                          <Text className="block text-gray-500">Chưa có thông tin giá</Text>
                        )}
                      </div>
                    </div>
                  </li>
                  <Divider className="my-3" />
                  <li className="flex items-start">
                    <TagOutlined className="text-blue-600 mr-3 mt-1" />
                    <div className="flex-1">
                      <Text strong className="block mb-2">Môn thể thao:</Text>
                      <div className="pl-2">
                        {sportsList && sportsList.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {sportsList.map((sport) => (
                              <Tag key={sport.id} color="blue" className="px-2 py-1 text-sm rounded-full">
                                {getSportNameInVietnamese(sport.name)}
                              </Tag>
                            ))}
                          </div>
                        ) : (
                          <Text type="secondary">Không có thông tin về môn thể thao</Text>
                        )}
                      </div>
                    </div>
                  </li>
                </ul>
              </Card>

              {/* Mô tả - khối thông tin dài */}
              <Card 
                title={<div className="flex items-center"><CommentOutlined className="mr-2 text-blue-600" /> Mô tả cơ sở</div>}
                className="h-full shadow-sm hover:shadow-md transition-shadow"
              >
                <Paragraph className="text-sm md:text-base text-justify whitespace-pre-line mb-4">
                  {facility.description || "Chưa có mô tả chi tiết cho cơ sở này."}
                </Paragraph>
                
                <Divider className="my-4" />
                
                <div className="flex items-start mt-4">
                  <EnvironmentOutlined className="text-blue-600 mr-3 mt-1" />
                  <div className="flex-1">
                    <Text strong className="block mb-2">Địa chỉ:</Text>
                    <div className="pl-2">
                      <Text className="block">{facility.location}</Text>
                    </div>
                  </div>
                </div>
                
                <Divider className="my-4" />
                
                <div className="flex items-start mt-4">
                  <StarOutlined className="text-blue-600 mr-3 mt-1" />
                  <div className="flex-1">
                    <Text strong className="block mb-2">Đánh giá:</Text>
                    <div className="pl-2 flex items-center">
                      <Text className="text-lg text-blue-600 font-bold mr-2">{facility.avgRating.toFixed(1)}</Text>
                      <Text className="mr-2">/ 5</Text>
                      <Text className="text-gray-500">({facility.numberOfRating} đánh giá)</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {activeTab === 'images' && (
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
            <div className="mb-6">
              <div className="max-h-96 overflow-hidden rounded-lg mb-4">
                <Image
                  src={mainImage}
                  alt={facility.name}
                  className="w-full object-cover"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {facility.imagesUrl && facility.imagesUrl.map((image, index) => (
                  <div 
                    key={index} 
                    className={`w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 ${image === mainImage ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => handleThumbnailClick(image)}
                  >
                    <img src={image} alt={`${facility.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'fields' && (
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
            {facility?.fieldGroups && facility.fieldGroups.length > 0 ? (
              <div>
                {facility.fieldGroups.map(group => (
                  <FieldGroupComponent 
                    key={group.id} 
                    group={group} 
                    facilityStatus={facility.status}
                  />
                ))}
              </div>
            ) : (
              <Empty description="Cơ sở này chưa có thông tin về sân" />
            )}
          </div>
        )}
        
        {activeTab === 'services' && (
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
            {facility?.services && facility.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {facility.services.map(service => (
                  <Card 
                    key={service.id}
                    hoverable
                    className="h-full"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Title level={5}>{service.name}</Title>                        
                      </div>
                      
                      <Paragraph className="text-gray-500 mb-4">{service.description}</Paragraph>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <Text type="secondary">{service.type === 'rental' ? 'Cho thuê' : 'Dịch vụ'}</Text>
                          <Tag color="blue" className="ml-2">{service.sport?.name}</Tag>
                        </div>
                        <Text className="text-lg font-bold text-blue-600">
                          {service.price.toLocaleString()}đ/{service.unit === 'time' ? 'giờ' : service.unit === 'quantity' ? 'sản phẩm' : service.unit}
                        </Text>
                      </div>
                      
                      <Divider style={{ margin: '12px 0' }} />
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <Text type="secondary">Số lượng còn lại:</Text>
                          <Text strong className="ml-1 text-green-600">{service.amount?.toLocaleString() || 0}</Text>
                        </div>
                        {/* {service.popularityScore !== undefined && (
                          <div>
                            <Text type="secondary">Độ phổ biến:</Text>
                            <Text strong className="ml-1">{service.popularityScore}/100</Text>
                          </div>
                        )} */}
                        {service.bookedCount !== undefined && (
                          <div>
                            <Text type="secondary">Lượt đặt:</Text>
                            <Text strong className="ml-1">{service.bookedCount}</Text>
                          </div>
                        )}
                        {service.bookedCountOnDate !== undefined && (
                          <div>
                            <Text type="secondary">Đang sử dụng:</Text>
                            <Text strong className="ml-1">{service.bookedCountOnDate}</Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="Cơ sở này chưa có dịch vụ nào" />
            )}
          </div>
        )}
        
        {activeTab === 'events' && (
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
            {facility?.events && facility.events.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {facility.events.map(event => {
                  // Get event detail from mockEventDetails if available
                  const eventDetail = (event as Event & { eventDetail?: EventDetail }).eventDetail;
                  
                  return (
                    <Card 
                      key={event.id}
                      hoverable
                      cover={event.image && <img alt={event.name} src={event.image} className="h-48 object-cover" />}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Title level={5}>{event.name}</Title>
                          <Tag color={
                            event.status === 'active' ? 'success' : 
                            event.status === 'upcoming' ? 'processing' : 'default'
                          }>
                            {event.status === 'active' ? 'Đang diễn ra' : 
                             event.status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                          </Tag>
                        </div>
                        
                        <Paragraph className="text-gray-500 mb-3" ellipsis={{ rows: 2 }}>
                          {event.description}
                        </Paragraph>
                        
                        <div className="flex items-center text-gray-500 mb-2">
                          <CalendarOutlined className="mr-2" />
                          <Text>
                            {new Date(event.startDate).toLocaleDateString('vi-VN')} - {new Date(event.endDate).toLocaleDateString('vi-VN')}
                          </Text>
                        </div>
                        
                        <div className="flex items-center text-gray-500 mb-3">
                          <TagOutlined className="mr-2" />
                          <Text>{event.eventType === 'TOURNAMENT' ? 'Giải đấu' : 
                                event.eventType === 'DISCOUNT' ? 'Khuyến mãi' : 'Sự kiện đặc biệt'}</Text>
                        </div>
                        
                        <Divider style={{ margin: '12px 0' }} />
                        
                        {/* Chi tiết bổ sung theo loại sự kiện */}
                        {event.eventType === 'TOURNAMENT' && eventDetail && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {eventDetail.maxParticipants && (
                              <div>
                                <Text type="secondary">Số người tối đa:</Text>
                                <Text strong className="ml-1">{eventDetail.maxParticipants}</Text>
                              </div>
                            )}
                            {eventDetail.currentParticipants !== undefined && (
                              <div>
                                <Text type="secondary">Đã đăng ký:</Text>
                                <Text strong className="ml-1">{eventDetail.currentParticipants}</Text>
                              </div>
                            )}
                            {eventDetail.registrationEndDate && (
                              <div className="col-span-2">
                                <Text type="secondary">Hạn đăng ký:</Text>
                                <Text strong className="ml-1">{new Date(eventDetail.registrationEndDate).toLocaleDateString('vi-VN')}</Text>
                              </div>
                            )}
                            {eventDetail.fields && eventDetail.fields.length > 0 && (
                              <div className="col-span-2">
                                <Text type="secondary">Sân tổ chức:</Text>
                                <Text strong className="ml-1">{eventDetail.fields.join(', ')}</Text>
                              </div>
                            )}
                            {eventDetail.prizes && eventDetail.prizes.length > 0 && (
                              <div className="col-span-2 mt-2">
                                <Text type="secondary">Giải thưởng:</Text>
                                <ul className="list-disc pl-5 mt-1">
                                  {eventDetail.prizes.map((prize: EventPrize, index: number) => (
                                    <li key={index}>
                                      Giải {prize.position}: {prize.prize}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {event.eventType === 'DISCOUNT' && eventDetail && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {eventDetail.discountPercent && (
                              <div>
                                <Text type="secondary">Mức giảm giá:</Text>
                                <Text strong className="ml-1 text-red-600">{eventDetail.discountPercent}%</Text>
                              </div>
                            )}
                            {eventDetail.minBookingValue && (
                              <div>
                                <Text type="secondary">Đơn tối thiểu:</Text>
                                <Text strong className="ml-1">{eventDetail.minBookingValue.toLocaleString()}đ</Text>
                              </div>
                            )}
                            {eventDetail.conditions && (
                              <div className="col-span-2">
                                <Text type="secondary">Điều kiện áp dụng:</Text>
                                <Text strong className="ml-1">{eventDetail.conditions}</Text>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {event.eventType === 'SPECIAL_OFFER' && eventDetail && (
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            {eventDetail.activities && eventDetail.activities.length > 0 && (
                              <div>
                                <Text type="secondary">Các hoạt động:</Text>
                                <div className="mt-1">
                                  {eventDetail.activities.map((activity, index) => (
                                    <Tag key={index} color="blue" style={{ margin: '2px' }}>{activity}</Tag>
                                  ))}
                                </div>
                              </div>
                            )}
                            {eventDetail.specialServices && eventDetail.specialServices.length > 0 && (
                              <div className="mt-2">
                                <Text type="secondary">Dịch vụ đặc biệt:</Text>
                                <div className="mt-1">
                                  {eventDetail.specialServices.map((service, index) => (
                                    <Tag key={index} color="green" style={{ margin: '2px' }}>{service}</Tag>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Empty description="Cơ sở này chưa có sự kiện nào" />
            )}
          </div>
        )}
        
        {activeTab === 'vouchers' && (
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
            {facility?.vouchers && facility.vouchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {facility.vouchers.map(voucher => {
                  // Get voucher status
                  const status = getVoucherStatus(voucher.startDate, voucher.endDate);
                  
                  return (
                    <Card 
                      key={voucher.id}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <Title level={5} className="text-blue-700">{voucher.name}</Title>
                            <div>
                              <Tag 
                                color={
                                  status === 'active' ? 'success' : 
                                  status === 'upcoming' ? 'processing' : 'error'
                                }
                              >
                                {status === 'active' ? 'Đang diễn ra' : 
                                 status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                              </Tag>
                            </div>
                          </div>
                          <div className="bg-white px-3 py-1 rounded-full border border-blue-200 text-blue-700 font-bold">
                            {voucher.code}
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg mb-4">
                          <div className="text-center mb-2">
                            <Text className="text-2xl font-bold text-red-600">
                              {formatDiscountValue(voucher.voucherType, voucher.discount)}
                            </Text>
                          </div>
                          
                          <div className="text-center text-gray-500 text-sm">
                            {voucher.voucherType === 'percent' && voucher.maxDiscount > 0 && 
                              <div>Tối đa {voucher.maxDiscount.toLocaleString()}đ</div>
                            }
                            <div>Đơn tối thiểu {voucher.minPrice.toLocaleString()}đ</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <Text strong>Thời gian hiệu lực:</Text>
                            <Text>
                              {new Date(voucher.startDate).toLocaleDateString('vi-VN')} - {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                            </Text>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <Text type="secondary">Tổng số lượng:</Text>
                            <Text>{voucher.amount}</Text>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <Text type="secondary">Còn lại:</Text>
                            <Text strong className="text-green-600">{voucher.remain}/{voucher.amount}</Text>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <Text type="secondary">Ngày tạo:</Text>
                            <Text>{new Date(voucher.createdAt).toLocaleDateString('vi-VN')}</Text>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <Text type="secondary">Cập nhật lần cuối:</Text>
                            <Text>{new Date(voucher.updatedAt).toLocaleDateString('vi-VN')}</Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Empty description="Cơ sở này chưa có khuyến mãi nào" />
            )}
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
            <Card title="Giấy chứng nhận" className="mb-6">
              {facility.certificate && facility.certificate.verified ? (
                <div className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <FileOutlined className="text-blue-500 mr-3 text-lg" />
                    <div>
                      <Text strong>Giấy chứng nhận cơ sở kinh doanh</Text>
                      <Text className="block text-gray-500 text-sm">Đã được cập nhật</Text>
                    </div>
                  </div>
                  <Button type="link" href={facility.certificate.verified} target="_blank">
                    Xem
                  </Button>
                </div>
              ) : (
                <Empty description="Chưa có giấy chứng nhận" />
              )}
            </Card>
            
            <Card title="Giấy phép kinh doanh">
              {sportsList && sportsList.length > 0 ? (
                <Table 
                  dataSource={sportsList.map(sport => {
                    // Tìm license tương ứng với sport nếu có
                    const license = facility.licenses?.find(license => license.sportId === sport.id);
                    
                    return {
                      sportId: sport.id,
                      sportName: sport.name,
                      verified: license?.verified || null,
                      temporary: license?.temporary || null
                    };
                  })}
                  rowKey={(record) => `sport-${record.sportId}`}
                  pagination={false}
                  columns={[
                    {
                      title: 'Môn thể thao',
                      dataIndex: 'sportName',
                      key: 'sportName',
                      render: (sportName) => getSportNameInVietnamese(sportName)
                    },
                    {
                      title: 'Trạng thái',
                      key: 'status',
                      render: (_, record) => (
                        record.verified ? 
                          <Tag color="success">Đã cập nhật</Tag> : 
                          <Tag color="default">Chưa cập nhật</Tag>
                      )
                    },
                    {
                      title: 'Hành động',
                      key: 'action',
                      render: (_, record) => (
                        record.verified ? (
                          <Button type="link" href={record.verified} target="_blank">
                            Xem giấy phép
                          </Button>
                        ) : (
                          <Text type="secondary">Không có tài liệu</Text>
                        )
                      )
                    }
                  ]}
                />
              ) : (
                <Empty description="Chưa có thông tin về môn thể thao" />
              )}
            </Card>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
            <Card title="Lịch sử các yêu cầu phê duyệt" className="shadow-sm">
              {facility.approvals && facility.approvals.length > 0 ? (
                <Timeline className="p-2">
                  {facility.approvals.map((approval, index) => {
                    // Xác định màu sắc cho timeline item dựa trên trạng thái phê duyệt
                    const color = 
                      approval.status === 'approved' ? 'green' :
                      approval.status === 'pending' ? 'blue' : 'red';
                    
                    // Xác định nội dung hiển thị dựa trên loại approval
                    let title = '';
                    switch(approval.type) {
                      case 'facility':
                        title = 'Đăng ký cơ sở thể thao';
                        break;
                      case 'facility_name':
                        title = `Cập nhật tên cơ sở: ${approval.name || ''}`;
                        break;
                      case 'certificate':
                        title = 'Cập nhật giấy chứng nhận';
                        break;
                      case 'license':
                        title = `Cập nhật giấy phép ${approval.sport ? ` (${getSportNameInVietnamese(approval.sport.name)})` : ''}`;
                        break;
                      default:
                        title = 'Yêu cầu xác thực';
                    }
                    
                    return (
                      <Timeline.Item 
                        key={approval.id || index}
                        color={color}
                        className="pb-4"
                      >
                        <div className="mb-2 bg-gray-50 p-3 rounded-md border border-gray-100">
                          <div className="flex justify-between items-center flex-wrap">
                            <Text strong className="text-lg">{title}</Text>
                            <Tag 
                              className="ml-2"
                              color={
                                approval.status === 'approved' ? 'success' :
                                approval.status === 'pending' ? 'processing' : 'error'
                              }
                            >
                              {approval.status === 'approved' ? 'Đã chấp thuận' :
                              approval.status === 'pending' ? 'Đang chờ' : 'Đã từ chối'
                              }
                            </Tag>
                          </div>
                          
                          <div className="mt-3 space-y-2 text-sm">
                            {approval.note && (
                              <div className="p-2 bg-white rounded border border-gray-100">
                                <Text type="secondary" strong>Ghi chú:</Text>
                                <div className="mt-1 pl-3">{approval.note}</div>
                              </div>
                            )}
                            <div className="flex justify-between flex-wrap">
                              <div>
                                <Text type="secondary" strong>Ngày yêu cầu:</Text>
                                <Text className="ml-2">{new Date(approval.createdAt).toLocaleString('vi-VN')}</Text>
                              </div>
                              {approval.updatedAt && approval.updatedAt !== approval.createdAt && (
                                <div>
                                  <Text type="secondary" strong>Ngày xử lý:</Text>
                                  <Text className="ml-2">{new Date(approval.updatedAt).toLocaleString('vi-VN')}</Text>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              ) : (
                <Empty description="Không có lịch sử xác thực" />
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityDetail; 