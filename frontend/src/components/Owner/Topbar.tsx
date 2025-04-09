import React, { useState } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { ICONS } from '@/constants/owner/topbar/topbar';
import TopbarProfile from '../LoginModal/TopbarProfile';
import NotificationIcon from '../Notification/NotificationIcon';
import { Dropdown, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

interface TopBarProps {
  className?: string;
}

// Các pattern route cần kiểm tra, từ cụ thể đến tổng quát
const ROUTE_PATTERNS = [
  '/owner/facility-management',
  '/owner/service-management',
  '/owner/voucher-management',
  '/owner/field-group-management',
  '/owner/dashboard',
  '/owner/event-management',
  '/owner',
];

// Tiêu đề tương ứng cho mỗi route
const ROUTE_TITLES: Record<string, string> = {
  '/owner/facility-management': 'Quản lý cơ sở',
  '/owner/service-management': 'Quản lý dịch vụ',
  '/owner/voucher-management': 'Quản lý voucher',
  '/owner/field-group-management': 'Quản lý nhóm sân',
  '/owner/dashboard': 'Tổng quan',
  '/owner/event-management': 'Quản lý sự kiện',
  '/owner': 'Tổng quan',
};

// Danh sách ngôn ngữ có sẵn
const LANGUAGES = [
  { name: 'Tiếng Việt', code: 'vi', flag: ICONS.VIETNAM },
  { name: 'English', code: 'en', flag: ICONS.ENGLISH },
];

const TopBar: React.FC<TopBarProps> = () => {
  const location = useLocation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Lấy title dựa trên current route, sử dụng matchPath để kiểm tra các route có tham số
  const getRouteTitle = () => {
    // Kiểm tra các pattern từ cụ thể đến tổng quát
    for (const pattern of ROUTE_PATTERNS) {
      if (matchPath({ path: pattern }, location.pathname)) {
        return ROUTE_TITLES[pattern];
      }
    }
    return 'Lịch đặt sân'; // Mặc định
  };

  const currentTitle = getRouteTitle();

  const handleLanguageSelect = (language: typeof LANGUAGES[0]) => {
    setSelectedLanguage(language);
    setIsLanguageOpen(false);
  };

  // Items for mobile dropdown menu
  const mobileMenuItems = [
    {
      key: 'language',
      label: (
        <Dropdown
          menu={{
            items: LANGUAGES.map(lang => ({
              key: lang.code,
              label: (
                <div className="flex items-center gap-2" onClick={() => handleLanguageSelect(lang)}>
                  <img src={lang.flag} alt={lang.name} className="w-5 h-4" />
                  <span>{lang.name}</span>
                </div>
              )
            }))
          }}
          placement="bottomRight"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <img src={selectedLanguage.flag} alt={selectedLanguage.name} className="w-5 h-4" />
              <span>{selectedLanguage.name}</span>
            </div>
            <RightOutlined />
          </div>
        </Dropdown>
      )
    }
  ];

  return (
    <div className="bg-white border-b border-[#e8e8e8] py-0 px-4 md:px-[30px] h-[75px] box-border">
      <div className="flex items-center justify-between h-full">
        {/* Title - responsive text size */}
        <div className="flex items-center gap-2.5 pl-10 md:pl-0 flex-shrink-0 overflow-visible">
          <h1 className="font-sans font-bold text-lg md:text-2xl lg:text-[29px] tracking-[1px] text-black leading-normal m-0 break-normal">
            {currentTitle}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-[30px] flex-shrink-0 ml-4">
          {/* Notification Icon - always visible */}
          <NotificationIcon />

          {/* Language Selector - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 cursor-pointer"
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}>
            <img src={selectedLanguage.flag} alt={selectedLanguage.name} />
            <div className="flex items-center gap-[5px] font-nunito text-sm font-semibold text-[#646464]">
              <span>{selectedLanguage.name}</span>
              <img 
                src={ICONS.DROPDOWN} 
                alt="Dropdown"
                className={`transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>

          {/* Language Dropdown - desktop */}
          {isLanguageOpen && (
            <div className="absolute top-[75px] right-4 md:right-[30px] mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-[160px] z-[1000] hidden md:block">
              {LANGUAGES.map((language) => (
                <div
                  key={language.code}
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer
                    ${selectedLanguage.code === language.code ? 'bg-gray-50' : ''}`}
                  onClick={() => handleLanguageSelect(language)}
                >
                  <img src={language.flag} alt={language.name} className="w-5 h-4" />
                  <span className="font-nunito text-sm text-[#646464]">{language.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Mobile menu button - visible only on small screens */}
          <div className="md:hidden">
            <Dropdown 
              menu={{ 
                items: mobileMenuItems,
                onClick: () => setIsDropdownOpen(false)
              }}
              trigger={['click']}
              onOpenChange={setIsDropdownOpen}
              open={isDropdownOpen}
            >
              <Button 
                type="text" 
                icon={<GlobalOutlined className="text-lg" />}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
            </Dropdown>
          </div>

          {/* Profile - always visible but styled differently */}
          <div className="cursor-pointer">
            <TopbarProfile />
          </div>
        </div>
      </div>
    </div>
  );
};

// For mobile menu dropdown
const RightOutlined = () => (
  <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default TopBar;

