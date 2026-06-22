import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ADMIN_EMAIL = 'stepsandcarry24@gmail.com';
const ADMIN_PASSWORD = 'admin@SC2024';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginWithGoogle, updateUser } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = location.state?.redirect || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const doAdminLogin = async () => {
    const result = await login({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    if (result?.success) {
      sessionStorage.setItem('sc_admin_auth', JSON.stringify({ email: ADMIN_EMAIL, name: result.user?.name || 'Admin', isGoogle: false }));
      setSuccess('✅ Admin login successful! Redirecting...');
      setTimeout(() => navigate('/admin'), 800);
    } else {
      // Show error — don't silently fall back to demo mode
      setError(result?.message || 'Admin login failed. Please check credentials or ensure backend is running.');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      if (result?.success) {
        const userEmail = result?.user?.email || '';
        if (userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          sessionStorage.setItem('sc_admin_auth', JSON.stringify({ email: userEmail, name: result.user?.name || 'Admin', isGoogle: true }));
          setSuccess('✅ Admin Google login successful!');
          setTimeout(() => navigate('/admin'), 800);
        } else {
          setSuccess('✅ Google login successful!');
          setTimeout(() => navigate(redirectPath), 800);
        }
      } else {
        setError(result?.message || 'Google login failed. Please try again.');
      }
    } catch (err) {
      setError('Google login failed: ' + (err?.message || 'Please try again.'));
    }
    setGoogleLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() && formData.password === ADMIN_PASSWORD) {
      doAdminLogin();
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await login({ email: formData.email, password: formData.password });
      } else {
        if (formData.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        result = await register({ name: formData.name, email: formData.email, password: formData.password, phone: formData.phone ? `+91${formData.phone}` : '' });
      }
      if (result?.success) {
        setSuccess('✅ ' + (isLogin ? 'Login' : 'Account created') + ' successful!');
        setTimeout(() => navigate(redirectPath), 800);
      } else {
        setError(result?.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-[#E63946]">STEPS &amp; CARRY</Link>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">SHOE &amp; SOLE</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isLogin ? 'Login to your account' : 'Join Steps & Carry today'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
              <span>✅</span> {success}
            </div>
          )}

          {/* ── GOOGLE LOGIN BUTTON ── */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 hover:border-gray-300 dark:border-gray-600 hover:shadow-md transition-all disabled:opacity-60 mb-5"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{googleLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium px-2">or use email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 dark:bg-gray-700 dark:text-white"
                  placeholder="Your full name"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 dark:bg-gray-700 dark:text-white"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 dark:bg-gray-700 dark:text-white pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (optional)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm font-medium">+91</span>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-r-xl focus:outline-none focus:border-[#E63946] dark:bg-gray-700 dark:text-white"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#E63946] text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-60 text-base mt-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); setFormData({ email: '', password: '', name: '', phone: '' }); }}
              className="text-[#E63946] text-sm font-semibold hover:underline"
            >
              {isLogin ? "Don't have an account? Create one now →" : '← Already have an account? Login'}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-4">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
