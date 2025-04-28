import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter  from './routers/index';
import { useAppSelector, useAppDispatch } from './hooks/reduxHooks';
import LoginModal from './components/LoginModal/LoginModal';
import RoleSelectionModal from './components/LoginModal/RoleSelectionModal';
import { useAuthInitialization } from './hooks/useAuth';
import { hidePlayerRoleModal, hideOwnerRoleModal, hideRoleModal, showLoginModal, resetAuthChecks } from './store/slices/userSlice';
import PlayerRoleModal from './components/LoginModal/PlayerRoleModal';
import OwnerRoleModal from './components/LoginModal/OwnerRoleModal';
import { SocketServiceProvider } from './providers/SocketServiceProvider';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  useAuthInitialization();
 
  const { loginModalVisible, roleModalVisible, redirectPath, selectedRole, playerRoleModalVisible, ownerRoleModalVisible } = useAppSelector(state => state.user);

  // Xóa flag just_logged_out sau một khoảng thời gian
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionStorage.getItem('just_logged_out')) {
        sessionStorage.removeItem('just_logged_out');
        // Reset các biến ref trong ProtectedRoute
        dispatch(resetAuthChecks());
      }
    }, 1000); // 2 giây là đủ để đảm bảo quá trình logout hoàn tất
    
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Xử lý đóng modal vai trò
  const handleCloseRoleModal = () => {
    dispatch(hideRoleModal());
  };

  // Xử lý chọn vai trò
  const handleSelectRole = (role: 'player' | 'owner') => {
    dispatch(hideRoleModal());
    dispatch(showLoginModal({ path: redirectPath || '/', role }));
  };

   // Xử lý khi click login từ PlayerRoleModal
   const handlePlayerLogin = () => {
    dispatch(hidePlayerRoleModal());
    dispatch(showLoginModal({ path: redirectPath || '/', role: 'player' }));
  };

  // Xử lý khi click login từ OwnerRoleModal
  const handleOwnerLogin = () => {
    dispatch(hideOwnerRoleModal());
    dispatch(showLoginModal({ path: redirectPath || '/owner', role: 'owner' }));
  };


  return (
    <SocketServiceProvider>
      <BrowserRouter>    
        <AppRouter />
        {loginModalVisible && <LoginModal visible={loginModalVisible} requiredRole={selectedRole || undefined} />}
        {roleModalVisible && (
        <RoleSelectionModal 
          visible={roleModalVisible} 
          onClose={handleCloseRoleModal} 
          onSelectRole={handleSelectRole} 
        />
      )}
      {playerRoleModalVisible && (
        <PlayerRoleModal
          visible={playerRoleModalVisible} 
          onClose={() => dispatch(hidePlayerRoleModal())}
          onLogin={handlePlayerLogin}
        />
      )}
      {ownerRoleModalVisible && (
        <OwnerRoleModal
          visible={ownerRoleModalVisible}
          onClose={() => dispatch(hideOwnerRoleModal())}
          onLogin={handleOwnerLogin}
        />
      )}
    </BrowserRouter>
    </SocketServiceProvider>
  );
};

export default App;