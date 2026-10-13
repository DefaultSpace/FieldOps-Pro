import { copyText } from '../utils/contacts'
import { ContactActions } from '../components/ContactActions'
import { BackupPanel } from '../components/BackupPanel'
import { dayKey, todaysCompleted } from '../utils/workflow'
import { commissionStats } from '../utils/commission'
import { useNavigate } from 'react-router-dom'
import { COMMISSION_RATES, SALE_LABELS } from '../utils/commission'
import { useMemo, useState, useEffect } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { ServiceForm } from '../components/ServiceForm'
import { ServiceCard } from '../components/ServiceCard'
import { MaterialsList } from '../components/MaterialsList'
import { VisitHistory } from '../components/VisitHistory'
import { VisitActions } from '../components/VisitActions'
import { VisitNote } from '../components/VisitNote'
import { Availability } from '../components/Availability'
import { parseEcom, groupVisits, earliestSlot, slotStart, appointmentState } from '../utils/ecom'
import { getMapsSearchUrl, validCoordinates } from '../utils/maps'
import { ArrowUpRight, ClipboardPaste, Search, MapPin, Check, Clock, ChevronDown, X, Plus } from 'lucide-react'

export const Home = () => {
    const navigate = useNavigate();
    const region = useServiceStore(state => state.region);
    const { services, archive, importServices, completeVisit, startNewDay, undoVisit } = useServiceStore();
    const [mahalleFilter,setMahalleFilter] = useState('');
    const [largeView, setLargeView] = useState(() => {try{return localStorage.getItem('fieldops-large-view') !== 'false';}catch{return true;}});
    const [query, setQuery] = useState(''), [filter, setFilter] = useState('remaining');
    const [importOpen, setImportOpen] = useState(false), [manual, setManual] = useState(false), [text, setText] = useState(''), [notice, setNotice] = useState('');
    const [clock, setClock] = useState(new Date());
    useEffect(() => { const timer = setInterval(() => setClock(new Date()), 30000); return () => clearInterval(timer); }, []);
    const parsed = useMemo(() => parseEcom(text), [text]);
    const allVisits = useMemo(() => groupVisits(services), [services]);
    const remaining = useMemo(() => allVisits.filter(v => v.items.some(s => ['pending', 'postponed'].includes(s.status))), [allVisits]);
    const sortSlot = v => earliestSlot(v.items.filter(s => ['pending', 'postponed'].includes(s.status)));
    const visits = useMemo(() => allVisits.filter(v => {
        const pending = v.items.some(s => ['pending', 'postponed'].includes(s.status));
        if (mahalleFilter && v.mahalle !== mahalleFilter) return false;
        if (filter === 'remaining' && !pending || filter === 'done' && pending || filter === 'scheduled' && (!pending || sortSlot(v) === 'Saatsiz')) return false;
        return [v.name, v.address, v.mahalle, ...v.items.flatMap(s => [s.receiptNo || '',s.phone || '',...(s.phones || [])])].join(' ').toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'));
    }).sort((a, b) => {
        const aSlot = sortSlot(a), bSlot = sortSlot(b);
        return slotStart(aSlot) - slotStart(bSlot);
    }), [allVisits, query, filter, mahalleFilter]);
    const stats = commissionStats(todaysCompleted(services,archive,clock));
    const pendingPrime=commissionStats(services).pendingPrime;
    const late = remaining.filter(v => appointmentState(sortSlot(v), clock) === 'late').length;
    const scheduled = remaining.filter(v => sortSlot(v) !== 'Saatsiz').length;
    return <div className={`field-shell ${largeView ? 'large-field-view' : ''}`}>
        <div className="page-intro"><div><p className="eyebrow">GÜNLÜK OPERASYON / {region || 'TÜM BÖLGELER'}</p><h1>Önce saat. Sonra yol.</h1><p>eCom listeni aktar, müşteriye ulaş, işini takip et.</p></div><button className="primary-btn" onClick={() => setImportOpen(true)}><ClipboardPaste size={18}/> eCom listesini aktar</button></div>
        <div className="metrics">{[['Kalan ziyaret', remaining.length, `${services.length} servis fişi`], ['Saatli ziyaret', scheduled, 'Randevular öncelikli'], ['Tamamlanan fiş', stats.done, 'Bugün tamamlanan fişler'], ['Bugün kazanılan prim', `${stats.totalPrime} ₺`, 'Tamamlanan işlerin satış primi']].map(([label, value, sub]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>)}</div>
        <div className={`priority-strip ${late ? 'risk' : ''}`}><Clock size={20}/><div><strong>{late ? `${late} ziyaretin randevu aralığı geçti` : `${scheduled} saatli ziyaret sırada`}</strong><p>{late ? 'Bu kayıtları kontrol edip müşterilerle görüş.' : 'Yakındaki bir işe geçmeden önce sıradaki randevunu kontrol et.'}</p></div><span>{clock.toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' })}</span></div>
        <div className="field-options"><button className="quiet-btn" aria-pressed={largeView} onClick={() => { try{localStorage.setItem('fieldops-large-view',String(!largeView));}catch{}; setLargeView(!largeView); }}>{largeView ? 'Normal yazı' : 'Büyük yazı'}</button></div>
        <details className="commission-breakdown"><summary>Prim dökümü · Kazanılan {stats.totalPrime} TL · Bekleyen {pendingPrime} TL</summary><div>{Object.keys(COMMISSION_RATES).map(type => <p key={type}>{SALE_LABELS[type]}: {stats.quantities[type]} adet × {COMMISSION_RATES[type]} TL = <strong>{stats.quantities[type] * COMMISSION_RATES[type]} TL</strong></p>)}<small>Kazanılan prim bugün tamamlanan fişlerden hesaplanır. Bekleyen prim tüm açık işlerindir. Bekleyen iş tamamlanınca eklenir; iptal edilen fişler dahil edilmez.</small></div></details>
        <MaterialsList visits={allVisits}/>
        <div className="workspace"><section className="work-main"><div className="list-toolbar"><div className="tabs">{[['remaining','Kalan işler'],['scheduled','Saatliler'],['done','Kapanan fişler']].map(([value,label]) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
        <label className="search-box"><Search size={18}/><input placeholder="İsim, telefon, adres veya fiş ara" aria-label="Ziyaret ara" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <label className="field-filter">Mahalle<select value={mahalleFilter} onChange={e=>setMahalleFilter(e.target.value)}><option value="">Tüm mahalleler</option>{[...new Set(allVisits.map(v=>v.mahalle).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr')).map(m=><option key={m}>{m}</option>)}</select></label>
        {!services.length && <div className="empty-state"><ClipboardPaste size={36}/><h2>Sabah hazırlığını tek adıma indir.</h2><p>eCom listesini kopyala ve buraya yapıştır.<br/>Fişleri okuyalım, aynı adresleri bir araya getirelim.</p><button className="primary-btn" onClick={() => setImportOpen(true)}>İlk listeyi aktar <ArrowUpRight size={16}/></button></div>}
        {services.length > 0 && !visits.length && <div className="empty-state">Bu filtrede ziyaret yok.</div>}
        <div className="visit-list">{visits.map((v, index) => {
            const pending = v.items.filter(s => ['pending', 'postponed'].includes(s.status));
            const slot = earliestSlot(pending.length ? pending : v.items), state = appointmentState(slot, clock);
            const location = v.items.find(s => validCoordinates(s.coordinates)) || v.items.find(s => s.navigationAddress) || v.items[0];
            return <article className="visit-card" id={`visit-${v.key}`} key={v.key}>
                <div className="visit-top"><span className="visit-number">{String(index + 1).padStart(2,'0')}</span><div className="visit-title"><h2>{v.name}</h2><p>{v.mahalle} · {v.items.length} fiş</p></div><span className={`slot ${pending.length ? state : 'complete'}`}>{slot.replace('/', '–')}{pending.length && state === 'late' ? ' · Süresi geçti' : pending.length && state === 'active' ? ' · Şimdi' : ''}</span></div>
                <div className="job-tags" aria-label="Ziyaretteki iş türleri">{[...new Set(v.items.map(s => s.jobType?.trim() || 'İş türü belirtilmemiş'))].map(type => <span className={type === 'Montaj' ? 'installation' : type === 'Onarım' ? 'repair' : 'other'} key={type}>{type}</span>)}</div>
                <button className="visit-address address-copy" onClick={async()=>setNotice(await copyText([v.address,v.mahalle,location.district].filter(Boolean).join(', '))?'Adres kopyalandı.':'Adres kopyalanamadı.')}><MapPin size={16}/>{v.address}<small>Adresi kopyala</small></button>
                <div className="device-tags">{[...new Set(v.items.map(s => [s.device?.split('|').slice(0,2).join(' · ').trim() || s.notes || 'Cihaz belirtilmemiş', s.jobType?.trim() || 'İş türü belirtilmemiş'].join(' — ')))].map(d => <span key={d}>{d}</span>)}</div>
                {v.items.some(s => s.addressWarning) && <div className="location-note">Bina numarasını kontrol et</div>}
                <div className="visit-actions"><a className="primary-btn" target="_blank" rel="noreferrer" href={getMapsSearchUrl(location.navigationAddress || v.address, v.mahalle, location.coordinates,location.district)}>Haritada aç <ArrowUpRight size={16}/></a>{pending.length > 0 && <button className="finish-btn" onClick={() => { if (!confirm('Resimleri eCom’a yükledin mi?\nFieldOps kaydı tamamlanacak. eCom fişini ayrıca kapatmalısın.')) return; completeVisit(pending.map(s=>s.id)); navigate('/completed'); }}><Check size={17}/>Ziyareti tamamla</button>}</div>
                {!pending.length && v.items.some(s => s.status === 'done') && <button className="undo-btn" onClick={() => undoVisit(v.items.map(s => s.id))}>Tamamlamayı geri al</button>}
                <ContactActions service={{...v.items[0],phones:[...new Set(v.items.flatMap(s=>[s.phone,...(s.phones||[])]).filter(Boolean))]}}/>
                <VisitHistory visit={v}/>
                <VisitNote visit={v}/>
                <VisitActions visit={v}/>
                {pending.length > 0 && <Availability visit={v}/>}
                <details className="receipt-details"><summary>Fişler, satış ve durum <ChevronDown size={15}/></summary><div>{v.items.map(s => <div className="receipt" key={s.id}><p>Fiş {s.receiptNo || '—'} · {s.jobType || 'Servis'} · {s.timeSlot} · {s.warranty}</p><ServiceCard service={s}/></div>)}</div></details>
            </article>;
        })}</div></section>
        <aside className="side-panel"><p className="eyebrow">GÜN SONU</p><h2>Kayıtlarını koru.</h2><p>eCom, resmi fiş ve stok kaydın. Burada saha notlarını ve iş takibini tut.</p><button className="quiet-btn" onClick={()=>setManual(true)}><Plus size={16}/>Tek fiş ekle</button><BackupPanel/><button className="quiet-btn" onClick={()=>{if(confirm('Tamamlanan ve iptal edilen fişler arşive taşınacak. Bitmemiş işler listede kalacak. Devam edilsin mi?'))startNewDay();}}>Kapanan işleri arşivle</button></aside></div>
        {manual && <ServiceForm onClose={()=>setManual(false)}/>}
        {notice && <p className="notice floating-notice" role="status">{notice}<button className="quiet-btn" onClick={()=>setNotice('')}>Kapat</button></p>}
        {importOpen && <div className="modal-backdrop"><section className="field-modal" role="dialog" aria-modal="true" aria-labelledby="import-title"><button className="close-btn" aria-label="Kapat" onClick={() => setImportOpen(false)}><X/></button><p className="eyebrow">TOPLU AKTARIM</p><h2 id="import-title">Kopyala. Yapıştır. Hazır.</h2><p>eCom listesini olduğu gibi yapıştır. Arşivdeki fişler kalan işlere geri gelir. Aktif fişlerin notları, satışları ve durumları korunur.</p><textarea autoFocus aria-label="eCom servis listesi" value={text} onChange={e => setText(e.target.value)} placeholder="Fiş numarası, saat ve müşteri bilgilerini yapıştır…"/>{parsed.sourceDate && <p className={parsed.sourceDate!==dayKey(clock)?'date-warning':''}>eCom liste tarihi: {parsed.sourceDate}{parsed.sourceDate!==dayKey(clock)?' · Bugünün listesi değil; aktarmadan önce kontrol et.':''}</p>}<div className="import-summary"><strong>{parsed.records.length} fiş</strong><span>{groupVisits(parsed.records).length} ziyaret</span></div><div className="import-warnings">{text && parsed.warnings.map(w => <p key={w}>{w}</p>)}</div><button className="primary-btn" disabled={!parsed.records.length} onClick={() => { const result=importServices(parsed.records); setNotice(`${result.added} yeni fiş eklendi, ${result.restored} fiş arşivden döndü, ${result.updated} fiş güncellendi.`); setText(''); setImportOpen(false); }}>Listeyi aktar <ArrowUpRight size={17}/></button><small>Bu metin uygulama sunucusuna gönderilmez.</small></section></div>}
    </div>;
};

