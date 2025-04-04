import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routers';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import AdminLoginModal from '@/components/auth/AdminLoginModal';
import { useAuthInitialization } from '@/hooks/useAuth';
import { resetAuthChecks } from '@/store/slices/authSlice';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  useAuthInitialization();

  const { loginModalVisible } = useAppSelector(state => state.auth);

  // Xóa flag just_logged_out sau một khoảng thời gian
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionStorage.getItem('just_logged_out')) {
        sessionStorage.removeItem('just_logged_out');
        // Reset các biến ref trong ProtectedRoute
        dispatch(resetAuthChecks());
      }
    }, 2000); // 2 giây là đủ để đảm bảo quá trình logout hoàn tất
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>    
        <AppRouter />
        {loginModalVisible && <AdminLoginModal visible={loginModalVisible} />}
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;