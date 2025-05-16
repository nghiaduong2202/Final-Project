import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, Row, Col, Statistic, Typography, 
  Button, Space, Progress, List, Avatar, Select, Spin, DatePicker, Tooltip
} from 'antd';
import {
  CalendarOutlined, TeamOutlined, DollarOutlined, 
  ArrowUpOutlined, ArrowDownOutlined, UserOutlined,
  ReloadOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import dashboardService from '@/services/dashboard.service';
import { facilityService, FacilityDropdownItem } from '@/services/facility.service';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface ChartDatum {
  date?: string;
  value: number;
  type?: string;
  month?: string;
  completed?: number;
  cancelled?: number;
}

// Interfaces for Dashboard data
interface Player {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  // Other player fields...
}

interface TopPlayerEntry {
  player: Player;
  amount: number;
}

interface DashboardData {
  revenue: number;
  prevMonthRevenue: number;
  bookingCount: number;
  prevMonthBookingCount: number;
  playerCount: number;
  prevMonthPlayerCount: number;
  topPlayer: TopPlayerEntry[];
  prevMonthTopPlayer: TopPlayerEntry[];
}

// Mocked facility data - will be replaced with real data
const mockFacilities: FacilityDropdownItem[] = [
  { id: 'all', name: 'Tất cả cơ sở' },
  { id: 'facility-1', name: 'Sân bóng đá mini Thống Nhất' },
  { id: 'facility-2', name: 'Sân cầu lông Phạm Kha' },
];

const Dashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isMobile = containerWidth < 640;
  const [loading, setLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [facilities, setFacilities] = useState<FacilityDropdownItem[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  // Fields Utilization
  const [fieldsUtilization] = useState([
    { name: 'Sân 1', fieldGroup: 'Sân bóng đá mini', utilization: 82 },
    { name: 'Sân 2', fieldGroup: 'Sân bóng đá mini', utilization: 75 },
    { name: 'Sân 3', fieldGroup: 'Sân cầu lông', utilization: 90 },
    { name: 'Sân 4', fieldGroup: 'Sân cầu lông', utilization: 68 },
    { name: 'Sân 5', fieldGroup: 'Sân Tennis', utilization: 55 },
  ]);

  // Revenue Distribution
  const [revenueDistribution] = useState([
    { type: 'Bóng đá', value: 30000000 },
    { type: 'Cầu lông', value: 20000000 },
    { type: 'Tennis', value: 10000000 },
    { type: 'Dịch vụ', value: 5000000 },
  ]);

  // Fetch facilities from API
  useEffect(() => {
    const fetchFacilities = async () => {
      setLoadingFacilities(true);
      try {
        const response = await facilityService.getFacilitiesDropdown();
        // Add "All facilities" option
        const facilitiesWithAll = [
          { id: 'all', name: 'Tất cả cơ sở' },
          ...response
        ];
        setFacilities(facilitiesWithAll);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        // Fallback to mock data if API fails
        setFacilities(mockFacilities);
      } finally {
        setLoadingFacilities(false);
      }
    };

    fetchFacilities();
  }, []);

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
    if (!loadingFacilities) {
      fetchDashboardData();
    }
  }, [selectedFacility, selectedDate, loadingFacilities]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const month = selectedDate.month() + 1; // dayjs months are 0-indexed
      const year = selectedDate.year();
      const facilityId = selectedFacility !== 'all' ? selectedFacility : undefined;
      
      const data = await dashboardService.getDashboardData(month, year, facilityId);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Line chart configuration for revenue (mocked data for now)
  const revenueChartConfig = {
    data: [
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
    ],
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
      content: '{type}: {percentage}',
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Calculate percentage change
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
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
                loading={loadingFacilities}
              >
                {facilities.map(facility => (
                  <Option key={facility.id} value={facility.id}>{facility.name}</Option>
                ))}
              </Select>
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                picker="month"
                size={isMobile ? "middle" : "large"}
                style={{ width: isMobile ? '100%' : 150 }}
              />
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={fetchDashboardData}
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
        <Col xs={24} sm={12} md={8}>
          <Card className="h-full shadow-sm">
            {loading ? (
              <div className="w-full h-24 flex items-center justify-center">
                <Spin />
              </div>
            ) : dashboardData ? (
              <>
                <Statistic
                  title="Doanh thu"
                  value={dashboardData.revenue}
                  precision={0}
                  prefix={<DollarOutlined />}
                  suffix="đ"
                  valueStyle={{ color: '#3f8600' }}
                />
                <div className="mt-2 text-sm">
                  {calculatePercentChange(dashboardData.revenue, dashboardData.prevMonthRevenue) >= 0 ? (
                    <>
                      <ArrowUpOutlined className="text-green-500 mr-1" />
                      <span className="text-green-500">
                        {calculatePercentChange(dashboardData.revenue, dashboardData.prevMonthRevenue).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownOutlined className="text-red-500 mr-1" />
                      <span className="text-red-500">
                        {Math.abs(calculatePercentChange(dashboardData.revenue, dashboardData.prevMonthRevenue)).toFixed(1)}%
                      </span>
                    </>
                  )}
                  {' '}so với tháng trước
                </div>
              </>
            ) : (
              <div className="w-full h-24 flex items-center justify-center">
                <Text type="secondary">Không có dữ liệu</Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="h-full shadow-sm">
            {loading ? (
              <div className="w-full h-24 flex items-center justify-center">
                <Spin />
              </div>
            ) : dashboardData ? (
              <>
                <Statistic
                  title="Lượt đặt sân"
                  value={dashboardData.bookingCount}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div className="mt-2 text-sm">
                  {calculatePercentChange(dashboardData.bookingCount, dashboardData.prevMonthBookingCount) >= 0 ? (
                    <>
                      <ArrowUpOutlined className="text-blue-500 mr-1" />
                      <span className="text-blue-500">
                        {calculatePercentChange(dashboardData.bookingCount, dashboardData.prevMonthBookingCount).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownOutlined className="text-red-500 mr-1" />
                      <span className="text-red-500">
                        {Math.abs(calculatePercentChange(dashboardData.bookingCount, dashboardData.prevMonthBookingCount)).toFixed(1)}%
                      </span>
                    </>
                  )}
                  {' '}so với tháng trước
                </div>
              </>
            ) : (
              <div className="w-full h-24 flex items-center justify-center">
                <Text type="secondary">Không có dữ liệu</Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="h-full shadow-sm">
            {loading ? (
              <div className="w-full h-24 flex items-center justify-center">
                <Spin />
              </div>
            ) : dashboardData ? (
              <>
                <Statistic
                  title="Số lượng người chơi"
                  value={dashboardData.playerCount}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <div className="mt-2 text-sm">
                  {calculatePercentChange(dashboardData.playerCount, dashboardData.prevMonthPlayerCount) >= 0 ? (
                    <>
                      <ArrowUpOutlined className="text-purple-500 mr-1" />
                      <span className="text-purple-500">
                        {calculatePercentChange(dashboardData.playerCount, dashboardData.prevMonthPlayerCount).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownOutlined className="text-red-500 mr-1" />
                      <span className="text-red-500">
                        {Math.abs(calculatePercentChange(dashboardData.playerCount, dashboardData.prevMonthPlayerCount)).toFixed(1)}%
                      </span>
                    </>
                  )}
                  {' '}so với tháng trước
                </div>
              </>
            ) : (
              <div className="w-full h-24 flex items-center justify-center">
                <Text type="secondary">Không có dữ liệu</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Charts Row - First Row */}
      <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
        <Col xs={24} md={12}>
          <Card 
            title="Biểu đồ doanh thu" 
            className="h-full shadow-sm"
            extra={<Tooltip title="Dữ liệu doanh thu theo từng tháng trong năm"><InfoCircleOutlined /></Tooltip>}
          >
            <div className="mb-2">
              <Text type="secondary">
                Biểu đồ thể hiện doanh thu theo thời gian, giúp bạn theo dõi hiệu suất kinh doanh. 
                Tổng doanh thu năm nay: <Text strong>{formatCurrency(revenueChartConfig.data.reduce((sum, item) => sum + item.value, 0))}</Text>
              </Text>
            </div>
            <div style={{ height: isMobile ? 300 : 350 }}>
              <Line {...revenueChartConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Phân bổ doanh thu" 
            className="h-full shadow-sm"
            extra={<Tooltip title="Tỷ lệ doanh thu theo loại sân"><InfoCircleOutlined /></Tooltip>}
          >
            <div className="mb-2">
              <Text type="secondary">
                Phân tích doanh thu theo từng loại sân và dịch vụ, giúp bạn xác định nguồn doanh thu chính.
              </Text>
            </div>
            <div style={{ height: isMobile ? 300 : 350 }}>
              <Pie {...pieChartConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row - Second Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card 
            title="Tỷ lệ sử dụng sân" 
            className="h-full shadow-sm"
            extra={<Tooltip title="Phần trăm thời gian sân được sử dụng"><InfoCircleOutlined /></Tooltip>}
          >
            <div className="mb-2">
              <Text type="secondary">
                Biểu đồ thể hiện tỷ lệ sử dụng của từng sân, tính theo phần trăm thời gian có người đặt. 
                Tỷ lệ càng cao, sân càng được sử dụng nhiều.
              </Text>
            </div>
            <List
              dataSource={fieldsUtilization}
              renderItem={item => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between mb-2">
                      <Space direction="vertical" size={0}>
                        <Text strong>{item.name}</Text>
                        <Text type="secondary" className="text-xs">{item.fieldGroup}</Text>
                      </Space>
                      <span>{item.utilization}%</span>
                    </div>
                    <Progress 
                      percent={item.utilization} 
                      size="small"
                      status={
                        item.utilization > 80 ? 'success' :
                        item.utilization > 50 ? 'normal' : 'exception'
                      }
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Người chơi tích cực nhất" className="h-full shadow-sm">
            {loading ? (
              <div className="w-full h-24 flex items-center justify-center">
                <Spin />
              </div>
            ) : dashboardData && dashboardData.topPlayer && dashboardData.topPlayer.length > 0 ? (
              <List
                dataSource={dashboardData.topPlayer}
                renderItem={(playerData, index) => {
                  if (!playerData || !playerData.player) {
                    return null;
                  }
                  
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            style={{ 
                              backgroundColor: index === 0 ? '#f56a00' : index === 1 ? '#7265e6' : '#00a2ae' 
                            }}
                            src={playerData.player.avatarUrl || undefined}
                            icon={!playerData.player.avatarUrl ? <UserOutlined /> : undefined}
                          />
                        }
                        title={playerData.player.name || 'Người chơi không xác định'}
                        description={
                          <div>
                            <div>{`${playerData.amount || 0} lượt đặt sân`}</div>
                            <div>{`SĐT: ${playerData.player.phoneNumber || 'Không có'}`}</div>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <div className="w-full h-24 flex items-center justify-center">
                <Text type="secondary">Không có dữ liệu</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 