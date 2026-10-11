import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { reminderTimestamp, reminderTimeLabel } from '../utils/reminders'
export function Availability({ visit }) {
    const updateService = useServiceStore(s => s.updateService);
    const current = visit.items.find(s => ['pending','postponed'].includes(s.status)) || visit.items[0];
    const [time, setTime] = useState(''), [error, setError] = useState('');
    const apply = updates => visit.items.filter(s => ['pending','postponed'].includes(s.status)).forEach(s => updateService(s.id, updates));
    const choose = value => { setError(''); apply({ availability:value, reminderAt:null, reminderNotifiedAt:null }); };
    const save = async e => {
        e.preventDefault();
        const at = reminderTimestamp(time);
        if (!at) { setError('Bugün için şu andan sonraki bir saati seç.'); return; }
        apply({ availability:'later', reminderAt:at, reminderNotifiedAt:null });
        setError('');
        if ('Notification' in window && Notification.permission === 'default') {
            try { await Notification.requestPermission(); } catch { /* In-app reminder remains available. */ }
        }
    };
    return <div className="availability"><button type="button" className="quiet-btn" aria-pressed={current.availability === 'later'} onClick={() => choose(current.availability === 'later' ? null : 'later')}>Sonra gel{current.availability === 'later' ? ' ✓' : ''}</button>
    {current.availability === 'later' && <form onSubmit={save}><label>Bugün hatırlat<input type="time" aria-label="Hatırlatma saati" required value={time} onChange={e => setTime(e.target.value)}/></label><button className="quiet-btn" type="submit">{current.reminderAt ? 'Saati değiştir' : 'Hatırlatıcı kur'}</button>{current.reminderAt && <p role="status">{reminderTimeLabel(current.reminderAt)} için hatırlatıcı {current.reminderNotifiedAt === current.reminderAt ? 'gösterildi' : 'kuruldu'}.</p>}<small>Uygulama açıkken uyarır. Tamamen kapalıysa açtığında geciken hatırlatıcı görünür. Tarayıcı bildirimi için izin gerekir.</small>{error && <p role="alert">{error}</p>}</form>}
    </div>;
}
