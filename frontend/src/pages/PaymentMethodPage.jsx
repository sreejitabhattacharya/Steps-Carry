import { useState } from 'react';
import { useUser } from '../context/UserContext';

const STORE_UPI = 'patrashreya477@okhdfcbank';

const PaymentMethodPage = () => {
  const { paymentMethods, removePaymentMethod, setDefaultPaymentMethod, addPaymentMethod } = useUser();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMethod, setNewMethod] = useState({ type: 'UPI', upiId: '', cardNumber: '', expiry: '' });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(STORE_UPI);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = () => {
    setError('');
    if (newMethod.type === 'UPI') {
      if (!newMethod.upiId.trim()) { setError('Please enter a valid UPI ID'); return; }
      if (!newMethod.upiId.includes('@')) { setError('UPI ID must contain @ (e.g. name@upi)'); return; }
      addPaymentMethod({ type: 'UPI', upiId: newMethod.upiId.trim() });
    } else if (newMethod.type === 'Card') {
      if (!newMethod.cardNumber.trim()) { setError('Please enter card number'); return; }
      addPaymentMethod({ type: 'Card', cardNumber: newMethod.cardNumber, expiry: newMethod.expiry });
    }
    setShowAddModal(false);
    setNewMethod({ type: 'UPI', upiId: '', cardNumber: '', expiry: '' });
  };

  const getPaymentIcon = (type) => {
    switch (type) {
      case 'Card':
        return (
          <div className="w-12 h-8 bg-[#1A1F71] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold italic">VISA</span>
          </div>
        );
      case 'UPI':
        return (
          <div className="w-12 h-8 bg-[#5F259F] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">UPI</span>
          </div>
        );
      case 'COD':
        return (
          <div className="w-12 h-8 bg-[#00A651] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">CASH</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <button
            onClick={() => { setShowAddModal(true); setError(''); }}
            className="bg-[#E63946] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            + Add New
          </button>
        </div>

        {/* Store UPI Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border-2 border-[#5F259F]">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Pay to Steps & Carry via UPI</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Use any UPI app (GPay, PhonePe, Paytm, BHIM) to pay directly</p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* UPI Scanner Image */}
            <div className="flex flex-col items-center">
              <img
                src="/upi-scanner.jpg"
                alt="UPI QR Code Scanner"
                className="w-44 h-44 object-cover border-2 border-gray-200 dark:border-gray-700 rounded-lg"
                onError={(e) => {
                  // fallback to generated QR if image missing
                  const upiString = `upi://pay?pa=${STORE_UPI}&pn=Steps and Carry&cu=INR`;
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiString)}`;
                }}
              />
              <p className="text-xs text-gray-400 mt-2">Scan to Pay</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Steps & Carry UPI ID:</p>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                <span className="font-mono font-bold text-[#5F259F] text-lg select-all">{STORE_UPI}</span>
                <button
                  onClick={handleCopyUPI}
                  className={`ml-auto px-3 py-1 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-[#5F259F] text-white hover:bg-purple-800'}`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">After payment, keep your transaction screenshot as proof.</p>
            </div>
          </div>
        </div>

        {/* Saved Payment Methods */}
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id || method._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getPaymentIcon(method.type)}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {method.type === 'UPI' ? 'UPI Payment' : method.type === 'Card' ? 'Visa Card' : method.type}
                  </h3>
                  {method.type === 'UPI' && <p className="text-sm text-gray-500">{method.upiId}</p>}
                  {method.type === 'Card' && <p className="text-sm text-gray-500">Card ending in {method.cardNumber?.slice(-4)}</p>}
                  {method.expiry && <p className="text-sm text-gray-500">Expires: {method.expiry}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {method.isDefault ? (
                  <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">Default</span>
                ) : (
                  <button onClick={() => setDefaultPaymentMethod(method.id || method._id)} className="text-[#E63946] text-sm font-medium hover:underline">
                    Set Default
                  </button>
                )}
                <button onClick={() => removePaymentMethod(method.id || method._id)} className="text-gray-400 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* COD always available */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getPaymentIcon('COD')}
              <div>
                <h3 className="font-semibold text-gray-900">Cash on Delivery</h3>
                <p className="text-sm text-gray-500">Pay when you receive your order</p>
              </div>
            </div>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full">Always Available</span>
          </div>
        </div>

        {/* Add Payment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-6">Add Payment Method</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Type</label>
                  <select
                    value={newMethod.type}
                    onChange={(e) => setNewMethod({ type: e.target.value, upiId: '', cardNumber: '', expiry: '' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#E63946]"
                  >
                    <option value="UPI">UPI / Google Pay / PhonePe</option>
                    <option value="Card">Visa / Debit / Credit Card</option>
                  </select>
                </div>
                {newMethod.type === 'UPI' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your UPI ID</label>
                    <input
                      type="text"
                      value={newMethod.upiId}
                      onChange={(e) => setNewMethod({ ...newMethod, upiId: e.target.value })}
                      placeholder="e.g. yourname@upi or 9876543210@paytm"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                )}
                {newMethod.type === 'Card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                      <input
                        type="text"
                        value={newMethod.cardNumber}
                        onChange={(e) => setNewMethod({ ...newMethod, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#E63946]"
                        maxLength={16}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={newMethod.expiry}
                        onChange={(e) => setNewMethod({ ...newMethod, expiry: e.target.value })}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#E63946]"
                        maxLength={5}
                      />
                    </div>
                  </>
                )}
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={handleAdd} className="flex-1 bg-[#E63946] text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                  Add
                </button>
                <button onClick={() => { setShowAddModal(false); setError(''); }} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default PaymentMethodPage;
