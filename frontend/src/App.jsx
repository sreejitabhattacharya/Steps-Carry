import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { UserProvider } from './context/UserContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import OrderHistory from './pages/OrderHistory';
import ProfilePage from './pages/ProfilePage';
import TrackOrderPage from './pages/TrackOrderPage';
import PaymentMethodPage from './pages/PaymentMethodPage';
import LoginPage from './pages/LoginPage';
import ContactPage from './pages/ContactPage';
import AdminPanel from './pages/AdminPanel';
import MyActivity from './pages/MyActivity';

function App() {
  return (
    <DarkModeProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  {/* Admin route */}
                  <Route path="/admin/*" element={<AdminPanel />} />
                  {/* All other routes */}
                  <Route path="/*" element={
                    <div className="min-h-screen flex flex-col bg-[#F5F5DC] dark:bg-gray-900 transition-colors duration-300">
                      <Navbar />
                      <main className="flex-grow">
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/shop" element={<ShopPage />} />
                          <Route path="/product/:id" element={<ProductDetails />} />
                          <Route path="/cart" element={<CartPage />} />
                          <Route path="/wishlist" element={<WishlistPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/my-activity" element={<MyActivity />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/account" element={<AccountPage />}>
                            <Route index element={<OrderHistory />} />
                            <Route path="orders" element={<OrderHistory />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="track" element={<TrackOrderPage />} />
                            <Route path="favorites" element={<WishlistPage />} />
                            <Route path="payment" element={<PaymentMethodPage />} />
                          </Route>
                          <Route path="*" element={<HomePage />} />
                        </Routes>
                      </main>
                      <Footer />
                      <Chatbot />
                    </div>
                  } />
                </Routes>
              </Router>
            </RecentlyViewedProvider>
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </DarkModeProvider>
  );
}

export default App;
