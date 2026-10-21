import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Plus, LayoutGrid, LogOut, Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/catalog?q=${encodeURIComponent(q.trim())}`); setQ(''); }
  };

  const isActive = (p) => location.pathname === p;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-14 flex items-center gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-zinc-900">BookBridge</span>
        </Link>

        {/* Search — desktop */}
        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books, authors, ISBNs…"
            className="w-full text-[13px] pl-8.5 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition"
          />
        </form>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-0.5 ml-auto">
          <NavLink to="/catalog" active={isActive('/catalog')}>Catalog</NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/add-book" active={isActive('/add-book')}>
                <Plus className="w-3.5 h-3.5 mr-1 inline" />Share
              </NavLink>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>

              <div className="ml-2 flex items-center gap-2 pl-3 border-l border-zinc-200">
                <img
                  src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name}&backgroundColor=18181b&textColor=ffffff`}
                  alt={user?.full_name}
                  className="w-7 h-7 rounded-full object-cover bg-zinc-900"
                />
                <span className="text-[13px] font-medium text-zinc-700 hidden lg:block max-w-28 truncate">
                  {user?.full_name?.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link to="/login" className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition">
                Sign in
              </Link>
              <Link to="/register" className="text-[13px] font-medium text-white bg-zinc-900 hover:bg-zinc-700 px-4 py-1.5 rounded-lg transition">
                Join
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto w-8 h-8 flex items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 transition"
        >
          {mobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-5 py-4 space-y-1">
          <form onSubmit={onSearch} className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search books…"
              className="w-full text-[13px] pl-8.5 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none"
            />
          </form>
          {[
            { to: '/catalog', label: 'Catalog' },
            ...(isAuthenticated ? [
              { to: '/add-book', label: 'Share a Book' },
              { to: '/dashboard', label: 'Dashboard' },
            ] : [
              { to: '/login', label: 'Sign in' },
              { to: '/register', label: 'Join' },
            ])
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              className={`block text-[14px] px-3 py-2 rounded-lg transition ${isActive(to) ? 'bg-zinc-100 font-medium text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'}`}>
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <button onClick={() => { logout(); setMobileOpen(false); }}
              className="w-full text-left text-[14px] px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition mt-1">
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to}
      className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
        active ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
      }`}>
      {children}
    </Link>
  );
}
