import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockPlaymateSearches } from '@/mocks/playmate/playmate.mock';
import { PlaymateSearch, PlaymateApplication } from '@/types/playmate.type';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Typography,
  Button,
  Tabs,
  Row,
  Col,
  Card,
  Tag,
  Empty,
  Spin,
  Breadcrumb,
  Avatar,
  Space,
  Divider,
  Badge,
  Popconfirm,
  message
} from 'antd';
import {
  PlusOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Extended PlaymateApplication type to include search property
interface ExtendedPlaymateApplication extends PlaymateApplication {
  search: {
    id: number;
    title: string;
    sportId: number;
    sportName: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    location?: string;
    creator: {
      name: string;
      avatar?: string;
      gender?: string;
      phoneNumber?: string;
    };
  };
}

// Mock delete function
const deleteSearch = (id: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Deleting search with ID: ${id}`);
      resolve(true);
    }, 500);
  });
};

// Mock cancel function
const cancelApplication = (searchId: number, applicationId: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Cancelling application ${applicationId} for search ${searchId}`);
      resolve(true);
    }, 500);
  });
};

const PlaymateManage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mySearches');
  const [mySearches, setMySearches] = useState<PlaymateSearch[]>([]);
  const [myApplications, setMyApplications] = useState<ExtendedPlaymateApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Filter searches created by current user (mock)
      const currentUserId = 'current_user_id';
      const userSearches = mockPlaymateSearches.filter(search => search.userId === currentUserId);
      setMySearches(userSearches);

      // Get applications made by current user (mock)
      const userApplications = mockPlaymateSearches.reduce((acc, search) => {
        if (search.applications) {
          const userApps = search.applications.filter((app: PlaymateApplication) => app.userId === currentUserId);
          if (userApps.length > 0) {
            userApps.forEach((app: PlaymateApplication) => {
              acc.push({
                ...app,
                search: {
                  id: search.id,
                  title: search.title,
                  sportId: search.sportId,
                  sportName: search.sportName || '',
                  date: search.date,
                  timeStart: search.startTime,
                  timeEnd: search.endTime,
                  location: search.location,
                  creator: search.userInfo
                }
              });
            });
          }
        }
        return acc;
      }, [] as ExtendedPlaymateApplication[]);
      
      setMyApplications(userApplications);
      setLoading(false);
    }, 800);
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleCreate = () => {
    navigate('/user/playmate/create');
  };

  const handleDelete = async (id: number) => {
    setProcessingIds(prev => [...prev, id]);
    try {
      const success = await deleteSearch(id);
      if (success) {
        setMySearches(prev => prev.filter(search => search.id !== id));
        message.success('Đã xóa bài đăng thành công!');
      }
    } catch (err) {
      console.error('Error deleting search:', err);
      message.error('Có lỗi xảy ra khi xóa bài đăng.');
    } finally {
      setProcessingIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleCancelApplication = async (searchId: number, applicationId: number) => {
    setProcessingIds(prev => [...prev, applicationId]);
    try {
      const success = await cancelApplication(searchId, applicationId);
      if (success) {
        setMyApplications(prev => prev.filter(app => app.id !== applicationId));
        message.success('Đã hủy đăng ký thành công!');
      }
    } catch (err) {
      console.error('Error cancelling application:', err);
      message.error('Có lỗi xảy ra khi hủy đăng ký.');
    } finally {
      setProcessingIds(prev => prev.filter(itemId => itemId !== applicationId));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Đang tìm kiếm',
      'COMPLETED': 'Đã tìm đủ',
      'CANCELLED': 'Đã hủy',
      'EXPIRED': 'Đã hết hạn',
      'PENDING': 'Đang chờ',
      'ACCEPTED': 'Đã chấp nhận',
      'REJECTED': 'Đã từ chối'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'ACTIVE': 'success',
      'COMPLETED': 'processing',
      'CANCELLED': 'error',
      'EXPIRED': 'default',
      'PENDING': 'warning',
      'ACCEPTED': 'success',
      'REJECTED': 'error'
    };
    return colorMap[status] || 'default';
  };

  // Render a single search card
  const renderSearchCard = (search: PlaymateSearch) => {
    const isProcessing = processingIds.includes(search.id);
    return (
      <Card
        hoverable
        className="w-full h-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        cover={
          <div className="h-40 sm:h-48 overflow-hidden relative">
            <img
              alt={search.sportName}
              src={`https://source.unsplash.com/random/400x200/?${search.sportName?.toLowerCase()}`}
              className="w-full h-full object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
            <Badge
              className="absolute top-3 right-3"
              status={getStatusColor(search.status) as "success" | "error" | "default" | "processing" | "warning"}
              text={
                <span className="bg-white px-2 py-1 rounded text-xs">{getStatusText(search.status)}</span>
              }
            />
          </div>
        }
        style={{ padding: 16 }}
      >
        <div className="p-1 h-full flex flex-col">
          <Title level={5} className="mb-2 text-gray-800 line-clamp-1">{search.title}</Title>
          
          <div className="flex items-center mb-2 text-gray-500 text-xs sm:text-sm">
            <div className="flex-1">
              <Tag color="blue">{search.sportName}</Tag>
            </div>
            
            <div className="ml-auto flex items-center">
              <TeamOutlined className="mr-1" />
              <span>{search.currentParticipants}/{search.maximumParticipants}</span>
            </div>
          </div>
          
          <div className="flex items-start mb-2 text-gray-600">
            <EnvironmentOutlined className="mr-1 sm:mr-2 mt-0.5 flex-shrink-0 text-xs sm:text-sm" />
            <p className="line-clamp-1 text-xs sm:text-sm">{search.location}</p>
          </div>
          
          <Row className="mb-3 text-gray-600">
            <Col span={12}>
              <Space>
                <CalendarOutlined className="text-xs sm:text-sm" />
                <Text className="text-xs sm:text-sm">{formatDate(search.date)}</Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space>
                <ClockCircleOutlined className="text-xs sm:text-sm" />
                <Text className="text-xs sm:text-sm">{search.startTime} - {search.endTime}</Text>
              </Space>
            </Col>
          </Row>
          
          <Divider className="my-2" />
          
          <div className="flex justify-between items-center mt-auto">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/user/playmate/${search.id}`)}
            >
              Xem
            </Button>
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/user/playmate/edit/${search.id}`)}
                ghost
              >
                Sửa
              </Button>
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa bài đăng này không?"
                onConfirm={() => handleDelete(search.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button 
                  type="primary" 
                  size="small" 
                  danger 
                  ghost
                  icon={<DeleteOutlined />} 
                  loading={isProcessing}
                >
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          </div>
        </div>
      </Card>
    );
  };

  // Render a single application card
  const renderApplicationCard = (application: ExtendedPlaymateApplication) => {
    const isProcessing = processingIds.includes(application.id);
    const { search } = application;
    
    return (
      <Card 
        hoverable 
        className="w-full h-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        bodyStyle={{ padding: 16 }}
      >
        <div className="p-1 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <Title level={5} className="m-0 line-clamp-1">{search.title}</Title>
            <Badge
              status={getStatusColor(application.status) as "success" | "error" | "default" | "processing" | "warning"}
              text={getStatusText(application.status)}
            />
          </div>
          
          <div className="flex items-center mb-3">
            <Avatar 
              src={search.creator.avatar} 
              icon={!search.creator.avatar && <UserOutlined />} 
              className="mr-2"
              size="small"
            />
            <Text className="text-xs sm:text-sm">{search.creator.name}</Text>
          </div>
          
          <div className="flex items-start mb-2 text-gray-600">
            <EnvironmentOutlined className="mr-1 sm:mr-2 mt-0.5 flex-shrink-0 text-xs sm:text-sm" />
            <p className="line-clamp-1 text-xs sm:text-sm">{search.location}</p>
          </div>
          
          <Row className="mb-3 text-gray-600">
            <Col span={12}>
              <Space>
                <CalendarOutlined className="text-xs sm:text-sm" />
                <Text className="text-xs sm:text-sm">{formatDate(search.date)}</Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space>
                <ClockCircleOutlined className="text-xs sm:text-sm" />
                <Text className="text-xs sm:text-sm">{search.timeStart} - {search.timeEnd}</Text>
              </Space>
            </Col>
          </Row>
          
          {application.message && (
            <div className="mb-3 bg-gray-50 p-2 rounded text-xs sm:text-sm">
              <Paragraph italic className="m-0 text-gray-500">
                "{application.message}"
              </Paragraph>
            </div>
          )}
          
          <Divider className="my-2" />
          
          <div className="flex justify-between items-center mt-auto">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/user/playmate/${search.id}`)}
            >
              Xem chi tiết
            </Button>
            
            {application.status === 'PENDING' && (
              <Popconfirm
                title="Bạn có chắc chắn muốn hủy đăng ký này không?"
                onConfirm={() => handleCancelApplication(search.id, application.id)}
                okText="Hủy đăng ký"
                cancelText="Không"
              >
                <Button 
                  type="primary" 
                  size="small" 
                  danger 
                  ghost
                  icon={<DeleteOutlined />} 
                  loading={isProcessing}
                >
                  Hủy đăng ký
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full px-4 py-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4 md:mb-6">
          <Breadcrumb.Item>
            <Link to="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/user/playmate">Tìm bạn chơi</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Quản lý</Breadcrumb.Item>
        </Breadcrumb>
      
        {/* Title */}
        <div className="mb-6">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} className="mb-2 text-xl md:text-2xl lg:text-3xl font-bold">Quản lý tìm bạn chơi</Title>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
              >
                Tạo tìm kiếm mới
              </Button>
            </Col>
          </Row>
        </div>
       
        {/* Main content */}
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
        >
          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Bài đăng của tôi
              </span>
            } 
            key="mySearches"
          >
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : mySearches.length === 0 ? (
              <Empty 
                description="Bạn chưa tạo bài đăng tìm bạn chơi nào" 
                className="py-12"
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Tạo bài đăng mới
                </Button>
              </Empty>
            ) : (
              <Row gutter={[16, 16]} className="mt-4">
                {mySearches.map(search => (
                  <Col key={search.id} xs={24} sm={12} lg={8} xl={6}>
                    {renderSearchCard(search)}
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                Đăng ký của tôi
              </span>
            } 
            key="myApplications"
          >
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : myApplications.length === 0 ? (
              <Empty 
                description="Bạn chưa đăng ký tham gia bài đăng tìm bạn chơi nào" 
                className="py-12"
              >
                <Button 
                  type="primary"
                  onClick={() => navigate('/user/playmate')}
                >
                  Tìm bài đăng
                </Button>
              </Empty>
            ) : (
              <Row gutter={[16, 16]} className="mt-4">
                {myApplications.map(application => (
                  <Col key={application.id} xs={24} sm={12} lg={8} xl={6}>
                    {renderApplicationCard(application)}
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default PlaymateManage; 