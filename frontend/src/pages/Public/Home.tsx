import { useState, useEffect, useRef } from 'react';
import { Select, Card, Carousel, Tag, Empty } from 'antd';
import { EnvironmentOutlined, StarOutlined, DollarOutlined } from '@ant-design/icons';
import { IMAGE } from '@/constants/user/Home/Image';
import { useNavigate } from 'react-router-dom';
import { sportService } from '@/services/sport.service';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { useAppSelector } from '@/hooks/reduxHooks';
import axios from 'axios';
import { mockFacilities } from '@/mocks/facility/mockFacilities';
import { Facility } from '@/types/facility.type';
import { Sport } from '@/types/sport.type';
import './Home.css'; // Import custom CSS file for carousel
import { facilityService } from '@/services/facility.service';
import { voucherService } from '@/services/voucher.service';
import OperatingHoursDisplay from '@/components/shared/OperatingHoursDisplay';
import { VoucherData } from '@/types/voucher.type';
const { Option } = Select;

// Interface cho dữ liệu tỉnh/thành phố và quận/huyện
interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
}

interface SearchParamsType {
  sportIds: number[];
  query: string;
  province: string;
  district: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.user);
  const queryInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [searchParams, setSearchParams] = useState<SearchParamsType>({
    sportIds: [],
    query: '',
    province: 'all',
    district: 'all'
  });
  
  // States cho dữ liệu từ API
  const [sports, setSports] = useState<Sport[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingSports, setLoadingSports] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [topRatedFacilities, setTopRatedFacilities] = useState<Facility[]>([]);
  const [recommendedFacilities, setRecommendedFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [sixVouchers, setSixVouchers] = useState<VoucherData[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  useEffect(() => {
    fetchSixVouchers();
  }, []);

  useEffect(() => {
    fetchSports();
    fetchProvinces();
    fetchTopRatedFacilities();    
    
    // Nếu đã đăng nhập, fetch recommended facilities
    if (isAuthenticated) {
      fetchRecommendedFacilities();
    } else {
      // Sử dụng mock data nếu chưa đăng nhập
      setRecommendedFacilities(mockFacilities.slice(0, 4));
    }
  }, [isAuthenticated]);

  // Fetch districts khi province thay đổi
  useEffect(() => {
    if (searchParams.province !== 'all') {
      // Tìm code của province
      const selectedProvince = provinces.find(p => p.name === searchParams.province);
      if (selectedProvince) {
        fetchDistricts(selectedProvince.code);
      }
    } else {
      setDistricts([]);
      setSearchParams(prev => ({ ...prev, district: 'all' }));
    }
  }, [searchParams.province, provinces]);

  // Fetch danh sách các môn thể thao
  const fetchSports = async () => {
    try {
      setLoadingSports(true);
      const response = await sportService.getSport();
      setSports(response);
    } catch (error) {
      console.error('Error fetching sports:', error);
    } finally {
      setLoadingSports(false);
    }
  };

  // Fetch danh sách tỉnh/thành phố
  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await axios.get('https://provinces.open-api.vn/api/p/');
      setProvinces(response.data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Fetch danh sách quận/huyện
  const fetchDistricts = async (provinceCode: string) => {
    try {
      setLoadingDistricts(true);
      const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      setDistricts(response.data.districts);
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch cơ sở thể thao có điểm đánh giá cao nhất
  const fetchTopRatedFacilities = async () => {
    try {
      setLoading(true);
      const topFacilities = await facilityService.getFacilityTop();
      setTopRatedFacilities(topFacilities);
    } catch (error) {
      console.error('Error fetching top rated facilities:', error);
      // Fallback to mock data in case of error
      const sortedFacilities = [...mockFacilities].sort((a, b) => b.avgRating - a.avgRating);
      setTopRatedFacilities(sortedFacilities.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  // Fetch 6 vouchers
  const fetchSixVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const response = await voucherService.getSixVouchers();
      setSixVouchers(response);
    } catch (error) {
      console.error('Error fetching six vouchers:', error);
      // Use empty array in case of error
      setSixVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  };

  // Fetch cơ sở thể thao được đề xuất cho người dùng đã đăng nhập
  const fetchRecommendedFacilities = async () => {
    try {
      setLoading(true);
      // Trong tương lai sẽ call API thực tế để lấy cơ sở mà user đã từng đặt
      // const response = await facilityService.getRecommendedFacilities();
      // setRecommendedFacilities(response.data);
      
      // Hiện tại sử dụng mock data
      setRecommendedFacilities(mockFacilities.slice(0, 4));
    } catch (error) {
      console.error('Error fetching recommended facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    // Lấy giá trị từ input ref
    const queryValue = queryInputRef.current?.value || '';
    
    // Tạo query params từ các filter đã chọn
    const queryParams = new URLSearchParams();
    if (queryValue) queryParams.set('query', queryValue);
    
    // Xử lý sportIds - có thể cần xử lý đặc biệt nếu có cả string và number
    if (searchParams.sportIds.length > 0) {
      // Đảm bảo tất cả đều là số
      const sportIdsArray = searchParams.sportIds.map(id => 
        typeof id === 'string' ? parseInt(id) : id
      );
      queryParams.set('sport', JSON.stringify(sportIdsArray));
    }
    
    if (searchParams.province !== 'all') queryParams.set('province', searchParams.province);
    if (searchParams.district !== 'all') queryParams.set('district', searchParams.district);
    
    // Chuyển đến trang kết quả tìm kiếm với filter đã chọn
    navigate(`/result-search?${queryParams.toString()}`);
  };

  // Reset tất cả filter - giữ lại để sử dụng trong tương lai
  const handleResetFilters = () => {
    setSearchParams({
      query: '',
      sportIds: [],
      province: 'all',
      district: 'all'
    });
    
    // Reset input value
    if (queryInputRef.current) {
      queryInputRef.current.value = '';
    }
  };

  // Handle key press for search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Search section component
  const SearchSection = () => (
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                    bg-white p-4 md:p-6 rounded-lg shadow-xl border border-gray-200 w-[95%] md:w-[90%] lg:w-[80%] max-w-7xl z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h3 className="text-xl font-semibold text-left text-blue-800">Tìm kiếm cơ sở thể thao</h3>
        <button 
          onClick={handleResetFilters} 
          className="text-blue-500 text-sm hover:text-blue-700 mt-1 md:mt-0"
        >
          Xóa bộ lọc
        </button>
      </div>
      
      {/* Hàng 1: Input tìm kiếm tên/địa chỉ */}
      <div className="mb-4">
        <div className="mb-1 text-sm font-medium">Tên cơ sở/Địa chỉ</div>
        <input
          ref={queryInputRef}
          type="text"
          placeholder="Nhập tên cơ sở hoặc địa chỉ"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
          defaultValue={searchParams.query}
          onKeyPress={handleKeyPress}
        />
      </div>
      
      {/* Hàng 2: Các bộ lọc khác */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Khối filter */}
        <div className="flex-grow flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="mb-1 text-sm font-medium">Môn thể thao</div>
            <Select
              mode="multiple"
              placeholder="Chọn môn thể thao"
              style={{ width: '100%' }}
              onChange={(values) => {
                // Chuyển đổi giá trị string sang number
                const numericValues = values.map(value => parseInt(value.toString()));
                setSearchParams(prev => ({ ...prev, sportIds: numericValues }));
              }}
              value={searchParams.sportIds.map(id => id.toString())}
              loading={loadingSports}
              showSearch
              optionFilterProp="children"
              maxTagCount={2}
              allowClear
            >
              {sports.map(sport => (
                <Option key={sport.id.toString()} value={sport.id.toString()}>
                  {getSportNameInVietnamese(sport.name)}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <div className="mb-1 text-sm font-medium">Tỉnh/Thành phố</div>
            <Select
              placeholder="Chọn tỉnh/thành phố"
              style={{ width: '100%' }}
              onChange={(value) => setSearchParams(prev => ({ ...prev, province: value }))}
              value={searchParams.province}
              loading={loadingProvinces}
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">Tất cả tỉnh/thành phố</Option>
              {provinces.map(province => (
                <Option key={province.code} value={province.name}>
                  {province.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <div className="mb-1 text-sm font-medium">Quận/Huyện</div>
            <Select
              placeholder="Chọn quận/huyện"
              style={{ width: '100%' }}
              onChange={(value) => setSearchParams(prev => ({ ...prev, district: value }))}
              value={searchParams.district}
              loading={loadingDistricts}
              showSearch
              optionFilterProp="children"
              disabled={searchParams.province === 'all'}
            >
              <Option value="all">Tất cả quận/huyện</Option>
              {districts.map(district => (
                <Option key={district.code} value={district.name}>
                  {district.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* Khối nút tìm kiếm */}
        <div className="flex items-end">
          <button 
            onClick={handleSearch} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg transition w-full md:w-[180px]"
          >
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );

  // Facility Card component
  const FacilityCard = ({ facility }: { facility: Facility }) => (
    <Card 
      hoverable 
      className="w-full h-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
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
      onClick={() => navigate(`/facility/${facility.id}`)}
      style={{ padding: '12px 16px' }}
    >
      <div className="p-1 h-full flex flex-col">
        {/* Tên cơ sở */}
        <h3 className="text-base sm:text-lg font-semibold line-clamp-1 mb-1 sm:mb-2">{facility.name}</h3>
        
        {/* Giờ hoạt động và Rating */}
        <div className="flex items-center text-gray-500 mb-1 sm:mb-2 text-xs sm:text-sm">
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
        <div className="mb-1 sm:mb-2 h-6">
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
        <div className="flex items-start mb-1 sm:mb-2 text-gray-600">
          <EnvironmentOutlined className="mr-1 sm:mr-2 mt-0.5 flex-shrink-0 text-xs sm:text-sm" />
          <p className="line-clamp-1 text-xs sm:text-sm">{facility.location}</p>
        </div>
        
        {/* Khoảng giá */}
        <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm mt-auto">
          <DollarOutlined className="mr-1 sm:mr-2 text-green-600" />
          {facility.minPrice !== undefined && facility.maxPrice !== undefined ? (
            <>
              <span className="text-blue-600 font-medium">
                {facility.minPrice.toLocaleString('vi-VN')}đ - {facility.maxPrice.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-gray-500 text-xs ml-1">/giờ</span>
            </>
          ) : facility.fieldGroups && facility.fieldGroups.length > 0 ? (
            <>
              <span className="text-blue-600 font-medium">
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
    <div className="min-h-screen ">
      {/* Hero Section with Search */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px] sm:mb-48 md:mb-36">
        <Carousel 
          autoplay 
          dots={false}
          autoplaySpeed={5000}
          effect="fade"
          className="w-full h-full"
        >
          <div>
            <div 
              className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-cover bg-center"
              style={{ backgroundImage: `url(${IMAGE.THUMBNAIL})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40">
                <div className="w-full h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="bg-black bg-opacity-50 p-6 rounded-lg shadow-lg inline-block backdrop-blur-sm">
                      <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">TAN SPORTS</h1>
                      <p className="text-gray-200 text-lg sm:text-xl md:text-2xl mt-2">Hệ thống hỗ trợ đặt sân thể thao hàng đầu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div 
              className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-cover bg-center"
              style={{ backgroundImage: `url(${IMAGE.THUMBNAIL_2})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40">
                <div className="w-full h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="bg-black bg-opacity-50 p-6 rounded-lg shadow-lg inline-block backdrop-blur-sm">
                      <h1 className="text-white text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">TÌM SÂN DỄ DÀNG</h1>
                      <p className="text-gray-200 text-lg sm:text-xl md:text-2xl mt-2">Đặt sân tiện lợi mọi lúc mọi nơi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Carousel>
        <SearchSection />
      </div>

      {/* Vouchers Section */}
      <section className="w-full px-4 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Mã giảm giá đang diễn ra
            </h2>
            <p className="text-gray-600 mt-2">Các mã giảm giá đang diễn ra gần nhất trong tháng 5/2025</p>
          </div>
          {loadingVouchers ? (
            <div className="flex justify-center items-center p-12">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : sixVouchers.length > 0 ? (
            <Carousel 
              arrows
              slidesToShow={4}
              responsive={[
                {
                  breakpoint: 1280,
                  settings: {
                    slidesToShow: 3,
                  }
                },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                  }
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 1,
                  }
                }
              ]}
              className="custom-carousel"
            >
              {sixVouchers.map(voucher => (
                <div key={voucher.id} className="px-2">
                  <Card 
                    hoverable
                    className="w-full h-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                    cover={
                      <div className="h-36 sm:h-48 overflow-hidden">
                        <img 
                          alt={voucher.name} 
                          src={voucher.facility.imagesUrl[0]}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    }
                  >
                    <div className="h-full flex flex-col">
                      <Card.Meta
                        title={<div className="text-base font-semibold line-clamp-1">{voucher.name}</div>}
                        description={<div className="text-sm line-clamp-1">
                          {voucher.voucherType === 'cash' 
                            ? `Giảm ${voucher.discount.toLocaleString('vi-VN')}đ` 
                            : `Giảm ${voucher.discount}%`}
                          {' - '}{voucher.facility.name}
                        </div>}
                      />
                      <p className="mt-2 text-red-500 text-xs">
                        Có hiệu lực: {new Date(voucher.startDate).toLocaleDateString()} - {new Date(voucher.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </Carousel>
          ) : (
            <Empty description="Không có mã giảm giá nào" />
          )}
        </div>
      </section>

      {/* Top Facilities Section */}
      <section className="w-full px-4 pt-10 pb-14 bg-gray-50 rounded-lg shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Cơ sở hàng đầu
            </h2>
            <p className="text-gray-600 mt-2">Những cơ sở thể thao được đánh giá cao nhất với chất lượng dịch vụ tốt nhất</p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : topRatedFacilities.length > 0 ? (
            <Carousel 
              arrows
              slidesToShow={4}
              responsive={[
                {
                  breakpoint: 1280,
                  settings: {
                    slidesToShow: 3,
                  }
                },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                  }
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 1,
                  }
                }
              ]}
              className="custom-carousel mx-[-8px]"
            >
              {topRatedFacilities.map(facility => (
                <div key={facility.id} className="px-2">
                  <FacilityCard facility={facility} />
                </div>
              ))}
            </Carousel>
          ) : (
            <Empty description="Không có dữ liệu cơ sở thể thao" />
          )}
        </div>
      </section>

      {/* Recommended Facilities Section */}
      <section className="w-full px-4 mb-12 md:mb-16 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Đề xuất cho bạn
            </h2>
            <p className="text-gray-600 mt-2">Các cơ sở thể thao phù hợp với sở thích và hoạt động của bạn</p>
          </div>
          {isAuthenticated ? (
            loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="spinner-border" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : recommendedFacilities.length > 0 ? (
              <Carousel
                arrows
                slidesToShow={4}
                responsive={[
                  {
                    breakpoint: 1280,
                    settings: {
                      slidesToShow: 3,
                    }
                  },
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: 2,
                    }
                  },
                  {
                    breakpoint: 640,
                    settings: {
                      slidesToShow: 1,
                    }
                  }
                ]}
                className="custom-carousel mx-[-8px]"
              >
                {recommendedFacilities.map(facility => (
                  <div key={facility.id} className="px-2">
                    <FacilityCard facility={facility} />
                  </div>
                ))}
              </Carousel>
            ) : (
              <Empty description="Không có đề xuất nào cho bạn" />
            )
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Vui lòng đăng nhập để xem các đề xuất phù hợp với bạn</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;