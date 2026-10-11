import { useEffect, useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { groupVisits } from '../utils/ecom'
import { dueReminder, reminderTimeLabel } from '../utils/reminders'
export function ReminderCenter() {
    const [alerts, setAlerts] = useState([]);
    useEffect(() => {
        const check = () => {
            const store = useServiceStore.getState();
            const due = groupVisits(store.services.filter(s => dueReminder(s)));
            due.forEach(visit => {
                const at = visit.items[0].reminderAt;
                visit.items.forEach(s => store.updateService(s.id, { reminderNotifiedAt:s.reminderAt }));
                setAlerts(previous => [...previous, { id:`${visit.key}|${at}`, name:visit.name, mahalle:visit.mahalle, time:reminderTimeLabel(at) }]);
                if ('Notification' in window && Notification.permission === 'granted') {
                    const options = { body:`${visit.name} · ${visit.mahalle} · ${reminderTimeLabel(at)}`, tag:`fieldops-${visit.key}-${at}` };
                    const notify = async () => {
                        try {
                            if ('serviceWorker' in navigator) {
                                await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}reminder-sw.js`);
                                const registration = await navigator.serviceWorker.ready;
                                await registration.showNotification('FieldOps · Ziyaret zamanı', options);
                            } else {
                                const notification = new Notification('FieldOps · Ziyaret zamanı', options);
                                notification.onclick = () => { window.focus(); window.location.hash = '/'; notification.close(); };
                            }
                        } catch { /* The visible in-app alert is always retained. */ }
                    };
                    void notify();
                }
            });
        };
        check(); const timer = setInterval(check, 5000);
        window.addEventListener('focus', check); document.addEventListener('visibilitychange', check);
        return () => { clearInterval(timer); window.removeEventListener('focus', check); document.removeEventListener('visibilitychange', check); };
    }, []);
    return alerts.length > 0 && <div className="reminder-alerts" role="alert" aria-live="assertive">{alerts.map(alert => <section key={alert.id}><strong>Ziyaret zamanı · {alert.time}</strong><p>{alert.name} · {alert.mahalle}</p><button onClick={() => setAlerts(previous => previous.filter(a => a.id !== alert.id))}>Tamam, gördüm</button></section>)}</div>;
}
