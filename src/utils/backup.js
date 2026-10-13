import { fieldRecord } from './fieldRecords.js'
import { uniqueRecords } from './workflow.js'
const statuses=['pending','postponed','done','cancelled'];
export function readBackup(text) {
    if(text.length>5_000_000) throw new Error('Yedek dosyası çok büyük (en fazla 5 MB).');
    let data; try { data=JSON.parse(text); } catch { throw new Error('Geçerli bir JSON yedeği seç.'); }
    if(!data || !Array.isArray(data.s) || !Array.isArray(data.a)) throw new Error('Bu dosya FieldOps yedeği değil.');
    const clean = records => records.map(s => {
        if(!s || typeof s!=='object' || typeof s.id!=='string' || !s.id || typeof s.name!=='string' || !statuses.includes(s.status) || !Number.isFinite(s.createdAt) || s.createdAt<=0) throw new Error('Yedekte geçersiz bir servis kaydı var. Hiçbir kayıt değiştirilmedi.');
        for(const key of ['phone','receiptNo','address','mahalle','device','notes','visitNote','timeSlot','jobType']) if(s[key]!=null && typeof s[key]!=='string') throw new Error('Yedekte geçersiz alan var: '+key);
        if(s.phones!=null && (!Array.isArray(s.phones)||s.phones.some(p=>typeof p!=='string'))) throw new Error('Yedekte geçersiz telefon listesi var.');
        if(s.completedAt!=null && !Number.isFinite(s.completedAt)) throw new Error('Yedekte geçersiz tarih var.');
        const result={}; for(const [key,value] of Object.entries(s)) if(!['__proto__','constructor','prototype'].includes(key)) result[key]=value;
        return fieldRecord(result);
    });
    return {s:clean(data.s),a:clean(data.a)};
}
export function mergeBackup(state, backup) {
    const current=uniqueRecords([...state.services,...state.archive]);
    const ids=new Set(current.map(s=>s.id)), receipts=new Set(current.map(s=>s.receiptNo).filter(Boolean));
    const take = list => list.filter(s=>{if(ids.has(s.id)||(s.receiptNo&&receipts.has(s.receiptNo)))return false;ids.add(s.id);if(s.receiptNo)receipts.add(s.receiptNo);return true;});
    const active=take(backup.s.map(fieldRecord)), archived=take(backup.a.map(fieldRecord));
    return {services:[...state.services,...active],archive:[...state.archive,...archived],added:active.length+archived.length,skipped:backup.s.length+backup.a.length-active.length-archived.length};
}
