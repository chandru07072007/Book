import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, GraduationCap, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RequestModal from '../components/RequestModal';

const conditionText = {
  new: 'Brand new', like_new: 'Like new', good: 'Good condition',
  fair: 'Fair — some wear', poor: 'Poor condition'
};

const statusStyles = {
  available: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  checked_out: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
  donated: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
};

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const fetchBook = async () => {
    setLoading(true);
    try { setBook((await api.get(`/resources/${id}`)).data); }
    catch { setError('Resource not found or has been removed.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBook(); }, [id]);

  if (loading) return (
    <div className="pt-14 flex items-center justify-center min-h-[60vh]">
      <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
    </div>
  );

  if (error || !book) return (
    <div className="pt-14 max-w-md mx-auto px-5 py-20 text-center space-y-4">
      <p className="text-[15px] text-zinc-500">{error || 'Resource not found'}</p>
      <Link to="/catalog" className="text-[13px] font-medium text-zinc-900 underline underline-offset-2">← Back to catalog</Link>
    </div>
  );

  const isOwner = user && String(user.id) === String(book.provider_id);
  const isAvailable = book.status === 'available';
  const isDonate = book.listing_type === 'donate';

  return (
    <div className="pt-14 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">

      {/* Breadcrumb */}
      <button onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-900 transition mb-8">
        <ArrowLeft className="w-3.5 h-3.5" />Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Cover */}
        <div className="lg:col-span-4">
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden aspect-[3/4] max-w-xs mx-auto lg:mx-0 flex items-center justify-center p-8">
            <img
              src={book.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}
              alt={book.title}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600'; }}
              className="max-h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-8 space-y-6">

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[book.status] || 'bg-zinc-100 text-zinc-600'}`}>
                {book.status === 'checked_out' ? 'Currently borrowed' : book.status}
              </span>
              {isDonate && (
                <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Free donation
                </span>
              )}
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600">
                {book.subject}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight leading-snug mb-1">{book.title}</h1>
            <p className="text-[16px] text-zinc-500">by {book.author}</p>
          </div>

          {/* Specs table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'ISBN', val: book.isbn || 'N/A' },
              { label: 'Condition', val: conditionText[book.condition] || book.condition },
              { label: 'Format', val: book.format?.replace('_', ' ') || 'Book' },
              { label: 'Max loan', val: isDonate ? 'Permanent' : `${book.max_borrow_days} days` },
            ].map(({ label, val }) => (
              <div key={label} className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-[13px] font-semibold text-zinc-800">{val}</p>
              </div>
            ))}
          </div>

          {/* Pickup */}
          <div className="flex items-center gap-2 text-[13px] text-zinc-600">
            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>Pickup at <strong className="text-zinc-900">{book.pickup_location || 'Campus library'}</strong></span>
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">About this copy</p>
              <p className="text-[14px] text-zinc-600 leading-relaxed whitespace-pre-line">{book.description}</p>
            </div>
          )}

          {/* Provider card */}
          <div className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-[15px] shrink-0">
              {book.provider_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[14px] text-zinc-900 truncate">{book.provider_name}</span>
                {book.is_edu_verified && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-medium bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded">
                    <GraduationCap className="w-3 h-3" />.edu
                  </span>
                )}
              </div>
              <p className="text-[12px] text-zinc-400">{book.provider_institution || 'Campus community'}</p>
            </div>
            <div className="ml-auto text-right shrink-0">
              <div className="flex items-center gap-1 text-[13px] font-bold text-zinc-900">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {book.provider_trust_score?.toFixed(1) || '5.0'}
              </div>
              <p className="text-[11px] text-zinc-400">trust score</p>
            </div>
          </div>

          {/* Success message */}
          {requestSuccess && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] text-emerald-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Request sent! Check your Dashboard to track its status.
            </div>
          )}

          {/* CTA */}
          <div>
            {isOwner ? (
              <div className="p-4 border border-zinc-200 rounded-xl text-center">
                <p className="text-[13px] text-zinc-500 mb-3">You are the provider of this listing</p>
                <Link to="/dashboard" className="text-[13px] font-medium text-zinc-900 underline underline-offset-2">
                  Manage in Dashboard →
                </Link>
              </div>
            ) : isAvailable ? (
              isAuthenticated ? (
                <button onClick={() => setRequestOpen(true)}
                  className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white text-[14px] font-medium rounded-xl hover:bg-zinc-700 transition">
                  {isDonate ? 'Claim this donation' : 'Request to borrow'}
                </button>
              ) : (
                <div className="space-y-2">
                  <button onClick={() => navigate('/login')}
                    className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white text-[14px] font-medium rounded-xl hover:bg-zinc-700 transition">
                    Sign in to request
                  </button>
                  <p className="text-[12px] text-zinc-400">Free account — no credit card required</p>
                </div>
              )
            ) : (
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
                <p className="text-[13px] text-zinc-500">
                  This item is currently <strong>{book.status === 'checked_out' ? 'borrowed' : book.status}</strong> and unavailable.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      <RequestModal
        book={book}
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
        onSuccess={() => { setRequestSuccess(true); fetchBook(); }}
      />

    </div>
  );
}
