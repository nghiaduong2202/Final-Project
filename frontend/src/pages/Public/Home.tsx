import { useState } from 'react';
import { Input, Select, DatePicker, Card, Rate, Carousel, Row, Col } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { IMAGE } from '@/constants/user/Home/Image';
import { useNavigate } from 'react-router-dom';
import type { RangePickerProps } from 'antd/es/date-picker';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Interface cho facility data
interface FacilityData {
  id: string;
  name: string;
  thumbnail: string;
  operatingHours: {
    start: string;
    end: string;
  };
  sports: string[];
  address: string;
  rating: number;
  priceRange: {
    min: number;
    max: number;
  };
}

// Interface cho promotion/event data
interface PromotionData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  validUntil: string;
}

interface SearchParamsType {
  sport: string | undefined;
  location: string;
  timeRange: RangePickerProps['value'];
  facilityName: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  // States
  const [searchParams, setSearchParams] = useState<SearchParamsType>({
    sport: undefined,
    location: '',
    timeRange: null,
    facilityName: '',
  });

  // Mock data - sau này sẽ được thay thế bằng API calls
  const topFacilities: FacilityData[] = [
    {
      id: '1',
      name: 'Thể thao 247 - Thủ Đức',
      thumbnail: IMAGE.THUMBNAIL_2,
      operatingHours: { start: '05:00', end: '22:00' },
      sports: ['football', 'basketball', 'badminton'],
      address: 'Phường Linh Trung, Thủ Đức, TP.HCM',
      rating: 4.8,
      priceRange: { min: 200000, max: 500000 },
    },
    {
      id: '2',
      name: 'Thể thao 247 - Thủ Đức',
      thumbnail: IMAGE.THUMBNAIL_2,
      operatingHours: { start: '05:00', end: '22:00' },
      sports: ['football', 'basketball', 'badminton'],
      address: 'Phường Linh Trung, Thủ Đức, TP.HCM',
      rating: 4.8,
      priceRange: { min: 200000, max: 500000 },
    },
    {
      id: '3',
      name: 'Thể thao 247 - Thủ Đức',
      thumbnail: IMAGE.THUMBNAIL_2,
      operatingHours: { start: '05:00', end: '22:00' },
      sports: ['football', 'basketball', 'badminton'],
      address: 'Phường Linh Trung, Thủ Đức, TP.HCM',
      rating: 4.8,  
      priceRange: { min: 200000, max: 500000 }, 
    },
    {
      id: '4',
      name: 'Thể thao 247 - Thủ Đức',
      thumbnail: IMAGE.THUMBNAIL_2,
      operatingHours: { start: '05:00', end: '22:00' }, 
      sports: ['football', 'basketball', 'badminton'],
      address: 'Phường Linh Trung, Thủ Đức, TP.HCM',
      rating: 4.8,
      priceRange: { min: 200000, max: 500000 },
    },
    {
      id: '5',
      name: 'Thể thao 247 - Thủ Đức',
      thumbnail: IMAGE.THUMBNAIL_2,
      operatingHours: { start: '05:00', end: '22:00' },
      sports: ['football', 'basketball', 'badminton'],  
      address: 'Phường Linh Trung, Thủ Đức, TP.HCM',
      rating: 4.8,
      priceRange: { min: 200000, max: 500000 },
    },
    
    
    

    // Thêm các facilities khác...
  ];

  const promotions: PromotionData[] = [
    {
      id: '1',
      title: 'Giảm 30% giờ vàng',
      description: 'Áp dụng cho tất cả các môn thể thao từ 13h-16h',
      thumbnail: IMAGE.THUMBNAIL_2,
      validUntil: '2024-04-30',
    },
    {
      id: '2',
      title: 'Giảm 30% giờ vàng',
      description: 'Áp dụng cho tất cả các môn thể thao từ 13h-16h',
      thumbnail: IMAGE.THUMBNAIL_2,
      validUntil: '2024-04-30',
    },
    {
      id: '3',
      title: 'Giảm 30% giờ vàng',
      description: 'Áp dụng cho tất cả các môn thể thao từ 13h-16h',
      thumbnail: IMAGE.THUMBNAIL_2,
      validUntil: '2024-04-30',
    },
    {
      id: '4',
      title: 'Giảm 30% giờ vàng',
      description: 'Áp dụng cho tất cả các môn thể thao từ 13h-16h',
      thumbnail: IMAGE.THUMBNAIL_2,
      validUntil: '2024-04-30',
    },
    {
      id: '5',
      title: 'Giảm 30% giờ vàng',
      description: 'Áp dụng cho tất cả các môn thể thao từ 13h-16h',
      thumbnail: IMAGE.THUMBNAIL_2,
      validUntil: '2024-04-30',
    },
    {
      id: '6',
      title: 'Giảm 30% giờ vàng',
      description: 'Áp dụng cho tất cả các môn thể thao từ 13h-16h',
      thumbnail: IMAGE.THUMBNAIL_2,
      validUntil: '2024-04-30',
    },
    
    // Thêm các promotions khác...
  ];

  // Search section component
  const SearchSection = () => (
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                    bg-white p-4 md:p-6 rounded-lg shadow-lg w-[95%] md:w-[90%] lg:w-[80%] max-w-7xl z-10">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Select
            placeholder="Chọn môn thể thao"
            style={{ width: '100%' }}
            onChange={(value) => setSearchParams(prev => ({ ...prev, sport: value }))}
          >
            <Option value="football">Bóng đá</Option>
            <Option value="basketball">Bóng rổ</Option>
            <Option value="badminton">Cầu lông</Option>
            {/* Thêm các môn khác */}
          </Select>
        </Col>
        <Col xs={24} md={6}>
          <Input 
            prefix={<EnvironmentOutlined />}
            placeholder="Địa điểm"
            onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
          />
        </Col>
        <Col xs={24} md={8}>
          <RangePicker 
            style={{ width: '100%' }}
            showTime
            format="YYYY-MM-DD HH:mm"
            onChange={(dates) => {
              if (dates) {
                setSearchParams(prev => ({ ...prev, timeRange: dates }));
              }
            }}
          />
        </Col>
        <Col xs={24} md={4}>
          <button onClick={() => {
              // Sử dụng searchParams nếu cần
              console.log(searchParams);
              navigate(`/result-search`);
          }} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300">
            Tìm kiếm
          </button>
        </Col>
      </Row>
    </div>
  );

  // Facility Card component
  const FacilityCard = ({ facility }: { facility: FacilityData }) => (
    <Card 
      hoverable 
      className="w-full h-full"
      cover={<img alt={facility.name} src={facility.thumbnail} className="h-48 object-cover w-full" />}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-600 text-sm">
          {facility.operatingHours.start} - {facility.operatingHours.end}
        </span>
        <Rate disabled defaultValue={facility.rating} className="text-sm" />
      </div>
      <h3 className="text-base md:text-lg font-semibold mb-2 line-clamp-2">{facility.name}</h3>
      <div className="flex gap-2 mb-2">
        {facility.sports.map(sport => (
          <img key={sport} src={`/assets/${sport}.svg`} alt={sport} className="w-5 h-5" />
        ))}
      </div>
      <p className="text-gray-600 mb-2 text-sm line-clamp-1">{facility.address}</p>
      <p className="text-blue-600 font-semibold text-sm">
        {facility.priceRange.min.toLocaleString()}đ - {facility.priceRange.max.toLocaleString()}đ
      </p>
    </Card>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px] mb-24 sm:mb-20">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGE.THUMBNAIL})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40">
            <div className="w-full h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 w-full">
                <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold max-w-2xl">
                  TAN SPORTS <br />Hệ thống hỗ trợ đặt sân thể thao hàng đầu
                </h1>
              </div>
            </div>
          </div>
        </div>
        <SearchSection />
      </div>

      {/* Promotions Section */}
      <section className="w-full px-4 mb-12 md:mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Ưu đãi & Sự kiện</h2>
          <Carousel 
            autoplay
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
            className="mx-[-8px]"
          >
            {promotions.map(promo => (
              <div key={promo.id} className="px-2">
                <Card 
                  hoverable
                  className="w-full h-full"
                  cover={
                    <div className="h-36 sm:h-48 overflow-hidden">
                      <img 
                        alt={promo.title} 
                        src={promo.thumbnail}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  }
                >
                  <Card.Meta
                    title={<div className="text-base font-semibold line-clamp-1">{promo.title}</div>}
                    description={<div className="text-sm line-clamp-2">{promo.description}</div>}
                  />
                  <p className="mt-2 text-red-500 text-xs">
                    Có hiệu lực đến: {new Date(promo.validUntil).toLocaleDateString()}
                  </p>
                </Card>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Top Facilities Section */}
      <section className="w-full px-4 mb-12 md:mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Cơ sở hàng đầu</h2>
          <Carousel 
            autoplay
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
            className="mx-[-8px]"
          >
            {topFacilities.map(facility => (
              <div key={facility.id} className="px-2">
                <FacilityCard facility={facility} />
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Recommended Facilities Section */}
      <section className="w-full px-4 mb-12 md:mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Đề xuất cho bạn</h2>
          <Row gutter={[16, 16]}>
            {topFacilities.slice(0, 4).map(facility => (
              <Col key={facility.id} xs={24} sm={12} lg={6}>
                <FacilityCard facility={facility} />
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </div>
  );
};

export default HomePage;