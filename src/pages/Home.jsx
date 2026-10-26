import { CompactVisit } from '../components/CompactVisit'
import { ImportPanel } from '../components/ImportPanel'
import { DailyPlan } from '../components/DailyPlan'
import { ActivityLog } from '../components/ActivityLog'
import { BackupPanel } from '../components/BackupPanel'
import { todaysCompleted } from '../utils/workflow'
import { useMemo, useState, useEffect } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { ServiceForm } from '../components/ServiceForm'
import { MaterialsList } from '../components/MaterialsList'
import { groupVisits, appointmentState } from '../utils/ecom'
import { formatMahalle } from '../utils/profile'
import { ArrowUpRight, ClipboardPaste, Search, Clock, Plus, Trash2 } from 'lucide-react'

import { orderedVisits, visitSlot, morningNearby, isMorning } from '../utils/scheduling'

export const Home = () => {
    const region = useServiceStore(state => state.region);
    const { services, archive, lastImport, startNewDay, clearDay } = useServiceStore();
    const [mahalleFilter,setMahalleFilter] = useState('');
    const [slotFilter,setSlotFilter]=useState(''),[expandedVisit,setExpandedVisit]=useState(null);
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
        if (slotFilter && sortSlot(v)!==slotFilter)return false;
        if (mahalleFilter && formatMahalle(v.mahalle).toLocaleLowerCase('tr-TR') !== mahalleFilter.toLocaleLowerCase('tr-TR')) return false;
        if (filter === 'remaining' && !pending || filter === 'done' && !v.items.some(s=>s.status==='cancelled') || filter === 'scheduled' && (!pending || sortSlot(v) === 'Saatsiz')) return false;
        return [v.name, v.address, v.mahalle, ...v.items.flatMap(s => [s.receiptNo || '',s.phone || '',...(s.phones || [])])].join(' ').toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'));
    }),region), [allVisits, query, filter, mahalleFilter,region,slotFilter]);
    const doneCount = todaysCompleted(services,archive,clock).length;
    const actionable=remaining.map(v=>({...v,items:v.items.filter(s=>['pending','postponed'].includes(s.status))})).filter(v=>v.items.length);
    const nearby = morningNearby(actionable,region);
    const late = actionable.filter(v => appointmentState(sortSlot(v), clock) === 'late').length;
    const scheduled = actionable.filter(v => sortSlot(v) !== 'Saatsiz').length;
    return <div className={`field-shell compact-home ${largeView ? 'large-field-view' : ''}`}>
        <div className="page-intro"><div><p className="eyebrow">GÜNLÜK OPERASYON / {region || 'TÜM BÖLGELER'}</p><h1>Önce saat. Sonra yol.</h1><p>eCom listeni aktar, müşteriye ulaş, işini takip et.</p></div><button className="primary-btn" onClick={() => setImportOpen(true)}><ClipboardPaste size={18}/> eCom listesini aktar</button></div>
        <div className="metrics compact-metrics">{[['Kalan ziyaret', remaining.length, `${services.length} servis fişi`], ['Saatli ziyaret', scheduled, 'Randevular öncelikli'], ['Tamamlanan fiş', doneCount, 'Bugün tamamlanan fişler']].map(([label, value, sub]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>)}</div>
        <div className={`priority-strip ${late ? 'risk' : ''}`}><Clock size={20}/><div><strong>{late ? `${late} ziyaretin randevu aralığı geçti` : `${scheduled} saatli ziyaret sırada`}</strong><p>{late ? 'Bu kayıtları kontrol edip müşterilerle görüş.' : 'Yakındaki bir işe geçmeden önce sıradaki randevunu kontrol et.'}</p></div><span>{clock.toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' })}</span></div>


        {nearby.length>0 && <section className="nearby-alert" role="alert"><strong>Çıkmadan önce: Gümüşpala’da 10–12 randevun var.</strong><p>{nearby.map(v=>v.name).join(', ')} — saat 10:00–12:00. Uzak bölgeye geçmeden önce bu ziyaretleri planla.</p><button className="quiet-btn" onClick={()=>{setMahalleFilter(nearby[0].mahalle);setFilter('remaining');setQuery('');}}>Bu mahalledeki işleri göster</button></section>}
        <div className="workspace"><section className="work-main"><div className="list-toolbar"><div className="tabs">{[['remaining','Kalan işler'],['scheduled','Saatliler'],['done','İptal edilenler']].map(([value,label]) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
        <div className="compact-search-controls"><label className="search-box"><Search size={18}/><input placeholder="İsim, telefon, adres veya fiş ara" aria-label="Ziyaret ara" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <div className="quick-filters"><label className="field-filter">Mahalle<select value={mahalleFilter} onChange={e=>setMahalleFilter(e.target.value)}><option value="">Tüm mahalleler</option>{mahalleOptions.map(m=><option key={m} value={m}>{m}</option>)}</select></label><label className="field-filter">Saat<select aria-label="Saat dilimi" value={slotFilter} onChange={e=>setSlotFilter(e.target.value)}><option value="">Tüm saatler</option>{[...new Set(orderedVisits(allVisits,region).map(visitSlot))].map(slot=><option key={slot} value={slot}>{slot.replace('/','–')}</option>)}</select></label></div></div>
        <div className="list-result-count"><span>{visits.length} ziyaret gösteriliyor</span>{expandedVisit&&<button className="undo-btn" onClick={()=>setExpandedVisit(null)}>Ayrıntıları kapat</button>}{(query||mahalleFilter||slotFilter)&&<button className="undo-btn" onClick={()=>{setQuery('');setMahalleFilter('');setSlotFilter('');}}>Filtreleri temizle</button>}</div>
        {!services.length && <div className="empty-state"><ClipboardPaste size={36}/><h2>Sabah hazırlığını tek adıma indir.</h2><p>eCom listesini kopyala ve buraya yapıştır.<br/>Fişleri okuyalım, aynı adresleri bir araya getirelim.</p><button className="primary-btn" onClick={() => setImportOpen(true)}>İlk listeyi aktar <ArrowUpRight size={16}/></button></div>}
        {services.length > 0 && !visits.length && <div className="empty-state">Bu filtrede ziyaret yok.</div>}
        <div className="visit-list">{visits.map((v, index) => {
            const slot=visitSlot(v),previous=visits[index-1];
            const newSlot=!previous || visitSlot(previous)!==slot;
            return <section key={v.key}>{newSlot&&<h2 className="schedule-heading">{slot.replace('/','–')} {isMorning(slot)?'· Öncelikli':''}</h2>}<CompactVisit visit={v} clock={clock} expanded={expandedVisit===v.key} onToggle={()=>setExpandedVisit(expandedVisit===v.key?null:v.key)} onNotice={setNotice}/></section>;
        })}</div></section>
        <aside className="side-panel"><p className="eyebrow">GÜN SONU</p><h2>Kayıtlarını koru.</h2><p>eCom, resmi fiş ve stok kaydın. Burada saha notlarını ve iş takibini tut.</p><button className="quiet-btn" onClick={()=>setManual(true)}><Plus size={16}/>Tek fiş ekle</button><details className="optional-tools"><summary>Plan ve malzeme araçları</summary>        <DailyPlan visits={allVisits} region={region} clock={clock} onShow={v=>{setQuery(v.items[0].receiptNo || v.name);setFilter('remaining');setMahalleFilter('');setSlotFilter('');}}/><MaterialsList visits={allVisits}/>
</details><BackupPanel/><details className="settings-panel"><summary>Görünüm ayarları</summary>        <div className="field-options"><button className="quiet-btn" aria-pressed={largeView} onClick={() => { try{localStorage.setItem('fieldops-large-view',String(!largeView));}catch{/* Keep the setting in memory. */} setLargeView(!largeView); }}>{largeView ? 'Normal yazı' : 'Büyük yazı'}</button></div></details><ActivityLog/>{lastImport&&<details><summary>Son aktarım raporu</summary><p>{new Date(lastImport.at).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul'})}</p><p>{lastImport.before} aktif → {lastImport.after} aktif · {lastImport.processed} fiş işlendi</p><p>{lastImport.added} yeni · {lastImport.updated} güncel · {lastImport.restored} geri açılan</p><p>{lastImport.missing.length?'Eksik fişler: '+lastImport.missing.join(', '):'Okunan fişlerin tümü aktif listede doğrulandı.'}</p></details>}<button className="quiet-btn" onClick={()=>{if(confirm('Tamamlanan ve iptal edilen fişler arşive taşınacak. Bitmemiş işler listede kalacak. Devam edilsin mi?'))startNewDay();}}>Kapanan işleri arşivle</button><button type="button" className="delete-day-btn" onClick={()=>{if(!services.length){setNotice('Silinecek aktif iş bulunmuyor.');return;}if(confirm('Tüm gün silinecek, arşive kaydedilmeyecek. Silinsin mi?')){clearDay();setNotice('Tüm gün silindi. Arşive kaydedilmedi.');}}}><Trash2 size={16}/>Tüm günü sil</button></aside></div>
        {manual && <ServiceForm onClose={()=>setManual(false)}/>}
        {notice && <p className="notice floating-notice" role="status">{notice}<button className="quiet-btn" onClick={()=>setNotice('')}>Kapat</button></p>}
        {importOpen && <ImportPanel onClose={()=>setImportOpen(false)} onImported={result=>setNotice(result.missing.length?'Eksik fişler: '+result.missing.join(', '):result.added+' yeni fiş, '+result.restored+' arşivden dönen, '+result.updated+' güncellenen. '+result.processed+' fiş doğrulandı.')}/>}
    </div>;
};

