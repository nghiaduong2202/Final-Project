import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, Row, Col, Statistic, Typography, Table, DatePicker, 
  Button, Space, Progress, Select, Tag, Tabs,
  Segmented
} from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, CalendarOutlined,
  FieldTimeOutlined, DollarOutlined,
  ReloadOutlined, DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { Line, Column, Pie } from '@ant-design/charts';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Interface cho cơ sở
interface Facility {
  id: string;
  name: string;
}

// Dữ liệu thống kê
interface FinancialStats {
  totalRevenue: number;
  previousPeriodRevenue: number;
  percentChange: number;
  avgDailyRevenue: number;
  totalBookings: number;
  previousPeriodBookings: number;
  bookingsPercentChange: number;
  topServices: {
    name: string;
    revenue: number;
    percentOfTotal: number;
  }[];
  revenueBySource: {
    source: string;
    value: number;
  }[];
  revenueByDay: {
    date: string;
    revenue: number;
  }[];
  revenueByHour: {
    hour: string;
    revenue: number;
  }[];
  revenueByField: {
    field: string;
    revenue: number;
  }[];
}

// Mock data cho báo cáo tài chính
const mockFinancialStats: FinancialStats = {
  totalRevenue: 450000000, // 450 triệu VND
  previousPeriodRevenue: 380000000, // 380 triệu VND
  percentChange: 18.4,
  avgDailyRevenue: 15000000, // 15 triệu VND
  totalBookings: 850,
  previousPeriodBookings: 720,
  bookingsPercentChange: 18.1,
  topServices: [
    { name: 'Thuê sân bóng đá', revenue: 300000000, percentOfTotal: 66.7 },
    { name: 'Thuê sân cầu lông', revenue: 80000000, percentOfTotal: 17.8 },
    { name: 'Dịch vụ đồ uống', revenue: 40000000, percentOfTotal: 8.9 },
    { name: 'Thuê dụng cụ', revenue: 20000000, percentOfTotal: 4.4 },
    { name: 'Khác', revenue: 10000000, percentOfTotal: 2.2 }
  ],
  revenueBySource: [
    { source: 'Đặt sân online', value: 320000000 },
    { source: 'Đặt trực tiếp', value: 100000000 },
    { source: 'Dịch vụ phụ trợ', value: 30000000 }
  ],
  revenueByDay: [
    { date: '2023-11-01', revenue: 14000000 },
    { date: '2023-11-02', revenue: 13500000 },
    { date: '2023-11-03', revenue: 15000000 },
    { date: '2023-11-04', revenue: 18000000 },
    { date: '2023-11-05', revenue: 20000000 },
    { date: '2023-11-06', revenue: 16000000 },
    { date: '2023-11-07', revenue: 14500000 },
    { date: '2023-11-08', revenue: 13000000 },
    { date: '2023-11-09', revenue: 12500000 },
    { date: '2023-11-10', revenue: 14800000 },
    { date: '2023-11-11', revenue: 18500000 },
    { date: '2023-11-12', revenue: 19500000 },
    { date: '2023-11-13', revenue: 15800000 },
    { date: '2023-11-14', revenue: 14000000 },
    { date: '2023-11-15', revenue: 13200000 },
    { date: '2023-11-16', revenue: 12800000 },
    { date: '2023-11-17', revenue: 14200000 },
    { date: '2023-11-18', revenue: 19000000 },
    { date: '2023-11-19', revenue: 21000000 },
    { date: '2023-11-20', revenue: 16200000 },
    { date: '2023-11-21', revenue: 15000000 },
    { date: '2023-11-22', revenue: 14200000 },
    { date: '2023-11-23', revenue: 13800000 },
    { date: '2023-11-24', revenue: 15200000 },
    { date: '2023-11-25', revenue: 19500000 },
    { date: '2023-11-26', revenue: 21500000 },
    { date: '2023-11-27', revenue: 16500000 },
    { date: '2023-11-28', revenue: 15200000 },
    { date: '2023-11-29', revenue: 14800000 },
    { date: '2023-11-30', revenue: 15500000 }
  ],
  revenueByHour: [
    { hour: '06:00', revenue: 5000000 },
    { hour: '08:00', revenue: 8000000 },
    { hour: '10:00', revenue: 12000000 },
    { hour: '12:00', revenue: 7000000 },
    { hour: '14:00', revenue: 9000000 },
    { hour: '16:00', revenue: 15000000 },
    { hour: '18:00', revenue: 25000000 },
    { hour: '20:00', revenue: 20000000 },
    { hour: '22:00', revenue: 10000000 }
  ],
  revenueByField: [
    { field: 'Sân bóng đá 5 người - Sân 1', revenue: 85000000 },
    { field: 'Sân bóng đá 5 người - Sân 2', revenue: 80000000 },
    { field: 'Sân bóng đá 7 người - Sân 1', revenue: 70000000 },
    { field: 'Sân bóng đá 7 người - Sân 2', revenue: 65000000 },
    { field: 'Sân cầu lông - Sân 1', revenue: 45000000 },
    { field: 'Sân cầu lông - Sân 2', revenue: 40000000 },
    { field: 'Sân cầu lông - Sân 3', revenue: 35000000 },
    { field: 'Sân cầu lông - Sân 4', revenue: 30000000 }
  ]
};

// Danh sách giao dịch gần đây
interface Transaction {
  id: string;
  date: string;
  customerName: string;
  service: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
}

const mockTransactions: Transaction[] = [
  { id: 'T00001', date: '2023-11-30T19:30:00', customerName: 'Nguyễn Văn A', service: 'Sân bóng đá 5 người - Sân 1', amount: 500000, status: 'completed' },
  { id: 'T00002', date: '2023-11-30T18:00:00', customerName: 'Trần Thị B', service: 'Sân cầu lông - Sân 2', amount: 180000, status: 'completed' },
  { id: 'T00003', date: '2023-11-30T17:15:00', customerName: 'Lê Văn C', service: 'Sân bóng đá 7 người - Sân 1', amount: 700000, status: 'completed' },
  { id: 'T00004', date: '2023-11-30T16:30:00', customerName: 'Phạm Thị D', service: 'Sân cầu lông - Sân 3', amount: 180000, status: 'pending' },
  { id: 'T00005', date: '2023-11-30T15:45:00', customerName: 'Hoàng Văn E', service: 'Sân bóng đá 5 người - Sân 2', amount: 500000, status: 'refunded' },
];

// Mock facilities
const mockFacilities: Facility[] = [
  { id: '1', name: 'Sân bóng đá Hà Nội' },
  { id: '2', name: 'Sân cầu lông Phạm Kha' }
];

// Thêm interface cho dữ liệu biểu đồ
interface ChartDatum {
  date?: string;
  revenue?: number;
  source?: string;
  value?: number;
  field?: string;
  hour?: string;
}

const ReportManagement: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isMobile = containerWidth < 640;
  
  // State
  const [selectedFacility, setSelectedFacility] = useState<string>('1');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [reportType, setReportType] = useState<string>('day');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<FinancialStats>(mockFinancialStats);

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

  // Effect để load dữ liệu khi thay đổi filter
  useEffect(() => {
    fetchReportData();
  }, [selectedFacility, dateRange, reportType]);

  // Hàm lấy dữ liệu báo cáo (giả lập API call)
  const fetchReportData = () => {
    setLoading(true);
    
    // Giả lập API delay
    setTimeout(() => {
      // Trong thực tế sẽ gọi API ở đây
      setStats(mockFinancialStats);
      setLoading(false);
    }, 500);
  };

  // Format số tiền VND
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Format phần trăm
  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Config cho biểu đồ doanh thu theo ngày
  const revenueByDayConfig = {
    data: stats.revenueByDay,
    xField: 'date',
    yField: 'revenue',
    xAxis: {
      type: 'time',
      tickCount: 7,
      mask: 'DD/MM/YYYY',
    },
    yAxis: {
      label: {
        formatter: (value: number) => `${(value / 1000000).toFixed(0)}tr`,
      },
    },
    meta: {
      date: {
        formatter: (value: string) => dayjs(value).format('DD/MM/YYYY'),
      },
      revenue: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
    tooltip: {
      formatter: (datum: ChartDatum) => {
        return { name: 'Doanh thu', value: formatCurrency(datum.revenue || 0) };
      },
    }
  };

  // Config cho biểu đồ doanh thu theo loại sân
  const revenueByFieldConfig = {
    data: stats.revenueByField,
    xField: 'revenue',
    yField: 'field',
    seriesField: 'field',
    meta: {
      revenue: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
    yAxis: {
      label: {
        formatter: (value: string) => {
          if (value.length > 25) {
            return value.substring(0, 22) + '...';
          }
          return value;
        },
      },
    },
    tooltip: {
      formatter: (datum: ChartDatum) => {
        return { name: datum.field || '', value: formatCurrency(datum.revenue || 0) };
      },
    }
  };

  // Config cho biểu đồ doanh thu theo giờ
  const revenueByHourConfig = {
    data: stats.revenueByHour,
    xField: 'hour',
    yField: 'revenue',
    meta: {
      revenue: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
    tooltip: {
      formatter: (datum: ChartDatum) => {
        return { name: `${datum.hour || ''}`, value: formatCurrency(datum.revenue || 0) };
      },
    }
  };

  // Config cho biểu đồ doanh thu theo nguồn
  const revenueBySourceConfig = {
    data: stats.revenueBySource,
    angleField: 'value',
    colorField: 'source',
    radius: 0.8,
    label: {
      content: '{name}: {percentage}',
    },
    tooltip: {
      formatter: (datum: ChartDatum) => {
        return { name: datum.source || '', value: formatCurrency(datum.value || 0) };
      },
    }
  };

  // Cấu hình cột cho bảng transactions
  const transactionColumns = [
    {
      title: 'Mã GD',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <Text strong>{formatCurrency(amount)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        let text = '';
        
        switch(status) {
          case 'completed':
            color = 'success';
            text = 'Hoàn thành';
            break;
          case 'pending':
            color = 'warning';
            text = 'Đang xử lý';
            break;
          case 'refunded':
            color = 'error';
            text = 'Đã hoàn tiền';
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div ref={containerRef} className="p-3 sm:p-4 md:p-6">
      <Card className="mb-4 sm:mb-6">
        <Title level={4} className="text-lg sm:text-xl">Báo cáo doanh thu</Title>
        
        <Space direction="vertical" size="large" className="w-full">
          <Row gutter={[8, 8]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Text strong>Cơ sở:</Text>
              <Select
                value={selectedFacility}
                onChange={setSelectedFacility}
                className="w-full"
                size={isMobile ? "middle" : "large"}
              >
                {mockFacilities.map(facility => (
                  <Option key={facility.id} value={facility.id}>{facility.name}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text strong>Thời gian:</Text>
              <RangePicker
                value={[dateRange[0], dateRange[1]]}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
                className="w-full"
                size={isMobile ? "middle" : "large"}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={fetchReportData}
                loading={loading}
                className="w-full"
                size={isMobile ? "middle" : "large"}
              >
                Làm mới
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={() => {/* Xử lý xuất báo cáo */}}
                className="w-full"
                size={isMobile ? "middle" : "large"}
              >
                Xuất báo cáo
              </Button>
            </Col>
          </Row>
          
          <Segmented
            options={[
              { label: 'Theo ngày', value: 'day' },
              { label: 'Theo tuần', value: 'week' },
              { label: 'Theo tháng', value: 'month' },
              { label: 'Theo quý', value: 'quarter' },
            ]}
            value={reportType}
            onChange={(value) => setReportType(value as string)}
            className="w-full sm:w-auto"
            size={isMobile ? "middle" : "large"}
          />
        </Space>
      </Card>
      
      <Row gutter={[8, 8]} className="mb-4 sm:mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value as number)}
            />
            <div className="mt-2">
              <Tag color={stats.percentChange >= 0 ? 'success' : 'error'}>
                {stats.percentChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {formatPercent(stats.percentChange)} so với kỳ trước
              </Tag>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Doanh thu trung bình/ngày"
              value={stats.avgDailyRevenue}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value as number)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Tổng số lượt đặt sân"
              value={stats.totalBookings}
              valueStyle={{ color: '#722ed1' }}
              prefix={<CalendarOutlined />}
            />
            <div className="mt-2">
              <Tag color={stats.bookingsPercentChange >= 0 ? 'success' : 'error'}>
                {stats.bookingsPercentChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {formatPercent(stats.bookingsPercentChange)} so với kỳ trước
              </Tag>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Giờ cao điểm"
              value="18:00 - 20:00"
              valueStyle={{ color: '#fa8c16' }}
              prefix={<FieldTimeOutlined />}
            />
            <div className="mt-2">
              <Progress 
                percent={80} 
                showInfo={false} 
                strokeColor="#fa8c16" 
              />
            </div>
          </Card>
        </Col>
      </Row>
      
      <Tabs
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: 'Tổng quan doanh thu',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  <Card 
                    title="Doanh thu theo ngày" 
                    className="mb-4"
                    extra={
                      <Space>
                        <Button 
                          icon={<ReloadOutlined />} 
                          onClick={fetchReportData}
                          loading={loading}
                        />
                        <Button 
                          icon={<DownloadOutlined />} 
                          onClick={() => {/* Xử lý tải xuống */}}
                        />
                      </Space>
                    }
                  >
                    <Line 
                      {...revenueByDayConfig}
                      height={isMobile ? 250 : 350}
                    />
                  </Card>
                </Col>
                
                <Col xs={24} lg={8}>
                  <Card 
                    title="Phân bố doanh thu theo nguồn" 
                    className="mb-4"
                    extra={
                      <Button 
                        icon={<DownloadOutlined />} 
                        onClick={() => {/* Xử lý tải xuống */}}
                      />
                    }
                  >
                    <Pie 
                      {...revenueBySourceConfig}
                      height={isMobile ? 250 : 350}
                    />
                  </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card 
                    title="Doanh thu theo giờ" 
                    className="mb-4"
                    extra={
                      <Button 
                        icon={<DownloadOutlined />} 
                        onClick={() => {/* Xử lý tải xuống */}}
                      />
                    }
                  >
                    <Column 
                      {...revenueByHourConfig}
                      height={isMobile ? 250 : 350}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card 
                    title="Doanh thu theo loại sân" 
                    className="mb-4"
                    extra={
                      <Button 
                        icon={<DownloadOutlined />} 
                        onClick={() => {/* Xử lý tải xuống */}}
                      />
                    }
                  >
                    <Column 
                      {...revenueByFieldConfig}
                      height={isMobile ? 250 : 350}
                    />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'services',
            label: 'Dịch vụ hàng đầu',
            children: (
              <Card>
                <Table
                  columns={[
                    {
                      title: 'Dịch vụ',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: 'Doanh thu',
                      dataIndex: 'revenue',
                      key: 'revenue',
                      render: (revenue: number) => formatCurrency(revenue),
                    },
                    {
                      title: '% tổng doanh thu',
                      dataIndex: 'percentOfTotal',
                      key: 'percentOfTotal',
                      render: (percent: number) => (
                        <div>
                          {percent.toFixed(1)}%
                          <div className="mt-1">
                            <Progress 
                              percent={percent} 
                              showInfo={false}
                              strokeColor={
                                percent > 50 ? '#52c41a' : 
                                percent > 25 ? '#faad14' : '#1890ff'
                              }
                            />
                          </div>
                        </div>
                      ),
                    },
                  ]}
                  dataSource={stats.topServices}
                  rowKey="name"
                  pagination={false}
                  scroll={isMobile ? { x: 'max-content' } : undefined}
                />
              </Card>
            )
          },
          {
            key: 'transactions',
            label: 'Giao dịch gần đây',
            children: (
              <Card>
                <Table
                  columns={transactionColumns}
                  dataSource={mockTransactions}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={isMobile ? { x: 'max-content' } : undefined}
                />
              </Card>
            )
          }
        ]}
      />
    </div>
  );
};

export default ReportManagement; 