import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function RequestModal({ book, isOpen, onClose, onSuccess }) {
  if (!isOpen || !book) return null;
  const isDonate = book.listing_type === 'donate';

  const [duration, setDuration] = useState(Math.min(14, book.max_borrow_days || 30));
  const [purpose, setPurpose] = useState('');
  const [meetupLocation, setMeetupLocation] = useState(book.pickup_location || 'Campus Main Library');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/requests', {
        resource_id: book.id,
        request_type: book.listing_type,
        needed_duration_days: isDonate ? 0 : parseInt(duration),
        purpose_note: purpose || (isDonate ? 'Requesting for coursework' : 'Borrowing for semester studies'),
        proposed_meetup_location: meetupLocation
      });
      onSuccess?.(); onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/20 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-zinc-200">
        <div className="flex items-start justify-between p-5 border-b border-zinc-100">
          <div>
            <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">
              {isDonate ? 'Claim donation' : 'Request to borrow'}
            </p>
            <h2 className="font-semibold text-[15px] text-zinc-900 leading-snug line-clamp-1">{book.title}</h2>
          </div>
          <button onClick={onClose} className="ml-4 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {!isDonate && (
            <Field label={<>Duration — <span className="text-zinc-900 font-semibold">{duration} days</span></>}>
              <input type="range" min="3" max={book.max_borrow_days || 30} step="1"
                value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full accent-zinc-900 cursor-pointer h-1.5 rounded-full" />
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                <span>3 days</span><span>{book.max_borrow_days || 30} days</span>
              </div>
            </Field>
          )}

          <Field label="Pickup location">
            <input type="text" required value={meetupLocation} onChange={(e) => setMeetupLocation(e.target.value)}
              placeholder="Campus library, student union…"
              className="input" />
          </Field>

          <Field label="Note to provider (optional)">
            <textarea rows="3" value={purpose} onChange={(e) => setPurpose(e.target.value)}
              placeholder="What course is this for? Anything else the provider should know?"
              className="input resize-none" />
          </Field>

          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-[13px] font-medium border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-[13px] font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition">
              {loading ? 'Sending…' : isDonate ? 'Claim donation' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
