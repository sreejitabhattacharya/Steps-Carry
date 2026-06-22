import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import QRScanner from '../components/QRScanner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const UPI_ID = 'patrashreya477@okhdfcbank';
const QR_URL = `https://chart.googleapis.com/chart?chs=160x160&cht=qr&chl=upi://pay?pa=${UPI_ID}%26pn=Steps%20and%20Carry%26cu=INR&choe=UTF-8`;

const ADMIN_EMAIL = 'stepsandcarry24@gmail.com';
const ADMIN_PASSWORD = 'Admin@1234';

//  GOOGLE LOGIN FLIP CARD
const GoogleLoginFlipCard = ({ onAdminLogin }) => {
  const [flipped, setFlipped] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleStep, setGoogleStep] = useState('idle'); // idle | verifying | done | denied | error
  const [googleError, setGoogleError] = useState('');

  const handleGoogleClick = async () => {
    setGoogleStep('verifying');
    setGoogleError('');
    setFlipped(true);
    try {
      // Real Firebase Google sign-in popup
      const { signInWithGoogle } = await import('../config/firebase');
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) {
        setGoogleStep('denied');
        setGoogleError('Google sign-in was cancelled.');
        return;
      }

      // Check if the Google account is the admin email
      if (firebaseUser.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setGoogleStep('denied');
        setGoogleError('This Google account is not authorized as admin.');
        return;
      }

      // Call backend to get real JWT
      const res = await fetch(`${API}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: firebaseUser.displayName || 'Admin',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || '',
          googleId: firebaseUser.uid,
        }),
      });
      const data = await res.json();
      if (data.success && data.user?.isAdmin) {
        // Save real JWT token — NOT 'admin-token'
        localStorage.setItem('sc_token', data.token);
        localStorage.setItem('sc_user', JSON.stringify({ ...data.user, isAdmin: true }));
        setGoogleStep('done');
        setTimeout(() => onAdminLogin({ _id: data.user._id, email: data.user.email, name: data.user.name || 'Admin', isGoogle: true, token: data.token, isAdmin: true }), 800);
      } else {
        setGoogleStep('denied');
        setGoogleError(data.message || 'This account is not authorized as admin.');
      }
    } catch (err) {
      setGoogleStep('error');
      setGoogleError(err.message || 'Google sign-in failed. Try password login.');
    }
  };

  // Password-based admin login — calls real backend
  const handleAdminLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user?.isAdmin) {
        localStorage.setItem('sc_token', data.token);
        localStorage.setItem('sc_user', JSON.stringify({ ...data.user, isAdmin: true }));
        onAdminLogin({ _id: data.user._id, email: data.user.email, name: data.user.name || 'Admin', isGoogle: false, token: data.token, isAdmin: true });
      } else if (data.success && !data.user?.isAdmin) {
        setError('This account does not have admin access.');
      } else {
        setError(data.message || 'Invalid admin credentials.');
      }
    } catch {
      setError('Cannot reach backend. Make sure server is running.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0808 50%, #0a0a0a 100%)' }}>

      {/* Animated bg orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: `${180 + i * 100}px`, height: `${180 + i * 100}px`,
              background: 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)',
              left: `${[5, 75, 15, 85, 45][i]}%`,
              top: `${[15, 65, 75, 10, 45][i]}%`,
              transform: 'translate(-50%, -50%)',
              animation: `float${i} ${4 + i}s ease-in-out infinite alternate`,
            }} />
        ))}
        {/* Subtle grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(230,57,70,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(230,57,70,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4" style={{ perspective: '1400px' }}>

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-px" style={{ background: 'rgba(230,57,70,0.4)' }} />
            <p className="text-gray-600 text-xs tracking-[0.35em] uppercase font-semibold">Admin Portal</p>
            <div className="w-8 h-px" style={{ background: 'rgba(230,57,70,0.4)' }} />
          </div>
          <p className="text-white font-black text-4xl tracking-wider" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.12em' }}>
            STEPS <span style={{ color: '#E63946' }}>&</span> CARRY
          </p>
          <p className="text-gray-700 text-xs mt-2 tracking-[0.25em]">SHOE & SOLE MANAGEMENT</p>
        </div>

        {/* THE FLIP CARD */}
        <div className="relative w-full" style={{
          height: '490px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.75s cubic-bezier(0.23, 1, 0.32, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>

          {/* FRONT */}
          <div className="absolute inset-0 rounded-3xl" style={{
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
          }}>
            <div className="p-7 h-full flex flex-col">
              {/* Admin shield badge */}
              <div className="flex items-center gap-3 mb-7 px-4 py-3 rounded-2xl" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)' }}>
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="text-white font-bold text-sm">Secure Admin Access</p>
                  <p className="text-gray-500 text-xs">Identity verification required</p>
                </div>
              </div>

              <h2 className="text-white text-2xl font-black mb-1">Welcome Back</h2>
              <p className="text-gray-600 text-sm mb-6">Sign in to manage your store</p>

              {/* Google button */}
              <button onClick={handleGoogleClick}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] mb-4"
                style={{ background: 'white', color: '#1a1a1a', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
                <span className="ml-auto text-xs text-gray-400 font-normal">→</span>
              </button>

              <div className="flex items-center gap-3 my-1 mb-4">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }}/>
                <span className="text-gray-700 text-xs font-medium">or admin password</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }}/>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="Admin email address"
                    className="w-full px-4 py-3.5 rounded-xl text-white text-sm placeholder-gray-700 outline-none transition-all pr-10"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(230,57,70,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 text-sm">✉️</span>
                </div>
                <div className="relative">
                  <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Admin password"
                    className="w-full px-4 py-3.5 rounded-xl text-white text-sm placeholder-gray-700 outline-none transition-all pr-10"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(230,57,70,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 text-sm">🔒</span>
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)' }}>
                    <span className="text-xs">⚠️</span>
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}
                <button onClick={handleAdminLogin} disabled={loading}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #E63946 0%, #c1121f 100%)', boxShadow: '0 8px 25px rgba(230,57,70,0.4)' }}>
                  {loading ? '⏳ Verifying…' : '🔓 Sign In as Admin'}
                </button>
              </div>
            </div>
          </div>

          {/* BACK — Google verification status */}
          <div className="absolute inset-0 rounded-3xl" style={{
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
          }}>
            <div className="p-7 h-full flex flex-col">
              {(googleStep === 'denied' || googleStep === 'error') && (
                <button onClick={() => { setFlipped(false); setGoogleStep('idle'); setGoogleError(''); }}
                  className="flex items-center gap-2 text-gray-600 hover:text-white text-sm mb-5 transition-colors w-fit">
                  ← Back
                </button>
              )}

              {/* Google logo */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-2xl">
                  <svg className="w-9 h-9" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              </div>

              {googleStep === 'verifying' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className="w-14 h-14 rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-gray-800 border-b-red-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                  </div>
                  <p className="text-white font-bold mb-1">Signing in with Google…</p>
                  <p className="text-gray-500 text-xs mb-6">Please complete the Google popup</p>
                  <div className="space-y-2 w-full">
                    {['Opening Google auth popup…', 'Verifying admin access…', 'Loading permissions…'].map((step, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                        <p className="text-gray-500 text-xs">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {googleStep === 'done' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <p className="text-white font-black text-xl">Admin Verified!</p>
                  <p className="text-green-400 text-sm mt-1">Loading dashboard…</p>
                </div>
              )}

              {googleStep === 'denied' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mb-4">
                    <span className="text-3xl">🚫</span>
                  </div>
                  <p className="text-white font-black text-lg text-center mb-2">Access Denied</p>
                  <p className="text-gray-500 text-sm text-center mb-6">{googleError || 'This Google account is not authorized as admin.'}</p>
                  <button onClick={() => { setFlipped(false); setGoogleStep('idle'); setGoogleError(''); }}
                    className="px-6 py-3 rounded-xl font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
                    Try Again
                  </button>
                </div>
              )}

              {googleStep === 'error' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center mb-4">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <p className="text-white font-black text-lg text-center mb-2">Sign-in Failed</p>
                  <p className="text-gray-500 text-xs text-center mb-6">{googleError}</p>
                  <button onClick={() => { setFlipped(false); setGoogleStep('idle'); setGoogleError(''); }}
                    className="px-6 py-3 rounded-xl font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
                    Use Password Instead
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-gray-800 text-xs mt-5">
          🔒 Protected Admin Portal · Steps & Carry
        </p>
      </div>

      <style>{`
        @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
      `}</style>
    </div>
  );
};

//  MAIN ADMIN PANEL
const AdminPanel = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [adminAuth, setAdminAuth] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, newMessages: 0, totalRevenue: 0, cancelledOrders: 0, deliveredOrders: 0, recentOrders: [], monthlyRevenue: Array(12).fill(0) });
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [toast, setToast] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', brand: '', price: '', originalPrice: '', category: 'Casual', gender: 'Unisex', sizes: '', colors: '', stock: '', description: '', images: '' });
  // Inline stock edit
  const [stockEdit, setStockEdit] = useState({}); // { [productId]: value }
  const [stockSaving, setStockSaving] = useState(null);

  // Always get fresh token for each request — use real JWT from localStorage
  const getHeaders = () => {
    // Always read fresh token — never fall back to 'admin-token' since backend now rejects it without DB user
    const token = localStorage.getItem('sc_token');
    if (!token) {
      console.warn('No admin token found in localStorage');
      return { 'Content-Type': 'application/json' };
    }
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('sc_admin_auth');
    if (saved) {
      try {
        setAdminAuth(JSON.parse(saved));
        return;
      } catch {}
    }
    if (user?.isLoggedIn && (user?.isAdmin === true || user?.email === 'stepsandcarry24@gmail.com')) {
      const a = { email: user.email, name: user.name || 'Admin', isGoogle: false };
      sessionStorage.setItem('sc_admin_auth', JSON.stringify(a));
      setAdminAuth(a); return;
    }
    try {
      const savedUser = JSON.parse(localStorage.getItem('sc_user') || '{}');
      if (savedUser?.isAdmin === true || savedUser?.email === 'stepsandcarry24@gmail.com') {
        const a = { email: savedUser.email, name: savedUser.name || 'Admin', isGoogle: false };
        sessionStorage.setItem('sc_admin_auth', JSON.stringify(a));
        setAdminAuth(a);
      }
    } catch {}
  }, [user]);

  const handleAdminLogin = (adminData) => {
    sessionStorage.setItem('sc_admin_auth', JSON.stringify(adminData));
    // Use real JWT token from backend login
    if (adminData.token) {
      localStorage.setItem('sc_token', adminData.token);
    }
    localStorage.setItem('sc_user', JSON.stringify({
      _id: adminData._id || null,
      name: adminData.name || 'Admin',
      email: adminData.email,
      isAdmin: true,
    }));
    setAdminAuth(adminData);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('sc_admin_auth');
    setAdminAuth(null);
  };

  // ── DEMO DATA fallback ──
  const DEMO_USERS = [
    { _id: 'd1', name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+91 98765 43210', createdAt: '2024-11-10T10:00:00Z' },
    { _id: 'd2', name: 'Priya Das',    email: 'priya@gmail.com',  phone: '+91 91234 56789', createdAt: '2024-12-01T08:30:00Z' },
    { _id: 'd3', name: 'Souvik Roy',   email: 'souvik@gmail.com', phone: '+91 70000 11111', createdAt: '2025-01-05T14:00:00Z' },
    { _id: 'd4', name: 'Ankita Sen',   email: 'ankita@gmail.com', phone: '+91 88888 22222', createdAt: '2025-02-14T09:00:00Z' },
    { _id: 'd5', name: 'Amit Kumar',   email: 'amit@gmail.com',   phone: '+91 77777 33333', createdAt: '2025-03-20T11:00:00Z' },
  ];
  const DEMO_ORDERS = [
    { _id: 'o1', user: { name: 'Rahul Sharma', email: 'rahul@gmail.com' }, totalAmount: 2499, status: 'Delivered',  paymentMethod: { type: 'UPI' },  createdAt: '2025-01-10T10:00:00Z' },
    { _id: 'o2', user: { name: 'Priya Das',    email: 'priya@gmail.com'  }, totalAmount: 3199, status: 'Shipped',   paymentMethod: { type: 'Card' }, createdAt: '2025-02-05T08:00:00Z' },
    { _id: 'o3', user: { name: 'Souvik Roy',   email: 'souvik@gmail.com' }, totalAmount: 1899, status: 'Placed',    paymentMethod: { type: 'COD' },  createdAt: '2025-03-01T13:00:00Z' },
    { _id: 'o4', user: { name: 'Ankita Sen',   email: 'ankita@gmail.com' }, totalAmount: 4299, status: 'Cancelled', paymentMethod: { type: 'UPI' },  createdAt: '2025-03-15T16:00:00Z' },
    { _id: 'o5', user: { name: 'Amit Kumar',   email: 'amit@gmail.com'   }, totalAmount: 2799, status: 'Confirmed', paymentMethod: { type: 'Card' }, createdAt: '2025-03-28T11:00:00Z' },
  ];
  const DEMO_PRODUCTS = [
    { _id: 'p1', name: 'Nike Air Max 270', brand: 'Nike', price: 12999, stock: 3, category: 'Sports', gender: 'Men', sizes: ['40','41','42','43'], colors: ['Black','White'], isActive: true },
    { _id: 'p2', name: 'Adidas Ultraboost', brand: 'Adidas', price: 15999, stock: 1, category: 'Running', gender: 'Unisex', sizes: ['39','40','41'], colors: ['Blue'], isActive: true },
    { _id: 'p3', name: 'Puma RS-X', brand: 'Puma', price: 8999, stock: 0, category: 'Casual', gender: 'Unisex', sizes: ['41','42','43'], colors: ['Red','White'], isActive: true },
    { _id: 'p4', name: 'Reebok Classic', brand: 'Reebok', price: 6499, stock: 5, category: 'Casual', gender: 'Women', sizes: ['36','37','38'], colors: ['White'], isActive: true },
  ];

  // ── FETCH DATA — always from real backend ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    const hdrs = getHeaders();
    try {
      if (activeTab === 'dashboard') {
        try {
          const [statsRes, usersRes, ordersRes] = await Promise.all([
            fetch(`${API}/admin/stats`, { headers: hdrs }),
            fetch(`${API}/admin/users`, { headers: hdrs }),
            fetch(`${API}/admin/orders`, { headers: hdrs }),
          ]);
          const statsData = await statsRes.json();
          const usersData = await usersRes.json();
          const ordersData = await ordersRes.json();
          if (statsData.success) setStats(statsData.stats);
          else showToast('Backend error: ' + statsData.message, 'error');
          if (usersData.success) setUsers(usersData.users);
          if (ordersData.success) setOrders(ordersData.orders || []);
        } catch (e) {
          showToast('Cannot reach backend. Is it running?', 'error');
        }
      } else if (activeTab === 'users') {
        try {
          const r = await fetch(`${API}/admin/users`, { headers: hdrs });
          const d = await r.json();
          if (d.success) setUsers(d.users);
          else showToast('Users load failed: ' + d.message, 'error');
        } catch { showToast('Backend offline', 'error'); }
      } else if (activeTab === 'orders') {
        try {
          const r = await fetch(`${API}/admin/orders`, { headers: hdrs });
          const d = await r.json();
          if (d.success) {
            setOrders(d.orders || []);
          } else {
            showToast('Orders load failed: ' + d.message, 'error');
            console.error('Admin orders error:', d.message);
            setOrders([]);
          }
        } catch (e) {
          showToast('Backend offline — cannot load orders', 'error');
          console.error('Admin orders fetch error:', e);
          setOrders([]);
        }
      } else if (activeTab === 'messages') {
        try {
          const r = await fetch(`${API}/admin/contacts`, { headers: hdrs });
          const d = await r.json();
          if (d.success) setMessages(d.messages);
        } catch {}
      } else if (activeTab === 'products') {
        try {
          const r = await fetch(`${API}/admin/products`, { headers: hdrs });
          const d = await r.json();
          if (d.success) setProducts(d.products);
          else showToast('Products load failed: ' + d.message, 'error');
        } catch { showToast('Backend offline', 'error'); }
      }
    } catch {}
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    if (!adminAuth) return;
    // Always fetch fresh data on tab change
    setTimeout(() => fetchData(), 100);
  }, [activeTab, adminAuth]);
  const refreshTab = () => fetchData();

  // ── ORDER STATUS UPDATE ──
  const updateOrderStatus = async (orderId, status) => {
    setStatusUpdating(orderId);
    const hdrs = getHeaders();
    try {
      const r = await fetch(`${API}/admin/orders/${orderId}/status`, { method: 'PUT', headers: hdrs, body: JSON.stringify({ status }) });
      const d = await r.json();
      if (d.success) { setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o)); showToast(`Status → "${status}" ✅`); }
      else showToast('Update failed', 'error');
    } catch { showToast('Network error', 'error'); }
    setStatusUpdating(null);
  };

  // ── USER DELETE ──
  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    const hdrs = getHeaders();
    try {
      const r = await fetch(`${API}/admin/users/${userId}`, { method: 'DELETE', headers: hdrs });
      const d = await r.json();
      if (d.success) { setUsers(prev => prev.filter(u => u._id !== userId)); showToast('User deleted'); }
    } catch { showToast('Delete failed', 'error'); }
  };

  // ── MESSAGE ACTIONS ──
  const markMessageRead = async (msgId) => {
    try {
      await fetch(`${API}/admin/contacts/${msgId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ status: 'Read' }) });
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, status: 'Read' } : m));
    } catch {}
  };
  const deleteMessage = async (msgId) => {
    try {
      await fetch(`${API}/admin/contacts/${msgId}`, { method: 'DELETE', headers: getHeaders() });
      setMessages(prev => prev.filter(m => m._id !== msgId));
      setSelectedMsg(null);
      showToast('Message deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  // ── PRODUCT ACTIONS ──
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', brand: '', price: '', originalPrice: '', category: 'Casual', gender: 'Unisex', sizes: '', colors: '', stock: '10', description: '', images: '' });
    setShowProductModal(true);
  };
  const openEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || '', brand: p.brand || '', price: p.price || '', originalPrice: p.originalPrice || '',
      category: p.category || 'Casual', gender: p.gender || 'Unisex',
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || ''),
      colors: Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || ''),
      stock: p.stock ?? 10, description: p.description || '',
      images: Array.isArray(p.images) ? p.images.join('\n') : (p.images || ''),
    });
    setShowProductModal(true);
  };
  const saveProduct = async () => {
    if (!productForm.name || !productForm.price) { showToast('Name & Price required', 'error'); return; }
    const body = {
      ...productForm,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      stock: Number(productForm.stock) || 0,
      sizes: productForm.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: productForm.colors.split(',').map(c => c.trim()).filter(Boolean),
      images: productForm.images.split('\n').map(i => i.trim()).filter(Boolean),
    };
    try {
      let r, d;
      if (editingProduct) {
        r = await fetch(`${API}/admin/products/${editingProduct._id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) });
        d = await r.json();
        if (d.success) { setProducts(prev => prev.map(p => p._id === editingProduct._id ? d.product : p)); showToast('Product updated ✅'); }
      } else {
        r = await fetch(`${API}/admin/products`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
        d = await r.json();
        if (d.success) { setProducts(prev => [d.product, ...prev]); showToast('Product added ✅'); }
      }
      if (!d?.success) showToast(d?.message || 'Failed', 'error');
    } catch { showToast('Backend offline – demo mode only', 'error'); }
    setShowProductModal(false);
  };
  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const r = await fetch(`${API}/admin/products/${productId}`, { method: 'DELETE', headers: getHeaders() });
      const d = await r.json();
      if (d.success) { setProducts(prev => prev.filter(p => p._id !== productId)); showToast('Product deleted'); }
      else showToast('Delete failed', 'error');
    } catch { showToast('Backend offline', 'error'); }
  };

  // ── QUICK STOCK UPDATE (inline) ──
  const updateStock = async (productId, newStock) => {
    const val = Number(newStock);
    if (isNaN(val) || val < 0) { showToast('Invalid stock value', 'error'); return; }
    setStockSaving(productId);
    try {
      const r = await fetch(`${API}/admin/products/${productId}`, {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify({ stock: val }),
      });
      const d = await r.json();
      if (d.success) {
        setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: val } : p));
        showToast(`Stock updated to ${val} ✅`);
      } else showToast(d.message || 'Update failed', 'error');
    } catch { showToast('Backend offline', 'error'); }
    setStockSaving(null);
    setStockEdit(prev => { const n = { ...prev }; delete n[productId]; return n; });
  };

  // ── SEED ALL STATIC PRODUCTS ──
  const seedProducts = async () => {
    if (!window.confirm('This will add all static products from the catalogue to the database (skips existing ones). Continue?')) return;
    try {
      const r = await fetch(`${API}/admin/products/seed`, { method: 'POST', headers: getHeaders() });
      const d = await r.json();
      if (d.success) {
        showToast(`Seeded! Added: ${d.added}, Skipped: ${d.skipped} ✅`);
        fetchData();
      } else showToast(d.message || 'Seed failed', 'error');
    } catch { showToast('Backend offline', 'error'); }
  };

  const getStatusColor = (status) => ({
    Placed: 'bg-amber-100 text-amber-700 border border-amber-300',
    Confirmed: 'bg-blue-100 text-blue-700 border border-blue-300',
    Shipped: 'bg-indigo-100 text-indigo-700 border border-indigo-300',
    'Out for Delivery': 'bg-orange-100 text-orange-700 border border-orange-300',
    Delivered: 'bg-green-100 text-green-700 border border-green-300',
    Cancelled: 'bg-red-100 text-red-700 border border-red-300',
    New: 'bg-red-100 text-red-700 border border-red-300',
    Read: 'bg-gray-100 text-gray-600 border border-gray-300',
    Replied: 'bg-green-100 text-green-700 border border-green-300',
  }[status] || 'bg-gray-100 text-gray-700');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orders',    label: 'Orders',    icon: '📦' },
    { id: 'users',     label: 'Customers', icon: '👥' },
    { id: 'products',  label: 'Products',  icon: '👟' },
    { id: 'messages',  label: 'Messages',  icon: '💬' },
  ];

  const newMsgCount = messages.filter(m => m.status === 'New').length;
  const cancelledCount = orders.length ? orders.filter(o => o.status === 'Cancelled').length : (stats.cancelledOrders || 0);
  const deliveredCount = orders.length ? orders.filter(o => o.status === 'Delivered').length : (stats.deliveredOrders || 0);
  const activeOrderCount = orders.length ? orders.filter(o => !['Cancelled','Delivered'].includes(o.status)).length : 0;
  const liveUserCount = users.length || stats.totalUsers || 0;
  const liveOrderCount = orders.length || stats.totalOrders || 0;
  const liveRevenue = orders.length
    ? orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.totalAmount || 0), 0)
    : (stats.totalRevenue || 0);
  const avgOrderValue = liveOrderCount ? Math.round(liveRevenue / liveOrderCount) : 0;
  const chartData = stats.monthlyRevenue?.some(v => v > 0)
    ? (() => { const max = Math.max(...stats.monthlyRevenue, 1); return stats.monthlyRevenue.map(v => Math.round((v / max) * 100)); })()
    : (() => {
        const months = Array(12).fill(0);
        orders.forEach(o => { if (o.status !== 'Cancelled' && o.createdAt) months[new Date(o.createdAt).getMonth()] += o.totalAmount || 0; });
        const max = Math.max(...months, 1);
        return months.map(v => Math.round((v / max) * 100));
      })();

  if (!adminAuth) return <GoogleLoginFlipCard onAdminLogin={handleAdminLogin} />;

  return (
    <div className="min-h-screen flex dark:bg-gray-900" style={{ background: '#f5f0e8', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-2xl shadow-2xl text-white font-bold text-sm flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ animation: 'slideIn 0.3s ease' }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {showScanner && <QRScanner onClose={() => setShowScanner(false)} />}

      {/* ── PRODUCT MODAL ── */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#f0ece4' }}>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
              <button onClick={() => setShowProductModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Product Name *', key: 'name', type: 'text', placeholder: 'Nike Air Max 270' },
                { label: 'Brand', key: 'brand', type: 'text', placeholder: 'Nike' },
                { label: 'Selling Price (₹) *', key: 'price', type: 'number', placeholder: '12999' },
                { label: 'Original Price (₹)', key: 'originalPrice', type: 'number', placeholder: '15999' },
                { label: 'Stock Quantity', key: 'stock', type: 'number', placeholder: '10' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={productForm[f.key]} onChange={e => setProductForm(p => ({...p, [f.key]: e.target.value}))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E63946] text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select value={productForm.category} onChange={e => setProductForm(p => ({...p, category: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946]">
                    {['Casual','Sports','Running','Formal','Sandals','Boots','Kids'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                  <select value={productForm.gender} onChange={e => setProductForm(p => ({...p, gender: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946]">
                    {['Men','Women','Kids','Unisex'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sizes (comma separated)</label>
                <input type="text" value={productForm.sizes} onChange={e => setProductForm(p => ({...p, sizes: e.target.value}))}
                  placeholder="38, 39, 40, 41, 42, 43"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E63946] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Colors (comma separated)</label>
                <input type="text" value={productForm.colors} onChange={e => setProductForm(p => ({...p, colors: e.target.value}))}
                  placeholder="Black, White, Red"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E63946] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Image URLs (one per line)</label>
                <textarea value={productForm.images} onChange={e => setProductForm(p => ({...p, images: e.target.value}))}
                  placeholder="https://example.com/shoe1.jpg&#10;https://example.com/shoe2.jpg"
                  rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E63946] text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={productForm.description} onChange={e => setProductForm(p => ({...p, description: e.target.value}))}
                  placeholder="Product description..."
                  rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E63946] text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowProductModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={saveProduct}
                className="flex-1 py-3 rounded-xl text-white font-black text-sm hover:scale-[1.02] transition-all"
                style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)', boxShadow: '0 4px 15px rgba(230,57,70,0.3)' }}>
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SIDEBAR ─── */}
      <div className={`flex flex-col fixed h-full z-20 shadow-2xl transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
        style={{ background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black"
                    style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
                    {adminAuth.name?.charAt(0) || 'A'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-gray-900"></div>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm">Admin Profile</p>
                  <p className="text-gray-500 text-xs truncate">{adminAuth.email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-green-400 text-xs font-semibold">Administrator</p>
                  </div>
                </div>
              </div>
              <div className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)' }}>
                <p className="text-red-400 font-black text-xs tracking-[0.2em]">STEPS & CARRY</p>
                <p className="text-gray-600 text-xs mt-0.5">SHOE & SOLE — Admin Panel</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm relative"
                style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
                A
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-gray-900"></div>
              </div>
            </div>
          )}
        </div>

        <nav className="p-3 flex-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-left transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:bg-white/5 hover:text-gray-300'}`}
              style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #E63946, #c1121f)', boxShadow: '0 4px 15px rgba(230,57,70,0.3)' } : {}}>
              <span className="text-xl flex-shrink-0">{tab.icon}</span>
              {!sidebarCollapsed && <span className="font-semibold text-sm">{tab.label}</span>}
              {tab.id === 'messages' && newMsgCount > 0 && (
                <span className={`${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-black`}>
                  {newMsgCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {!sidebarCollapsed && (
            <>
              <button onClick={() => navigate('/')}
                className="w-full flex items-center gap-2 text-gray-600 hover:text-gray-300 text-xs px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all font-medium">
                ← Back to Website
              </button>
              <button onClick={() => setShowScanner(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
                <span>📷</span><span>QR Scanner</span>
              </button>
              <button onClick={handleAdminLogout}
                className="w-full flex items-center gap-2 text-gray-700 hover:text-red-400 text-xs px-3 py-2.5 rounded-xl hover:bg-red-400/10 transition-all font-semibold">
                🚪 Sign Out
              </button>
            </>
          )}
          <button onClick={() => setSidebarCollapsed(v => !v)}
            className="w-full flex items-center justify-center py-2 text-gray-800 hover:text-gray-500 text-sm transition-colors">
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>

        {/* Navbar */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-md flex items-center justify-between px-6 h-14" style={{ borderBottom: '2px solid #E63946' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-[#E63946] tracking-wide">STEPS & CARRY</span>
            <span className="hidden sm:inline text-xs font-semibold text-gray-500 border-l border-gray-200 pl-3">SHOE & SOLE</span>
            <span className="ml-2 flex items-center gap-1 bg-[#E63946] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">🛡️ ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-600">{adminAuth.name || 'Admin'}</span>
            </div>
            <button onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#E63946] border-2 border-[#E63946] hover:bg-[#E63946] hover:text-white transition-all">
              ← Website
            </button>
          </div>
        </div>

        {/* Page header */}
        <div className="sticky top-14 z-10 px-8 py-4 flex items-center justify-between"
          style={{ background: 'rgba(245,240,232,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e0d8cc' }}>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-sm text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refreshTab} className="px-4 py-2 rounded-xl text-sm font-semibold border text-gray-600 hover:bg-white transition-all" style={{ borderColor: '#ddd' }}>
              ↻ Refresh
            </button>
            {activeTab === 'products' && (
              <button onClick={openAddProduct}
                className="px-5 py-2 text-white rounded-xl font-black text-sm hover:scale-[1.02] transition-all"
                style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)', boxShadow: '0 4px 15px rgba(230,57,70,0.35)' }}>
                + Add Product
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && !loading && (
            <div>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { label: 'Total Revenue', value: `₹${liveRevenue.toLocaleString('en-IN')}`, icon: '💰', bg: 'linear-gradient(135deg,#fde8ea,#ffc5c9)' },
                  { label: 'Total Orders', value: liveOrderCount, icon: '🛒', bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' },
                  { label: 'Cancelled Orders', value: cancelledCount, icon: '❌', bg: 'linear-gradient(135deg,#fee2e2,#fca5a5)' },
                  { label: 'Total Customers', value: liveUserCount, icon: '👥', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5" style={{ border: '1px solid #f0ece4' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{ background: s.bg }}>{s.icon}</div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-sm text-gray-400 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Second row stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { label: 'Delivered Orders', value: deliveredCount, icon: '✅', bg: 'linear-gradient(135deg,#dcfce7,#86efac)' },
                  { label: 'Active Orders', value: activeOrderCount, icon: '🔄', bg: 'linear-gradient(135deg,#fef9c3,#fde047)' },
                  { label: 'New Messages', value: newMsgCount || stats.newMessages || 0, icon: '💬', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
                  { label: 'Avg Order Value', value: `₹${avgOrderValue.toLocaleString('en-IN')}`, icon: '📈', bg: 'linear-gradient(135deg,#ede9fe,#c4b5fd)' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5" style={{ border: '1px solid #f0ece4' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{ background: s.bg }}>{s.icon}</div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-sm text-gray-400 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Chart + Recent Orders */}
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #f0ece4' }}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-black text-gray-900 dark:text-white text-lg">Monthly Revenue</h3>
                    <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: '#fde8ea', color: '#E63946' }}>{new Date().getFullYear()}</span>
                  </div>
                  <div className="h-36 flex items-end gap-1.5">
                    {chartData.map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-lg transition-all hover:opacity-80 relative group cursor-pointer"
                        style={{ height: `${Math.max(h, 4)}%`, background: i === new Date().getMonth() ? 'linear-gradient(180deg,#E63946,#c1121f)' : `rgba(230,57,70,${0.12 + i * 0.06})` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mt-3 font-medium">
                    {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m,i) => <span key={i}>{m}</span>)}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #f0ece4' }}>
                  <h3 className="font-black text-gray-900 dark:text-white text-lg mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Orders', value: liveOrderCount, color: 'bg-blue-500' },
                      { label: 'Delivered', value: deliveredCount, color: 'bg-green-500' },
                      { label: 'Active', value: activeOrderCount, color: 'bg-amber-500' },
                      { label: 'Cancelled', value: cancelledCount, color: 'bg-red-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                        <span className="font-black text-gray-900 dark:text-white">{item.value}</span>
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${liveOrderCount ? Math.round((item.value/liveOrderCount)*100) : 0}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #f0ece4' }}>
                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#f0ece4' }}>
                  <h3 className="font-black text-gray-900 dark:text-white">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs px-3 py-1.5 text-white rounded-xl font-bold" style={{ background: 'linear-gradient(135deg,#E63946,#c1121f)' }}>View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ background: '#f8f5f0' }}>
                      <tr>{['Order ID','Customer','Amount','Payment','Status','Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {(stats.recentOrders || []).slice(0, 5).map(o => (
                        <tr key={o._id} className="border-t hover:bg-orange-50/40" style={{ borderColor: '#f5f0e8' }}>
                          <td className="px-4 py-3 text-xs font-mono text-gray-400">#{String(o._id).slice(-6).toUpperCase()}</td>
                          <td className="px-4 py-3 text-sm font-semibold">{o.user?.name || 'User'}</td>
                          <td className="px-4 py-3 text-sm font-black">₹{(o.totalAmount||0).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              o.paymentMethod?.type === 'COD'  ? 'bg-green-100 text-green-700' :
                              o.paymentMethod?.type === 'UPI'  ? 'bg-purple-100 text-purple-700' :
                              o.paymentMethod?.type === 'Card' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>{o.paymentMethod?.type || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getStatusColor(o.status)}`}>{o.status}</span></td>
                          <td className="px-4 py-3 text-xs text-gray-400">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}) : '—'}</td>
                        </tr>
                      ))}
                      {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                        <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-300"><p className="text-3xl mb-2">📦</p>No orders yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === 'orders' && !loading && (
            <div>
              {/* Refresh button */}
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => fetchData()}
                  className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#E63946,#c1121f)' }}>
                  🔄 Refresh Orders
                </button>
              </div>
              {/* Summary chips */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { label: 'Total', value: orders.length, color: 'bg-gray-100 text-gray-700' },
                  { label: 'Active', value: activeOrderCount, color: 'bg-blue-100 text-blue-700' },
                  { label: 'Delivered', value: deliveredCount, color: 'bg-green-100 text-green-700' },
                  { label: 'Cancelled', value: cancelledCount, color: 'bg-red-100 text-red-700' },
                ].map(c => (
                  <div key={c.label} className={`px-4 py-2 rounded-xl font-bold text-sm ${c.color}`}>
                    {c.label}: {c.value}
                  </div>
                ))}
              </div>
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-300 shadow-sm"><p className="text-5xl mb-4">📦</p><p className="font-semibold">No orders yet.</p></div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #f0ece4' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ background: '#f8f5f0' }}>
                        <tr>{['Order ID','Customer','Items','Date','Amount','Payment','Status','Action'].map(h => (
                          <th key={h} className="px-4 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o._id} className="border-t hover:bg-orange-50/30 transition-colors" style={{ borderColor: '#f5f0e8' }}>
                            <td className="px-4 py-3.5 text-xs font-mono text-gray-400">#{String(o._id).slice(-6).toUpperCase()}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#E63946,#c1121f)' }}>{o.user?.name?.charAt(0) || 'U'}</div>
                                <div><p className="text-sm font-bold text-gray-800">{o.user?.name || 'N/A'}</p><p className="text-xs text-gray-400">{o.user?.email}</p></div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-500">
                              {(o.items||[]).length > 0 ? (
                                <div>
                                  <p className="font-semibold truncate max-w-[120px]">{o.items[0]?.name}</p>
                                  {o.items.length > 1 && <p className="text-gray-400">+{o.items.length-1} more</p>}
                                </div>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'})}</td>
                            <td className="px-4 py-3.5 text-sm font-black">₹{(o.totalAmount||0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3.5 text-xs">
                              <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${
                                o.paymentMethod?.type === 'COD'  ? 'bg-green-100 text-green-700' :
                                o.paymentMethod?.type === 'UPI'  ? 'bg-purple-100 text-purple-700' :
                                o.paymentMethod?.type === 'Card' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {o.paymentMethod?.type || 'N/A'}
                              </span>
                              {o.paymentMethod?.details ? (
                                <p className="text-gray-400 text-xs mt-0.5 font-mono">{String(o.paymentMethod.details).slice(0,20)}</p>
                              ) : null}
                            </td>
                            <td className="px-4 py-3.5"><span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getStatusColor(o.status)}`}>{o.status}</span></td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col gap-1">
                                <select value={o.status} onChange={e => updateOrderStatus(o._id, e.target.value)} disabled={statusUpdating === o._id}
                                  className="text-xs border rounded-xl px-2.5 py-1.5 focus:outline-none font-semibold" style={{ borderColor: '#E63946', minWidth: '130px' }}>
                                  {['Placed','Confirmed','Shipped','Out for Delivery','Delivered','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {!['Cancelled','Delivered'].includes(o.status) && (
                                  <button onClick={() => updateOrderStatus(o._id, 'Cancelled')} disabled={statusUpdating === o._id}
                                    className="text-xs text-red-500 hover:text-red-700 font-bold text-left px-1">
                                    ✕ Cancel Order
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {activeTab === 'users' && !loading && (
            <div>
              <div className="flex gap-3 mb-6">
                <div className="px-4 py-2 rounded-xl font-bold text-sm bg-blue-100 text-blue-700">Total Users: {users.length}</div>
              </div>
              {users.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-300 shadow-sm"><p className="text-5xl mb-4">👥</p><p className="font-semibold">No users found.</p></div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #f0ece4' }}>
                  <table className="w-full">
                    <thead style={{ background: '#f8f5f0' }}>
                      <tr>{['Customer','Email','Phone','Joined','Action'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-t hover:bg-orange-50/30 transition-colors" style={{ borderColor: '#f5f0e8' }}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black" style={{ background: 'linear-gradient(135deg,#E63946,#c1121f)' }}>{u.name?.charAt(0).toUpperCase()}</div>
                              <p className="text-sm font-bold text-gray-800">{u.name}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">{u.email}</td>
                          <td className="px-5 py-4 text-sm text-gray-500">{u.phone || '—'}</td>
                          <td className="px-5 py-4 text-xs text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => deleteUser(u._id)} className="text-xs px-3 py-1.5 border rounded-xl text-red-500 border-red-200 hover:bg-red-50 transition-all font-bold">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {activeTab === 'products' && !loading && (
            <div>
              <div className="flex flex-wrap gap-3 mb-6 items-center">
                <div className="px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 text-gray-700">Total: {products.length}</div>
                <div className="px-4 py-2 rounded-xl font-bold text-sm bg-green-100 text-green-700">In Stock: {products.filter(p => p.stock > 0).length}</div>
                <div className="px-4 py-2 rounded-xl font-bold text-sm bg-red-100 text-red-700">Out of Stock: {products.filter(p => p.stock === 0).length}</div>
                <div className="px-4 py-2 rounded-xl font-bold text-sm bg-amber-100 text-amber-700">Low Stock (≤5): {products.filter(p => p.stock > 0 && p.stock <= 5).length}</div>
                <button onClick={seedProducts}
                  className="ml-auto px-4 py-2 rounded-xl font-bold text-sm text-white hover:scale-[1.02] transition-all"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                  🌱 Seed All Products
                </button>
              </div>
              {products.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-300 shadow-sm">
                  <p className="text-5xl mb-4">👟</p>
                  <p className="font-semibold mb-4">No products yet.</p>
                  <button onClick={openAddProduct} className="px-6 py-3 text-white rounded-xl font-black text-sm" style={{ background: 'linear-gradient(135deg,#E63946,#c1121f)' }}>+ Add First Product</button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #f0ece4' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ background: '#f8f5f0' }}>
                        <tr>{['Product','Brand','Price','Stock','Category','Gender','Actions'].map(h => (
                          <th key={h} className="px-4 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id} className="border-t hover:bg-orange-50/30 transition-colors" style={{ borderColor: '#f5f0e8' }}>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                {p.images?.[0] ? (
                                  <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100" onError={e => { e.target.style.display='none'; }} />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg">👟</div>
                                )}
                                <div>
                                  <p className="text-sm font-bold text-gray-800">{p.name}</p>
                                  <p className="text-xs text-gray-400">{Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || '—')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">{p.brand || '—'}</td>
                            <td className="px-4 py-3.5">
                              <p className="text-sm font-black text-gray-900 dark:text-white">₹{(p.price||0).toLocaleString('en-IN')}</p>
                              {p.originalPrice && <p className="text-xs text-gray-400 line-through">₹{p.originalPrice.toLocaleString('en-IN')}</p>}
                            </td>
                            <td className="px-4 py-3.5">
                              {stockEdit[p._id] !== undefined ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number" min="0"
                                    value={stockEdit[p._id]}
                                    onChange={e => setStockEdit(prev => ({ ...prev, [p._id]: e.target.value }))}
                                    onKeyDown={e => { if (e.key === 'Enter') updateStock(p._id, stockEdit[p._id]); if (e.key === 'Escape') setStockEdit(prev => { const n={...prev}; delete n[p._id]; return n; }); }}
                                    onBlur={() => updateStock(p._id, stockEdit[p._id])}
                                    autoFocus
                                    className="w-16 text-xs border-2 border-[#E63946] rounded-lg px-2 py-1 text-center font-bold focus:outline-none"
                                  />
                                  {stockSaving === p._id && <span className="text-xs text-gray-400">💾</span>}
                                </div>
                              ) : (
                                <button
                                  title="Click to edit stock"
                                  onClick={() => setStockEdit(prev => ({ ...prev, [p._id]: p.stock }))}
                                  className={`text-xs px-2.5 py-1 rounded-full font-bold border cursor-pointer hover:scale-105 transition-transform ${
                                    p.stock === 0 ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                                    : p.stock <= 5 ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                                    : 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                                  }`}>
                                  {p.stock === 0 ? '✕ Out of Stock' : `${p.stock} left ✎`}
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-500">{p.category || '—'}</td>
                            <td className="px-4 py-3.5 text-sm text-gray-500">{p.gender || '—'}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex gap-2">
                                <button onClick={() => openEditProduct(p)} className="text-xs px-3 py-1.5 border rounded-xl text-blue-500 border-blue-200 hover:bg-blue-50 font-bold">Edit</button>
                                <button onClick={() => deleteProduct(p._id)} className="text-xs px-3 py-1.5 border rounded-xl text-red-500 border-red-200 hover:bg-red-50 font-bold">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGES ── */}
          {activeTab === 'messages' && !loading && (
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Contact Messages <span className="text-gray-400 font-normal text-base">({messages.length})</span></h2>
              {messages.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center text-gray-300 shadow-sm"><p className="text-5xl mb-4">💬</p><p className="font-semibold">No messages yet.</p></div>
              ) : (
                <div className="grid lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-2 space-y-3">
                    {messages.map(msg => (
                      <div key={msg._id}
                        onClick={() => { setSelectedMsg(msg); if (msg.status === 'New') markMessageRead(msg._id); }}
                        className="bg-white rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                        style={{ border: selectedMsg?._id === msg._id ? '2px solid #E63946' : '1px solid #f0ece4' }}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-black text-sm text-gray-600">{msg.name?.charAt(0)}</div>
                            <div><p className="font-bold text-sm text-gray-800">{msg.name}</p><p className="text-xs text-gray-400">{msg.email}</p></div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getStatusColor(msg.status)}`}>{msg.status}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 truncate">{msg.subject}</p>
                        <p className="text-xs text-gray-400 mt-1 truncate">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="lg:col-span-3">
                    {selectedMsg ? (
                      <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24" style={{ border: '1px solid #f0ece4' }}>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-black text-gray-600">{selectedMsg.name?.charAt(0)}</div>
                            <div><h3 className="font-black text-lg text-gray-900 dark:text-white">{selectedMsg.name}</h3><p className="text-sm text-gray-400">{selectedMsg.email}</p></div>
                          </div>
                          <button onClick={() => deleteMessage(selectedMsg._id)} className="text-xs px-3 py-1.5 border rounded-xl text-red-500 border-red-200 hover:bg-red-50 font-bold">Delete</button>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 mb-3">
                          <p className="text-xs text-gray-400 mb-1 uppercase font-black tracking-wider">Subject</p>
                          <p className="font-bold text-gray-800">{selectedMsg.subject}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                          <p className="text-xs text-gray-400 mb-1 uppercase font-black tracking-wider">Message</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMsg.message}</p>
                        </div>
                        <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedMsg.email}&su=Re:%20${encodeURIComponent(selectedMsg.subject)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            fetch(`${API}/admin/contacts/${selectedMsg._id}`, {
                              method: 'PUT',
                              headers: getHeaders(),
                              body: JSON.stringify({ status: 'Replied' })
                            }).then(() => {
                              setMessages(prev => prev.map(m => m._id === selectedMsg._id ? { ...m, status: 'Replied' } : m));
                              setSelectedMsg(prev => ({ ...prev, status: 'Replied' }));
                            }).catch(() => {});
                          }}
                          className="w-full text-white py-3.5 rounded-2xl font-black hover:scale-[1.02] transition-all text-sm text-center block"
                          style={{ background: 'linear-gradient(135deg,#E63946,#c1121f)', boxShadow: '0 6px 20px rgba(230,57,70,0.3)' }}>
                          ✉️ Reply via Email
                        </a>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl p-16 text-center text-gray-300 shadow-sm" style={{ border: '1px solid #f0ece4' }}>
                        <p className="text-4xl mb-3">👈</p><p className="font-semibold">Click a message to view</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AdminPanel;
