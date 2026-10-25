import { useState } from 'react';
import { nextVisit,visitSlot } from '../utils/scheduling';
import { isOpen } from '../utils/workflow';
import { possibleVisitMatches } from '../utils/importReview';
export function DailyPlan({visits,region,onShow,clock}) {
    const [neighborhood,setNeighborhood]=useState('');
    const next=nextVisit(visits,region,neighborhood,clock.getTime());
    const open=visits.filter(v=>v.items.some(isOpen));
    const waiting=visits.flatMap(v=>v.items).filter(s=>s.status==='waiting_parts').length;
    const matches=possibleVisitMatches(visits);
    return <section className="daily-plan"><details open><summary>Sabah kontrolü · {open.length} ziyaret · {waiting} parça bekleyen fiş</summary>
        <label>Bulunduğum mahalle<select value={neighborhood} onChange={e=>setNeighborhood(e.target.value)}><option value="">Mahalle seç</option>{[...new Set(open.map(v=>v.mahalle).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr')).map(m=><option key={m}>{m}</option>)}</select></label>
        {next?<div><strong>Sıradaki öneri: {next.name}</strong><p>{next.mahalle} · {visitSlot(next).replace('/','–')}</p><small>Önce 10–12 ve saat sırası, aynı saat diliminde bulunduğun mahalle. Yol süresi hesaplanmaz. Parça bekleyen ve “Sonra gel” saati gelmeyen işler önerilmez.</small><button className="quiet-btn" onClick={()=>onShow(next)}>Müşteriyi göster</button></div>:<p>Şu an önerilebilecek iş yok. Parça bekleyenleri ve “Sonra gel” kayıtlarını kontrol et.</p>}
        {matches.length>0&&<details><summary>{matches.length} olası aynı ziyaret · kontrol et</summary><p>Benzer adres ve müşteri/telefon bulundu. Kayıtlar otomatik birleştirilmedi; daire ve müşteri bilgisini kontrol et.</p>{matches.map(({a,b})=><p key={a.key+b.key}>{a.name} / {b.name} · {a.address} / {b.address}</p>)}</details>}
    </details></section>;
}
