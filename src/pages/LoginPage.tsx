import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default LoginPage;
