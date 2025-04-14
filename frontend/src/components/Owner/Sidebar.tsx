import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ICONS } from '@/constants/owner/sidebar/icons';
import { 
  DashboardOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  FieldTimeOutlined,
  ShoppingOutlined,
  GiftOutlined,
  NotificationOutlined,
  MessageOutlined,
  StarOutlined,
  BarChartOutlined,
  BankOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined
} from '@ant-design/icons';

interface SidebarProps {
  onMenuItemClick?: (itemId: string) => void;
  onToggle?: (collapsed: boolean) => void;
  isMobile?: boolean;
  autoCollapsed?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  textColor?: string;
  danger?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onMenuItemClick = () => {}, 
  onToggle = () => {},
  isMobile = false,
  autoCollapsed = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (isMobile) return false;
    if (autoCollapsed) return true;
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Section expansion states
  const [isCustomerCareOpen, setCustomerCareOpen] = useState(false);
  const [isFinanceOpen, setFinanceOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string>('');

  // Effect to handle auto collapse
  useEffect(() => {
    if (autoCollapsed && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [autoCollapsed, isCollapsed]);

  // Effect to save collapse state
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isMobile]);

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle(newState);
  };

  // Navigation handler
  const handleItemClick = (path: string, id: string) => {
    setActiveItem(id);
    onMenuItemClick(id);
    navigate(path);
  };

  // Check if route is active
  const isActiveRoute = (path: string, id?: string): boolean => {
    return activeItem === id || location.pathname === path;
  };

  // Menu definitions
  const mainMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Trang chủ', icon: <DashboardOutlined />, path: "/owner" },
    { id: 'calendar', label: 'Lịch đặt sân', icon: <CalendarOutlined />, path: "/owner/play-schedule" },
    { id: 'facility', label: 'Quản lý cơ sở', icon: <AppstoreOutlined />, path: "/owner/facility-management" },
    { id: 'field', label: 'Quản lý nhóm sân', icon: <FieldTimeOutlined />, path: "/owner/field-group-management" },
    { id: 'service', label: 'Quản lý dịch vụ', icon: <ShoppingOutlined />, path: "/owner/service-management" },
    { id: 'voucher', label: 'Quản lý voucher', icon: <GiftOutlined />, path: "/owner/voucher-management" },
    { id: 'ads', label: 'Quản lý sự kiện', icon: <NotificationOutlined />, path: "/owner/event-management" },
  ];

  const menuSections: MenuSection[] = [
    {
      title: 'Chăm sóc khách hàng',
      items: [
        { id: 'chat', label: 'Quản lý chat', icon: <MessageOutlined />, path: "/owner/chat" },
        { id: 'review', label: 'Quản lý đánh giá', icon: <StarOutlined />, path: "/owner/review-management" },
      ]
    },
    {
      title: 'Báo cáo tài chính',
      items: [
        { id: 'report', label: 'Báo cáo tài chính', icon: <BarChartOutlined />, path: "/owner/report-management" },
        { id: 'bank', label: 'Ngân hàng', icon: <BankOutlined />, path: "/owner/banking" },
      ]
    }
  ];

  const bottomMenuItems: MenuItem[] = [
    { id: 'support', label: 'Hỗ trợ liên hệ', icon: <CustomerServiceOutlined />, path: "/owner/contact-support" },
    { id: 'delete', label: 'Xóa tài khoản', icon: <DeleteOutlined />, path: "/", danger: true },
    { id: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, path: "/" },
  ];

  // Render a menu item
  const renderMenuItem = (item: MenuItem, showLabel: boolean = true) => {
    const isActive = isActiveRoute(item.path, item.id);
    const isDanger = item.danger;

    return (
      <div
        key={item.id}
        onClick={(e) => {
          // Tạo hiệu ứng ripple khi click
          const button = e.currentTarget;
          const ripple = document.createElement('span');
          const rect = button.getBoundingClientRect();
          
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          ripple.className = 'ripple';
          
          button.appendChild(ripple);
          
          setTimeout(() => {
            ripple.remove();
            handleItemClick(item.path, item.id);
          }, 200);
        }}
        className={`
          flex items-center ${showLabel ? (isCollapsed ? 'justify-center' : 'px-5') : 'justify-center'} 
          p-[10px] mb-2 rounded-[10px] cursor-pointer w-full h-[43px] relative overflow-hidden
          ${isActive ? 'bg-[#4880ff] text-white' : isDanger ? 'text-[#ff4d4f]' : 'text-black'} 
          ${!isActive && 'hover:bg-[#f5f5f5]'}
          transition-all duration-100 ease-in-out
        `}
      >
        <span className={`text-[23px] ${showLabel && !isCollapsed && 'mr-[10px]'} 
          ${isActive ? 'text-white' : isDanger ? 'text-[#ff4d4f]' : ''} z-10`}
        >
          {item.icon}
        </span>
        {showLabel && !isCollapsed && (
          <span className={`font-roboto text-lg font-semibold leading-[23px] whitespace-nowrap z-10
            ${isActive ? 'text-white' : isDanger ? 'text-[#ff4d4f]' : 'text-black'}`}
          >
            {item.label}
          </span>
        )}
      </div>
    );
  };

  // Render a collapsible section
  const renderSection = (section: MenuSection, index: number) => {
    const isOpen = index === 0 ? isCustomerCareOpen : isFinanceOpen;
    const toggleOpen = () => {
      if (index === 0) {
        setCustomerCareOpen(!isCustomerCareOpen);
      } else {
        setFinanceOpen(!isFinanceOpen);
      }
    };

    return (
      <div key={section.title} className="mt-1.5">
        {!isCollapsed ? (
          <>
            <div 
              className="flex justify-between items-center px-2 pt-2.5 pb-3.5 rounded-[10px] cursor-pointer hover:bg-[#f5f5f5] transition-colors duration-200"
              onClick={toggleOpen}
            >
              <span className="font-semibold text-lg leading-[23px] text-black whitespace-nowrap">
                {section.title}
              </span>
              <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <DownOutlined />
              </span>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {section.items.map(item => renderMenuItem(item))}
            </div>
          </>
        ) : (
          <>{section.items.map(item => renderMenuItem(item, false))}</>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full bg-white p-[10px] flex flex-col border-r border-[#d8d8d8] transition-all duration-300 ease-in-out
      ${isMobile ? 'w-full' : isCollapsed ? 'w-20' : 'w-60'}`}
    >
      {/* Header */}
      <div className="flex-shrink-0">
        <div className={`flex items-center ${isCollapsed ? 'justify-center h-[90px]' : 'px-[20px]'} pt-[10px] pb-[20px]`}>
          {!isMobile && (
            <button 
              onClick={toggleSidebar}
              className="w-[30px] h-[20px] flex items-center justify-center border-0 bg-transparent cursor-pointer transition-transform hover:scale-110 focus:outline-none"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? 
                <MenuUnfoldOutlined className="text-xl" /> : 
                <MenuFoldOutlined className="text-xl" />
              }
            </button>
          )}
          {(!isCollapsed || isMobile) && (
            <div className="border-0 bg-transparent cursor-pointer overflow-hidden transition-all duration-300 ease-in-out" onClick={() => navigate("/")}>
              <img src={ICONS.BRAND} alt="Brand" className="w-[120px] h-[60px] ml-[15px]" />
            </div>
          )}
        </div>
        <div className="border-b border-[#d8d8d8] mb-5" />
      </div>

      {/* Middle Scrollable Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Main Menu Items */}
        <div className="pt-1 pb-[8px] flex flex-col gap-1.5">
          {mainMenuItems.map(item => renderMenuItem(item))}
        </div>

        <div className="border-b border-[#d8d8d8]" />

        {/* Collapsible Sections */}
        {menuSections.map((section, index) => (
          <React.Fragment key={section.title}>
            {renderSection(section, index)}
            {index < menuSections.length - 1 && <div className="border-b border-[#d8d8d8]" />}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom Menu */}
      <div className="flex-shrink-0 pt-5">
        <div className="border-t border-[#d8d8d8] pt-3">
          <div className="w-full h-[1px] bg-[#e0e0e0]" />
          <div className="pt-3.5 pb-3 flex flex-col gap-1">
            {bottomMenuItems.map(item => renderMenuItem(item))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

