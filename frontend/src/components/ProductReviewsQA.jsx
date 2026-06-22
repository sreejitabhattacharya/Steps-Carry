import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StarRating = ({ rating, interactive = false, onRate }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          disabled={!interactive}>
          <svg className={`w-5 h-5 transition-colors ${(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>
      ))}
    </div>
  );
};

const ReviewsSection = ({ productId }) => {
  const { user } = useUser();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviewImage, setReviewImage] = useState('');

  const token = localStorage.getItem('sc_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  useEffect(() => {
    fetch(`${API}/reviews/${productId}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setReviews(d.reviews); setAvgRating(d.avgRating); } })
      .finally(() => setLoading(false));
  }, [productId]);

  const submitReview = async () => {
    if (!rating) return setError('Please select a rating');
    if (!comment.trim()) return setError('Please write a comment');
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`${API}/reviews/${productId}`, {
        method: 'POST', headers, body: JSON.stringify({ rating, comment, reviewImage }),
      });
      const d = await res.json();
      if (d.success) {
        setReviews(prev => [d.review, ...prev]);
        setAvgRating(prev => ((prev * reviews.length + rating) / (reviews.length + 1)).toFixed(1));
        setRating(0); setComment(''); setReviewImage(''); setSuccess('Review submitted! ✅');
        setTimeout(() => setSuccess(''), 3000);
      } else setError(d.message);
    } catch { setError('Something went wrong'); }
    setSubmitting(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setError('Image must be under 2MB');
    
    const reader = new FileReader();
    reader.onloadend = () => setReviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    const res = await fetch(`${API}/reviews/${id}`, { method: 'DELETE', headers });
    const d = await res.json();
    if (d.success) setReviews(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div className="mt-2">
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <div className="text-center">
          <p className="text-4xl font-black text-gray-900">{avgRating || '—'}</p>
          <StarRating rating={Math.round(avgRating)} />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1">
          {[5,4,3,2,1].map(s => {
            const count = reviews.filter(r => r.rating === s).length;
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={s} className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-2">{s}</span>
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-4">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write review */}
      {user?.isLoggedIn ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 mb-6 shadow-sm">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">Write a Review</h4>
          <div className="mb-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Rating *</p>
            <StarRating rating={rating} interactive onRate={setRating} />
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-red-400 h-24"
          />

          <div className="mt-3 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">Add Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            {reviewImage && (
              <div className="relative group">
                <img src={reviewImage} alt="Review preview" className="w-14 h-14 rounded-lg object-cover border-2 border-red-400" />
                <button onClick={() => setReviewImage('')} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center shadow-lg">✕</button>
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          {success && <p className="text-green-500 text-xs mt-1">{success}</p>}
          <button onClick={submitReview} disabled={submitting}
            className="mt-3 px-5 py-2.5 text-white rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-6 text-center border border-gray-100">
          <p className="text-sm text-gray-500">Please <a href="/login" className="text-red-500 font-bold">login</a> to write a review</p>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">⭐</p>
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {r.userAvatar ? (
                    <img src={r.userAvatar} alt={r.userName} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
                      {r.userName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm text-gray-900">{r.userName}</p>
                    <StarRating rating={r.rating} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  {(user?.isAdmin || user?._id === r.user) && (
                    <button onClick={() => deleteReview(r._id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.comment}</p>
              {r.reviewImage && (
                <div className="mt-3">
                  <img src={r.reviewImage} alt="Review" className="w-full max-w-[200px] rounded-xl border border-gray-100" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const QASection = ({ productId }) => {
  const { user } = useUser();
  const [qas, setQas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answerText, setAnswerText] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [expandedQA, setExpandedQA] = useState(null);

  const token = localStorage.getItem('sc_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  useEffect(() => {
    fetch(`${API}/qa/${productId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setQas(d.qas); })
      .finally(() => setLoading(false));
  }, [productId]);

  const submitQuestion = async () => {
    if (!question.trim()) return;
    setSubmitting(true);
    const res = await fetch(`${API}/qa/${productId}`, {
      method: 'POST', headers, body: JSON.stringify({ question }),
    });
    const d = await res.json();
    if (d.success) { setQas(prev => [d.qa, ...prev]); setQuestion(''); }
    setSubmitting(false);
  };

  const submitAnswer = async (qaId) => {
    const ans = answerText[qaId];
    if (!ans?.trim()) return;
    const res = await fetch(`${API}/qa/${qaId}/answer`, {
      method: 'POST', headers, body: JSON.stringify({ answer: ans }),
    });
    const d = await res.json();
    if (d.success) {
      setQas(prev => prev.map(q => q._id === qaId ? d.qa : q));
      setAnswerText(prev => ({ ...prev, [qaId]: '' }));
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    const res = await fetch(`${API}/qa/${id}`, { method: 'DELETE', headers });
    const d = await res.json();
    if (d.success) setQas(prev => prev.filter(q => q._id !== id));
  };

  return (
    <div className="mt-2">
      {/* Ask question */}
      {user?.isLoggedIn ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 mb-6 shadow-sm">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">Ask a Question</h4>
          <div className="flex gap-3">
            <input value={question} onChange={e => setQuestion(e.target.value)}
              placeholder="What would you like to know about this product?"
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
              onKeyDown={e => e.key === 'Enter' && submitQuestion()}
            />
            <button onClick={submitQuestion} disabled={submitting || !question.trim()}
              className="px-5 py-2.5 text-white rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
              Ask
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-6 text-center border border-gray-100">
          <p className="text-sm text-gray-500">Please <a href="/login" className="text-red-500 font-bold">login</a> to ask a question</p>
        </div>
      )}

      {/* Q&A list */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading questions…</div>
      ) : qas.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">❓</p>
          <p>No questions yet. Ask the first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {qas.map(qa => (
            <div key={qa._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Question */}
              <div className="p-4 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 transition"
                onClick={() => setExpandedQA(expandedQA === qa._id ? null : qa._id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
                      style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
                      Q
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{qa.question}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        by {qa.userName} · {new Date(qa.createdAt).toLocaleDateString('en-IN')} · {qa.answers.length} answer{qa.answers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(user?.isAdmin || user?._id === qa.user) && (
                      <button onClick={e => { e.stopPropagation(); deleteQuestion(qa._id); }}
                        className="text-xs text-red-400 hover:text-red-600">✕</button>
                    )}
                    <span className="text-gray-400 text-sm">{expandedQA === qa._id ? '▲' : '▼'}</span>
                  </div>
                </div>
              </div>

              {/* Answers */}
              {expandedQA === qa._id && (
                <div className="border-t border-gray-100">
                  {qa.answers.map((ans, i) => (
                    <div key={i} className={`p-4 flex gap-3 ${ans.isAdmin ? 'bg-red-50' : 'bg-gray-50'} border-b border-gray-100 dark:border-gray-700 last:border-0`}>
                      {ans.userAvatar ? (
                        <img src={ans.userAvatar} alt={ans.userName} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs ${ans.isAdmin ? 'bg-red-500' : 'bg-gray-400'}`}>
                          A
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-bold text-gray-700">{ans.userName}</p>
                          {ans.isAdmin && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">Admin</span>}
                        </div>
                        <p className="text-sm text-gray-700">{ans.answer}</p>
                      </div>
                    </div>
                  ))}

                  {/* Answer input */}
                  {user?.isLoggedIn && (
                    <div className="p-4 flex gap-3">
                      <input value={answerText[qa._id] || ''} onChange={e => setAnswerText(prev => ({ ...prev, [qa._id]: e.target.value }))}
                        placeholder="Write your answer..."
                        className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                        onKeyDown={e => e.key === 'Enter' && submitAnswer(qa._id)}
                      />
                      <button onClick={() => submitAnswer(qa._id)}
                        disabled={!answerText[qa._id]?.trim()}
                        className="px-4 py-2 text-white rounded-xl font-bold text-xs hover:opacity-90 transition disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg, #E63946, #c1121f)' }}>
                        Answer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductReviewsQA = ({ productId }) => {
  const [activeTab, setActiveTab] = useState('reviews');

  return (
    <div className="mt-10">
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {['reviews', 'qa'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
            {tab === 'reviews' ? '⭐ Reviews' : '❓ Questions & Answers'}
          </button>
        ))}
      </div>
      {activeTab === 'reviews' ? <ReviewsSection productId={productId} /> : <QASection productId={productId} />}
    </div>
  );
};

export default ProductReviewsQA;
