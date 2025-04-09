import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Typography, Button, Descriptions, Tag, Steps, Row, Col, Modal, 
  Divider, Timeline, Statistic, Space, Input
} from 'antd';
import { 
  CheckCircleOutlined, CalendarOutlined, ClockCircleOutlined, 
  DollarOutlined, StarOutlined, PrinterOutlined, RollbackOutlined,
  CloseCircleOutlined, InfoCircleOutlined, QrcodeOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { mockBookingHistory } from '@/mocks/booking/bookingData';
import { BookingStatus, PaymentStatus, Booking } from '@/types/booking.type';
import { QRCodeSVG } from 'qrcode.react'; // Cài đặt: npm install qrcode.react

const { Title, Text, Paragraph } = Typography;

interface BookingHistoryItem extends Booking {
  facility: {
    id: number;
    name: string;
    address: string;
    phoneNumber?: string;
  };
  sport: {
    id: number;
    name: string;
  };
  field: {
    id: number;
    name: string;
    fieldGroup: {
      id: number;
      name: string;
      basePrice: number;
    };
  };
  hasReview?: boolean;
  confirmationCode?: string;
}

const BookingDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Giả lập lấy dữ liệu đặt sân từ mock data
  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        setLoading(true);
        // Trong thực tế sẽ gọi API
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundBooking = mockBookingHistory.find(b => b.id === bookingId);
        
        if (foundBooking) {
          // Giả lập thêm một số dữ liệu
          const enhancedBooking = {
            ...foundBooking,
            confirmationCode: 'TAN' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            facility: {
              ...foundBooking.facility,
              phoneNumber: '0923456789'
            },
            hasReview: Math.random() > 0.5
          };
          setBooking(enhancedBooking as BookingHistoryItem);
        }
      } catch (error) {
        console.error('Failed to fetch booking detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetail();
    }
  }, [bookingId]);

  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm xử lý hủy đặt sân
  const handleCancelBooking = async () => {
    try {
      setLoading(true);
      // TODO: Gọi API hủy đặt sân
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Cập nhật trạng thái
      if (booking) {
        setBooking({
          ...booking,
          status: 'cancelled' as BookingStatus,
          payment: {
            ...booking.payment,
            status: 'refunded' as PaymentStatus
          }
        });
      }
      setCancelModalVisible(false);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tính thời gian còn lại đến khi bắt đầu
  const calculateTimeRemaining = (date: string, startTime: string) => {
    const startDateTime = dayjs(`${date} ${startTime}`);
    const now = dayjs();
    const diff = startDateTime.diff(now, 'hour');
    
    if (diff < 0) return 'Đã qua thời gian bắt đầu';
    if (diff === 0) return 'Còn không đầy 1 giờ';
    return `Còn ${diff} giờ`;
  };

  // Lấy trạng thái hiện tại để hiển thị trong Steps
  const getCurrentStep = (status: BookingStatus) => {
    switch (status.toString()) {
      case 'pending_payment':
        return 0;
      case 'payment_confirmed':
        return 1;
      case 'in_progress':
        return 2;
      case BookingStatus.COMPLETED:
        return 3;
      case 'cancelled':
        return -1;
      case 'refunded':
        return -1;
      default:
        return 0;
    }
  };

  // Render các bước đặt sân
  const renderBookingSteps = () => {
    if (!booking) return null;
    
    const currentStep = getCurrentStep(booking.status);
    
    // Nếu đã hủy hoặc hoàn tiền
    if (currentStep === -1) {
      return (
        <Steps
          direction="horizontal"
          current={1}
          status="error"
          className="mb-6"
          items={[
            {
              title: 'Đặt sân',
              icon: <CalendarOutlined />,
            },
            {
              title: booking.status.toString() === 'cancelled' ? 'Đã hủy' : 'Đã hoàn tiền',
              icon: <CloseCircleOutlined />,
            }
          ]}
        />
      );
    }
    
    return (
      <Steps
        direction="horizontal"
        current={currentStep}
        className="mb-6"
        items={[
          {
            title: 'Đặt sân',
            description: 'Đã xác nhận',
            icon: <CalendarOutlined />,
          },
          {
            title: 'Thanh toán',
            description: currentStep >= 1 ? 'Hoàn tất' : 'Đang chờ',
            icon: <DollarOutlined />,
          },
          {
            title: 'Sử dụng',
            description: currentStep >= 2 ? 'Đang diễn ra' : 'Sắp tới',
            icon: <ClockCircleOutlined />,
          },
          {
            title: 'Hoàn tất',
            description: currentStep >= 3 ? 'Đã hoàn thành' : 'Chưa hoàn thành',
            icon: <CheckCircleOutlined />,
          },
        ]}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <div className="text-center py-10">
            <Title level={4}>Không tìm thấy thông tin đặt sân</Title>
            <Paragraph className="mt-2">
              Đơn đặt sân này không tồn tại hoặc đã bị xóa.
            </Paragraph>
            <Button 
              type="primary" 
              onClick={() => navigate('/user/history-booking')}
              className="mt-4"
            >
              Quay lại lịch sử đặt sân
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const canCancel = 
    (booking.status.toString() === 'pending_payment' || booking.status.toString() === 'payment_confirmed') &&
    dayjs(booking.bookingSlots[0]?.date + ' ' + booking.startTime).diff(dayjs(), 'hour') >= 24;

  const totalAmount = booking.payment.fieldPrice + booking.payment.servicePrice - booking.payment.discount;

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6 flex-wrap gap-2">
          <div>
            <Title level={3} className="m-0 text-xl md:text-2xl lg:text-3xl">Chi tiết đặt sân</Title>
            <Text type="secondary">Mã đặt sân: {booking.id}</Text>
          </div>
          <Button 
            icon={<RollbackOutlined />} 
            onClick={() => navigate('/user/history-booking')}
          >
            Quay lại
          </Button>
        </div>

        {/* Trạng thái đặt sân */}
        <Card className="mb-4 md:mb-6 shadow-md">
          {renderBookingSteps()}
          
          <div className="flex flex-wrap gap-3 justify-between">
            <div>
              <Text className="block mb-1" strong>Mã xác nhận:</Text>
              <div className="flex items-center">
                <Tag color="green" className="text-sm md:text-base py-1 px-2 md:px-3">
                  {booking.confirmationCode}
                </Tag>
                <Button 
                  type="text" 
                  icon={<QrcodeOutlined />}
                  onClick={() => setQrModalVisible(true)}
                  className="ml-2"
                >
                  Xem QR
                </Button>
              </div>
            </div>
            
            <Space wrap>
              {canCancel && (
                <Button 
                  danger 
                  icon={<CloseCircleOutlined />}
                  onClick={() => setCancelModalVisible(true)}
                >
                  Hủy đặt sân
                </Button>
              )}
              
              {booking.status === BookingStatus.COMPLETED && !booking.hasReview && (
                <Button 
                  type="primary" 
                  icon={<StarOutlined />}
                  onClick={() => navigate(`/user/booking/review/${booking.id}`)}
                >
                  Đánh giá
                </Button>
              )}
              
              <Button icon={<PrinterOutlined />}>In xác nhận</Button>
              <Button icon={<ShareAltOutlined />} onClick={() => setShareModalVisible(true)}>Chia sẻ</Button>
            </Space>
          </div>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            {/* Thông tin chính */}
            <Card title="Thông tin đặt sân" className="mb-4 md:mb-6 shadow-md">
              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                <Descriptions.Item label="Cơ sở thể thao" span={2}>
                  <div>{booking.facility.name}</div>
                  <div className="text-sm text-gray-500">{booking.facility.address}</div>
                  <div className="text-sm text-gray-500">ĐT: {booking.facility.phoneNumber}</div>
                </Descriptions.Item>
                
                <Descriptions.Item label="Ngày đặt">
                  {dayjs(booking.bookingSlots[0]?.date).format('DD/MM/YYYY')}
                </Descriptions.Item>
                
                <Descriptions.Item label="Khung giờ">
                  {`${booking.startTime.substring(0, 5)} - ${booking.endTime.substring(0, 5)}`}
                </Descriptions.Item>
                
                <Descriptions.Item label="Loại sân">
                  {booking.field.fieldGroup.name}
                </Descriptions.Item>
                
                <Descriptions.Item label="Sân">
                  {booking.field.name}
                </Descriptions.Item>
                
                <Descriptions.Item label="Môn thể thao">
                  {booking.sport.name}
                </Descriptions.Item>
                
                <Descriptions.Item label="Đặt lặp lại">
                  {booking.recurringConfig ? 'Có' : 'Không'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Trạng thái" span={2}>
                  <Space wrap>
                    {booking.status.toString() === 'pending_payment' && (
                      <Tag color="orange">Chờ thanh toán</Tag>
                    )}
                    {booking.status.toString() === 'payment_confirmed' && (
                      <Tag color="cyan">Đã xác nhận</Tag>
                    )}
                    {booking.status.toString() === 'in_progress' && (
                      <Tag color="processing">Đang diễn ra</Tag>
                    )}
                    {booking.status === BookingStatus.COMPLETED && (
                      <Tag color="green">Hoàn thành</Tag>
                    )}
                    {booking.status.toString() === 'cancelled' && (
                      <Tag color="red">Đã hủy</Tag>
                    )}
                    {booking.status.toString() === 'refunded' && (
                      <Tag color="purple">Đã hoàn tiền</Tag>
                    )}
                    
                    {booking.payment.status === PaymentStatus.UNPAID && (
                      <Tag color="red">Chưa thanh toán</Tag>
                    )}
                    {booking.payment.status === PaymentStatus.PAID && (
                      <Tag color="green">Đã thanh toán</Tag>
                    )}
                    {booking.payment.status.toString() === 'released' && (
                      <Tag color="green">Đã chuyển cho chủ sân</Tag>
                    )}
                    {booking.payment.status.toString() === 'refunded' && (
                      <Tag color="purple">Đã hoàn tiền</Tag>
                    )}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
              
              {booking.status.toString() === 'payment_confirmed' && (
                <div className="mt-4 bg-blue-50 p-3 md:p-4 rounded flex items-start">
                  <InfoCircleOutlined className="text-blue-500 mr-2 mt-1" />
                  <div>
                    <Text strong>Hướng dẫn sử dụng:</Text>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Đến đúng giờ và mang theo mã xác nhận hoặc QR code</li>
                      <li>Liên hệ quản lý sân khi đến để kiểm tra thông tin</li>
                      <li>Tuân thủ quy định của cơ sở thể thao</li>
                    </ul>
                  </div>
                </div>
              )}
            </Card>
            
            {/* Dịch vụ đi kèm */}
            {booking.additionalServices && booking.additionalServices.length > 0 && (
              <Card title="Dịch vụ đi kèm" className="mb-6">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">Tên dịch vụ</th>
                      <th className="py-2 px-4 text-right">Số lượng</th>
                      <th className="py-2 px-4 text-right">Đơn giá</th>
                      <th className="py-2 px-4 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {booking.additionalServices.map(service => (
                      <tr key={service.serviceId}>
                        <td className="py-2 px-4">Dịch vụ {service.serviceId}</td>
                        <td className="py-2 px-4 text-right">{service.quantity}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(15000)}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(service.quantity * 15000)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
            
            {/* Lịch sử trạng thái */}
            <Card title="Lịch sử trạng thái" className="mb-6">
              <Timeline
                mode="left"
                items={[
                  {
                    label: dayjs().subtract(3, 'day').format('DD/MM/YYYY HH:mm'),
                    children: 'Tạo đơn đặt sân',
                    dot: <CalendarOutlined className="text-blue-500" />,
                  },
                  {
                    label: dayjs().subtract(3, 'day').format('DD/MM/YYYY HH:mm'),
                    children: 'Thanh toán thành công',
                    dot: <DollarOutlined className="text-green-500" />,
                  },
                  ...(booking.status.toString() === 'cancelled' ? [{
                    label: dayjs().subtract(1, 'day').format('DD/MM/YYYY HH:mm'),
                    children: 'Hủy đặt sân',
                    dot: <CloseCircleOutlined className="text-red-500" />,
                  }] : []),
                  ...(booking.status === BookingStatus.COMPLETED ? [{
                    label: dayjs().format('DD/MM/YYYY HH:mm'),
                    children: 'Hoàn thành',
                    dot: <CheckCircleOutlined className="text-green-500" />,
                  }] : []),
                ]}
              />
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            {/* Thông tin thanh toán */}
            <Card title="Thông tin thanh toán" className="mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Giá sân:</span>
                  <span>{formatCurrency(booking.payment.fieldPrice)}</span>
                </div>
                
                {booking.additionalServices.length > 0 && (
                  <div className="flex justify-between">
                    <span>Dịch vụ đi kèm:</span>
                    <span>{formatCurrency(booking.payment.servicePrice)}</span>
                  </div>
                )}
                
                {booking.payment.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(booking.payment.discount)}</span>
                  </div>
                )}
                
                <Divider style={{ margin: '12px 0' }} />
                
                <div className="flex justify-between font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-xl text-blue-600">{formatCurrency(totalAmount)}</span>
                </div>
                
                <div className="pt-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium mb-1">Phương thức thanh toán:</p>
                    <p>Chuyển khoản ngân hàng</p>
                  </div>
                </div>
                
                {booking.status.toString() === 'payment_confirmed' && (
                  <div className="pt-3">
                    <Statistic 
                      title="Thời gian còn lại đến giờ chơi" 
                      value={calculateTimeRemaining(booking.bookingSlots[0]?.date, booking.startTime)} 
                      valueStyle={{ color: '#1890ff' }}
                    />
                    {canCancel && (
                      <div className="mt-2 text-sm text-gray-500">
                        <InfoCircleOutlined className="mr-1" /> 
                        Bạn có thể hủy đặt sân và nhận hoàn tiền trước 24 giờ so với giờ chơi
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
            
            {/* Chính sách hủy */}
            <Card title="Chính sách hủy đặt sân" className="mb-6">
              <ul className="list-disc pl-5 space-y-2">
                <li>Hủy trước 24 giờ: Hoàn 100% thành điểm tích lũy</li>
                <li>Hủy từ 12-24 giờ: Hoàn 50% thành điểm tích lũy</li>
                <li>Hủy dưới 12 giờ: Không được hoàn tiền</li>
              </ul>
              <Divider style={{ margin: '12px 0' }} />
              <div className="text-sm text-gray-500">
                <p>Điểm tích lũy có thể được sử dụng cho các lần đặt sân tiếp theo.</p>
                <p>1 điểm = 1.000 VNĐ</p>
              </div>
            </Card>
          </Col>
        </Row>
        
        {/* Modal Hủy đặt sân */}
        <Modal
          title="Xác nhận hủy đặt sân"
          open={cancelModalVisible}
          onCancel={() => setCancelModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setCancelModalVisible(false)}>
              Đóng
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              danger
              loading={loading}
              onClick={handleCancelBooking}
            >
              Xác nhận hủy
            </Button>,
          ]}
        >
          <div>
            <p className="mb-4">Bạn có chắc chắn muốn hủy đặt sân này không?</p>
            
            <div className="bg-gray-50 p-4 rounded">
              <div className="mb-2">
                <Text strong>Cơ sở:</Text> {booking.facility.name}
              </div>
              <div className="mb-2">
                <Text strong>Sân:</Text> {booking.field.name}
              </div>
              <div className="mb-2">
                <Text strong>Ngày:</Text> {dayjs(booking.bookingSlots[0]?.date).format('DD/MM/YYYY')}
              </div>
              <div className="mb-2">
                <Text strong>Thời gian:</Text> {`${booking.startTime.substring(0, 5)} - ${booking.endTime.substring(0, 5)}`}
              </div>
              <div className="mb-2">
                <Text strong>Tổng tiền:</Text> {formatCurrency(totalAmount)}
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 p-3 rounded">
              <Text type="secondary">
                <InfoCircleOutlined className="mr-2" />
                Bạn sẽ nhận được hoàn tiền dưới dạng điểm tích lũy nếu hủy trước 24 giờ so với giờ đặt sân.
              </Text>
            </div>
          </div>
        </Modal>

        {/* Modal QR Code */}
        <Modal
          title="Mã QR xác nhận đặt sân"
          open={qrModalVisible}
          onCancel={() => setQrModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setQrModalVisible(false)}>
              Đóng
            </Button>,
            <Button 
              key="download" 
              type="primary"
              onClick={() => {
                // Tạo link download QR code
                alert('Tính năng đang phát triển');
              }}
            >
              Tải xuống
            </Button>,
          ]}
        >
          <div className="text-center py-4">
            <div className="inline-block border p-4 bg-white rounded">
              <QRCodeSVG 
                value={`TANSPORT_BOOKING:${booking.id}:${booking.confirmationCode}`} 
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <div className="mt-4">
              <Text strong>Mã xác nhận: </Text>
              <Tag color="green" className="text-lg py-1 px-3">
                {booking.confirmationCode}
              </Tag>
            </div>
            <Paragraph className="mt-2 text-gray-500">
              Mang theo mã QR này khi đến sân để xác nhận đặt chỗ của bạn
            </Paragraph>
          </div>
        </Modal>

        {/* Modal Chia sẻ */}
        <Modal
          title="Chia sẻ thông tin đặt sân"
          open={shareModalVisible}
          onCancel={() => setShareModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setShareModalVisible(false)}>
              Đóng
            </Button>,
          ]}
        >
          <div className="py-4">
            <Paragraph>
              Chia sẻ thông tin đặt sân với bạn bè qua:
            </Paragraph>
            
            <div className="flex justify-center gap-4 my-4">
              <Button 
                type="primary" 
                shape="circle" 
                icon={<i className="fab fa-facebook-f"></i>}
                onClick={() => alert('Chia sẻ qua Facebook')}
              />
              <Button 
                type="primary" 
                shape="circle" 
                icon={<i className="fab fa-twitter"></i>}
                onClick={() => alert('Chia sẻ qua Twitter')}
                style={{ backgroundColor: '#1DA1F2' }}
              />
              <Button 
                type="primary" 
                shape="circle" 
                icon={<i className="fab fa-telegram-plane"></i>}
                onClick={() => alert('Chia sẻ qua Telegram')}
                style={{ backgroundColor: '#0088cc' }}
              />
              <Button 
                type="primary" 
                shape="circle" 
                icon={<i className="far fa-envelope"></i>}
                onClick={() => alert('Chia sẻ qua Email')}
                style={{ backgroundColor: '#D44638' }}
              />
            </div>
            
            <div className="mt-4">
              <Text strong>Hoặc sao chép đường dẫn:</Text>
              <div className="flex mt-2">
                <Input 
                  value={`https://tansport.com/booking/${booking.id}`} 
                  readOnly
                />
                <Button
                  type="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://tansport.com/booking/${booking.id}`);
                    alert('Đã sao chép liên kết');
                  }}
                >
                  Sao chép
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BookingDetail; 