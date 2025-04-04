import React, { useState } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { ICONS } from '@/constants/owner/topbar/topbar';
import TopbarProfile from '../LoginModal/TopbarProfile';
import NotificationIcon from '../Notification/NotificationIcon';

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

  return (
    <div className={`flex items-center justify-between bg-white border-b border-[#e8e8e8] px-[42px] min-w-[960px] h-[75px] box-border`}>
      {/*Title */}
      <div className="flex items-center gap-2.5">
        <span className="font-sans font-bold text-[29px] tracking-[1px] text-black">
          {currentTitle}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-[30px]">
        {/* Notification */}
        <NotificationIcon />

        {/* Language Selector */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsLanguageOpen(!isLanguageOpen)}
        >
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

        {/* Language Dropdown */}
        {isLanguageOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-[160px] z-50">
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

        {/* Profile */}
        <div className="flex items-center gap-[15px] cursor-pointer">
          {/* User Profile */}
          <TopbarProfile />
        </div>
      </div>
    </div>
  );
};

export default TopBar;

