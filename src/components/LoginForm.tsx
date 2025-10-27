import { useState } from 'react';
import { customToast } from '../utils/useCustomToast';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void> | void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(formData.email, formData.password);
      customToast.success('Welcome back! You have successfully signed in.');
    } catch (err: any) {
      const message = err?.message || 'Failed to sign in. Please try again.';
      customToast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(150deg,rgb(255, 242, 188) 30%, #f3f4f6)'
      }}
    >
      <div className="max-w-sm w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/poolify-logo.png" 
                  alt="Pooyfi Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Poolyfi</h2>
            <p className="mt-1 text-sm text-gray-600">
              Sign in to your admin dashboard
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
         {/* Email Field */}
<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
    Super Admin Email
  </label>
  <input
    id="email"
    name="email" // ← reverted to match your state key
    type="text"
    autoComplete="off" // stops autofill
    required
    value={formData.email}
    onChange={handleInputChange}
    placeholder="example@gmail.com"
    className="w-full px-3 py-2 text-sm rounded-md shadow-sm placeholder-gray-400 focus:outline-none border border-gray-300 focus:ring-[#FFCB44] focus:border-[#FFCB44]"
  />
</div>

{/* Password Field */}
<div>
  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
    Password
  </label>
  <div className="relative">
    <input
      id="password"
      name="password" // ← reverted to match your state key
      type={showPassword ? 'text' : 'password'}
      autoComplete="new-password" // disables Chrome password suggestions
      required
      value={formData.password}
      onChange={handleInputChange}
      placeholder="********"
      className="w-full px-3 py-2 pr-10 text-sm rounded-md shadow-sm placeholder-gray-400 focus:outline-none border border-gray-300 focus:ring-[#FFCB44] focus:border-[#FFCB44]"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
    >
      {showPassword ? (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
          />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      )}
    </button>
  </div>
</div>


            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 border-gray-300 rounded text-[#FFCB44] focus:ring-[#FFCB44] cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-xs text-gray-700 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FFC11E] hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC11E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
