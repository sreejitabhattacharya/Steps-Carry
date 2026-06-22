import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AccountSidebar = ({ isOpen, onClose, onLogoutClick }) => {
  const location = useLocation();
  const { user } = useUser();

  const menuItems = [
    { id: 'orders', name: 'Order History', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { id: 'profile', name: 'Profile & Security', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'track', name: 'Track Order', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { id: 'favorites', name: 'Favorites', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
    { id: 'payment', name: 'Payment Methods', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  ];

  const extraItems = [
    { path: '/my-activity', name: 'My Activity', icon: '⭐' },
  ];

  const isActive = (id) => location.pathname === `/account/${id}`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#E63946] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {user.avatar
              ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover"/>
              : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name || 'Guest User'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email || 'Login to your account'}</p>
          </div>
        </div>
      </div>

      {}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={`/account/${item.id}`}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.id) ? 'bg-[#E63946] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          {extraItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path ? 'bg-[#E63946] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {}
      <div className="p-4 border-t">
        <button
          onClick={() => { onClose && onClose(); onLogoutClick && onLogoutClick(); }}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      {}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>

      {}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md sticky top-24">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default AccountSidebar;
