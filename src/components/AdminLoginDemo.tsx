import { useState } from 'react';
import { loginAdmin } from '../api/user/api';

const AdminLoginDemo = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult('');

    try {
      const response = await loginAdmin(formData.email, formData.password);
      
      if (response.data) {
        setResult(`✅ Admin login successful! Welcome ${response.data.user?.name || 'Admin'}`);
        console.log('Admin login response:', response);
      } else {
        setResult(`❌ Login failed: No data received`);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Admin Login Demo
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter admin email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter admin password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login as Admin'}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm">{result}</p>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-700 mb-2">Integration Summary:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Uses <code className="bg-gray-200 px-1 rounded">admin_login</code> endpoint</li>
          <li>• Follows ride-share-pro pattern with proper CORS handling</li>
          <li>• Includes comprehensive error handling</li>
          <li>• Returns structured AdminLoginResponse</li>
          <li>• Fixed CORS issues by setting <code className="bg-gray-200 px-1 rounded">mode: 'cors'</code></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminLoginDemo;
