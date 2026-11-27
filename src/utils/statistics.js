import { dayKey, uniqueRecords } from './workflow.js';
import { groupVisits } from './ecom.js';
import { formatMahalle } from './profile.js';
export function periodStart(period,now=Date.now()) {
    const today=dayKey(now), date=new Date(today+'T00:00:00+03:00');
    if(period==='all') return 0;
    if(period==='month')return new Date(today.slice(0,7)+'-01T00:00:00+03:00').getTime();
    if(period==='week') return date.getTime()-((new Date(today+'T12:00:00Z').getUTCDay()+6)%7)*86400000;
    return date.getTime();
}
export function statistics(services,archive,period='week',now=Date.now()) {
    const start=periodStart(period,now), records=uniqueRecords([...services,...archive]);
    const completed=[],postponed=[],seen=new Set();let undated=0;
    for(const record of records) {
        const events=(record.history||[]).filter(e=>['completed','postponed'].includes(e.type));
        if(record.status==='done' && !events.some(e=>e.type==='completed'&&e.at===record.completedAt)) {
            if(Number.isFinite(record.completedAt))events.push({id:`legacy-done-${record.id}`,type:'completed',at:record.completedAt});
            else if(!events.some(e=>e.type==='completed'))undated++;
        }
        if(record.status==='postponed' && !events.some(e=>e.type==='postponed') && Number.isFinite(record.statusChangedAt))events.push({id:`legacy-postponed-${record.id}`,type:'postponed',at:record.statusChangedAt,reason:record.actionReason});
        for(const event of events) {
            if(seen.has(event.id)||!Number.isFinite(event.at)||event.at<start||event.at>now)continue;
            seen.add(event.id);
            (event.type==='completed'?completed:postponed).push({record,event});
        }
    }
    // One visit per address/customer and calendar day, irrespective of the number of receipts.
    const byDay=new Map(), receiptKeys=new Set(),reasonCounts={},neighborhoods={};
    for(const {record,event} of completed) {
        const day=dayKey(event.at);if(!byDay.has(day))byDay.set(day,[]);byDay.get(day).push(record);
        receiptKeys.add(record.receiptNo||record.id);
    }
    let visits=0;
    for(const rows of byDay.values())for(const visit of groupVisits(uniqueRecords(rows))) {visits++;const n=formatMahalle(visit.mahalle)||'Mahalle belirtilmemiş';neighborhoods[n]=(neighborhoods[n]||0)+1;}
    for(const {event} of postponed){const reason=event.reason||'Sebep kaydedilmemiş';reasonCounts[reason]=(reasonCounts[reason]||0)+1;}
    const first=start||Math.min(now,...completed.map(x=>x.event.at));
    const days=Math.max(1,Math.round((new Date(dayKey(now)+'T00:00:00+03:00')-new Date(dayKey(first)+'T00:00:00+03:00'))/86400000)+1);
    return {visits,receipts:receiptKeys.size,postponements:postponed.length,reasons:Object.entries(reasonCounts).sort((a,b)=>b[1]-a[1]),neighborhoods:Object.entries(neighborhoods).sort((a,b)=>b[1]-a[1]),average:visits/days,undated};
}
