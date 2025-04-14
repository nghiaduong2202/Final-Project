import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, Row, Col, Typography, Input, Select, Empty, 
  List, Tag, Rate, Button, Skeleton, notification
} from 'antd';
import { 
  HeartFilled, EnvironmentOutlined, ClockCircleOutlined,
  ArrowRightOutlined, ReloadOutlined
} from '@ant-design/icons';

// Mock data - Define it locally since we can't import from UserProfile
const mockFavoriteFacilities = [
  {
    id: 'facility-1',
    name: 'Sân bóng đá mini TDT Arena',
    location: 'Quận 7, TP.HCM',
    rating: 4.8,
    image: 'https://placehold.co/300x200/orange/white?text=TDT+Arena',
    sports: ['Bóng đá', 'Futsal'],
    openTime: '07:00',
    closeTime: '22:00'
  },
  {
    id: 'facility-2',
    name: 'Sân bóng rổ Star Basketball Court',
    location: 'Quận 1, TP.HCM',
    rating: 4.5,
    image: 'https://placehold.co/300x200/blue/white?text=Star+Basketball',
    sports: ['Bóng rổ'],
    openTime: '06:00',
    closeTime: '21:00'
  },
  {
    id: 'facility-3',
    name: 'Sân cầu lông Thống Nhất',
    location: 'Quận 10, TP.HCM',
    rating: 4.2,
    image: 'https://placehold.co/300x200/green/white?text=Badminton+Court',
    sports: ['Cầu lông'],
    openTime: '08:00',
    closeTime: '23:00'
  }
];

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Facility interface based on the mock data
interface FavoriteFacility {
  id: string;
  name: string;
  location: string;
  rating: number;
  image: string;
  sports: string[];
  openTime: string;
  closeTime: string;
}

const FavoriteList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteFacility[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteFacility[]>([]);
  const [searchText, setSearchText] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  
  // Sports list extracted from all favorites
  const sportsList = Array.from(
    new Set(
      favorites.flatMap(facility => facility.sports)
    )
  );

  // Fetch favorites data
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFavorites(mockFavoriteFacilities);
      setFilteredFavorites(mockFavoriteFacilities);
      setLoading(false);
    };
    
    fetchFavorites();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...favorites];
    
    // Apply search text filter
    if (searchText) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Apply sport filter
    if (sportFilter !== 'all') {
      result = result.filter(item => 
        item.sports.includes(sportFilter)
      );
    }
    
    setFilteredFavorites(result);
  }, [searchText, sportFilter, favorites]);

  // Handle search 
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Handle sport filter
  const handleSportFilter = (value: string) => {
    setSportFilter(value);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchText('');
    setSportFilter('all');
  };

  // Remove from favorites
  const handleRemoveFavorite = (facilityId: string) => {
    setFavorites(prev => prev.filter(facility => facility.id !== facilityId));
    notification.success({
      message: 'Đã xóa khỏi danh sách yêu thích',
      description: 'Sân thể thao đã được xóa khỏi danh sách yêu thích của bạn'
    });
  };

  // Navigate to facility detail
  const handleViewFacility = (facilityId: string) => {
    navigate(`/facility/${facilityId}`);
  };

  // Book a facility
  const handleBookFacility = (facilityId: string) => {
    navigate(`/user/booking/${facilityId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Title level={2}>
          <HeartFilled className="text-red-500 mr-2" /> 
          Danh sách sân yêu thích
        </Title>
        <Text type="secondary">
          Quản lý và truy cập nhanh các sân thể thao bạn đã đánh dấu yêu thích
        </Text>
      </div>

      {/* Filter section */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm kiếm theo tên hoặc địa điểm"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              className="w-full"
              placeholder="Lọc theo môn thể thao"
              value={sportFilter}
              onChange={handleSportFilter}
            >
              <Option value="all">Tất cả môn thể thao</Option>
              {sportsList.map(sport => (
                <Option key={sport} value={sport}>{sport}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleResetFilters}
              className="w-full"
            >
              Đặt lại bộ lọc
            </Button>
          </Col>
          <Col xs={24} md={6}>
            <div className="text-right">
              <Text type="secondary">
                Hiển thị {filteredFavorites.length} / {favorites.length} sân yêu thích
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Favorites list */}
      {loading ? (
        <div className="mt-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="mb-4">
              <Skeleton active avatar paragraph={{ rows: 4 }} />
            </Card>
          ))}
        </div>
      ) : filteredFavorites.length > 0 ? (
        <List
          grid={{ 
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 3,
            xl: 3,
            xxl: 3,
          }}
          dataSource={filteredFavorites}
          renderItem={item => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <div className="relative">
                    <img 
                      alt={item.name} 
                      src={item.image} 
                      className="h-48 w-full object-cover"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<HeartFilled />}
                      className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full shadow-md"
                      onClick={() => handleRemoveFavorite(item.id)}
                    />
                  </div>
                }
                actions={[
                  <Button 
                    icon={<ArrowRightOutlined />} 
                    onClick={() => handleViewFacility(item.id)}
                  >
                    Xem chi tiết
                  </Button>,
                  <Button 
                    type="primary" 
                    onClick={() => handleBookFacility(item.id)}
                  >
                    Đặt sân
                  </Button>,
                ]}
              >
                <div className="mb-2">
                  <Title level={5} className="mb-1 line-clamp-1">{item.name}</Title>
                  <div className="flex items-center text-gray-500 mb-1">
                    <EnvironmentOutlined className="mr-1" />
                    <Text type="secondary" className="line-clamp-1">{item.location}</Text>
                  </div>
                  <div className="flex items-center text-gray-500 mb-2">
                    <ClockCircleOutlined className="mr-1" />
                    <Text type="secondary">{item.openTime} - {item.closeTime}</Text>
                  </div>
                </div>
                
                <Rate disabled defaultValue={item.rating} className="text-sm mb-2" />
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.sports.map(sport => (
                    <Tag color="blue" key={sport}>
                      {sport}
                    </Tag>
                  ))}
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              {searchText || sportFilter !== 'all' 
                ? 'Không tìm thấy sân yêu thích nào khớp với bộ lọc'
                : 'Bạn chưa có sân yêu thích nào'}
            </span>
          }
        >
          <Button type="primary" onClick={() => navigate('/')}>
            Khám phá các sân thể thao
          </Button>
        </Empty>
      )}
    </div>
  );
};

export default FavoriteList; 