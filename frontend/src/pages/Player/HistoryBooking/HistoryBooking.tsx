import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Tag, Button, Modal, Typography, Space, Tabs, Select, 
  DatePicker, Input, Badge, Row, Col, Statistic, Avatar, Empty, notification, Tooltip, Alert
} from 'antd';
import type { TabsProps } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import { 
  EyeOutlined, CloseCircleOutlined, StarOutlined, SearchOutlined, 
  InfoCircleOutlined, CalendarOutlined, FilterOutlined, ReloadOutlined,
  CheckCircleOutlined, HistoryOutlined, ClockCircleOutlined, SyncOutlined, 
  ExclamationCircleOutlined, ArrowRightOutlined, HeartOutlined, DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import { mockBookingHistory } from '@/mocks/booking/bookingData';
import { BookingStatus, PaymentStatus, Booking } from '@/types/booking.type';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;

interface FacilityInfo {
  id: number;
  name: string;
  address: string;
}

interface SportInfo {
  id: number;
  name: string;
}

interface FieldGroupInfo {
  id: number;
  name: string;
  basePrice: number;
}

interface FieldInfo {
  id: number;
  name: string;
  fieldGroup: FieldGroupInfo;
}

interface BookingHistoryItem extends Booking {
  facility: FacilityInfo;
  sport: SportInfo;
  field: FieldInfo;
  hasReview?: boolean;
  totalPrice: number;
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
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card">
          <Statistic
            title="Tổng lượt đặt sân"
            value={data.total}
            prefix={<HistoryOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card">
          <Statistic
            title="Đang chờ/Sắp diễn ra"
            value={data.upcoming}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card">
          <Statistic
            title="Hoàn thành"
            value={data.completed}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card">
          <Statistic
            title="Đã hủy/Hoàn tiền"
            value={data.cancelled}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
    </Row>
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

  // Giả lập API call
  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Trong thực tế, đây sẽ là API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Cập nhật thống kê
      updateBookingStats(mockBookingHistory as BookingHistoryItem[]);
      
      // Lấy các booking sắp diễn ra
      const upcoming = (mockBookingHistory as BookingHistoryItem[]).filter(booking => {
        const bookingDate = dayjs(booking.bookingSlots[0]?.date);
        const status = booking.status.toString();
        return bookingDate.isAfter(dayjs(), 'day') && 
          (status === 'payment_confirmed' || status === 'pending_payment');
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
  const updateBookingStats = (bookings: BookingHistoryItem[]) => {
    const total = bookings.length;
    
    const upcoming = bookings.filter(booking => {
      const status = booking.status.toString();
      return status === 'payment_confirmed' || status === 'pending_payment' || status === 'in_progress';
    }).length;
    
    const completed = bookings.filter(booking => 
      booking.status === BookingStatus.COMPLETED
    ).length;
    
    const cancelled = bookings.filter(booking => {
      const status = booking.status.toString();
      return status === 'cancelled' || status === 'refunded';
    }).length;
    
    setBookingStats({
      total,
      upcoming,
      completed,
      cancelled
    });
  };

  const handleCancelBooking = (id: string) => {
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
          // TODO: Implement API call to cancel booking
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
  const addToFavorites = (facilityId: number) => {
    notification.success({
      message: 'Đã thêm vào yêu thích',
      description: 'Sân thể thao đã được thêm vào danh sách yêu thích của bạn'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm render trạng thái booking
  const renderBookingStatus = (status: BookingStatus) => {
    let color = 'default';
    let text = 'Không xác định';
    let icon = <InfoCircleOutlined />;

    switch (status) {
      case BookingStatus.DRAFT:
        color = 'blue';
        text = 'Đang xử lý';
        icon = <SyncOutlined spin />;
        break;
      case BookingStatus.COMPLETED:
        color = 'green';
        text = 'Hoàn thành';
        icon = <CheckCircleOutlined />;
        break;
      case 'pending_payment' as BookingStatus:
        color = 'orange';
        text = 'Chờ thanh toán';
        icon = <ClockCircleOutlined />;
        break;
      case 'payment_confirmed' as BookingStatus:
        color = 'cyan';
        text = 'Đã xác nhận';
        icon = <CheckCircleOutlined />;
        break;
      case 'in_progress' as BookingStatus:
        color = 'processing';
        text = 'Đang diễn ra';
        icon = <SyncOutlined spin />;
        break;
      case 'cancelled' as BookingStatus:
        color = 'red';
        text = 'Đã hủy';
        icon = <CloseCircleOutlined />;
        break;
      case 'refunded' as BookingStatus:
        color = 'purple';
        text = 'Đã hoàn tiền';
        icon = <DollarOutlined />;
        break;
    }

    return (
      <Tag icon={icon} color={color}>
        {text}
      </Tag>
    );
  };

  // Hàm render trạng thái thanh toán
  const renderPaymentStatus = (status: PaymentStatus) => {
    let color = 'default';
    let text = 'Không xác định';
    let icon = <InfoCircleOutlined />;

    switch (status) {
      case PaymentStatus.UNPAID:
        color = 'red';
        text = 'Chưa thanh toán';
        icon = <CloseCircleOutlined />;
        break;
      case PaymentStatus.PAID:
        color = 'green';
        text = 'Đã thanh toán';
        icon = <CheckCircleOutlined />;
        break;
      case PaymentStatus.CANCELLED:
        color = 'red';
        text = 'Đã hủy';
        icon = <CloseCircleOutlined />;
        break;
      case 'pending' as PaymentStatus:
        color = 'orange';
        text = 'Đang xử lý';
        icon = <SyncOutlined spin />;
        break;
      case 'released' as PaymentStatus:
        color = 'green';
        text = 'Đã chuyển cho chủ sân';
        icon = <DollarOutlined />;
        break;
      case 'refunded' as PaymentStatus:
        color = 'purple';
        text = 'Đã hoàn tiền';
        icon = <DollarOutlined />;
        break;
    }

    return (
      <Tag icon={icon} color={color}>
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

  // Lọc dữ liệu theo tab đang chọn
  const filteredBookings = (mockBookingHistory as BookingHistoryItem[]).filter(booking => {
    // Lọc theo tab
    if (activeTab !== 'all') {
      if (activeTab === 'pending_payment' && booking.status.toString() !== 'pending_payment') return false;
      if (activeTab === 'payment_confirmed' && booking.status.toString() !== 'payment_confirmed') return false;
      if (activeTab === 'in_progress' && booking.status.toString() !== 'in_progress') return false;
      if (activeTab === 'completed' && booking.status !== BookingStatus.COMPLETED) return false;
      if (activeTab === 'cancelled' && booking.status.toString() !== 'cancelled') return false;
    }

    // Lọc theo khoảng thời gian
    if (filterTimeRange) {
      const bookingDate = dayjs(booking.bookingSlots[0]?.date);
      if (!bookingDate.isBetween(filterTimeRange[0], filterTimeRange[1], null, '[]')) {
        return false;
      }
    }

    // Lọc theo text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      if (
        !booking.id.toLowerCase().includes(searchLower) &&
        !booking.facility.name.toLowerCase().includes(searchLower) &&
        !booking.sport.name.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Lọc theo môn thể thao
    if (sportFilter && booking.sport.id !== sportFilter) {
      return false;
    }

    return true;
  });

  const columns: ColumnType<BookingHistoryItem>[] = [
    {
      title: 'Mã đặt sân',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Button type="link" onClick={() => viewBookingDetail(id)}>
          #{id.substring(0, 8)}
        </Button>
      ),
    },
    {
      title: 'Cơ sở thể thao',
      dataIndex: 'facility',
      key: 'facility',
      render: (facility: FacilityInfo) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar size="small" src={`https://ui-avatars.com/api/?name=${facility.name}&background=random`} style={{ marginRight: 8 }} />
          <span>{facility.name}</span>
        </div>
      ),
    },
    {
      title: 'Sân',
      dataIndex: 'field',
      key: 'field',
      render: (field: FieldInfo) => `${field.name} (${field.fieldGroup.name})`,
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: unknown, record: BookingHistoryItem) => (
        <Tooltip title={`Ngày: ${dayjs(record.bookingSlots[0]?.date).format('DD/MM/YYYY')}`}>
          <span>
            <CalendarOutlined style={{ marginRight: 8 }} />
            {record.startTime.substring(0, 5)} - {record.endTime.substring(0, 5)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, record: BookingHistoryItem) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {renderBookingStatus(record.status)}
          {renderPaymentStatus(record.payment.status)}
        </Space>
      ),
      filters: [
        { text: 'Đang xử lý', value: 'DRAFT' },
        { text: 'Chờ thanh toán', value: 'pending_payment' },
        { text: 'Đã xác nhận', value: 'payment_confirmed' },
        { text: 'Đang diễn ra', value: 'in_progress' },
        { text: 'Hoàn thành', value: 'COMPLETED' },
        { text: 'Đã hủy', value: 'cancelled' },
        { text: 'Đã hoàn tiền', value: 'refunded' },
      ],
      onFilter: (value, record: BookingHistoryItem) => record.status.toString() === String(value),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => formatCurrency(price),
      sorter: (a: BookingHistoryItem, b: BookingHistoryItem) => a.totalPrice - b.totalPrice,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: BookingHistoryItem) => {
        // Kiểm tra xem có thể hủy booking không
        const canCancel = record.status.toString() === 'pending_payment' || 
                          record.status.toString() === 'payment_confirmed';
        
        // Kiểm tra xem có thể đánh giá không
        const canReview = record.status === BookingStatus.COMPLETED && !record.hasReview;
        
        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => viewBookingDetail(record.id)}
              />
            </Tooltip>
            
            {canReview && (
              <Tooltip title="Đánh giá">
                <Button
                  type="default"
                  size="small"
                  icon={<StarOutlined />}
                  onClick={() => goToReview(record.id)}
                />
              </Tooltip>
            )}
            
            <Tooltip title="Thêm vào yêu thích">
              <Button
                type="default"
                size="small"
                icon={<HeartOutlined />}
                onClick={() => addToFavorites(record.facility.id)}
              />
            </Tooltip>
            
            {canCancel && (
              <Tooltip title="Hủy đặt sân">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCancelBooking(record.id)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const getBookingCount = (status: string) => {
    return (mockBookingHistory as BookingHistoryItem[]).filter(booking => {
      if (status === 'all') return true;
      return booking.status.toString() === status;
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
      key: 'pending_payment',
      label: (
        <Badge count={getBookingCount('pending_payment')} offset={[10, 0]}>
          Chờ thanh toán
        </Badge>
      ),
    },
    {
      key: 'payment_confirmed',
      label: (
        <Badge count={getBookingCount('payment_confirmed')} offset={[10, 0]}>
          Đã xác nhận
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
        <Badge count={getBookingCount('COMPLETED')} offset={[10, 0]}>
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
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <Title level={2} className="m-0 text-xl md:text-2xl lg:text-3xl">
            Lịch sử đặt sân
          </Title>
          <Space>
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setFilterVisible(!filterVisible)}
            >
              Bộ lọc
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchBookings}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Thêm thống kê booking */}
        <BookingSummaryCard data={bookingStats} />

        {/* Hiển thị booking sắp tới */}
        {upcomingBookings.length > 0 && (
          <Card className="mb-4 md:mb-6 mt-4" title="Đặt sân sắp tới">
            <div className="space-y-4">
              {upcomingBookings.slice(0, 3).map(booking => (
                <Alert
                  key={booking.id}
                  type="info"
                  message={
                    <div className="flex justify-between items-center">
                      <Space>
                        <CalendarOutlined />
                        <span>
                          {dayjs(booking.bookingSlots[0]?.date).format('DD/MM/YYYY')} ({booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)})
                        </span>
                        <span>•</span>
                        <span>{booking.facility.name}</span>
                        <span>•</span>
                        <span>{booking.field.name}</span>
                      </Space>
                      <Space>
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => viewBookingDetail(booking.id)}
                        >
                          Chi tiết <ArrowRightOutlined />
                        </Button>
                      </Space>
                    </div>
                  }
                />
              ))}
              {upcomingBookings.length > 3 && (
                <div className="text-right">
                  <Button type="link" onClick={() => setActiveTab('payment_confirmed')}>
                    Xem tất cả ({upcomingBookings.length})
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Bộ lọc nâng cao */}
        {filterVisible && (
          <Card className="mb-4 md:mb-6">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div className="mb-2">Khoảng thời gian</div>
                <RangePicker 
                  style={{ width: '100%' }} 
                  value={filterTimeRange}
                  onChange={(dates) => setFilterTimeRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                  placeholder={['Từ ngày', 'Đến ngày']}
                />
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-2">Tìm kiếm</div>
                <Input
                  placeholder="Tìm theo mã, tên sân, môn thể thao..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-2">Môn thể thao</div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn môn thể thao"
                  value={sportFilter}
                  onChange={(value) => setSportFilter(value)}
                  allowClear
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

        <Card className="shadow-md mb-4 md:mb-6">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            items={tabs}
          />
          
          <Table
            columns={columns}
            dataSource={filteredBookings}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đặt sân`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>
                      Không có dữ liệu đặt sân nào{' '}
                      {activeTab !== 'all' ? 'trong trạng thái này' : ''}
                    </span>
                  }
                />
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default HistoryBookingPage;

