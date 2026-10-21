import React from 'react';
import { Check } from 'lucide-react';

const SUBJECTS = ['All', 'Computer Science', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'Economics', 'Literature', 'Engineering'];

export default function FilterSidebar({ filters, setFilters, onReset }) {
  const set = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-zinc-900 uppercase tracking-widest">Filters</p>
        <button onClick={onReset} className="text-[12px] text-zinc-400 hover:text-zinc-900 transition">Reset</button>
      </div>

      {/* Exchange type */}
      <Section label="Type">
        <div className="flex gap-2">
          {[{ v: 'all', l: 'All' }, { v: 'lend', l: 'Loan' }, { v: 'donate', l: 'Donate' }].map(({ v, l }) => (
            <button key={v} onClick={() => set('listing_type', v)}
              className={`flex-1 py-1.5 text-[12px] font-medium rounded-lg border transition ${
                filters.listing_type === v
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </Section>

      {/* Availability */}
      <Section label="Availability">
        <div className="space-y-2">
          {[{ v: '', l: 'All items' }, { v: 'available', l: 'Available only' }].map(({ v, l }) => (
            <label key={v} className="flex items-center gap-2.5 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                filters.status === v ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300 group-hover:border-zinc-500'
              }`}>
                {filters.status === v && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-[13px] text-zinc-600 group-hover:text-zinc-900 transition">{l}</span>
              <input type="radio" name="status" value={v} checked={filters.status === v}
                onChange={() => set('status', v)} className="sr-only" />
            </label>
          ))}
        </div>
      </Section>

      {/* Subject */}
      <Section label="Subject">
        <div className="space-y-0.5">
          {SUBJECTS.map((s) => {
            const active = s === 'All' ? (!filters.subject || filters.subject === 'all') : filters.subject === s;
            return (
              <button key={s} onClick={() => set('subject', s === 'All' ? 'all' : s)}
                className={`w-full text-left px-2.5 py-2 text-[13px] rounded-lg flex items-center justify-between transition ${
                  active ? 'bg-zinc-100 text-zinc-900 font-medium' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                }`}>
                {s}
                {active && <Check className="w-3.5 h-3.5 text-zinc-700" />}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Condition */}
      <Section label="Condition">
        <select value={filters.condition} onChange={(e) => set('condition', e.target.value)}
          className="w-full text-[13px] bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-zinc-400 text-zinc-700 appearance-none cursor-pointer">
          {[['all', 'Any condition'], ['new', 'Brand new'], ['like_new', 'Like new'], ['good', 'Good'], ['fair', 'Fair']].map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </Section>

    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</p>
      {children}
    </div>
  );
}
