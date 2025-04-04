import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  FieldTimeOutlined,
  CustomerServiceOutlined,
  GiftOutlined,
  CalendarOutlined,
  CommentOutlined,
  PhoneOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle = () => {} }) => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    onToggle(collapsed);
  }, [collapsed, onToggle]);

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Trang chủ',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Quản lý người dùng',
      onClick: () => navigate('/users'),
    },
    {
      key: 'approvals',
      icon: <CheckCircleOutlined />,
      label: 'Phê duyệt',
      onClick: () => navigate('/approvals'),
    },
    {
      key: 'facilities',
      icon: <HomeOutlined />,
      label: 'Quản lý cơ sở',
      onClick: () => navigate('/facilities'),
    },
    {
      key: 'fields',
      icon: <FieldTimeOutlined />,
      label: 'Quản lý sân',
      onClick: () => navigate('/fields'),
    },
    {
      key: 'services',
      icon: <CustomerServiceOutlined />,
      label: 'Quản lý dịch vụ',
      onClick: () => navigate('/services'),
    },
    {
      key: 'vouchers',
      icon: <GiftOutlined />,
      label: 'Quản lý voucher',
      onClick: () => navigate('/vouchers'),
    },
    {
      key: 'events',
      icon: <CalendarOutlined />,
      label: 'Quản lý sự kiện',
      onClick: () => navigate('/events'),
    },
    {
      key: 'reviews',
      icon: <CommentOutlined />,
      label: 'Quản lý đánh giá',
      onClick: () => navigate('/reviews'),
    },
    {
      key: 'supports',
      icon: <PhoneOutlined />,
      label: 'Hỗ trợ người dùng',
      onClick: () => navigate('/supports'),
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo hệ thống',
      onClick: () => navigate('/reports'),
    },
    {
      type: 'divider',
      style: {
        margin: '20px 0'
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt hệ thống',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => navigate('/logout'),
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div className="flex items-center gap-3 p-4 h-auto border-b border-[#d8d8d8]">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center"
        />
        {!collapsed && (
          <div className="flex flex-col items-center">
            {/* Kiểm tra đường dẫn ảnh và thêm fallback
          <img 
            src={brandImage} 
            alt="Logo" 
            className="h-12 w-20 mb-1"             
          /> */}
            <span className="text-xl font-semibold">Sports Admin</span>
          </div>
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
        style={{ 
          border: 'none',
          marginTop: '4px',
          fontSize: '16px',
          fontWeight: '500',
          padding: '5px 0'
        }}
        items={menuItems}        
      />
    </Sider>
  );
};

export default Sidebar;