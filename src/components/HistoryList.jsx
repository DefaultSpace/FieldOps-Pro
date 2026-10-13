import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { dayKey, uniqueRecords, statusLabel } from '../utils/workflow'
import { ServiceCard } from './ServiceCard'
import { VisitNote } from './VisitNote'
export function HistoryList({completed=false}) {
 const {services,archive,undoVisit,restoreVisit,removeVisit}=useServiceStore();
 const [query,setQuery]=useState(''),[date,setDate]=useState('');
 const records=uniqueRecords(completed?[...services,...archive].filter(s=>s.status==='done'):archive);
 const key=s=>dayKey(completed?s.completedAt||s.createdAt:s.archivedAt||s.completedAt||s.statusChangedAt||s.createdAt);
 const filtered=records.filter(s=>(!date||key(s)===date)&&[s.name,s.receiptNo,s.address,s.mahalle,s.phone].join(' ').toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR')));
 const days=filtered.reduce((result,s)=>{(result[key(s)]||=[]).push(s);return result;},{});
 return <div className="field-shell"><div className="page-intro"><div><p className="eyebrow">SERVİS GEÇMİŞİ</p><h1>{completed?'Tamamlananlar':'Arşiv'}</h1><p>{completed?'Tamamlanma tarihine göre fişler, notlar ve anket mesajları.':'Arşivdeki tüm kayıtlar. Aramak veya geri almak için fişi aç.'}</p></div></div>
 <div className="history-filters"><label>Ara<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="İsim, fiş, telefon veya adres"/></label><label>Tarih<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><button className="quiet-btn" onClick={()=>{setQuery('');setDate('');}}>Filtreyi temizle</button></div>
 <p>{filtered.length} fiş</p>
 {!filtered.length&&<div className="empty-state">Bu filtrede kayıt yok.</div>}
 {Object.keys(days).sort().reverse().map(day=><section className="completed-day" key={day}><h2>{day==='Tarihsiz'?day:new Date(`${day}T12:00:00+03:00`).toLocaleDateString('tr-TR',{timeZone:'Europe/Istanbul',day:'numeric',month:'long',year:'numeric'})} · {days[day].length} fiş</h2>
 {days[day].sort((a,b)=>(b.completedAt||b.createdAt)-(a.completedAt||a.createdAt)).map(s=><details className="history-record" key={s.id}><summary><strong>{s.name}</strong><span>Fiş {s.receiptNo||'—'} · {s.jobType||'Servis'} · {statusLabel(s.status)}</span></summary>
 <p>{s.completedAt?`Tamamlanma: ${new Date(s.completedAt).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul'})}`:'Tamamlanma zamanı kayıtlı değil.'}</p><ServiceCard service={s} completedView/><VisitNote visit={{...s,items:[s]}}/>
 <button className="quiet-btn" onClick={()=>{if(confirm('Bu fiş kalan işlere geri alınsın mı?'))s.status==='done'?undoVisit([s.id]):restoreVisit([s.id]);}}>Kalan işlere geri al</button><button className="undo-btn" onClick={()=>{if(confirm('Bu fiş ve notları silinsin mi?'))removeVisit([s.id]);}}>Fişi sil</button></details>)}
 </section>)}
 </div>;
}
