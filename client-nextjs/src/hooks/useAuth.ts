import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { authAPI } from '@/services/unifiedApiService';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token && !auth.user) {
          // Try to get current user if we have a token but no user data
          const response = await authAPI.getCurrentUser();
          if (response.data) {
            // User is authenticated, update state if needed
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        dispatch(logout());
        setLoading(false);
      }
    };

    checkAuth();
  }, [auth.user, dispatch]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    dispatch(logout());
    localStorage.removeItem('auth_token');
    // Get current locale from pathname or default to 'ar'
    const pathname = window.location.pathname;
    const locale = pathname.startsWith('/en') ? 'en' : 'ar';
    router.push(`/${locale}/login`);
  };

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: !!auth.token,
    loading,
    login,
    logout: signOut,
  };
};

export default useAuth;
