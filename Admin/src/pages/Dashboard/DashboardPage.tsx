import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin, DatePicker } from 'antd';
import { UserOutlined, HomeOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { apiClient } from '@/services/api.service';

// Đăng ký các components cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalUsers: number;
  totalFacilities: number;
  pendingApprovals: number;
  recentIssues: number;
}

interface RecentApproval {
  id: string;
  name: string;
  type: 'facility' | 'user' | 'verification';
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

const initialStats: DashboardStats = {
  totalUsers: 0,
  totalFacilities: 0,
  pendingApprovals: 0,
  recentIssues: 0,
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [recentApprovals, setRecentApprovals] = useState<RecentApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Người dùng mới',
        data: [] as number[],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Cơ sở mới',
        data: [] as number[],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Trong môi trường thực tế, bạn sẽ gọi API thực sự
        // const response = await apiClient.get('/admin/dashboard');
        // setStats(response.data.stats);
        // setRecentApprovals(response.data.recentApprovals);
        
        // Mock data for development
        setTimeout(() => {
          setStats({
            totalUsers: 1254,
            totalFacilities: 87,
            pendingApprovals: 12,
            recentIssues: 5,
          });
          
          setRecentApprovals([
            { id: '1', name: 'Sân vận động Thống Nhất', type: 'facility', status: 'pending', date: '2023-05-15' },
            { id: '2', name: 'Nguyễn Văn A', type: 'user', status: 'approved', date: '2023-05-14' },
            { id: '3', name: 'Trần Thị B', type: 'verification', status: 'rejected', date: '2023-05-13' },
            { id: '4', name: 'Sân bóng đá Mini', type: 'facility', status: 'pending', date: '2023-05-12' },
            { id: '5', name: 'Phạm Văn C', type: 'user', status: 'pending', date: '2023-05-11' },
          ]);
          
          // Sample chart data
          const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
          setChartData({
            labels,
            datasets: [
              {
                label: 'Người dùng mới',
                data: [65, 78, 90, 115, 125, 150, 178],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
              },
              {
                label: 'Cơ sở mới',
                data: [15, 20, 18, 22, 25, 30, 35],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
              },
            ],
          });
          
          setLoading(false);
        }, 100);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const approvalColumns: ColumnsType<RecentApproval> = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let text = '';
        let icon = null;
        
        switch (type) {
          case 'facility':
            text = 'Cơ sở';
            icon = <HomeOutlined />;
            break;
          case 'user':
            text = 'Người dùng';
            icon = <UserOutlined />;
            break;
          case 'verification':
            text = 'Xác thực';
            icon = <CheckCircleOutlined />;
            break;
          default:
            text = 'Khác';
            icon = <ExclamationCircleOutlined />;
        }
        
        return (
          <span>
            {icon} {text}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'pending':
            color = 'orange';
            text = 'Đang chờ';
            break;
          case 'approved':
            color = 'green';
            text = 'Đã duyệt';
            break;
          case 'rejected':
            color = 'red';
            text = 'Từ chối';
            break;
          default:
            color = 'default';
            text = 'Không xác định';
        }
        
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Thống kê tăng trưởng',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DatePicker.RangePicker className="w-72" />
      </div>
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng cơ sở"
              value={stats.totalFacilities}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ phê duyệt"
              value={stats.pendingApprovals}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Vấn đề gần đây"
              value={stats.recentIssues}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col span={16}>
          <Card title="Biểu đồ thống kê">
            <Line options={chartOptions} data={chartData} height={80} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Các yêu cầu gần đây" className="h-full">
            <Table 
              columns={approvalColumns} 
              dataSource={recentApprovals}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;