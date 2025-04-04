import React, { useEffect, useState } from 'react';
import { Layout, Button, Dropdown, Avatar, Badge, Space, MenuProps } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined, GlobalOutlined, DollarOutlined, HistoryOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { logout } from '@/store/slices/authSlice';
import { theme } from 'antd';
import { fetchUnreadCount } from '@/store/slices/notificationSlice';
import NotificationList from '../notification/NotificationList';

const { Header } = Layout;

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Quản lý người dùng',
  '/facilities': 'Quản lý cơ sở',
  '/reports': 'Báo cáo',
  '/approvals': 'Phê duyệt',
  '/settings': 'Cài đặt',
};

const LANGUAGES = [
  {
    key: 'vi',
    label: 'Tiếng Việt',
  },
  {
    key: 'en',
    label: 'English',
  },
];

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { token } = theme.useToken();
  const { user } = useAppSelector(state => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notification);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    // Fetch unread count when component mounts
    dispatch(fetchUnreadCount());

    // Poll for new notifications every minute
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getCurrentPageName = () => {
    const path = '/' + location.pathname.split('/')[1];
    return ROUTE_TITLES[path] || 'Dashboard';
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Thông tin tài khoản',
      icon: <UserOutlined />,
      onClick: () => navigate('/settings/profile'),
    },
    {
      key: 'income',
      label: 'Báo cáo thu nhập',
      icon: <DollarOutlined />,
      onClick: () => navigate('/reports/income'),
    },
    {
      key: 'approval-history',
      label: 'Lịch sử phê duyệt',
      icon: <HistoryOutlined />,
      onClick: () => navigate('/approvals/history'),
    },
    {
      key: 'terms',
      label: 'Điều khoản và chính sách',
      icon: <FileTextOutlined />,
      onClick: () => navigate('/settings/terms'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const languageMenu: MenuProps = {
    items: LANGUAGES,
    onClick: ({ key }) => {
      // Handle language change
      console.log('Change language to:', key);
    },
  };

  return (
    <Header
      style={{
        padding: 0,
        background: token.colorBgContainer,
        position: 'sticky',
        top: 0,
        zIndex: 1,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>        
        <h2 style={{ margin: "0 24px" , fontSize: "24px", fontWeight: "600"}}>{getCurrentPageName()}</h2>
      </div>

      <Space size="large" style={{ marginRight: 24 }}>
        <Dropdown menu={languageMenu} placement="bottomRight">
          <Button type="text" icon={<GlobalOutlined style={{ fontSize: '20px' }} />} />
        </Dropdown>

        <Dropdown 
          menu={{ items: [] }} 
          dropdownRender={() => <NotificationList onClose={() => setNotificationOpen(false)} />}
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
          placement="bottomRight"
          trigger={['click']}
        >
          <Badge count={unreadCount} size="small">
            <Button type="text" icon={<BellOutlined style={{ fontSize: '20px' }} />} />
          </Badge>
        </Dropdown>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Avatar
              size="default"
              icon={<UserOutlined />}
              src={user?.avatar}
              style={{ marginRight: 10 }}
            />
            <span style={{ fontSize: '16px' }}>{user?.name || 'Admin'}</span>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Topbar;