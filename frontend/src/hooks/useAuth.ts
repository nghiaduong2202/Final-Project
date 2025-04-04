import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/reduxHooks';
import { login } from '../store/slices/userSlice';

export const useAuthInitialization = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      dispatch(login({ email: '', password: '', fromToken: true }));
    }
  }, [dispatch]);
};