export function dayKey(value = Date.now()) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul', year:'numeric',month:'2-digit',day:'2-digit' }).format(date) : 'Tarihsiz';
}
export const statusLabel = status => ({pending:'Bekliyor',postponed:'Ertelendi',done:'Tamamlandı',cancelled:'İptal edildi'}[status] || 'Bekliyor');
export const isOpen = service => ['pending','postponed'].includes(service.status);
export function uniqueRecords(records) {
    const seen = new Set();
    return records.filter(s => { const key = s.receiptNo ? `receipt:${s.receiptNo}` : `id:${s.id}`; if(seen.has(key)) return false; seen.add(key); return true; });
}
export function closeDay(services, archive, now = Date.now()) {
    const closed = services.filter(s => !isOpen(s)).map(s => ({...s,archivedAt:now}));
    return {services:services.filter(isOpen), archive:uniqueRecords([...closed,...archive])};
}
export function completeRecords(services, ids, now = Date.now()) {
    return services.map(s => ids.includes(s.id) && isOpen(s) ? {...s,status:'done',statusBeforeDone:s.status,completedAt:now,reminderAt:null,reminderNotifiedAt:null,availability:''} : s);
}
export function todaysCompleted(services, archive, now = Date.now()) {
    return uniqueRecords([...services,...archive]).filter(s => s.status === 'done' && dayKey(s.completedAt || s.createdAt) === dayKey(now));
}
