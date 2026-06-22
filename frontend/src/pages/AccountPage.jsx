import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AccountSidebar from '../components/AccountSidebar';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const AccountPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { clearWishlist } = useWishlist();
  const { clearCart } = useCart();

  const handleLogout = () => {
    logout();
    clearWishlist();
    clearCart();
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden fixed top-20 left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {}
          <AccountSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogoutClick={() => setShowLogoutModal(true)}
          />

          {}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>

      {}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Log Out</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to log out?</p>
              <div className="flex gap-4">
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-[#E63946] text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Yes, Log Out
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
