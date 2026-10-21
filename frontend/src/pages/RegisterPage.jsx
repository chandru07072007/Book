import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, GraduationCap, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    institution: 'Stanford University',
    location: 'Central Campus',
    academic_interests: [],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await register(form); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="pt-14 max-w-lg mx-auto px-5 py-12">

      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight mb-1">Create an account</h1>
        <p className="text-[14px] text-zinc-500">Join the campus community and start sharing educational resources.</p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name *">
            <input required value={form.full_name} onChange={(e) => set('full_name', e.target.value)}
              placeholder="Alex Chen" className="input-field" />
          </Field>
          <Field label={
            <span className="flex items-center gap-1.5">
              Email *
              {isEdu && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  <GraduationCap className="w-2.5 h-2.5" />.edu verified
                </span>
              )}
            </span>
          }>
            <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)}
              placeholder="you@stanford.edu" className="input-field" />
          </Field>
        </div>

        <Field label="Password *">
          <input type="password" required value={form.password} onChange={(e) => set('password', e.target.value)}
            placeholder="••••••••" className="input-field" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="University / School">
            <input value={form.institution} onChange={(e) => set('institution', e.target.value)}
              placeholder="Stanford University" className="input-field" />
          </Field>
          <Field label="Campus location">
            <input value={form.location} onChange={(e) => set('location', e.target.value)}
              placeholder="Engineering Quad" className="input-field" />
          </Field>
        </div>

        {/* Academic interests */}
        <Field label="Academic interests">
          <div className="flex gap-2 mb-2">
            <input value={interestInput} onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
              placeholder="Computer Science, Math, Biology…" className="flex-1 input-field" />
            <button type="button" onClick={addInterest}
              className="px-3 py-2 text-[12px] font-medium border border-zinc-200 rounded-lg text-zinc-700 hover:border-zinc-400 transition">
              Add
            </button>
          </div>
          {form.academic_interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.academic_interests.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium bg-zinc-100 text-zinc-700 rounded-full">
                  {t}
                  <button type="button" onClick={() => set('academic_interests', form.academic_interests.filter(i => i !== t))}
                    className="text-zinc-400 hover:text-zinc-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-zinc-900 text-white text-[14px] font-medium rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition">
          {loading ? 'Creating account…' : 'Create account'}
        </button>

      </form>

      <p className="mt-6 text-center text-[13px] text-zinc-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-zinc-900 hover:underline underline-offset-2">Sign in</Link>
      </p>

    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
