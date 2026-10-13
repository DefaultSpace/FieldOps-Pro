import { districtFor } from './maps.js'
import { dayKey } from './workflow.js'
import { normalizeKey } from './ecom.js'
export function materialsFromNote(note) {
    const parts = new Map();
    String(note || '').split('\n').forEach(line => {
        const match = line.trim().match(/^(\d{6,8})\b\s*[-:]?\s*(.*)$/);
        if (!match) return;
        const quantity = match[2].match(/(?:^|\s)(\d+)\s*adet\b/i);
        const qty = quantity ? Math.max(1, Math.min(999, Number(quantity[1]))) : 1;
        const old = parts.get(match[1]);
        parts.set(match[1], { code:match[1], description:match[2], quantity:(old?.quantity || 0) + qty });
    });
    return [...parts.values()];
}
export function materialRows(visits) {
    return visits.flatMap(visit => {
        if (visit.items.every(s => s.status === 'cancelled')) return [];
        const source = visit.items.find(s => s.visitNote)?.visitNote || '';
        const usage = visit.items.find(s => s.materialUsage)?.materialUsage || {};
        return materialsFromNote(source).map(part => ({ ...part, visit, used:Math.min(part.quantity, Math.max(0, Number(usage[part.code]) || 0)) }));
    });
}
export function addressKey(service) {
    const normalize = text => normalizeKey(text).replace(/\b(?:cad|cd)\.?\s/gi,'caddesi ').replace(/\b(?:sok|sk)\.?\s/gi,'sokak ').replace(/[.,:]/g,' ').replace(/\s+/g,' ').trim();
    return `${normalize(service.address)}|${normalize(service.mahalle)}|${normalize(districtFor(service.mahalle,service.district))}`;
}
export function visitHistory(visit, services, archive) {
    const ids = new Set(visit.items.map(s => s.id));
    const key = addressKey(visit);
    if (!visit.address || !visit.mahalle) return [];
    return [...services, ...archive].filter(s => !ids.has(s.id) && s.status === 'done' && addressKey(s) === key).sort((a,b) => (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt));
}
export function archiveFinishedDays(services, archive, now = Date.now()) {
    const day = dayKey;
    const old = services.filter(s => ['done','cancelled'].includes(s.status) && day(s.completedAt || s.statusChangedAt || s.createdAt) !== day(now));
    const ids = new Set(old.map(s => s.id));
    return { services:services.filter(s => !ids.has(s.id)), archive:[...old,...archive] };
}
export function restoreKnownLocations(records, history) {
    return records.map(record => {
        const previous = [...history].filter(s => addressKey(s) === addressKey(record) && s.coordinates && Number.isFinite(s.coordinates.lat) && Number.isFinite(s.coordinates.lng)).sort((a,b) => b.createdAt-a.createdAt)[0];
        return previous ? {...record,coordinates:previous.coordinates,navigationAddress:previous.navigationAddress} : record;
    });
}
