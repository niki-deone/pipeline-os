import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Pencil, Trash2, X, TrendingUp, DollarSign, Target, Award, Inbox } from 'lucide-react';
import { useDeals } from './hooks/useDeals';
import { Deal, Filters, Stage, Priority } from './types';

const STAGES: Stage[] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const ini = (s: string) => s.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

// ── Stamp ─────────────────────────────────────────────────────────────────────
function Stamp({ stage }: { stage: Stage }) {
  const closed = stage === 'Won' || stage === 'Lost';
  return <span className={`stamp stage-${stage}${closed ? ' closed' : ''}`}>{stage}</span>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
const EMPTY = { company: '', contact: '', email: '', value: '', stage: 'Lead' as Stage, priority: 'Medium' as Priority, notes: '' };

function Modal({ deal, onSave, onClose }: { deal?: Deal; onSave: (d: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void; onClose: () => void }) {
  const [f, setF] = useState(deal ? { ...deal, value: String(deal.value) } : EMPTY);
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof EMPTY, v: string) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const save = () => {
    const e: Record<string, string> = {};
    if (!f.company.trim()) e.company = 'Required';
    if (!f.contact.trim()) e.contact = 'Required';
    if (!f.value || isNaN(+f.value) || +f.value <= 0) e.value = 'Enter a positive number';
    if (Object.keys(e).length) { setErr(e); return; }
    onSave({ company: f.company.trim(), contact: f.contact.trim(), email: f.email.trim(), value: +f.value, stage: f.stage, priority: f.priority, notes: f.notes.trim() });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">{deal ? 'Edit deal' : 'New deal'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div>
              <label className="form-label">Company *</label>
              <input className={`field form-field${err.company ? ' error' : ''}`} value={f.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
              {err.company && <p className="form-err">{err.company}</p>}
            </div>
            <div>
              <label className="form-label">Contact *</label>
              <input className={`field form-field${err.contact ? ' error' : ''}`} value={f.contact} onChange={e => set('contact', e.target.value)} placeholder="Jane Smith" />
              {err.contact && <p className="form-err">{err.contact}</p>}
            </div>
          </div>
          <div className="form-grid">
            <div>
              <label className="form-label">Email</label>
              <input className="field form-field" type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="jane@acme.com" />
            </div>
            <div>
              <label className="form-label">Value (€) *</label>
              <input className={`field form-field${err.value ? ' error' : ''}`} type="number" min="0" value={f.value} onChange={e => set('value', e.target.value)} placeholder="5000" />
              {err.value && <p className="form-err">{err.value}</p>}
            </div>
          </div>
          <div className="form-grid">
            <div>
              <label className="form-label">Stage</label>
              <div className="select-wrap">
                <select className="field form-field" value={f.stage} onChange={e => set('stage', e.target.value as Stage)}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <div className="select-wrap">
                <select className="field form-field" value={f.priority} onChange={e => set('priority', e.target.value as Priority)}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="field form-field" value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Context, next steps..." />
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>{deal ? 'Save changes' : 'Add deal'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ deals }: { deals: Deal[] }) {
  const active = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const won = deals.filter(d => d.stage === 'Won');
  const closed = deals.filter(d => d.stage === 'Won' || d.stage === 'Lost');
  const pipe = active.reduce((s, d) => s + d.value, 0);
  const rev = won.reduce((s, d) => s + d.value, 0);
  const conv = closed.length ? Math.round(won.length / closed.length * 100) : 0;
  const avg = deals.length ? Math.round(deals.reduce((s, d) => s + d.value, 0) / deals.length) : 0;

  const stageData = STAGES.map(s => ({
    stage: s,
    count: deals.filter(d => d.stage === s).length,
    value: deals.filter(d => d.stage === s).reduce((a, d) => a + d.value, 0),
  })).filter(x => x.count > 0);
  const maxV = Math.max(...stageData.map(x => x.value), 1);
  const top = [...deals].filter(d => d.stage !== 'Lost').sort((a, b) => b.value - a.value).slice(0, 5);

  const stats = [
    { label: 'Pipeline', value: fmt(pipe), sub: `${active.length} active deals`, icon: DollarSign },
    { label: 'Revenue won', value: fmt(rev), sub: `${won.length} deals closed`, icon: TrendingUp },
    { label: 'Conversion', value: `${conv}%`, sub: `${closed.length} total closed`, icon: Target },
    { label: 'Avg. deal', value: fmt(avg), sub: `${deals.length} total deals`, icon: Award },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="stats">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div className="stat" key={label}>
            <div className="stat-head">
              <span className="stat-label">{label}</span>
              <Icon size={15} strokeWidth={1.75} style={{ color: 'var(--ink3)' }} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Pipeline by stage</h3>
            <span className="panel-meta">{deals.length} deals</span>
          </div>
          {stageData.map(({ stage, count, value }) => (
            <div className={`bar-row stage-${stage}`} key={stage}>
              <div className="bar-top">
                <div className="bar-left">
                  <Stamp stage={stage} />
                  <span className="bar-count">×{count}</span>
                </div>
                <span className="bar-value">{fmt(value)}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(value / maxV) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Top deals</h3>
            <span className="panel-meta">by value</span>
          </div>
          {top.map((deal, i) => (
            <div className="top-row" key={deal.id}>
              <span className="top-idx">{i + 1}</span>
              <div className={`avatar stage-${deal.stage}`}>{ini(deal.company)}</div>
              <div className="top-main">
                <div className="top-company">{deal.company}</div>
                <div className="top-contact">{deal.contact}</div>
              </div>
              <div className="top-right">
                <span className="money" style={{ fontSize: 14 }}>{fmt(deal.value)}</span>
                <Stamp stage={deal.stage} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Deals list ────────────────────────────────────────────────────────────────
function Deals({ deals, onEdit, onDelete }: { deals: Deal[]; onEdit: (d: Deal) => void; onDelete: (id: string) => void }) {
  const [del, setDel] = useState<string | null>(null);
  if (!deals.length) return (
    <div className="empty">
      <Inbox size={26} strokeWidth={1.5} />
      <p>No deals found. Adjust filters or add a new deal.</p>
    </div>
  );
  return (
    <div className="list">
      {deals.map(deal => (
        <div className="row" key={deal.id}>
          <div className="col-avatar"><div className={`avatar stage-${deal.stage}`}>{ini(deal.company)}</div></div>
          <div className="col-company">
            <div className="row-company">{deal.company}</div>
            <div className="row-contact">{deal.contact}</div>
          </div>
          <div className="col-stage"><Stamp stage={deal.stage} /></div>
          <div className="col-priority"><span className={`pri-dot pri-${deal.priority}`} /><span>{deal.priority}</span></div>
          <div className="col-value money">{fmt(deal.value)}</div>
          <div className="col-date">{fmtDate(deal.createdAt)}</div>
          <div className="col-actions">
            {del === deal.id ? (
              <div className="confirm">
                <button className="btn btn-danger" onClick={() => onDelete(deal.id)}>Delete</button>
                <button className="btn btn-ghost" onClick={() => setDel(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <button className="icon-btn" onClick={() => onEdit(deal)} aria-label={`Edit ${deal.company}`}><Pencil size={14} /></button>
                <button className="icon-btn danger" onClick={() => setDel(deal.id)} aria-label={`Delete ${deal.company}`}><Trash2 size={14} /></button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
type View = 'dashboard' | 'deals';

export default function App() {
  const { deals, addDeal, updateDeal, deleteDeal } = useDeals();
  const [view, setView] = useState<View>('dashboard');
  const [modal, setModal] = useState<{ open: boolean; deal?: Deal }>({ open: false });
  const [filters, setFilters] = useState<Filters>({ search: '', stage: 'All', priority: 'All', sortField: 'createdAt', sortDir: 'desc' });

  const sf = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters(p => ({ ...p, [k]: v }));
  const ts = (field: Filters['sortField']) => setFilters(p => ({ ...p, sortField: field, sortDir: p.sortField === field && p.sortDir === 'desc' ? 'asc' : 'desc' }));

  const filtered = useMemo(() => {
    let r = [...deals];
    if (filters.search) { const q = filters.search.toLowerCase(); r = r.filter(d => d.company.toLowerCase().includes(q) || d.contact.toLowerCase().includes(q)); }
    if (filters.stage !== 'All') r = r.filter(d => d.stage === filters.stage);
    if (filters.priority !== 'All') r = r.filter(d => d.priority === filters.priority);
    r.sort((a, b) => {
      const m = filters.sortDir === 'asc' ? 1 : -1;
      if (filters.sortField === 'value') return (a.value - b.value) * m;
      if (filters.sortField === 'company') return a.company.localeCompare(b.company) * m;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * m;
    });
    return r;
  }, [deals, filters]);

  const save = (data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (modal.deal) updateDeal(modal.deal.id, data); else addDeal(data);
    setModal({ open: false });
  };

  const SI = ({ field }: { field: Filters['sortField'] }) => filters.sortField === field ? (filters.sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : null;

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div className="brand">
            <span className="brand-name">Pipeline<em>OS</em></span>
            <span className="brand-sub">deal ledger</span>
          </div>

          <nav className="nav">
            <button className={`nav-tab${view === 'dashboard' ? ' active' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
            <button className={`nav-tab${view === 'deals' ? ' active' : ''}`} onClick={() => setView('deals')}>
              Deals<span className="count">{deals.length}</span>
            </button>
          </nav>

          <button className="btn btn-primary" onClick={() => setModal({ open: true })}><Plus size={15} /> New deal</button>
        </div>

        {view === 'deals' && (
          <div className="filters">
            <div className="search-wrap">
              <Search size={14} />
              <input className="field search-input" placeholder="Search deals..." value={filters.search} onChange={e => sf('search', e.target.value)} />
            </div>

            {[
              { opts: ['All stages', ...STAGES], val: filters.stage, on: (v: string) => sf('stage', (v === 'All stages' ? 'All' : v) as typeof filters.stage) },
              { opts: ['All priorities', ...PRIORITIES], val: filters.priority, on: (v: string) => sf('priority', (v === 'All priorities' ? 'All' : v) as typeof filters.priority) },
            ].map((s, i) => (
              <div className="select-wrap" key={i}>
                <select className="field" value={s.val === 'All' ? s.opts[0] : s.val} onChange={e => s.on(e.target.value)}>
                  {s.opts.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={13} />
              </div>
            ))}

            <div className="sort-group">
              {(['value', 'createdAt', 'company'] as const).map(f => (
                <button key={f} className={`sort-btn${filters.sortField === f ? ' active' : ''}`} onClick={() => ts(f)}>
                  {{ value: 'Value', createdAt: 'Date', company: 'A-Z' }[f]}<SI field={f} />
                </button>
              ))}
            </div>

            {(filters.search || filters.stage !== 'All' || filters.priority !== 'All') && (
              <button className="btn btn-ghost" onClick={() => setFilters(p => ({ ...p, search: '', stage: 'All', priority: 'All' }))}>
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}
      </header>

      <main className="main">
        {view === 'dashboard' ? <Dashboard deals={deals} /> : (
          <>
            <div className="list-head">
              <div className="col-avatar" />
              <div className="col-company">Company</div>
              <div className="col-stage">Stage</div>
              <div className="col-priority">Priority</div>
              <div className="col-value">Value</div>
              <div className="col-date">Added</div>
              <div className="col-actions" style={{ minWidth: 70 }} />
            </div>
            <Deals deals={filtered} onEdit={d => setModal({ open: true, deal: d })} onDelete={deleteDeal} />
          </>
        )}
      </main>

      {modal.open && <Modal deal={modal.deal} onSave={save} onClose={() => setModal({ open: false })} />}
    </div>
  );
}
