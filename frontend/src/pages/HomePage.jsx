import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, RefreshCw, Gift } from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentBooks, setRecentBooks] = useState([]);
  const [metrics, setMetrics] = useState({ total_books_listed: 24, available_books: 18, active_students: 12, completed_exchanges: 16, estimated_savings_usd: 1105 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [bRes, mRes] = await Promise.all([api.get('/resources?limit=6'), api.get('/history/metrics/overview')]);
        setRecentBooks(bRes.data);
        if (mRes.data) setMetrics(mRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/catalog?q=${encodeURIComponent(searchTerm)}` : '/catalog');
  };

  const subjects = ['Computer Science', 'Mathematics', 'Biology', 'Physics', 'Economics', 'Engineering'];

  return (
    <div className="pt-14">

      {/* ─── Hero ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-20 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-[12px] font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Free campus textbook sharing — no fees, no markups
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-900 tracking-tight leading-[1.05] mb-6">
            Borrow books.<br />
            Build community.
          </h1>

          <p className="text-[17px] sm:text-lg text-zinc-500 leading-relaxed max-w-xl mb-10">
            Connect with students who have textbooks to share. Lend yours when you're done. Zero cost, verified campus trust.
          </p>

          {/* Search */}
          <form onSubmit={onSearch} className="flex items-center gap-2 max-w-lg">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, or ISBN…"
              className="flex-1 text-[14px] px-4 py-3 bg-white border border-zinc-300 rounded-xl text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-500 transition"
            />
            <button type="submit"
              className="px-5 py-3 bg-zinc-900 text-white text-[14px] font-medium rounded-xl hover:bg-zinc-700 transition whitespace-nowrap shrink-0">
              Search
            </button>
          </form>

          {/* Subject pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {subjects.map((s) => (
              <Link key={s} to={`/catalog?subject=${encodeURIComponent(s)}`}
                className="px-3 py-1 text-[13px] border border-zinc-200 rounded-full text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition bg-white">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─────────────────────────────────────── */}
      <section className="border-y border-zinc-100 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { label: 'Books listed', value: `${metrics.total_books_listed}+`, icon: BookOpen },
            { label: 'Active students', value: `${metrics.active_students}+`, icon: Users },
            { label: 'Exchanges completed', value: `${metrics.completed_exchanges}+`, icon: RefreshCw },
            { label: 'Saved by community', value: `$${metrics.estimated_savings_usd.toLocaleString()}`, icon: Gift },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col gap-1">
              <Icon className="w-4 h-4 text-zinc-400 mb-1" />
              <p className="text-2xl font-bold text-zinc-900">{value}</p>
              <p className="text-[13px] text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Recently added ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Catalog</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Recently added</h2>
          </div>
          <Link to="/catalog"
            className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition group">
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => <div key={n} className="h-72 bg-zinc-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : recentBooks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-200 rounded-2xl">
            <p className="text-zinc-500 text-[14px]">No resources yet. Be the first to share one!</p>
            <Link to="/add-book" className="mt-4 inline-block text-[13px] font-medium text-zinc-900 underline underline-offset-4">
              Share a book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentBooks.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </section>

      {/* ─── How it works ───────────────────────────────────── */}
      <section className="bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
          <div className="mb-12">
            <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Process</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">How it works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Find or list', body: 'Search by course or ISBN. Upload unused textbooks in seconds — our scanner auto-fills title, author, and cover.' },
              { step: '02', title: 'Request & schedule', body: 'Send a borrow request with your loan timeline. Once approved, pick a campus meetup spot and confirm the handover.' },
              { step: '03', title: 'Return & build trust', body: 'Return the book when your semester ends. Leave honest ratings to strengthen your verified community score.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="space-y-3">
                <span className="text-[12px] font-mono font-bold text-zinc-400">{step}</span>
                <h3 className="text-[16px] font-semibold text-zinc-900">{title}</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-4">
            <Link to="/catalog"
              className="px-5 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-xl hover:bg-zinc-700 transition">
              Browse catalog
            </Link>
            <Link to="/register"
              className="px-5 py-2.5 border border-zinc-300 text-zinc-700 text-[13px] font-medium rounded-xl hover:border-zinc-500 hover:text-zinc-900 transition">
              Create account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
