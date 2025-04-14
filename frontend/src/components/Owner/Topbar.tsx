import React, { useState } from 'react';
import { useLocation, matchPath, useNavigate } from 'react-router-dom';
import { ICONS } from '@/constants/owner/topbar/topbar';
import TopbarProfile from '../LoginModal/TopbarProfile';
import { Dropdown, Badge, Button, Divider } from 'antd';
import { 
  BellOutlined, 
  QuestionCircleOutlined, 
  GlobalOutlined, 
  DownOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface TopBarProps {
  className?: string;
}

// Các pattern route cần kiểm tra, từ cụ thể đến tổng quát
const ROUTE_PATTERNS = [
  '/owner',
  '/owner/play-schedule',
  '/owner/facility-management',
  '/owner/field-group-management',
  '/owner/service-management',
  '/owner/voucher-management',  
  '/owner/event-management',
  '/owner/report-management',
  '/owner/banking',
  '/owner/contact-support',
  '/owner/review-management',
  '/owner/chat',
  '/owner/create-facility',
  '/owner/create-field-group',
  '/owner/create-service',
  '/owner/create-voucher',
  '/owner/create-event',
  
];

// Tiêu đề tương ứng cho mỗi route
const ROUTE_TITLES: Record<string, string> = {
  '/owner/facility-management': 'Quản lý cơ sở',
  '/owner/create-facility': 'Quản lý cơ sở',
  '/owner/service-management': 'Quản lý dịch vụ',
  '/owner/create-service': 'Quản lý dịch vụ',
  '/owner/voucher-management': 'Quản lý voucher',
  '/owner/create-voucher': 'Quản lý voucher',
  '/owner/field-group-management': 'Quản lý nhóm sân',
  '/owner/create-field-group': 'Quản lý nhóm sân',
  '/owner/play-schedule': 'Lịch đặt sân',
  '/owner/event-management': 'Quản lý sự kiện',
  '/owner/create-event': 'Quản lý sự kiện',
  '/owner': 'Trang chủ',
  '/owner/report-management': 'Báo cáo tài chính',
  '/owner/banking': 'Ngân hàng',
  '/owner/contact-support': 'Hỗ trợ liên hệ',
  '/owner/review-management': 'Quản lý đánh giá',
  '/owner/chat': 'Quản lý chat',
};

// Danh sách ngôn ngữ có sẵn
const LANGUAGES = [
  { name: 'Tiếng Việt', code: 'vi', flag: ICONS.VIETNAM },
  { name: 'English', code: 'en', flag: ICONS.ENGLISH },
];

const TopBar: React.FC<TopBarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);

  // Lấy title dựa trên current route, sử dụng matchPath để kiểm tra các route có tham số
  const getRouteTitle = () => {
    // Kiểm tra các pattern từ cụ thể đến tổng quát
    for (const pattern of ROUTE_PATTERNS) {
      if (matchPath({ path: pattern }, location.pathname)) {
        return ROUTE_TITLES[pattern];
      }
    }
    return 'Trang chủ'; // Mặc định
  };

  const currentTitle = getRouteTitle();

  // Language menu items
  const languageItems: MenuProps['items'] = [
    {
      key: 'vi',
      label: (
        <div className="flex items-center gap-2">
          <img src={ICONS.VIETNAM} alt="Tiếng Việt" className="w-5 h-4" />
          <span>Tiếng Việt</span>
        </div>
      ),
      onClick: () => setSelectedLanguage(LANGUAGES[0])
    },
    {
      key: 'en',
      label: (
        <div className="flex items-center gap-2">
          <img src={ICONS.ENGLISH} alt="English" className="w-5 h-4" />
          <span>English</span>
        </div>
      ),
      onClick: () => setSelectedLanguage(LANGUAGES[1])
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
          <span>Có người dùng đánh giá mới</span>
          <span className="text-xs text-gray-500">15 phút trước</span>
        </div>
      )
    },
    {
      key: '3',
      label: (
        <div className="flex flex-col">
          <span>Cập nhật trạng thái cơ sở thành công</span>
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
        <a href="/owner/help-center" className="text-gray-700">
          Trung tâm trợ giúp
        </a>
      )
    },
    {
      key: 'contact',
      label: (
        <a href="/owner/contact-support" className="text-gray-700">
          Liên hệ hỗ trợ
        </a>
      ),
      onClick: () => navigate('/owner/contact-support')
    },
    {
      key: 'faq',
      label: (
        <a href="/owner/faq" className="text-gray-700">
          Câu hỏi thường gặp
        </a>
      )
    }
  ];

  return (
    <div className="bg-white border-b border-[#e8e8e8] py-0 px-4 md:px-[30px] h-[75px] box-border shadow-sm">
      <div className="flex items-center justify-between h-full">
        {/* Title - responsive text size */}
        <div className="flex items-center gap-2.5 pl-10 md:pl-0 flex-shrink-0 overflow-visible">
          <h1 className="font-sans font-bold text-lg md:text-2xl lg:text-[29px] tracking-[1px] text-black leading-normal m-0 break-normal">
            {currentTitle}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-4">
          {/* Notification Dropdown */}
          <Dropdown 
            menu={{ items: notificationItems }}
            placement="bottomRight" 
            arrow={{ pointAtCenter: true }}
            trigger={['click']}
          >
            <Button 
              type="text" 
              className="flex items-center justify-center gap-1 hover:bg-gray-100 h-10"
            >
              <Badge count={3} size="small" offset={[-2, 2]}>
                <BellOutlined style={{ fontSize: '20px' }} />
              </Badge>
              <span className="hidden md:inline ml-1">Thông báo</span>
            </Button>
          </Dropdown>

          {/* Language Dropdown */}
          <Dropdown 
            menu={{ items: languageItems }}
            placement="bottomRight"
            arrow={{ pointAtCenter: true }}
            trigger={['click']}
          >
            <Button 
              type="text"
              className="flex items-center justify-center gap-1 hover:bg-gray-100 h-10"
            >
              <GlobalOutlined style={{ fontSize: '18px' }} />
              <span className="hidden md:inline">{selectedLanguage.name}</span>
              <DownOutlined className="text-xs" />
            </Button>
          </Dropdown>

          {/* Support Dropdown */}
          <Dropdown 
            menu={{ items: supportItems }}
            placement="bottomRight"
            arrow={{ pointAtCenter: true }}
            trigger={['click']}
          >
            <Button
              type="text"
              className="flex items-center justify-center gap-1 hover:bg-gray-100 h-10"
            >
              <QuestionCircleOutlined style={{ fontSize: '20px' }} />
              <span className="hidden md:inline ml-1">Hỗ trợ</span>
            </Button>
          </Dropdown>

          <Divider type="vertical" className="h-8 mx-1 hidden md:block" />

          {/* Profile */}
          <TopbarProfile />
        </div>
      </div>
    </div>
  );
};

export default TopBar;

