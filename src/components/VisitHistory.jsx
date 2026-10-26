import { eventLabels } from '../utils/history'
import { useServiceStore } from '../store/useServiceStore'
import { visitHistory } from '../utils/fieldTools'
export function VisitHistory({ visit }) {
    const services = useServiceStore(s => s.services), archive = useServiceStore(s => s.archive);
    const records = visitHistory(visit,services,archive);
    const events=visit.items.flatMap(s=>(s.history||[]).map(e=>({...e,receiptNo:s.receiptNo}))).sort((a,b)=>b.at-a.at);
    if (!records.length && !events.length) return null;
    return <details className="history-panel"><summary>Ziyaret geçmişi · {events.length} fiş olayı · {records.length} önceki kayıt</summary><div>{events.map(e=><article key={e.id}><strong>{new Date(e.at).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul'})} · {eventLabels[e.type] || e.type}</strong><p>Fiş {e.receiptNo} · {e.timeSlot}</p>{e.reason&&<p>{e.reason}</p>}{e.visitNote&&<p className="history-note">{e.visitNote}</p>}{e.notes&&<p>{e.notes}</p>}</article>)}{records.map(s => <article key={s.id}><strong>{new Date(s.completedAt || s.createdAt).toLocaleDateString('tr-TR',{timeZone:'Europe/Istanbul'})} · {s.jobType || 'Servis'}</strong><p>{s.device || 'Cihaz belirtilmemiş'} · Fiş {s.receiptNo || '—'}</p>{s.visitNote && <p className="history-note">{s.visitNote}</p>}{s.notes && <p>{s.notes}</p>}</article>)}</div></details>;
}
