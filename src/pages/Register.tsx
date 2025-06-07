import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, X, Check, Mail, Lock, User, Shield, Briefcase, FileText } from 'lucide-react';
import { authService } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Add role selection state
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'OPERATOR' | 'VIEWER'>('OPERATOR');
  
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    client_name: '',
    client_email: '',
    client_description: '',
  });
  
  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Update password validation on password change
  useEffect(() => {
    setPasswordValidation({
      minLength: formData.password.length >= 8,
      hasUppercase: /[A-Z]/.test(formData.password),
      hasLowercase: /[a-z]/.test(formData.password),
      hasNumber: /[0-9]/.test(formData.password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
    });
  }, [formData.password]);

  // Update role in formData when selectedRole changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, role: selectedRole }));
  }, [selectedRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleRoleChange = (role: 'ADMIN' | 'OPERATOR' | 'VIEWER') => {
    setSelectedRole(role);
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(value => value === true);
  };
  
  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!isPasswordValid()) {
      setError('Password does not meet all requirements');
      return false;
    }
    
    if (selectedRole === 'ADMIN' && !formData.client_name) {
      setError('Business name is required for ADMIN registration');
      return false;
    }
    
    if (!formData.client_email) {
      setError(selectedRole === 'ADMIN' ? 'Business email is required' : 'Business email you want to register to is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Prepare registration data based on role
      const registrationData = {
        username: formData.username.toLowerCase(),
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: formData.role,
        client_email: formData.client_email,
        ...(selectedRole === 'ADMIN' && {
          client_name: formData.client_name,
          client_description: formData.client_description
        })
      };

      await authService.register(registrationData);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Brand Section */}
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 454.46 430.12" className="w-6 h-6">
            <g>
              <path d="M312.6 410.71L401.27 322l9.44-9.44 33.91-33.91c25-22.12-17.92-21.09-36-21l-13.1.09-31.17.21-48 .32-101.29 101.29-144.5-144.5 144.5-144.5 107 107 .27-.12v.39l90.42-.6c25.81-.17 60.93 2.68 29-28.65l-31-31-98.15-98.17a66.73 66.73 0 0 0-94.1 0l-3.44 3.44-3.44-3.44a66.74 66.74 0 0 0-94.1 0l-98.11 98.11a66.74 66.74 0 0 0 0 94.1l3.44 3.44-3.44 3.44a66.74 66.74 0 0 0 0 94.1l98.11 98.11a66.74 66.74 0 0 0 94.1 0l3.44-3.44 3.44 3.44a66.74 66.74 0 0 0 94.1 0zM336.18 144l-97.27-97.3 3.44-3.44a33 33 0 0 1 46.39 0l98.11 98.11q1.09 1.09 2.05 2.25l-52.72.35zM384 291.62l-95.24 95.24a33 33 0 0 1-46.39 0l-3.44-3.44L330.36 292l53.63-.35zM46.7 191.21l-3.44-3.44a33 33 0 0 1 0-46.39l98.11-98.11a33 33 0 0 1 46.39 0l3.44 3.44-144.5 144.5zm0 47.71l144.5 144.5-3.44 3.44a33 33 0 0 1-46.39 0l-98.11-98.11a33 33 0 0 1 0-46.39l3.44-3.44z" fill="white" fillRule="evenodd"/>
            </g>
          </svg>
        </div>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-blue-500">CARBONATION CO-PILOT</h1>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-3xl px-4 sm:px-0">
        <div className="bg-white/90 backdrop-blur-xl py-6 px-6 shadow-xl rounded-xl border border-white/30 sm:px-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">
              Create Your Account
            </h2>
            <p className="text-center text-sm text-gray-600">
              Join our platform to streamline your logistics operations
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Register as
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === 'ADMIN' 
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onClick={() => handleRoleChange('ADMIN')}
                >
                  <div className="flex flex-col items-center">
                    <Shield className={`h-5 w-5 ${selectedRole === 'ADMIN' ? 'text-blue-600' : 'text-gray-500'} mb-1`} />
                    <span className={`text-xs font-medium ${selectedRole === 'ADMIN' ? 'text-blue-700' : 'text-gray-700'}`}>ADMIN</span>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === 'OPERATOR' 
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onClick={() => handleRoleChange('OPERATOR')}
                >
                  <div className="flex flex-col items-center">
                    <User className={`h-5 w-5 ${selectedRole === 'OPERATOR' ? 'text-blue-600' : 'text-gray-500'} mb-1`} />
                    <span className={`text-xs font-medium ${selectedRole === 'OPERATOR' ? 'text-blue-700' : 'text-gray-700'}`}>OPERATOR</span>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === 'VIEWER' 
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onClick={() => handleRoleChange('VIEWER')}
                >
                  <div className="flex flex-col items-center">
                    <Eye className={`h-5 w-5 ${selectedRole === 'VIEWER' ? 'text-blue-600' : 'text-gray-500'} mb-1`} />
                    <span className={`text-xs font-medium ${selectedRole === 'VIEWER' ? 'text-blue-700' : 'text-gray-700'}`}>VIEWER</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    required
                    className={`block w-full pl-9 pr-3 py-2.5 border ${
                      error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-200 bg-gray-50 focus:bg-white`}
                    placeholder="First name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    required
                    className={`block w-full pl-9 pr-3 py-2.5 border ${
                      error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-200 bg-gray-50 focus:bg-white`}
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={`block w-full pl-9 pr-3 py-2.5 border ${
                      error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-200 bg-gray-50 focus:bg-white`}
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full pl-9 pr-3 py-2.5 border ${
                    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-200 bg-gray-50 focus:bg-white`}
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Business Information Section - Conditional based on role */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base font-medium text-gray-900 mb-3">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRole === 'ADMIN' && (
                  <div>
                    <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="client_name"
                        name="client_name"
                        type="text"
                        required
                        className={`block w-full pl-9 pr-3 py-2.5 border ${
                          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-200 bg-gray-50 focus:bg-white`}
                        placeholder="Your business name"
                        value={formData.client_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="client_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="client_email"
                      name="client_email"
                      type="email"
                      required
                      className={`block w-full pl-9 pr-3 py-2.5 border ${
                        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-200 bg-gray-50 focus:bg-white`}
                      placeholder={selectedRole === 'ADMIN' ? "business@example.com" : "business@example.com"}
                      value={formData.client_email}
                      onChange={handleChange}
                    />
                  </div>
                  {selectedRole !== 'ADMIN' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Business email you want to register to
                    </p>
                  )}
                </div>
              </div>

              {selectedRole === 'ADMIN' && (
                <div className="mt-4">
                  <label htmlFor="client_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute top-2.5 left-3 flex items-start pointer-events-none">
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <textarea
                      id="client_description"
                      name="client_description"
                      rows={2}
                      className={`block w-full pl-9 pr-3 py-2.5 border ${
                        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-200 bg-gray-50 focus:bg-white resize-none`}
                      placeholder="Brief description of your business"
                      value={formData.client_description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Password Fields Row */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base font-medium text-gray-900 mb-3">Security</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className={`block w-full pl-9 pr-10 py-2.5 border ${
                        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-200 bg-gray-50 focus:bg-white`}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {/* Password requirements checklist */}
                  {(passwordFocused || formData.password.length > 0) && (
                    <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-1.5">Password requirements:</p>
                      <div className="grid grid-cols-1 gap-1">
                        <div className="flex items-center text-xs">
                          {passwordValidation.minLength ? (
                            <Check className="h-3 w-3 text-green-500 mr-1.5" />
                          ) : (
                            <X className="h-3 w-3 text-red-500 mr-1.5" />
                          )}
                          <span className={passwordValidation.minLength ? "text-green-700" : "text-gray-600"}>
                            8+ characters
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          {passwordValidation.hasUppercase ? (
                            <Check className="h-3 w-3 text-green-500 mr-1.5" />
                          ) : (
                            <X className="h-3 w-3 text-red-500 mr-1.5" />
                          )}
                          <span className={passwordValidation.hasUppercase ? "text-green-700" : "text-gray-600"}>
                            Uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          {passwordValidation.hasLowercase ? (
                            <Check className="h-3 w-3 text-green-500 mr-1.5" />
                          ) : (
                            <X className="h-3 w-3 text-red-500 mr-1.5" />
                          )}
                          <span className={passwordValidation.hasLowercase ? "text-green-700" : "text-gray-600"}>
                            Lowercase letter
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          {passwordValidation.hasNumber ? (
                            <Check className="h-3 w-3 text-green-500 mr-1.5" />
                          ) : (
                            <X className="h-3 w-3 text-red-500 mr-1.5" />
                          )}
                          <span className={passwordValidation.hasNumber ? "text-green-700" : "text-gray-600"}>
                            Number
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          {passwordValidation.hasSpecial ? (
                            <Check className="h-3 w-3 text-green-500 mr-1.5" />
                          ) : (
                            <X className="h-3 w-3 text-red-500 mr-1.5" />
                          )}
                          <span className={passwordValidation.hasSpecial ? "text-green-700" : "text-gray-600"}>
                            Special character
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className={`block w-full pl-9 pr-10 py-2.5 border ${
                        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-200 bg-gray-50 focus:bg-white`}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

                      {/* Terms and Conditions */}
            <div className="mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </div>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <RouterLink to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </RouterLink>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Carbonation Co-Pilot. All rights reserved.
        </p>
      </div>
    </div>
  );
}