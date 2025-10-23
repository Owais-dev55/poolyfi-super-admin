import { createContext, useContext, useState, type ReactNode } from 'react';
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    typeof window !== 'undefined' ? Boolean(localStorage.getItem('auth_token')) : false
  );

  const login = async ({ email, password }: LoginCredentials) => {
    const data = await loginAdmin(email, password);

    // Store user and session if present
    if (data?.data?.user) {
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
    }
    if (data?.data?.session) {
      localStorage.setItem('session_data', JSON.stringify(data.data.session));
    }

    const token = data?.data?.accessToken || (data as any)?.accessToken || data?.data?.session?.token || 'session';
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Call the logout API
      await logoutUser();
      
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_data');
      setIsAuthenticated(false);
      
      // Show success message
      customToast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Even if API call fails, clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_data');
      setIsAuthenticated(false);
      
      // Show error message
      customToast.error(error.message || 'Failed to logout from server');
    }
  };

  const value = {
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
