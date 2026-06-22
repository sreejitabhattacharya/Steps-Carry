import { useState } from 'react';
import { useUser } from '../context/UserContext';

const API = import.meta.env.VITE_API_URL || '/api';

const STEP_ORDER = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const getStepsFromStatus = (status) => {
  const currentIdx = STEP_ORDER.indexOf(status);
  return STEP_ORDER.map((step, i) => ({
    id: i + 1,
    name: step,
    completed: status === 'Cancelled' ? false : currentIdx >= i,
    isCancelled: status === 'Cancelled' && i === 0,
  }));
};

const TrackOrderPage = () => {
  const { orders: localOrders } = useUser();
  const [searchId, setSearchId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchId.trim();
    if (!query) return;
    setLoading(true);
    setNotFound(false);
    setTrackedOrder(null);

    // Try backend first
    const token = localStorage.getItem('sc_token');
    const isRealToken = token && token !== 'admin-token' && token.split('.').length === 3;
    
    if (isRealToken) {
      try {
        const isMongoId = /^[a-f\d]{24}$/i.test(query);
        let backendOrder = null;

        if (isMongoId) {
          const res = await fetch(`${API}/orders/track/${query}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.order) {
              backendOrder = data.order;
            }
          }
        } else {
          // fetch all user orders and find by short id
          const res = await fetch(`${API}/orders/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.orders) {
              const q = query.toUpperCase();
              backendOrder = data.orders.find(o => {
                const idStr = String(o._id || o.id || '');
                const shortId = idStr.slice(-6).toUpperCase();
                return idStr === query || shortId === q || idStr.toUpperCase().endsWith(q);
              });
            }
          }
        }

        if (backendOrder) {
          setTrackedOrder({
            ...backendOrder,
            trackingNumber: `SC-IN-${String(backendOrder._id).slice(-9).toUpperCase()}`,
            carrier: 'Bluedart Express',
            steps: getStepsFromStatus(backendOrder.status),
          });
          setLoading(false);
          return;
        }
      } catch { /* fallback to local */ }
    }

    // Search in local orders
    setTimeout(() => {
      const found = localOrders.find(o => {
        const idStr = String(o._id || o.id || '');
        const shortId = idStr.slice(-6).toUpperCase();
        const q = query.toUpperCase();
        return idStr === query || shortId === q || idStr.toUpperCase().endsWith(q);
      });

      if (found) {
        setTrackedOrder({
          ...found,
          trackingNumber: `SC-IN-${String(found._id || found.id).slice(-9).toUpperCase()}`,
          carrier: 'Bluedart Express',
          steps: getStepsFromStatus(found.status || 'Placed'),
        });
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">📦 Track Order</h1>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Track by Order ID</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchId}
              onChange={e => { setSearchId(e.target.value); setNotFound(false); setTrackedOrder(null); }}
              placeholder="Enter your Order ID (last 6 digits or full ID)"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#E63946] dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#E63946] text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {loading ? '⏳' : 'Track'}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2">💡 Find your Order ID in Order History</p>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-600 dark:text-red-400 font-medium">
            ❌ Order not found. Please check your Order ID and try again.
          </div>
        )}

        {/* Tracked Order */}
        {trackedOrder && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order #{String(trackedOrder._id || trackedOrder.id || '').slice(-6).toUpperCase()}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Placed on {new Date(trackedOrder.createdAt || trackedOrder.orderDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {trackedOrder.status !== 'Delivered' && trackedOrder.status !== 'Cancelled' && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                    Expected Delivery: {new Date(new Date(trackedOrder.createdAt || trackedOrder.orderDate || Date.now()).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                {trackedOrder.status === 'Delivered' && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                    Delivered on: {new Date(new Date(trackedOrder.createdAt || trackedOrder.orderDate || Date.now()).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">Tracking: {trackedOrder.trackingNumber} · {trackedOrder.carrier}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                trackedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                trackedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                trackedOrder.status === 'Shipped' || trackedOrder.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {trackedOrder.status}
              </span>
            </div>

            {/* Progress Steps */}
            {trackedOrder.status === 'Cancelled' ? (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                <p className="text-red-600 dark:text-red-400 font-semibold text-lg">❌ Order Cancelled</p>
                {trackedOrder.cancelReason && (
                  <p className="text-red-500 text-sm mt-1">Reason: {trackedOrder.cancelReason}</p>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-0">
                    <div
                      className="h-full bg-[#E63946] transition-all duration-500"
                      style={{ width: `${Math.max(0, (trackedOrder.steps.filter(s => s.completed).length - 1) / (trackedOrder.steps.length - 1) * 100)}%` }}
                    />
                  </div>
                  {trackedOrder.steps.map(step => (
                    <div key={step.id} className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        step.completed ? 'bg-[#E63946] text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-400'
                      }`}>
                        {step.completed ? '✓' : step.id}
                      </div>
                      <p className="text-xs mt-2 text-center max-w-[70px] text-gray-600 dark:text-gray-400 font-medium">{step.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            {trackedOrder.items && trackedOrder.items.length > 0 && (
              <div className="mt-6 border-t dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Items</h3>
                <div className="space-y-2">
                  {trackedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.size || item.selectedSize ? `Size: ${item.size || item.selectedSize} · ` : ''}
                          Qty: {item.quantity} · ₹{(item.price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Total Amount</span>
              <span className="font-black text-lg text-gray-900 dark:text-white">
                ₹{(trackedOrder.totalAmount || trackedOrder.total || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Recent Orders Quick Track */}
        {localOrders.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your Recent Orders</h2>
            <div className="space-y-3">
              {localOrders.slice(0, 5).map(o => {
                const oid = o._id || o.id;
                const shortId = String(oid).slice(-6).toUpperCase();
                return (
                  <div key={oid} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">Order #{shortId}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(o.createdAt || o.orderDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        o.status === 'Shipped' || o.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                        o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                        {o.status}
                      </span>
                      <button
                        onClick={() => {
                          setSearchId(shortId);
                          setTrackedOrder({
                            ...o,
                            trackingNumber: `SC-IN-${String(oid).slice(-9).toUpperCase()}`,
                            carrier: 'Bluedart Express',
                            steps: getStepsFromStatus(o.status || 'Placed'),
                          });
                          setNotFound(false);
                        }}
                        className="text-[#E63946] text-xs font-bold hover:underline"
                      >
                        Track →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
