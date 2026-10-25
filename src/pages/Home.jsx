import { ImportPanel } from '../components/ImportPanel'
import { DailyPlan } from '../components/DailyPlan'
import { ActivityLog } from '../components/ActivityLog'
import { FieldControls } from '../components/FieldControls'
import { copyText } from '../utils/contacts'
import { ContactActions } from '../components/ContactActions'
import { BackupPanel } from '../components/BackupPanel'
import { todaysCompleted } from '../utils/workflow'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { ServiceForm } from '../components/ServiceForm'
import { ServiceCard } from '../components/ServiceCard'
import { MaterialsList } from '../components/MaterialsList'
import { VisitHistory } from '../components/VisitHistory'
import { VisitActions } from '../components/VisitActions'
import { VisitNote } from '../components/VisitNote'
import { Availability } from '../components/Availability'
import { groupVisits, appointmentState } from '../utils/ecom'
import { getMapsSearchUrl } from '../utils/maps'
import { formatMahalle } from '../utils/profile'
import { ArrowUpRight, ClipboardPaste, Search, MapPin, Check, Clock, ChevronDown, Plus, Trash2 } from 'lucide-react'

import { orderedVisits, visitSlot, morningNearby, isMorning } from '../utils/scheduling'

export const Home = () => {
    const navigate = useNavigate();
    const region = useServiceStore(state => state.region);
    const { services, archive, lastImport, updateService, completeVisit, startNewDay, undoVisit, clearDay } = useServiceStore();
    const [mahalleFilter,setMahalleFilter] = useState('');
    const [largeView, setLargeView] = useState(() => {try{return localStorage.getItem('fieldops-large-view') !== 'false';}catch{return true;}});
    const [query, setQuery] = useState(''), [filter, setFilter] = useState('remaining');
    const [importOpen, setImportOpen] = useState(false), [manual, setManual] = useState(false), [notice, setNotice] = useState('');
    const [clock, setClock] = useState(new Date());
    useEffect(() => { const timer = setInterval(() => setClock(new Date()), 30000); return () => clearInterval(timer); }, []);
    const allVisits = useMemo(() => groupVisits(services), [services]);
    const remaining = useMemo(() => allVisits.filter(v => v.items.some(s => ['pending', 'postponed','waiting_parts'].includes(s.status))), [allVisits]);
    const sortSlot = visitSlot;
    useEffect(()=>setMahalleFilter(''),[region]);
    const mahalleOptions = useMemo(() => {
        const map = new Map();
        allVisits.forEach(v => {
            const m = formatMahalle(v.mahalle);
            if (m) {
                const key = m.toLocaleLowerCase('tr-TR');
                if (!map.has(key)) map.set(key, m);
            }
        });
        return [...map.values()].sort((a,b) => a.localeCompare(b, 'tr'));
    }, [allVisits]);
    const visits = useMemo(() => orderedVisits(allVisits.filter(v => {
        const pending = v.items.some(s => ['pending', 'postponed','waiting_parts'].includes(s.status));
        if (mahalleFilter && formatMahalle(v.mahalle).toLocaleLowerCase('tr-TR') !== mahalleFilter.toLocaleLowerCase('tr-TR')) return false;
        if (filter === 'remaining' && !pending || filter === 'done' && !v.items.some(s=>s.status==='cancelled') || filter === 'scheduled' && (!pending || sortSlot(v) === 'Saatsiz')) return false;
        return [v.name, v.address, v.mahalle, ...v.items.flatMap(s => [s.receiptNo || '',s.phone || '',...(s.phones || [])])].join(' ').toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'));
    }),region), [allVisits, query, filter, mahalleFilter,region]);
    const doneCount = todaysCompleted(services,archive,clock).length;
    const actionable=remaining.map(v=>({...v,items:v.items.filter(s=>['pending','postponed'].includes(s.status))})).filter(v=>v.items.length);
    const nearby = morningNearby(actionable,region);
    const late = actionable.filter(v => appointmentState(sortSlot(v), clock) === 'late').length;
    const scheduled = actionable.filter(v => sortSlot(v) !== 'Saatsiz').length;
    return <div className={`field-shell ${largeView ? 'large-field-view' : ''}`}>
        <div className="page-intro"><div><p className="eyebrow">GÜNLÜK OPERASYON / {region || 'TÜM BÖLGELER'}</p><h1>Önce saat. Sonra yol.</h1><p>eCom listeni aktar, müşteriye ulaş, işini takip et.</p></div><button className="primary-btn" onClick={() => setImportOpen(true)}><ClipboardPaste size={18}/> eCom listesini aktar</button></div>
        <div className="metrics compact-metrics">{[['Kalan ziyaret', remaining.length, `${services.length} servis fişi`], ['Saatli ziyaret', scheduled, 'Randevular öncelikli'], ['Tamamlanan fiş', doneCount, 'Bugün tamamlanan fişler']].map(([label, value, sub]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>)}</div>
        <div className={`priority-strip ${late ? 'risk' : ''}`}><Clock size={20}/><div><strong>{late ? `${late} ziyaretin randevu aralığı geçti` : `${scheduled} saatli ziyaret sırada`}</strong><p>{late ? 'Bu kayıtları kontrol edip müşterilerle görüş.' : 'Yakındaki bir işe geçmeden önce sıradaki randevunu kontrol et.'}</p></div><span>{clock.toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' })}</span></div>


        {nearby.length>0 && <section className="nearby-alert" role="alert"><strong>Çıkmadan önce: Gümüşpala’da 10–12 randevun var.</strong><p>{nearby.map(v=>v.name).join(', ')} — saat 10:00–12:00. Uzak bölgeye geçmeden önce bu ziyaretleri planla.</p><button className="quiet-btn" onClick={()=>{setMahalleFilter(nearby[0].mahalle);setFilter('remaining');setQuery('');}}>Bu mahalledeki işleri göster</button></section>}
        <DailyPlan visits={allVisits} region={region} clock={clock} onShow={v=>{setQuery(v.items[0].receiptNo || v.name);setFilter('remaining');setMahalleFilter('');}}/><MaterialsList visits={allVisits}/>
        <div className="workspace"><section className="work-main"><div className="list-toolbar"><div className="tabs">{[['remaining','Kalan işler'],['scheduled','Saatliler'],['done','İptal edilenler']].map(([value,label]) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
        <label className="search-box"><Search size={18}/><input placeholder="İsim, telefon, adres veya fiş ara" aria-label="Ziyaret ara" value={query} onChange={e => setQuery(e.target.value)}/></label>
        {region==='Avcılar' && <label className="field-filter">Mahalle<select value={mahalleFilter} onChange={e=>setMahalleFilter(e.target.value)}><option value="">Tüm mahalleler</option>{mahalleOptions.map(m=><option key={m} value={m}>{m}</option>)}</select></label>}
        {!services.length && <div className="empty-state"><ClipboardPaste size={36}/><h2>Sabah hazırlığını tek adıma indir.</h2><p>eCom listesini kopyala ve buraya yapıştır.<br/>Fişleri okuyalım, aynı adresleri bir araya getirelim.</p><button className="primary-btn" onClick={() => setImportOpen(true)}>İlk listeyi aktar <ArrowUpRight size={16}/></button></div>}
        {services.length > 0 && !visits.length && <div className="empty-state">Bu filtrede ziyaret yok.</div>}
        <div className="visit-list">{visits.map((v, index) => {
            const pending = v.items.filter(s => ['pending', 'postponed','waiting_parts'].includes(s.status));
            const slot = visitSlot(v), state = appointmentState(slot, clock);
            const location = v.items[0];
            const collapsed=v.items.every(s=>s.collapsed);
            const contacted=v.items.every(s=>s.contactedAt);
            const waiting=v.items.some(s=>s.status==='waiting_parts');
            const previous=visits[index-1];
            const newSlot=!previous || visitSlot(previous)!==slot;
            const newNeighborhood=region==='Avcılar' && (newSlot || formatMahalle(previous.mahalle)!==formatMahalle(v.mahalle));
            return <section key={v.key}>{newSlot && <h2 className="schedule-heading">{slot.replace('/','–')} {isMorning(slot)?'· Öncelikli':''}</h2>}{newNeighborhood && <h3 className="neighborhood-heading">{formatMahalle(v.mahalle) || 'Mahalle belirtilmemiş'}</h3>}<article className="visit-card" id={`visit-${v.key}`}>
                <div className="visit-top"><span className="visit-number">{String(index + 1).padStart(2,'0')}</span><div className="visit-title"><h2>{v.name}</h2><p>{formatMahalle(v.mahalle)} · {v.items.length} fiş</p></div><span className={`slot ${pending.length ? state : 'complete'}`}>{slot.replace('/', '–')}{pending.length && state === 'late' ? ' · Süresi geçti' : pending.length && state === 'active' ? ' · Şimdi' : ''}</span></div>
                <div className="card-summary-actions"><button className="undo-btn" aria-expanded={!collapsed} onClick={()=>v.items.forEach(s=>updateService(s.id,{collapsed:!collapsed}))}>{collapsed?'Kartı aç':'Kartı küçült'}</button>{contacted&&<span>Müşteriye ulaşıldı ✓</span>}{waiting&&<span>Parça bekleniyor</span>}{v.items.map(s=><button className="undo-btn" key={s.id} disabled={!s.receiptNo} onClick={async()=>setNotice(await copyText(s.receiptNo)?'Fiş numarası kopyalandı.':'Fiş kopyalanamadı.')}>Fiş {s.receiptNo || '—'} · Kopyala</button>)}</div>
                {!collapsed&&<>
                <div className="job-tags" aria-label="Ziyaretteki iş türleri">{[...new Set(v.items.map(s => s.jobType?.trim() || 'İş türü belirtilmemiş'))].map(type => <span className={type === 'Montaj' ? 'installation' : type === 'Onarım' ? 'repair' : 'other'} key={type}>{type}</span>)}</div>
                <button className="visit-address address-copy" onClick={async()=>setNotice(await copyText([v.address,v.mahalle,location.district].filter(Boolean).join(', '))?'Adres kopyalandı.':'Adres kopyalanamadı.')}><MapPin size={16}/>{v.address}<small>Adresi kopyala</small></button>
                <div className="device-tags">{[...new Set(v.items.map(s => [s.device?.split('|').slice(0,2).join(' · ').trim() || s.notes || 'Cihaz belirtilmemiş', s.jobType?.trim() || 'İş türü belirtilmemiş'].join(' — ')))].map(d => <span key={d}>{d}</span>)}</div>
                {v.items.some(s => s.addressWarning) && <div className="location-note">Bina numarasını kontrol et</div>}
                <div className="visit-actions"><a className="primary-btn" target="_blank" rel="noreferrer" href={getMapsSearchUrl(v.address, v.mahalle, null,v.district)}>Google Maps’te adresi ara <ArrowUpRight size={16}/></a>{pending.length > 0 && <button className="finish-btn" onClick={() => { if (!confirm('Resimleri eCom’a yükledin mi?\nFieldOps kaydı tamamlanacak. eCom fişini ayrıca kapatmalısın.')) return; completeVisit(pending.map(s=>s.id)); navigate('/completed'); }}><Check size={17}/>Ziyareti tamamla</button>}</div>
                {!pending.length && v.items.some(s => s.status === 'done') && <button className="undo-btn" onClick={() => undoVisit(v.items.map(s => s.id))}>Tamamlamayı geri al</button>}
                <ContactActions service={{...v.items[0],phones:[...new Set(v.items.flatMap(s=>[s.phone,...(s.phones||[])]).filter(Boolean))]}}/>
                <details className="secondary-actions"><summary>Notlar, saha durumu ve diğer işlemler</summary>
                <FieldControls visit={v}/>
                <VisitHistory visit={v}/>
                <VisitNote visit={v}/>
                <VisitActions visit={v}/>
                {pending.length > 0 && <Availability visit={v}/>}
                </details>
                <details className="receipt-details"><summary>Fişler ve iş durumu <ChevronDown size={15}/></summary><div>{v.items.map(s => <div className="receipt" key={s.id}><p>Fiş {s.receiptNo || '—'} · {s.jobType || 'Servis'} · {s.timeSlot} · {s.warranty}</p><ServiceCard service={s}/></div>)}</div></details>
                </>}
            </article></section>;
        })}</div></section>
        <aside className="side-panel"><p className="eyebrow">GÜN SONU</p><h2>Kayıtlarını koru.</h2><p>eCom, resmi fiş ve stok kaydın. Burada saha notlarını ve iş takibini tut.</p><button className="quiet-btn" onClick={()=>setManual(true)}><Plus size={16}/>Tek fiş ekle</button><BackupPanel/><details className="settings-panel"><summary>Görünüm ayarları</summary>        <div className="field-options"><button className="quiet-btn" aria-pressed={largeView} onClick={() => { try{localStorage.setItem('fieldops-large-view',String(!largeView));}catch{/* Keep the setting in memory. */} setLargeView(!largeView); }}>{largeView ? 'Normal yazı' : 'Büyük yazı'}</button></div></details><ActivityLog/>{lastImport&&<details><summary>Son aktarım raporu</summary><p>{new Date(lastImport.at).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul'})}</p><p>{lastImport.before} aktif → {lastImport.after} aktif · {lastImport.processed} fiş işlendi</p><p>{lastImport.added} yeni · {lastImport.updated} güncel · {lastImport.restored} geri açılan</p><p>{lastImport.missing.length?'Eksik fişler: '+lastImport.missing.join(', '):'Okunan fişlerin tümü aktif listede doğrulandı.'}</p></details>}<button className="quiet-btn" onClick={()=>{if(confirm('Tamamlanan ve iptal edilen fişler arşive taşınacak. Bitmemiş işler listede kalacak. Devam edilsin mi?'))startNewDay();}}>Kapanan işleri arşivle</button><button type="button" className="delete-day-btn" onClick={()=>{if(!services.length){setNotice('Silinecek aktif iş bulunmuyor.');return;}if(confirm('Tüm gün silinecek, arşive kaydedilmeyecek. Silinsin mi?')){clearDay();setNotice('Tüm gün silindi. Arşive kaydedilmedi.');}}}><Trash2 size={16}/>Tüm günü sil</button></aside></div>
        {manual && <ServiceForm onClose={()=>setManual(false)}/>}
        {notice && <p className="notice floating-notice" role="status">{notice}<button className="quiet-btn" onClick={()=>setNotice('')}>Kapat</button></p>}
        {importOpen && <ImportPanel onClose={()=>setImportOpen(false)} onImported={result=>setNotice(result.missing.length?'Eksik fişler: '+result.missing.join(', '):result.added+' yeni fiş, '+result.restored+' arşivden dönen, '+result.updated+' güncellenen. '+result.processed+' fiş doğrulandı.')}/>}
    </div>;
};

