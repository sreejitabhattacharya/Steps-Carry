import { useState, useRef, useEffect } from 'react';

const BOT_RESPONSES = {
  'hello': 'Hello! I am the Steps & Carry virtual assistant. How can I help you?',
  'hi': 'Hi there! Feel free to ask me anything about orders, delivery, or payments.',
  'order': 'To track your order, go to Account > Track Order and enter your Order ID. Need help? Call us: +91 8372053836',
  'delivery': 'Orders are usually delivered within 5-7 business days. Express delivery is also available!',
  'payment': 'We accept Visa Card, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery.',
  'return': 'Returns are accepted within 7 days of receiving the product. Go to Account > Order History to submit a return request.',
  'size': 'All products have a size chart available. We follow standard Indian sizing.',
  'address': '540 Dum Dum Road, Surermath, Near Dum Dum Jn. Station, Kolkata - 700074, West Bengal',
  'phone': 'Our helpline: +91 8372053836 (Mon-Sat: 9AM - 9PM)',
  'email': 'support@stepsandcarry.in — We reply within 24 hours.',
  'discount': 'We regularly run sales and offers! Subscribe to our newsletter to get discounts.',
  'cancel': 'You can cancel your order before it is shipped. Go to Account > Order History > Cancel Order.',
  'warranty': 'All products come with a 6-month manufacturer warranty.',
  'upi': 'We accept all UPI apps — Google Pay, PhonePe, Paytm, BHIM, and more. Just add your UPI ID in Payment Methods.',
  'default': 'I\'m not sure about that. Please contact us:\n📞 +91 8372053836\n📧 support@stepsandcarry.in'
};

const getResponse = (msg) => {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(BOT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return val;
  }
  return BOT_RESPONSES.default;
};

const QUICK_QUESTIONS = ['Track my order', 'Delivery time?', 'Payment options', 'Return policy', 'Contact info'];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! I\'m the Steps & Carry assistant 👋\nI can help you with orders, delivery, payments, and more!' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setMessages(prev => [...prev, { from: 'user', text: userText }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: 'bot', text: getResponse(userText) }]);
    }, 800);
  };

  return (
    <>
      {}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#E63946] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-all hover:scale-110"
        title="Chat with us">
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        ) : (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        )}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"/>}
      </button>

      {}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '480px' }}>
          {}
          <div className="bg-[#E63946] text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#E63946]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Steps & Carry Support</p>
              <p className="text-xs opacity-80 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-300 rounded-full inline-block"/>Online
              </p>
            </div>
          </div>

          {}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.from === 'bot' && (
                  <div className="w-7 h-7 bg-[#E63946] rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">SC</div>
                )}
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm whitespace-pre-line ${
                  msg.from === 'user' ? 'bg-[#E63946] text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-[#E63946] rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">SC</div>
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                  {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {}
          <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-[#E63946] hover:text-white text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:border-[#E63946]"/>
              <button onClick={() => sendMessage()}
                className="w-9 h-9 bg-[#E63946] text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
