import { useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { dailyActivity,eventLabels } from '../utils/history';
import { dayKey } from '../utils/workflow';
export function ActivityLog() {
    const {services,archive,activity}=useServiceStore();const [date,setDate]=useState(dayKey());
    const events=dailyActivity(services,archive,activity,date);
    return <details className="history-panel"><summary>Günlük işlem geçmişi</summary><label>Gün<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
        {!events.length&&<p>Bu gün için işlem yok.</p>}{events.map(e=><article key={e.id}><strong>{new Date(e.at).toLocaleTimeString('tr-TR',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit'})} · {eventLabels[e.type] || e.type}</strong><p>{e.name} · Fiş {e.receiptNo || '—'}</p>{e.reason&&<p>{e.reason}</p>}</article>)}
    </details>;
}
