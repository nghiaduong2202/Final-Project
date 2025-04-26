import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Avatar, Button, MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, CalendarOutlined, HeartOutlined, TeamOutlined , TrophyOutlined} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { logout, resetAuthChecks } from '@/store/slices/userSlice';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import RoleSelectionModal from './RoleSelectionModal';

const TopbarProfile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.user);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'player' | 'owner' | null>(null);

  const handleLogout = () => {
    dispatch(logout());
    // Đặt một flag để biết người dùng vừa mới logout
    sessionStorage.setItem('just_logged_out', 'true');
    
    // Kiểm tra vai trò trước khi logout
    const currentRole = user?.role;
    const isAtOwnerRoute = window.location.pathname.startsWith('/owner');
    
    // Điều hướng trước, rồi mới logout
    if (currentRole === 'owner' && isAtOwnerRoute) {
      navigate('/', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
    
    // Dispatch logout action sau khi đã điều hướng
    setTimeout(() => {
      // Đặt lại các ref này thông qua một action mới
      dispatch(resetAuthChecks());
    }, 100);
  };
  // Menu for authenticated users
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin tài khoản',
      onClick: () => {
        // Determine the profile path based on user role
        const profilePath = user?.role === 'player' ? '/user/profile' : '/owner/profile';
        navigate(profilePath);
      }
    },
    ...(user?.role === 'owner' ? [{
      key: 'owner-dashboard',
      icon: <DashboardOutlined />,
      label: 'Trang chủ chủ sân',
      onClick: () => navigate('/owner')
    }    
    ] : []),
    ...(user?.role === 'player' ? [    
    {
      key: 'bookings',
      icon: <CalendarOutlined />,
      label: 'Lịch sử đặt sân',
      onClick: () => navigate('/user/history-booking')
    },
    {
      key: 'favorite',
      icon: <HeartOutlined />,
      label: 'Danh sách yêu thích',
      onClick: () => navigate('/user/favorite')
    },
    {
      key: 'events',
      icon: <TrophyOutlined />,
      label: 'Sự kiện tham gia',
      onClick: () => navigate('/user/events/manage')
    },
    {
      key: 'playmate',
      icon: <TeamOutlined />,
      label: 'Quản lý tìm bạn chơi',
      onClick: () => navigate('/user/playmate/manage')
    }
  ] : []),
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout
    }
  ];

  const handleLoginClick = () => {
    setShowRoleModal(true);
  };

  const handleRegisterClick = () => {
    setShowRegisterModal(true);
  };

  const handleRoleSelect = (role: 'player' | 'owner') => {
    setSelectedRole(role);
    setShowRoleModal(false);
    setShowLoginModal(true);
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    setShowRoleModal(true);
  };

  return (
    <div>
      {isAuthenticated ? (
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center cursor-pointer h-10 px-2">
            <Avatar 
              src={user?.avatarUrl} 
              icon={!user?.avatarUrl && <UserOutlined />} 
              className="mr-2"
              size="default"
            />
            <span className="text-sm font-medium hidden md:inline">
              {user?.name}
            </span>
          </div>
        </Dropdown>
      ) : (
        <div className="flex gap-1 h-10 items-center">
          <Button 
            type="text" 
            className="h-9"
            onClick={handleLoginClick}
          >
            Đăng nhập
          </Button>
          <Button 
            type="primary" 
            className="h-9"
            onClick={handleRegisterClick}
          >
            Đăng ký
          </Button>
        </div>
      )}

      {/* Role Selection Modal */}
      <RoleSelectionModal
        visible={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelectRole={handleRoleSelect}
      />

      {/* Login Modal */}
      <LoginModal 
        visible={showLoginModal} 
        onClose={() => {
          setShowLoginModal(false);
          setSelectedRole(null);
        }}
        requiredRole={selectedRole || undefined}
      />
      
      <RegisterModal 
        visible={showRegisterModal} 
        onClose={() => { 
          setShowRegisterModal(false);          
        }}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowRoleModal(true);
        }}        
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
};

export default TopbarProfile;