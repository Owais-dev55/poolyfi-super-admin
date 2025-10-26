import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import PublicRoutes from '../routes/PublicRoutes';
import ProtectedRoutes from '../routes/ProtectedRoutes';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'logout') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_data');
      window.location.replace('/login'); 
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);

  return isAuthenticated ? <ProtectedRoutes /> : <PublicRoutes />;
};

export default AppContent;
