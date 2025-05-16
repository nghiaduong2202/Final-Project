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
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { sportService } from '@/services/sport.service';
import { Facility } from '@/types/facility.type';
import './ResultSearch.css';
import OperatingHoursDisplay from '@/components/shared/OperatingHoursDisplay';
import { searchService, SearchParams } from '@/services/search.service';

const { Title, Text } = Typography;

// Interface for facility data
interface FacilityData extends Facility {
  numberOfRatings: number;
}

const ResultSearch: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // Xử lý sportIds từ URL params
  const sportParam = queryParams.get('sport') || '';
  let sportIdsArray: number[] = [];
  
  try {
    // Cố gắng parse chuỗi JSON từ URL
    if (sportParam) {
      sportIdsArray = JSON.parse(sportParam);
      // Đảm bảo là mảng số nguyên
      if (!Array.isArray(sportIdsArray)) {
        sportIdsArray = [];
      }
    }
  } catch (e) {
    console.error('Lỗi khi parse sportIds:', e);
    sportIdsArray = [];
  }

  // States
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: queryParams.get('query') || '',
    sportIds: sportIdsArray.length > 0 ? sportIdsArray : undefined,
    province: queryParams.get('province') || undefined,
    district: queryParams.get('district') || undefined,
  });

  const [filters, setFilters] = useState({
    sports: [] as string[],
    priceRange: [0, 1000000] as [number, number],
    rating: 0,
  });

  const [sortBy, setSortBy] = useState<string>('rating'); // UI hiển thị "rating" nhưng API sẽ dùng avgRating
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalResults, setTotalResults] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000); // Giá cao nhất từ dữ liệu
  
  // States for data and API data
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [allFacilities, setAllFacilities] = useState<FacilityData[]>([]); // Lưu tất cả dữ liệu gốc
  const [sports, setSports] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSports, setLoadingSports] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lắng nghe sự thay đổi trong URL khi location thay đổi
  useEffect(() => {
    // Lấy các tham số mới từ URL
    const newQueryParams = new URLSearchParams(location.search);
    const newQuery = newQueryParams.get('query') || '';
    const newProvince = newQueryParams.get('province') || undefined;
    const newDistrict = newQueryParams.get('district') || undefined;
    
    // Xử lý sportIds từ URL params
    let newSportIdsArray: number[] = [];
    const newSportParam = newQueryParams.get('sport') || '';
    
    try {
      if (newSportParam) {
        newSportIdsArray = JSON.parse(newSportParam);
        if (!Array.isArray(newSportIdsArray)) {
          newSportIdsArray = [];
        }
      }
    } catch (e) {
      console.error('Lỗi khi parse sportIds từ URL mới:', e);
      newSportIdsArray = [];
    }
    
    // Cập nhật searchParams với giá trị mới từ URL
    setSearchParams({
      query: newQuery,
      sportIds: newSportIdsArray.length > 0 ? newSportIdsArray : undefined,
      province: newProvince,
      district: newDistrict,
      page: 1, // Reset về trang 1 khi có tìm kiếm mới
    });
    
    // Set UI sortBy luôn giữ giá trị 'rating'
    setSortBy('rating');
    
    // Reset currentPage khi params thay đổi
    setCurrentPage(1);
  }, [location.search]);

  // Fetch facilities khi searchParams thay đổi
  useEffect(() => {
    fetchFacilities();
    fetchSports();
  }, [searchParams]);

  // Sắp xếp dữ liệu khi component mount lần đầu
  useEffect(() => {
    // Mặc định sắp xếp theo rating khi component mount
    setSortBy('rating');
  }, []);

  // Fetch facilities using search API with potential override params
  const fetchFacilities = async (overrideParams?: SearchParams) => {
    setLoading(true);
    try {
      // Cập nhật các tham số tìm kiếm
      const apiParams: SearchParams = {
        ...(overrideParams || searchParams),
        page: currentPage,
        limit: pageSize,
      };
      
      // Thêm minRating nếu có lọc theo đánh giá
      if (filters.rating > 0) {
        apiParams.minRating = filters.rating;
      }
      
      // Nếu không có override, sử dụng filter sports hiện tại
      if (!overrideParams && filters.sports.length > 0) {
        // Lấy ID của các sport đã chọn
        const sportIdsArray = filters.sports.map(sportName => {
          const sport = sports.find(s => s.name === sportName);
          return sport ? sport.id : undefined;
        }).filter((id): id is number => id !== undefined);
        
        if (sportIdsArray.length > 0) {
          apiParams.sportIds = sportIdsArray;
        }
      }
      
      // Gọi API search
      const facilitiesData = await searchService.searchFacilities(apiParams);
      
      // Map to FacilityData format (adding numberOfRatings)
      const mappedFacilities: FacilityData[] = facilitiesData.map(facility => ({
        ...facility,
        numberOfRatings: facility.numberOfRating
      }));
      
      // Tìm giá cao nhất từ dữ liệu
      const highestPrice = Math.max(...mappedFacilities.map(f => f.maxPrice || 0));
      setMaxPrice(highestPrice > 0 ? highestPrice : 1000000);
      
      // Cập nhật filters.priceRange.max nếu cần
      if (filters.priceRange[1] > highestPrice && highestPrice > 0) {
        setFilters(prev => ({
          ...prev,
          priceRange: [prev.priceRange[0], highestPrice]
        }));
      }
      
      // Lưu tất cả dữ liệu gốc
      setAllFacilities(mappedFacilities);
      
      // Sắp xếp dữ liệu phía client dựa trên sortBy
      const sortedFacilities = sortFacilities(mappedFacilities, sortBy);
      
      setFacilities(sortedFacilities);
      setTotalResults(sortedFacilities.length); // Cập nhật tổng số kết quả
      setError(null);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Không thể tải dữ liệu cơ sở thể thao. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm sắp xếp facilities dựa trên sortBy
  const sortFacilities = (data: FacilityData[], sortType: string): FacilityData[] => {
    const sortedData = [...data]; // Tạo bản sao để tránh thay đổi dữ liệu gốc
    
    switch (sortType) {
      case 'rating':
        // Sắp xếp theo avgRating giảm dần
        return sortedData.sort((a, b) => b.avgRating - a.avgRating);
      case 'priceAsc':
        // Sắp xếp theo minPrice tăng dần
        return sortedData.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
      case 'priceDesc':
        // Sắp xếp theo minPrice giảm dần
        return sortedData.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
      default:
        // Mặc định sắp xếp theo avgRating giảm dần
        return sortedData.sort((a, b) => b.avgRating - a.avgRating);
    }
  };

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

  // Xử lý thay đổi filter
  const handleFilterChange = (filterName: string, value: string[] | [number, number] | number | boolean | string | number[]) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));

    // Reset về trang 1 khi thay đổi filter
    setCurrentPage(1);
    
    // Cập nhật searchParams khi filter thay đổi
    if (filterName === 'rating' && typeof value === 'number') {
      setSearchParams(prev => ({
        ...prev,
        minRating: value > 0 ? value : undefined,
      }));
      
      // Gọi API khi thay đổi rating
      fetchFacilities({
        ...searchParams,
        minRating: value > 0 ? value : undefined,
        page: 1
      });
    } else if (filterName === 'sports' && Array.isArray(value)) {
      // Khi filter sports thay đổi
      const sportIdsArray = value.map(sportName => {
        const sport = sports.find(s => s.name === sportName);
        return sport ? sport.id : undefined;
      }).filter((id): id is number => id !== undefined);
      
      // Cập nhật searchParams
      setSearchParams(prev => ({
        ...prev,
        sportIds: sportIdsArray.length > 0 ? sportIdsArray : undefined,
      }));
      
      // Gọi API với tham số mới
      fetchFacilities({
        ...searchParams,
        sportIds: sportIdsArray.length > 0 ? sportIdsArray : undefined,
        page: 1
      });
    } else if (filterName === 'priceRange' && Array.isArray(value) && value.length === 2) {
      // Khi thay đổi khoảng giá, chỉ áp dụng filter phía client
      if (allFacilities.length > 0) {
        // Lọc theo giá
        const filteredByPrice = allFacilities.filter(facility => {
          const facilityMinPrice = facility.minPrice || 0;
          return facilityMinPrice >= (value[0] as number) && facilityMinPrice <= (value[1] as number);
        });
        
        const sortedData = sortFacilities(filteredByPrice, sortBy);
        setFacilities(sortedData);
        setTotalResults(filteredByPrice.length);
      }
    }
  };

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (value: string) => {
    setSortBy(value);
    
    // Sắp xếp lại dữ liệu hiện tại mà không cần gọi lại API
    const sortedFacilities = sortFacilities(facilities, value);
    setFacilities(sortedFacilities);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
    
    // Gọi API với trang mới
    fetchFacilities({
      ...searchParams,
      page,
      limit: pageSize || 12
    });
  };

  // Xử lý click vào facility
  const handleFacilityClick = (facilityId: string) => {
    navigate(`/facility/${facilityId}`);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: 'Kết quả tìm kiếm',
    },
  ];

  // Xử lý reset filter
  const handleResetFilters = () => {
    setFilters({
      sports: [],
      priceRange: [0, maxPrice],
      rating: 0,
    });
    
    // Reset search params về mặc định nhưng giữ lại query từ URL
    const resetParams = {
      query: queryParams.get('query') || '',
      sportIds: undefined,
      province: queryParams.get('province') || undefined,
      district: queryParams.get('district') || undefined,
      page: 1,
    };
    
    setSearchParams(resetParams);
    
    // Gọi API với tham số đã reset
    fetchFacilities(resetParams);
    
    setCurrentPage(1);
  };

  // Hiển thị tên các thể thao đã chọn
  const getSelectedSportsText = () => {
    if (!searchParams.sportIds || !sports.length) return '';
    
    const selectedSports = searchParams.sportIds.map(id => {
      const sport = sports.find(s => s.id === id);
      return sport ? getSportNameInVietnamese(sport.name) : '';
    }).filter(name => name !== '');
    
    if (selectedSports.length === 0) return '';
    
    if (selectedSports.length === 1) {
      return ` - Môn: ${selectedSports[0]}`;
    } else {
      return ` - Môn: ${selectedSports[0]} và ${selectedSports.length - 1} môn khác`;
    }
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
            {searchParams.sportIds ? getSelectedSportsText() : ''}
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
                  onClick={handleResetFilters}
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
                  max={maxPrice}
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
            </div> 
          </Col>
          
          {/* Right content - Search results */}
          <Col xs={24} md={16} lg={18}>
            {/* Sort options */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border border-gray-200">
              <Text className="text-base">Tìm thấy <strong>{totalResults}</strong> kết quả</Text>
              <div className="flex items-center">
                <Text className="mr-2">Sắp xếp theo:</Text>
                <Select
                  value={sortBy}
                  style={{ width: 170 }}
                  onChange={handleSortChange}
                  size="middle"
                  options={[                    
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
                  onClick={() => fetchFacilities()}
                >
                  Thử lại
                </Button>
              </div>
            ) : facilities.length > 0 ? (
              <>
                <Row gutter={[20, 24]}>
                  {facilities.map(facility => (
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
                    total={totalResults}
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