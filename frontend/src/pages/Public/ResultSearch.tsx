import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Breadcrumb, 
  Card, 
  Row, 
  Col, 
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
  EnvironmentOutlined,
  StarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { facilityService } from '@/services/facility.service';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { sportService } from '@/services/sport.service';
import { Facility } from '@/types/facility.type';
import './ResultSearch.css';
import OperatingHoursDisplay from '@/components/shared/OperatingHoursDisplay';

const { Title, Text } = Typography;

// Interface for facility data
interface FacilityData extends Facility {
  numberOfRatings: number;
}

const ResultSearch: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // States
  const [searchParams] = useState({
    query: queryParams.get('query') || '',
    sport: queryParams.get('sport') || '',
    province: queryParams.get('province') || '',
    district: queryParams.get('district') || '',
    startTime: queryParams.get('startTime') || '',
    endTime: queryParams.get('endTime') || '',
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
  
  // States for mock data and API data
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [sports, setSports] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSports, setLoadingSports] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch facilities on component mount
  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const facilitiesData = await facilityService.getAllFacilities();
        // Map to FacilityData format (adding numberOfRatings)
        const mappedFacilities: FacilityData[] = facilitiesData.map(facility => ({
          ...facility,
          numberOfRatings: facility.numberOfRating
        }));
        setFacilities(mappedFacilities);
        setError(null);
      } catch (err) {
        console.error('Error fetching facilities:', err);
        setError('Failed to load facilities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
    fetchSports();
  }, []);

  // Fetch sports from API
  const fetchSports = async () => {
    setLoadingSports(true);
    try {
      const sportData = await sportService.getSport();
      setSports(sportData);
    } catch (err) {
      console.error('Error fetching sports:', err);
    } finally {
      setLoadingSports(false);
    }
  };

  // Tạo danh sách options cho sport filter từ API data
  const getSportOptions = () => {
    return sports.map(sport => ({
      label: getSportNameInVietnamese(sport.name),
      value: sport.name
    }));
  };

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
    
    // Apply keyword search from URL params
    if (searchParams.query) {
      const keyword = searchParams.query.toLowerCase();
      filtered = filtered.filter(facility => 
        facility.name.toLowerCase().includes(keyword) ||
        facility.description.toLowerCase().includes(keyword) ||
        facility.location.toLowerCase().includes(keyword)
      );
    }
    
    // Apply sport filter from URL params
    if (searchParams.sport && searchParams.sport !== 'all') {
      filtered = filtered.filter(facility => 
        facility.sports.some(sport => sport.id.toString() === searchParams.sport)
      );
    }
    
    // Apply local filters
    // Sport filter from sidebar
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
      className="w-full h-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
      onClick={() => handleFacilityClick(facility.id)}
      cover={
        <div className="h-40 sm:h-48 overflow-hidden relative">
          {facility.imagesUrl && facility.imagesUrl.length > 0 ? (
            <img 
              alt={facility.name} 
              src={facility.imagesUrl[0]} 
              className="w-full h-full object-cover transition-transform hover:scale-105" 
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
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
      style={{ padding: '12px 16px' }}
    >
      <div className="p-1 h-full flex flex-col">
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
        <div className="flex items-start mb-2 text-gray-600">
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
          ) : facility.fieldGroups && facility.fieldGroups.length > 0 ? (
            <>
              <span className="text-blue-700 font-semibold">
                {Math.min(...facility.fieldGroups.map((g: { basePrice: number }) => g.basePrice)).toLocaleString('vi-VN')}đ - 
                {Math.max(...facility.fieldGroups.map((g: { basePrice: number }) => g.basePrice)).toLocaleString('vi-VN')}đ
              </span>
              <span className="text-gray-500 text-xs ml-1">/giờ</span>
            </>
          ) : (
            <span className="text-gray-500">Chưa có thông tin giá</span>
          )}
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
    <div className="w-full px-4 py-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-4 md:mb-6" />
      
        {/* Title */}
        <div className="mb-8">
          <Title level={2} className="mb-2 text-xl md:text-2xl lg:text-3xl font-bold">Kết quả tìm kiếm</Title>
          <p className="text-gray-500 text-base">
            {searchParams.query ? `Tìm kiếm cho "${searchParams.query}"` : 'Danh sách cơ sở thể thao'}
            {searchParams.sport && searchParams.sport !== 'all' ? ` - Môn: ${getSportOptions().find(s => s.value === searchParams.sport)?.label}` : ''}
          </p>
        </div>
       
        {/* Main content */}
        <Row gutter={[24, 24]}>
          {/* Left sidebar - Filters */}
          <Col xs={24} md={8} lg={6}>
            <div className="bg-gray-50 p-5 rounded-lg shadow-md sticky top-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="m-0 text-lg font-bold">Bộ lọc</Title>
                <Button 
                  type="default" 
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
              
              <Divider className="my-4" />

              {/* Môn thể thao */}
              <div className="mb-6">
                <Title level={5} className="text-base font-semibold mb-3">Môn thể thao</Title>
                {loadingSports ? (
                  <div className="flex justify-center py-2">
                    <Spin size="small" />
                  </div>
                ) : (
                  <Checkbox.Group
                    options={getSportOptions()}
                    value={filters.sports}
                    onChange={(values) => handleFilterChange('sports', values)}
                    className="flex flex-col gap-2"
                  />
                )}
              </div>

              <Divider className="my-4" />

              {/* Khoảng giá */}
              <div className="mb-6">
                <Title level={5} className="text-base font-semibold mb-3">Khoảng giá (VNĐ)</Title>
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

              <Divider className="my-4" />

              {/* Đánh giá */}
              <div className="mb-6">
                <Title level={5} className="text-base font-semibold mb-3">Đánh giá tối thiểu</Title>
                <Rate 
                  allowHalf 
                  value={filters.rating} 
                  onChange={(value) => handleFilterChange('rating', value)} 
                />
              </div>

              <Divider className="my-4" />

              {/* Thời gian */}
              <div className="mb-6">
                <Title level={5} className="text-base font-semibold mb-3">Thời gian</Title>
                <Checkbox 
                  checked={filters.openNow}
                  onChange={(e) => handleFilterChange('openNow', e.target.checked)}
                >
                  Đang mở cửa
                </Checkbox>
              </div>

              <Divider className="my-4" />

              {/* Tiện ích */}
              <div className="mb-6">
                <Title level={5} className="text-base font-semibold mb-3">Tiện ích</Title>
                <Checkbox.Group
                  options={facilityOptions}
                  value={filters.facilities}
                  onChange={(values) => handleFilterChange('facilities', values)}
                  className="flex flex-col gap-2"
                />
              </div>
            </div> 
          </Col>
          
          {/* Right content - Search results */}
          <Col xs={24} md={16} lg={18}>
            {/* Sort options */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border border-gray-200">
              <Text className="text-base">Tìm thấy <strong>{filteredFacilities.length}</strong> kết quả</Text>
              <div className="flex items-center">
                <Text className="mr-2">Sắp xếp theo:</Text>
                <Select
                  defaultValue="relevance"
                  style={{ width: 170 }}
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
              <div className="flex justify-center items-center py-12 bg-gray-50 rounded-lg shadow-md border border-gray-200">
                <Spin size="large" />
              </div>
            ) : error ? (
              <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center border border-gray-200">
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
                <Row gutter={[20, 24]}>
                  {getPaginatedFacilities().map(facility => (
                    <Col key={facility.id} xs={24} sm={12} lg={8} className="h-full">
                      <FacilityCard facility={facility} />
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredFacilities.length}
                    onChange={handlePageChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `Tổng cộng ${total} kết quả`}
                    responsive
                  />
                </div>
              </>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg shadow-md border border-gray-200">
                <Empty
                  description="Không tìm thấy kết quả nào phù hợp"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <div className="text-center mt-4">
                  <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                  <Button type="primary" onClick={() => navigate('/')}>
                    Về trang chủ
                  </Button>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ResultSearch;