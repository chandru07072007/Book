import React, { useState } from 'react';
import { X, Star, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function ReviewModal({ historyItem, isOpen, onClose, onSuccess }) {
  if (!isOpen || !historyItem) return null;

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const targetUserId = historyItem.target_user_id || historyItem.borrower_id;
  const targetUserName = historyItem.target_user_name || historyItem.borrower_name;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/history/review', {
        history_id: historyItem.id,
        target_user_id: targetUserId,
        rating,
        review: review || 'Great exchange!'
      });
      onSuccess?.(); onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/20 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-zinc-200">
        <div className="flex items-start justify-between p-5 border-b border-zinc-100">
          <div>
            <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">Rate exchange</p>
            <h2 className="font-semibold text-[15px] text-zinc-900">How was {targetUserName}?</h2>
          </div>
          <button onClick={onClose} className="ml-4 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </div>
          )}

          {/* Stars */}
          <div className="flex items-center justify-center gap-3 py-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button"
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
                className="transition-transform hover:scale-110 focus:outline-none">
                <Star className={`w-8 h-8 transition-colors ${(hover || rating) >= s ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
              </button>
            ))}
          </div>

          <p className="text-center text-[12px] text-zinc-500">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]} experience
          </p>

          <div>
            <label className="block text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Feedback</label>
            <textarea rows="3" value={review} onChange={(e) => setReview(e.target.value)}
              placeholder="Was the handover smooth? Was the book in the stated condition?"
              className="w-full text-[13px] bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-zinc-400 resize-none text-zinc-800" />
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-[13px] font-medium border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-[13px] font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition">
              {loading ? 'Submitting…' : 'Submit rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
