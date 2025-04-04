import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { showRoleModal, logout, showOwnerRoleModal, showPlayerRoleModal } from '@/store/slices/userSlice';
import { message } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'player' | 'owner';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading, roleModalVisible, resetAuthChecksFlag } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const messageShownRef = useRef(false);
  const initialCheckRef = useRef(false);

  // Reset các biến ref khi resetAuthChecksFlag thay đổi
  useEffect(() => {
    messageShownRef.current = false;
    initialCheckRef.current = false;
    setInitialCheckDone(false);
  }, [resetAuthChecksFlag]);

  // Reset message flag when role modal is closed
  useEffect(() => {
    if (!roleModalVisible) {
      messageShownRef.current = false;
    }
  }, [roleModalVisible]);

  const handleAuthenticationMessages = useCallback(() => {
    // Nếu đã thực hiện kiểm tra ban đầu, thoát để tránh gọi nhiều lần
    if (initialCheckRef.current) {
      return true;
    }
    
    // Thêm kiểm tra trạng thái localStorage để xác định xem đây có phải là do logout không
    const isJustLoggedOut = sessionStorage.getItem('just_logged_out') === 'true';

    // Nếu người dùng vừa logout, đặt lại các biến ref và thoát
    if (isJustLoggedOut) {
      sessionStorage.removeItem('just_logged_out');
      // Không thực hiện kiểm tra xác thực trong lần đầu tiên sau khi logout
      initialCheckRef.current = true;
      return true;
    }
    
    if (!isAuthenticated && !messageShownRef.current && localStorage.getItem('access_token') === null && !isJustLoggedOut) {
      messageShownRef.current = true;

      // Hiển thị modal phù hợp với vai trò yêu cầu
      if (requiredRole === 'player') {
        // Không hiển thị thông báo warning nữa
        dispatch(showPlayerRoleModal(location.pathname));
      } else if (requiredRole === 'owner') {
        // Không hiển thị thông báo warning nữa
        dispatch(showOwnerRoleModal(location.pathname));
      } else {
        // Nếu không yêu cầu vai trò cụ thể, hiển thị RoleSelectionModal
        message.warning('Vui lòng đăng nhập để truy cập trang này');
        dispatch(showRoleModal(location.pathname));
      }
      
      initialCheckRef.current = true;
      return false;

    } 
    else if (isAuthenticated && requiredRole && user?.role !== requiredRole && !messageShownRef.current) {
      // Đăng xuất người dùng nếu không có vai trò phù hợp
      messageShownRef.current = true;
      message.error(`Bạn không có quyền truy cập trang này. Yêu cầu vai trò: ${requiredRole === 'owner' ? 'Chủ sân' : 'Người chơi'}`);
      dispatch(logout());
      initialCheckRef.current = true;
      return false;
    }
    
    // // Xóa flag sau khi đã xử lý
    // if (isJustLoggedOut) {
    //   sessionStorage.removeItem('just_logged_out');
    // }
    
    initialCheckRef.current = true;
    return true;
  }, [isAuthenticated, user, requiredRole, dispatch, location.pathname]);

  useEffect(() => {
    if (!isLoading && !initialCheckDone) {
      setInitialCheckDone(true);
      handleAuthenticationMessages();
    }
  }, [isLoading, handleAuthenticationMessages, initialCheckDone]);

  // Hiển thị loading trong khi kiểm tra xác thực hoặc chưa hoàn tất kiểm tra ban đầu
  if (isLoading || !initialCheckDone) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Kiểm tra xác thực và vai trò
  if (!isAuthenticated) {
    // Redirect to home page if not authenticated
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to home page if wrong role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;