import { useEffect, useState } from 'react';
import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logoutUser, initializeAuth, loadUser } from '@/store/slicers/authThunks';
import { clearError } from '@/store/slicers/authSlice';
import { RootState, AppDispatch } from '@/store/store';
import { authService } from '@/services/auth-service';

// Export typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated, user, isLoading, error, isLoggingIn } = useSelector((state: RootState) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state on mount only once
    const initAuth = async () => {
      if (!isInitialized) {
        try {
          console.log('🔐 Initializing authentication...');
          
          // Quick check for token first (faster than isAuthenticated)
          const hasToken = authService.hasToken();
          console.log('🔑 Has token:', hasToken);
          
          if (!hasToken) {
            // No token, immediately set as initialized
            console.log('❌ No token found, skipping auth initialization');
            setIsInitialized(true);
            return;
          }
          
          // Only proceed with full initialization if we have a token
          await dispatch(initializeAuth()).unwrap();
          console.log('✅ Auth initialization completed');
        } catch (error) {
          console.warn('❌ Auth initialization failed:', error);
        } finally {
          console.log('🏁 Setting isInitialized to true');
          setIsInitialized(true);
        }
      }
    };

    initAuth();
  }, [dispatch, isInitialized]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔄 Auth state changed:', {
      isAuthenticated,
      user: user ? { name: user.name, email: user.email } : null,
      isLoading,
      isInitialized,
      error
    });
  }, [isAuthenticated, user, isLoading, isInitialized, error]);

  const checkAuth = () => {
    return authService.isAuthenticated();
  };

  const logout = async () => {
    try {      
      // Clear all authentication data immediately
      authService.clearAuthData();
      
      // Dispatch logout to clear Redux state
      await dispatch(logoutUser()).unwrap();
      
      // Navigate to home page
      router.replace('/');
      
    } catch (error) {
      // Force logout even if API call fails
      authService.clearAuthData();
      router.replace('/');
    }
  };

  const refreshUser = async () => {
    try {
      await dispatch(loadUser()).unwrap();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const requireAuth = (redirectTo = "/login") => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.replace(redirectTo);
      return false;
    }
    return true;
  };

  const requireAdmin = (redirectTo = "/login") => {
    if (!requireAuth(redirectTo)) {
      return false;
    }
    
    // Use the flexible admin checking logic
    if (user && !authService.isUserAdmin(user)) {
      router.replace("/");
      return false;
    }
    
    return true;
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const getRateLimitInfo = (email: string) => {
    return authService.getRateLimitInfo(email);
  };

  const clearRateLimit = (email: string) => {
    authService.clearRateLimit(email);
  };

  return {
    // State
    isAuthenticated,
    user,
    isLoading: isLoading || !isInitialized,
    error,
    isLoggingIn,
    isInitialized,
    
    // Actions
    checkAuth,
    logout,
    refreshUser,
    requireAuth,
    requireAdmin,
    clearAuthError,
    
    // Rate limiting
    getRateLimitInfo,
    clearRateLimit,
    
    // Utility
    isAdmin: user ? authService.isUserAdmin(user) : false,
  };
}; 