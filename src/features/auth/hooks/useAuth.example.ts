// Example: Using Redux in the auth hook
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser, setLoading } from '../store/authSlice';
import type { User } from '../types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const signIn = async (userData: User) => {
    dispatch(setLoading(true));
    try {
      // Perform authentication logic
      dispatch(setUser(userData));
    } catch (error) {
      console.error('Sign in failed:', error);
      dispatch(setLoading(false));
    }
  };

  const signOut = () => {
    dispatch(clearUser());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  };
}
