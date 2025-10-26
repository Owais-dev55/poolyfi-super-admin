import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import CustomToastContainer from './components/CustomToast';
import AppContent from './contexts/AppContent';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
      <CustomToastContainer />
    </AuthProvider>
  );
}

export default App;
