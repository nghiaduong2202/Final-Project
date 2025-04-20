import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Card, Typography, Button, Descriptions, Tag, Modal, 
  Divider, Statistic, Space, Input, Breadcrumb, notification, Tooltip
} from 'antd';
import { 
  StarOutlined, PrinterOutlined, RollbackOutlined,
  CloseCircleOutlined, InfoCircleOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '@/services/api';
import { getSportNameInVietnamese } from '@/utils/translateSport';

const { Title, Text, Paragraph } = Typography;

// Service methods for bookings
const bookingService = {
  async getBookingDetail(bookingId: string) {
    try {
      const response = await api.get(`/booking/${bookingId}/detail`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      throw error;
    }
  },

  async cancelBooking(bookingId: string) {
    try {
      const response = await api.put(`/booking/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
};

interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  status: string;
  avgRating: number;
  numberOfRating: number;
  imagesUrl: string[];
  fieldGroups: FieldGroup[];
}

interface FieldGroup {
  id: string;
  name: string;
  dimension: string;
  surface: string;
  basePrice: number;
  numberOfPeaks: number;
  peakStartTime1?: string;
  peakEndTime1?: string;
  peakStartTime2?: string;
  peakEndTime2?: string;
  peakStartTime3?: string;
  peakEndTime3?: string;
  priceIncrease1?: number;
  priceIncrease2?: number;
  priceIncrease3?: number;
}

interface Sport {
  id: number;
  name: string;
}

interface Field {
  id: number;
  name: string;
  status: string;
}

interface BookingSlot {
  id: number;
  date: string;
  field: Field;
}

interface Payment {
  id: string;
  fieldPrice: number;
  servicePrice: number | null;
  discount: number | null;
  status: string;
  updatedAt: string;
}

interface AdditionalService {
  serviceId: number;
  quantity: number;
  bookingId?: string;
  service?: {
    id: number;
    name: string;
    price: number;
    type: string;
    description: string;
    amount: number;
    bookedCount: number;
    unit: string;
  };
}

interface ReviewData {
  id: number;
  rating: number;
  comment: string;
  imageUrl: string[];
  reviewAt: string;
  feedbackAt?: string;
  feedback?: string;
}

interface BookingData {
  id: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  sport: Sport;
  bookingSlots: BookingSlot[];
  payment: Payment;
  additionalServices: AdditionalService[];
  recurringConfig?: {
    pattern: string;
    count: number;
  };
  review?: ReviewData | null;
}

interface BookingDetailData {
  facility: Facility;
  booking: BookingData;
}

const BookingDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [bookingDetail, setBookingDetail] = useState<BookingDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        setLoading(true);
        if (!bookingId) return;
        
        const data = await bookingService.getBookingDetail(bookingId);
        setBookingDetail(data);
      } catch (error) {
        console.error('Failed to fetch booking detail:', error);
        notification.error({
          message: 'Không thể tải thông tin đặt sân',
          description: 'Đã xảy ra lỗi khi tải thông tin chi tiết đặt sân. Vui lòng thử lại sau.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetail();
    }
  }, [bookingId]);

  // Format tiền tệ
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return formatCurrency(0);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm xử lý hủy đặt sân
  const handleCancelBooking = async () => {
    if (!bookingId) return;
    
    try {
      setLoading(true);
      await bookingService.cancelBooking(bookingId);
      
      notification.success({
        message: 'Hủy đặt sân thành công',
        description: 'Yêu cầu hủy đặt sân đã được xử lý thành công.'
      });
      
      // Cập nhật lại dữ liệu
      const data = await bookingService.getBookingDetail(bookingId);
      setBookingDetail(data);
      setCancelModalVisible(false);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      notification.error({
        message: 'Không thể hủy đặt sân',
        description: 'Đã xảy ra lỗi khi hủy đặt sân. Vui lòng thử lại sau.'
      });
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

  // Breadcrumb items
  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: <Link to="/user/history-booking">Lịch sử đặt sân</Link>,
    },
    {
      title: 'Chi tiết đặt sân',
    },
  ];

  // Thêm hàm để xác định trạng thái hiển thị dựa trên thời gian thực tế
  const getBookingDisplayStatus = (booking: BookingData): string => {
    // Nếu booking đã bị hủy hoặc hoàn tiền, luôn hiển thị là đã hủy
    if (booking.status === 'cancelled' || booking.status === 'refunded') {
      return 'cancelled';
    }
    
    const today = dayjs();
    
    // Lấy tất cả các ngày đặt sân
    const bookingDates = booking.bookingSlots.map(slot => dayjs(slot.date));
    const startTime = booking.startTime;
    const endTime = booking.endTime;
    
    // Sắp xếp các ngày theo thứ tự tăng dần
    bookingDates.sort((a, b) => a.valueOf() - b.valueOf());
    
    // Ngày cuối cùng trong lịch đặt sân
    const lastBookingDate = bookingDates[bookingDates.length - 1];
    const lastBookingEnd = lastBookingDate
      .hour(parseInt(endTime.split(':')[0]))
      .minute(parseInt(endTime.split(':')[1]));
      
    // Nếu đã qua thời điểm kết thúc của ngày cuối cùng, xem như hoàn thành
    if (today.isAfter(lastBookingEnd)) {
      return 'completed';
    }
    
    // Ngày đầu tiên trong lịch đặt sân
    const firstBookingDate = bookingDates[0];
    const firstBookingStart = firstBookingDate
      .hour(parseInt(startTime.split(':')[0]))
      .minute(parseInt(startTime.split(':')[1]));
      
    // Nếu chưa đến thời điểm bắt đầu của ngày đầu tiên, xem như sắp diễn ra
    if (today.isBefore(firstBookingStart)) {
      return 'upcoming';
    }
    
    // Kiểm tra xem có đang trong một phiên đặt sân nào không
    for (const bookingDate of bookingDates) {
      const bookingStart = bookingDate
        .hour(parseInt(startTime.split(':')[0]))
        .minute(parseInt(startTime.split(':')[1]));
      const bookingEnd = bookingDate
        .hour(parseInt(endTime.split(':')[0]))
        .minute(parseInt(endTime.split(':')[1]));
        
      if (today.isAfter(bookingStart) && today.isBefore(bookingEnd)) {
        return 'in_progress';
      }
    }
    
    // Kiểm tra xem có phải là đang ở giữa các phiên đặt sân không
    if (today.isAfter(firstBookingStart) && today.isBefore(lastBookingEnd)) {
      return 'upcoming'; // Đang ở giữa các phiên định kỳ, xem như sắp diễn ra
    }
    
    return 'upcoming'; // Mặc định là sắp diễn ra nếu không rơi vào các trường hợp trên
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

  if (!bookingDetail) {
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

  const { facility, booking } = bookingDetail;

  // Kiểm tra nếu có thể hủy booking (còn ít nhất 24h trước giờ chơi)
  const canCancel = 
    (booking.status === 'pending_payment' || booking.status === 'payment_confirmed') &&
    dayjs(booking.bookingSlots[0]?.date + ' ' + booking.startTime).diff(dayjs(), 'hour') >= 24;

  // Tính tổng tiền
  const totalAmount = 
    (booking.payment.fieldPrice || 0) + 
    (booking.payment.servicePrice || 0) - 
    (booking.payment.discount || 0);

  return (
    <div className="w-full  px-4 py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        
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

        {/* Booking Detail */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            {/* Thông tin chính */}
            <Card 
              title="Thông tin đặt sân" 
              className="shadow-sm rounded-lg"
              extra={
                <Space wrap>
                  <Tooltip title={getBookingDisplayStatus(booking) !== 'completed' ? "Đơn đặt sân phải hoàn thành trước khi đánh giá" : ""}>
                    <Button 
                      type="primary" 
                      icon={<StarOutlined />}
                      onClick={() => navigate(`/user/booking/review/${booking.id}`)}
                      disabled={getBookingDisplayStatus(booking) !== 'completed'}
                    >
                      Đánh giá
                    </Button>
                  </Tooltip>
                  {canCancel && (
                    <Button 
                      danger 
                      icon={<CloseCircleOutlined />}
                      onClick={() => setCancelModalVisible(true)}
                    >
                      Hủy đặt sân
                    </Button>
                  )}
                </Space>
              }
            >
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Cơ sở thể thao" span={2}>
                  <div>{facility.name}</div>
                  <div className="text-sm text-gray-500">{facility.location}</div>
                </Descriptions.Item>
                
                <Descriptions.Item label="Ngày đặt" span={1}>
                  {dayjs(booking.bookingSlots[0]?.date).format('DD/MM/YYYY')}
                </Descriptions.Item>
                
                <Descriptions.Item label="Khung giờ" span={1}>
                  {`${booking.startTime.substring(0, 5)} - ${booking.endTime.substring(0, 5)}`}
                </Descriptions.Item>
                
                <Descriptions.Item label="Loại sân" span={1}>
                  {facility.fieldGroups[0]?.name || ''}
                </Descriptions.Item>
                
                <Descriptions.Item label="Sân" span={1}>
                  {booking.bookingSlots[0]?.field.name || ''}
                </Descriptions.Item>
                
                <Descriptions.Item label="Môn thể thao" span={1}>
                  {getSportNameInVietnamese(booking.sport.name)}
                </Descriptions.Item>
                
                <Descriptions.Item label="Đặt lặp lại" span={1}>
                  {booking.bookingSlots.length > 1 ? 'Có' : 'Không'}
                </Descriptions.Item>

                <Descriptions.Item label="Giá cơ bản" span={2}>
                  {formatCurrency(facility.fieldGroups[0]?.basePrice || 0)}
                  {facility.fieldGroups[0]?.numberOfPeaks > 0 && (
                    <div className="mt-1">
                      <Text type="secondary" className="text-sm">Giá cao điểm:</Text>
                      <ul className="list-disc pl-5 mt-1 text-sm">
                        {facility.fieldGroups[0]?.peakStartTime1 && facility.fieldGroups[0]?.peakEndTime1 && (
                          <li>
                            {facility.fieldGroups[0].peakStartTime1.substring(0, 5)} - {facility.fieldGroups[0].peakEndTime1.substring(0, 5)}: 
                            {' +' + formatCurrency(facility.fieldGroups[0].priceIncrease1 || 0)}
                          </li>
                        )}
                        {facility.fieldGroups[0]?.peakStartTime2 && facility.fieldGroups[0]?.peakEndTime2 && (
                          <li>
                            {facility.fieldGroups[0].peakStartTime2.substring(0, 5)} - {facility.fieldGroups[0].peakEndTime2.substring(0, 5)}: 
                            {' +' + formatCurrency(facility.fieldGroups[0].priceIncrease2 || 0)}
                          </li>
                        )}
                        {facility.fieldGroups[0]?.peakStartTime3 && facility.fieldGroups[0]?.peakEndTime3 && (
                          <li>
                            {facility.fieldGroups[0].peakStartTime3.substring(0, 5)} - {facility.fieldGroups[0].peakEndTime3.substring(0, 5)}: 
                            {' +' + formatCurrency(facility.fieldGroups[0].priceIncrease3 || 0)}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </Descriptions.Item>
                
                <Descriptions.Item label="Trạng thái" span={2}>
                  <Space wrap>
                    {getBookingDisplayStatus(booking) === 'upcoming' && (
                      <Tag color="blue">Sắp diễn ra</Tag>
                    )}
                    {getBookingDisplayStatus(booking) === 'in_progress' && (
                      <Tag color="processing">Đang diễn ra</Tag>
                    )}
                    {getBookingDisplayStatus(booking) === 'completed' && (
                      <Tag color="green">Hoàn thành</Tag>
                    )}
                    {getBookingDisplayStatus(booking) === 'cancelled' && (
                      <Tag color="red">Đã hủy</Tag>
                    )}
                    
                    {booking.payment.status === 'unpaid' && (
                      <Tag color="red">Chưa thanh toán</Tag>
                    )}
                    {booking.payment.status === 'paid' && (
                      <Tag color="green">Đã thanh toán</Tag>
                    )}
                    {booking.payment.status === 'released' && (
                      <Tag color="green">Đã chuyển cho chủ sân</Tag>
                    )}
                    {booking.payment.status === 'refunded' && (
                      <Tag color="purple">Đã hoàn tiền</Tag>
                    )}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
              
              {booking.status === 'payment_confirmed' && (
                <div className="mt-4 bg-blue-50 p-3 md:p-4 rounded flex items-start">
                  <InfoCircleOutlined className="text-blue-500 mr-2 mt-1" />
                  <div>
                    <Text strong>Hướng dẫn sử dụng:</Text>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Đến đúng giờ</li>
                      <li>Liên hệ quản lý sân khi đến để kiểm tra thông tin</li>
                      <li>Tuân thủ quy định của cơ sở thể thao</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-4">
                <Space>
                  <Button icon={<PrinterOutlined />}>In xác nhận</Button>
                  <Button icon={<ShareAltOutlined />} onClick={() => setShareModalVisible(true)}>Chia sẻ</Button>
                </Space>
              </div>
            </Card>
            
            {/* Danh sách các buổi (đặt định kỳ) */}
            {booking.bookingSlots.length > 1 && (
              <Card title="Lịch đặt sân định kỳ" className="shadow-sm rounded-lg mt-6">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">STT</th>
                      <th className="py-2 px-4 text-left">Ngày</th>
                      <th className="py-2 px-4 text-left">Giờ</th>
                      <th className="py-2 px-4 text-left">Sân</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {booking.bookingSlots.map((slot, index) => (
                      <tr key={slot.id} className={dayjs(slot.date).isBefore(dayjs(), 'day') ? 'bg-gray-100' : ''}>
                        <td className="py-2 px-4">{index + 1}</td>
                        <td className="py-2 px-4">{dayjs(slot.date).format('DD/MM/YYYY')}</td>
                        <td className="py-2 px-4">{`${booking.startTime.substring(0, 5)} - ${booking.endTime.substring(0, 5)}`}</td>
                        <td className="py-2 px-4">{slot.field.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
            
            {/* Dịch vụ đi kèm */}
            {booking.additionalServices && booking.additionalServices.length > 0 && (
              <Card title="Dịch vụ đi kèm" className="shadow-sm rounded-lg mt-6">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">STT</th>
                      <th className="py-2 px-4 text-left">Tên dịch vụ</th>
                      <th className="py-2 px-4 text-right">Số lượng</th>
                      <th className="py-2 px-4 text-right">Đơn giá</th>
                      <th className="py-2 px-4 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {booking.additionalServices.map((service, index) => {
                      // Calculate total price based on service unit type
                      const unitPrice = service.service?.price || 0;
                      let totalPrice = unitPrice * service.quantity;
                      
                      // If service unit is "time", multiply by duration in hours
                      if (service.service?.unit === "time") {
                        // Calculate duration in hours
                        const startTime = dayjs(`2000-01-01 ${booking.startTime}`);
                        const endTime = dayjs(`2000-01-01 ${booking.endTime}`);
                        let durationHours = endTime.diff(startTime, 'hour', true);
                        // Round to nearest 0.5 hour if needed
                        durationHours = Math.round(durationHours * 2) / 2;
                        
                        totalPrice = unitPrice * service.quantity * durationHours;
                      }
                      
                      return (
                        <tr key={service.serviceId}>
                          <td className="py-2 px-4">{index + 1}</td>
                          <td className="py-2 px-4">{service.service?.name || `Dịch vụ ${service.serviceId}`}</td>
                          <td className="py-2 px-4 text-right">{service.quantity}</td>
                          <td className="py-2 px-4 text-right">{formatCurrency(unitPrice)}</td>
                          <td className="py-2 px-4 text-right">{formatCurrency(totalPrice)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
          
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            {/* Thông tin thanh toán */}
            <Card title="Thông tin thanh toán" className="shadow-sm rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Giá sân:</span>
                  <span>{formatCurrency(booking.payment.fieldPrice)}</span>
                </div>
                
                {booking.payment.servicePrice && booking.payment.servicePrice > 0 && (
                  <div className="flex justify-between">
                    <span>Dịch vụ đi kèm:</span>
                    <span>{formatCurrency(booking.payment.servicePrice)}</span>
                  </div>
                )}
                
                {booking.payment.discount && booking.payment.discount > 0 && (
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
                
                {booking.status === 'payment_confirmed' && booking.bookingSlots.length > 0 && (
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
            <Card title="Chính sách hủy đặt sân" className="shadow-sm rounded-lg mt-6">
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
          </div>
        </div>
        
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
                <Text strong>Cơ sở:</Text> {facility.name}
              </div>
              <div className="mb-2">
                <Text strong>Sân:</Text> {booking.bookingSlots[0]?.field.name}
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