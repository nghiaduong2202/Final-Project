import React, { useState } from 'react';
import { Card, Row, Col, Select, Tabs, DatePicker } from 'antd';
import { 
  UserOutlined, 
  ShopOutlined, 
  AppstoreOutlined, 
  ToolOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';

// Cần import các components biểu đồ từ thư viện chart (như Chart.js hoặc Recharts)
// import { LineChart, BarChart } from 'your-chart-library';

interface StatisticCardProps {
  title: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down';
  icon: React.ReactNode;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ 
  title, 
  value, 
  trend, 
  trendType, 
  icon 
}) => {
  return (
    <Card className="h-40 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-gray-500 font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold mb-2">{value}</p>
          <div className={`flex items-center gap-1 ${trendType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trendType === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span>{trend}</span>
          </div>
        </div>
        <div className="text-5xl opacity-80 text-blue-500">
          {icon}
        </div>
      </div>
    </Card>
  );
};

const ReportPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [chartTab, setChartTab] = useState('overview');
  
  const statisticsData = [
    {
      title: 'Total Users',
      value: '40,689',
      trend: '8.5% Up from yesterday',
      trendType: 'up' as const,
      icon: <UserOutlined />
    },
    {
      title: 'Total Facilities',
      value: '10,293',
      trend: '1.3% Up from past week',
      trendType: 'up' as const,
      icon: <ShopOutlined />
    },
    {
      title: 'Total Fields',
      value: '10,000',
      trend: '4.3% Down from yesterday',
      trendType: 'down' as const,
      icon: <AppstoreOutlined />
    },
    {
      title: 'Total Services',
      value: '2,040',
      trend: '1.8% Up from yesterday',
      trendType: 'up' as const,
      icon: <ToolOutlined />
    }
  ];
  
  const chartTabs: TabsProps['items'] = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Overview Chart Component Would Go Here</p>
          {/* <LineChart data={overviewData} /> */}
        </div>
      )
    },
    {
      key: 'users',
      label: 'Users',
      children: (
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Users Chart Component Would Go Here</p>
          {/* <LineChart data={usersData} /> */}
        </div>
      )
    },
    {
      key: 'facilities',
      label: 'Facilities',
      children: (
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Facilities Chart Component Would Go Here</p>
          {/* <BarChart data={facilitiesData} /> */}
        </div>
      )
    },
    {
      key: 'revenue',
      label: 'Revenue',
      children: (
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Revenue Chart Component Would Go Here</p>
          {/* <LineChart data={revenueData} /> */}
        </div>
      )
    }
  ];
  
  return (
    <div className="flex flex-col p-6 bg-[#f5f6fa] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Report Dashboard</h1>
        <p className="text-gray-500">View statistics and analytics</p>
      </div>
      
      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="mb-6">
        {statisticsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <StatisticCard {...stat} />
          </Col>
        ))}
      </Row>
      
      {/* User Registration Trends */}
      <Card className="mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">User Registration Trends</h2>
          <Select
            defaultValue="week"
            style={{ width: 120 }}
            options={[
              { value: 'day', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' }
            ]}
            onChange={(value) => setTimeRange(value)}
          />
        </div>
        
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Registration Chart Component Would Go Here</p>
          {/* <LineChart data={registrationData} /> */}
        </div>
      </Card>
      
      {/* Business Growth */}
      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Business Growth</h2>
          <div className="flex items-center gap-3">
            <DatePicker.RangePicker />
          </div>
        </div>
        
        <Tabs 
          items={chartTabs}
          activeKey={chartTab}
          onChange={(key) => setChartTab(key)}
        />
      </Card>
    </div>
  );
};

export default ReportPage;