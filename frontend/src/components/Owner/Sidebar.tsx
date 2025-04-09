import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ICONS } from '@/constants/owner/sidebar/icons';

interface SidebarProps {
  onMenuItemClick?: (itemId: string) => void;
  onToggle?: (collapsed: boolean) => void;
  isMobile?: boolean;
  autoCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onMenuItemClick = () => {}, 
  onToggle = () => {},
  isMobile = false,
  autoCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Nếu là mobile view, luôn mở rộng sidebar
    if (isMobile) return false;

    // Nếu kích thước màn hình cần tự động collapse
    if (autoCollapsed) return true;
    
    // Trong các trường hợp khác, sử dụng giá trị đã lưu
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Theo dõi thay đổi và cập nhật trạng thái
  useEffect(() => {
    if (autoCollapsed && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [autoCollapsed]);

  useEffect(() => {
    // Chỉ lưu trạng thái khi không phải ở chế độ mobile
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isMobile]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    // Gọi callback cho parent component
    onToggle(newState);
  };

  const menuItems = [
    { id: 'calendar', label: 'Lịch đặt sân', icon: ICONS.CALENDAR, activeIcon: ICONS.CALENDAR, path: "/owner" },
    { id: 'facility', label: 'Quản lý cơ sở', icon: ICONS.FACILITY, activeIcon: ICONS.FACILITY, path: "/owner/facility-management" },
    { id: 'field', label: 'Quản lý nhóm sân', icon: ICONS.FIELD, activeIcon: ICONS.FIELD, path: "/owner/field-group-management" },
    { id: 'service', label: 'Quản lý dịch vụ', icon: ICONS.SERVICE, activeIcon: ICONS.SERVICE, path: "/owner/service-management" },
    { id: 'voucher', label: 'Quản lý voucher', icon: ICONS.VOUCHER, activeIcon: ICONS.VOUCHER, path: "/owner/voucher-management" },
    { id: 'ads', label: 'Quản lý sự kiện', icon: ICONS.EVENT, activeIcon: ICONS.EVENT, path: "/owner/event-management" },
  ];

  const customerCareItems = [
    { id: 'chat', label: 'Quản lý chat', icon: ICONS.CHAT, activeIcon: ICONS.CHAT, path: "/owner/chat" },
    { id: 'review', label: 'Quản lý đánh giá', icon: ICONS.REVIEW, activeIcon: ICONS.REVIEW, path: "/owner/review-management" },
  ];

  // Customer Care Section
  const [isCustomerCareOpen, setCustomerCareOpen] = useState(false);

  const financeItems = [
    { id: 'report', label: 'Doanh thu', icon: ICONS.REVENUE, activeIcon: ICONS.REVENUE, path: "/owner/report-management" },
    { id: 'bank', label: 'Ngân hàng', icon: ICONS.BANK, activeIcon: ICONS.BANK, path: "/owner/banking" },
  ];

  // Finance Section
  const [isFinanceOpen, setFinanceOpen] = useState(false);

  const bottomItems = [
    { id: 'support', label: 'Hỗ trợ liên hệ', icon: ICONS.SUPPORT, activeIcon: ICONS.SUPPORT, path: "/*" },
    { id: 'delete', label: 'Xóa tài khoản', icon: ICONS.DELETE, activeIcon: ICONS.DELETE, textColor: 'text-[#ff4b4b]', path: "/" },
    { id: 'logout', label: 'Đăng xuất', icon: ICONS.LOGOUT, activeIcon: ICONS.LOGOUT, path: "/" },
  ];

  const handleItemClick = (path: string, id: string) => {
    onMenuItemClick(id);
    navigate(path);
  };

  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <div className={`h-full bg-white p-[10px] flex flex-col border-r border-[#d8d8d8] sidebar-transition ${
      isMobile ? 'w-full' : isCollapsed ? 'w-20' : 'w-60'
    }`}>
      {/* Header - Fixed */}
      <div className="flex-shrink-0">
        {/* Toggle Sidebar */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center h-[90px]' : 'px-[20px]'} pt-[10px] pb-[20px]`}>
          {!isMobile && (
            <button 
              onClick={toggleSidebar}
              className="w-[30px] h-[20px] flex items-center justify-center border-0 bg-transparent cursor-pointer transition-transform hover:scale-110 focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <img 
                src={ICONS.TOGGLE_SIDEBAR} 
                alt="Toggle Sidebar" 
                className="w-full h-full"
              />
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

      {/* Scrollable Middle Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Menu Items */}
        <div className="pt-1 pb-[8px] flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.path, item.id)}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-5'} p-[10px] mb-2 rounded-[10px] cursor-pointer w-full h-[43px]
                  ${isActive ? 'bg-[#4880ff] text-white' : 'bg-white text-black hover:bg-[#f5f5f5]'}`}
              >
                <img 
                  src={item.icon}
                  alt={item.label}
                  className={`w-[23px] h-[23px] ${!isCollapsed && 'mr-[10px]'} ${isActive ? 'brightness-0 invert' : ''} transition-transform duration-300`}
                />
                {!isCollapsed && (
                  <span className="font-roboto text-lg font-semibold leading-[23px] whitespace-nowrap transition-transform duration-300">
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-b border-[#d8d8d8]" />

        {/* Customer Care Section */}
        <div className="mt-1.5">
          {!isCollapsed ? (
            <>
              <div 
                className="flex justify-between items-center px-2 pt-2.5 pb-3.5 rounded-[10px] cursor-pointer"
                onClick={() => setCustomerCareOpen(!isCustomerCareOpen)}
              >
                <span className="font-semibold text-lg leading-[23px] text-black whitespace-nowrap transition-transform duration-300">Chăm sóc khách hàng</span>
                <img
                  src={ICONS.DROPDOWN}
                  alt="Dropdown"
                  className={`w-[13px] h-[8px] transition-transform duration-300 ${isCustomerCareOpen ? 'rotate-180' : ''}`}
                />
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${isCustomerCareOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {customerCareItems.map((item) => {
                  const isActive = isActiveRoute(item.path);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item.path, item.id)}
                      className={`flex items-center px-5 p-[10px] mb-2 rounded-[10px] cursor-pointer transition-colors w-full
                        ${isActive ? 'bg-[#4880ff] text-white' : 'bg-white text-black hover:bg-[#f5f5f5]'}`}
                    >
                      <img 
                        src={item.icon}
                        alt={item.label}
                        className={`w-[23px] h-[23px] mr-[10px] ${isActive ? 'brightness-0 invert' : ''} transition-transform duration-300`}
                      />
                      <span className="font-roboto text-lg font-semibold leading-[23px] whitespace-nowrap transition-transform duration-300">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {customerCareItems.map((item) => {
                const isActive = isActiveRoute(item.path);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.path, item.id)}
                    className={`flex items-center justify-center p-[10px] mb-2 rounded-[10px] cursor-pointer transition-colors w-full
                      ${isActive ? 'bg-[#4880ff] text-white' : 'bg-white text-black hover:bg-[#f5f5f5]'}`}
                  >
                    <img 
                      src={item.icon}
                      alt={item.label}
                      className={`w-[23px] h-[23px] ${isActive ? 'brightness-0 invert' : ''}`}
                    />
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="border-b border-[#d8d8d8]" />

        {/* Finance Section */}
        <div className="mt-1.5">
          {!isCollapsed ? ( 
            <>
              <div 
                className="flex justify-between items-center px-2 pt-2.5 pb-3.5 rounded-[10px] cursor-pointer"
                onClick={() => setFinanceOpen(!isFinanceOpen)}
          >
            <span className="font-semibold text-lg leading-[23px] text-black whitespace-nowrap transition-transform duration-300">Báo cáo tài chính</span>
            <img
              src={ICONS.DROPDOWN}
              alt="Dropdown"
              className={`w-[13px] h-[8px] transition-transform duration-300 ${isFinanceOpen ? 'rotate-180' : ''}`}
            />
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isFinanceOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {financeItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.path, item.id)}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-5'} p-[10px] mb-2 rounded-[10px] cursor-pointer transition-colors w-full
                  ${isActive ? 'bg-[#4880ff] text-white' : 'bg-white text-black hover:bg-[#f5f5f5]'}`}
              >
                <img 
                  src={item.icon}
                  alt={item.label}
                  className={`w-[23px] h-[23px] ${!isCollapsed && 'mr-[10px]'} ${isActive ? 'brightness-0 invert' : ''} transition-transform duration-300`}
                />
                {!isCollapsed && (
                  <span className="font-roboto text-lg font-semibold leading-[23px] whitespace-nowrap transition-transform duration-300">
                    {item.label}
                  </span>
                )}
              </div>
                );
              })}            
          </div>
          </>
          ) : (
            <>
              {financeItems.map((item) => {
                const isActive = isActiveRoute(item.path);  
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.path, item.id)}
                    className={`flex items-center justify-center p-[10px] mb-2 rounded-[10px] cursor-pointer transition-colors w-full
                      ${isActive ? 'bg-[#4880ff] text-white' : 'bg-white text-black hover:bg-[#f5f5f5]'}`}
                  >
                    <img 
                      src={item.icon}
                      alt={item.label}
                      className={`w-[23px] h-[23px] ${isActive ? 'brightness-0 invert' : ''}`}
                    />
                  </div>
                );
              })}
            </>
          )}    
        </div>
      </div>

      {/* Bottom Sticky Menu Items */}
      <div className="flex-shrink-0 pt-5">
        <div className="border-t border-[#d8d8d8] pt-3">
          {/* Bottom menu items - always displayed in full in mobile */}
          <div className="w-full h-[1px] bg-[#e0e0e0]" />
          {/* Bottom Items */}
          <div className="pt-3.5 pb-3 flex flex-col gap-1">
            {bottomItems.map((item) => {
              const isActive = isActiveRoute(item.path);
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.path, item.id)}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-5'} p-[10px] mb-2 rounded-[10px] cursor-pointer transition-colors w-full
                    ${isActive ? 'bg-[#4880ff] text-white' : 'bg-white text-black hover:bg-[#f5f5f5]'}`}
                >
                  <img 
                    src={item.icon}
                    alt={item.label}
                    className={`w-[23px] h-[23px] ${!isCollapsed && 'mr-[10px]'} ${isActive ? 'brightness-0 invert' : ''} transition-transform duration-300`}
                  />
                  {!isCollapsed && (
                    <span className="font-roboto text-lg font-semibold leading-[23px] whitespace-nowrap transition-transform duration-300">
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
