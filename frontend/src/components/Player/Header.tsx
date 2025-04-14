import { useNavigate } from 'react-router-dom';
import { Select, Dropdown, Button, Badge, Popover, Input, Space, Divider, Modal } from 'antd';
import { 
  BellOutlined, QuestionCircleOutlined, GlobalOutlined, DownOutlined, 
  SearchOutlined, LoginOutlined, TrophyOutlined
} from '@ant-design/icons';
import TopbarProfile from '@/components/LoginModal/TopbarProfile';
import Logo from '@/assets/Logo.svg';
import { useState, useEffect } from 'react';
import type { MenuProps } from 'antd';
import axios from 'axios';
import { sportService } from '@/services/sport.service';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { showLoginModal } from '@/store/slices/userSlice';

const { Option } = Select;
const { Search } = Input;

// Interfaces cho dữ liệu tỉnh/thành phố và quận/huyện
interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
}

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.user);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  
  // States cho dữ liệu từ API
  const [sports, setSports] = useState<{id: number; name: string}[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingSports, setLoadingSports] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Fetch dữ liệu thể thao khi component được mount
  useEffect(() => {
    fetchSports();
    fetchProvinces();
  }, []);

  // Fetch districts khi province thay đổi
  useEffect(() => {
    if (selectedProvince !== 'all') {
      fetchDistricts(selectedProvince);
    } else {
      setDistricts([]);
      setSelectedDistrict('all');
    }
  }, [selectedProvince]);

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

  // Language menu items
  const languageItems: MenuProps['items'] = [
    {
      key: 'vi',
      label: 'Tiếng Việt',
      onClick: () => setLanguage('vi')
    },
    {
      key: 'en',
      label: 'English',
      onClick: () => setLanguage('en')
    }
  ];

  // Mock notifications
  const notificationItems: MenuProps['items'] = [
    {
      key: 'notification-header',
      label: <div className="font-medium">Thông báo mới</div>,
      disabled: true,
      style: { padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }
    },
    {
      key: '1',
      label: (
        <div className="flex flex-col">
          <span>Đặt sân thành công tại TDT Arena</span>
          <span className="text-xs text-gray-500">2 phút trước</span>
        </div>
      )
    },
    {
      key: '2',
      label: (
        <div className="flex flex-col">
          <span>Thanh toán hoàn tất</span>
          <span className="text-xs text-gray-500">15 phút trước</span>
        </div>
      )
    },
    {
      key: '3',
      label: (
        <div className="flex flex-col">
          <span>Nhận được ưu đãi mới</span>
          <span className="text-xs text-gray-500">1 giờ trước</span>
        </div>
      )
    },
    {
      type: 'divider'
    },
    {
      key: 'all',
      label: <div className="text-center text-blue-600 hover:text-blue-800">Xem tất cả</div>
    }
  ];

  // Support menu items
  const supportItems: MenuProps['items'] = [
    {
      key: 'help',
      label: (
        <a href="/help-center" target="_blank" rel="noopener noreferrer">
          Trung tâm trợ giúp
        </a>
      )
    },
    {
      key: 'contact',
      label: (
        <a href="/contact-support" target="_blank" rel="noopener noreferrer">
          Liên hệ hỗ trợ
        </a>
      )
    },
    {
      key: 'faq',
      label: (
        <a href="/faq" target="_blank" rel="noopener noreferrer">
          Câu hỏi thường gặp
        </a>
      )
    }
  ];

  const handleHomeNavigate = () => {
    navigate('/');
  };

  const handleSearch = () => {
    // Tạo query params từ các filter đã chọn
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set('query', searchQuery);
    if (selectedSport !== 'all') queryParams.set('sport', selectedSport);
    if (selectedProvince !== 'all') queryParams.set('province', selectedProvince);
    if (selectedDistrict !== 'all') queryParams.set('district', selectedDistrict);
    
    // Chuyển đến trang kết quả tìm kiếm với filter đã chọn
    navigate(`/search?${queryParams.toString()}`);
  };

  // Reset tất cả filter
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSport('all');
    setSelectedProvince('all');
    setSelectedDistrict('all');
  };

  // Xử lý khi nhấp vào thông báo
  const handleNotificationClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.stopPropagation(); // Ngăn không cho dropdown mở ra
      setLoginPromptVisible(true);
    }
  };

  // Đóng modal thông báo đăng nhập
  const closeLoginPrompt = () => {
    setLoginPromptVisible(false);
  };

  // Chuyển hướng đến trang đăng nhập
  const goToLogin = () => {
    setLoginPromptVisible(false);
    dispatch(showLoginModal({ path: window.location.pathname }));
  };

  // Nội dung tìm kiếm
  const searchContent = (
    <div className="w-80 md:w-96">
      <div className="mb-4">
        <Search
          placeholder="Tìm kiếm sân, địa điểm, môn thể thao..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          enterButton
          className="rounded-lg"
        />
      </div>
      
      <div className="mb-3">
        <div className="font-medium mb-2">Môn thể thao</div>
        <Select 
          value={selectedSport}
          onChange={value => setSelectedSport(value)}
          style={{ width: '100%' }}
          className="rounded-lg"
          loading={loadingSports}
          showSearch
          optionFilterProp="children"
        >
          <Option key="all" value="all">Tất cả môn thể thao</Option>
          {sports.map(sport => (
            <Option key={sport.id.toString()} value={sport.id.toString()}>
              {getSportNameInVietnamese(sport.name)}
            </Option>
          ))}
        </Select>
      </div>
      
      <div className="mb-3">
        <div className="font-medium mb-2">Tỉnh/Thành phố</div>
        <Select 
          value={selectedProvince}
          onChange={value => setSelectedProvince(value)}
          style={{ width: '100%' }}
          className="rounded-lg"
          loading={loadingProvinces}
          showSearch
          optionFilterProp="children"
        >
          <Option key="all" value="all">Tất cả tỉnh/thành phố</Option>
          {provinces.map(province => (
            <Option key={province.code} value={province.code}>
              {province.name}
            </Option>
          ))}
        </Select>
      </div>
      
      <div className="mb-3">
        <div className="font-medium mb-2">Quận/Huyện</div>
        <Select 
          value={selectedDistrict}
          onChange={value => setSelectedDistrict(value)}
          style={{ width: '100%' }}
          className="rounded-lg"
          loading={loadingDistricts}
          disabled={selectedProvince === 'all'}
          showSearch
          optionFilterProp="children"
        >
          <Option key="all" value="all">Tất cả quận/huyện</Option>
          {districts.map(district => (
            <Option key={district.code} value={district.code}>
              {district.name}
            </Option>
          ))}
        </Select>
        {selectedProvince === 'all' && (
          <div className="text-gray-500 text-xs mt-1">
            Vui lòng chọn tỉnh/thành phố trước
          </div>
        )}
      </div>

      <Divider className="my-2" />
      
      <div className="flex justify-end">
        <Space>
          <Button onClick={handleResetFilters}>
            Đặt lại
          </Button>
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Main header */}
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={handleHomeNavigate}>
            <img src={Logo} alt="Logo" className="h-12 md:h-14" />
          </div>
          
          {/* Right side items */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Search */}
            <Popover 
              content={searchContent} 
              title="Tìm kiếm" 
              trigger="click"
              placement="bottom"
              overlayClassName="search-popover"
            >
              <Button 
                type="text" 
                className="flex items-center justify-center text-sm px-3 h-10"
              >
                <SearchOutlined className="text-lg" />
                <span className="hidden md:inline ml-1">Tìm kiếm</span>
              </Button>
            </Popover>

            {/* Notifications */}
            <Dropdown 
              menu={{ items: notificationItems }} 
              trigger={['click']} 
              placement="bottomRight"
              disabled={!isAuthenticated}
            >
              <Button 
                type="text" 
                className="flex items-center justify-center text-sm px-3 h-10" 
                onClick={handleNotificationClick}
              >
                <span className="relative">
                  <BellOutlined className="text-lg" />
                  {isAuthenticated && (
                    <Badge 
                      count={3} 
                      size="small" 
                      className="absolute -top-2 -right-2"
                    />
                  )}
                </span>
                <span className="hidden md:inline ml-1">Thông báo</span>
              </Button>
            </Dropdown>

            {/* Events & Tournaments */}
            <a 
              href="/events" 
              target="_blank" 
              rel="noopener noreferrer"
              className="no-underline"
            >
              <Button 
                type="text" 
                className="flex items-center justify-center text-sm px-3 h-10"
              >
                <TrophyOutlined className="text-lg" />
                <span className="hidden md:inline ml-1">Sự kiện & Giải đấu</span>
              </Button>
            </a>

            {/* Support */}
            <div className="hidden md:block">
              <Dropdown menu={{ items: supportItems }} placement="bottomRight">
                <Button 
                  type="text" 
                  className="flex items-center justify-center text-sm px-3 h-10"
                >
                  <QuestionCircleOutlined className="text-lg" />
                  <span className="ml-1">Hỗ trợ</span>
                </Button>
              </Dropdown>
            </div>

            {/* Language selector */}
            <div className="hidden md:block">
              <Dropdown menu={{ items: languageItems }} placement="bottomRight">
                <Button 
                  type="text" 
                  className="flex items-center justify-center text-sm px-3 h-10"
                >
                  <GlobalOutlined className="text-lg" />
                  <span className="ml-1">{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                  <DownOutlined className="text-xs ml-1" />
                </Button>
              </Dropdown>
            </div>
          
            {/* User Profile - keep this last as it's different */}
            <TopbarProfile />
          </div>
        </div>
      </div>

      {/* Modal thông báo đăng nhập */}
      <Modal
        title="Yêu cầu đăng nhập"
        open={loginPromptVisible}
        onCancel={closeLoginPrompt}
        footer={[
          <Button key="cancel" onClick={closeLoginPrompt}>
            Đóng
          </Button>,
          <Button key="login" type="primary" icon={<LoginOutlined />} onClick={goToLogin}>
            Đăng nhập
          </Button>
        ]}
      >
        <div className="py-4 flex flex-col items-center">
          <BellOutlined className="text-5xl text-blue-500 mb-4" />
          <p className="text-center text-lg mb-2">Bạn cần đăng nhập để xem thông báo</p>
          <p className="text-center text-gray-500">Đăng nhập để không bỏ lỡ các thông báo quan trọng về các đơn đặt sân và các cập nhật mới nhất.</p>
        </div>
      </Modal>
    </header>
  );
};

export default Header;