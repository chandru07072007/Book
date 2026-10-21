import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';

const conditionLabel = {
  new: 'New', like_new: 'Like new', good: 'Good', fair: 'Fair', poor: 'Poor'
};

const conditionDot = {
  new: 'bg-emerald-500', like_new: 'bg-emerald-400',
  good: 'bg-blue-400', fair: 'bg-amber-400', poor: 'bg-zinc-400'
};

export default function BookCard({ book }) {
  const available = book.status === 'available';
  const isDonate = book.listing_type === 'donate';

  return (
    <Link
      to={`/book/${book.id}`}
      className="group block bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-sm transition-all duration-200"
    >
      {/* Cover */}
      <div className="relative bg-zinc-50 border-b border-zinc-100 overflow-hidden aspect-[4/3] flex items-center justify-center p-4">
        <img
          src={book.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
          alt={book.title}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400'; }}
          className="h-full object-contain group-hover:scale-[1.03] transition-transform duration-300 drop-shadow-sm"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge color={available ? 'green' : 'zinc'}>{available ? 'Available' : book.status === 'checked_out' ? 'Borrowed' : book.status}</Badge>
          {isDonate && <Badge color="purple">Free</Badge>}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{book.subject}</p>
        <h3 className="font-semibold text-[14px] text-zinc-900 leading-snug line-clamp-1 mb-0.5">{book.title}</h3>
        <p className="text-[13px] text-zinc-500 line-clamp-1 mb-3">by {book.author}</p>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${conditionDot[book.condition] || 'bg-zinc-400'}`} />
            <span className="text-[12px] text-zinc-500 truncate">{conditionLabel[book.condition]}</span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-zinc-400 shrink-0">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{book.provider_trust_score?.toFixed(1) || '5.0'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2 text-[12px] text-zinc-400 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{book.pickup_location || 'Campus Library'}</span>
        </div>
      </div>
    </Link>
  );
}

function Badge({ color, children }) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    zinc: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[color] || styles.zinc}`}>
      {children}
    </span>
  );
}
