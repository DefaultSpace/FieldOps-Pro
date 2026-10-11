export function reminderTimestamp(time, now = new Date()) {
    if (!/^\d{2}:\d{2}$/.test(time)) return null;
    const [hour, minute] = time.split(':').map(Number);
    if (hour > 23 || minute > 59) return null;
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const timestamp = new Date(`${date}T${time}:00+03:00`).getTime();
    return Number.isFinite(timestamp) && timestamp > now.getTime() ? timestamp : null;
}
export function dueReminder(service, now = Date.now()) {
    return ['pending', 'postponed'].includes(service.status) && service.availability === 'later' && Number.isFinite(service.reminderAt) && service.reminderAt <= now && service.reminderNotifiedAt !== service.reminderAt;
}
export const reminderTimeLabel = timestamp => new Date(timestamp).toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' });
