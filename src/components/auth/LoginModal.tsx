'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import { MdClose as Close } from 'react-icons/md';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/components/auth/Login.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

type AuthMode = 'signup' | 'login';

export default function LoginModal({ isOpen, onClose, redirectTo }: LoginModalProps) {
  const router = useRouter();
  const {
    user,
    loginWithGoogle,
    loginWithPassword,
    register,
    isLoading: authIsLoading,
    isOTPLoading,
    error,
    clearError,
    hasRole,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    setMode('login');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });
    clearError();
  }, [isOpen, clearError]);

  useEffect(() => {
    if (!user || authIsLoading || isOTPLoading || !isOpen) return;

    onClose();

    if (hasRole('admin') || hasRole('super_admin')) {
      router.push('/admin');
      return;
    }

    if (hasRole('user')) {
      router.push(redirectTo || '/');
    }
  }, [user, authIsLoading, isOTPLoading, isOpen, hasRole, onClose, redirectTo, router]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrors({});
    clearError();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (error) {
      clearError();
    }
  };

  const validateLogin = () => {
    const nextErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email || !emailRegex.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password || formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateSignup = () => {
    const nextErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      nextErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      nextErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = 'Email is invalid';
    }

    if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
      nextErrors.phone = 'Phone number is invalid';
    }

    if (!formData.password || formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      nextErrors.password = 'Use uppercase, lowercase, and a number';
    }

    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateLogin()) return;

    setErrors({});
    clearError();

    try {
      await loginWithPassword(formData.email, formData.password);
    } catch (loginError: unknown) {
      const message = loginError instanceof Error ? loginError.message : 'Login failed. Please check your email and password.';
      setErrors({ password: message });
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateSignup()) return;

    setErrors({});
    clearError();

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });
    } catch (registerError: unknown) {
      const message = registerError instanceof Error ? registerError.message : 'Signup failed. Please try again.';
      setErrors({ form: message });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (googleError) {
      console.error('Google login error:', googleError);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-white/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-[98vw] sm:max-w-md md:max-w-2xl lg:max-w-4xl transform overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-2xl flex flex-col lg:flex-row min-h-[500px] sm:min-h-[550px] lg:min-h-[600px] max-h-[98vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-20 lg:text-white lg:hover:text-pink-200 bg-white/80 lg:bg-transparent rounded-full p-1.5 lg:p-0 backdrop-blur-sm lg:backdrop-blur-none"
            aria-label="Close login modal"
          >
            <Close className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>

          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4B006E] via-[#6B1A7A] to-[#4B006E] relative overflow-hidden items-center justify-center p-10 rounded-l-2xl">
            <div className="relative z-10 text-center">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-3xl font-cormorant text-white mb-2"
              >
                Welcome to FEFA
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-pink-100 text-sm"
              >
                {mode === 'signup' ? 'Create your account in seconds' : 'Login with your email and password'}
              </motion.p>
            </div>
          </div>

          <div className="w-full lg:w-1/2 bg-white p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-center rounded-r-lg sm:rounded-r-2xl">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-3 sm:mb-4">
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg sm:text-xl md:text-2xl font-serif text-gray-800 mb-1"
                >
                  {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-gray-600 text-xs sm:text-sm"
                >
                  {mode === 'signup' ? 'Sign up to continue' : 'Enter your email and password to continue'}
                </motion.p>
              </div>

              {(error || errors.form) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg mb-4 text-xs"
                >
                  {errors.form || error}
                </motion.div>
              )}

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={mode === 'signup' ? handleSignupSubmit : handleLoginSubmit}
                className="space-y-2.5 sm:space-y-3"
              >
                {mode === 'signup' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div>
                        <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            id="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className={`w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                            placeholder="First name"
                            required
                          />
                        </div>
                        {errors.firstName && <p className="text-red-600 text-[10px] sm:text-xs mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            id="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className={`w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                            placeholder="Last name"
                            required
                          />
                        </div>
                        {errors.lastName && <p className="text-red-600 text-[10px] sm:text-xs mt-1">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      {errors.phone && <p className="text-red-600 text-[10px] sm:text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-600 text-[10px] sm:text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                      placeholder="Enter your password"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-600 text-[10px] sm:text-xs mt-1">{errors.password}</p>}
                </div>

                {mode === 'signup' && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-600 text-[10px] sm:text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                )}

                {mode === 'login' && (
                  <div className="text-right">
                    <Link href="/auth/forgot-password" onClick={onClose} className="text-xs text-primary hover:text-accent transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="bg-primary hover:bg-primary/90 text-white text-sm sm:text-xs font-medium py-3 sm:py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isOTPLoading || authIsLoading}
                >
                  {isOTPLoading || authIsLoading ? (
                    <span>{mode === 'signup' ? 'Creating account...' : 'Logging in...'}</span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {mode === 'signup' ? 'Create account' : 'Login'}
                      <FiArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  )}
                </Button>

                {mode === 'login' && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="text-xs text-primary hover:text-accent transition-colors font-medium"
                    >
                      Create account
                    </button>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs text-primary hover:text-accent transition-colors font-medium"
                    >
                      Already have an account? Login
                    </button>
                  </div>
                )}
              </motion.form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative my-3"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7, type: 'spring' }}
              >
                <Button
                  variant="outline"
                  fullWidth
                  className="bg-white border-2 border-gray-300 text-gray-700 text-xs hover:bg-gray-50 hover:border-gray-400 py-2.5 sm:py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={handleGoogleLogin}
                  disabled={authIsLoading || isOTPLoading}
                >
                  {authIsLoading || isOTPLoading ? 'Connecting...' : 'Continue with Google'}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
