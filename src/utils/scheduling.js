import { earliestSlot, slotStart } from './ecom.js';
const open = s => ['pending','postponed'].includes(s.status);
const normal = s => String(s || '').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
export const visitSlot = visit => { const items=visit.items.some(open) ? visit.items.filter(open) : visit.items; return items.some(s=>isMorning(s.timeSlot)) ? '10/12' : earliestSlot(items); };
export const isMorning = slot => /^10(?::00)?\/12(?::00)?$/.test(slot);
export function orderedVisits(visits,region) {
    return [...visits].sort((a,b) => Number(isMorning(visitSlot(b)))-Number(isMorning(visitSlot(a))) || slotStart(visitSlot(a))-slotStart(visitSlot(b)) || (region==='Avcılar' ? normal(a.mahalle).localeCompare(normal(b.mahalle),'tr') : 0));
}
export function morningNearby(visits,region) {
    return region==='Avcılar' ? visits.filter(v=>normal(v.mahalle)==='gumuspala' && normal(v.district || 'Avcılar')==='avcilar' && v.items.some(s=>open(s)&&isMorning(s.timeSlot))) : [];
}
