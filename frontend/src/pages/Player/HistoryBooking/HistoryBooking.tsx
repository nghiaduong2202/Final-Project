import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Tag, Button, Modal, Typography, Space, Tabs, Select, 
  DatePicker, Input, Badge, Row, Col, Statistic, Avatar, Empty, notification, Tooltip, Alert, Breadcrumb, Popover
} from 'antd';
import type { TabsProps } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import { 
  EyeOutlined, CloseCircleOutlined, StarOutlined, SearchOutlined, 
  InfoCircleOutlined, CalendarOutlined, FilterOutlined, ReloadOutlined,
  CheckCircleOutlined, HistoryOutlined, ClockCircleOutlined, SyncOutlined, 
  ExclamationCircleOutlined, ArrowRightOutlined, HeartOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import api from '@/services/api';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import bookingService from '@/services/booking.service';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;

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
  review?: ReviewData | null;
}

interface BookingHistoryItem {
  facility: Facility;
  booking: BookingData;
}

// Định nghĩa kiểu dữ liệu cho BookingSummaryCard
interface BookingSummaryData {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

// Tách thành component riêng để dễ quản lý
const BookingSummaryCard = ({ data }: { data: BookingSummaryData }) => {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card hover:shadow-md transition-all" hoverable>
          <Statistic
            title={<span className="font-medium">Tổng lượt đặt sân</span>}
            value={data.total}
            prefix={<HistoryOutlined className="text-blue-500" />}
            valueStyle={{ color: '#1890ff', fontWeight: 600 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card hover:shadow-md transition-all" hoverable>
          <Statistic
            title={<span className="font-medium">Sắp diễn ra</span>}
            value={data.upcoming}
            prefix={<ClockCircleOutlined className="text-orange-500" />}
            valueStyle={{ color: '#fa8c16', fontWeight: 600 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card hover:shadow-md transition-all" hoverable>
          <Statistic
            title={<span className="font-medium">Hoàn thành</span>}
            value={data.completed}
            prefix={<CheckCircleOutlined className="text-green-500" />}
            valueStyle={{ color: '#52c41a', fontWeight: 600 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card hover:shadow-md transition-all" hoverable>
          <Statistic
            title={<span className="font-medium">Đã hủy/Hoàn tiền</span>}
            value={data.cancelled}
            prefix={<CloseCircleOutlined className="text-red-500" />}
            valueStyle={{ color: '#ff4d4f', fontWeight: 600 }}
          />
        </Card>
      </Col>
    </Row>
  );
};

// Add a BookingDate component to display multiple dates
const BookingDates = ({ dates }: { dates: string[] }) => {
  // If only one date, just show it
  if (dates.length === 1) {
    return <span>{dayjs(dates[0]).format('DD/MM/YYYY')}</span>;
  }

  // If multiple dates, show the first one with a popover for all dates
  const content = (
    <div className="p-1">
      {dates.map((date, index) => (
        <div key={index} className="mb-1 last:mb-0">
          <Tag color="blue">{`${index + 1}: ${dayjs(date).format('DD/MM/YYYY')}`}</Tag>
        </div>
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      title="Lịch định kỳ"
      trigger="hover"
      placement="bottom"
    >
      <span className="cursor-pointer hover:text-blue-500">
        {dayjs(dates[0]).format('DD/MM/YYYY')} <span className="font-medium text-blue-500 ml-1">[{dates.length}]</span>
      </span>
    </Popover>
  );
};

const HistoryBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filterTimeRange, setFilterTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [sportFilter, setSportFilter] = useState<number | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  
  // Thêm state để lưu bookings từ API
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  
  // Thêm state cho việc hiển thị booking sắp tới
  const [upcomingBookings, setUpcomingBookings] = useState<BookingHistoryItem[]>([]);
  
  // State cho booking statistics
  const [bookingStats, setBookingStats] = useState<BookingSummaryData>({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });

  // Fetch data khi component được mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Gọi API để lấy dữ liệu
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookingsData = await bookingService.getBookingPlayer();
      
      setBookings(bookingsData);
      
      // Cập nhật thống kê
      updateBookingStats(bookingsData);
      
      // Lấy các booking sắp diễn ra
      const upcoming = bookingsData.filter((item: BookingHistoryItem) => {
        const displayStatus = getBookingDisplayStatus(item);
        return displayStatus === 'upcoming';
      });
      setUpcomingBookings(upcoming);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      notification.error({
        message: 'Không thể tải dữ liệu',
        description: 'Đã xảy ra lỗi khi tải lịch sử đặt sân. Vui lòng thử lại sau.'
      });
      setLoading(false);
    }
  };

  // Cập nhật thống kê booking
  const updateBookingStats = (bookingsData: BookingHistoryItem[]) => {
    const total = bookingsData.length;
    
    const upcoming = bookingsData.filter(item => 
      getBookingDisplayStatus(item) === 'upcoming'
    ).length;
    
    const completed = bookingsData.filter(item => 
      getBookingDisplayStatus(item) === 'completed'
    ).length;
    
    const cancelled = bookingsData.filter(item => 
      getBookingDisplayStatus(item) === 'cancelled'
    ).length;
    
    setBookingStats({
      total,
      upcoming,
      completed,
      cancelled
    });
  };

  const handleCancelBooking = async (id: string) => {
    confirm({
      title: 'Xác nhận hủy đặt sân',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn hủy đặt sân này? Hành động này không thể hoàn tác.',
      okText: 'Hủy đặt sân',
      okType: 'danger',
      cancelText: 'Không',
      onOk: async () => {
        setLoading(true);
        try {
          // Thực hiện cancel booking khi API có sẵn
          await api.put(`/booking/${id}/cancel`);
          
          notification.success({
            message: 'Hủy đặt sân thành công',
            description: 'Yêu cầu hủy đặt sân đã được xử lý thành công.'
          });
          
          // Refresh data
          fetchBookings();
        } catch (error) {
          console.error('Failed to cancel booking:', error);
          notification.error({
            message: 'Không thể hủy đặt sân',
            description: 'Đã xảy ra lỗi khi hủy đặt sân. Vui lòng thử lại sau.'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Chuyển sang trang chi tiết booking
  const viewBookingDetail = (bookingId: string) => {
    navigate(`/user/booking/detail/${bookingId}`);
  };

  // Chuyển sang trang đánh giá
  const goToReview = (bookingId: string) => {
    navigate(`/user/booking/review/${bookingId}`);
  };

  // Thêm sân vào yêu thích
  const addToFavorites = async (facilityId: string) => {
    try {
      // Implement API call when available
      console.log(`Adding facility ${facilityId} to favorites`);
      notification.success({
        message: 'Đã thêm vào yêu thích',
        description: 'Sân thể thao đã được thêm vào danh sách yêu thích của bạn'
      });
    } catch (error: unknown) {
      console.error('Error adding facility to favorites:', error);
      notification.error({
        message: 'Không thể thêm vào yêu thích',
        description: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm render trạng thái booking dựa theo thời gian
  const renderBookingStatusByTime = (record: BookingHistoryItem) => {
    const displayStatus = getBookingDisplayStatus(record);
    let color = 'default';
    let text = 'Không xác định';
    let icon = <InfoCircleOutlined />;

    switch (displayStatus) {
      case 'upcoming':
        color = 'blue';
        text = 'Sắp diễn ra';
        icon = <ClockCircleOutlined />;
        break;
      case 'in_progress':
        color = 'processing';
        text = 'Đang diễn ra';
        icon = <SyncOutlined spin />;
        break;
      case 'completed':
        color = 'green';
        text = 'Hoàn thành';
        icon = <CheckCircleOutlined />;
        break;
      case 'cancelled':
        color = 'red';
        text = 'Đã hủy';
        icon = <CloseCircleOutlined />;
        break;
    }

    return (
      <Tag icon={icon} color={color}>
        {text}
      </Tag>
    );
  };

  // Hàm render trạng thái payment
  const renderPaymentStatus = (status: string) => {
    let color = 'default';
    let text = 'Không xác định';

    switch (status) {
      case 'unpaid':
        color = 'volcano';
        text = 'Chưa thanh toán';
        break;
      case 'paid':
        color = 'green';
        text = 'Đã thanh toán';
        break;
      case 'refunded':
        color = 'orange';
        text = 'Đã hoàn tiền';
        break;
    }

    return (
      <Tag color={color} style={{ marginLeft: 8 }}>
        {text}
      </Tag>
    );
  };

  // Lọc dữ liệu theo tab đang chọn và các filter
  const applyFilters = () => {
    setFilterLoading(true);
    
    // Giả lập delay API
    setTimeout(() => {
      setFilterLoading(false);
      setFilterVisible(false);
    }, 500);
  };
  
  // Reset các filter
  const resetFilters = () => {
    setFilterTimeRange(null);
    setSearchText('');
    setSportFilter(null);
    
    // Giả lập delay API
    setFilterLoading(true);
    setTimeout(() => {
      setFilterLoading(false);
      setFilterVisible(false);
    }, 500);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: 'Lịch sử đặt sân',
    },
  ];

  // Xác định trạng thái booking dựa vào thời gian và status
  const getBookingDisplayStatus = (item: BookingHistoryItem): string => {
    // Nếu booking đã bị hủy hoặc hoàn tiền, luôn hiển thị là cancelled
    if (item.booking.status === 'cancelled' || item.booking.status === 'refunded') {
      return 'cancelled';
    }
    
    const today = dayjs();
    
    // Lấy tất cả các ngày đặt sân
    const bookingDates = item.booking.bookingSlots.map(slot => dayjs(slot.date));
    const startTime = item.booking.startTime;
    const endTime = item.booking.endTime;
    
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

  // Lọc dữ liệu theo tab đang chọn
  const filteredBookings = bookings.filter(item => {
    // Lấy trạng thái hiển thị
    const displayStatus = getBookingDisplayStatus(item);
    
    // Lọc theo tab
    if (activeTab !== 'all') {
      if (activeTab === 'upcoming' && displayStatus !== 'upcoming') return false;
      if (activeTab === 'in_progress' && displayStatus !== 'in_progress') return false;
      if (activeTab === 'completed' && displayStatus !== 'completed') return false;
      if (activeTab === 'cancelled' && !['cancelled', 'refunded'].includes(item.booking.status)) return false;
    }

    // Lọc theo khoảng thời gian
    if (filterTimeRange) {
      const bookingDate = dayjs(item.booking.bookingSlots[0]?.date);
      if (!bookingDate.isBetween(filterTimeRange[0], filterTimeRange[1], null, '[]')) {
        return false;
      }
    }

    // Lọc theo text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      if (
        !item.booking.id.toLowerCase().includes(searchLower) &&
        !item.facility.name.toLowerCase().includes(searchLower) &&
        !item.booking.sport.name.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Lọc theo môn thể thao
    if (sportFilter && item.booking.sport.id !== sportFilter) {
      return false;
    }

    return true;
  });

  // Tính tổng tiền từ payment
  const calculateTotalPrice = (item: BookingHistoryItem): number => {
    const fieldPrice = item.booking.payment?.fieldPrice || 0;
    const servicePrice = item.booking.payment?.servicePrice || 0;
    const discount = item.booking.payment?.discount || 0;
    
    return fieldPrice + servicePrice - discount;
  };

  const columns: ColumnType<BookingHistoryItem>[] = [
    {
      title: 'Mã đặt sân',
      dataIndex: ['booking', 'id'],
      key: 'id',
      render: (id: string) => (
        <Button type="link" onClick={() => viewBookingDetail(id)}>
          #{id.substring(0, 8)}
        </Button>
      ),
    },
    {
      title: 'Cơ sở thể thao',
      dataIndex: ['facility', 'name'],
      key: 'facility',
      render: (name: string, record: BookingHistoryItem) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar size="small" src={record.facility.imagesUrl?.[0] || `https://ui-avatars.com/api/?name=${name}&background=random`} style={{ marginRight: 8 }} />
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: 'Nhóm sân',
      key: 'field',
      render: (_: unknown, record: BookingHistoryItem) => {
        const fieldGroupName = record.facility.fieldGroups[0]?.name || '';
        const isRecurring = record.booking.bookingSlots.length > 1;
        
        return (
          <div>
            <div>{fieldGroupName}</div>
            {isRecurring && (
              <div style={{ marginTop: 4 }}>
                <Tag color="purple">Định kỳ</Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: unknown, record: BookingHistoryItem) => {
        // Lấy danh sách các ngày đặt sân
        const bookingDates = record.booking.bookingSlots.map(slot => slot.date);
        
        return (
          <div>
            <div>
              <CalendarOutlined style={{ marginRight: 8 }} />
              <BookingDates dates={bookingDates} />
              <span style={{ marginLeft: 8 }}>{record.booking.startTime.substring(0, 5)} - {record.booking.endTime.substring(0, 5)}</span>
            </div>
            <div style={{ marginLeft: 16, marginTop: 4 }}>
              {renderBookingStatusByTime(record)}
              {renderPaymentStatus(record.booking.payment.status)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Môn thể thao',
      key: 'sport',
      dataIndex: ['booking', 'sport', 'name'],
      render: (name: string) => (
        <Tag color="blue">
          {getSportNameInVietnamese(name)}
        </Tag>
      ),
    },
    {
      title: 'Tổng tiền',
      key: 'totalPrice',
      render: (_: unknown, record: BookingHistoryItem) => formatCurrency(calculateTotalPrice(record)),
      sorter: (a: BookingHistoryItem, b: BookingHistoryItem) => 
        calculateTotalPrice(a) - calculateTotalPrice(b),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: BookingHistoryItem) => {
        // Kiểm tra xem có thể hủy booking không (chỉ cho phép hủy những đơn sắp diễn ra)
        const displayStatus = getBookingDisplayStatus(record);
        const canCancel = displayStatus === 'upcoming' && 
                         (record.booking.status === 'pending_payment' || 
                          record.booking.status === 'payment_confirmed');
        
        return (
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  viewBookingDetail(record.booking.id);
                }}
              />
            </Tooltip>
            
            <Tooltip title={displayStatus !== 'completed' ? "Đơn đặt sân phải hoàn thành trước khi đánh giá" : "Đánh giá"}>
              <Button
                type="default"
                size="small"
                icon={<StarOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  goToReview(record.booking.id);
                }}
                disabled={displayStatus !== 'completed'}
              />
            </Tooltip>
            
            <Tooltip title="Thêm vào yêu thích">
              <Button
                type="default"
                size="small"
                icon={<HeartOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  addToFavorites(record.facility.id);
                }}
              />
            </Tooltip>
            
            {canCancel && (
              <Tooltip title="Hủy đặt sân">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelBooking(record.booking.id);
                  }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const getBookingCount = (status: string) => {
    return bookings.filter(item => {
      const displayStatus = getBookingDisplayStatus(item);
      
      if (status === 'all') return true;
      if (status === 'upcoming') return displayStatus === 'upcoming';
      if (status === 'in_progress') return displayStatus === 'in_progress';
      if (status === 'completed') return displayStatus === 'completed';
      if (status === 'cancelled') return item.booking.status === 'cancelled' || item.booking.status === 'refunded';
      return false;
    }).length;
  };

  // Cấu hình tabs
  const tabs: TabsProps['items'] = [
    {
      key: 'all',
      label: (
        <Badge count={getBookingCount('all')} offset={[10, 0]}>
          Tất cả
        </Badge>
      ),
    },
    {
      key: 'upcoming',
      label: (
        <Badge count={getBookingCount('upcoming')} offset={[10, 0]}>
          Sắp diễn ra
        </Badge>
      ),
    },
    {
      key: 'in_progress',
      label: (
        <Badge count={getBookingCount('in_progress')} offset={[10, 0]}>
          Đang diễn ra
        </Badge>
      ),
    },
    {
      key: 'completed',
      label: (
        <Badge count={getBookingCount('completed')} offset={[10, 0]}>
          Hoàn thành
        </Badge>
      ),
    },
    {
      key: 'cancelled',
      label: (
        <Badge count={getBookingCount('cancelled')} offset={[10, 0]}>
          Đã hủy
        </Badge>
      ),
    },
  ];

  return (
    <div className="w-full px-4 py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="m-0 text-xl md:text-2xl lg:text-3xl font-bold">
            Lịch sử đặt sân
          </Title>
          <Space>
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setFilterVisible(!filterVisible)}
              className="flex items-center"
            >
              Bộ lọc
            </Button>
            <Button 
              type="primary"
              icon={<ReloadOutlined />} 
              onClick={fetchBookings}
              loading={loading}
              className="flex items-center"
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Thêm thống kê booking */}
        <BookingSummaryCard data={bookingStats} />

        {/* Hiển thị booking sắp tới */}
        {upcomingBookings.length > 0 && (
          <Card className="mb-6 shadow-sm rounded-lg" title={<span className="font-semibold">Đặt sân sắp tới</span>}>
            <div className="space-y-4">
              {upcomingBookings.slice(0, 3).map(booking => (
                <Alert
                  key={booking.booking.id}
                  type="info"
                  message={
                    <div className="flex justify-between items-center">
                      <Space wrap>
                        <CalendarOutlined className="text-blue-500" />
                        <span className="font-medium">
                          {dayjs(booking.booking.bookingSlots[0]?.date).format('DD/MM/YYYY')} ({booking.booking.startTime.substring(0, 5)} - {booking.booking.endTime.substring(0, 5)})
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{booking.facility.name}</span>
                        <span className="text-gray-400">•</span>
                        <span>{booking.booking.bookingSlots[0]?.field.name}</span>
                      </Space>
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => viewBookingDetail(booking.booking.id)}
                        className="flex items-center"
                      >
                        Chi tiết <ArrowRightOutlined />
                      </Button>
                    </div>
                  }
                  className="drop-shadow-sm"
                />
              ))}
              {upcomingBookings.length > 3 && (
                <div className="text-right">
                  <Button type="link" onClick={() => setActiveTab('upcoming')}>
                    Xem tất cả ({upcomingBookings.length})
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Bộ lọc nâng cao */}
        {filterVisible && (
          <Card className="mb-6 shadow-sm rounded-lg" title={<span className="font-semibold">Bộ lọc nâng cao</span>}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div className="mb-2 font-medium">Khoảng thời gian</div>
                <RangePicker 
                  style={{ width: '100%' }} 
                  value={filterTimeRange}
                  onChange={(dates) => setFilterTimeRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                  placeholder={['Từ ngày', 'Đến ngày']}
                  className="w-full"
                />
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-2 font-medium">Tìm kiếm</div>
                <Input
                  placeholder="Tìm theo mã, tên sân, môn thể thao..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full"
                />
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-2 font-medium">Môn thể thao</div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn môn thể thao"
                  value={sportFilter}
                  onChange={(value) => setSportFilter(value)}
                  allowClear
                  className="w-full"
                >
                  <Option value={1}>Bóng đá</Option>
                  <Option value={2}>Cầu lông</Option>
                  <Option value={3}>Tennis</Option>
                  <Option value={4}>Bóng rổ</Option>
                </Select>
              </Col>
              <Col xs={24} className="text-right">
                <Space>
                  <Button onClick={resetFilters}>
                    Đặt lại
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={applyFilters}
                    loading={filterLoading}
                  >
                    Áp dụng
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        <Card className="shadow-sm rounded-lg">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            items={tabs}
            className="mb-3 font-medium"
            tabBarStyle={{ marginBottom: 16, fontWeight: 500 }}
          />
          
          <Table
            columns={columns}
            dataSource={filteredBookings}
            rowKey={(record) => record.booking.id}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} lượt đặt sân`,
              className: "pagination-custom"
            }}
            rowClassName="hover:bg-gray-50 cursor-pointer transition-colors"
            onRow={(record) => ({
              onClick: (e) => {
                // Ngăn chặn sự kiện click khi người dùng click vào cột thao tác (chứa các button)
                const target = e.target as HTMLElement;
                // Kiểm tra xem phần tử được click hoặc cha của nó có phải là button hay không
                if (target.closest('button') || target.closest('.ant-space')) {
                  return;
                }
                viewBookingDetail(record.booking.id);
              }
            })}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-gray-500">
                      Không có dữ liệu đặt sân nào{' '}
                      {activeTab !== 'all' ? 'trong trạng thái này' : ''}
                    </span>
                  }
                />
              ),
            }}
            className="custom-table"
          />
        </Card>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Lưu ý: Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline: 1900-xxxx</p>
        </div>
      </div>
    </div>
  );
};

export default HistoryBookingPage;

