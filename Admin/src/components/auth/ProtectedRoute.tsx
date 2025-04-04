import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { message } from 'antd';
import { showLoginModal, logout, resetAuthChecks } from '@/store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, resetAuthChecksFlag } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Các biến ref để tránh hiển thị thông báo hoặc redirect nhiều lần
  const initialCheckRef = useRef(false);
  const messageShownRef = useRef(false);
  
  // Kiểm tra xem người dùng vừa logout không
  const isJustLoggedOut = sessionStorage.getItem('just_logged_out') === 'true';
  
  // Reset refs khi resetAuthChecksFlag thay đổi
  useEffect(() => {
    initialCheckRef.current = false;
    messageShownRef.current = false;
  }, [resetAuthChecksFlag]);
  
  const handleAuthenticationMessages = useCallback(() => {
    // Nếu đã thực hiện kiểm tra ban đầu, thoát để tránh gọi nhiều lần
    if (initialCheckRef.current) return true;
    
    // Nếu vừa logout, thoát để tránh hiển thị message
    if (isJustLoggedOut) {
      initialCheckRef.current = true;
      return false;
    }
    
    // Nếu chưa đăng nhập, hiển thị thông báo và hiện modal đăng nhập
    if (!isAuthenticated && !messageShownRef.current) {
      messageShownRef.current = true;
      message.error('Vui lòng đăng nhập để tiếp tục');
      dispatch(showLoginModal({ path: location.pathname }));
      initialCheckRef.current = true;
      return false;
    }
    
    initialCheckRef.current = true;
    return true;
  }, [isAuthenticated, dispatch, location.pathname, isJustLoggedOut]);
  
  useEffect(() => {
    if (!initialCheckDone) {
      setInitialCheckDone(true);
      handleAuthenticationMessages();
    }
  }, [handleAuthenticationMessages, initialCheckDone]);
  
  // Hiển thị loading trong khi kiểm tra xác thực hoặc chưa hoàn tất kiểm tra ban đầu
  if (!initialCheckDone) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // Kiểm tra xác thực
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Kiểm tra vai trò admin
  if (user?.role !== 'admin') {
    message.error('Bạn không có quyền truy cập trang này');
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;