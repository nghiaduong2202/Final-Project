import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlaymateSearch, 
  PlaymateActionRequest 
} from '@/types/playmate.type';
import playmateService from '@/services/playmate.service';
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
  message,
  TabsProps
} from 'antd';
import {
  PlusOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const PlaymateManage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mySearches');
  const [mySearches, setMySearches] = useState<PlaymateSearch[]>([]);
  const [myApplications, setMyApplications] = useState<PlaymateSearch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    // Fetch data based on active tab
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab: string) => {
    try {
      setLoading(true);
      
      if (tab === 'mySearches') {
        // Fetch user's created playmate searches
        const searches = await playmateService.getUserPlaymateSearches();
        setMySearches(searches);
      } else if (tab === 'myApplications') {
        // Fetch user's applications
        const applications = await playmateService.getUserApplications();
        setMyApplications(applications);
      }
    } catch (fetchError) {
      console.error('Error fetching data:', fetchError);
      message.error('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleCreate = () => {
    navigate('/user/playmate/create');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleViewPlaymate = (playmateId: string) => {
    navigate(`/user/playmate/${playmateId}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleManagePlaymate = (playmateId: string) => {
    // This would navigate to a detailed management page
    message.info('Chức năng đang được phát triển');
  };

  const handleAcceptApplication = async (playerId: string, playmateId: string) => {
    const idKey = `${playerId}-${playmateId}`;
    setProcessingIds(prev => [...prev, idKey]);
    try {
      const actionRequest: PlaymateActionRequest = {
        playerId,
        playmateId
      };
      
      const success = await playmateService.acceptApplication(actionRequest);
      if (success) {
        message.success('Đã chấp nhận đơn đăng ký!');
        // Refresh the data
        fetchData('mySearches');
      }
    } catch (err) {
      console.error('Error accepting application:', err);
      message.error('Có lỗi xảy ra khi chấp nhận đơn đăng ký.');
    } finally {
      setProcessingIds(prev => prev.filter(item => item !== idKey));
    }
  };

  const handleRejectApplication = async (playerId: string, playmateId: string) => {
    const idKey = `${playerId}-${playmateId}`;
    setProcessingIds(prev => [...prev, idKey]);
    try {
      const actionRequest: PlaymateActionRequest = {
        playerId,
        playmateId
      };
      
      const success = await playmateService.rejectApplication(actionRequest);
      if (success) {
        message.success('Đã từ chối đơn đăng ký!');
        // Refresh the data
        fetchData('mySearches');
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
      message.error('Có lỗi xảy ra khi từ chối đơn đăng ký.');
    } finally {
      setProcessingIds(prev => prev.filter(item => item !== idKey));
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Đang tìm kiếm',
      'COMPLETED': 'Đã tìm đủ',
      'CANCELLED': 'Đã hủy',
      'EXPIRED': 'Đã hết hạn',
      'PENDING': 'Đang chờ',
      'ACCEPTED': 'Đã chấp nhận',
      'REJECTED': 'Đã từ chối',
      'active': 'Đang tìm kiếm',
      'completed': 'Đã tìm đủ',
      'cancelled': 'Đã hủy',
      'expired': 'Đã hết hạn',
      'pending': 'Đang chờ',
      'accepted': 'Đã chấp nhận',
      'rejected': 'Đã từ chối'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    const colorMap: Record<string, string> = {
      'active': 'success',
      'completed': 'processing',
      'cancelled': 'error',
      'expired': 'default',
      'pending': 'warning',
      'accepted': 'success',
      'rejected': 'error'
    };
    return colorMap[statusLower] || 'default';
  };

  // Render a single search card
  const renderSearchCard = (search: PlaymateSearch) => {
    // Count accepted participants
    const acceptedParticipants = search.participants ? 
      search.participants.filter(p => p.status === 'accepted' || p.status === 'ACCEPTED').length : 0;
    
    // Count current participants (creator + accepted participants)
    const currentCount = 1 + acceptedParticipants; // +1 for the creator
    
    // Count pending applications
    const pendingApplications = search.participants ? 
      search.participants.filter(p => p.status === 'pending' || p.status === 'PENDING').length : 0;
    
    const defaultImage = `https://via.placeholder.com/400x200?text=${encodeURIComponent(search.title)}`;
    const coverImage = search.image && search.image.length > 0 ? search.image[0] : defaultImage;
    
    return (
      <Card
        hoverable
        className="w-full h-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        cover={
          <div className="h-40 sm:h-48 overflow-hidden relative">
            <img
              alt={search.title}
              src={coverImage}
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
            {pendingApplications > 0 && (
              <Badge
                className="absolute top-3 left-3"
                count={pendingApplications}
                overflowCount={99}
              />
            )}
          </div>
        }
        style={{ padding: 16 }}
      >
        <div className="p-1 h-full flex flex-col">
          <Title level={5} className="mb-2 text-gray-800 line-clamp-1">{search.title}</Title>
          
          <div className="flex items-center mb-2 text-gray-500 text-xs sm:text-sm">
            <div className="flex-1">
              <Tag color={search.playmateSearchType === 'INDIVIDUAL' ? 'blue' : 'purple'}>
                {search.playmateSearchType === 'INDIVIDUAL' ? 'Cá nhân' : 'Nhóm'}
              </Tag>
            </div>
            
            <div className="ml-auto flex items-center">
              <TeamOutlined className="mr-1" />
              <span>{`${currentCount}/${search.requiredParticipants}`}</span>
              {search.maximumParticipants && <span>/{search.maximumParticipants}</span>}
            </div>
          </div>
          
          <div className="flex items-start mb-2 text-gray-600">
            <EnvironmentOutlined className="mr-1 sm:mr-2 mt-0.5 flex-shrink-0 text-xs sm:text-sm" />
            <p className="line-clamp-1 text-xs sm:text-sm">{search.location || 'Không có địa điểm'}</p>
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
          
          {/* Display participants */}
          {search.participants && search.participants.length > 0 && (
            <>
              <Divider className="my-2" />
              <div className="mb-3">
                <Text className="text-xs font-medium">Người đăng ký ({search.participants.length}):</Text>
                <div className="mt-1">
                  {search.participants.map((participant) => (
                    <div key={`${participant.playerId}-${search.id}`} className="flex justify-between items-center mt-1 p-1 rounded bg-gray-50">
                      <div className="flex items-center">
                        <Tag color={getStatusColor(participant.status)}>
                          {getStatusText(participant.status)}
                        </Tag>
                        <Text className="text-xs ml-1">{participant.playerId}</Text>
                      </div>
                      
                      {participant.status === 'pending' && (
                        <Space size="small">
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<CheckCircleOutlined className="text-green-500" />} 
                            onClick={() => handleAcceptApplication(participant.playerId, search.id)}
                            loading={processingIds.includes(`${participant.playerId}-${search.id}`)}
                          />
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<CloseCircleOutlined className="text-red-500" />} 
                            onClick={() => handleRejectApplication(participant.playerId, search.id)}
                            loading={processingIds.includes(`${participant.playerId}-${search.id}`)}
                          />
                        </Space>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <Divider className="my-2" />
          
          <div className="flex justify-between items-center mt-auto">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewPlaymate(search.id)}
            >
              Xem
            </Button>
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleManagePlaymate(search.id)}
                ghost
              >
                Quản lý
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    );
  };

  // Render a single application card
  const renderApplicationCard = (search: PlaymateSearch) => {
    // Find the current user's application in the participants list
    const userId = localStorage.getItem('userId') || '';
    const myApplication = search.participants?.find(
      p => p.playerId === userId
    );
    
    if (!myApplication) {
      return null; // Should not happen but just in case
    }
    
    const defaultImage = `https://via.placeholder.com/400x200?text=${encodeURIComponent(search.title)}`;
    const coverImage = search.image && search.image.length > 0 ? search.image[0] : defaultImage;
    
    return (
      <Card 
        hoverable 
        className="w-full h-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        cover={
          <div className="h-40 sm:h-48 overflow-hidden relative">
            <img
              alt={search.title}
              src={coverImage}
              className="w-full h-full object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
            <Badge
              className="absolute top-3 right-3"
              status={getStatusColor(myApplication.status) as "success" | "error" | "default" | "processing" | "warning"}
              text={
                <span className="bg-white px-2 py-1 rounded text-xs">{getStatusText(myApplication.status)}</span>
              }
            />
          </div>
        }
        bodyStyle={{ padding: 16 }}
      >
        <div className="p-1 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <Title level={5} className="m-0 line-clamp-1">{search.title}</Title>
          </div>
          
          <div className="flex items-center mb-3">
            <Avatar 
              src={search.userInfo?.avatar || search.userInfo?.avatarUrl} 
              icon={!search.userInfo?.avatar && !search.userInfo?.avatarUrl && <UserOutlined />} 
              className="mr-2"
              size="small"
            />
            <Text className="text-xs sm:text-sm">{search.userInfo?.name || 'Unknown'}</Text>
          </div>
          
          <div className="flex items-start mb-2 text-gray-600">
            <EnvironmentOutlined className="mr-1 sm:mr-2 mt-0.5 flex-shrink-0 text-xs sm:text-sm" />
            <p className="line-clamp-1 text-xs sm:text-sm">{search.location || 'Không có địa điểm'}</p>
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
          
          {myApplication.note && (
            <div className="mb-3 bg-gray-50 p-2 rounded text-xs sm:text-sm">
              <Paragraph italic className="m-0 text-gray-500">
                "{myApplication.note}"
              </Paragraph>
            </div>
          )}
          
          <Divider className="my-2" />
          
          <div className="flex justify-between items-center mt-auto">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewPlaymate(search.id)}
            >
              Xem chi tiết
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const items: TabsProps['items'] = [
    {
      key: 'mySearches',
      label: (
        <span>
          <TeamOutlined />
          Bài đăng của tôi
        </span>
      ),
      children: (
        <>
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
        </>
      )
    },
    {
      key: 'myApplications',
      label: (
        <span>
          <UserOutlined />
          Đăng ký của tôi
        </span>
      ),
      children: (
        <>
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
              {myApplications.map(search => (
                <Col key={search.id} xs={24} sm={12} lg={8} xl={6}>
                  {renderApplicationCard(search)}
                </Col>
              ))}
            </Row>
          )}
        </>
      )
    }
  ];

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
          items={items}
        />
      </div>
    </div>
  );
};

export default PlaymateManage; 