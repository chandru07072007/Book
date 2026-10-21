import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function ScheduleModal({ request, isOpen, onClose, onSuccess }) {
  if (!isOpen || !request) return null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const [meetupTime, setMeetupTime] = useState(tomorrow.toISOString().slice(0, 16));
  const [location, setLocation] = useState('Campus Central Library — Front Entrance');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/schedules', {
        request_id: request.id,
        meetup_time: new Date(meetupTime).toISOString(),
        meetup_location: location,
        notes
      });
      onSuccess?.(); onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to schedule meetup.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/20 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-zinc-200">
        <div className="flex items-start justify-between p-5 border-b border-zinc-100">
          <div>
            <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">Schedule meetup</p>
            <h2 className="font-semibold text-[15px] text-zinc-900 line-clamp-1">{request.resource_title}</h2>
          </div>
          <button onClick={onClose} className="ml-4 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </div>
          )}
          <div>
            <label className="block text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Date & Time</label>
            <input type="datetime-local" required value={meetupTime} onChange={(e) => setMeetupTime(e.target.value)}
              className="w-full text-[13px] bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-zinc-400 text-zinc-800" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Location</label>
            <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Campus landmark, building floor…"
              className="w-full text-[13px] bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-zinc-400 text-zinc-800" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Instructions (optional)</label>
            <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="How to find each other…"
              className="w-full text-[13px] bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-zinc-400 resize-none text-zinc-800" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-[13px] font-medium border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-[13px] font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition">
              {loading ? 'Confirming…' : 'Propose meetup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
