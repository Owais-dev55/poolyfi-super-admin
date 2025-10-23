import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PublicRoutes from './routes/PublicRoutes';
import ProtectedRoutes from './routes/ProtectedRoutes';
import CustomToastContainer from './components/CustomToast';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      {isAuthenticated ? <ProtectedRoutes /> : <PublicRoutes />}
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <CustomToastContainer />
    </AuthProvider>
  );
}

export default App
