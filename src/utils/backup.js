import { fieldRecord } from './fieldRecords.js'
import { uniqueRecords } from './workflow.js'
const statuses=['pending','postponed','waiting_parts','done','cancelled'];
function validateHistory(events) {
    if(!Array.isArray(events) || events.some(e=>!e || typeof e.id!=='string' || !Number.isFinite(e.at) || e.at<=0 || typeof e.type!=='string' || ['detail','name','receiptNo','notes','visitNote','reason','timeSlot'].some(k=>e[k]!=null && typeof e[k]!=='string'))) throw new Error('Yedekte geçersiz işlem geçmişi var.');
    return events;
}
export function readBackup(text) {
    if(text.length>5_000_000) throw new Error('Yedek dosyası çok büyük (en fazla 5 MB).');
    let data; try { data=JSON.parse(text); } catch { throw new Error('Geçerli bir JSON yedeği seç.'); }
    if(!data || !Array.isArray(data.s) || !Array.isArray(data.a)) throw new Error('Bu dosya FieldOps yedeği değil.');
    if(data.version!=null && ![1,2,3].includes(data.version)) throw new Error('Bu yedek sürümü desteklenmiyor.');
    const clean = records => records.map(s => {
        if(!s || typeof s!=='object' || typeof s.id!=='string' || !s.id || typeof s.name!=='string' || !statuses.includes(s.status) || !Number.isFinite(s.createdAt) || s.createdAt<=0) throw new Error('Yedekte geçersiz bir servis kaydı var. Hiçbir kayıt değiştirilmedi.');
        for(const key of ['phone','receiptNo','address','mahalle','district','device','notes','visitNote','timeSlot','sourceTimeSlot','jobType','actionReason','materialPreparedDay']) if(s[key]!=null && typeof s[key]!=='string') throw new Error('Yedekte geçersiz alan var: '+key);
        if(s.history!=null)validateHistory(s.history);
        for(const key of ['materialUsage','materialPrepared']) if(s[key]!=null && (typeof s[key]!=='object' || Array.isArray(s[key]) || Object.values(s[key]).some(v=>!Number.isFinite(v)||v<0))) throw new Error('Yedekte geçersiz malzeme miktarı var.');
        for(const key of ['contactedAt','reminderAt','reminderNotifiedAt','statusChangedAt']) if(s[key]!=null && !Number.isFinite(s[key])) throw new Error('Yedekte geçersiz tarih var.');
        if(s.phones!=null && (!Array.isArray(s.phones)||s.phones.some(p=>typeof p!=='string'))) throw new Error('Yedekte geçersiz telefon listesi var.');
        if(s.completedAt!=null && !Number.isFinite(s.completedAt)) throw new Error('Yedekte geçersiz tarih var.');
        const result={}; for(const [key,value] of Object.entries(s)) if(!['__proto__','constructor','prototype'].includes(key)) result[key]=value;
        return fieldRecord(result);
    });
    return {s:clean(data.s),a:clean(data.a),activity:validateHistory(data.activity || [])};
}
export function mergeBackup(state, backup) {
    const current=uniqueRecords([...state.services,...state.archive]);
    const ids=new Set(current.map(s=>s.id)), receipts=new Set(current.map(s=>s.receiptNo).filter(Boolean));
    const take = list => list.filter(s=>{if(ids.has(s.id)||(s.receiptNo&&receipts.has(s.receiptNo)))return false;ids.add(s.id);if(s.receiptNo)receipts.add(s.receiptNo);return true;});
    const active=take(backup.s.map(fieldRecord)), archived=take(backup.a.map(fieldRecord));
    const activity=[...(state.activity || [])];const events=new Set(activity.map(e=>e.id));
    for(const event of backup.activity || [])if(!events.has(event.id)){events.add(event.id);activity.push(event);}
    return {services:[...state.services,...active],archive:[...state.archive,...archived],activity,added:active.length+archived.length,skipped:backup.s.length+backup.a.length-active.length-archived.length};
}
