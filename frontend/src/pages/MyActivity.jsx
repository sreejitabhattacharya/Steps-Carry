import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-4 h-4 ${rating >= s ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
);

const MyActivity = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activity, setActivity] = useState({ reviews: [], questions: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');

  const token = localStorage.getItem('sc_token');

  useEffect(() => {
    if (!user?.isLoggedIn) { navigate('/login'); return; }
    const isRealToken = token && token.split('.').length === 3 && token !== 'admin-token';
    if (!isRealToken) { setLoading(false); return; }
    fetch(`${API}/my-activity`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setActivity({ reviews: d.reviews, questions: d.questions }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch(`${API}/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (d.success) setActivity(prev => ({ ...prev, reviews: prev.reviews.filter(r => r._id !== id) }));
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-red-200" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black"
            style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Activity</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user.name} · {user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
          <p className="text-3xl font-black text-red-500">{activity.reviews.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Reviews Written</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
          <p className="text-3xl font-black text-red-500">{activity.questions.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Questions Asked</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {['reviews', 'questions'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 dark:text-gray-400'}`}>
            {tab === 'reviews' ? `⭐ Reviews (${activity.reviews.length})` : `❓ Questions (${activity.questions.length})`}
          </button>
        ))}
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {activity.reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">⭐</p>
              <p className="mb-3">You haven't written any reviews yet.</p>
              <Link to="/shop" className="text-red-500 font-bold hover:underline">Shop now →</Link>
            </div>
          ) : activity.reviews.map(r => (
            <div key={r._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.productName || `Product #${r.productId}`}</p>
                  <div className="mt-1"><StarDisplay rating={r.rating} /></div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  <button onClick={() => deleteReview(r._id)}
                    className="text-xs text-red-400 hover:text-red-600 font-bold border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {activity.questions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">❓</p>
              <p className="mb-3">You haven't asked any questions yet.</p>
              <Link to="/shop" className="text-red-500 font-bold hover:underline">Browse products →</Link>
            </div>
          ) : activity.questions.map(qa => (
            <div key={qa._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{qa.productName || `Product #${qa.productId}`}</p>
                <p className="text-xs text-gray-400">{new Date(qa.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex items-start gap-2 mb-3">
                <span className="text-sm font-black text-red-500 flex-shrink-0">Q:</span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{qa.question}</p>
              </div>
              {qa.answers && qa.answers.length > 0 ? (
                <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                  {qa.answers.map((ans, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`text-xs font-black flex-shrink-0 ${ans.isAdmin ? 'text-red-500' : 'text-gray-500'}`}>A:</span>
                      <div>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{ans.userName}</span>
                        {ans.isAdmin && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded font-bold">Admin</span>}
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{ans.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic border-t border-gray-100 dark:border-gray-700 pt-3">No answers yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyActivity;
