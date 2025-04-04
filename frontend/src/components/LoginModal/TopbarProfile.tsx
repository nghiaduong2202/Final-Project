import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Avatar, Button, MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
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
      label: 'Trang chủ chủ sân',
      onClick: () => navigate('/owner')
    },
    {
      key: 'owner-notifications',
      label: 'Thông báo',
      onClick: () => navigate('/owner/notifications')
    },
    {
      key: 'owner-messages',
      label: 'Tin nhắn',
      onClick: () => navigate('/owner/messages')
    },
    {
      key: 'owner-revenue',
      label: 'Doanh thu',
      onClick: () => navigate('/owner/revenue')
    }  
    ] : []),
    ...(user?.role === 'player' ? [{
      key: 'messages',
      label: 'Tin nhắn',
      onClick: () => navigate('/user/messages')
    },
    {
      key: 'notifications',
      label: 'Thông báo',
      onClick: () => navigate('/user/notifications')
    },
    {
      key: 'bookings',
      label: 'Lịch sử đặt sân',
      onClick: () => navigate('/user/history-booking')
    },
    {
      key: 'favorite',
      label: 'Danh sách yêu thích',
      onClick: () => navigate('/user/favorite')
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
    <div className="ml-2">
      {isAuthenticated ? (
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center cursor-pointer">
            <Avatar 
              src={user?.avatarUrl} 
              icon={!user?.avatarUrl && <UserOutlined />} 
              className="mr-2"
            />
            <span className="text-sm font-medium hidden md:inline">
              {user?.name}
            </span>
          </div>
        </Dropdown>
      ) : (
        <div className="flex gap-2">
          <Button 
            type="text" 
            size="small" 
            onClick={handleLoginClick}
          >
            Đăng nhập
          </Button>
          <Button 
            type="primary" 
            size="small" 
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