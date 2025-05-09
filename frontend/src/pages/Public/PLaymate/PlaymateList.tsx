import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlaymateSearch, 
  PlaymateSearchType, 
  SkillLevel, 
  CostType 
} from '@/types/playmate.type';
import { Sport } from '@/types/sport.type';
import playmateService from '@/services/playmate.service';
import { sportService } from '@/services/sport.service';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Divider,
  Breadcrumb,
  Empty,
  Spin,
  Avatar,
  message,
  Pagination,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
  MoneyCollectOutlined,
  SearchOutlined,
  ProfileOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const PlaymateList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [playmateSearches, setPlaymateSearches] = useState<PlaymateSearch[]>([]);
  const [filteredSearches, setFilteredSearches] = useState<PlaymateSearch[]>([]);
  const [sportsList, setSportsList] = useState<Sport[]>([]);
  const user = useSelector((state: RootState) => state.user.user);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | ''>('');
  const [selectedSearchType, setSelectedSearchType] = useState<PlaymateSearchType | ''>('');
  const [selectedSport, setSelectedSport] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch playmate searches
        const searches = await playmateService.getAllPlaymateSearches();
        
        // Không lọc bỏ bài đăng của người dùng hiện tại nữa
        // const filteredSearches = searches.filter(search => search.userId !== user?.id);

        setPlaymateSearches(searches);
        setFilteredSearches(searches);
        
        // Fetch sports list
        const sports = await sportService.getSport();
        setSportsList(sports);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Apply filters whenever any filter changes
  useEffect(() => {
    let result = [...playmateSearches];

    // Filter by status tab
    if (activeTab !== 'all') {
      const isActive = activeTab === 'active';
      
      // Xác định trạng thái mở/đóng dựa trên các điều kiện như trong renderPlaymateCard
      result = result.filter(search => {
        // Tính toán các điều kiện cho từng bài đăng - không bao gồm người tạo
        const currentCount = search.participants ? 
          search.participants.filter(p => p.status === 'accepted' || p.status === 'pending').length : 0;
        
        // Xác định bài đăng đã đủ người hay chưa
        const isFullyBooked = search.maximumParticipants && 
          currentCount >= search.maximumParticipants;
        
        // Xác định bài đăng đã quá hạn hay chưa
        const isPastDate = new Date(search.date) < new Date();
        
        // Xác định bài đăng còn mở hay đã đóng
        const isOpen = search.status && !isPastDate && !isFullyBooked;
        
        // Lọc theo tab đã chọn
        return isOpen === isActive;
      });
    }

    // Filter by search term (title, description, location)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        search => 
          search.title.toLowerCase().includes(term) || 
          (search.description && search.description.toLowerCase().includes(term)) ||
          (search.location && search.location.toLowerCase().includes(term))
      );
    }

    if (selectedSkillLevel) {
      result = result.filter(search => {
        if (selectedSkillLevel === 'any') return true;
        return search.requiredSkillLevel === selectedSkillLevel;
      });
    }

    if (selectedSearchType) {
      result = result.filter(search => search.playmateSearchType === selectedSearchType);
    }
    
    // Filter by sport
    if (selectedSport) {
      result = result.filter(search => {
        return search.bookingSlot?.booking?.sport?.id === selectedSport;
      });
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredSearches(result);
    setCurrentPage(1);
  }, [playmateSearches, searchTerm, selectedSkillLevel, selectedSearchType, selectedSport, activeTab]);

  const handleCreatePlaymate = () => {
    navigate('/user/playmate/create');
  };
  
  const handleManagePlaymates = () => {
    navigate('/user/playmate/manage');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSkillLevelFilter = (value: SkillLevel | '') => {
    setSelectedSkillLevel(value);
  };

  const handleSearchTypeFilter = (value: PlaymateSearchType | '') => {
    setSelectedSearchType(value);
  };
  
  const handleSportFilter = (value: number | '') => {
    setSelectedSport(value);
  };

  const handleViewPlaymate = (id: string) => {
    navigate(`/user/playmate/${id}`);
  };
  
  const getCostTypeDisplay = (costType?: CostType, price?: number, costMale?: number, costFemale?: number) => {
    if (!costType || costType === 'free') return <Tag color="success">Miễn phí</Tag>;
    
       
    if ((costType === 'total') && price) {
      return <Text>Tổng chi phí: {price.toLocaleString('vi-VN')}đ</Text>;
    }
    
    if (costType === 'gender') {
      return (
        <Space direction="horizontal" size={12}>
          {costMale && <Text>Nam: {costMale.toLocaleString('vi-VN')}đ</Text>}
          {costFemale && <Text>Nữ: {costFemale.toLocaleString('vi-VN')}đ</Text>}
        </Space>
      );
    }
    
    return null;
  };

  const formatDate = (date: string) => {
    const formattedDate = new Date(date).toLocaleDateString('vi-VN');
    return formattedDate;
  };

  const getStatusTag = (isActive: boolean) => {
    return isActive ? 
      <Tag color="green">Đang mở</Tag> : 
      <Tag color="red">Đã đóng</Tag>;
  };

  const getTypeTag = (type?: PlaymateSearchType) => {
    if (!type) return null;
    
    switch (type) {
      case 'individual':
        return <Tag color="blue">Cá nhân</Tag>;
      case 'group':
        return <Tag color="purple">Nhóm</Tag>;
      default:
        return <Tag color="default">Khác</Tag>;
    }
  };

  // Calculate paginated data
  const paginatedSearches = filteredSearches.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderPlaymateCard = (search: PlaymateSearch) => {
    const defaultImage = `https://res.cloudinary.com/db3dx1dos/image/upload/v1746769804/hyfcz9nb8j3d5q4lfpqp.jpg`;
    const coverImage = search.image && search.image.length > 0 ? search.image[0] : defaultImage;
    
    // Kiểm tra xem đây có phải là bài đăng của người dùng hiện tại không
    const isUserPost = user?.id === search.userId;
    
    // Sử dụng currentParticipants đã được tính toán trong mapApiToPlaymateSearch
    // Nếu không có, tính toán từ mảng participants (không bao gồm người tạo)
    let currentCount = search.currentParticipants;
    
    if (currentCount === undefined) {
      // Tính số người tham gia có trạng thái 'accepted' HOẶC 'pending'
      currentCount = search.participants ? 
        search.participants.filter(p => p.status === 'accepted' || p.status === 'pending').length : 0;
    }
    
    console.log('Playmate ID:', search.id, 'currentParticipants:', search.currentParticipants, 
      'participants length:', search.participants?.length || 0,
      'accepted+pending:', search.participants?.filter(p => p.status === 'accepted' || p.status === 'pending').length || 0);
    
    // Determine if the playmate has reached maximum participants
    const isFullyBooked = search.maximumParticipants && 
      currentCount >= search.maximumParticipants;
    
    // Check if the playmate date has passed
    const isPastDate = new Date(search.date) < new Date();
    
    // Overall status determination (open or closed)
    const isOpen = search.status && !isPastDate && !isFullyBooked;

    // Get facility information from bookingSlot
    const facilityName = search.bookingSlot?.field?.fieldGroup?.facility?.name || 'Chưa có thông tin';
    const facilityLocation = search.bookingSlot?.field?.fieldGroup?.facility?.location || 'Chưa có địa chỉ';
    const sportName = search.bookingSlot?.booking?.sport?.name 
      ? getSportNameInVietnamese(search.bookingSlot.booking.sport.name) 
      : 'Chưa có thông tin';

    // Format date and time together
    const formattedDate = formatDate(search.date);
    const formattedTime = `${search.startTime.substring(0, 5)}-${search.endTime.substring(0, 5)}`;
    const dateTimeDisplay = `${formattedDate} (${formattedTime})`;

    // Determine participant text based on playmate type
    const participantText = search.playmateSearchType === 'group' ? 'nhóm tham gia' : 'người tham gia';

    return (
      <Card
        hoverable
        className={`playmate-card h-full shadow-sm hover:shadow-md transition-all ${isUserPost ? 'my-playmate-card' : ''}`}
        onClick={() => handleViewPlaymate(search.id)}
        cover={
          <div className="playmate-card-cover">
            <img 
              alt={search.title} 
              src={coverImage}
              className="object-cover w-full h-full"
            />
            <div className="playmate-card-badge">
              {isUserPost && <Tag color="gold">Bài đăng của bạn</Tag>}
              {getStatusTag(isOpen)}
              {getTypeTag(search.playmateSearchType)}
            </div>
          </div>
        }
      >
        <div className="playmate-card-content">
          <div className="playmate-card-org">
            <Avatar src={search.userInfo.avatar || search.userInfo.avatarUrl} icon={<UserOutlined />} size="small" />
            <Text type="secondary" className="text-sm truncate">
              {search.userInfo.name} {isUserPost && <span className="text-gold">(Bạn)</span>}
            </Text>
          </div>
          
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
              <CalendarOutlined />
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
                <Text type="secondary" className="block text-xs">{search.playmateSearchType === 'group' ? 'Nhóm đăng ký tham gia:' : 'Người đăng ký tham gia:'}</Text>
                <Text className="block" style={{ color: '#fa8c16' }}>
                  {`${currentCount}/${search.maximumParticipants} ${participantText}`}
                </Text>
              </div>
            </div>
            
            {/* Cost information */}
            <div className="playmate-info-item">
              <MoneyCollectOutlined />
              <div className="ml-2">
                <Text type="secondary" className="block text-xs">Chi phí:</Text>
                <span className="block" style={{ color: '#52c41a' }}>
                  {getCostTypeDisplay(search.costType, search.price, search.costMale, search.costFemale)}
                </span>
              </div>
            </div>
          </div>

           {/* Sport information with highlight */}
           <div className="playmate-info-item">              
              <div className="ml-2 my-1">                
                <div className="flex items-center">
                  <Tag color="blue" className="m-0">{sportName}</Tag>
                </div>
              </div>
            </div>
          
          <div className="playmate-card-footer">
            {isUserPost ? (
              <Button 
                type="primary"
                size="small"
                className="playmate-join-button ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/user/playmate/${search.id}`);
                }}
              >
                Quản lý
              </Button>
            ) : (
              <Button 
                type="primary"
                size="small"
                className="playmate-join-button ml-auto"
                disabled={!isOpen}
              >
                {!search.status ? 'Đã đóng' : 
                 isPastDate ? 'Đã hết hạn' :
                 isFullyBooked ? 'Đã đủ người' : 'Đăng ký'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full px-4 py-6 public-playmate-list bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Title */}
        <Breadcrumb className="mb-4"
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: 'Tìm bạn chơi' }
          ]}
        />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
          <div>
            <Title level={2} className="m-0 text-xl md:text-2xl lg:text-3xl">
              Tìm bạn chơi
            </Title>
            <Text type="secondary">
              Tìm kiếm bạn chơi thể thao cùng sở thích
            </Text>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button 
              icon={<ProfileOutlined />} 
              onClick={handleManagePlaymates}
              size="large"
            >
              Quản lý bài đăng
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreatePlaymate}
              size="large"
            >
              Tạo bài đăng
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <Card className="mb-4 md:mb-6 filter-card shadow-sm">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <Tabs 
              activeKey={activeTab} 
              onChange={tab => setActiveTab(tab as 'all' | 'active' | 'inactive')}
              className="playmate-tabs"
              items={[
                {
                  key: 'all',
                  label: <span>Tất cả bài đăng</span>,
                },
                {
                  key: 'active',
                  label: <span>Đang mở</span>,
                },
                {
                  key: 'inactive',
                  label: <span>Đã đóng</span>,
                }
              ]}
            />
            
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <Input 
                placeholder="Tìm kiếm bài đăng..." 
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                style={{ maxWidth: 300, width: '100%' }}
              />
            </div>
          </div>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8} lg={6}>
              <Select
                placeholder="Môn thể thao"
                style={{ width: '100%' }}
                onChange={handleSportFilter}
                allowClear
                value={selectedSport}
              >
                <Option value="">Tất cả môn thể thao</Option>
                {sportsList.map(sport => (
                  <Option key={sport.id} value={sport.id}>
                    {getSportNameInVietnamese(sport.name)}
                  </Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} md={8} lg={6}>
              <Select
                placeholder="Trình độ"
                style={{ width: '100%' }}
                onChange={handleSkillLevelFilter}
                allowClear
                value={selectedSkillLevel}
              >
                <Option value="">Tất cả trình độ</Option>
                <Option value="newbie">Mới bắt đầu</Option>
                <Option value="intermediate">Trung cấp</Option>
                <Option value="advance">Nâng cao</Option>
                <Option value="professional">Chuyên nghiệp</Option>
                <Option value="any">Mọi trình độ</Option>
              </Select>
            </Col>
            
            <Col xs={24} md={8} lg={6}>
              <Select
                placeholder="Loại tìm kiếm"
                style={{ width: '100%' }}
                onChange={handleSearchTypeFilter}
                allowClear
                value={selectedSearchType}
              >
                <Option value="">Tất cả loại tìm kiếm</Option>
                <Option value="individual">Cá nhân</Option>
                <Option value="group">Nhóm</Option>
              </Select>
            </Col>
          </Row>
        </Card>
        
        {/* Search results */}
        {loading ? (
          <div className="text-center py-12 spin-container">
            <Spin size="large" />
            <div className="mt-3">Đang tải danh sách bài đăng...</div>
          </div>
        ) : filteredSearches.length > 0 ? (
          <div className="playmate-list-container">
            <Row gutter={[16, 24]}>
              {paginatedSearches.map(search => (
                <Col key={search.id} xs={24} sm={12} md={8}>
                  {renderPlaymateCard(search)}
                </Col>
              ))}
            </Row>
            
            {filteredSearches.length > 0 && (
              <div className="flex justify-center my-4">
                <Pagination
                  current={currentPage}
                  total={filteredSearches.length}
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
          </div>
        ) : (
          <Empty
            description="Không tìm thấy bài đăng nào phù hợp"
            className="py-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
      
      <style>
        {`
          .public-playmate-list {
            min-height: calc(100vh - 64px);
          }
          
          .filter-card {
            border-radius: 8px;
          }
          
          .spin-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 300px;
          }
          
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
          
          .my-playmate-card {
            border: 2px solid #faad14;
          }
          
          .text-gold {
            color: #faad14;
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
          
          .playmate-card-content {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 0 8px;
          }
          
          .playmate-card-org {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            height: 24px;
            overflow: hidden;
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
          
          .playmate-card-desc {
            color: rgba(0, 0, 0, 0.65);
            height: 40px;
            overflow: hidden;
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
          
          .playmate-info-item .anticon,
          .playmate-info-item i {
            margin-top: 3px;
            min-width: 14px;
          }
          
          .playmate-card-footer {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            margin-top: auto;
            flex-wrap: wrap;
            min-height: 36px;
            padding-top: 8px;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
          }
          
          .playmate-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
          
          .playmate-tag {
            margin: 0;
          }
          
          .playmate-join-button {
            margin-top: 8px;
          }
          
          .playmate-tabs {
            margin-bottom: 0 !important;
          }
          
          .playmate-list-container {
            min-height: 400px;
          }
          
          .pagination-container {
            display: flex;
            justify-content: center;
            margin-top: 24px;
            margin-bottom: 24px;
          }
          
          .truncate {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
          
          .ml-2 {
            margin-left: 8px;
          }
          
          .my-8 {
            margin-top: 32px;
            margin-bottom: 32px;
          }
          
          @media (max-width: 768px) {
            .playmate-card-cover {
              height: 200px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PlaymateList;