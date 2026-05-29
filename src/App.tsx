import { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, List, Plus, Search, ChevronDown,
  ChevronUp, Pencil, Trash2, X, TrendingUp,
  DollarSign, Target, Award, AlertCircle, Menu,
} from 'lucide-react';
import { useDeals } from './hooks/useDeals';
import { Deal, Filters, Stage, Priority } from './types';

const STAGES: Stage[] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

const STAGE_COLOR: Record<Stage, string> = {
  Lead: '#60A5FA', Qualified: '#A78BFA', Proposal: '#FBBF24',
  Negotiation: '#FB923C', Won: '#34D399', Lost: '#F87171',
};
const PRIORITY_COLOR: Record<Priority, string> = {
  Low: '#5C5A74', Medium: '#FBBF24', High: '#F87171',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
}) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '1.25rem 1.5rem',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{sub}</div>
      </div>
    </div>
  );
}

// ─── Stage Pill ──────────────────────────────────────────────────────────────

function StagePill({ stage }: { stage: Stage }) {
  const c = STAGE_COLOR[stage];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      background: `${c}15`, border: `1px solid ${c}35`,
      fontSize: 11.5, fontWeight: 500, color: c, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, flexShrink: 0 }} />
      {stage}
    </span>
  );
}

function PriorityDot({ priority }: { priority: Priority }) {
  const c = PRIORITY_COLOR[priority];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
      {priority}
    </span>
  );
}

// ─── Deal Modal ──────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  company: '', contact: '', email: '', value: '',
  stage: 'Lead' as Stage, priority: 'Medium' as Priority, notes: '',
};

function DealModal({ deal, onSave, onClose }: {
  deal?: Deal;
  onSave: (data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(
    deal ? { ...deal, value: String(deal.value) } : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  const set = (k: keyof typeof EMPTY_FORM, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.company.trim()) e.company = 'Required';
    if (!form.contact.trim()) e.contact = 'Required';
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0) e.value = 'Enter a valid amount';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      company: form.company.trim(), contact: form.contact.trim(),
      email: form.email.trim(), value: Number(form.value),
      stage: form.stage, priority: form.priority, notes: form.notes.trim(),
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%', background: 'var(--surface2)',
    border: `1px solid ${hasError ? '#F87171' : 'var(--border)'}`,
    borderRadius: 10, padding: '9px 13px', fontSize: 13.5,
    color: 'var(--text)', outline: 'none', transition: 'border-color 0.15s',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 500,
    color: 'var(--text2)', marginBottom: 5,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>{deal ? 'Edit Deal' : 'New Deal'}</h2>
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)',
          }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Company *</label>
              <input style={inputStyle(!!errors.company)} value={form.company}
                onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
              {errors.company && <p style={{ fontSize: 11, color: '#F87171', marginTop: 3 }}>{errors.company}</p>}
            </div>
            <div>
              <label style={labelStyle}>Contact *</label>
              <input style={inputStyle(!!errors.contact)} value={form.contact}
                onChange={e => set('contact', e.target.value)} placeholder="Jane Smith" />
              {errors.contact && <p style={{ fontSize: 11, color: '#F87171', marginTop: 3 }}>{errors.contact}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle()} value={form.email} type="email"
                onChange={e => set('email', e.target.value)} placeholder="jane@acme.com" />
            </div>
            <div>
              <label style={labelStyle}>Deal Value (€) *</label>
              <input style={inputStyle(!!errors.value)} value={form.value} type="number" min="0"
                onChange={e => set('value', e.target.value)} placeholder="5000" />
              {errors.value && <p style={{ fontSize: 11, color: '#F87171', marginTop: 3 }}>{errors.value}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Stage</label>
              <div style={{ position: 'relative' }}>
                <select style={{ ...inputStyle(), paddingRight: 32, appearance: 'none', cursor: 'pointer' } as React.CSSProperties}
                  value={form.stage} onChange={e => set('stage', e.target.value as Stage)}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <div style={{ position: 'relative' }}>
                <select style={{ ...inputStyle(), paddingRight: 32, appearance: 'none', cursor: 'pointer' } as React.CSSProperties}
                  value={form.priority} onChange={e => set('priority', e.target.value as Priority)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle(), resize: 'vertical', minHeight: 80 } as React.CSSProperties}
              value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Add context, next steps..." />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={onClose} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '8px 18px', fontSize: 13.5,
              color: 'var(--text2)', fontWeight: 500,
            }}>Cancel</button>
            <button onClick={handleSave} style={{
              background: 'var(--accent)', border: 'none',
              borderRadius: 10, padding: '8px 22px', fontSize: 13.5,
              color: '#fff', fontWeight: 600,
              boxShadow: '0 4px 14px rgba(124,111,255,0.35)',
            }}>{deal ? 'Save changes' : 'Add deal'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard({ deals }: { deals: Deal[] }) {
  const active = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const won = deals.filter(d => d.stage === 'Won');
  const closed = deals.filter(d => d.stage === 'Won' || d.stage === 'Lost');
  const pipeline = active.reduce((s, d) => s + d.value, 0);
  const revenue = won.reduce((s, d) => s + d.value, 0);
  const convRate = closed.length ? Math.round((won.length / closed.length) * 100) : 0;
  const avgDeal = deals.length ? Math.round(deals.reduce((s, d) => s + d.value, 0) / deals.length) : 0;

  const stageData = STAGES.map(s => ({
    stage: s,
    count: deals.filter(d => d.stage === s).length,
    value: deals.filter(d => d.stage === s).reduce((sum, d) => sum + d.value, 0),
  })).filter(s => s.count > 0);

  const maxVal = Math.max(...stageData.map(s => s.value), 1);
  const topDeals = [...deals].filter(d => d.stage !== 'Lost').sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <StatCard label="Pipeline Value" value={fmt(pipeline)} sub={`${active.length} active deals`} icon={DollarSign} color="#7C6FFF" />
        <StatCard label="Revenue Won" value={fmt(revenue)} sub={`${won.length} closed deals`} icon={TrendingUp} color="#34D399" />
        <StatCard label="Conversion Rate" value={`${convRate}%`} sub={`${closed.length} total closed`} icon={Target} color="#FBBF24" />
        <StatCard label="Avg. Deal Size" value={fmt(avgDeal)} sub={`across ${deals.length} deals`} icon={Award} color="#FB923C" />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Pipeline by Stage</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {stageData.map(({ stage, count, value }) => (
            <div key={stage}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StagePill stage={stage} />
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{count} deal{count !== 1 ? 's' : ''}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(value)}</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--surface3)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${(value / maxVal) * 100}%`,
                  background: STAGE_COLOR[stage],
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Top Deals</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {topDeals.map((deal, i) => (
            <div key={deal.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: i < topDeals.length - 1 ? '1px solid var(--border2)' : 'none',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', width: 16, textAlign: 'center' }}>{i + 1}</span>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `${STAGE_COLOR[deal.stage]}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: STAGE_COLOR[deal.stage],
              }}>
                {initials(deal.company)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {deal.company}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text3)' }}>{deal.contact}</div>
              </div>
              <StagePill stage={deal.stage} />
              <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(deal.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Deals View ───────────────────────────────────────────────────────────────

function DealsView({ deals, onEdit, onDelete }: {
  deals: Deal[];
  onEdit: (d: Deal) => void;
  onDelete: (id: string) => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (deals.length === 0) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '3rem', textAlign: 'center',
      }}>
        <AlertCircle size={28} style={{ color: 'var(--text3)', marginBottom: 12 }} />
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>No deals match your filters.</p>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>Try clearing the filters or add a new deal.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {deals.map(deal => (
        <div key={deal.id} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: 12,
          transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,111,255,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: `${STAGE_COLOR[deal.stage]}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: STAGE_COLOR[deal.stage],
          }}>
            {initials(deal.company)}
          </div>

          <div style={{ flex: '2 1 0', minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {deal.company}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>{deal.contact}</div>
          </div>

          <div className="deal-col-stage" style={{ flex: '1 1 0' }}>
            <StagePill stage={deal.stage} />
          </div>

          <div className="deal-col-priority" style={{ flex: '0 0 80px' }}>
            <PriorityDot priority={deal.priority} />
          </div>

          <div style={{ flex: '0 0 90px', textAlign: 'right', fontSize: 14, fontWeight: 700 }}>
            {fmt(deal.value)}
          </div>

          <div className="deal-col-date" style={{ flex: '0 0 90px', textAlign: 'right', fontSize: 11.5, color: 'var(--text3)' }}>
            {fmtDate(deal.createdAt)}
          </div>

          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={() => onEdit(deal)} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 8, width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)',
            }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = 'var(--accent)'; b.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = 'var(--border)'; b.style.color = 'var(--text2)'; }}
            >
              <Pencil size={13} />
            </button>

            {deleteConfirm === deal.id ? (
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => onDelete(deal.id)} style={{
                  background: '#F8717120', border: '1px solid #F8717140',
                  borderRadius: 8, padding: '0 10px', height: 30, fontSize: 12, color: '#F87171', fontWeight: 600,
                }}>Delete</button>
                <button onClick={() => setDeleteConfirm(null)} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '0 10px', height: 30, fontSize: 12, color: 'var(--text2)',
                }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setDeleteConfirm(deal.id)} style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 8, width: 30, height: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)',
              }}
                onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = '#F87171'; b.style.color = '#F87171'; }}
                onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = 'var(--border)'; b.style.color = 'var(--text2)'; }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

type View = 'dashboard' | 'deals';

export default function App() {
  const { deals, addDeal, updateDeal, deleteDeal } = useDeals();
  const [view, setView] = useState<View>('dashboard');
  const [modal, setModal] = useState<{ open: boolean; deal?: Deal }>({ open: false });
  const [filters, setFilters] = useState<Filters>({
    search: '', stage: 'All', priority: 'All',
    sortField: 'createdAt', sortDir: 'desc',
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setFilter = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters(prev => ({ ...prev, [k]: v }));

  const toggleSort = (field: Filters['sortField']) => {
    setFilters(prev => ({
      ...prev, sortField: field,
      sortDir: prev.sortField === field && prev.sortDir === 'desc' ? 'asc' : 'desc',
    }));
  };

  const filtered = useMemo(() => {
    let result = [...deals];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(d =>
        d.company.toLowerCase().includes(q) ||
        d.contact.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q)
      );
    }
    if (filters.stage !== 'All') result = result.filter(d => d.stage === filters.stage);
    if (filters.priority !== 'All') result = result.filter(d => d.priority === filters.priority);
    result.sort((a, b) => {
      const mul = filters.sortDir === 'asc' ? 1 : -1;
      if (filters.sortField === 'value') return (a.value - b.value) * mul;
      if (filters.sortField === 'company') return a.company.localeCompare(b.company) * mul;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * mul;
    });
    return result;
  }, [deals, filters]);

  const handleSave = (data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (modal.deal) updateDeal(modal.deal.id, data);
    else addDeal(data);
    setModal({ open: false });
  };

  const SortIcon = ({ field }: { field: Filters['sortField'] }) =>
    filters.sortField === field
      ? (filters.sortDir === 'desc' ? <ChevronDown size={13} /> : <ChevronUp size={13} />)
      : null;

  const navItems: { id: View; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'deals', label: 'Deals', icon: List },
  ];

  const inputBase: React.CSSProperties = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '7px 11px', fontSize: 13, color: 'var(--text)', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Sidebar — uses CSS class for responsive behaviour */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div style={{ marginBottom: '2rem', paddingLeft: 4 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.03em' }}>
            Pipeline<span style={{ color: 'var(--accent)' }}>OS</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>CRM Dashboard</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setView(id); setSidebarOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 10, border: 'none',
              background: view === id ? 'rgba(124,111,255,0.12)' : 'transparent',
              color: view === id ? 'var(--accent2)' : 'var(--text2)',
              fontSize: 13.5, fontWeight: view === id ? 600 : 400,
              transition: 'all 0.15s', textAlign: 'left', width: '100%',
              borderLeft: view === id ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
              <Icon size={16} />
              {label}
              {id === 'deals' && (
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 600,
                  background: 'var(--surface3)', borderRadius: 100, padding: '1px 7px', color: 'var(--text3)',
                }}>{deals.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { setModal({ open: true }); setSidebarOpen(false); }} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '8px 12px', borderRadius: 10,
            background: 'var(--accent)', border: 'none',
            color: '#fff', fontSize: 13, fontWeight: 600,
            boxShadow: '0 4px 14px rgba(124,111,255,0.3)',
          }}>
            <Plus size={15} /> New Deal
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 99, backdropFilter: 'blur(3px)',
        }} />
      )}

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          padding: '0 1.5rem', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Burger — hidden on desktop via CSS */}
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none', border: 'none', color: 'var(--text2)',
                padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1 }}>
                {view === 'dashboard' ? 'Dashboard' : 'Deals'}
              </h1>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                {view === 'dashboard' ? `${deals.length} total deals` : `${filtered.length} of ${deals.length} deals`}
              </p>
            </div>
          </div>

          <button onClick={() => setModal({ open: true })} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 14px', borderRadius: 10,
            background: 'var(--accent)', border: 'none',
            color: '#fff', fontSize: 13, fontWeight: 600,
            boxShadow: '0 4px 14px rgba(124,111,255,0.25)',
          }}>
            <Plus size={15} /> Add Deal
          </button>
        </header>

        {/* Filter bar */}
        {view === 'deals' && (
          <div style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--surface)', borderBottom: '1px solid var(--border)',
            display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', flexShrink: 0,
          }}>
            <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 0 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input style={{ ...inputBase, paddingLeft: 32, width: '100%' }}
                placeholder="Search deals…" value={filters.search}
                onChange={e => setFilter('search', e.target.value)} />
            </div>

            <div style={{ position: 'relative' }}>
              <select style={{ ...inputBase, paddingRight: 28, appearance: 'none', cursor: 'pointer' } as React.CSSProperties}
                value={filters.stage} onChange={e => setFilter('stage', e.target.value as typeof filters.stage)}>
                <option value="All">All stages</option>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <select style={{ ...inputBase, paddingRight: 28, appearance: 'none', cursor: 'pointer' } as React.CSSProperties}
                value={filters.priority} onChange={e => setFilter('priority', e.target.value as typeof filters.priority)}>
                <option value="All">All priorities</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
            </div>

            {(['value', 'createdAt', 'company'] as const).map(f => (
              <button key={f} onClick={() => toggleSort(f)} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '7px 11px', borderRadius: 10, fontSize: 12.5,
                background: filters.sortField === f ? 'rgba(124,111,255,0.12)' : 'var(--surface2)',
                border: `1px solid ${filters.sortField === f ? 'rgba(124,111,255,0.3)' : 'var(--border)'}`,
                color: filters.sortField === f ? 'var(--accent2)' : 'var(--text2)',
                fontWeight: 500,
              }}>
                {{ value: 'Value', createdAt: 'Date', company: 'A–Z' }[f]}
                <SortIcon field={f} />
              </button>
            ))}

            {(filters.search || filters.stage !== 'All' || filters.priority !== 'All') && (
              <button onClick={() => setFilters(prev => ({ ...prev, search: '', stage: 'All', priority: 'All' }))} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 11px', borderRadius: 10, fontSize: 12.5,
                background: 'none', border: '1px solid var(--border)', color: 'var(--text3)',
              }}>
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {view === 'dashboard'
            ? <Dashboard deals={deals} />
            : (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0 1.25rem 8px',
                  fontSize: 11, fontWeight: 600, color: 'var(--text3)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  <div style={{ width: 38, flexShrink: 0 }} />
                  <div style={{ flex: '2 1 0' }}>Company</div>
                  <div className="deal-col-stage" style={{ flex: '1 1 0' }}>Stage</div>
                  <div className="deal-col-priority" style={{ flex: '0 0 80px' }}>Priority</div>
                  <div style={{ flex: '0 0 90px', textAlign: 'right' }}>Value</div>
                  <div className="deal-col-date" style={{ flex: '0 0 90px', textAlign: 'right' }}>Added</div>
                  <div style={{ flex: '0 0 74px' }} />
                </div>
                <DealsView
                  deals={filtered}
                  onEdit={d => setModal({ open: true, deal: d })}
                  onDelete={deleteDeal}
                />
              </>
            )
          }
        </div>
      </main>

      {modal.open && (
        <DealModal
          deal={modal.deal}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
