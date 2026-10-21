import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AddBookPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [isbn, setIsbn] = useState('');
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [isbnMsg, setIsbnMsg] = useState(null); // { type: 'success'|'error', text: '' }

  const [form, setForm] = useState({
    title: '', author: '', isbn: '', subject: 'Computer Science',
    format: 'textbook', condition: 'good', listing_type: 'lend',
    description: '', cover_image_url: '',
    pickup_location: user?.location || 'Campus Library',
    max_borrow_days: 30
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const lookupIsbn = async () => {
    const clean = isbn.replace(/[^0-9X]/gi, '');
    if (!clean) { setIsbnMsg({ type: 'error', text: 'Enter a valid 10 or 13-digit ISBN.' }); return; }
    setIsbnLoading(true); setIsbnMsg(null);
    try {
      const d = (await api.get(`/resources/isbn-lookup/${clean}`)).data;
      setForm(f => ({
        ...f,
        title: d.title || f.title,
        author: d.author || f.author,
        isbn: d.isbn || clean,
        subject: d.subject || f.subject,
        description: d.description || f.description,
        cover_image_url: d.cover_image_url || f.cover_image_url
      }));
      setIsbnMsg({ type: 'success', text: `Found: "${d.title}" — details filled in.` });
    } catch {
      setIsbnMsg({ type: 'error', text: 'Could not find metadata. Enter details manually.' });
    } finally { setIsbnLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author) { setSubmitError('Title and Author are required.'); return; }
    setSubmitting(true); setSubmitError('');
    try {
      const res = await api.post('/resources', form);
      navigate(`/book/${res.data.id}`);
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Failed to publish.');
    } finally { setSubmitting(false); }
  };

  if (!isAuthenticated) return (
    <div className="pt-14 max-w-md mx-auto px-5 py-24 text-center space-y-4">
      <h2 className="text-[18px] font-semibold text-zinc-900">Sign in to share a book</h2>
      <p className="text-[13px] text-zinc-500">You need an account to list educational resources.</p>
      <button onClick={() => navigate('/login')}
        className="px-6 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-xl hover:bg-zinc-700 transition">
        Sign in
      </button>
    </div>
  );

  return (
    <div className="pt-14 max-w-2xl mx-auto px-5 sm:px-8 py-12">

      {/* Title */}
      <div className="mb-8">
        <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Share</p>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Add a resource</h1>
        <p className="text-[14px] text-zinc-500">Lend a textbook for the semester or donate it permanently to a peer in need.</p>
      </div>

      {/* ISBN scanner */}
      <div className="p-5 border border-zinc-200 rounded-2xl mb-6 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-zinc-400" />
          <p className="text-[13px] font-semibold text-zinc-700">Auto-fill from ISBN</p>
        </div>
        <p className="text-[12px] text-zinc-500">Enter the 10 or 13-digit ISBN from the book's barcode to auto-populate all fields.</p>
        <div className="flex gap-2">
          <input value={isbn} onChange={(e) => setIsbn(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); lookupIsbn(); } }}
            placeholder="e.g. 9780132350884"
            className="flex-1 text-[13px] px-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 transition" />
          <button type="button" onClick={lookupIsbn} disabled={isbnLoading}
            className="px-4 py-2 text-[13px] font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition whitespace-nowrap">
            {isbnLoading ? 'Looking up…' : 'Look up'}
          </button>
        </div>
        {isbnMsg && (
          <div className={`p-2.5 rounded-lg text-[12px] flex items-center gap-2 ${
            isbnMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {isbnMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            {isbnMsg.text}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{submitError}
          </div>
        )}

        {/* Type toggle */}
        <div>
          <Label>Listing type</Label>
          <div className="flex gap-3 mt-1.5">
            {[
              { v: 'lend', title: 'Lend', sub: 'Borrower returns it' },
              { v: 'donate', title: 'Donate', sub: 'Free — permanent gift' },
            ].map(({ v, title, sub }) => (
              <label key={v} className={`flex-1 p-3.5 rounded-xl border cursor-pointer transition ${
                form.listing_type === v ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
              }`}>
                <input type="radio" name="type" value={v} checked={form.listing_type === v}
                  onChange={() => set('listing_type', v)} className="sr-only" />
                <p className={`text-[13px] font-semibold ${form.listing_type === v ? 'text-zinc-900' : 'text-zinc-600'}`}>{title}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Title & Author */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Title *</Label>
            <input required value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="Introduction to Algorithms"
              className="mt-1.5 w-full text-[13px] px-3 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 text-zinc-800 placeholder:text-zinc-400 transition" />
          </div>
          <div>
            <Label>Author(s) *</Label>
            <input required value={form.author} onChange={(e) => set('author', e.target.value)}
              placeholder="Thomas H. Cormen et al."
              className="mt-1.5 w-full text-[13px] px-3 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 text-zinc-800 placeholder:text-zinc-400 transition" />
          </div>
        </div>

        {/* Subject, Format, Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Subject', key: 'subject', options: ['Computer Science', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'Economics', 'Literature', 'Engineering', 'General'] },
            { label: 'Format', key: 'format', options: [['textbook', 'Textbook'], ['hardcover', 'Hardcover'], ['paperback', 'Paperback'], ['notes_kit', 'Study Notes']] },
            { label: 'Condition', key: 'condition', options: [['new', 'Brand new'], ['like_new', 'Like new'], ['good', 'Good'], ['fair', 'Fair'], ['poor', 'Poor']] },
          ].map(({ label, key, options }) => (
            <div key={key}>
              <Label>{label}</Label>
              <select value={form[key]} onChange={(e) => set(key, e.target.value)}
                className="mt-1.5 w-full text-[13px] px-3 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 text-zinc-800 appearance-none cursor-pointer">
                {options.map((o) => Array.isArray(o)
                  ? <option key={o[0]} value={o[0]}>{o[1]}</option>
                  : <option key={o} value={o}>{o}</option>
                )}
              </select>
            </div>
          ))}
        </div>

        {/* Pickup & Max Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Pickup location</Label>
            <input value={form.pickup_location} onChange={(e) => set('pickup_location', e.target.value)}
              placeholder="Campus library, student union…"
              className="mt-1.5 w-full text-[13px] px-3 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 text-zinc-800 placeholder:text-zinc-400 transition" />
          </div>
          <div>
            <Label>{form.listing_type === 'lend' ? 'Max loan (days)' : 'Availability'}</Label>
            <input type="number" min="1" max="120" disabled={form.listing_type === 'donate'}
              value={form.listing_type === 'donate' ? '' : form.max_borrow_days}
              placeholder={form.listing_type === 'donate' ? 'Permanent' : ''}
              onChange={(e) => set('max_borrow_days', parseInt(e.target.value) || 30)}
              className="mt-1.5 w-full text-[13px] px-3 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 text-zinc-800 disabled:opacity-50 disabled:bg-zinc-50 transition" />
          </div>
        </div>

        {/* Cover image */}
        <div>
          <Label>Cover image URL</Label>
          <div className="flex items-center gap-3 mt-1.5">
            <input value={form.cover_image_url} onChange={(e) => set('cover_image_url', e.target.value)}
              placeholder="https://…"
              className="flex-1 text-[13px] px-3 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 text-zinc-800 placeholder:text-zinc-400 transition" />
            {form.cover_image_url && (
              <img src={form.cover_image_url} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }}
                className="w-8 h-10 object-cover rounded border border-zinc-200 shrink-0" />
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <textarea rows="3" value={form.description} onChange={(e) => set('description', e.target.value)}
            placeholder="Edition, any included study guides, course codes this covers…"
            className="mt-1.5 w-full text-[13px] px-3 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 resize-none text-zinc-800 placeholder:text-zinc-400 transition" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-[13px] font-medium border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="px-6 py-2.5 text-[13px] font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition">
            {submitting ? 'Publishing…' : 'Publish to community'}
          </button>
        </div>

      </form>
    </div>
  );
}

function Label({ children }) {
  return <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">{children}</p>;
}
