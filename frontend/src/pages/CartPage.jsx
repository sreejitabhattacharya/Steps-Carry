import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';


// Valid coupon codes
const COUPONS = {
  'WELCOME10': { discount: 10, type: 'percent', label: '10% off for new users' },
  'SAVE100':   { discount: 100, type: 'flat', label: '₹100 flat off' },
  'SOLE20':    { discount: 20, type: 'percent', label: '20% off on all shoes' },
  'FIRST50':   { discount: 50, type: 'flat', label: '₹50 off on first order' },
  'CARRY15':   { discount: 15, type: 'percent', label: '15% off sitewide' },
};

const STORE_UPI   = 'patrashreya477@okhdfcbank';
const STORE_NAME  = 'Steps and Carry';


// GPay / PhonePe / Paytm deep-link helper
const buildUpiLink = (app, amount, note) => {
  const base = `upi://pay?pa=${STORE_UPI}&pn=${encodeURIComponent(STORE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  const encoded = encodeURIComponent(base);
  if (app === 'gpay')    return `intent://pay?pa=${STORE_UPI}&pn=${encodeURIComponent(STORE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
  if (app === 'phonepe') return `intent://pay?pa=${STORE_UPI}&pn=${encodeURIComponent(STORE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}#Intent;scheme=upi;package=com.phonepe.app;end`;
  if (app === 'paytm')   return `intent://pay?pa=${STORE_UPI}&pn=${encodeURIComponent(STORE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}#Intent;scheme=upi;package=net.one97.paytm;end`;
  return base; // generic UPI
};

const UPI_APPS = [
  { id: 'gpay',    label: 'GPay',    color: '#4285F4', emoji: '💙',
    icon: <svg viewBox="0 0 48 48" className="w-7 h-7"><path fill="#4285F4" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.1 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6.1C12.4 13 17.7 9.5 24 9.5z"/><path fill="#34A853" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.8-2.2 5.2-4.7 6.8l7.3 5.7c4.3-4 6.3-9.9 6.3-16.5z" /><path fill="#FBBC05" d="M10.4 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.8-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6.1z"/><path fill="#EA4335" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.6 2.2-7.9 2.2-6.3 0-11.6-3.5-13.6-9.4l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/></svg> },
  { id: 'phonepe', label: 'PhonePe', color: '#5F259F', emoji: '💜',
    icon: <svg viewBox="0 0 48 48" className="w-7 h-7"><rect width="48" height="48" rx="12" fill="#5F259F"/><path fill="white" d="M24 8c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16S32.8 8 24 8zm3.5 22.5h-2.8v-6.2h-5.4v6.2h-2.8V17.5h2.8v4.5h5.4v-4.5h2.8v13z"/></svg> },
  { id: 'paytm',   label: 'Paytm',   color: '#00BAF2', emoji: '💙',
    icon: <svg viewBox="0 0 48 48" className="w-7 h-7"><rect width="48" height="48" rx="12" fill="#00BAF2"/><path fill="white" d="M12 18h6v12h-6zm9 0h6l3 6 3-6h6v12h-5v-6l-4 6-4-6v6h-5z"/></svg> },
  { id: 'bhim',    label: 'BHIM',    color: '#00457C', emoji: '💙',
    icon: <svg viewBox="0 0 48 48" className="w-7 h-7"><rect width="48" height="48" rx="12" fill="#00457C"/><text x="24" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">BHIM</text></svg> },
];

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, deliveryFee, platformFee, handlingFee, discount, finalTotal: baseFinalTotal,
          updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, paymentMethods, addresses, addAddress, addOrder } = useUser();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder]   = useState(null);
  const [paymentError, setPaymentError] = useState('');
  // UPI flow states
  const [upiStep, setUpiStep] = useState('select'); // select | paying | utr | failed
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [payingApp, setPayingApp] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');

  const [newAddr, setNewAddr]   = useState({ name: '', fullAddress: '', phone: '' });
  const [addrError, setAddrError] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const defaultAddress = selectedAddress || addresses.find(a => a.isDefault) || addresses[0];

  const couponDiscountAmount = appliedCoupon
    ? (appliedCoupon.type === 'percent'
        ? Math.round(cartTotal * appliedCoupon.discount / 100)
        : appliedCoupon.discount)
    : 0;
  const finalTotal = Math.max(0, baseFinalTotal - couponDiscountAmount);

  const applyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponError('Please enter a coupon code'); return; }
    if (COUPONS[code]) {
      setAppliedCoupon({ code, ...COUPONS[code] });
      setCouponSuccess(`Coupon "${code}" applied! ${COUPONS[code].label}`);
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleQuantityChange = (item, q) => updateQuantity(item.id, item.selectedSize, item.selectedColor, q);
  const handleRemove = (item) => removeFromCart(item.id, item.selectedSize, item.selectedColor);

  const handlePlaceOrder = () => {
    if (!user.isLoggedIn) { navigate('/login'); return; }
    const def = paymentMethods.find(m => m.isDefault);
    setSelectedPayment(def ? String(def.id || def.type) : 'COD');
    setPaymentError('');
    setUpiStep('select');
    setUpiConfirmed(false);
    setUtrNumber('');
    setUtrError('');
    setPayingApp(null);
    setShowPaymentModal(true);
  };

  const isUpiMethod = (val) => {
    if (val === 'UPI_QR') return true;
    const m = paymentMethods.find(p => String(p.id || p.type) === val);
    return m?.type === 'UPI';
  };

  // User clicks UPI app → open deep link → show UTR entry screen
  const handleUpiAppPay = (appId) => {
    setPayingApp(appId);
    const note = `Order-StepsCarry`;
    const link = buildUpiLink(appId, finalTotal, note);
    window.location.href = link;
    setTimeout(() => setUpiStep('utr'), 1500);
  };

  const handleUtrSubmit = () => {
    setUtrError('');
    const val = utrNumber.trim();
    if (!val) { setUtrError('Please enter your UTR / Transaction ID.'); return; }
    if (val.length < 6) { setUtrError('UTR / Transaction ID must be at least 6 characters.'); return; }
    placeOrderNow();
  };

  const handlePaymentFailed = () => {
    setUpiStep('failed');
    setPaymentError('');
    setUpiConfirmed(false);
    setUtrNumber('');
    setUtrError('');
  };

  const placeOrderNow = (paymentType = null) => {
    const method = paymentMethods.find(m => String(m.id || m.type) === selectedPayment)
      || { type: paymentType || (selectedPayment === 'UPI_QR' ? 'UPI' : selectedPayment) };
    const shipping = deliveryFee; // Use CartContext deliveryFee (free if cartTotal > 500)
    const totalDiscount = discount + couponDiscountAmount;
    const order = addOrder({
      items: cart.map(item => ({
        productId:     item._id || item.id || undefined,
        name:          item.name         || '',
        image:         item.image        || '',
        price:         item.finalPrice   || item.price || 0,
        quantity:      item.quantity     || 1,
        selectedSize:  item.selectedSize || '',
        selectedColor: item.selectedColor || '',
      })),
      totalAmount:   finalTotal,
      total:         finalTotal,
      itemsTotal:    cartTotal,
      shippingCost:  shipping,
      discount:      totalDiscount,
      paymentMethod: method,
      shippingAddress: defaultAddress || { name: user?.name || '', fullAddress: 'Kolkata', phone: user?.phone || '' },
    });
    clearCart();
    setPlacedOrder(order);
    setShowPaymentModal(false);
    setOrderSuccess(true);
    setUpiStep('select');
    setUpiConfirmed(false);
    setUtrNumber('');
    setUtrError('');
  };

  const handleConfirmOrder = () => {
    if (!selectedPayment) { setPaymentError('Please select a payment method.'); return; }
    if (isUpiMethod(selectedPayment)) {
      // Switch to UPI paying screen
      setUpiStep('paying');
      setPaymentError('');
      return;
    }
    // COD or Card — place directly
    placeOrderNow(selectedPayment === 'COD' ? 'COD' : 'Card');
  };

  const handleAddAddress = () => {
    setAddrError('');
    if (!newAddr.name.trim())        { setAddrError('Please enter your name.'); return; }
    if (!newAddr.fullAddress.trim()) { setAddrError('Please enter your address.'); return; }
    if (!newAddr.phone.trim())       { setAddrError('Please enter your phone number.'); return; }

    // Parse fullAddress into structured fields required by backend
    // Expected format: "House no, Street, City, State, PIN"
    const parts = newAddr.fullAddress.split(',').map(p => p.trim()).filter(Boolean);
    const pinMatch = newAddr.fullAddress.match(/\b\d{6}\b/);
    const pincode = pinMatch ? pinMatch[0] : '';
    const city    = parts.length >= 3 ? parts[parts.length - (pincode ? 3 : 2)] : '';
    const state   = parts.length >= 2 ? parts[parts.length - (pincode ? 2 : 1)] : '';
    const line1   = parts.slice(0, Math.max(1, parts.length - (pincode ? 3 : 2))).join(', ');

    const addr = {
      ...newAddr,
      line1:   line1 || newAddr.fullAddress,
      city:    city,
      state:   state,
      pincode: pincode,
      id: Date.now(),
      isDefault: addresses.length === 0,
    };
    addAddress(addr);
    setSelectedAddress(addr);
    setShowAddressModal(false);
    setNewAddr({ name: '', fullAddress: '', phone: '' });
  };

  const getPaymentLabel = (method) => {
    if (!method) return 'COD';
    if (method.type === 'UPI') return `UPI — ${method.upiId || ''}`;
    if (method.type === 'Card') return `Card ending in ${String(method.cardNumber || '').slice(-4)}`;
    return 'Cash on Delivery';
  };

  // ── ORDER SUCCESS ──
  if (orderSuccess && placedOrder) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Placed Successfully! 🎉</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-5">Your order has been confirmed. We will process it shortly.</p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-left mb-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Order ID</span><span className="font-bold">#{String(placedOrder.id).slice(-6).padStart(6,'0')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-[#E63946]">₹{placedOrder.total?.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium text-sm">
                  {placedOrder.paymentMethod?.type === 'COD' ? '💵 Cash on Delivery' :
                   placedOrder.paymentMethod?.type === 'UPI' ? '📱 UPI / GPay' :
                   '💳 Card'}
                </span>
              </div>
              {utrNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-xs text-gray-700">{utrNumber}</span>
                </div>
              )}
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-yellow-600 font-medium">Placed ✓</span></div>
          </div>
          <div className="flex gap-3">
            <Link to="/account/orders" className="flex-1 bg-[#E63946] text-white py-3 rounded-xl font-semibold text-center text-sm hover:bg-red-700">View Orders</Link>
            <Link to="/account/track"  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold text-center text-sm hover:bg-gray-50">Track Order</Link>
          </div>
          <Link to="/shop" className="block mt-3 text-sm text-[#E63946] hover:underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  // ── EMPTY CART ──
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Your cart is empty. Add some products!</p>
          <Link to="/shop" className="bg-[#E63946] text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">

            {/* Address */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Delivery Address</h2>
                <button onClick={() => setShowAddressModal(true)} className="text-sm text-[#E63946] font-medium border border-[#E63946] px-3 py-1 rounded-lg hover:bg-red-50">+ Change / Add</button>
              </div>
              {defaultAddress ? (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#E63946] rounded-full flex items-center justify-center text-white flex-shrink-0">📍</div>
                  <div>
                    <p className="font-medium">{defaultAddress.name || user.name}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{defaultAddress.fullAddress}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{defaultAddress.phone}</p>
                    {defaultAddress.isDefault && <span className="text-xs text-green-600 font-medium">Default Address</span>}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No address saved</p>
                  <button onClick={() => setShowAddressModal(true)} className="bg-[#E63946] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">+ Add Address</button>
                </div>
              )}
              {addresses.length > 1 && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {addresses.map(addr => (
                    <div key={addr.id || addr._id} onClick={() => setSelectedAddress(addr)}
                      className={`p-3 rounded-lg border cursor-pointer text-sm transition-all ${(selectedAddress?.id === addr.id || (!selectedAddress && addr.isDefault)) ? 'border-[#E63946] bg-red-50' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                      <p className="font-medium">{addr.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{addr.fullAddress}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart items */}
            {cart.map((item, index) => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Size: {item.selectedSize}</p>
                      </div>
                      <button onClick={() => handleRemove(item)} className="text-gray-400 hover:text-red-500 text-lg">✕</button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                        <button onClick={() => handleQuantityChange(item, item.quantity - 1)} disabled={item.quantity <= 1} className="px-3 py-1 hover:bg-gray-100 dark:bg-gray-700 disabled:opacity-50">-</button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item, item.quantity + 1)} disabled={item.quantity >= 10} className="px-3 py-1 hover:bg-gray-100 dark:bg-gray-700 disabled:opacity-50">+</button>
                      </div>
                      <p className="text-lg font-bold text-[#E63946]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Price Details</h2>
              <div className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
                <div className="flex justify-between"><span>Price ({cart.length} items)</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Delivery Fee</span><span className={deliveryFee === 0 ? 'text-green-600' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                <div className="flex justify-between"><span>Platform Fee</span><span>₹{platformFee}</span></div>
                <div className="flex justify-between"><span>Handling Fee</span><span>₹{handlingFee}</span></div>
                
              {/* Coupon Code */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">🎟️ Coupon Code</p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-sm font-bold text-green-700">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">{appliedCoupon.label}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 text-xs font-bold">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-[#E63946] uppercase"
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    />
                    <button onClick={applyCoupon}
                      className="px-4 py-2 bg-[#E63946] text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-xs text-green-600 mt-1">✅ {couponSuccess}</p>}
                {!appliedCoupon && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(COUPONS).slice(0,3).map(([code, c]) => (
                      <button key={code} onClick={() => { setCouponCode(code); }}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#E63946] font-mono border border-gray-200 dark:border-gray-700 transition-colors">
                        {code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Coupon Discount */}
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscountAmount}</span>
                </div>
              )}
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount}</span></div>}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between text-lg font-bold">
                <span>Total</span><span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
              {cartTotal < 500 && <p className="text-xs text-green-600 mt-2">₹{500 - cartTotal} more for free delivery!</p>}
              <button onClick={handlePlaceOrder} className="w-full bg-[#E63946] text-white py-4 rounded-xl font-semibold hover:bg-red-700 mt-6 text-lg transition-colors">
                Place Order →
              </button>
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                🔒 Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADDRESS MODAL ── */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-5">Add Delivery Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input type="text" value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} placeholder="Your name" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#E63946]"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Address *</label>
                <textarea value={newAddr.fullAddress} onChange={e => setNewAddr({...newAddr, fullAddress: e.target.value})} placeholder="House no, Street, City, State, PIN" rows={3} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#E63946]"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm">+91</span>
                  <input type="tel" value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} placeholder="9876543210" maxLength={10} className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:outline-none focus:border-[#E63946]"/>
                </div>
              </div>
              {addrError && <p className="text-red-500 text-sm">{addrError}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddAddress} className="flex-1 bg-[#E63946] text-white py-3 rounded-xl font-semibold hover:bg-red-700">Save Address</button>
              <button onClick={() => { setShowAddressModal(false); setAddrError(''); }} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] overflow-y-auto">

            {/* ── STEP 1: SELECT METHOD ── */}
            {upiStep === 'select' && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-1">Choose Payment Method</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">How would you like to pay?</p>

                <div className="space-y-3 mb-4">
                  {/* Saved methods */}
                  {paymentMethods.map((method) => (
                    <label key={method.id || method.type}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === String(method.id || method.type) ? 'border-[#E63946] bg-red-50' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={String(method.id || method.type)}
                        checked={selectedPayment === String(method.id || method.type)}
                        onChange={e => { setSelectedPayment(e.target.value); setPaymentError(''); }}
                        className="w-4 h-4 accent-[#E63946]"/>
                      <div className={`w-10 h-7 rounded flex items-center justify-center flex-shrink-0 ${method.type === 'UPI' ? 'bg-[#5F259F]' : 'bg-[#1A1F71]'}`}>
                        <span className="text-white text-xs font-bold">{method.type === 'UPI' ? 'UPI' : 'VISA'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{method.type === 'UPI' ? 'UPI Payment' : 'Visa Card'}</p>
                        <p className="text-xs text-gray-500">{getPaymentLabel(method)}</p>
                      </div>
                      {method.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>}
                    </label>
                  ))}

                  {/* UPI QR option */}
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === 'UPI_QR' ? 'border-[#E63946] bg-red-50' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="UPI_QR"
                      checked={selectedPayment === 'UPI_QR'}
                      onChange={e => { setSelectedPayment(e.target.value); setPaymentError(''); }}
                      className="w-4 h-4 accent-[#E63946]"/>
                    <div className="w-10 h-7 bg-[#5F259F] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">QR</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Pay via UPI / GPay / PhonePe</p>
                      <p className="text-xs text-gray-500">Pay directly via app</p>
                    </div>
                  </label>

                  {/* COD */}
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === 'COD' ? 'border-[#E63946] bg-red-50' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="COD"
                      checked={selectedPayment === 'COD'}
                      onChange={e => { setSelectedPayment(e.target.value); setPaymentError(''); }}
                      className="w-4 h-4 accent-[#E63946]"/>
                    <div className="w-10 h-7 bg-[#00A651] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">COD</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay on delivery</p>
                    </div>
                  </label>
                </div>

                {paymentError && <p className="text-red-500 text-sm mb-3">{paymentError}</p>}

                <div className="border-t pt-4 mb-5 flex justify-between font-bold text-lg">
                  <span>Total</span><span className="text-[#E63946]">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleConfirmOrder} className="flex-1 bg-[#E63946] text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">
                    Continue →
                  </button>
                  <button onClick={() => setShowPaymentModal(false)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            )}

            {/* ── STEP 2: UPI PAYMENT ── */}
            {upiStep === 'paying' && (
              <div className="p-6">
                <button onClick={() => setUpiStep('select')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-1">← Back</button>
                <h2 className="text-xl font-bold mb-1">Pay via UPI</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Complete payment using any UPI app</p>

                {/* Amount banner */}
                <div className="bg-[#E63946] text-white rounded-2xl p-4 text-center mb-5">
                  <p className="text-sm opacity-80">Total Amount</p>
                  <p className="text-3xl font-black">₹{finalTotal.toLocaleString('en-IN')}</p>
                  <p className="text-xs opacity-70 mt-1">Pay to: {STORE_UPI}</p>
                </div>

                {/* UPI App buttons */}
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Choose UPI App:</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {UPI_APPS.map(app => (
                    <button key={app.id} onClick={() => handleUpiAppPay(app.id)}
                      className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#E63946] hover:bg-red-50 dark:bg-gray-900 transition-all active:scale-95 group">
                      {app.icon}
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-[#E63946]">{app.label}</span>
                    </button>
                  ))}
                </div>

                {/* QR Code */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 text-center mb-3 uppercase tracking-wider">Or Scan QR Code</p>
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-2">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${STORE_UPI}&pn=${encodeURIComponent(STORE_NAME)}&am=${finalTotal}&cu=INR&tn=${encodeURIComponent('Order-StepsCarry')}`)}`}
                        alt="UPI QR"
                        className="w-36 h-36"
                        onError={e => { e.target.src = '/upi-scanner.jpg'; }}
                      />
                    </div>
                    <p className="text-xs text-[#5F259F] font-mono font-semibold">{STORE_UPI}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-blue-800 font-semibold">📌 After completing payment, click the button below to enter your Transaction ID</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setUpiStep('utr')}
                    className="flex-1 bg-[#E63946] text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-colors">
                    I Have Paid →
                  </button>
                  <button onClick={handlePaymentFailed}
                    className="border border-red-200 text-red-500 px-5 py-3.5 rounded-xl font-semibold hover:bg-red-50 transition-colors text-sm">
                    Failed
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: UTR / TRANSACTION ID ENTRY ── */}
            {upiStep === 'utr' && (
              <div className="p-6">
                <button onClick={() => setUpiStep('paying')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 mb-4 flex items-center gap-1">← Back</button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">📋</div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">Enter Transaction ID</h2>
                    <p className="text-xs text-gray-500">This helps us verify your payment</p>
                  </div>
                </div>

                {/* Amount summary */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Amount Paid</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">₹{finalTotal.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Paid to</p>
                    <p className="text-xs font-mono text-[#5F259F]">{STORE_UPI}</p>
                  </div>
                </div>

                {/* UTR input */}
                <div className="mb-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    UTR Number / Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={e => { setUtrNumber(e.target.value); setUtrError(''); }}
                    placeholder="e.g. 425112345678 or T2504041234"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-mono focus:outline-none focus:border-[#E63946] dark:bg-gray-800 dark:text-white transition-colors"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleUtrSubmit()}
                  />
                  {utrError && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">⚠️ {utrError}</p>
                  )}
                </div>

                {/* Where to find UTR */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
                  <p className="text-xs font-bold text-amber-800 mb-1.5">📍 Where to find Transaction ID?</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• <strong>GPay:</strong> Open app → Transactions → tap payment → copy UPI Ref No.</li>
                    <li>• <strong>PhonePe:</strong> History → payment → Transaction ID</li>
                    <li>• <strong>Paytm:</strong> Passbook → tap transaction → UTR No.</li>
                    <li>• Also available in your bank SMS / notification</li>
                  </ul>
                </div>

                <button
                  onClick={handleUtrSubmit}
                  className="w-full bg-[#E63946] text-white py-4 rounded-xl font-black text-base hover:bg-red-700 transition-colors shadow-md"
                >
                  Confirm & Place Order →
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">Your order will be confirmed after payment verification</p>
              </div>
            )}

            {/* ── STEP 4: PAYMENT FAILED ── */}
            {upiStep === 'failed' && (
              <div className="p-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">❌</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Failed</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your payment was not completed. Please try again.</p>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Possible reasons:</p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li>• Weak internet connection</li>
                    <li>• Bank server temporarily unavailable</li>
                    <li>• Incorrect UPI PIN entered</li>
                    <li>• Payment timeout</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={() => { setUpiStep('paying'); setPaymentError(''); setUpiConfirmed(false); setUtrNumber(''); setUtrError(''); }}
                    className="w-full bg-[#E63946] text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-colors">
                    🔄 Try Again
                  </button>
                  <button onClick={() => { setSelectedPayment('COD'); setUpiStep('select'); }}
                    className="w-full border-2 border-[#00A651] text-[#00A651] py-3 rounded-xl font-semibold hover:bg-green-50">
                    Switch to Cash on Delivery
                  </button>
                  <button onClick={() => setShowPaymentModal(false)}
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:bg-gray-900 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
