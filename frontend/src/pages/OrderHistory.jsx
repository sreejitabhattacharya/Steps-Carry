import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const API = import.meta.env.VITE_API_URL || '/api';

const OrderHistory = () => {
  const { orders: localOrders, cancelOrder, user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnType, setReturnType] = useState(null); // 'replace' or 'refund'
  const [refundMethod, setRefundMethod] = useState('');
  const [returning, setReturning] = useState(false);
  const [toast, setToast] = useState(null);

  const handleReturnSubmit = () => {
    setReturning(true);
    setTimeout(() => {
      setReturning(false);
      setReturnOrder(null);
      setReturnType(null);
      setRefundMethod('');
      showToast(`${returnType === 'refund' ? 'Refund' : 'Replacement'} request submitted successfully!`);
    }, 1500);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('sc_token');
      // No token or admin token - show local orders only
      if (!token || token === 'admin-token') {
        setOrders(localOrders || []);
        setLoading(false);
        return;
      }
      // Check if it's a real MongoDB JWT token (not hardcoded)
      const isRealToken = token.split('.').length === 3;
      if (!isRealToken) {
        setOrders(localOrders || []);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API}/orders/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          setOrders(localOrders || []);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.success && data.orders && data.orders.length > 0) {
          // Merge backend + local orders, deduplicate
          const backendIds = new Set(data.orders.map(o => o._id));
          const onlyLocal = (localOrders || []).filter(o => !o._id || !backendIds.has(o._id));
          setOrders([...data.orders, ...onlyLocal]);
        } else {
          setOrders(localOrders || []);
        }
      } catch {
        setOrders(localOrders || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [localOrders]);

  const getStatusColor = (status) => {
    const map = {
      'Delivered':        'bg-green-100 text-green-700 border border-green-200',
      'Shipped':          'bg-blue-100 text-blue-700 border border-blue-200',
      'Out for Delivery': 'bg-orange-100 text-orange-700 border border-orange-200',
      'Placed':           'bg-yellow-100 text-yellow-700 border border-yellow-200',
      'Confirmed':        'bg-purple-100 text-purple-700 border border-purple-200',
      'Cancelled':        'bg-red-100 text-red-700 border border-red-200',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const canCancel = (order) => ['Placed', 'Confirmed'].includes(order.status);

  const handleCancel = async () => {
    if (!confirmCancel) return;
    setCancelling(true);
    const orderId = confirmCancel._id || confirmCancel.id;
    try {
      const result = await cancelOrder(orderId, 'Cancelled by customer');
      if (result?.success !== false) {
        setOrders(prev => prev.map(o =>
          (o._id === orderId || o.id === orderId) ? { ...o, status: 'Cancelled' } : o
        ));
        showToast('Order cancelled successfully!');
      } else {
        showToast(result.message || 'Failed to cancel', 'error');
      }
    } catch {
      showToast('Failed to cancel order', 'error');
    }
    setCancelling(false);
    setConfirmCancel(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E63946] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl text-white font-bold text-sm ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">📦 My Orders</h2>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center shadow-sm">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-500 dark:text-gray-400 font-semibold mb-4">No orders yet!</p>
          <Link to="/shop" className="inline-block bg-[#E63946] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const orderId = order._id || order.id;
            const orderDate = order.createdAt || order.orderDate;
            const items = order.items || order.cart || [];
            return (
              <div key={orderId} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

                {/* Header */}
                <div className="bg-gray-50 dark:bg-gray-900 px-5 py-4 flex flex-wrap justify-between items-center gap-3 border-b dark:border-gray-700">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      Order #{String(orderId).slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ordered on: {orderDate ? new Date(orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently placed'}
                    </p>
                    {orderDate && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                        Expected Delivery: {new Date(new Date(orderDate).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                    {orderDate && order.status === 'Delivered' && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                        Delivered on: {new Date(new Date(orderDate).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <Link to="/account/track" className="text-[#E63946] text-xs font-bold hover:underline">
                      Track →
                    </Link>
                  </div>
                </div>

                {/* Items */}
                <div className="p-5">
                  <div className="space-y-3 mb-4">
                    {items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            {(item.size || item.selectedSize) ? `Size: ${item.size || item.selectedSize} · ` : ''} Qty: {item.quantity} · ₹{(item.price || item.finalPrice || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-xs text-gray-400">+{items.length - 3} more items</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-400">Total Amount</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        ₹{(order.totalAmount || order.total || 0).toLocaleString('en-IN')}
                      </p>
                      {order.paymentMethod?.type && (
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                          order.paymentMethod.type === 'COD'  ? 'bg-green-100 text-green-700' :
                          order.paymentMethod.type === 'UPI'  ? 'bg-purple-100 text-purple-700' :
                          order.paymentMethod.type === 'Card' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>{order.paymentMethod.type === 'COD' ? '💵 Cash on Delivery' : order.paymentMethod.type === 'UPI' ? '📱 UPI / GPay' : '💳 Card'}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        {canCancel(order) && (
                          <button
                            onClick={() => setConfirmCancel(order)}
                            className="px-4 py-2 border-2 border-red-200 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                        {order.status === 'Delivered' && (
                          <>
                            <button
                              onClick={() => { setReturnOrder(order); setReturnType('replace'); }}
                              className="px-4 py-2 border-2 border-[#E63946] text-[#E63946] rounded-xl text-sm font-bold hover:bg-red-50 transition-colors shadow-sm"
                            >
                              Exchange Product
                            </button>
                            <button
                              onClick={() => { setReturnOrder(order); setReturnType('refund'); }}
                              className="px-4 py-2 bg-[#E63946] text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
                            >
                              Refund Product
                            </button>
                          </>
                        )}
                      </div>
                      {order.status === 'Delivered' && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs text-right mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Return & Refund Policy</p>
                          Items can be returned within 7 days of delivery. Please ensure tags remain intact. <Link to="/contact" className="text-[#E63946] hover:underline">Contact Support</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {returnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {returnType === 'refund' ? 'Refund Request' : 'Replacement Request'}
              </h3>
              <button onClick={() => { setReturnOrder(null); setReturnType(null); setRefundMethod(''); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Which product(s) do you want to {returnType === 'refund' ? 'return' : 'exchange'}?</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  {(returnOrder.items || returnOrder.cart || []).map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-[#E63946] border-gray-300 rounded focus:ring-[#E63946]" defaultChecked />
                      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Why are you returning this item?</label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#E63946]">
                  <option value="">Select a reason</option>
                  <option>Defective or damaged product</option>
                  <option>Received wrong item</option>
                  <option>Size doesn't fit</option>
                  <option>Product doesn't match description</option>
                  <option>Changed my mind</option>
                </select>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Additional Comments (Optional)</label>
                <textarea rows="3" placeholder="Please provide more details..." className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#E63946]"></textarea>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Product Image (Optional)</label>
                <input type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[#E63946] hover:file:bg-red-100" />
              </div>

              {/* Refund Method */}
              {returnType === 'refund' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preferred Refund Method</label>
                    <select 
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#E63946]"
                    >
                      <option value="">Select refund method</option>
                      <option value="original">Original Payment Method</option>
                      <option value="wallet">Store Credit / Wallet</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  
                  {refundMethod === 'bank' && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Bank Details</h4>
                      <input type="text" placeholder="Account Holder Name" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#E63946] text-sm" />
                      <input type="text" placeholder="Account Number" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#E63946] text-sm" />
                      <div className="flex gap-3">
                        <input type="text" placeholder="IFSC Code" className="w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#E63946] text-sm" />
                        <input type="text" placeholder="Bank Name" className="w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#E63946] text-sm" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pickup Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pickup Address</label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex gap-3 bg-white dark:bg-gray-800 relative">
                  <input type="radio" name="pickup_address" defaultChecked className="mt-1 w-4 h-4 text-[#E63946] focus:ring-[#E63946]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {returnOrder.shippingAddress?.name || user?.name || 'Home'}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Default</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {returnOrder.shippingAddress?.line1 || '123, MG Road, Bangalore, Karnataka - 560001'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {returnOrder.shippingAddress?.phone || user?.phone || '+91 9876543210'}
                    </p>
                  </div>
                  <button type="button" className="text-[#E63946] text-xs font-bold hover:underline absolute right-4 bottom-4">Change Address</button>
                </div>
              </div>

              {/* Pickup Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preferred Pickup Date</label>
                <input type="date" min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#E63946]" />
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 shrink-0">
              <button onClick={() => { setReturnOrder(null); setReturnType(null); setRefundMethod(''); }} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleReturnSubmit}
                disabled={returning}
                className="px-6 py-2 bg-[#E63946] text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {returning ? '⏳ Submitting...' : `Submit ${returnType === 'refund' ? 'Refund' : 'Replacement'} Request`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <p className="text-4xl mb-3">⚠️</p>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Cancel Order?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Order #{String(confirmCancel._id || confirmCancel.id).slice(-6).toUpperCase()}
              </p>
              <p className="text-gray-400 text-xs mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(null)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 text-sm"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 text-sm disabled:opacity-60"
              >
                {cancelling ? '⏳ Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
