import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithGoogle, signOutUser, auth } from '../config/firebase';
import { getRedirectResult } from 'firebase/auth';

const UserContext = createContext();
const API = import.meta.env.VITE_API_URL || '/api';

// helper: save user + token to localStorage
const persistUser = (userData, token) => {
  if (token) localStorage.setItem('sc_token', token);
  if (userData) localStorage.setItem('sc_user', JSON.stringify(userData));
};

// helper: build clean user state from backend response
const buildUserState = (rawUser) => ({
  _id:      rawUser._id      || rawUser.id || null,
  name:     rawUser.name     || '',
  email:    rawUser.email    || '',
  phone:    rawUser.phone    || '',
  gender:   rawUser.gender   || '',
  avatar:   rawUser.avatar   || '',
  googleId: rawUser.googleId || '',
  isAdmin:  rawUser.isAdmin  || false,
  isLoggedIn: true,
});

export const UserProvider = ({ children }) => {
  const [user, setUser]                         = useState({ isLoggedIn: false });
  const [loading, setLoading]                   = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [paymentMethods, setPaymentMethods]     = useState([]);
  const [addresses, setAddresses]               = useState([]);
  const [orders, setOrders]                     = useState([]);

  // backend health check — retries up to 5 times with 3s delay
  useEffect(() => {
    let cancelled = false;
    const checkHealth = async (attemptsLeft = 5) => {
      try {
        const r = await fetch(`${API}/health`);
        if (!cancelled && r.ok) setBackendConnected(true);
      } catch {
        if (!cancelled && attemptsLeft > 1) {
          setTimeout(() => checkHealth(attemptsLeft - 1), 3000);
        }
      }
    };
    checkHealth();
    return () => { cancelled = true; };
  }, []);

  // restore session from localStorage on mount
  useEffect(() => {
    const token       = localStorage.getItem('sc_token');
    const saved       = localStorage.getItem('sc_user');
    const payments    = localStorage.getItem('sc_payments');
    const addrs       = localStorage.getItem('sc_addresses');
    const savedOrders = localStorage.getItem('sc_orders');

    if (token && saved) {
      try { setUser(buildUserState(JSON.parse(saved))); } catch {}
    }
    if (payments)    { try { setPaymentMethods(JSON.parse(payments));   } catch {} }
    if (addrs)       { try { setAddresses(JSON.parse(addrs));           } catch {} }
    if (savedOrders) { try { setOrders(JSON.parse(savedOrders));        } catch {} }

    // Fetch latest orders from backend if authenticated
    if (token && token !== 'admin-token' && token.split('.').length === 3) {
      fetch(`${API}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.orders) {
            const parsedLocal = savedOrders ? JSON.parse(savedOrders) : [];
            const backendIds = new Set(data.orders.map(o => o._id));
            const onlyLocal = parsedLocal.filter(o => !o._id || !backendIds.has(o._id));
            const merged = [...data.orders, ...onlyLocal];
            setOrders(merged);
            localStorage.setItem('sc_orders', JSON.stringify(merged));
          }
        })
        .catch(() => {});
    }

    // Handle Google redirect result (popup-blocked fallback)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const fu = result.user;
          try {
            const res  = await fetch(`${API}/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: fu.displayName || fu.email.split('@')[0],
                email: fu.email, avatar: fu.photoURL || '', googleId: fu.uid,
              }),
            });
            const data = await res.json();
            if (data.success && data.token && data.user) {
              persistUser(data.user, data.token);
              setUser(buildUserState(data.user));
              setBackendConnected(true);
              window.dispatchEvent(new CustomEvent('sc_login'));
            }
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // email/password login
  const login = useCallback(async (emailOrObj, password) => {
    try {
      const email = typeof emailOrObj === 'object' ? emailOrObj.email    : emailOrObj;
      const pwd   = typeof emailOrObj === 'object' ? emailOrObj.password : password;
      const res   = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd }),
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        persistUser(data.user, data.token);
        setUser(buildUserState(data.user));
        setBackendConnected(true);
        window.dispatchEvent(new CustomEvent('sc_login'));
      }
      return data;
    } catch (err) { return { success: false, message: err.message }; }
  }, []);

  // Google login (regular users AND admin)
  const loginWithGoogle = useCallback(async () => {
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) return { success: false, message: 'Google sign-in cancelled' };

      const res  = await fetch(`${API}/auth/google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email, avatar: firebaseUser.photoURL || '', googleId: firebaseUser.uid,
        }),
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        persistUser(data.user, data.token);
        setUser(buildUserState(data.user));
        setBackendConnected(true);
        window.dispatchEvent(new CustomEvent('sc_login'));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) { return { success: false, message: err.message || 'Google login failed' }; }
  }, []);

  // register
  const register = useCallback(async (nameOrObj, email, password, phone, gender) => {
    try {
      const name = typeof nameOrObj === 'object' ? nameOrObj.name     : nameOrObj;
      const em   = typeof nameOrObj === 'object' ? nameOrObj.email    : email;
      const pwd  = typeof nameOrObj === 'object' ? nameOrObj.password : password;
      const ph   = typeof nameOrObj === 'object' ? nameOrObj.phone    : phone;
      const gen  = typeof nameOrObj === 'object' ? nameOrObj.gender   : gender;
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: em, password: pwd, phone: ph, gender: gen }),
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        persistUser(data.user, data.token);
        setUser(buildUserState(data.user));
        setBackendConnected(true);
      }
      return data;
    } catch (err) { return { success: false, message: err.message }; }
  }, []);

  // logout
  const logout = useCallback(async () => {
    ['sc_token','sc_user','sc_wishlist'].forEach(k => localStorage.removeItem(k));
    setUser({ isLoggedIn: false });
    window.dispatchEvent(new CustomEvent('sc_logout'));
    try { await signOutUser(); } catch {}
  }, []);

  // simple local update
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('sc_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // updateProfile — calls backend, falls back to local
  const updateProfile = useCallback(async ({ name, phone, gender, avatar }) => {
    const token = localStorage.getItem('sc_token');
    const isRealToken = token && token !== 'admin-token' && token.split('.').length === 3;
    if (isRealToken) {
      try {
        const res  = await fetch(`${API}/auth/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, phone, gender, avatar }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(prev => {
            const updated = { ...prev, ...data.user, isLoggedIn: true };
            localStorage.setItem('sc_user', JSON.stringify(updated));
            return updated;
          });
          setBackendConnected(true);
          return { success: true };
        }
        return { success: false, message: data.message };
      } catch {}
    }
    // local fallback
    setUser(prev => {
      const updated = { ...prev,
        name: name ?? prev.name, phone: phone ?? prev.phone,
        gender: gender ?? prev.gender, avatar: avatar ?? prev.avatar, isLoggedIn: true,
      };
      localStorage.setItem('sc_user', JSON.stringify(updated));
      return updated;
    });
    return { success: true, local: true };
  }, []);

  // changePassword
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const token = localStorage.getItem('sc_token');
    if (!token || token.split('.').length !== 3)
      return { success: false, message: 'Not authenticated with backend' };
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return await res.json();
    } catch { return { success: false, message: 'Backend unreachable' }; }
  }, []);

  // Payment Methods
  const addPaymentMethod = (method) => {
    const nm = { ...method, id: Date.now(), isDefault: paymentMethods.length === 0 };
    const updated = [...paymentMethods, nm];
    setPaymentMethods(updated);
    localStorage.setItem('sc_payments', JSON.stringify(updated));
  };
  const removePaymentMethod = (id) => {
    const updated = paymentMethods.filter(m => (m.id || m._id) !== id);
    setPaymentMethods(updated); localStorage.setItem('sc_payments', JSON.stringify(updated));
  };
  const setDefaultPaymentMethod = (id) => {
    const updated = paymentMethods.map(m => ({ ...m, isDefault: (m.id || m._id) === id }));
    setPaymentMethods(updated); localStorage.setItem('sc_payments', JSON.stringify(updated));
  };

  // Addresses
  const addAddress = (address) => {
    const na = { ...address, id: Date.now(), isDefault: addresses.length === 0 };
    const updated = [...addresses, na];
    setAddresses(updated); localStorage.setItem('sc_addresses', JSON.stringify(updated));
  };
  const removeAddress = (id) => {
    const updated = addresses.filter(a => (a.id || a._id) !== id);
    setAddresses(updated); localStorage.setItem('sc_addresses', JSON.stringify(updated));
  };

  // Orders
  const addOrder = (orderData) => {
    const token = localStorage.getItem('sc_token');
    const newOrder = { ...orderData, id: Date.now(), createdAt: new Date().toISOString(), status: 'Placed' };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('sc_orders', JSON.stringify(updated));

    const isRealToken = token && token !== 'admin-token' && token.split('.').length === 3;
    if (isRealToken) {
      const addr = orderData.shippingAddress || {};
      const payload = {
        items: (orderData.items || []).map(item => {
          const productId = item.productId || item._id;
          // Only send product field if it's a valid 24-character MongoDB ObjectId
          const isValidObjectId = typeof productId === 'string' && /^[a-f\d]{24}$/i.test(productId);
          
          return {
            product: isValidObjectId ? productId : undefined,
            name: item.name || '',
            image: item.image || '',
            price: Number(item.price || item.finalPrice || 0),
            quantity: Number(item.quantity || 1),
            size: item.selectedSize || item.size || '',
            color: item.selectedColor || item.color || '',
          };
        }),
        shippingAddress: {
          name: addr.name || '', phone: addr.phone || '',
          line1: addr.line1 || addr.fullAddress || addr.address || '',
          line2: addr.line2 || '', city: addr.city || '',
          state: addr.state || '', pincode: addr.pincode || addr.zip || '',
        },
        paymentMethod: {
          type: orderData.paymentMethod?.type || 'COD',
          details: orderData.paymentMethod?.upiId || orderData.paymentMethod?.cardNumber || orderData.paymentMethod?.details || '',
        },
        itemsTotal: Number(orderData.itemsTotal || orderData.total || 0),
        shippingCost: Number(orderData.shippingCost || 0),
        discount: Number(orderData.discount || 0),
        totalAmount: Number(orderData.totalAmount || orderData.total || 0),
      };

      fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.order?._id) {
            setOrders(prev => {
              const patched = prev.map(o => o.id === newOrder.id ? { ...o, _id: data.order._id } : o);
              localStorage.setItem('sc_orders', JSON.stringify(patched));
              return patched;
            });
          } else {
            console.error('Failed to save order to backend:', data.message);
          }
        })
        .catch(err => {
          console.error('Network error saving order to backend:', err);
        });
    }
    return newOrder;
  };

  const cancelOrder = async (orderId, reason = 'Cancelled by user') => {
    const token = localStorage.getItem('sc_token');
    const updateLocally = () => {
      setOrders(prev => {
        const updated = prev.map(o => (o._id === orderId || o.id === orderId) ? { ...o, status: 'Cancelled' } : o);
        localStorage.setItem('sc_orders', JSON.stringify(updated));
        return updated;
      });
    };
    const isMongoId = typeof orderId === 'string' && /^[a-f\d]{24}$/i.test(orderId);
    if (!isMongoId) { updateLocally(); return { success: true }; }
    try {
      const res  = await fetch(`${API}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) { updateLocally(); return { success: true }; }
      return { success: false, message: data.message };
    } catch { updateLocally(); return { success: true }; }
  };

  return (
    <UserContext.Provider value={{
      user, loading, backendConnected,
      login, loginWithGoogle, register, logout,
      updateUser, updateProfile, changePassword,
      paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod,
      addresses, addAddress, removeAddress,
      orders, addOrder, cancelOrder,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
