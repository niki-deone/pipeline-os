import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Pencil, Trash2, X, TrendingUp, DollarSign, Target, Award, AlertCircle } from 'lucide-react';
import { useDeals } from './hooks/useDeals';
import { Deal, Filters, Stage, Priority } from './types';

const STAGES: Stage[] = ['Lead','Qualified','Proposal','Negotiation','Won','Lost'];
const PRIORITIES: Priority[] = ['Low','Medium','High'];
const STAGE_C: Record<Stage,string> = { Lead:'#60A5FA', Qualified:'#A78BFA', Proposal:'#F5A623', Negotiation:'#FB923C', Won:'#4ADE80', Lost:'#F87171' };
const PRI_C: Record<Priority,string> = { Low:'#4C4840', Medium:'#F5A623', High:'#F87171' };

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day:'2-digit', month:'short' });
const ini = (s: string) => s.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2);

// ── Pill ─────────────────────────────────────────────────────────────────────
function Pill({ stage }: { stage: Stage }) {
  const c = STAGE_C[stage];
  return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:6, background:`${c}10`, border:`0.5px solid ${c}30`, fontSize:12.5, fontWeight:500, color:c, whiteSpace:'nowrap' }}>
    <span style={{ width:5, height:5, borderRadius:'50%', background:c, flexShrink:0 }}/>{stage}
  </span>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
const EMPTY = { company:'', contact:'', email:'', value:'', stage:'Lead' as Stage, priority:'Medium' as Priority, notes:'' };

function Modal({ deal, onSave, onClose }: { deal?: Deal; onSave:(d:Omit<Deal,'id'|'createdAt'|'updatedAt'>)=>void; onClose:()=>void }) {
  const [f, setF] = useState(deal ? { ...deal, value:String(deal.value) } : EMPTY);
  const [err, setErr] = useState<Record<string,string>>({});
  const set = (k: keyof typeof EMPTY, v: string) => setF(p => ({ ...p, [k]:v }));

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key==='Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const save = () => {
    const e: Record<string,string> = {};
    if (!f.company.trim()) e.company = 'Required';
    if (!f.contact.trim()) e.contact = 'Required';
    if (!f.value || isNaN(+f.value) || +f.value <= 0) e.value = 'Invalid';
    if (Object.keys(e).length) { setErr(e); return; }
    onSave({ company:f.company.trim(), contact:f.contact.trim(), email:f.email.trim(), value:+f.value, stage:f.stage, priority:f.priority, notes:f.notes.trim() });
  };

  const inp = (hasErr?: boolean): React.CSSProperties => ({
    width:'100%', background:'var(--s2)', border:`0.5px solid ${hasErr?'#F87171':'var(--bd)'}`,
    borderRadius:10, padding:'11px 14px', fontSize:14, color:'var(--t1)', outline:'none'
  });
  const lbl: React.CSSProperties = { display:'block', fontSize:11.5, fontWeight:600, color:'var(--t3)', marginBottom:7, letterSpacing:'0.05em', textTransform:'uppercase' };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.88)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={onClose}>
      <div style={{ background:'var(--s1)', border:'0.5px solid var(--bd)', borderRadius:20, width:'100%', maxWidth:520, maxHeight:'92vh', overflow:'auto', boxShadow:'0 60px 140px rgba(0,0,0,0.9)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.5rem 1.75rem', borderBottom:'0.5px solid var(--bd)', position:'sticky', top:0, background:'var(--s1)', zIndex:1 }}>
          <h2 style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.03em' }}>{deal?'Edit deal':'New deal'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'0.5px solid var(--bd)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)' }}><X size={15}/></button>
        </div>
        <div style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:18 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div><label style={lbl}>Company *</label><input style={inp(!!err.company)} value={f.company} onChange={e=>set('company',e.target.value)} placeholder="Acme Corp"/>{err.company&&<p style={{fontSize:12,color:'#F87171',marginTop:4}}>{err.company}</p>}</div>
            <div><label style={lbl}>Contact *</label><input style={inp(!!err.contact)} value={f.contact} onChange={e=>set('contact',e.target.value)} placeholder="Jane Smith"/>{err.contact&&<p style={{fontSize:12,color:'#F87171',marginTop:4}}>{err.contact}</p>}</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div><label style={lbl}>Email</label><input style={inp()} value={f.email} type="email" onChange={e=>set('email',e.target.value)} placeholder="jane@acme.com"/></div>
            <div><label style={lbl}>Value (€) *</label><input style={inp(!!err.value)} value={f.value} type="number" min="0" onChange={e=>set('value',e.target.value)} placeholder="5000"/>{err.value&&<p style={{fontSize:12,color:'#F87171',marginTop:4}}>{err.value}</p>}</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div><label style={lbl}>Stage</label><div style={{position:'relative'}}><select style={{...inp(),paddingRight:32,appearance:'none',cursor:'pointer'}as React.CSSProperties} value={f.stage} onChange={e=>set('stage',e.target.value as Stage)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={14} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--t3)',pointerEvents:'none'}}/></div></div>
            <div><label style={lbl}>Priority</label><div style={{position:'relative'}}><select style={{...inp(),paddingRight:32,appearance:'none',cursor:'pointer'}as React.CSSProperties} value={f.priority} onChange={e=>set('priority',e.target.value as Priority)}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select><ChevronDown size={14} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--t3)',pointerEvents:'none'}}/></div></div>
          </div>
          <div><label style={lbl}>Notes</label><textarea style={{...inp(),resize:'vertical',minHeight:84}as React.CSSProperties} value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Context, next steps..."/></div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{ background:'none', border:'0.5px solid var(--bd)', borderRadius:10, padding:'10px 20px', fontSize:14, color:'var(--t2)' }}>Cancel</button>
            <button onClick={save} style={{ background:'var(--ac)', border:'none', borderRadius:10, padding:'10px 24px', fontSize:14, color:'#0F0E0C', fontWeight:700 }}>{deal?'Save changes':'Add deal'}</button>
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
  const pipe = active.reduce((s,d) => s+d.value, 0);
  const rev = won.reduce((s,d) => s+d.value, 0);
  const conv = closed.length ? Math.round(won.length/closed.length*100) : 0;
  const avg = deals.length ? Math.round(deals.reduce((s,d)=>s+d.value,0)/deals.length) : 0;

  const stageData = STAGES.map(s => ({
    stage:s,
    count:deals.filter(d=>d.stage===s).length,
    value:deals.filter(d=>d.stage===s).reduce((a,d)=>a+d.value,0)
  })).filter(x=>x.count>0);
  const maxV = Math.max(...stageData.map(x=>x.value),1);
  const top = [...deals].filter(d=>d.stage!=='Lost').sort((a,b)=>b.value-a.value).slice(0,5);

  const stats = [
    { label:'Pipeline', value:fmt(pipe), sub:`${active.length} active deals`, icon:DollarSign, color:'var(--ac)' },
    { label:'Revenue Won', value:fmt(rev), sub:`${won.length} deals closed`, icon:TrendingUp, color:'#4ADE80' },
    { label:'Conversion', value:`${conv}%`, sub:`${closed.length} total closed`, icon:Target, color:'#A78BFA' },
    { label:'Avg. Deal', value:fmt(avg), sub:`${deals.length} total deals`, icon:Award, color:'#FB923C' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {stats.map(({ label, value, sub, icon:Icon, color }) => (
          <div key={label} style={{ background:'var(--s1)', border:'0.5px solid var(--bd)', borderRadius:16, padding:'1.75rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--t3)', letterSpacing:'0.07em', textTransform:'uppercase' }}>{label}</span>
              <Icon size={16} strokeWidth={1.75} style={{ color, opacity:0.6 }}/>
            </div>
            <div style={{ fontSize:32, fontWeight:800, letterSpacing:'-0.05em', color:'var(--t1)', lineHeight:1, marginBottom:10 }}>{value}</div>
            <div style={{ fontSize:13, color:'var(--t3)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

        {/* Pipeline chart */}
        <div style={{ background:'var(--s1)', border:'0.5px solid var(--bd)', borderRadius:16, padding:'1.75rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h3 style={{ fontSize:15, fontWeight:700, letterSpacing:'-0.02em' }}>Pipeline by stage</h3>
            <span style={{ fontSize:12, color:'var(--t3)' }}>{deals.length} deals</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {stageData.map(({ stage, count, value }) => (
              <div key={stage}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <Pill stage={stage}/>
                    <span style={{ fontSize:12.5, color:'var(--t3)' }}>{count} deal{count!==1?'s':''}</span>
                  </div>
                  <span style={{ fontSize:14, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{fmt(value)}</span>
                </div>
                <div style={{ height:5, borderRadius:3, background:'var(--s3)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:3, width:`${(value/maxV)*100}%`, background:STAGE_C[stage], transition:'width 0.6s ease' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top deals */}
        <div style={{ background:'var(--s1)', border:'0.5px solid var(--bd)', borderRadius:16, padding:'1.75rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h3 style={{ fontSize:15, fontWeight:700, letterSpacing:'-0.02em' }}>Top deals</h3>
            <span style={{ fontSize:12, color:'var(--t3)' }}>by value</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {top.map((deal, i) => (
              <div key={deal.id} style={{ display:'flex', alignItems:'center', gap:13, padding:'12px 0', borderBottom:i<top.length-1?'0.5px solid var(--bd2)':'none' }}>
                <span style={{ fontSize:12, color:'var(--t3)', width:18, textAlign:'right', flexShrink:0, fontVariantNumeric:'tabular-nums' }}>{i+1}</span>
                <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:`${STAGE_C[deal.stage]}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11.5, fontWeight:800, color:STAGE_C[deal.stage] }}>{ini(deal.company)}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{deal.company}</div>
                  <div style={{ fontSize:12, color:'var(--t3)', marginTop:2 }}>{deal.contact}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                  <span style={{ fontSize:14, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{fmt(deal.value)}</span>
                  <Pill stage={deal.stage}/>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Deals ─────────────────────────────────────────────────────────────────────
function Deals({ deals, onEdit, onDelete }: { deals:Deal[]; onEdit:(d:Deal)=>void; onDelete:(id:string)=>void }) {
  const [del, setDel] = useState<string|null>(null);
  if (!deals.length) return (
    <div style={{ background:'var(--s1)', border:'0.5px solid var(--bd)', borderRadius:16, padding:'5rem', textAlign:'center' }}>
      <AlertCircle size={28} style={{ color:'var(--t3)', marginBottom:14 }}/>
      <p style={{ color:'var(--t2)', fontSize:15 }}>No deals found.</p>
    </div>
  );
  return (
    <div style={{ background:'var(--s1)', border:'0.5px solid var(--bd)', borderRadius:16, overflow:'hidden' }}>
      {deals.map((deal, idx) => (
        <div key={deal.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'1rem 1.5rem', borderBottom:idx<deals.length-1?'0.5px solid var(--bd2)':'none', transition:'background 0.1s' }}
          onMouseEnter={e=>(e.currentTarget.style.background='var(--s2)')}
          onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
        >
          <div style={{ width:40, height:40, borderRadius:11, flexShrink:0, background:`${STAGE_C[deal.stage]}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:STAGE_C[deal.stage] }}>{ini(deal.company)}</div>
          <div style={{ flex:'2 1 0', minWidth:0 }}>
            <div style={{ fontSize:14.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{deal.company}</div>
            <div style={{ fontSize:12.5, color:'var(--t3)', marginTop:2 }}>{deal.contact}</div>
          </div>
          <div style={{ flex:'1 1 0' }}><Pill stage={deal.stage}/></div>
          <div style={{ flex:'0 0 84px', display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--t2)' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:PRI_C[deal.priority] }}/>{deal.priority}
          </div>
          <div style={{ flex:'0 0 100px', textAlign:'right', fontSize:15, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{fmt(deal.value)}</div>
          <div style={{ flex:'0 0 72px', textAlign:'right', fontSize:12.5, color:'var(--t3)' }}>{fmtDate(deal.createdAt)}</div>
          <div style={{ display:'flex', gap:5, flexShrink:0 }}>
            <button onClick={()=>onEdit(deal)} style={{ background:'none', border:'0.5px solid transparent', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', transition:'all 0.12s' }}
              onMouseEnter={e=>{const b=e.currentTarget;b.style.borderColor='var(--bd)';b.style.color='var(--t1)';}}
              onMouseLeave={e=>{const b=e.currentTarget;b.style.borderColor='transparent';b.style.color='var(--t3)';}}
            ><Pencil size={14}/></button>
            {del===deal.id ? (
              <div style={{ display:'flex', gap:5 }}>
                <button onClick={()=>onDelete(deal.id)} style={{ background:'rgba(248,113,113,0.1)', border:'0.5px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'0 12px', height:32, fontSize:13, color:'#F87171', fontWeight:700 }}>Delete</button>
                <button onClick={()=>setDel(null)} style={{ background:'none', border:'0.5px solid var(--bd)', borderRadius:8, padding:'0 12px', height:32, fontSize:13, color:'var(--t3)' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={()=>setDel(deal.id)} style={{ background:'none', border:'0.5px solid transparent', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', transition:'all 0.12s' }}
                onMouseEnter={e=>{const b=e.currentTarget;b.style.borderColor='rgba(248,113,113,0.3)';b.style.color='#F87171';}}
                onMouseLeave={e=>{const b=e.currentTarget;b.style.borderColor='transparent';b.style.color='var(--t3)';}}
              ><Trash2 size={14}/></button>
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
  const [modal, setModal] = useState<{ open:boolean; deal?:Deal }>({ open:false });
  const [filters, setFilters] = useState<Filters>({ search:'', stage:'All', priority:'All', sortField:'createdAt', sortDir:'desc' });

  const sf = <K extends keyof Filters>(k:K, v:Filters[K]) => setFilters(p=>({...p,[k]:v}));
  const ts = (field:Filters['sortField']) => setFilters(p=>({...p, sortField:field, sortDir:p.sortField===field&&p.sortDir==='desc'?'asc':'desc'}));

  const filtered = useMemo(() => {
    let r = [...deals];
    if (filters.search) { const q=filters.search.toLowerCase(); r=r.filter(d=>d.company.toLowerCase().includes(q)||d.contact.toLowerCase().includes(q)); }
    if (filters.stage!=='All') r=r.filter(d=>d.stage===filters.stage);
    if (filters.priority!=='All') r=r.filter(d=>d.priority===filters.priority);
    r.sort((a,b)=>{const m=filters.sortDir==='asc'?1:-1;if(filters.sortField==='value')return(a.value-b.value)*m;if(filters.sortField==='company')return a.company.localeCompare(b.company)*m;return(new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime())*m;});
    return r;
  }, [deals, filters]);

  const save = (data:Omit<Deal,'id'|'createdAt'|'updatedAt'>) => {
    if (modal.deal) updateDeal(modal.deal.id,data); else addDeal(data);
    setModal({open:false});
  };

  const SI = ({field}:{field:Filters['sortField']}) => filters.sortField===field ? (filters.sortDir==='desc'?<ChevronDown size={12}/>:<ChevronUp size={12}/>) : null;

  const inp: React.CSSProperties = { background:'var(--s2)', border:'0.5px solid var(--bd)', borderRadius:10, padding:'8px 13px', fontSize:13.5, color:'var(--t1)', outline:'none' };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>

      {/* ── TOP NAV ── */}
      <header style={{ background:'var(--s1)', borderBottom:'0.5px solid var(--bd)', flexShrink:0 }}>
        {/* Brand + main nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2.5rem', height:60 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'var(--ac)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:14, fontWeight:900, color:'#0F0E0C', letterSpacing:'-0.05em' }}>P</span>
            </div>
            <div>
              <span style={{ fontSize:15, fontWeight:800, letterSpacing:'-0.04em', color:'var(--t1)' }}>Pipeline</span>
              <span style={{ fontSize:15, fontWeight:800, letterSpacing:'-0.04em', color:'var(--ac)' }}>OS</span>
            </div>
          </div>

          {/* Nav tabs */}
          <div style={{ display:'flex', alignItems:'center', gap:2, background:'var(--s2)', border:'0.5px solid var(--bd)', borderRadius:12, padding:4 }}>
            {([
              {id:'dashboard' as View, label:'Dashboard'},
              {id:'deals' as View, label:`Deals · ${deals.length}`},
            ]).map(({id,label}) => (
              <button key={id} onClick={()=>setView(id)} style={{
                padding:'7px 20px', borderRadius:9, border:'none', fontSize:14, fontWeight:600,
                background: view===id ? 'var(--s3)' : 'transparent',
                color: view===id ? 'var(--t1)' : 'var(--t3)',
                transition:'all 0.15s',
              }}>{label}</button>
            ))}
          </div>

          {/* CTA */}
          <button onClick={()=>setModal({open:true})} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:10, background:'var(--ac)', border:'none', color:'#0F0E0C', fontSize:14, fontWeight:700, letterSpacing:'-0.01em' }}>
            <Plus size={15}/> New Deal
          </button>
        </div>

        {/* Filter bar — only on deals */}
        {view==='deals' && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', padding:'0.75rem 2.5rem', borderTop:'0.5px solid var(--bd2)' }}>
            <div style={{ position:'relative', flex:'1 1 180px', minWidth:0 }}>
              <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }}/>
              <input style={{ ...inp, paddingLeft:36, width:'100%' }} placeholder="Search deals..." value={filters.search} onChange={e=>sf('search',e.target.value)}/>
            </div>

            {[
              { opts:['All stages',...STAGES], val:filters.stage, on:(v:string)=>sf('stage',(v==='All stages'?'All':v) as typeof filters.stage) },
              { opts:['All priorities',...PRIORITIES], val:filters.priority, on:(v:string)=>sf('priority',(v==='All priorities'?'All':v) as typeof filters.priority) },
            ].map((s,i) => (
              <div key={i} style={{ position:'relative' }}>
                <select style={{ ...inp, paddingRight:30, appearance:'none', cursor:'pointer' }as React.CSSProperties}
                  value={s.val==='All'?s.opts[0]:s.val} onChange={e=>s.on(e.target.value)}>
                  {s.opts.map(o=><option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={13} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'var(--t3)', pointerEvents:'none' }}/>
              </div>
            ))}

            <div style={{ display:'flex', gap:4 }}>
              {(['value','createdAt','company'] as const).map(f => (
                <button key={f} onClick={()=>ts(f)} style={{ display:'flex', alignItems:'center', gap:3, padding:'8px 13px', borderRadius:10, fontSize:13.5, background:filters.sortField===f?'var(--s3)':'none', border:`0.5px solid ${filters.sortField===f?'var(--bd)':'transparent'}`, color:filters.sortField===f?'var(--t1)':'var(--t3)', fontWeight:500 }}>
                  {{ value:'Value', createdAt:'Date', company:'A-Z' }[f]}<SI field={f}/>
                </button>
              ))}
            </div>

            {(filters.search||filters.stage!=='All'||filters.priority!=='All') && (
              <button onClick={()=>setFilters(p=>({...p,search:'',stage:'All',priority:'All'}))} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 13px', borderRadius:10, fontSize:13.5, background:'none', border:'0.5px solid var(--bd)', color:'var(--t3)' }}>
                <X size={12}/> Clear
              </button>
            )}
          </div>
        )}
      </header>

      {/* ── CONTENT ── */}
      <main style={{ flex:1, overflow:'auto', padding:'2rem 2.5rem' }}>
        {view==='dashboard' ? <Dashboard deals={deals}/> : (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:16, padding:'0 1.5rem 10px', fontSize:12, fontWeight:600, color:'var(--t3)', letterSpacing:'0.07em', textTransform:'uppercase' }}>
              <div style={{ width:40, flexShrink:0 }}/>
              <div style={{ flex:'2 1 0' }}>Company</div>
              <div style={{ flex:'1 1 0' }}>Stage</div>
              <div style={{ flex:'0 0 84px' }}>Priority</div>
              <div style={{ flex:'0 0 100px', textAlign:'right' }}>Value</div>
              <div style={{ flex:'0 0 72px', textAlign:'right' }}>Added</div>
              <div style={{ flex:'0 0 72px' }}/>
            </div>
            <Deals deals={filtered} onEdit={d=>setModal({open:true,deal:d})} onDelete={deleteDeal}/>
          </>
        )}
      </main>

      {modal.open && <Modal deal={modal.deal} onSave={save} onClose={()=>setModal({open:false})}/>}
    </div>
  );
}
