import { useServiceStore } from '../store/useServiceStore'
import { ServiceCard } from '../components/ServiceCard'
import { completionDay } from '../utils/profile'

export function Completed() {
    const { services, archive, undoVisit } = useServiceStore();
    const completed = [...new Map([...services, ...archive].filter(s => s.status === 'done').map(s => [s.id, s])).values()];
    const days = completed.reduce((result, service) => { const day = completionDay(service); (result[day] ||= []).push(service); return result; }, {});
    return <div className="field-shell"><div className="page-intro"><div><p className="eyebrow">SERVİS GEÇMİŞİ</p><h1>Tamamlananlar</h1><p>Tamamlanma tarihine göre tüm fişler ve anket mesajları.</p></div></div>
        {!completed.length && <div className="empty-state">Henüz tamamlanan iş yok.</div>}
        {Object.keys(days).sort().reverse().map(day => <section key={day} className="completed-day"><h2>{new Date(`${day}T12:00:00+03:00`).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long', year: 'numeric' })} · {days[day].length} fiş</h2><div className="visit-list">{days[day].sort((a,b) => (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt)).map(service => <article className="visit-card" key={service.id}><p>Fiş {service.receiptNo || '—'} · {service.device || 'Cihaz belirtilmemiş'} · {service.jobType || 'Servis'}</p><p>{service.completedAt ? `Tamamlandı: ${new Date(service.completedAt).toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' })}` : 'Eski kayıt: tamamlanma saati kayıtlı değil'}</p>{service.visitNote && <p>Saha notu: {service.visitNote}</p>}<ServiceCard service={service} completedView/><button className="undo-btn" onClick={() => undoVisit([service.id])}>Tamamlamayı geri al</button></article>)}</div></section>)}
    </div>;
}
