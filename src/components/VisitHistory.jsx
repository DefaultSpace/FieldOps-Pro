import { useServiceStore } from '../store/useServiceStore'
import { visitHistory } from '../utils/fieldTools'
export function VisitHistory({ visit }) {
    const services = useServiceStore(s => s.services), archive = useServiceStore(s => s.archive);
    const records = visitHistory(visit,services,archive);
    if (!records.length) return null;
    return <details className="history-panel"><summary>Bu adreste {records.length} geçmiş işlem var · Son işlem {new Date(records[0].completedAt || records[0].createdAt).toLocaleDateString('tr-TR',{timeZone:'Europe/Istanbul'})}</summary><div>{records.map(s => <article key={s.id}><strong>{new Date(s.completedAt || s.createdAt).toLocaleDateString('tr-TR',{timeZone:'Europe/Istanbul'})} · {s.jobType || 'Servis'}</strong><p>{s.device || 'Cihaz belirtilmemiş'} · Fiş {s.receiptNo || '—'}</p>{s.visitNote && <p className="history-note">{s.visitNote}</p>}{s.notes && <p>{s.notes}</p>}</article>)}</div></details>;
}
