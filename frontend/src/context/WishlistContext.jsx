import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();
const API = import.meta.env.VITE_API_URL || '/api';

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('sc_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const wishlistCount = wishlist.length;

  useEffect(() => {
    localStorage.setItem('sc_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Listen for login/logout events to sync wishlist
  useEffect(() => {
    const onLogin = () => syncFromBackend();
    const onLogout = () => {
      setWishlist([]);
      localStorage.removeItem('sc_wishlist');
    };
    window.addEventListener('sc_login', onLogin);
    window.addEventListener('sc_logout', onLogout);
    return () => {
      window.removeEventListener('sc_login', onLogin);
      window.removeEventListener('sc_logout', onLogout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync wishlist FROM backend when user logs in
  const syncFromBackend = async () => {
    const token = localStorage.getItem('sc_token');
    const isRealToken = token && token.split('.').length === 3 && token !== 'admin-token';
    if (!isRealToken) return;
    try {
      const res = await fetch(`${API}/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.wishlist)) {
        setWishlist(data.wishlist);
        localStorage.setItem('sc_wishlist', JSON.stringify(data.wishlist));
      }
    } catch { /* ignore — keep local data */ }
  };

  // Sync wishlist TO backend
  const syncToBackend = async (updatedList) => {
    const token = localStorage.getItem('sc_token');
    const isRealToken = token && token.split('.').length === 3 && token !== 'admin-token';
    if (!isRealToken) return;
    try {
      const ids = updatedList
        .map(item => item._id || item.id)
        .filter(id => id && /^[a-f\d]{24}$/i.test(String(id)));
      await fetch(`${API}/users/wishlist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wishlist: ids }),
      });
    } catch { /* ignore — local state still intact */ }
  };

  const addToWishlist = (product) => {
    const id = product.id || product._id;
    const exists = wishlist.find(item => (item.id || item._id) === id);
    if (!exists) {
      const updated = [...wishlist, product];
      setWishlist(updated);
      syncToBackend(updated);
    }
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter(item => (item.id || item._id) !== productId);
    setWishlist(updated);
    syncToBackend(updated);
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item.id || item._id) === productId);
  };

  const toggleWishlist = (product) => {
    const id = product.id || product._id;
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem('sc_wishlist');
    syncToBackend([]);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist, wishlistCount,
      addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, clearWishlist,
      syncFromBackend,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
