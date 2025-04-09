import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, Typography, Row, Col, Tag, Button, Space, Select,
  Input, Empty, Pagination, Tabs, Badge, Avatar
} from 'antd';
import { 
  SearchOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined,
  TrophyOutlined, ArrowRightOutlined, ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Định nghĩa kiểu dữ liệu cho sự kiện
interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'tournament' | 'friendly' | 'training';
  sportType: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationEndDate: string;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  organizer: {
    id: string;
    name: string;
    logo: string;
  };
  prizes: {
    first: number;
    second: number;
    third: number;
  } | null;
  coverImage: string;
  tags: string[];
}

// Dữ liệu mẫu cho sự kiện
const mockEvents: Event[] = [
  {
    id: 'evt-001',
    title: 'Giải Bóng Đá Mini Mở Rộng 2023',
    description: 'Giải đấu bóng đá mini dành cho mọi đội bóng nghiệp dư tại khu vực TP.HCM. Đây là cơ hội tuyệt vời để thể hiện tài năng và gặp gỡ những đội bóng mạnh.',
    location: 'Sân vận động Thống Nhất, Quận 10, TP.HCM',
    type: 'tournament',
    sportType: 'Bóng đá',
    startDate: '2023-12-20T08:00:00Z',
    endDate: '2023-12-25T18:00:00Z',
    status: 'upcoming',
    registrationEndDate: '2023-12-15T23:59:59Z',
    maxParticipants: 16,
    currentParticipants: 12,
    entryFee: 2000000,
    organizer: {
      id: 'org-001',
      name: 'CLB Thể Thao Năng Động',
      logo: 'https://via.placeholder.com/150?text=Active+Sports+Club'
    },
    prizes: {
      first: 15000000,
      second: 7000000,
      third: 3000000
    },
    coverImage: 'https://via.placeholder.com/600x300?text=Football+Tournament',
    tags: ['Giải đấu', 'Bóng đá', 'Phong trào']
  },
  {
    id: 'evt-002',
    title: 'Giải Cầu Lông Sinh Viên 2023',
    description: 'Giải cầu lông dành cho sinh viên các trường đại học, cao đẳng trên địa bàn TP.HCM. Nhiều phần quà hấp dẫn và cơ hội giao lưu thể thao.',
    location: 'Nhà thi đấu Phú Thọ, Quận 11, TP.HCM',
    type: 'tournament',
    sportType: 'Cầu lông',
    startDate: '2023-12-18T09:00:00Z',
    endDate: '2023-12-20T17:00:00Z',
    status: 'upcoming',
    registrationEndDate: '2023-12-10T23:59:59Z',
    maxParticipants: 64,
    currentParticipants: 42,
    entryFee: 100000,
    organizer: {
      id: 'org-002',
      name: 'Hội Sinh viên TP.HCM',
      logo: 'https://via.placeholder.com/150?text=Student+Union'
    },
    prizes: {
      first: 5000000,
      second: 3000000,
      third: 1000000
    },
    coverImage: 'https://via.placeholder.com/600x300?text=Badminton+Tournament',
    tags: ['Giải đấu', 'Cầu lông', 'Sinh viên']
  },
  {
    id: 'evt-003',
    title: 'Giao lưu Bóng rổ Phong trào',
    description: 'Sự kiện giao lưu bóng rổ không chuyên, dành cho mọi người yêu thích bóng rổ. Không giới hạn độ tuổi và trình độ.',
    location: 'Sân bóng rổ Đại học TDTT, Quận 3, TP.HCM',
    type: 'friendly',
    sportType: 'Bóng rổ',
    startDate: '2023-12-16T14:00:00Z',
    endDate: '2023-12-16T21:00:00Z',
    status: 'upcoming',
    registrationEndDate: '2023-12-15T12:00:00Z',
    maxParticipants: 30,
    currentParticipants: 18,
    entryFee: 50000,
    organizer: {
      id: 'org-003',
      name: 'CLB Bóng rổ Phong trào TP.HCM',
      logo: 'https://via.placeholder.com/150?text=Basketball+Club'
    },
    prizes: null,
    coverImage: 'https://via.placeholder.com/600x300?text=Basketball+Event',
    tags: ['Giao lưu', 'Bóng rổ', 'Phong trào']
  },
  {
    id: 'evt-004',
    title: 'Khóa Huấn luyện Tennis Cơ bản',
    description: 'Khóa học tennis cơ bản dành cho người mới bắt đầu. Được hướng dẫn bởi các HLV chuyên nghiệp với kinh nghiệm lâu năm.',
    location: 'Sân Tennis Kỳ Hòa, Quận 10, TP.HCM',
    type: 'training',
    sportType: 'Tennis',
    startDate: '2023-12-11T08:00:00Z',
    endDate: '2023-12-15T11:00:00Z',
    status: 'upcoming',
    registrationEndDate: '2023-12-09T23:59:59Z',
    maxParticipants: 20,
    currentParticipants: 15,
    entryFee: 1500000,
    organizer: {
      id: 'org-004',
      name: 'Tennis Pro Academy',
      logo: 'https://via.placeholder.com/150?text=Tennis+Academy'
    },
    prizes: null,
    coverImage: 'https://via.placeholder.com/600x300?text=Tennis+Training',
    tags: ['Đào tạo', 'Tennis', 'Cơ bản']
  },
  {
    id: 'evt-005',
    title: 'Giải Bơi Lội Thiếu Niên TP.HCM',
    description: 'Giải bơi dành cho các em thiếu niên từ 8-15 tuổi. Nhiều nội dung thi đấu phù hợp với từng độ tuổi và trình độ.',
    location: 'Hồ bơi Phú Thọ, Quận 11, TP.HCM',
    type: 'tournament',
    sportType: 'Bơi lội',
    startDate: '2023-12-23T08:00:00Z',
    endDate: '2023-12-24T17:00:00Z',
    status: 'upcoming',
    registrationEndDate: '2023-12-18T23:59:59Z',
    maxParticipants: 100,
    currentParticipants: 75,
    entryFee: 200000,
    organizer: {
      id: 'org-005',
      name: 'Sở Văn hóa và Thể thao TP.HCM',
      logo: 'https://via.placeholder.com/150?text=Sports+Department'
    },
    prizes: {
      first: 3000000,
      second: 2000000,
      third: 1000000
    },
    coverImage: 'https://via.placeholder.com/600x300?text=Swimming+Competition',
    tags: ['Giải đấu', 'Bơi lội', 'Thiếu niên']
  },
  {
    id: 'evt-006',
    title: 'Đại hội Thể dục Thể thao Sinh viên',
    description: 'Đại hội thể thao với nhiều môn thi đấu dành cho sinh viên các trường đại học, cao đẳng trên địa bàn thành phố.',
    location: 'Khu Liên hợp Thể thao Rạch Miễu, Quận Phú Nhuận, TP.HCM',
    type: 'tournament',
    sportType: 'Đa môn',
    startDate: '2024-01-05T08:00:00Z',
    endDate: '2024-01-10T17:00:00Z',
    status: 'upcoming',
    registrationEndDate: '2023-12-25T23:59:59Z',
    maxParticipants: 500,
    currentParticipants: 350,
    entryFee: 0,
    organizer: {
      id: 'org-006',
      name: 'Đoàn Thanh niên TP.HCM',
      logo: 'https://via.placeholder.com/150?text=Youth+Union'
    },
    prizes: {
      first: 10000000,
      second: 7000000,
      third: 5000000
    },
    coverImage: 'https://via.placeholder.com/600x300?text=Sports+Festival',
    tags: ['Đại hội', 'Đa môn', 'Sinh viên']
  }
];

const EventList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Simulating API call to fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setEvents(mockEvents);
        setFilteredEvents(mockEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle filter changes
  useEffect(() => {
    let result = [...events];

    // Filter by status
    if (activeTab !== 'all') {
      result = result.filter(event => event.status === activeTab);
    }

    // Filter by search text
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      result = result.filter(
        event =>
          event.title.toLowerCase().includes(lowerCaseSearch) ||
          event.description.toLowerCase().includes(lowerCaseSearch) ||
          event.location.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Filter by sport type
    if (sportFilter !== 'all') {
      result = result.filter(event => event.sportType === sportFilter);
    }

    // Filter by event type
    if (typeFilter !== 'all') {
      result = result.filter(event => event.type === typeFilter);
    }

    setFilteredEvents(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [events, activeTab, searchText, sportFilter, typeFilter]);

  // Generate unique sport types for filter
  const sportTypes = ['all', ...Array.from(new Set(events.map(event => event.sportType)))];

  // Handle view event details
  const handleViewEvent = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  // Handle register for event
  const handleRegister = (eventId: string) => {
    // In a real app, this would navigate to a registration form or login prompt
    alert(`Đăng ký tham gia sự kiện ${eventId}`);
  };

  // Render event status tag
  const renderEventStatus = (status: Event['status']) => {
    let color;
    let text;
    
    switch (status) {
      case 'upcoming':
        color = 'blue';
        text = 'Sắp diễn ra';
        break;
      case 'ongoing':
        color = 'green';
        text = 'Đang diễn ra';
        break;
      case 'completed':
        color = 'gray';
        text = 'Đã kết thúc';
        break;
      default:
        color = 'default';
        text = 'Không xác định';
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  // Render event type tag
  const renderEventType = (type: Event['type']) => {
    let color;
    let text;
    
    switch (type) {
      case 'tournament':
        color = 'magenta';
        text = 'Giải đấu';
        break;
      case 'friendly':
        color = 'cyan';
        text = 'Giao lưu';
        break;
      case 'training':
        color = 'orange';
        text = 'Đào tạo';
        break;
      default:
        color = 'default';
        text = 'Khác';
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  // Calculate pagination
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Render event cards with skeleton loading
  const renderEventCards = () => {
    if (loading) {
      return Array(3).fill(null).map((_, index) => (
        <Col xs={24} md={12} lg={8} key={`skeleton-${index}`}>
          <Card className="event-card" loading={true} />
        </Col>
      ));
    }

    if (filteredEvents.length === 0) {
      return (
        <Col span={24}>
          <Empty
            description="Không tìm thấy sự kiện nào khớp với tiêu chí tìm kiếm"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Col>
      );
    }

    return paginatedEvents.map(event => (
      <Col xs={24} md={12} lg={8} key={event.id}>
        <Card
          className="event-card"
          cover={
            <div className="event-card-cover">
              <img alt={event.title} src={event.coverImage} />
              <div className="event-card-badge">
                {renderEventStatus(event.status)}
                {renderEventType(event.type)}
              </div>
            </div>
          }
          actions={[
            <Button 
              type="link" 
              onClick={() => handleViewEvent(event.id)}
              icon={<ArrowRightOutlined />}
            >
              Chi tiết
            </Button>,
            <Button 
              type="primary"
              onClick={() => handleRegister(event.id)}
              disabled={event.status !== 'upcoming' || event.currentParticipants >= event.maxParticipants}
            >
              Đăng ký
            </Button>
          ]}
        >
          <div className="event-card-org">
            <Avatar src={event.organizer.logo} size="small" />
            <Text type="secondary" className="text-sm">
              {event.organizer.name}
            </Text>
          </div>
          
          <Card.Meta
            title={<span className="event-card-title">{event.title}</span>}
            description={
              <Paragraph ellipsis={{ rows: 2 }} className="event-card-desc">
                {event.description}
              </Paragraph>
            }
          />
          
          <div className="event-card-info">
            <div className="event-info-item">
              <CalendarOutlined />
              <Text className="ml-2">
                {new Date(event.startDate).toLocaleDateString('vi-VN')}
                {event.startDate !== event.endDate && 
                  ` - ${new Date(event.endDate).toLocaleDateString('vi-VN')}`}
              </Text>
            </div>
            
            <div className="event-info-item">
              <EnvironmentOutlined />
              <Text className="ml-2" ellipsis>{event.location}</Text>
            </div>
            
            <div className="event-info-item">
              <TeamOutlined />
              <Text className="ml-2">
                {event.currentParticipants}/{event.maxParticipants} người tham gia
              </Text>
            </div>
          </div>
          
          <div className="event-card-footer">
            <div>
              {event.tags.map(tag => (
                <Tag key={tag} className="event-tag">{tag}</Tag>
              ))}
            </div>
            
            {event.prizes && (
              <div className="event-prize">
                <TrophyOutlined />
                <Text className="ml-1">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 0
                  }).format(event.prizes.first)}
                </Text>
              </div>
            )}
          </div>
        </Card>
      </Col>
    ));
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
          <div>
            <Title level={2} className="m-0 text-xl md:text-2xl lg:text-3xl">
              Sự kiện & Giải đấu
            </Title>
            <Text type="secondary">
              Khám phá các sự kiện thể thao và giải đấu đang diễn ra
            </Text>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Space>
              <Select 
                value={sportFilter}
                onChange={value => setSportFilter(value)}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả môn</Option>
                {sportTypes.filter(sport => sport !== 'all').map(sport => (
                  <Option key={sport} value={sport}>{sport}</Option>
                ))}
              </Select>
              
              <Select 
                value={typeFilter}
                onChange={value => setTypeFilter(value)}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả loại</Option>
                <Option value="tournament">Giải đấu</Option>
                <Option value="friendly">Giao lưu</Option>
                <Option value="training">Đào tạo</Option>
              </Select>
            </Space>
          </div>
        </div>
        
        <Card className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              className="event-tabs"
            >
              <TabPane 
                tab={<span>Tất cả sự kiện</span>} 
                key="all" 
              />
              <TabPane 
                tab={
                  <Badge 
                    count={events.filter(e => e.status === 'upcoming').length} 
                    offset={[15, 0]}
                  >
                    <span>Sắp diễn ra</span>
                  </Badge>
                } 
                key="upcoming" 
              />
              <TabPane 
                tab={
                  <Badge 
                    count={events.filter(e => e.status === 'ongoing').length} 
                    offset={[15, 0]}
                  >
                    <span>Đang diễn ra</span>
                  </Badge>
                } 
                key="ongoing" 
              />
              <TabPane 
                tab={<span>Đã kết thúc</span>} 
                key="completed" 
              />
            </Tabs>
            
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <Input 
                placeholder="Tìm kiếm sự kiện..." 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: '100%', maxWidth: '300px' }}
              />
            </div>
          </div>
        </Card>
        
        {/* Event Highlight Section */}
        {!loading && activeTab === 'all' && currentPage === 1 && (
          <Card 
            className="mb-4 md:mb-6 highlight-event"
            cover={
              <div className="highlight-event-cover">
                <img 
                  alt={filteredEvents[0]?.title} 
                  src={filteredEvents[0]?.coverImage} 
                  className="highlight-event-image"
                />
                <div className="highlight-event-overlay">
                  <div className="highlight-event-content">
                    <Space>
                      {renderEventStatus(filteredEvents[0]?.status)}
                      {renderEventType(filteredEvents[0]?.type)}
                    </Space>
                    <Title level={3} className="highlight-event-title">
                      {filteredEvents[0]?.title}
                    </Title>
                    <Space className="highlight-event-details">
                      <span>
                        <CalendarOutlined /> {new Date(filteredEvents[0]?.startDate).toLocaleDateString('vi-VN')}
                      </span>
                      <span>
                        <ClockCircleOutlined /> {new Date(filteredEvents[0]?.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>
                        <EnvironmentOutlined /> {filteredEvents[0]?.location.split(',')[0]}
                      </span>
                    </Space>
                    <div className="highlight-event-actions">
                      <Button 
                        type="primary" 
                        size="large"
                        onClick={() => handleViewEvent(filteredEvents[0]?.id)}
                      >
                        Xem Chi Tiết
                      </Button>
                      <Button 
                        size="large"
                        onClick={() => handleRegister(filteredEvents[0]?.id)}
                        disabled={
                          filteredEvents[0]?.status !== 'upcoming' || 
                          filteredEvents[0]?.currentParticipants >= filteredEvents[0]?.maxParticipants
                        }
                      >
                        Đăng Ký Tham Gia
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            {/* Card content can be empty as we're using the cover for content */}
          </Card>
        )}
        
        <Row gutter={[16, 16]}>
          {renderEventCards()}
        </Row>
        
        {filteredEvents.length > pageSize && (
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredEvents.length}
              onChange={setCurrentPage}
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setCurrentPage(1);
                setPageSize(size);
              }}
            />
          </div>
        )}
      </div>
      
      <style>
        {`
          .event-card {
            height: 100%;
            transition: all 0.3s;
            overflow: hidden;
          }
          
          .event-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-5px);
          }
          
          .event-card-cover {
            position: relative;
            height: 200px;
            overflow: hidden;
          }
          
          .event-card-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .event-card-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .event-card-org {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }
          
          .event-card-title {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .event-card-desc {
            color: rgba(0, 0, 0, 0.65);
            margin-bottom: 12px;
          }
          
          .event-card-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 12px 0;
          }
          
          .event-info-item {
            display: flex;
            align-items: center;
            color: rgba(0, 0, 0, 0.65);
            font-size: 13px;
          }
          
          .event-card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;
          }
          
          .event-tag {
            margin-bottom: 5px;
          }
          
          .event-prize {
            display: flex;
            align-items: center;
            color: #faad14;
            font-weight: 500;
          }
          
          .pagination-container {
            display: flex;
            justify-content: center;
            margin-top: 24px;
          }
          
          .event-tabs {
            margin-bottom: 0 !important;
          }
          
          .highlight-event {
            margin-bottom: 24px;
          }
          
          .highlight-event-cover {
            position: relative;
            height: 400px;
          }
          
          .highlight-event-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .highlight-event-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7));
            display: flex;
            align-items: flex-end;
            padding: 24px;
          }
          
          .highlight-event-content {
            color: white;
            width: 100%;
          }
          
          .highlight-event-title {
            color: white !important;
            margin: 12px 0;
          }
          
          .highlight-event-details {
            margin-bottom: 24px;
          }
          
          .highlight-event-actions {
            display: flex;
            gap: 12px;
          }
          
          @media (max-width: 768px) {
            .highlight-event-cover {
              height: 300px;
            }
            
            .highlight-event-actions {
              flex-direction: column;
              gap: 8px;
              align-items: flex-start;
            }
            
            .highlight-event-actions button {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default EventList; 