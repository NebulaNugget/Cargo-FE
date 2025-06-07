import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authService } from '../services/authService';
import { Eye, EyeOff, LogIn, Mail, Lock, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.login(formData.username, formData.password);
      navigate('/dashboard', {replace:true});
    } catch (err:any) {
      setError(err.message|| 'Invalid username or password');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))] opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-16 left-16 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-24 right-12 w-32 h-32 bg-white/3 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-8 text-white">
          {/* Logo */}
          <div className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl mb-6 border border-white/30">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 454.46 430.12" className="w-7 h-7">
              <g>
                <path d="M312.6 410.71L401.27 322l9.44-9.44 33.91-33.91c25-22.12-17.92-21.09-36-21l-13.1.09-31.17.21-48 .32-101.29 101.29-144.5-144.5 144.5-144.5 107 107 .27-.12v.39l90.42-.6c25.81-.17 60.93 2.68 29-28.65l-31-31-98.15-98.17a66.73 66.73 0 0 0-94.1 0l-3.44 3.44-3.44-3.44a66.74 66.74 0 0 0-94.1 0l-98.11 98.11a66.74 66.74 0 0 0 0 94.1l3.44 3.44-3.44 3.44a66.74 66.74 0 0 0 0 94.1l98.11 98.11a66.74 66.74 0 0 0 94.1 0l3.44-3.44 3.44 3.44a66.74 66.74 0 0 0 94.1 0zM336.18 144l-97.27-97.3 3.44-3.44a33 33 0 0 1 46.39 0l98.11 98.11q1.09 1.09 2.05 2.25l-52.72.35zM384 291.62l-95.24 95.24a33 33 0 0 1-46.39 0l-3.44-3.44L330.36 292l53.63-.35zM46.7 191.21l-3.44-3.44a33 33 0 0 1 0-46.39l98.11-98.11a33 33 0 0 1 46.39 0l3.44 3.44-144.5 144.5zm0 47.71l144.5 144.5-3.44 3.44a33 33 0 0 1-46.39 0l-98.11-98.11a33 33 0 0 1 0-46.39l3.44-3.44z" fill="white" fillRule="evenodd"/>
              </g>
            </svg>
          </div>
          
          {/* Brand Name */}
          <h1 className="text-2xl text-center mb-3 leading-tight font-medium">
            CARBONATION
            <br />
            <span className="text-white font-bold">CO-PILOT</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-base text-blue-100 text-center max-w-sm leading-relaxed">
            Your intelligent logistics partner for seamless cargo management
          </p>
          
          {/* Decorative Elements */}
          <div className="mt-8 flex space-x-1.5">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse delay-75"></div>
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 454.46 430.12" className="w-6 h-6">
                <g>
                  <path d="M312.6 410.71L401.27 322l9.44-9.44 33.91-33.91c25-22.12-17.92-21.09-36-21l-13.1.09-31.17.21-48 .32-101.29 101.29-144.5-144.5 144.5-144.5 107 107 .27-.12v.39l90.42-.6c25.81-.17 60.93 2.68 29-28.65l-31-31-98.15-98.17a66.73 66.73 0 0 0-94.1 0l-3.44 3.44-3.44-3.44a66.74 66.74 0 0 0-94.1 0l-98.11 98.11a66.74 66.74 0 0 0 0 94.1l3.44 3.44-3.44 3.44a66.74 66.74 0 0 0 0 94.1l98.11 98.11a66.74 66.74 0 0 0 94.1 0l3.44-3.44 3.44 3.44a66.74 66.74 0 0 0 94.1 0zM336.18 144l-97.27-97.3 3.44-3.44a33 33 0 0 1 46.39 0l98.11 98.11q1.09 1.09 2.05 2.25l-52.72.35zM384 291.62l-95.24 95.24a33 33 0 0 1-46.39 0l-3.44-3.44L330.36 292l53.63-.35zM46.7 191.21l-3.44-3.44a33 33 0 0 1 0-46.39l98.11-98.11a33 33 0 0 1 46.39 0l3.44 3.44-144.5 144.5zm0 47.71l144.5 144.5-3.44 3.44a33 33 0 0 1-46.39 0l-98.11-98.11a33 33 0 0 1 0-46.39l3.44-3.44z" fill="white" fillRule="evenodd"/>
                </g>
              </svg>
            </div>
            <h1 className="text-lg font-bold text-blue-500">CARBONATION CO-PILOT</h1>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h2>
              <p className="text-gray-600 text-sm">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-2.5">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm text-left font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className={`block w-full pl-9 pr-10 py-2.5 border ${
                      error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all duration-200 bg-gray-50 focus:bg-white text-sm`}
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm text-left font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`block w-full pl-9 pr-10 py-2.5 border ${
                      error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all duration-200 bg-gray-50 focus:bg-white text-sm`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-600 text-sm">Remember Me</span>
                </label>
                <RouterLink to="/reset-password" className="text-blue-600 hover:text-blue-500 font-medium text-sm">
                  Reset Password?
                </RouterLink>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all duration-200 text-sm ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    LOGIN
                  </div>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-5 text-center">
              <p className="text-sm text-gray-600">
                New to Carbonation Co Pilot?{' '}
                <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign Up?
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              © 2025 Carbonation Co Pilot. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}