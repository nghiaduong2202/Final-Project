import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, Row, Col, Statistic, Typography, DatePicker, 
  Button, Space, Progress, Badge, List, Avatar, Select
} from 'antd';
import {
  CalendarOutlined, TeamOutlined, DollarOutlined, StarOutlined, 
  FieldTimeOutlined, ArrowUpOutlined, EyeOutlined, UserOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import { BookingStatus, HistoryBookingStatus } from '@/types/booking.type';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Facility {
  id: string;
  name: string;
}

interface ChartDatum {
  date?: string;
  value: number;
  type?: string;
  month?: string;
  completed?: number;
  cancelled?: number;
}

interface BookingField {
  name: string;
}

interface BookingSlot {
  date: string;
}

interface MockBooking {
  id: string;
  field: BookingField;
  bookingSlots: BookingSlot[];
  startTime: string;
  endTime: string;
  status: BookingStatus | HistoryBookingStatus;
}

// Mocked booking history data
const mockBookingHistory: MockBooking[] = [
  {
    id: '1001',
    field: { name: 'Sân bóng đá số 1' },
    bookingSlots: [{ date: '2023-12-15' }],
    startTime: '18:00',
    endTime: '19:30',
    status: BookingStatus.COMPLETED
  },
  {
    id: '1002',
    field: { name: 'Sân cầu lông số 2' },
    bookingSlots: [{ date: '2023-12-16' }],
    startTime: '08:00',
    endTime: '10:00',
    status: HistoryBookingStatus.PENDING
  },
  {
    id: '1003',
    field: { name: 'Sân Tennis số 1' },
    bookingSlots: [{ date: '2023-12-17' }],
    startTime: '19:00',
    endTime: '21:00',
    status: HistoryBookingStatus.CANCELLED
  },
  {
    id: '1004',
    field: { name: 'Sân bóng đá số 3' },
    bookingSlots: [{ date: '2023-12-18' }],
    startTime: '17:00',
    endTime: '18:30',
    status: BookingStatus.COMPLETED
  },
  {
    id: '1005',
    field: { name: 'Sân cầu lông số 1' },
    bookingSlots: [{ date: '2023-12-19' }],
    startTime: '09:00',
    endTime: '11:00',
    status: HistoryBookingStatus.IN_PROGRESS
  },
  {
    id: '1006',
    field: { name: 'Sân bóng đá số 2' },
    bookingSlots: [{ date: '2023-12-20' }],
    startTime: '20:00',
    endTime: '21:30',
    status: HistoryBookingStatus.CANCELLED
  }
];

// Mocked facility data
const mockFacilities: Facility[] = [
  { id: 'facility-1', name: 'Sân bóng đá mini Thống Nhất' },
  { id: 'facility-2', name: 'Sân cầu lông Phạm Kha' },
];

const Dashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isMobile = containerWidth < 640;
  const [loading, setLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string>('facility-1');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);

  // Revenue Data
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 67850000,
    comparedRevenue: 54250000,
    percentChange: 25.1,
    chartData: [
      { date: '2023-01-01', value: 1500000 },
      { date: '2023-02-01', value: 2800000 },
      { date: '2023-03-01', value: 2200000 },
      { date: '2023-04-01', value: 3800000 },
      { date: '2023-05-01', value: 4200000 },
      { date: '2023-06-01', value: 3900000 },
      { date: '2023-07-01', value: 5100000 },
      { date: '2023-08-01', value: 5400000 },
      { date: '2023-09-01', value: 6200000 },
      { date: '2023-10-01', value: 7500000 },
      { date: '2023-11-01', value: 8500000 },
      { date: '2023-12-01', value: 9800000 },
    ]
  });

  // Revenue Distribution
  const [revenueDistribution] = useState([
    { type: 'Bóng đá', value: 38500000 },
    { type: 'Cầu lông', value: 15600000 },
    { type: 'Tennis', value: 8750000 },
    { type: 'Dịch vụ', value: 5000000 },
  ]);

  // Bookings Overview
  const [bookingsData, setBookingsData] = useState({
    totalBookings: 365,
    completedBookings: 310,
    cancelledBookings: 15,
    pendingBookings: 40,
    percentChange: 12.4,
    chartData: [
      { month: 'T1', completed: 20, cancelled: 2 },
      { month: 'T2', completed: 25, cancelled: 1 },
      { month: 'T3', completed: 18, cancelled: 3 },
      { month: 'T4', completed: 22, cancelled: 2 },
      { month: 'T5', completed: 30, cancelled: 1 },
      { month: 'T6', completed: 28, cancelled: 2 },
      { month: 'T7', completed: 35, cancelled: 3 },
      { month: 'T8', completed: 32, cancelled: 1 },
      { month: 'T9', completed: 40, cancelled: 2 },
      { month: 'T10', completed: 38, cancelled: 3 },
      { month: 'T11', completed: 42, cancelled: 2 },
      { month: 'T12', completed: 45, cancelled: 4 },
    ]
  });

  // Fields Utilization
  const [fieldsUtilization] = useState([
    { name: 'Sân 1', utilization: 82 },
    { name: 'Sân 2', utilization: 75 },
    { name: 'Sân 3', utilization: 90 },
    { name: 'Sân 4', utilization: 68 },
    { name: 'Sân 5', utilization: 55 },
  ]);

  // Customer Overview
  const [customersData] = useState({
    totalCustomers: 520,
    newCustomers: 48,
    returningRate: 72,
    percentChange: 8.2,
  });

  // Recent Bookings
  const [recentBookings, setRecentBookings] = useState<MockBooking[]>(mockBookingHistory.slice(0, 5));

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    refreshData();
  }, [selectedFacility, dateRange]);

  const refreshData = () => {
    setLoading(true);
    
    // Simulated API calls
    setTimeout(() => {
      // Here, you would fetch actual data from your API
      // For now, we'll just simulate with random variations to the mock data
      
      // Update revenue data with slight variations
      const revenueVariation = Math.random() * 0.1 + 0.95; // 0.95 to 1.05
      setRevenueData({
        ...revenueData,
        totalRevenue: Math.round(revenueData.totalRevenue * revenueVariation),
        percentChange: revenueData.percentChange * revenueVariation,
      });
      
      // Update bookings data
      const bookingsVariation = Math.random() * 0.1 + 0.95;
      setBookingsData({
        ...bookingsData,
        totalBookings: Math.round(bookingsData.totalBookings * bookingsVariation),
        percentChange: bookingsData.percentChange * bookingsVariation,
      });
      
      // Update recent bookings (shuffle the order a bit)
      setRecentBookings([...mockBookingHistory].sort(() => 0.5 - Math.random()).slice(0, 5));
      
      setLoading(false);
    }, 1000);
  };

  // Line chart configuration for revenue
  const revenueChartConfig = {
    data: revenueData.chartData,
    xField: 'date',
    yField: 'value',
    seriesField: '',
    xAxis: {
      type: 'time',
      tickCount: 12,
      mask: 'MM/YYYY',
    },
    yAxis: {
      label: {
        formatter: (value: number) => `${(value / 1000000).toFixed(1)}tr`,
      },
    },
    smooth: true,
    tooltip: {
      formatter: (datum: ChartDatum) => {
        return { name: 'Doanh thu', value: formatCurrency(datum.value) };
      },
    },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#1890ff',
        lineWidth: 2,
      },
    },
    color: '#1890ff',
    lineStyle: {
      lineWidth: 3,
    },
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#1890ff 1:#1890ff',
      fillOpacity: 0.3,
    },
  };

  // Pie chart configuration for revenue distribution
  const pieChartConfig = {
    data: revenueDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      content: '{name}: {percentage}',
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div ref={containerRef} className="p-3 sm:p-4 md:p-6">
      {/* Header with facility selection and date range */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm mb-4 sm:mb-6">
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} md={12}>
            <Title level={3} className="m-0 text-lg sm:text-xl">Tổng quan</Title>
            <Paragraph className="text-gray-500 m-0 text-sm sm:text-base">
              Xem thống kê hoạt động kinh doanh của cơ sở thể thao
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Space size="middle" className="w-full justify-end flex-wrap">
              <Select
                value={selectedFacility}
                onChange={setSelectedFacility}
                style={{ width: isMobile ? '100%' : 250 }}
                placeholder="Chọn cơ sở"
                size={isMobile ? "middle" : "large"}
              >
                {mockFacilities.map(facility => (
                  <Option key={facility.id} value={facility.id}>{facility.name}</Option>
                ))}
              </Select>
              <RangePicker
                value={[dateRange[0], dateRange[1]]}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
                size={isMobile ? "middle" : "large"}
                style={{ width: isMobile ? '100%' : 'auto' }}
              />
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={refreshData}
                size={isMobile ? "middle" : "large"}
                className="w-full sm:w-auto"
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Doanh thu"
              value={revenueData.totalRevenue}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="đ"
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="mt-2 text-sm">
              <ArrowUpOutlined className="text-green-500 mr-1" />
              {revenueData.percentChange}% so với kỳ trước
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Lượt đặt sân"
              value={bookingsData.totalBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="mt-2 text-sm">
              <ArrowUpOutlined className="text-blue-500 mr-1" />
              {bookingsData.percentChange}% so với kỳ trước
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Khách hàng"
              value={customersData.totalCustomers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="mt-2 text-sm">
              <ArrowUpOutlined className="text-purple-500 mr-1" />
              {customersData.percentChange}% so với kỳ trước
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Tỷ lệ quay lại"
              value={customersData.returningRate}
              suffix="%"
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div className="mt-2 text-sm">
              <FieldTimeOutlined className="text-yellow-500 mr-1" />
              Trong 30 ngày qua
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
        <Col xs={24} md={16}>
          <Card title="Biểu đồ doanh thu" className="h-full">
            <div style={{ height: isMobile ? 300 : 400 }}>
              <Line {...revenueChartConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Phân bổ doanh thu" className="h-full">
            <div style={{ height: isMobile ? 300 : 400 }}>
              <Pie {...pieChartConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Fields Utilization and Recent Bookings */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Tỷ lệ sử dụng sân" className="h-full">
            <List
              dataSource={fieldsUtilization}
              renderItem={item => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between mb-2">
                      <span>{item.name}</span>
                      <span>{item.utilization}%</span>
                    </div>
                    <Progress percent={item.utilization} size="small" />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Đặt sân gần đây" className="h-full">
            <List
              dataSource={recentBookings}
              renderItem={(item: MockBooking) => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EyeOutlined />} size={isMobile ? "small" : "middle"}>
                      Xem
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={`Đặt sân #${item.id}`}
                    description={
                      <Space direction="vertical" size="small">
                        <Text>{item.field.name}</Text>
                        <Text type="secondary">
                          {dayjs(item.bookingSlots[0].date).format('DD/MM/YYYY')} | {item.startTime} - {item.endTime}
                        </Text>
                        <Badge 
                          status={
                            item.status === BookingStatus.COMPLETED ? 'success' :
                            item.status === HistoryBookingStatus.CANCELLED ? 'error' :
                            'processing'
                          }
                          text={
                            item.status === BookingStatus.COMPLETED ? 'Đã hoàn thành' :
                            item.status === HistoryBookingStatus.CANCELLED ? 'Đã hủy' :
                            'Đang xử lý'
                          }
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 