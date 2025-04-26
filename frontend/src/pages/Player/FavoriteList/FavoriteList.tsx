import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Card, Row, Col, Typography, Input, Select, Empty, 
  List, Tag, Button, Skeleton, notification, Breadcrumb
} from 'antd';
import { 
  HeartFilled, EnvironmentOutlined, 
  ReloadOutlined, StarOutlined, DollarOutlined
} from '@ant-design/icons';
import { facilityService } from '@/services/facility.service';
import { Facility } from '@/types/facility.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import OperatingHoursDisplay from '@/components/shared/OperatingHoursDisplay';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const FavoriteList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Facility[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Facility[]>([]);
  const [searchText, setSearchText] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  
  // Get unique sports from all favorites
  const sportsList = Array.from(
    new Set(
      favorites.flatMap(facility => facility.sports?.map(sport => sport.name) || [])
    )
  );

  // Fetch favorites data from API
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const data = await facilityService.getFavoriteFacility();
        setFavorites(data);
        setFilteredFavorites(data);
      } catch (error) {
        console.error('Error fetching favorite facilities:', error);
        notification.error({
          message: 'Lỗi',
          description: 'Không thể tải danh sách yêu thích. Vui lòng thử lại sau.'
        });
      } finally {
        setLoading(false);
      }
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
        item.sports?.some(sport => sport.name === sportFilter)
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
  const handleRemoveFavorite = async (facilityId: string) => {
    try {
      await facilityService.removeFavoriteFacility(facilityId);
      setFavorites(prev => prev.filter(facility => facility.id !== facilityId));
      notification.success({
        message: 'Đã xóa khỏi danh sách yêu thích',
        description: 'Sân thể thao đã được xóa khỏi danh sách yêu thích của bạn'
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể xóa khỏi danh sách yêu thích. Vui lòng thử lại sau.'
      });
    }
  };

  // Navigate to facility detail
  const handleViewFacility = (facilityId: string) => {
    navigate(`/facility/${facilityId}`);
  };

  // Book a facility
  const handleBookFacility = (facilityId: string) => {
    navigate(`/user/booking/${facilityId}`);
  };

  // Facility Card component - based on ResultSearch component
  const FacilityCard = ({ facility }: { facility: Facility }) => (
    <Card
      hoverable
      className="w-full h-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
      cover={
        <div className="relative h-48 overflow-hidden">
          {facility.imagesUrl && facility.imagesUrl.length > 0 ? (
            <img 
              alt={facility.name} 
              src={facility.imagesUrl[0]} 
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <Button
            type="text"
            danger
            icon={<HeartFilled />}
            className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFavorite(facility.id);
            }}
          />
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Tag color={
              facility.status === 'active' ? 'success' : 
              facility.status === 'pending' ? 'warning' : 'default'
            }>
              {facility.status === 'active' ? 'Đang hoạt động' : 
              facility.status === 'pending' ? 'Đang chờ phê duyệt' : 'Đang đóng cửa'}
            </Tag>
          </div>
        </div>
      }
      onClick={() => handleViewFacility(facility.id)}
      style={{ padding: '12px 16px' }}
    >
      {/* Tên cơ sở */}
      <h3 className="text-base sm:text-lg font-semibold line-clamp-1 mb-2 text-gray-800">{facility.name}</h3>
      
      {/* Giờ hoạt động và Rating */}
      <div className="flex items-center text-gray-500 mb-2 text-xs sm:text-sm">
        <div className="flex-1">
          <OperatingHoursDisplay facility={facility} />
        </div>
        
        {/* Rating */}
        <div className="ml-auto flex items-center">
          <StarOutlined className="text-yellow-500 mr-1" />
          <span className="font-medium">{facility.avgRating.toFixed(1)}</span>
        </div>
      </div>
      
      {/* Môn thể thao */}
      <div className="mb-2 h-6">
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {facility.sports && facility.sports.length > 0 ? (
            <>
              <Tag key={facility.sports[0].id} color="blue" className="text-xs sm:text-sm">
                {getSportNameInVietnamese(facility.sports[0].name)}
              </Tag>
              {facility.sports.length > 1 && (
                <Tag key={facility.sports[1].id} color="blue" className="text-xs sm:text-sm">
                  {getSportNameInVietnamese(facility.sports[1].name)}
                </Tag>
              )}
              {facility.sports.length > 2 && (
                <Tag className="text-xs sm:text-sm">+{facility.sports.length - 2}</Tag>
              )}
            </>
          ) : (
            <Tag className="text-xs sm:text-sm">Chưa có thông tin</Tag>
          )}
        </div>
      </div>
      
      {/* Địa chỉ */}
      <div className="flex items-start text-gray-600 mb-3 truncate">
        <EnvironmentOutlined className="mr-1 sm:mr-2 mt-0.5 flex-shrink-0 text-xs sm:text-sm text-gray-600" />
        <p className="line-clamp-1 text-xs sm:text-sm">{facility.location}</p>
      </div>
      
      {/* Khoảng giá */}
      <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm mt-auto">
        <DollarOutlined className="mr-1 sm:mr-2 text-green-600" />
        {facility.minPrice !== undefined && facility.maxPrice !== undefined ? (
          <>
            <span className="text-blue-700 font-semibold">
              {facility.minPrice.toLocaleString('vi-VN')}đ - {facility.maxPrice.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-gray-500 text-xs ml-1">/giờ</span>
          </>
        ) : (
          <span className="text-gray-500">Chưa có thông tin giá</span>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button 
          type="primary" 
          size="middle"
          block
          onClick={(e) => {
            e.stopPropagation();
            handleBookFacility(facility.id);
          }}
        >
          Đặt sân
        </Button>
      </div>
    </Card>
  );

  // Breadcrumb items
  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: 'Danh sách yêu thích',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      
      {/* Header */}
      <div className="mb-6">
        <Title level={3}>
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
                <Option key={sport} value={sport}>{getSportNameInVietnamese(sport)}</Option>
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
          renderItem={facility => (
            <List.Item>
              <FacilityCard facility={facility} />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              Bạn chưa có sân yêu thích nào
              {searchText || sportFilter !== 'all' ? ' phù hợp với bộ lọc đã chọn' : ''}
            </span>
          }
        >
          <Button type="primary" onClick={() => navigate('/')}>
            Tìm kiếm sân ngay
          </Button>
        </Empty>
      )}
    </div>
  );
};

export default FavoriteList; 