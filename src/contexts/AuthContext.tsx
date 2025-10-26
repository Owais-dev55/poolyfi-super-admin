import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginAdmin, logoutUser } from '../api/user/api';
import { customToast } from '../utils/useCustomToast';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    typeof window !== 'undefined' ? Boolean(localStorage.getItem('auth_token')) : false
  );

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token' && event.newValue === null) {
        
        setIsAuthenticated(false);
        customToast.info('You have been logged out in another tab');
        window.location.replace('/login'); 
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async ({ email, password }: LoginCredentials) => {
    const data = await loginAdmin(email, password);

    // Store user and session if present
    if (data?.data?.user) localStorage.setItem('user_data', JSON.stringify(data.data.user));
    if (data?.data?.session) localStorage.setItem('session_data', JSON.stringify(data.data.session));

    const token = data?.data?.accessToken || (data as any)?.accessToken || data?.data?.session?.token || 'session';
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error: any) {
      console.error('Logout error:', error);
      customToast.error(error.message || 'Failed to logout from server');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_data');
      setIsAuthenticated(false);
      customToast.success('Logged out successfully');
      window.location.replace('/login'); 
    }
  };

  const value = { isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
