import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlaymateSearch, 
} from '@/types/playmate.type';
import playmateService from '@/services/playmate.service';
import { getSportNameInVietnamese } from '@/utils/translateSport';
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
  Divider,
  Badge,
  message,
  TabsProps,
  Pagination
} from 'antd';
import {
  PlusOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PlaymateManage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mySearches');
  const [mySearches, setMySearches] = useState<PlaymateSearch[]>([]);
  const [myApplications, setMyApplications] = useState<PlaymateSearch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // 6 items per page (2 rows of 3)

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
        setCurrentPage(1); // Reset to first page when changing tabs
      } else if (tab === 'myApplications') {
        // Fetch user's applications
        const applications = await playmateService.getUserApplications();
        setMyApplications(applications);
        setCurrentPage(1); // Reset to first page when changing tabs
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
      'pending': 'Đang chờ',
      'accepted': 'Đã chấp nhận',
      'rejected': 'Đã từ chối'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    const colorMap: Record<string, string> = {
      'pending': 'warning',
      'accepted': 'success',
      'rejected': 'error'
    };
    return colorMap[statusLower] || 'default';
  };

  // Render a single search card
  const renderSearchCard = (search: PlaymateSearch) => {
    // Count participants with accepted or pending status (không bao gồm người tạo)
    const currentCount = search.participants ? 
      search.participants.filter(p => p.status === 'accepted' || p.status === 'pending').length : 0;
    
    // Count pending applications
    const pendingApplications = search.participants ? 
      search.participants.filter(p => p.status === 'pending').length : 0;
    
    const defaultImage = `https://res.cloudinary.com/db3dx1dos/image/upload/v1746769804/hyfcz9nb8j3d5q4lfpqp.jpg`;
    const coverImage = search.image && search.image.length > 0 ? search.image[0] : defaultImage;
    
    // Check if the playmate date has passed
    const isPastDate = new Date(search.date) < new Date();
    
    // Determine if the playmate has reached maximum participants
    const isFullyBooked = search.maximumParticipants && 
      currentCount >= search.maximumParticipants;
    
    // Overall status determination (open or closed)
    const isOpen = search.status && !isPastDate && !isFullyBooked;
    
    // Get facility information from bookingSlot
    const facilityName = search.bookingSlot?.field?.fieldGroup?.facility?.name || 'Chưa có thông tin';
    const facilityLocation = search.bookingSlot?.field?.fieldGroup?.facility?.location || 'Chưa có địa chỉ';
    const sportName = search.bookingSlot?.booking?.sport?.name || 'Chưa có thông tin';
    
    // Format date and time together
    const formattedDate = formatDate(search.date);
    const formattedTime = `${search.startTime.substring(0, 5)}-${search.endTime.substring(0, 5)}`;
    const dateTimeDisplay = `${formattedDate} (${formattedTime})`;
    
    // Determine participant text based on playmate type
    const participantText = search.playmateSearchType === 'group' ? 'nhóm tham gia' : 'người tham gia';
    
    return (
      <Card
        hoverable
        className="playmate-card h-full shadow-sm hover:shadow-md transition-all"
        onClick={() => handleViewPlaymate(search.id)}
        cover={
          <div className="playmate-card-cover">
            <img 
              alt={search.title} 
              src={coverImage}
              className="object-cover w-full h-full"
            />
            <div className="playmate-card-badge">
              {isOpen ? <Tag color="green">Đang mở</Tag> : <Tag color="red">Đã đóng</Tag>}
              {search.playmateSearchType === 'individual' ? 
                <Tag color="blue">Cá nhân</Tag> : 
                <Tag color="purple">Nhóm</Tag>
              }
            </div>
            {pendingApplications > 0 && (
              <div className="playmate-card-badge-left">
                <Badge count={pendingApplications} overflowCount={99} />
              </div>
            )}
          </div>
        }
      >
        <div className="playmate-card-content">
          <div className="playmate-card-title-container">
            <Card.Meta
              title={<span className="playmate-card-title">{search.title}</span>}              
            />
          </div>
          
          <div className="playmate-card-info">           
            {/* Date and time combined */}
            <div className="playmate-info-item">
              <CalendarOutlined />
              <div className="ml-2">
                <Text type="secondary" className="block text-xs">Thời gian chơi:</Text>
                <Text className="block font-medium" style={{ color: '#1890ff' }}>{dateTimeDisplay}</Text>
              </div>
            </div>
            
            {/* Facility name with title */}
            <div className="playmate-info-item">
              <EnvironmentOutlined />
              <div className="ml-2">
                <Text type="secondary" className="block text-xs">Cơ sở:</Text>
                <Text strong className="block" style={{ color: '#722ed1' }}>{facilityName}</Text>
              </div>
            </div>
            
            {/* Facility location */}
            <div className="playmate-info-item">
              <EnvironmentOutlined />
              <div className="ml-2">
                <Text type="secondary" className="block text-xs">Địa chỉ:</Text>
                <Text className="block">{facilityLocation}</Text>
              </div>
            </div>
            
            {/* Participants with dynamic text */}
            <div className="playmate-info-item">
              <TeamOutlined />
              <div className="ml-2">
                <Text type="secondary" className="block text-xs">
                  {search.playmateSearchType === 'group' ? 'Nhóm đăng ký tham gia:' : 'Người đăng ký tham gia:'}
                </Text>
                <Text className="block" style={{ color: '#fa8c16' }}>
                {`${currentCount}/${search.maximumParticipants} ${participantText}`}
                </Text>
              </div>
            </div>
          </div>

          {/* Sport information with highlight */}
          <div className="playmate-info-item">              
            <div className="ml-2 my-1">                
              <div className="flex items-center">
                <Tag color="blue" className="m-0">{getSportNameInVietnamese(sportName)}</Tag>
              </div>
            </div>
          </div>
          
          {/* Pending applications section */}          
            <div className="pending-applications mt-2 mb-2">
              <Divider className="my-2" />
              <Text strong className="text-sm">Đơn đăng ký đang chờ: <span className="text-red-500 font-bold">{pendingApplications}</span></Text>              
            </div>          
          
          <div className="playmate-card-footer">           
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewPlaymate(search.id);
              }}
              className="ml-2"
            >
              Xem chi tiết
            </Button>
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
    
    const defaultImage = `https://res.cloudinary.com/db3dx1dos/image/upload/v1746769804/hyfcz9nb8j3d5q4lfpqp.jpg`;
    const coverImage = search.image && search.image.length > 0 ? search.image[0] : defaultImage;
    
    // Get facility information from bookingSlot
    const facilityName = search.bookingSlot?.field?.fieldGroup?.facility?.name || 'Chưa có thông tin';
    const facilityLocation = search.bookingSlot?.field?.fieldGroup?.facility?.location || 'Chưa có địa chỉ';
    const sportName = search.bookingSlot?.booking?.sport?.name || 'Chưa có thông tin';
    
    // Format date and time together
    const formattedDate = formatDate(search.date);
    const formattedTime = `${search.startTime.substring(0, 5)}-${search.endTime.substring(0, 5)}`;
    const dateTimeDisplay = `${formattedDate} (${formattedTime})`;
    
    return (
      <Card 
        hoverable 
        className="playmate-card h-full shadow-sm hover:shadow-md transition-all"
        onClick={() => handleViewPlaymate(search.id)}
        cover={
          <div className="playmate-card-cover">
            <img
              alt={search.title}
              src={coverImage}
              className="object-cover w-full h-full"
            />
            <div className="playmate-card-badge">
              <Tag color={getStatusColor(myApplication.status)}>
                {getStatusText(myApplication.status)}
              </Tag>
              {search.playmateSearchType === 'individual' ? 
                <Tag color="blue">Cá nhân</Tag> : 
                <Tag color="purple">Nhóm</Tag>
              }
            </div>
          </div>
        }
      >
        <div className="playmate-card-content">
          <div className="playmate-card-title-container">
            <Card.Meta
              title={<span className="playmate-card-title">{search.title}</span>}              
            />
          </div>
          
          <div className="playmate-card-info">
            {/* Creator info */}
            <div className="playmate-info-item">
              <UserOutlined />
              <div className="ml-2">
                <Text type="secondary" className="block text-xs">Người tạo:</Text>
                <div className="flex items-center">
                  <Avatar 
                    src={search.userInfo?.avatar || search.userInfo?.avatarUrl} 
                    icon={!search.userInfo?.avatar && !search.userInfo?.avatarUrl && <UserOutlined />} 
                    size="small"
                    className="mr-1"
                  />
                  <Text>{search.userInfo?.name || 'Unknown'}</Text>
                </div>
              </div>
            </div>
            
            {/* Date and time combined */}
            <div className="playmate-info-item">
              <CalendarOutlined />
              <div className="ml-2">
                <Text type="secondary" className="block text-xs">Thời gian chơi:</Text>
                <Text className="block font-medium" style={{ color: '#1890ff' }}>{dateTimeDisplay}</Text>
              </div>
            </div>
            
            {/* Facility name with title */}
            <div className="playmate-info-item">
              <EnvironmentOutlined />
              <div className="ml-2">
                <Text type="secondary" className="block text-xs">Cơ sở:</Text>
                <Text strong className="block" style={{ color: '#722ed1' }}>{facilityName}</Text>
              </div>
            </div>
            
            {/* Facility location */}
            <div className="playmate-info-item">
              <EnvironmentOutlined />
              <div className="ml-2">
                <Text type="secondary" className="block text-xs">Địa chỉ:</Text>
                <Text className="block">{facilityLocation}</Text>
              </div>
            </div>
          </div>
          
          {/* Sport information with highlight */}
          <div className="playmate-info-item">              
            <div className="ml-2 my-1">                
              <div className="flex items-center">
                <Tag color="blue" className="m-0">{getSportNameInVietnamese(sportName)}</Tag>
              </div>
            </div>
          </div>
          
          {/* My application note */}
          {myApplication.note && (
            <div className="mt-2 mb-2">
              <Divider className="my-2" />
              <Text strong className="text-xs">Ghi chú của bạn:</Text>
              <div className="bg-gray-50 p-2 rounded mt-1">
                <Text italic className="text-xs text-gray-500">"{myApplication.note}"</Text>
              </div>
            </div>
          )}
          
          <div className="playmate-card-footer">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewPlaymate(search.id);
              }}
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
            <>
              <Row gutter={[16, 24]} className="mt-4">
                {mySearches
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map(search => (
                    <Col key={search.id} xs={24} sm={12} md={8}>
                      {renderSearchCard(search)}
                    </Col>
                  ))}
              </Row>
              
              {mySearches.length > 0 && (
                <div className="flex justify-center my-4">
                  <Pagination
                    current={currentPage}
                    total={mySearches.length}
                    pageSize={pageSize}
                    showSizeChanger
                    pageSizeOptions={['6', '12', '18', '24']}
                    showTotal={(total) => `Tổng cộng ${total} bài đăng`}
                    onChange={(page) => setCurrentPage(page)}
                    onShowSizeChange={(current, size) => {
                      setCurrentPage(1);
                      setPageSize(size);
                    }}
                    className="rounded-md shadow-sm px-4 py-2"
                  />
                </div>
              )}
            </>
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
            <>
              <Row gutter={[16, 24]} className="mt-4">
                {myApplications
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map(search => (
                    <Col key={search.id} xs={24} sm={12} md={8}>
                      {renderApplicationCard(search)}
                    </Col>
                  ))}
              </Row>
              
              {myApplications.length > 0 && (
                <div className="flex justify-center my-4">
                  <Pagination
                    current={currentPage}
                    total={myApplications.length}
                    pageSize={pageSize}
                    showSizeChanger
                    pageSizeOptions={['6', '12', '18', '24']}
                    showTotal={(total) => `Tổng cộng ${total} đăng ký`}
                    onChange={(page) => setCurrentPage(page)}
                    onShowSizeChange={(current, size) => {
                      setCurrentPage(1);
                      setPageSize(size);
                    }}
                    className="rounded-md shadow-sm px-4 py-2"
                  />
                </div>
              )}
            </>
          )}
        </>
      )
    }
  ];

  // Breadcrumb items configuration
  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>
    },
    {
      title: <Link to="/user/playmate">Tìm bạn chơi</Link>
    },
    {
      title: 'Quản lý'
    }
  ];

  return (
    <div className="w-full px-4 py-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4 md:mb-6" items={breadcrumbItems} />
      
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
                Tạo bài đăng
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
      
      <style>
        {`
          .playmate-card {
            height: 100%;
            transition: all 0.3s;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
            display: flex;
            flex-direction: column;
            cursor: pointer;
          }
          
          .playmate-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-5px);
          }
          
          .playmate-card-cover {
            position: relative;
            height: 200px;
            overflow: hidden;
          }
          
          .playmate-card-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .playmate-card-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .playmate-card-badge-left {
            position: absolute;
            top: 10px;
            left: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .playmate-card-content {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 0 8px;
          }
          
          .playmate-card-title-container {
            min-height: 20px;            
          }
          
          .playmate-card-title {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 20px;
          }
          
          .playmate-card-info {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin: 8px 0;
            flex-grow: 1;
          }
          
          .playmate-info-item {
            display: flex;
            align-items: flex-start;
            color: rgba(0, 0, 0, 0.65);
            font-size: 13px;
            line-height: 1.5;
          }
          
          .playmate-info-item .anticon {
            margin-top: 3px;
            min-width: 14px;
          }
          
          .playmate-card-footer {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            margin-top: auto;
            flex-wrap: wrap;
            min-height: 40px;
            padding-top: 8px;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
          }
          
          .pending-applications {
            font-size: 12px;
            max-height: 150px;
            overflow-y: auto;
          }
          
          .ml-2 {
            margin-left: 8px;
          }
        `}
      </style>
    </div>
  );
};

export default PlaymateManage; 