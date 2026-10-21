import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, GraduationCap, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    institution: 'Stanford University',
    location: 'Central Campus',
    academic_interests: ['Computer Science'],
    bio: ''
  });
  const [interestInput, setInterestInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdu = form.email.toLowerCase().endsWith('.edu') || form.email.includes('.ac.') || form.email.includes('edu.');

  const addInterest = () => {
    const t = interestInput.trim();
    if (t && !form.academic_interests.includes(t)) {
      setForm(f => ({ ...f, academic_interests: [...f.academic_interests, t] }));
      setInterestInput('');
    }
  };

  const removeInterest = (tag) => {
    setForm(f => ({ ...f, academic_interests: f.academic_interests.filter(i => i !== tag) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 pb-16 max-w-xl mx-auto px-5 sm:px-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">Create an account</h1>
        <p className="text-[14px] text-zinc-500">Join the campus community and start sharing educational resources.</p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registration Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

        {/* Row 1: Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              placeholder="Alex Chen"
              className="w-full text-[14px] px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 text-zinc-900 placeholder:text-zinc-400 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                Email <span className="text-red-500">*</span>
              </label>
              {isEdu && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  <GraduationCap className="w-3 h-3" />.edu verified
                </span>
              )}
            </div>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@stanford.edu"
              className="w-full text-[14px] px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 text-zinc-900 placeholder:text-zinc-400 transition"
            />
          </div>
        </div>

        {/* Row 2: Password */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="••••••••"
            className="w-full text-[14px] px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 text-zinc-900 placeholder:text-zinc-400 transition"
          />
        </div>

        {/* Row 3: Institution & Campus Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
              University / School
            </label>
            <input
              type="text"
              value={form.institution}
              onChange={(e) => set('institution', e.target.value)}
              placeholder="Stanford University"
              className="w-full text-[14px] px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 text-zinc-900 placeholder:text-zinc-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
              Campus Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Central Campus"
              className="w-full text-[14px] px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 text-zinc-900 placeholder:text-zinc-400 transition"
            />
          </div>
        </div>

        {/* Row 4: Academic Interests */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
            Academic Interests
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
              placeholder="Computer Science, Math, Biology…"
              className="flex-1 text-[14px] px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 text-zinc-900 placeholder:text-zinc-400 transition"
            />
            <button
              type="button"
              onClick={addInterest}
              className="px-4 py-2.5 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 rounded-xl transition"
            >
              Add
            </button>
          </div>

          {form.academic_interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {form.academic_interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-full"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeInterest(tag)}
                    className="text-zinc-400 hover:text-red-500 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3.5 bg-zinc-900 text-white text-[14px] font-semibold rounded-2xl hover:bg-zinc-700 shadow-sm disabled:opacity-50 transition"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

      </form>

      <p className="mt-6 text-center text-[13px] text-zinc-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-zinc-900 hover:underline underline-offset-2">
          Sign in
        </Link>
      </p>

    </div>
  );
}
