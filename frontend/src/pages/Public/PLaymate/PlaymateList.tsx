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
  message
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
  MoneyCollectOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

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

    // Only show active searches
    result = result.filter(search => search.status === 'ACTIVE');

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
  }, [playmateSearches, searchTerm, selectedSportId, selectedSkillLevel, selectedSearchType]);

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

  const renderPlaymateCard = (search: PlaymateSearch) => {
    const sportName = sports.find(s => s.id === search.sportId)?.name || search.sportName || '';
    
    return (
      <Card 
        key={search.id} 
        className="h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate(`/user/playmate/${search.id}`)}
      >
        <Row gutter={[16, 16]}>
          {/* Upper section: Title, tags */}
          <Col span={24}>
            <Space direction="vertical" size={12} className="w-full">
              <Title level={5} className="mb-0 line-clamp-2" title={search.title}>
                {search.title}
              </Title>
              
              <Space wrap>
                {sportName && <Tag color="blue">{sportName}</Tag>}
                <Tag color={search.playmateSearchType === 'INDIVIDUAL' ? 'green' : 'purple'}>
                  {search.playmateSearchType === 'INDIVIDUAL' ? 'Cá nhân' : 'Nhóm'}
                </Tag>
                <Tag color="orange">{
                  search.requiredSkillLevel === 'BEGINNER' ? 'Mới bắt đầu' :
                  search.requiredSkillLevel === 'INTERMEDIATE' ? 'Trung cấp' :
                  search.requiredSkillLevel === 'ADVANCED' ? 'Nâng cao' :
                  search.requiredSkillLevel === 'PROFESSIONAL' ? 'Chuyên nghiệp' :
                  'Mọi trình độ'
                }</Tag>
              </Space>
            </Space>
          </Col>
          
          {/* Middle section: Date, time, location */}
          <Col span={24}>
            <Space direction="vertical" size={4} className="w-full">
              <Space>
                <CalendarOutlined className="text-gray-500" />
                <Text>{search.date}</Text>
              </Space>
              
              <Space>
                <ClockCircleOutlined className="text-gray-500" />
                <Text>{`${search.startTime} - ${search.endTime}`}</Text>
              </Space>
              
              {search.location && (
                <Space className="line-clamp-1">
                  <EnvironmentOutlined className="text-gray-500" />
                  <Text title={search.location}>{search.location}</Text>
                </Space>
              )}
            </Space>
          </Col>
          
          {/* Bottom section: User info, participants, cost */}
          <Col span={24}>
            <Divider className="my-2" />
            <Row gutter={[8, 8]} align="middle">
              <Col xs={24} sm={12}>
                <Space>
                  <Avatar src={search.userInfo.avatar} icon={<UserOutlined />} />
                  <Text className="font-medium">{search.userInfo.name}</Text>
                </Space>
              </Col>
              
              <Col xs={12} sm={6}>
                <Space>
                  <TeamOutlined className="text-gray-500" />
                  <Text>{`${search.currentParticipants || 1}/${search.requiredParticipants}`}</Text>
                </Space>
              </Col>
              
              <Col xs={12} sm={6} className="text-right">
                <Space>
                  <MoneyCollectOutlined className="text-gray-500" />
                  {getCostTypeDisplay(search.costType, search.price, search.costMale, search.costFemale)}
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Title */}
        <Breadcrumb className="mb-4 md:mb-6">
          <Breadcrumb.Item>
            <Link to="/user/dashboard">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Tìm bạn chơi</Breadcrumb.Item>
        </Breadcrumb>
        
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12}>
            <Title level={2} className="mb-0">Tìm bạn chơi</Title>
            <Text type="secondary">Tìm kiếm bạn chơi thể thao cùng sở thích</Text>
          </Col>
          <Col xs={24} md={12} className="flex justify-end items-center">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreatePlaymate}
              size="large"
            >
              Tạo bài đăng
            </Button>
          </Col>
        </Row>
        
        {/* Filters */}
        <Card className="mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8} lg={10}>
              <Search
                placeholder="Tìm kiếm theo tên, mô tả, địa điểm..."
                onSearch={handleSearch}
                style={{ width: '100%' }}
                size="large"
                allowClear
              />
            </Col>
            
            <Col xs={24} md={16} lg={14}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="Môn thể thao"
                    style={{ width: '100%' }}
                    onChange={handleSportFilter}
                    allowClear
                    size="large"
                  >
                    {sports.map(sport => (
                      <Option key={sport.id} value={sport.id}>{sport.name}</Option>
                    ))}
                  </Select>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="Trình độ"
                    style={{ width: '100%' }}
                    onChange={handleSkillLevelFilter}
                    allowClear
                    size="large"
                  >
                    <Option value="BEGINNER">Mới bắt đầu</Option>
                    <Option value="INTERMEDIATE">Trung cấp</Option>
                    <Option value="ADVANCED">Nâng cao</Option>
                    <Option value="PROFESSIONAL">Chuyên nghiệp</Option>
                    <Option value="ANY">Mọi trình độ</Option>
                  </Select>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="Loại tìm kiếm"
                    style={{ width: '100%' }}
                    onChange={handleSearchTypeFilter}
                    allowClear
                    size="large"
                  >
                    <Option value="INDIVIDUAL">Cá nhân</Option>
                    <Option value="GROUP">Nhóm</Option>
                  </Select>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        
        {/* Search results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : filteredSearches.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredSearches.map(search => (
              <Col key={search.id} xs={24} sm={12} md={8} lg={6} className="mb-4">
                {renderPlaymateCard(search)}
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description="Không tìm thấy bài đăng nào phù hợp"
            className="py-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </div>
  );
};

export default PlaymateList; 