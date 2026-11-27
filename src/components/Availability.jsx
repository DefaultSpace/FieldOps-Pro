import { dayKey } from '../utils/workflow'
import { reminderStatus, requestReminderPermission } from '../mini/reminders'
import { useEffect, useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { reminderTimestamp, reminderTimeLabel } from '../utils/reminders'
export function Availability({ visit }) {
    const native=!!window.FieldOpsMini;
    const [nativeStatus,setNativeStatus]=useState(reminderStatus());
    useEffect(()=>{const update=()=>setNativeStatus(reminderStatus());window.addEventListener('fieldops-reminders',update);return()=>window.removeEventListener('fieldops-reminders',update);},[]);
    const updateService = useServiceStore(s => s.updateService);
    const current = visit.items.find(s => ['pending','postponed'].includes(s.status)) || visit.items[0];
    const planSaved=nativeStatus?.plan?.some(r=>visit.items.some(s=>s.id===r.id)&&r.at===current.reminderAt);
    const [date,setDate]=useState(dayKey(current.reminderAt||Date.now()));
    const [time, setTime] = useState(current.reminderAt?reminderTimeLabel(current.reminderAt):''), [error, setError] = useState('');
    const apply = updates => visit.items.filter(s => ['pending','postponed'].includes(s.status)).forEach(s => updateService(s.id, updates));
    const choose = value => { setError(''); apply({ availability:value, reminderAt:null, reminderNotifiedAt:null }); };
    const save = async e => {
        e.preventDefault();
        const at = reminderTimestamp(time,new Date(),date);
        if (!at) { setError('Şu andan sonraki bir tarih ve saat seç.'); return; }
        apply({ availability:'later', reminderAt:at, reminderNotifiedAt:null });
        setError('');
        if(native && (!nativeStatus?.notifications || !nativeStatus?.exact))requestReminderPermission();
        if (!native && 'Notification' in window && Notification.permission === 'default') {
            try { await Notification.requestPermission(); } catch { /* In-app reminder remains available. */ }
        }
    };
    return <div className="availability"><button type="button" className="quiet-btn" aria-pressed={current.availability === 'later'} onClick={() => choose(current.availability === 'later' ? null : 'later')}>Sonra gel{current.availability === 'later' ? ' ✓' : ''}</button>
    {current.availability === 'later' && <form onSubmit={save}><label>Hatırlatma tarihi<input type="date" required aria-label="Hatırlatma tarihi" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Hatırlatma saati<input type="time" aria-label="Hatırlatma saati" required value={time} onChange={e => setTime(e.target.value)}/></label><button className="quiet-btn" type="submit">{current.reminderAt ? 'Saati değiştir' : 'Hatırlatıcı kur'}</button>{current.reminderAt && <p role="status">{dayKey(current.reminderAt)} {reminderTimeLabel(current.reminderAt)} için hatırlatıcı {current.reminderNotifiedAt === current.reminderAt ? 'gösterildi' : 'kaydedildi'}.</p>}{native?<><small>{nativeStatus&&planSaved?(!nativeStatus.notifications?'Bildirim izni kapalı. Hatırlatıcı için izin ver.':!nativeStatus.exact?'Kesin alarm izni kapalı. Bildirim gecikebilir.':'Yerel alarm planı kaydedildi. Uygulama kapalıyken Android bildirimi kullanılır.'):'Yerel alarm planı kaydedilmeyi bekliyor.'} Saate ulaşması için Galaxy Wearable bildirimlerini aç. Zorla durdurmadan sonra uygulamayı yeniden aç.</small><button type="button" className="quiet-btn" onClick={requestReminderPermission}>Bildirim ve alarm izinleri</button></>:<small>Web/PWA açıkken uyarır; kapalıyken yerel alarm için Android uygulamasını kullan.</small>}{error && <p role="alert">{error}</p>}</form>}
    </div>;
}
