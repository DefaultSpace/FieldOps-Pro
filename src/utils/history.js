export const eventLabels = {completed:'Tamamlandı',reopened:'Yeniden açıldı',pending:'Ziyaret planlandı',postponed:'Ertelendi',cancelled:'İptal edildi',waiting_parts:'Parça bekleniyor',contacted:'Müşteriye ulaşıldı',contact_reset:'İletişim işareti kaldırıldı',note:'Not güncellendi',schedule:'Saat değiştirildi',imported:'eCom güncellendi',deleted:'Silindi',restored:'Silme geri alındı',archived:'Arşivlendi',added:'Fiş eklendi'};
export function recordEvent(record, type, at = Date.now(), detail = '') {
    const event = {id:globalThis.crypto?.randomUUID?.() || `${at}-${Math.random().toString(36).slice(2)}`,at,type,detail,
        status:record.status,notes:record.notes || '',visitNote:record.visitNote || '',reason:record.actionReason || '',timeSlot:record.timeSlot || ''};
    return {...record,history:[...(record.history || []),event]};
}
export function reopenRecord(record, now = Date.now()) {
    let previous=record;
    // Capture legacy completion before clearing its timestamp, exactly once per reopening.
    if (record.status==='done' && !(record.history || []).some(e=>e.type==='completed' && e.at===record.completedAt)) {
        previous=recordEvent(record,'completed',record.completedAt || record.createdAt || now);
    }
    previous=recordEvent(previous,'reopened',now);
    return {...previous,status:'pending',completedAt:null,statusBeforeDone:null,removedFromList:false,restoredAt:now,
        availability:'',reminderAt:null,reminderNotifiedAt:null,actionReason:'',actionReceiptNo:'',actionRecordCount:null,
        contactedAt:null,materialPrepared:{},materialPreparedDay:null};
}
export function dailyActivity(services,archive,activity=[],date) {
    const entries=[...activity,...[...services,...archive].flatMap(s=>(s.history || []).map(e=>({...e,name:s.name,receiptNo:s.receiptNo})))];
    const seen=new Set();
    return entries.filter(e=>{if(seen.has(e.id))return false;seen.add(e.id);return true;}).filter(e=>!date || new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul'}).format(new Date(e.at))===date).sort((a,b)=>b.at-a.at);
}
