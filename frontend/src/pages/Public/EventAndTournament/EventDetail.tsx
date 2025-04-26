import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Breadcrumb, 
  Tag, 
  Image, 
  Button, 
  Typography, 
  Tabs, 
  Spin, 
  Empty, 
  Card, 
  Divider, 
  List, 
  Avatar, 
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Descriptions,
  message
} from 'antd';
import { 
  EnvironmentOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  TrophyOutlined, 
  PercentageOutlined, 
  GiftOutlined, 
  DollarOutlined, 
  InfoCircleOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { mockEvents } from '@/mocks/event/eventData';
import { mockFacilitiesDropdown } from '@/mocks/facility/mockFacilities';
import { EventType, EventStatus, DisplayEvent } from '@/types/event.type';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { showLoginModal } from '@/store/slices/userSlice';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Mock facility data for display
const mockFacilityDetails: Record<string, { name: string; address: string }> = {
  '1': { name: 'Sân bóng đá Phạm Kha', address: '123 Đường Phạm Văn Đồng, Quận Gò Vấp, TPHCM' },
  '2': { name: 'Sân Tennis Bình Chánh', address: '456 Đường Nguyễn Văn Linh, Huyện Bình Chánh, TPHCM' },
  '3': { name: 'Sân bóng rổ Quận 7', address: '789 Đường Nguyễn Thị Thập, Quận 7, TPHCM' },
  '4': { name: 'Sân cầu lông Phạm Kha', address: '123 Đường Phạm Văn Đồng, Quận Gò Vấp, TPHCM' }
};

// Mock sports data that will be used in events
const mockSports = [
  { id: 1, name: 'Bóng đá' },
  { id: 2, name: 'Bóng rổ' },
  { id: 3, name: 'Tennis' },
  { id: 4, name: 'Cầu lông' }
];

const EventDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const shouldOpenRegister = queryParams.get('register') === 'true';
  
  // Auth state
  const { isAuthenticated } = useAppSelector(state => state.user);
  
  // Local state
  const [event, setEvent] = useState<DisplayEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [facility, setFacility] = useState<{id: string; name: string; image?: string}|null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registrationForm] = Form.useForm();
  
  // Mock fetch event data
  useEffect(() => {
    if (!eventId) return;
    
    const fetchEventData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const eventData = mockEvents.find(e => e.id === Number(eventId));
        
        if (!eventData) {
          setLoading(false);
          return;
        }
        
        // Find facility
        const facilityData = mockFacilitiesDropdown.find(f => f.id === eventData.facilityId);
        setFacility(facilityData || null);
        
        // Get facility details from our mock data
        const facilityDetails = mockFacilityDetails[eventData.facilityId];
        
        // Create enhanced event with facility info
        const enhancedEvent: DisplayEvent = {
          ...eventData,
          facilityName: facilityDetails?.name || facilityData?.name || 'Không xác định',
          facilityAddress: facilityDetails?.address || 'Địa chỉ không xác định'
        };
        
        // Add sport name if applicable
        if (eventData.sportIds && eventData.sportIds.length > 0) {
          const sportId = eventData.sportIds[0];
          const sport = mockSports.find(s => s.id === sportId);
          if (sport) {
            enhancedEvent.sportName = sport.name;
          }
        }
        
        setEvent(enhancedEvent);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId]);
  
  // Show register modal if ?register=true in URL
  useEffect(() => {
    if (shouldOpenRegister && event && !loading) {
      handleRegisterClick();
    }
  }, [shouldOpenRegister, event, loading]);
  
  // Handle go back
  const handleGoBack = () => {
    navigate('/events');
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };
  
  
  // Helper function to render event status
  const renderEventStatus = (status?: EventStatus) => {
    if (!status) return null;
    
    const statusConfig = {
      active: { color: 'green', text: 'Đang diễn ra' },
      upcoming: { color: 'blue', text: 'Sắp diễn ra' },
      expired: { color: 'default', text: 'Đã kết thúc' }
    };
    
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };
  
  // Helper function to render event type
  const renderEventType = (type?: EventType) => {
    if (!type) return null;
    
    const typeConfig = {
      TOURNAMENT: { color: 'magenta', text: 'Giải đấu', icon: <TrophyOutlined /> },
      DISCOUNT: { color: 'green', text: 'Khuyến mãi', icon: <PercentageOutlined /> }
    };
    
    const config = typeConfig[type];
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };
  
  // Format tournament type
  const formatTournamentType = (format?: string[] | string) => {
    if (!format) return 'Không xác định';
    
    if (Array.isArray(format)) {
      const formatMap: Record<string, string> = {
        'knockout': 'Đấu loại trực tiếp',
        'roundRobin': 'Vòng tròn',
        'hybrid': 'Vòng bảng + loại trực tiếp',
        'points': 'Tính điểm',
        'other': 'Khác'
      };
      
      return format.map(f => formatMap[f] || f).join(', ');
    }
    
    return format;
  };
  
  // Check if registration is available
  const isRegistrationAvailable = () => {
    if (!event) return false;
    
    if (event.status === 'expired') return false;
    
    if (event.eventType === 'TOURNAMENT') {
      // Check if current date is before registration end date
      if (event.registrationEndDate) {
        const now = new Date();
        const endDate = new Date(event.registrationEndDate);
        if (now > endDate) return false;
      }
      
      // Check if max participants reached
      if (event.currentParticipants !== undefined && 
          event.maxParticipants !== undefined && 
          event.currentParticipants >= event.maxParticipants) return false;
    }
    
    return true;
  };
  
  // Handle register click
  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      dispatch(showLoginModal({ path: `/event/${eventId}?register=true` }));
      return;
    }
    
    if (event?.eventType === 'TOURNAMENT') {
      setShowRegisterModal(true);
    } else if (event?.eventType === 'DISCOUNT' && event.facilityId) {
      navigate(`/booking/${event.facilityId}`);
    }
  };
  
  // Handle register submit
  const handleRegisterSubmit = () => {
    registrationForm.validateFields()
      .then(() => {
        message.success('Đăng ký thành công! Ban tổ chức sẽ liên hệ với bạn.');
        setShowRegisterModal(false);
        registrationForm.resetFields();
      })
      .catch(info => console.log('Validate Failed:', info));
  };
  
  // Handle visit facility
  const handleVisitFacility = () => {
    if (event?.facilityId) {
      navigate(`/facility/${event.facilityId}`);
    }
  };
  
  // Breadcrumb items
  const breadcrumbItems = [
    { title: <Link to="/">Trang chủ</Link> },
    { title: <Link to="/events">Sự kiện & Giải đấu</Link> },
    { title: event?.name || 'Chi tiết sự kiện' }
  ];
  
  // Render loading state
  if (loading) {
    return (
      <div className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }
  
  // Render not found state
  if (!event) {
    return (
      <div className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <Empty
            description="Không tìm thấy sự kiện"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={handleGoBack}>
              Quay lại danh sách
            </Button>
          </Empty>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Section 1: Breadcrumb, Event Name, Status, and Image */}
        <section className="mb-6 md:mb-8">
          <div className="flex items-center mb-3">            
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
            <Title level={2} className="m-0 text-xl md:text-2xl lg:text-3xl">{event.name}</Title>
            <div className="flex gap-2">
              {renderEventStatus(event.status)}
              {renderEventType(event.eventType)}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Image
                  src={event.image && event.image.length > 0 ? event.image[0] : 'https://via.placeholder.com/800x400'}
                  alt={event.name}
                  className="w-full rounded-lg"
                  style={{ height: 'auto', maxHeight: '400px', objectFit: 'cover' }}
                />
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="mb-4">
                  <Title level={4}>Thông tin chung</Title>
                  <Divider className="my-3" />
                  
                  <Descriptions column={1} className="mb-3">
                    <Descriptions.Item label={<span className="font-medium"><CalendarOutlined className="mr-2" />Thời gian</span>}>
                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<span className="font-medium"><EnvironmentOutlined className="mr-2" />Địa điểm</span>}>
                      {event.location || event.facilityName}
                    </Descriptions.Item>
                    
                    {event.eventType === 'TOURNAMENT' && (
                      <>
                        {event.sportName && (
                          <Descriptions.Item label={<span className="font-medium"><InfoCircleOutlined className="mr-2" />Môn thể thao</span>}>
                            {event.sportName}
                          </Descriptions.Item>
                        )}
                        
                        {event.maxParticipants && (
                          <Descriptions.Item label={<span className="font-medium"><TeamOutlined className="mr-2" />Số người tham gia</span>}>
                            {event.currentParticipants !== undefined ? 
                              `${event.currentParticipants}/${event.maxParticipants} người` : 
                              `Tối đa ${event.maxParticipants} người`}
                          </Descriptions.Item>
                        )}
                        
                        {event.registrationEndDate && (
                          <Descriptions.Item label={<span className="font-medium"><ClockCircleOutlined className="mr-2" />Hạn đăng ký</span>}>
                            {formatDate(event.registrationEndDate)}
                          </Descriptions.Item>
                        )}
                      </>
                    )}
                    
                    {event.eventType === 'DISCOUNT' && (
                      <>
                        {event.discountType === 'PERCENT' && event.discountPercent && (
                          <Descriptions.Item label={<span className="font-medium"><PercentageOutlined className="mr-2" />Mức giảm giá</span>}>
                            {event.discountPercent}%
                          </Descriptions.Item>
                        )}
                        
                        {event.discountType === 'FIXED_AMOUNT' && event.discountAmount && (
                          <Descriptions.Item label={<span className="font-medium"><DollarOutlined className="mr-2" />Mức giảm giá</span>}>
                            {event.discountAmount.toLocaleString('vi-VN')}đ
                          </Descriptions.Item>
                        )}
                        
                        {event.discountType === 'FREE_SLOT' && event.freeSlots && (
                          <Descriptions.Item label={<span className="font-medium"><GiftOutlined className="mr-2" />Ưu đãi</span>}>
                            {event.freeSlots} lượt đặt miễn phí
                          </Descriptions.Item>
                        )}
                        
                        {event.minBookingValue !== undefined && (
                          <Descriptions.Item label={<span className="font-medium"><DollarOutlined className="mr-2" />Giá trị đơn tối thiểu</span>}>
                            {event.minBookingValue.toLocaleString('vi-VN')}đ
                          </Descriptions.Item>
                        )}
                      </>
                    )}
                  </Descriptions>
                  
                  <div className="flex gap-2 mt-6">
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={handleRegisterClick}
                      disabled={!isRegistrationAvailable()}
                    >
                      {event.eventType === 'TOURNAMENT' ? 'Đăng ký tham gia' : 'Sử dụng ưu đãi'}
                    </Button>
                    
                    <Button 
                      type="default" 
                      size="large"
                      onClick={handleVisitFacility}
                    >
                      Xem cơ sở thể thao
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Section 2: Event Details */}
        <section className="mb-6">
          <Card>
            <Tabs defaultActiveKey="info">
              <Tabs.TabPane tab="Thông tin chi tiết" key="info">
                <div className="py-4">
                  {event.description && (
                    <div className="mb-6">
                      <Title level={4}>Mô tả</Title>
                      <Paragraph>{event.description}</Paragraph>
                    </div>
                  )}
                  
                  {event.eventType === 'TOURNAMENT' && (
                    <>
                      {event.tournamentFormat && (
                        <div className="mb-6">
                          <Title level={4}>Thể thức thi đấu</Title>
                          <Paragraph>{formatTournamentType(event.tournamentFormat)}</Paragraph>
                          {event.tournamentFormatDescription && (
                            <Paragraph>{event.tournamentFormatDescription}</Paragraph>
                          )}
                        </div>
                      )}
                      
                      {event.prizes && event.prizes.length > 0 && (
                        <div className="mb-6">
                          <Title level={4}>Giải thưởng</Title>
                          {event.totalPrize && (
                            <Paragraph><strong>Tổng giải thưởng:</strong> {event.totalPrize}</Paragraph>
                          )}
                          {event.prizeDescription && (
                            <Paragraph>{event.prizeDescription}</Paragraph>
                          )}
                          <List
                            itemLayout="horizontal"
                            dataSource={event.prizes}
                            renderItem={prize => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: 
                                    prize.position === 1 ? '#FFD700' : 
                                    prize.position === 2 ? '#C0C0C0' : 
                                    prize.position === 3 ? '#CD7F32' : '#1890ff'
                                  }} />}
                                  title={`Hạng ${prize.position}`}
                                  description={prize.prize}
                                />
                              </List.Item>
                            )}
                          />
                        </div>
                      )}
                      
                      {event.rulesAndRegulations && (
                        <div className="mb-6">
                          <Title level={4}>Luật thi đấu</Title>
                          <Paragraph>{event.rulesAndRegulations}</Paragraph>
                        </div>
                      )}
                      
                      {(event.registrationFee !== undefined || event.isFreeRegistration !== undefined) && (
                        <div className="mb-6">
                          <Title level={4}>Phí tham gia</Title>
                          {event.isFreeRegistration ? (
                            <Paragraph><Tag color="green">Miễn phí tham gia</Tag></Paragraph>
                          ) : (
                            <Paragraph><strong>Phí tham gia:</strong> {event.registrationFee?.toLocaleString('vi-VN')}đ</Paragraph>
                          )}
                          
                          {!event.isFreeRegistration && event.paymentInstructions && (
                            <>
                              <Paragraph><strong>Hướng dẫn thanh toán:</strong></Paragraph>
                              <Paragraph>{event.paymentInstructions}</Paragraph>
                              
                              {event.paymentMethod && (
                                <Paragraph>
                                  <strong>Phương thức thanh toán:</strong>{' '}
                                  {Array.isArray(event.paymentMethod) 
                                    ? event.paymentMethod.join(', ') 
                                    : event.paymentMethod}
                                </Paragraph>
                              )}
                              
                              {event.paymentDeadline && (
                                <Paragraph>
                                  <strong>Hạn thanh toán:</strong> {formatDate(event.paymentDeadline)}
                                </Paragraph>
                              )}
                              
                              {event.paymentAccountInfo && (
                                <Paragraph>
                                  <strong>Thông tin tài khoản:</strong><br />
                                  {event.paymentAccountInfo}
                                </Paragraph>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      
                      {event.registrationProcess && (
                        <div className="mb-6">
                          <Title level={4}>Quy trình đăng ký</Title>
                          <Paragraph>{event.registrationProcess}</Paragraph>
                        </div>
                      )}
                    </>
                  )}
                  
                  {event.eventType === 'DISCOUNT' && (
                    <>
                      <div className="mb-6">
                        <Title level={4}>Điều kiện áp dụng</Title>
                        <Paragraph>{event.descriptionOfDiscount || 'Không có thông tin chi tiết'}</Paragraph>
                      </div>
                      
                      {event.targetUserType && (
                        <div className="mb-6">
                          <Title level={4}>Đối tượng áp dụng</Title>
                          <Paragraph>
                            {event.targetUserType === 'ALL' && 'Tất cả người chơi'}
                            {event.targetUserType === 'NEW' && 'Chỉ người mới'}
                            {event.targetUserType === 'LOYALTY' && 'Người dùng VIP'}
                          </Paragraph>
                        </div>
                      )}
                    </>
                  )}
                  
                  {event.contact && (
                    <div className="mb-6">
                      <Title level={4}>Thông tin liên hệ</Title>
                      <Descriptions column={1}>
                        <Descriptions.Item label="Người phụ trách">{event.contact.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{event.contact.email}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{event.contact.phone}</Descriptions.Item>
                      </Descriptions>
                    </div>
                  )}
                </div>
              </Tabs.TabPane>
              
              <Tabs.TabPane tab="Cơ sở thể thao" key="facility">
                <div className="py-4">
                  {facility ? (
                    <div>
                      <div className="flex items-center mb-4">
                        <Avatar size={64} src={facility.image || "https://via.placeholder.com/64"} />
                        <div className="ml-4">
                          <Title level={4} className="mb-0">{facility.name}</Title>
                          <Text type="secondary">{event.facilityAddress}</Text>
                        </div>
                      </div>
                      
                      <Paragraph>
                        Sự kiện này được tổ chức tại {facility.name}. Hãy ghé thăm cơ sở để biết thêm chi tiết.
                      </Paragraph>
                      
                      <Button type="primary" onClick={handleVisitFacility}>
                        Xem chi tiết cơ sở
                      </Button>
                    </div>
                  ) : (
                    <Empty description="Không có thông tin về cơ sở" />
                  )}
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </section>
        
        {/* Register Modal */}
        <Modal
          title={`Đăng ký tham gia ${event?.name}`}
          open={showRegisterModal}
          onCancel={() => setShowRegisterModal(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          onOk={handleRegisterSubmit}
        >
          <Form form={registrationForm} layout="vertical">
            <Form.Item
              name="userName"
              label="Họ và tên"
              rules={[{ required: true, message: 'Nhập họ và tên' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="userEmail"
              label="Email"
              rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="userPhone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Nhập số điện thoại' }]}
            >
              <Input />
            </Form.Item>
            {event?.eventType === 'TOURNAMENT' && !event?.isFreeRegistration && (
              <>
                <Form.Item
                  name="paymentMethod"
                  label="Phương thức thanh toán"
                  rules={[{ required: true, message: 'Chọn phương thức thanh toán' }]}
                >
                  <Select placeholder="Chọn phương thức">
                    <Option value="bank">Chuyển khoản</Option>
                    <Option value="momo">Momo</Option>
                    <Option value="cash">Tiền mặt</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="paymentProofFile"
                  label="Chứng từ thanh toán"
                  valuePropName="file"
                  getValueFromEvent={e => e.file.originFileObj}
                  rules={[{ required: true, message: 'Upload chứng từ thanh toán' }]}
                >
                  <Upload beforeUpload={() => false} listType="picture">
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Form.Item>
              </>
            )}
            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default EventDetailPage;