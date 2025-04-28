import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlaymateSearch, 
  PlaymateSearchType, 
  SkillLevel, 
  CostType 
} from '@/types/playmate.type';
import { getAllPlaymateSearches } from '@/services/playmate.service';
import { sportService } from '@/services/sport.service';

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
  Tabs,
  Badge
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
  MoneyCollectOutlined,
  SearchOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Sport {
  id: number;
  name: string;
}

const PlaymateList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [playmateSearches, setPlaymateSearches] = useState<PlaymateSearch[]>([]);
  const [filteredSearches, setFilteredSearches] = useState<PlaymateSearch[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | null>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<PlaymateSearchType | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'ACTIVE' | 'COMPLETED' | 'CANCELED'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch sport list
        const sportData = await sportService.getSport();
        setSports(sportData || []);
        
        // Fetch playmate searches
        const searches = await getAllPlaymateSearches();
        setPlaymateSearches(searches);
        setFilteredSearches(searches);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever any filter changes
  useEffect(() => {
    let result = [...playmateSearches];

    // Filter by status tab
    if (activeTab !== 'all') {
      result = result.filter(search => search.status === activeTab);
    }

    // Filter by search term (title, description, location)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        search => 
          search.title.toLowerCase().includes(term) || 
          (search.description && search.description.toLowerCase().includes(term)) ||
          (search.location && search.location.toLowerCase().includes(term)) ||
          (search.sportName && search.sportName.toLowerCase().includes(term))
      );
    }

    // Apply filters
    if (selectedSportId) {
      result = result.filter(search => search.sportId === selectedSportId);
    }

    if (selectedSkillLevel) {
      result = result.filter(search => {
        if (selectedSkillLevel === 'ANY') return true;
        return search.requiredSkillLevel === selectedSkillLevel;
      });
    }

    if (selectedSearchType) {
      result = result.filter(search => search.playmateSearchType === selectedSearchType);
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredSearches(result);
    setCurrentPage(1);
  }, [playmateSearches, searchTerm, selectedSportId, selectedSkillLevel, selectedSearchType, activeTab]);

  const handleCreatePlaymate = () => {
    navigate('/user/playmate/create');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSportFilter = (value: number | null) => {
    setSelectedSportId(value);
  };

  const handleSkillLevelFilter = (value: SkillLevel | null) => {
    setSelectedSkillLevel(value);
  };

  const handleSearchTypeFilter = (value: PlaymateSearchType | null) => {
    setSelectedSearchType(value);
  };

  const handleViewPlaymate = (id: number) => {
    navigate(`/user/playmate/${id}`);
  };
  
  const getCostTypeDisplay = (costType?: CostType, price?: number, costMale?: number, costFemale?: number) => {
    if (!costType || costType === 'FREE') return <Tag color="success">Miễn phí</Tag>;
    
    if (costType === 'PER_PERSON' && price) {
      return <Text>{price.toLocaleString('vi-VN')}đ/người</Text>;
    }
    
    if (costType === 'TOTAL' && price) {
      return <Text>{price.toLocaleString('vi-VN')}đ tổng</Text>;
    }
    
    if (costType === 'GENDER_BASED') {
      return (
        <Space direction="vertical" size={0}>
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

  const getStatusTag = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'ACTIVE':
        return <Tag color="green">Đang diễn ra</Tag>;
      case 'COMPLETED':
        return <Tag color="blue">Đã kết thúc</Tag>;
      case 'CANCELED':
        return <Tag color="red">Đã hủy</Tag>;
      case 'EXPIRED':
        return <Tag color="red">Đã hết hạn</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  const getTypeTag = (type?: PlaymateSearchType) => {
    if (!type) return null;
    
    switch (type) {
      case 'INDIVIDUAL':
        return <Tag color="blue">Cá nhân</Tag>;
      case 'GROUP':
        return <Tag color="purple">Nhóm</Tag>;
      default:
        return <Tag color="default">Khác</Tag>;
    }
  };

  const getSkillTag = (level?: SkillLevel) => {
    if (!level) return null;
    
    switch (level) {
      case 'BEGINNER':
        return <Tag color="green">Mới bắt đầu</Tag>;
      case 'INTERMEDIATE':
        return <Tag color="orange">Trung cấp</Tag>;
      case 'ADVANCED':
        return <Tag color="volcano">Nâng cao</Tag>;
      case 'PROFESSIONAL':
        return <Tag color="red">Chuyên nghiệp</Tag>;
      case 'ANY':
        return <Tag color="cyan">Mọi trình độ</Tag>;
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
    const sportName = sports.find(s => s.id === search.sportId)?.name || search.sportName || '';
    
    const defaultImage = `https://via.placeholder.com/600x300?text=${encodeURIComponent(search.title)}`;
    const coverImage = search.image && search.image.length > 0 ? search.image[0] : defaultImage;
    
    return (
      <Card
        hoverable
        className="playmate-card h-full shadow-sm hover:shadow-md transition-all"
        cover={
          <div className="playmate-card-cover">
            <img 
              alt={search.title} 
              src={coverImage}
              className="object-cover w-full h-full"
            />
            <div className="playmate-card-badge">
              {getStatusTag(search.status)}
              {getTypeTag(search.playmateSearchType)}
            </div>
          </div>
        }
        actions={[
          <Button 
            type="link" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewPlaymate(search.id);
            }}
            icon={<ArrowRightOutlined />}
          >
            Chi tiết
          </Button>,
          <Button 
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleViewPlaymate(search.id);
            }}
            disabled={search.status !== 'ACTIVE' || Boolean(
              search.maximumParticipants && 
              search.currentParticipants && 
              search.currentParticipants >= search.maximumParticipants
            )}
          >
            {search.status !== 'ACTIVE' ? 'Đã kết thúc' : 
             (search.maximumParticipants && 
              search.currentParticipants && 
              search.currentParticipants >= search.maximumParticipants) ? 'Đã đủ người' : 'Đăng ký'}
          </Button>
        ]}
      >
        <div className="playmate-card-content">
          <div className="playmate-card-org">
            <Avatar src={search.userInfo.avatar} icon={<UserOutlined />} size="small" />
            <Text type="secondary" className="text-sm truncate">
              {search.userInfo.name}
            </Text>
          </div>
          
          <div className="playmate-card-title-container">
            <Card.Meta
              title={<span className="playmate-card-title">{search.title}</span>}
              description={
                <Paragraph ellipsis={{ rows: 2 }} className="playmate-card-desc">
                  {search.description}
                </Paragraph>
              }
            />
          </div>
          
          <div className="playmate-card-info">
            <div className="playmate-info-item">
              <CalendarOutlined />
              <Text className="ml-2">{formatDate(search.date)}</Text>
            </div>
            
            <div className="playmate-info-item">
              <ClockCircleOutlined />
              <Text className="ml-2">{`${search.startTime} - ${search.endTime}`}</Text>
            </div>
            
            {search.location && (
              <div className="playmate-info-item">
                <EnvironmentOutlined />
                <Text className="ml-2" ellipsis>{search.location}</Text>
              </div>
            )}
            
            <div className="playmate-info-item">
              <TeamOutlined />
              <Text className="ml-2">
                {`${search.currentParticipants || 1}/${search.requiredParticipants} người tham gia`}
                {search.maximumParticipants && ` (tối đa ${search.maximumParticipants})`}
              </Text>
            </div>
            
            <div className="playmate-info-item">
              <MoneyCollectOutlined />
              <span className="ml-2">
                {getCostTypeDisplay(search.costType, search.price, search.costMale, search.costFemale)}
              </span>
            </div>
          </div>
          
          <div className="playmate-card-footer">
            <div className="playmate-tags">
              {sportName && <Tag className="playmate-tag">{sportName}</Tag>}
              {getSkillTag(search.requiredSkillLevel)}
              {search.genderPreference && (
                <Tag color={
                  search.genderPreference === 'MALE' ? 'blue' : 
                  search.genderPreference === 'FEMALE' ? 'pink' : 'default'
                }>
                  {search.genderPreference === 'MALE' ? 'Nam' : 
                   search.genderPreference === 'FEMALE' ? 'Nữ' : 'Không giới hạn'}
                </Tag>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full px-4 py-6">
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
          
          <div className="mt-4 md:mt-0">
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
        <Card className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <Tabs 
              activeKey={activeTab} 
              onChange={tab => setActiveTab(tab as 'all' | 'ACTIVE' | 'COMPLETED' | 'CANCELED')}
              className="playmate-tabs"
              items={[
                {
                  key: 'all',
                  label: <span>Tất cả bài đăng</span>,
                },
                {
                  key: 'ACTIVE',
                  label: (
                    <Badge 
                      count={playmateSearches.filter(s => s.status === 'ACTIVE').length} 
                      offset={[15, 0]}
                    >
                      <span>Đang diễn ra</span>
                    </Badge>
                  ),
                },
                {
                  key: 'COMPLETED',
                  label: <span>Đã kết thúc</span>,
                },
                {
                  key: 'CANCELED',
                  label: <span>Đã hủy</span>,
                },
                {
                  key: 'EXPIRED',
                  label: <span>Đã hết hạn</span>,
                },
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
            <Col xs={24} md={8}>
              <Select
                placeholder="Môn thể thao"
                style={{ width: '100%' }}
                onChange={handleSportFilter}
                allowClear
                value={selectedSportId}
              >
                {sports.map(sport => (
                  <Option key={sport.id} value={sport.id}>{sport.name}</Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} md={8}>
              <Select
                placeholder="Trình độ"
                style={{ width: '100%' }}
                onChange={handleSkillLevelFilter}
                allowClear
                value={selectedSkillLevel}
              >
                <Option value="BEGINNER">Mới bắt đầu</Option>
                <Option value="INTERMEDIATE">Trung cấp</Option>
                <Option value="ADVANCED">Nâng cao</Option>
                <Option value="PROFESSIONAL">Chuyên nghiệp</Option>
                <Option value="ANY">Mọi trình độ</Option>
              </Select>
            </Col>
            
            <Col xs={24} md={8}>
              <Select
                placeholder="Loại tìm kiếm"
                style={{ width: '100%' }}
                onChange={handleSearchTypeFilter}
                allowClear
                value={selectedSearchType}
              >
                <Option value="INDIVIDUAL">Cá nhân</Option>
                <Option value="GROUP">Nhóm</Option>
              </Select>
            </Col>
          </Row>
        </Card>
        
        {/* Search results */}
        {loading ? (
          <div className="text-center py-8 spin-container">
            <Spin size="large" />
            <div className="mt-3">Đang tải danh sách bài đăng...</div>
          </div>
        ) : filteredSearches.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {paginatedSearches.map(search => (
                <Col key={search.id} xs={24} sm={12} md={8} lg={6} className="mb-4">
                  {renderPlaymateCard(search)}
                </Col>
              ))}
            </Row>
            
            {filteredSearches.length > pageSize && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredSearches.length}
                  onChange={setCurrentPage}
                  showSizeChanger
                  onShowSizeChange={(current, size) => {
                    setCurrentPage(1);
                    setPageSize(size);
                  }}
                />
              </div>
            )}
          </>
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
            min-height: 88px;
            margin-bottom: 12px;
          }
          
          .playmate-card-title {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .playmate-card-desc {
            color: rgba(0, 0, 0, 0.65);
            height: 40px;
            overflow: hidden;
          }
          
          .playmate-card-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 12px 0;
            flex-grow: 1;
          }
          
          .playmate-info-item {
            display: flex;
            align-items: center;
            color: rgba(0, 0, 0, 0.65);
            font-size: 13px;
          }
          
          .playmate-card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            flex-wrap: wrap;
            min-height: 36px;
          }
          
          .playmate-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
          
          .playmate-tag {
            margin: 0;
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
          
          .playmate-tabs {
            margin-bottom: 0 !important;
          }
          
          @media (max-width: 768px) {
            .playmate-card-cover {
              height: 180px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PlaymateList; 