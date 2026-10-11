import { useMemo, useState, useEffect, useCallback } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { ServiceForm } from '../components/ServiceForm'
import { ServiceCard } from '../components/ServiceCard'
import { MaterialsList } from '../components/MaterialsList'
import { VisitHistory } from '../components/VisitHistory'
import { VisitNote } from '../components/VisitNote'
import { Availability } from '../components/Availability'
import { VisitMap } from '../components/VisitMap'
import { parseEcom, groupVisits, earliestSlot, appointmentState } from '../utils/ecom'
import { getMapsSearchUrl, navigationAddress, validCoordinates } from '../utils/maps'
import { ArrowUpRight, ClipboardPaste, Search, MapPin, Check, Clock, ChevronDown, X, Plus } from 'lucide-react'

export const Home = () => {
    const { services, importServices, updateService, toggleStatus, calculateStats, startNewDay, exportData, undoVisit } = useServiceStore();
    const [lastCompleted, setLastCompleted] = useState(null);
    const [largeView, setLargeView] = useState(() => localStorage.getItem('fieldops-large-view') !== 'false');
    const [query, setQuery] = useState(''), [filter, setFilter] = useState('remaining'), [mode, setMode] = useState('list');
    const [importOpen, setImportOpen] = useState(false), [manual, setManual] = useState(false), [text, setText] = useState(''), [notice, setNotice] = useState('');
    const [clock, setClock] = useState(new Date()), [editing, setEditing] = useState(null), [navText, setNavText] = useState(''), [lat, setLat] = useState(''), [lng, setLng] = useState(''), [error, setError] = useState('');
    useEffect(() => { const timer = setInterval(() => setClock(new Date()), 30000); return () => clearInterval(timer); }, []);
    const parsed = useMemo(() => parseEcom(text), [text]);
    const allVisits = useMemo(() => groupVisits(services), [services]);
    const remaining = useMemo(() => allVisits.filter(v => v.items.some(s => ['pending', 'postponed'].includes(s.status))), [allVisits]);
    const sortSlot = v => earliestSlot(v.items.filter(s => ['pending', 'postponed'].includes(s.status)));
    const visits = useMemo(() => allVisits.filter(v => {
        const pending = v.items.some(s => ['pending', 'postponed'].includes(s.status));
        if (filter === 'remaining' && !pending || filter === 'done' && pending || filter === 'scheduled' && (!pending || sortSlot(v) === 'Saatsiz')) return false;
        return [v.name, v.address, v.mahalle, ...v.items.map(s => s.receiptNo || '')].join(' ').toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'));
    }).sort((a, b) => {
        const aSlot = sortSlot(a), bSlot = sortSlot(b);
        return (aSlot === 'Saatsiz' ? 99 : Number(aSlot.split('/')[0])) - (bSlot === 'Saatsiz' ? 99 : Number(bSlot.split('/')[0]));
    }), [allVisits, query, filter]);
    const stats = calculateStats(services);
    const late = remaining.filter(v => appointmentState(sortSlot(v), clock) === 'late').length;
    const scheduled = remaining.filter(v => sortSlot(v) !== 'Saatsiz').length;
    const verified = remaining.filter(v => v.items.some(s => validCoordinates(s.coordinates))).length;
    const selectVisit = useCallback(key => document.getElementById(`visit-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), []);
    const openEditor = v => {
        const s = v.items.find(s => s.navigationAddress || s.coordinates) || v.items[0];
        setEditing(v); setNavText(s.navigationAddress || v.address); setLat(s.coordinates?.lat?.toString() || ''); setLng(s.coordinates?.lng?.toString() || ''); setError('');
    };
    const saveLocation = e => {
        e.preventDefault();
        const coordinates = lat !== '' && lng !== '' ? { lat: Number(lat), lng: Number(lng) } : null;
        if (!navText.trim() || (lat !== '' || lng !== '') && !validCoordinates(coordinates)) { setError('Adresi ve geçerli enlem / boylamı kontrol edin.'); return; }
        editing.items.forEach(s => updateService(s.id, { navigationAddress: navText.trim(), coordinates })); setEditing(null);
    };
    return <div className={`field-shell ${largeView ? 'large-field-view' : ''}`}>
        <div className="page-intro"><div><p className="eyebrow">GÜNLÜK OPERASYON / AVCILAR</p><h1>Önce saat. Sonra yol.</h1><p>Günün bütün işleri, tek bir yerde.</p></div><button className="primary-btn" onClick={() => setImportOpen(true)}><ClipboardPaste size={18}/> eCom listesini aktar</button></div>
        <div className="metrics">{[['Kalan ziyaret', remaining.length, `${services.length} servis fişi`], ['Saatli ziyaret', scheduled, 'Randevular öncelikli'], ['Tamamlanan fiş', stats.done, `${allVisits.length - remaining.length} kapanan ziyaret`], ['Günlük prim', `${stats.totalPrime} ₺`, 'Satış kayıtların korunur']].map(([label, value, sub]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>)}</div>
        <div className={`priority-strip ${late ? 'risk' : ''}`}><Clock size={20}/><div><strong>{late ? `${late} ziyaretin randevu aralığı geçti` : `${scheduled} saatli ziyaret sırada`}</strong><p>{late ? 'Bu kayıtları kontrol edip müşterilerle görüş.' : 'Yakındaki bir işe geçmeden önce sıradaki randevunu kontrol et.'}</p></div><span>{clock.toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' })}</span></div>
        <div className="field-options"><button className="quiet-btn" aria-pressed={largeView} onClick={() => { localStorage.setItem('fieldops-large-view',String(!largeView)); setLargeView(!largeView); }}>{largeView ? 'Normal yazı' : 'Büyük yazı'}</button>{lastCompleted && <button className="undo-btn" onClick={() => { undoVisit(lastCompleted); setLastCompleted(null); }}>Son tamamlamayı geri al</button>}</div>
        <MaterialsList visits={allVisits}/>
        <div className="workspace"><section className="work-main"><div className="list-toolbar"><div className="tabs">{[['remaining','Kalan işler'],['scheduled','Saatliler'],['done','Kapananlar']].map(([value,label]) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><button className="quiet-btn" onClick={() => setMode(mode === 'list' ? 'map' : 'list')}><MapPin size={16}/>{mode === 'list' ? 'Harita' : 'Liste'}</button></div>
        <label className="search-box"><Search size={18}/><input placeholder="İsim, mahalle, adres veya fiş ara" aria-label="Ziyaret ara" value={query} onChange={e => setQuery(e.target.value)}/></label>
        {mode === 'map' && <div className="map-panel"><VisitMap visits={remaining} onSelect={selectVisit}/><p>{verified} / {remaining.length} ziyaretin koordinatı kayıtlı. Diğerlerini “Konumu düzelt” ile ekle. Harita zemini OpenStreetMap'ten yüklenir.</p></div>}
        {!services.length && <div className="empty-state"><ClipboardPaste size={36}/><h2>Sabah hazırlığını tek adıma indir.</h2><p>eCom listesini kopyala ve buraya yapıştır.<br/>Fişleri okuyalım, aynı adresleri bir araya getirelim.</p><button className="primary-btn" onClick={() => setImportOpen(true)}>İlk listeyi aktar <ArrowUpRight size={16}/></button></div>}
        {services.length > 0 && !visits.length && <div className="empty-state">Bu filtrede ziyaret yok.</div>}
        <div className="visit-list">{visits.map((v, index) => {
            const pending = v.items.filter(s => ['pending', 'postponed'].includes(s.status));
            const slot = earliestSlot(pending.length ? pending : v.items), state = appointmentState(slot, clock);
            const location = v.items.find(s => validCoordinates(s.coordinates)) || v.items.find(s => s.navigationAddress) || v.items[0];
            return <article className="visit-card" id={`visit-${v.key}`} key={v.key}>
                <div className="visit-top"><span className="visit-number">{String(index + 1).padStart(2,'0')}</span><div className="visit-title"><h2>{v.name}</h2><p>{v.mahalle} · {v.items.length} fiş</p></div><span className={`slot ${pending.length ? state : 'complete'}`}>{slot.replace('/', '–')}{pending.length && state === 'late' ? ' · Süresi geçti' : pending.length && state === 'active' ? ' · Şimdi' : ''}</span></div>
                <div className="job-tags" aria-label="Ziyaretteki iş türleri">{[...new Set(v.items.map(s => s.jobType?.trim() || 'İş türü belirtilmemiş'))].map(type => <span className={type === 'Montaj' ? 'installation' : type === 'Onarım' ? 'repair' : 'other'} key={type}>{type}</span>)}</div>
                <p className="visit-address"><MapPin size={16}/>{v.address}</p>
                <div className="device-tags">{[...new Set(v.items.map(s => [s.device?.split('|').slice(0,2).join(' · ').trim() || s.notes || 'Cihaz belirtilmemiş', s.jobType?.trim() || 'İş türü belirtilmemiş'].join(' — ')))].map(d => <span key={d}>{d}</span>)}</div>
                <div className="location-note">{validCoordinates(location.coordinates) ? '● Doğruladığın koordinat kullanılacak' : '○ Adres araması · Konum henüz doğrulanmadı'}{v.items.some(s => s.addressWarning) && ' · Bina numarasını kontrol et'}</div>
                <div className="visit-actions"><a className="primary-btn" target="_blank" rel="noreferrer" href={getMapsSearchUrl(location.navigationAddress || v.address, v.mahalle, location.coordinates)}>Haritada aç <ArrowUpRight size={16}/></a><button className="quiet-btn" onClick={() => openEditor(v)}>Konumu düzelt</button>{pending.length > 0 && <button className="finish-btn" onClick={() => { setLastCompleted(pending.map(s => s.id)); pending.forEach(s => toggleStatus(s.id,'done')); }}><Check size={17}/>Ziyareti tamamla</button>}</div>
                {!pending.length && v.items.some(s => s.status === 'done') && <button className="undo-btn" onClick={() => undoVisit(v.items.map(s => s.id))}>Tamamlamayı geri al</button>}
                <VisitHistory visit={v}/>
                <VisitNote visit={v}/>
                {pending.length > 0 && <Availability visit={v}/>}
                <details className="receipt-details"><summary>Fişler, satış ve durum <ChevronDown size={15}/></summary><div>{v.items.map(s => <div className="receipt" key={s.id}><p>Fiş {s.receiptNo || '—'} · {s.jobType || 'Servis'} · {s.timeSlot} · {s.warranty}</p><ServiceCard service={s}/></div>)}</div></details>
            </article>;
        })}</div></section>
        <aside className="side-panel"><p className="eyebrow">SAHA NOTU</p><h2>Kontrol sende.</h2><p>Saatli işleri önce gör. İşin erken biterse kalan kayıtlara bak.</p><div className="side-rule"><Clock size={18}/><p>Yol ve işlem süresi bilinmeden “yetişirsin” tahmini yapılmaz.</p></div><div className="side-rule"><MapPin size={18}/><p>Adres araması yanlış sonuç verebilir. Bir kez doğruladığın koordinatı kaydet.</p></div><button className="quiet-btn" onClick={() => setManual(!manual)}><Plus size={16}/>Tek kayıt ekle</button><button className="quiet-btn" onClick={exportData}>Verileri yedekle</button><button className="quiet-btn" onClick={() => { if (confirm('Mevcut fişler arşive taşınacak. Yeni gün başlatılsın mı?')) startNewDay(); }}>Günü arşivle</button><small>Veriler bu tarayıcıda saklanır. Yeni bağlantıda eski kayıtların otomatik taşınmaz.</small></aside></div>
        {manual && <ServiceForm/>}
        {notice && <p className="notice" role="status">{notice}</p>}
        {importOpen && <div className="modal-backdrop"><section className="field-modal" role="dialog" aria-modal="true" aria-labelledby="import-title"><button className="close-btn" aria-label="Kapat" onClick={() => setImportOpen(false)}><X/></button><p className="eyebrow">TOPLU AKTARIM</p><h2 id="import-title">Kopyala. Yapıştır. Hazır.</h2><p>eCom listesini olduğu gibi yapıştır. Aynı fiş yeniden eklenmez; satış ve durum bilgileri korunur.</p><textarea autoFocus aria-label="eCom servis listesi" value={text} onChange={e => setText(e.target.value)} placeholder="Fiş numarası, saat ve müşteri bilgilerini yapıştır…"/><div className="import-summary"><strong>{parsed.records.length} fiş</strong><span>{groupVisits(parsed.records).length} ziyaret</span></div><div className="import-warnings">{text && parsed.warnings.map(w => <p key={w}>{w}</p>)}</div><button className="primary-btn" disabled={!parsed.records.length} onClick={() => { importServices(parsed.records); setNotice(`${parsed.records.length} fiş işlendi. Mevcut durum ve satış kayıtları korundu.`); setText(''); setImportOpen(false); }}>Listeyi aktar <ArrowUpRight size={17}/></button><small>Bu metin uygulama sunucusuna gönderilmez.</small></section></div>}
        {editing && <div className="modal-backdrop"><form className="field-modal" onSubmit={saveLocation} role="dialog" aria-modal="true" aria-labelledby="location-title"><button type="button" className="close-btn" aria-label="Kapat" onClick={() => setEditing(null)}><X/></button><h2 id="location-title">Konumu düzelt</h2><p>Asıl adres kartta kalır. Harita için ayrı adres veya doğruladığın koordinatı kaydet.</p><label>Navigasyon adresi<input autoFocus value={navText} onChange={e => setNavText(e.target.value)} required/></label><p className="address-preview">{navigationAddress(navText, editing.mahalle)}</p><a target="_blank" rel="noreferrer" href={getMapsSearchUrl(navText, editing.mahalle)}>Google Maps'te kontrol et ↗</a><div className="coordinate-inputs"><label>Enlem<input inputMode="decimal" placeholder="40.98" value={lat} onChange={e => setLat(e.target.value)}/></label><label>Boylam<input inputMode="decimal" placeholder="28.72" value={lng} onChange={e => setLng(e.target.value)}/></label></div><small>Google Maps'te doğru noktaya basılı tut. Görünen enlem ve boylamı buraya gir. Sadece adres kaydetmek doğrulanmış konum sayılmaz.</small>{error && <p role="alert">{error}</p>}<button className="primary-btn" type="submit">Konumu kaydet</button></form></div>}
    </div>;
};
