import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { getAdminProfile } from '@/store/slices/authSlice';

export const useAuthInitialization = () => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('admin_access_token');
        if (token && !isAuthenticated) {
          await dispatch(getAdminProfile()).unwrap();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch, isAuthenticated]);

  return { isInitialized };
};