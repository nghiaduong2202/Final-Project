import React, { useState, useEffect } from 'react';
import { 
  Spin, 
  Tabs, 
  Button, 
  Tag, 
  Image, 
  Typography, 
  Card, 
  Space, 
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
  ArrowLeftOutlined,
  CalendarOutlined,
  TagOutlined
} from '@ant-design/icons';
import { Facility } from '@/types/facility.type';
import { Event, EventDetail, EventPrize } from '@/types/event.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import OperatingHoursDisplay from '@/components/shared/OperatingHoursDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchFacilityById } from '@/store/slices/facilitySlice';

const { Title, Text, Paragraph } = Typography;

interface FacilityDetailProps {
  facilityId: string;
  onClose: () => void;
  onEdit: () => void;
}

const FacilityDetail: React.FC<FacilityDetailProps> = ({ facilityId, onClose, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { facility: reduxFacility, isLoading: reduxLoading, error: reduxError } = useSelector((state: RootState) => state.facility);
  
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('info');
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
    { key: 'info', label: 'Thông tin cơ bản' },
    { key: 'images', label: 'Hình ảnh' },
    { key: 'fields', label: 'Nhóm sân' },
    { key: 'services', label: 'Dịch vụ' },
    { key: 'events', label: 'Sự kiện' },
    { key: 'vouchers', label: 'Khuyến mãi' },
    { key: 'documents', label: 'Giấy tờ xác thực' },
    { key: 'history', label: 'Lịch sử xác thực' }
  ];
  
  return (
    <div className="facility-detail">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={onClose}
              className="mr-4"
            >
              Quay lại
            </Button>
            <div>
              <div className="flex items-center">
                <Title level={4} className="m-0 mr-2">{facility.name}</Title>
                {getStatusTag(facility.status)}
              </div>
              <Text type="secondary">{facility.location}</Text>
            </div>
          </div>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={onEdit}
          >
            Chỉnh sửa
          </Button>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems.map(item => ({
            key: item.key,
            label: item.label
          }))}
        />
      </div>
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Card className="mb-4">
                <div className="mb-4">
                  <Title level={5} className="mb-2">Giờ hoạt động</Title>
                  <OperatingHoursDisplay facility={facility} />
                </div>

                <div className="mb-4">
                  <Title level={5} className="mb-2">Địa chỉ</Title>
                  <div className="flex items-start text-gray-600">
                    <EnvironmentOutlined className="mr-2 mt-1" />
                    <Text>{facility.location}</Text>
                  </div>
                </div>
                
                <div>
                  <Title level={5} className="mb-2">Môn thể thao</Title>
                  <div className="flex flex-wrap gap-2">
                    {sportsList && sportsList.length > 0 ? (
                      sportsList.map((sport) => (
                        <Tag key={sport.id} color="blue">{getSportNameInVietnamese(sport.name)}</Tag>
                      ))
                    ) : (
                      <Text type="secondary">Không có thông tin về môn thể thao</Text>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card className="mb-4">
                <div className="mb-4">
                  <Title level={5} className="mb-2">Mô tả</Title>
                  <Paragraph className="text-gray-600">{facility.description}</Paragraph>
                </div>
                
                <div>
                  <Title level={5} className="mb-2">Đánh giá</Title>
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-3 rounded-lg flex items-center mr-4">
                      <Text className="text-3xl text-blue-600 font-bold mr-1">{facility.avgRating.toFixed(1)}</Text>
                      <StarOutlined className="text-yellow-500 text-lg" />
                    </div>
                    <div>
                      <Text className="block">Dựa trên {facility.numberOfRatings} đánh giá</Text>
                      <Text type="secondary">Từ người dùng đặt sân</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {activeTab === 'images' && (
          <div>
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
          <div>
            {facility?.fieldGroups && facility.fieldGroups.length > 0 ? (
              <div>
                {facility.fieldGroups.map(group => (
                  <Card 
                    key={group.id} 
                    title={
                      <div className="flex justify-between items-center">
                        <span>{group.name}</span>
                        <Tag color="blue">{group.fields.length} sân</Tag>
                      </div>
                    }
                    className="mb-6"
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
                      
                      <Divider orientation="left">Danh sách sân</Divider>
                      
                      <List
                        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                        dataSource={group.fields}
                        renderItem={field => (
                          <List.Item>
                            <Card size="small">
                              <div className="text-center">
                                <Text strong>{field.name}</Text>
                                <div className="mt-1">
                                  <Tag color={field.status === 'active' ? 'success' : 'default'}>
                                    {field.status === 'active' ? 'Đang hoạt động' : 'Đang đóng cửa'}
                                  </Tag>
                                </div>
                              </div>
                            </Card>
                          </List.Item>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="Cơ sở này chưa có thông tin về sân" />
            )}
          </div>
        )}
        
        {activeTab === 'services' && (
          <div>
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
                        <Tag color={service.status === 'available' ? 'success' : 'warning'}>
                          {service.status === 'available' ? 'Có sẵn' : 'Sắp hết hàng'}
                        </Tag>
                      </div>
                      
                      <Paragraph className="text-gray-500 mb-4">{service.description}</Paragraph>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <Text type="secondary">{service.serviceType === 'rental' ? 'Cho thuê' : 'Dịch vụ'}</Text>
                          <Tag color="blue" className="ml-2">{service.sport?.name}</Tag>
                        </div>
                        <Text className="text-lg font-bold text-blue-600">{service.price.toLocaleString()}đ/{service.unit}</Text>
                      </div>
                      
                      <Divider style={{ margin: '12px 0' }} />
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <Text type="secondary">Số lượng còn lại:</Text>
                          <Text strong className="ml-1 text-green-600">{service.amount?.toLocaleString() || 0}</Text>
                        </div>
                        {service.popularityScore !== undefined && (
                          <div>
                            <Text type="secondary">Độ phổ biến:</Text>
                            <Text strong className="ml-1">{service.popularityScore}/100</Text>
                          </div>
                        )}
                        {service.bookedCount !== undefined && (
                          <div>
                            <Text type="secondary">Lượt đặt:</Text>
                            <Text strong className="ml-1">{service.bookedCount}</Text>
                          </div>
                        )}
                        {service.inUseCount !== undefined && (
                          <div>
                            <Text type="secondary">Đang sử dụng:</Text>
                            <Text strong className="ml-1">{service.inUseCount}</Text>
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
          <div>
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
          <div>
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
          <div>
            <Card title="Giấy chứng nhận" className="mb-6">
              {facility.certificate && (facility.certificate.verified || facility.certificate.temporary) ? (
                <Space direction="vertical" className="w-full">
                  {facility.certificate.verified && (
                    <div className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center">
                        <FileOutlined className="text-blue-500 mr-3 text-lg" />
                        <div>
                          <Text strong>Giấy chứng nhận chính thức</Text>
                          <Text className="block text-gray-500 text-sm">Đã được xác thực</Text>
                        </div>
                      </div>
                      <Button type="link" href={facility.certificate.verified} target="_blank">
                        Xem
                      </Button>
                    </div>
                  )}
                  
                  {facility.certificate.temporary && (
                    <div className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center">
                        <FileOutlined className="text-orange-500 mr-3 text-lg" />
                        <div>
                          <Text strong>Giấy chứng nhận tạm thời</Text>
                          <Text className="block text-gray-500 text-sm">Đang chờ xác thực</Text>
                        </div>
                      </div>
                      <Button type="link" href={facility.certificate.temporary} target="_blank">
                        Xem
                      </Button>
                    </div>
                  )}
                </Space>
              ) : (
                <Empty description="Chưa có giấy chứng nhận" />
              )}
            </Card>
            
            <Card title="Giấy phép kinh doanh">
              {facility.licenses && facility.licenses.length > 0 ? (
                <Table 
                  dataSource={facility.licenses}
                  rowKey={(record) => `${record.facilityId}-${record.sportId}`}
                  pagination={false}
                  columns={[
                    {
                      title: 'Môn thể thao',
                      dataIndex: 'sportId',
                      key: 'sportId',
                      render: (sportId) => {
                        // Tìm sport trong danh sách sportsList (ưu tiên)
                        const sport = sportsList.find(s => s.id === sportId);
                        if (sport) {
                          return getSportNameInVietnamese(sport.name);
                        }
                        return "Không xác định";
                      }
                    },
                    {
                      title: 'Trạng thái',
                      key: 'status',
                      render: (_, record) => (
                        <Tag color={record.verified ? 'success' : 'warning'}>
                          {record.verified ? 'Đã xác thực' : 'Đang chờ xác thực'}
                        </Tag>
                      )
                    },
                    {
                      title: 'Hành động',
                      key: 'action',
                      render: (_, record) => (
                        <Space>
                          {record.verified && (
                            <Button type="link" href={record.verified} target="_blank">
                              Xem giấy phép chính thức
                            </Button>
                          )}
                          
                          {record.temporary && (
                            <Button type="link" href={record.temporary} target="_blank">
                              Xem giấy phép tạm thời
                            </Button>
                          )}
                        </Space>
                      )
                    }
                  ]}
                />
              ) : (
                <Empty description="Chưa có giấy phép kinh doanh" />
              )}
            </Card>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div>
            {facility.verificationHistory && facility.verificationHistory.length > 0 ? (
              <Timeline>
                {facility.verificationHistory.map((item, index) => (
                  <Timeline.Item 
                    key={item.id || index}
                    color={
                      item.status === 'approved' ? 'green' :
                      item.status === 'pending' ? 'blue' : 'red'
                    }
                  >
                    <div className="mb-1">
                      <Text strong>{`Thay đổi trường "${item.field}"`}</Text>
                      <Tag 
                        className="ml-2"
                        color={
                          item.status === 'approved' ? 'success' :
                          item.status === 'pending' ? 'processing' : 'error'
                        }
                      >
                        {item.status === 'approved' ? 'Đã chấp thuận' :
                         item.status === 'pending' ? 'Đang chờ' : 'Đã từ chối'
                        }
                      </Tag>
                    </div>
                    
                    <div className="pl-4 border-l-2 border-gray-200 ml-1 mt-2">
                      <div className="mb-2">
                        <Text type="secondary">Giá trị cũ:</Text>
                        <Text className="ml-2">{item.oldValue || '(Không có)'}</Text>
                      </div>
                      <div className="mb-2">
                        <Text type="secondary">Giá trị mới:</Text>
                        <Text className="ml-2">{item.newValue}</Text>
                      </div>
                      {item.note && (
                        <div className="mb-2">
                          <Text type="secondary">Ghi chú:</Text>
                          <Text className="ml-2">{item.note}</Text>
                        </div>
                      )}
                      <div>
                        <Text type="secondary">Ngày yêu cầu:</Text>
                        <Text className="ml-2">{new Date(item.requestDate).toLocaleString('vi-VN')}</Text>
                      </div>
                      {item.updatedDate && (
                        <div>
                          <Text type="secondary">Ngày xử lý:</Text>
                          <Text className="ml-2">{new Date(item.updatedDate).toLocaleString('vi-VN')}</Text>
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="Không có lịch sử thay đổi" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityDetail; 