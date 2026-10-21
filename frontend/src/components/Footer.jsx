import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-[15px] text-zinc-900">BookBridge</span>
            </Link>
            <p className="text-[13px] text-zinc-500 leading-relaxed max-w-xs">
              Peer-to-peer textbook lending and free donations within your campus community.
            </p>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-zinc-900 uppercase tracking-widest mb-3">Explore</p>
            <ul className="space-y-2">
              {[
                { to: '/catalog', label: 'All Resources' },
                { to: '/catalog?subject=Computer%20Science', label: 'Computer Science' },
                { to: '/catalog?subject=Mathematics', label: 'Mathematics' },
                { to: '/catalog?listing_type=donate', label: 'Free Donations' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-[13px] text-zinc-500 hover:text-zinc-900 transition">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-zinc-900 uppercase tracking-widest mb-3">Community</p>
            <ul className="space-y-2">
              {[
                { to: '/add-book', label: 'Share a Book' },
                { to: '/dashboard', label: 'My Exchanges' },
                { to: '/register', label: 'Join BookBridge' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-[13px] text-zinc-500 hover:text-zinc-900 transition">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-zinc-900 uppercase tracking-widest mb-3">Platform</p>
            <ul className="space-y-2">
              {['ISBN Scanner', 'Trust Ratings', 'Campus Meetups', 'Lending Ledger'].map((l) => (
                <li key={l}><span className="text-[13px] text-zinc-400">{l}</span></li>
              ))}
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-zinc-400">© {new Date().getFullYear()} BookBridge. Built for students.</p>
          <p className="text-[12px] text-zinc-400">Democratizing access to educational resources.</p>
        </div>
      </div>
    </footer>
  );
}
