import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Package, Inbox, Send, Calendar, History, Plus,
  Star, GraduationCap, MapPin, Clock, AlertCircle, Trash2, MessageSquare, Check
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScheduleModal from '../components/ScheduleModal';
import ReviewModal from '../components/ReviewModal';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'incoming', label: 'Incoming', icon: Inbox },
  { id: 'outgoing', label: 'Outgoing', icon: Send },
  { id: 'schedules', label: 'Meetups', icon: Calendar },
  { id: 'history', label: 'History', icon: History },
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [inventory, setInventory] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [scheduleModal, setScheduleModal] = useState({ open: false, request: null });
  const [reviewModal, setReviewModal] = useState({ open: false, item: null });

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [inv, inc, out, sch, hist] = await Promise.all([
        api.get(`/resources?provider_id=${user.id}`),
        api.get('/requests/incoming'),
        api.get('/requests/outgoing'),
        api.get('/schedules'),
        api.get('/history'),
      ]);
      setInventory(inv.data);
      setIncoming(inc.data);
      setOutgoing(out.data);
      setSchedules(sch.data);
      setHistory(hist.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    else fetchAll();
  }, [user, isAuthenticated]);

  const action = async (fn) => { try { await fn(); await fetchAll(); } catch (e) { alert(e.response?.data?.detail || 'Action failed.'); } };

  const pendingCount = incoming.filter(r => r.status === 'pending').length;

  if (loading) return (
    <div className="pt-14 flex items-center justify-center min-h-[60vh]">
      <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-14 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10 pb-8 border-b border-zinc-100">
        <img
          src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name}&backgroundColor=18181b&textColor=ffffff`}
          alt={user?.full_name}
          className="w-14 h-14 rounded-2xl object-cover bg-zinc-900 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-zinc-900">{user?.full_name}</h1>
            {user?.is_edu_verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                <GraduationCap className="w-3 h-3" />Verified .edu
              </span>
            )}
          </div>
          <p className="text-[13px] text-zinc-500">{user?.institution} · {user?.location}</p>
          <div className="flex items-center gap-4 mt-1 text-[12px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {user?.trust_score?.toFixed(1)} trust score
            </span>
            <span>{user?.total_exchanges} exchanges</span>
          </div>
        </div>
        <Link to="/add-book"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-[13px] font-medium rounded-xl hover:bg-zinc-700 transition shrink-0">
          <Plus className="w-3.5 h-3.5" />Share a book
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide border-b border-zinc-100 mb-8 pb-0">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          const badge = id === 'incoming' ? pendingCount : 0;
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition -mb-px ${
                active ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
              {badge > 0 && (
                <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── OVERVIEW ──────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-8">

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Listed books', val: inventory.length, onClick: () => setTab('inventory') },
              { label: 'Pending requests', val: pendingCount, onClick: () => setTab('incoming'), urgent: pendingCount > 0 },
              { label: 'Active borrows', val: outgoing.filter(r => ['approved', 'scheduled', 'active'].includes(r.status)).length, onClick: () => setTab('outgoing') },
              { label: 'Scheduled meetups', val: schedules.length, onClick: () => setTab('schedules') },
            ].map(({ label, val, onClick, urgent }) => (
              <button key={label} onClick={onClick}
                className="text-left p-5 border border-zinc-200 rounded-2xl hover:border-zinc-300 transition group">
                <p className={`text-2xl font-bold mb-1 ${urgent ? 'text-red-500' : 'text-zinc-900'}`}>{val}</p>
                <p className="text-[12px] text-zinc-500 group-hover:text-zinc-700 transition">{label}</p>
              </button>
            ))}
          </div>

          {/* Alert for pending */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>You have <strong>{pendingCount}</strong> pending request{pendingCount > 1 ? 's' : ''} waiting for your review.</span>
              <button onClick={() => setTab('incoming')}
                className="ml-auto text-[12px] font-semibold text-amber-700 underline underline-offset-2 shrink-0">
                Review
              </button>
            </div>
          )}

          {/* Recent inventory */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-zinc-900">Your listings</h2>
              <button onClick={() => setTab('inventory')} className="text-[13px] text-zinc-400 hover:text-zinc-900 transition">View all</button>
            </div>
            {inventory.length === 0 ? (
              <p className="text-[13px] text-zinc-400 py-6 text-center border border-dashed border-zinc-200 rounded-xl">
                You haven't listed any books yet.
              </p>
            ) : (
              <div className="space-y-2">
                {inventory.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl hover:border-zinc-300 transition">
                    <img src={item.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80'}
                      alt={item.title} className="w-8 h-10 object-cover rounded shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-zinc-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-zinc-400">{item.subject} · {item.listing_type}</p>
                    </div>
                    <StatusPill status={item.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─── INVENTORY ─────────────────────────────────── */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-zinc-900">Your resource inventory</h2>
            <Link to="/add-book" className="text-[13px] font-medium text-zinc-900 underline underline-offset-2">+ Add resource</Link>
          </div>

          {inventory.length === 0 ? (
            <EmptyState text="You haven't listed any books yet." cta="Share your first book" link="/add-book" />
          ) : (
            <div className="border border-zinc-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    {['Item', 'Subject', 'Type', 'Condition', 'Status', ''].map((h) => (
                      <th key={h} className="py-3 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={item.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80'}
                            alt={item.title} className="w-8 h-10 object-cover rounded shrink-0" />
                          <div className="min-w-0">
                            <Link to={`/book/${item.id}`} className="font-medium text-zinc-900 hover:underline underline-offset-2 truncate block max-w-xs">{item.title}</Link>
                            <p className="text-[11px] text-zinc-400 truncate">by {item.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-600">{item.subject}</td>
                      <td className="py-3 px-4 capitalize text-zinc-600">{item.listing_type}</td>
                      <td className="py-3 px-4 text-zinc-600 capitalize">{item.condition.replace('_', ' ')}</td>
                      <td className="py-3 px-4"><StatusPill status={item.status} /></td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => action(() => api.delete(`/resources/${item.id}`))}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── INCOMING ──────────────────────────────────── */}
      {tab === 'incoming' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-semibold text-zinc-900">Incoming borrow requests</h2>
          {incoming.length === 0 ? (
            <EmptyState text="No incoming requests yet." />
          ) : (
            <div className="space-y-3">
              {incoming.map((req) => (
                <RequestCard key={req.id} req={req} perspective="provider"
                  onApprove={() => action(() => api.put(`/requests/${req.id}/approve`))}
                  onReject={() => { if (window.confirm('Decline this request?')) action(() => api.put(`/requests/${req.id}/reject`)); }}
                  onSchedule={() => setScheduleModal({ open: true, request: req })}
                  onComplete={() => { if (window.confirm('Mark as returned?')) action(() => api.put(`/requests/${req.id}/complete-return`)); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── OUTGOING ──────────────────────────────────── */}
      {tab === 'outgoing' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-semibold text-zinc-900">Your borrow & claim requests</h2>
          {outgoing.length === 0 ? (
            <EmptyState text="You haven't made any requests yet." cta="Browse catalog" link="/catalog" />
          ) : (
            <div className="space-y-3">
              {outgoing.map((req) => (
                <RequestCard key={req.id} req={req} perspective="borrower"
                  onSchedule={() => setScheduleModal({ open: true, request: req })}
                  onComplete={() => { if (window.confirm('Confirm return?')) action(() => api.put(`/requests/${req.id}/complete-return`)); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SCHEDULES ─────────────────────────────────── */}
      {tab === 'schedules' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-semibold text-zinc-900">Collection meetup calendar</h2>
          {schedules.length === 0 ? (
            <EmptyState text="No meetups scheduled yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules.map((sch) => (
                <div key={sch.id} className="p-4 border border-zinc-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[14px] text-zinc-900 truncate">{sch.resource_title}</p>
                    <StatusPill status={sch.status} />
                  </div>
                  <div className="space-y-1.5 text-[12px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      {new Date(sch.meetup_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      {sch.meetup_location}
                    </div>
                    {sch.notes && <p className="pl-5 text-zinc-400 italic">{sch.notes}</p>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <p className="text-[12px] text-zinc-400">With {user.id === sch.provider_id ? sch.borrower_name : sch.provider_name}</p>
                    {sch.status !== 'confirmed' && (
                      <button onClick={() => action(() => api.put(`/schedules/${sch.id}/confirm`))}
                        className="flex items-center gap-1 text-[12px] font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 px-2.5 py-1 rounded-lg transition">
                        <Check className="w-3 h-3" />Confirm
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── HISTORY ───────────────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-semibold text-zinc-900">Lending history & trust ledger</h2>
          {history.length === 0 ? (
            <EmptyState text="No completed transactions yet." />
          ) : (
            <div className="space-y-3">
              {history.map((h) => {
                const isProvider = String(user.id) === String(h.provider_id);
                const counterName = isProvider ? h.borrower_name : h.provider_name;
                const counterId = isProvider ? h.borrower_id : h.provider_id;
                const myRating = isProvider ? h.rating_for_borrower : h.rating_for_provider;

                return (
                  <div key={h.id} className="p-4 border border-zinc-200 rounded-2xl">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-medium text-[14px] text-zinc-900">{h.resource_title}</p>
                        <p className="text-[12px] text-zinc-500">With {counterName} · {h.action_type.replace('_', ' ')}</p>
                      </div>
                      <p className="text-[11px] text-zinc-400 shrink-0">
                        {new Date(h.end_date || h.start_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      {myRating ? (
                        <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                          <span className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${myRating >= s ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
                            ))}
                          </span>
                          <span>Rating submitted</span>
                        </div>
                      ) : (
                        <p className="text-[12px] text-zinc-400">No rating yet</p>
                      )}

                      {!myRating && (
                        <button
                          onClick={() => setReviewModal({ open: true, item: { ...h, target_user_id: counterId, target_user_name: counterName } })}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 px-2.5 py-1 rounded-lg transition">
                          <Star className="w-3 h-3" />Leave rating
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ScheduleModal request={scheduleModal.request} isOpen={scheduleModal.open}
        onClose={() => setScheduleModal({ open: false, request: null })}
        onSuccess={() => { fetchAll(); setTab('schedules'); }} />

      <ReviewModal historyItem={reviewModal.item} isOpen={reviewModal.open}
        onClose={() => setReviewModal({ open: false, item: null })}
        onSuccess={fetchAll} />

    </div>
  );
}

// ─── Helper components ──────────────────────────────

function StatusPill({ status }) {
  const styles = {
    available: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border border-blue-200',
    scheduled: 'bg-purple-50 text-purple-700 border border-purple-200',
    checked_out: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
    completed: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    rejected: 'bg-red-50 text-red-600 border border-red-200',
    proposed: 'bg-amber-50 text-amber-700 border border-amber-200',
    donated: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
  };
  const label = { checked_out: 'Borrowed' }[status] || status;
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${styles[status] || 'bg-zinc-100 text-zinc-600'}`}>
      {label}
    </span>
  );
}

function EmptyState({ text, cta, link }) {
  return (
    <div className="py-16 text-center border border-dashed border-zinc-200 rounded-2xl">
      <p className="text-[14px] text-zinc-500 mb-3">{text}</p>
      {cta && link && (
        <Link to={link} className="text-[13px] font-medium text-zinc-900 underline underline-offset-2">{cta}</Link>
      )}
    </div>
  );
}

function RequestCard({ req, perspective, onApprove, onReject, onSchedule, onComplete }) {
  return (
    <div className="p-4 border border-zinc-200 rounded-2xl space-y-3">
      <div className="flex items-start gap-3">
        <img src={req.resource_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80'}
          alt={req.resource_title} className="w-9 h-12 object-cover rounded shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-[14px] text-zinc-900 truncate">{req.resource_title}</p>
            <StatusPill status={req.status} />
          </div>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            {perspective === 'provider'
              ? `Requested by ${req.borrower_name}`
              : `From ${req.provider_name}`}
            {req.request_type !== 'donate' && ` · ${req.needed_duration_days} days`}
          </p>
          {req.purpose_note && (
            <p className="flex items-start gap-1.5 mt-2 text-[12px] text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-lg p-2.5">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
              "{req.purpose_note}"
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
        {req.status === 'pending' && perspective === 'provider' && (
          <>
            <button onClick={onReject} className="px-3 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition">Decline</button>
            <button onClick={onApprove} className="px-3 py-1.5 text-[12px] font-medium bg-zinc-900 text-white hover:bg-zinc-700 rounded-lg transition">Approve</button>
          </>
        )}
        {req.status === 'approved' && (
          <button onClick={onSchedule} className="px-3 py-1.5 text-[12px] font-medium border border-zinc-200 text-zinc-700 hover:border-zinc-400 rounded-lg transition flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />Schedule meetup
          </button>
        )}
        {['scheduled', 'approved', 'checked_out'].includes(req.status) && (
          <button onClick={onComplete} className="px-3 py-1.5 text-[12px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition">
            Mark complete
          </button>
        )}
        {['pending', 'approved', 'rejected', 'completed'].includes(req.status) && !['approved', 'scheduled', 'checked_out'].includes(req.status) && (
          <span className="text-[12px] text-zinc-400">
            {req.status === 'completed' ? 'Transaction complete.' : req.status === 'pending' && perspective === 'borrower' ? 'Waiting for provider review…' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
