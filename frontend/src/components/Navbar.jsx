import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUser } from '../context/UserContext';
import { useDarkMode } from '../context/DarkModeContext';
import { products } from '../data/products';

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useUser();
  const { clearCart } = useCart();
  const { clearWishlist } = useWishlist();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchRef = useRef(null);

  // Live search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = products
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        ((q === 'shoe' || q === 'shoes') && p.category.toLowerCase() === 'sneakers')
      )
      .slice(0, 5);
    setSearchSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [searchQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/product/${product.id}`);
  };

  const handleLogout = () => {
    logout();
    clearCart();
    clearWishlist();
    setShowUserMenu(false);
    navigate('/');
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support voice search.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.replace(/[.,?!]/g, '').trim();
      setSearchQuery(transcript);
      setShowSuggestions(false);
      navigate(`/shop?search=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-2xl font-bold text-[#E63946]">STEPS & CARRY</span>
            <span className="hidden sm:inline text-sm font-semibold text-gray-600 dark:text-gray-400">SHOE & SOLE</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-[#E63946] transition-colors font-medium">Home</Link>
            <Link to="/shop" className="text-gray-700 dark:text-gray-300 hover:text-[#E63946] transition-colors font-medium">Shop</Link>
            <Link to="/shop?category=Sneakers" className="text-gray-700 dark:text-gray-300 hover:text-[#E63946] transition-colors font-medium">Products</Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-[#E63946] transition-colors font-medium">Contact</Link>
            {user.isLoggedIn && (user.email === 'stepsandcarry24@gmail.com' || user.isAdmin) && (
              <Link to="/admin" className="flex items-center gap-1.5 bg-[#E63946] text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                🛡️ Admin
              </Link>
            )}
          </div>

          {/* Search Bar with Live Suggestions */}
          <div ref={searchRef} className="hidden lg:flex items-center relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search shoes, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                  className="w-72 pl-4 pr-16 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:border-[#E63946] bg-white dark:bg-gray-800 dark:text-white text-sm transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startListening}
                    className={`text-gray-400 hover:text-[#E63946] transition-colors ${isListening ? 'text-[#E63946] animate-pulse' : ''}`}
                    title="Voice Search"
                  >
                    🎤
                  </button>
                  <button type="submit" className="text-gray-400 hover:text-[#E63946]">
                    🔍
                  </button>
                </div>
              </div>
            </form>

            {/* Live Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-12 left-0 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                {searchSuggestions.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">₹{product.price.toLocaleString('en-IN')} · {product.category}</p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-3 text-sm text-[#E63946] font-semibold hover:bg-red-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 text-center"
                >
                  See all results for "{searchQuery}" →
                </button>
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-3">

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-lg"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => user.isLoggedIn ? setShowUserMenu(!showUserMenu) : navigate('/login')}
                className="text-gray-700 dark:text-gray-300 hover:text-[#E63946] flex items-center gap-1"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-[#E63946]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">
                    {user.isLoggedIn ? user.name?.charAt(0).toUpperCase() : '👤'}
                  </div>
                )}
              </button>

              {showUserMenu && user.isLoggedIn && (
                <div className="absolute right-0 top-11 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  {[
                    { to: '/account/orders', label: '📦 My Orders' },
                    { to: '/account/profile', label: '👤 Profile' },
                    { to: '/account/track', label: '🔍 Track Order' },
                    { to: '/wishlist', label: '❤️ Wishlist' },
                    { to: '/my-activity', label: '📊 My Activity' },
                  ].map(item => (
                    <Link key={item.to} to={item.to}
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 border-t dark:border-gray-700">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative text-gray-700 dark:text-gray-300 hover:text-[#E63946]">
              <span className="text-xl">❤️</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#E63946] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-[#E63946]">
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#E63946] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-700 dark:text-gray-300">
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-3 lg:hidden">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:border-[#E63946] bg-white dark:bg-gray-800 dark:text-white text-sm"
              />
              <button
                type="button"
                onClick={startListening}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E63946] ${isListening ? 'text-[#E63946] animate-pulse' : ''}`}
                title="Voice Search"
              >
                🎤
              </button>
            </div>
            <button type="submit" className="bg-[#E63946] text-white px-4 py-2 rounded-full text-sm font-bold">
              Search
            </button>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t dark:border-gray-700 pt-3">
            {[
              { to: '/', label: '🏠 Home' },
              { to: '/shop', label: '🛍️ Shop' },
              { to: '/contact', label: '📞 Contact' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-[#E63946] font-medium">
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
