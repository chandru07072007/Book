import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import FilterSidebar from '../components/FilterSidebar';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    subject: searchParams.get('subject') || 'all',
    format: 'all',
    condition: 'all',
    listing_type: searchParams.get('listing_type') || 'all',
    status: '',
  });

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setFilters(f => ({ ...f, subject: searchParams.get('subject') || 'all', listing_type: searchParams.get('listing_type') || 'all' }));
  }, [searchParams]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const p = {};
      if (searchTerm.trim()) p.q = searchTerm.trim();
      if (filters.subject !== 'all') p.subject = filters.subject;
      if (filters.format !== 'all') p.format = filters.format;
      if (filters.condition !== 'all') p.condition = filters.condition;
      if (filters.listing_type !== 'all') p.listing_type = filters.listing_type;
      if (filters.status) p.status = filters.status;
      const res = await api.get('/resources', { params: p });
      setBooks(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, [filters]);

  const reset = () => {
    setSearchTerm('');
    setFilters({ subject: 'all', format: 'all', condition: 'all', listing_type: 'all', status: '' });
    setSearchParams({});
  };

  return (
    <div className="pt-14 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Library</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">Resource catalog</h1>
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-3 mb-8">
        <form onSubmit={(e) => { e.preventDefault(); fetchBooks(); }} className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, author, ISBN…"
            className="w-full text-[13px] pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 transition"
          />
        </form>

        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium border border-zinc-200 rounded-lg text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </button>

        <span className="text-[13px] text-zinc-400 ml-auto">{books.length} result{books.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Active filter chips */}
      {(searchTerm || filters.subject !== 'all' || filters.listing_type !== 'all' || filters.status) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {searchTerm && <Chip label={`"${searchTerm}"`} onRemove={() => { setSearchTerm(''); fetchBooks(); }} />}
          {filters.subject !== 'all' && <Chip label={filters.subject} onRemove={() => setFilters(f => ({ ...f, subject: 'all' }))} />}
          {filters.listing_type !== 'all' && <Chip label={filters.listing_type} onRemove={() => setFilters(f => ({ ...f, listing_type: 'all' }))} />}
          {filters.status && <Chip label="Available only" onRemove={() => setFilters(f => ({ ...f, status: '' }))} />}
          <button onClick={reset} className="text-[12px] text-zinc-400 hover:text-zinc-900 transition underline underline-offset-2">Clear all</button>
        </div>
      )}

      <div className="flex gap-8 items-start">

        {/* Sidebar */}
        {(sidebarOpen) && (
          <aside className="w-52 shrink-0 sticky top-20">
            <FilterSidebar filters={filters} setFilters={setFilters} onReset={reset} />
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="h-72 bg-zinc-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : books.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-zinc-200 rounded-2xl">
              <p className="text-[15px] font-medium text-zinc-700 mb-1">No results found</p>
              <p className="text-[13px] text-zinc-400 mb-5">Try a different search term or reset your filters.</p>
              <button onClick={reset} className="text-[13px] font-medium text-zinc-900 underline underline-offset-2">Reset filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {books.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium bg-zinc-100 text-zinc-700 rounded-full">
      {label}
      <button onClick={onRemove} className="text-zinc-400 hover:text-zinc-900 transition">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
