import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Breadcrumb, 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Checkbox, 
  Slider, 
  Rate, 
  Button, 
  Typography, 
  Divider,
  Tag,
  Pagination,
  Empty,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { mockFacilities } from '@/mocks/facility/mockFacilities';

const { Title, Text } = Typography;

// Interface for facility data based on mock data
interface FacilityData {
  id: string;
  name: string;
  description: string;
  location: string;
  openTime1: string;
  closeTime1: string;
  openTime2: string;
  closeTime2: string;
  openTime3: string;
  closeTime3: string;
  numberOfShifts: number;
  status: string;
  avgRating: number;
  numberOfRatings: number;
  imagesUrl: string[];
  sports: {
    id: number;
    name: string;
  }[];
}

const ResultSearch: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // States
  const [searchParams, setSearchParams] = useState({
    keyword: queryParams.get('keyword') || '',
    sport: queryParams.get('sport') || undefined,
    location: queryParams.get('location') || '',
    timeRange: null,
  });

  const [filters, setFilters] = useState({
    sports: [] as string[],
    priceRange: [0, 1000000] as [number, number],
    rating: 0,
    hasPromotion: false,
    hasEvent: false,
    openNow: false,
    facilities: [] as string[],
  });

  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // Add states for mock data
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch facilities on component mount
  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100));
        setFacilities(mockFacilities);
        setError(null);
      } catch (err) {
        console.error('Error fetching facilities:', err);
        setError('Failed to load facilities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  // Danh sách các môn thể thao để filter
  const sportOptions = [
    { label: 'Bóng đá', value: 'football' },
    { label: 'Bóng rổ', value: 'basketball' },
    { label: 'Cầu lông', value: 'badminton' },
    { label: 'Tennis', value: 'tennis' },
    { label: 'Bơi lội', value: 'swimming' },
    { label: 'Bóng chuyền', value: 'volleyball' },
    { label: 'Futsal', value: 'futsal' },
    { label: 'Golf', value: 'golf' }
  ];

  // Danh sách các tiện ích để filter
  const facilityOptions = [
    { label: 'Có chỗ đậu xe', value: 'parking' },
    { label: 'Có phòng thay đồ', value: 'changingRoom' },
    { label: 'Có phòng tắm', value: 'shower' },
    { label: 'Có quầy đồ uống', value: 'beverages' },
    { label: 'Cho thuê dụng cụ', value: 'equipment' },
  ];

  // Xử lý thay đổi filter
  const handleFilterChange = (filterName: string, value: string[] | [number, number] | number | boolean | string | number[]) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
  };

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  // Xử lý click vào facility
  const handleFacilityClick = (facilityId: string) => {
    navigate(`/facility/${facilityId}`);
  };

  // Apply filters and sorting to facilities
  const getFilteredFacilities = () => {
    if (!facilities.length) return [];
    
    let filtered = [...facilities];
    
    // Apply keyword search
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase();
      filtered = filtered.filter(facility => 
        facility.name.toLowerCase().includes(keyword) ||
        facility.description.toLowerCase().includes(keyword) ||
        facility.location.toLowerCase().includes(keyword)
      );
    }
    
    // Apply sport filter
    if (filters.sports.length > 0) {
      filtered = filtered.filter(facility => 
        facility.sports.some(sport => filters.sports.includes(sport.name))
      );
    }
    
    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(facility => facility.avgRating >= filters.rating);
    }
    
    // Apply open now filter
    if (filters.openNow) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
      
      filtered = filtered.filter(facility => {
        return (facility.openTime1 <= currentTime && facility.closeTime1 >= currentTime) ||
               (facility.openTime2 && facility.openTime2 <= currentTime && facility.closeTime2 >= currentTime) ||
               (facility.openTime3 && facility.openTime3 <= currentTime && facility.closeTime3 >= currentTime);
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.avgRating - a.avgRating);
        break;
      case 'priceAsc':
        // Add price sorting logic when price data is available
        break;
      case 'priceDesc':
        // Add price sorting logic when price data is available
        break;
      default:
        // Default sorting (relevance)
        break;
    }
    
    return filtered;
  };

  // Get paginated facilities
  const getPaginatedFacilities = () => {
    const filtered = getFilteredFacilities();
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  };

  // Facility Card component
  const FacilityCard = ({ facility }: { facility: FacilityData }) => (
    <Card 
      hoverable 
      className="w-full h-full"
      onClick={() => handleFacilityClick(facility.id)}
      cover={<img alt={facility.name} src={facility.imagesUrl[0] || 'https://via.placeholder.com/300'} className="h-40 sm:h-48 object-cover w-full" />}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-600 text-xs sm:text-sm">
          <ClockCircleOutlined className="mr-1" />
          {facility.openTime1.substring(0, 5)} - {facility.closeTime1.substring(0, 5)}
        </span>
        <div className="flex items-center">
          <Rate disabled defaultValue={facility.avgRating} className="text-xs" />
          <span className="ml-1 text-gray-500 text-xs">
            <UserOutlined className="mr-1" />
            {facility.numberOfRatings}
          </span>
        </div>
      </div>
      <h3 className="text-base font-semibold mb-2 line-clamp-1">{facility.name}</h3>
      <div className="flex gap-1 mb-2 flex-wrap">
        {facility.sports.map(sport => (
          <Tag key={sport.id} color="blue" className="text-xs py-0.5 px-1">{sport.name}</Tag>
        ))}
      </div>
      <p className="text-gray-600 mb-2 text-xs sm:text-sm line-clamp-1">
        <EnvironmentOutlined className="mr-1" />
        {facility.location}
      </p>
      <div className="flex justify-between items-center">
        <div>
          <Tag color={facility.status === 'active' ? 'success' : facility.status === 'pending' ? 'warning' : 'error'} className="text-xs py-0.5 px-1">
            {facility.status === 'active' ? 'Hoạt động' : facility.status === 'pending' ? 'Đang chờ' : 'Bảo trì'}
          </Tag>
        </div>
      </div>
    </Card>
  );

  // Breadcrumb items
  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: 'Kết quả tìm kiếm',
    },
  ];

  const filteredFacilities = getFilteredFacilities();

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-4 md:mb-6" />
      
        {/* Title */}
        <Title level={2} className="mb-4 md:mb-6 text-xl md:text-2xl lg:text-3xl">Kết quả tìm kiếm</Title>
       
        {/* Search bar */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-md mb-4 md:mb-6">
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={8} lg={10}>
              <Input 
                placeholder="Tìm kiếm cơ sở thể thao" 
                prefix={<SearchOutlined />}
                value={searchParams.keyword}
                onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                size="middle"
              />
            </Col>
            <Col xs={24} md={8} lg={6}>
              <Select
                placeholder="Chọn môn thể thao"
                style={{ width: '100%' }}
                value={searchParams.sport}
                onChange={(value) => setSearchParams(prev => ({ ...prev, sport: value }))}
                size="middle"
                allowClear
                options={sportOptions}
              />
            </Col>
            <Col xs={24} md={8} lg={6}>
              <Input 
                prefix={<EnvironmentOutlined />}
                placeholder="Địa điểm"
                value={searchParams.location}
                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                size="middle"
              />
            </Col>
            <Col xs={24} md={24} lg={2}>
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                size="middle"
                block
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </div>
       
        {/* Main content */}
        <Row gutter={[16, 16]}>
          {/* Left sidebar - Filters */}
          <Col xs={24} md={8} lg={6}>
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-md sticky top-4">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <Title level={4} className="m-0 text-base md:text-lg">Bộ lọc</Title>
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => {
                    setFilters({
                      sports: [],
                      priceRange: [0, 1000000],
                      rating: 0,
                      hasPromotion: false,
                      hasEvent: false,
                      openNow: false,
                      facilities: [],
                    });
                  }}
                >
                  Đặt lại
                </Button>
              </div>
              
              <Divider className="my-2 md:my-3" />

              {/* Môn thể thao */}
              <div className="mb-3 md:mb-4">
                <Title level={5} className="text-sm md:text-base">Môn thể thao</Title>
                <Checkbox.Group
                  options={sportOptions}
                  value={filters.sports}
                  onChange={(values) => handleFilterChange('sports', values)}
                  className="flex flex-col gap-1 mt-2"
                />
              </div>

              <Divider className="my-2 md:my-3" />

              {/* Khoảng giá */}
              <div className="mb-3 md:mb-4">
                <Title level={5} className="text-sm md:text-base">Khoảng giá (VNĐ)</Title>
                <Slider
                  range
                  min={0}
                  max={1000000}
                  step={50000}
                  value={filters.priceRange}
                  onChange={(value) => handleFilterChange('priceRange', value)}
                  tooltip={{ formatter: (value) => `${value?.toLocaleString()}đ` }}
                  className="mt-2"
                />
                <div className="flex justify-between text-gray-500 mt-2 text-xs md:text-sm">
                  <span>{filters.priceRange[0].toLocaleString()}đ</span>
                  <span>{filters.priceRange[1].toLocaleString()}đ</span>
                </div>
              </div>

              <Divider className="my-2 md:my-3" />

              {/* Đánh giá */}
              <div className="mb-3 md:mb-4">
                <Title level={5} className="text-sm md:text-base">Đánh giá tối thiểu</Title>
                <Rate 
                  allowHalf 
                  value={filters.rating} 
                  onChange={(value) => handleFilterChange('rating', value)} 
                  className="mt-2"
                />
              </div>

              <Divider className="my-2 md:my-3" />

              {/* Thời gian */}
              <div className="mb-3 md:mb-4">
                <Title level={5} className="text-sm md:text-base">Thời gian</Title>
                <Checkbox 
                  checked={filters.openNow}
                  onChange={(e) => handleFilterChange('openNow', e.target.checked)}
                  className="mt-2"
                >
                  Đang mở cửa
                </Checkbox>
              </div>

              <Divider className="my-2 md:my-3" />

              {/* Tiện ích */}
              <div className="mb-3 md:mb-4">
                <Title level={5} className="text-sm md:text-base">Tiện ích</Title>
                <Checkbox.Group
                  options={facilityOptions}
                  value={filters.facilities}
                  onChange={(values) => handleFilterChange('facilities', values)}
                  className="flex flex-col gap-1 mt-2"
                />
              </div>
            </div> 
          </Col>
          
          {/* Right content - Search results */}
          <Col xs={24} md={16} lg={18}>
            {/* Sort options */}
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-md mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <Text className="text-sm md:text-base">Tìm thấy {filteredFacilities.length} kết quả</Text>
              <div className="flex items-center">
                <Text className="mr-2 text-sm md:text-base">Sắp xếp theo:</Text>
                <Select
                  defaultValue="relevance"
                  style={{ width: 150 }}
                  onChange={handleSortChange}
                  size="middle"
                  options={[
                    { value: 'relevance', label: 'Liên quan nhất' },
                    { value: 'rating', label: 'Đánh giá cao nhất' },
                    { value: 'priceAsc', label: 'Giá: Thấp đến cao' },
                    { value: 'priceDesc', label: 'Giá: Cao đến thấp' },
                  ]}
                />
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex justify-center items-center py-8 md:py-12">
                <Spin size="large" />
              </div>
            ) : error ? (
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
                <Text type="danger">{error}</Text>
                <Button 
                  type="primary" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </Button>
              </div>
            ) : filteredFacilities.length > 0 ? (
              <>
                <Row gutter={[12, 12]}>
                  {getPaginatedFacilities().map(facility => (
                    <Col key={facility.id} xs={12} sm={8} lg={6} className="h-full">
                      <FacilityCard facility={facility} />
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                <div className="mt-6 md:mt-8 flex justify-center">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredFacilities.length}
                    onChange={handlePageChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `Tổng cộng ${total} kết quả`}
                    responsive
                    className="text-sm"
                  />
                </div>
              </>
            ) : (
              <Empty
                description="Không tìm thấy kết quả nào phù hợp"
                className="py-8 md:py-12"
              />
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ResultSearch;