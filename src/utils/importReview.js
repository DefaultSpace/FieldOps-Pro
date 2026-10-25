import { importSummary, normalizeKey } from './ecom.js';
import { addressKey } from './fieldTools.js';
export function reviewImport(parsed,services,archive,expected='') {
    const count=expected===''?null:Number(expected);
    const mismatch=count!==null && (!Number.isInteger(count)||count<1||count!==parsed.sourceReceiptCount);
    const conflicts=parsed.records.flatMap(r=>{
        const old=[...services,...archive].find(s=>s.receiptNo===r.receiptNo);
        return old?.manualTimeSlot && old.timeSlot!==r.timeSlot?[{receiptNo:r.receiptNo,local:old.timeSlot,source:r.timeSlot}]:[];
    });
    return {...importSummary(services,archive,parsed.records),mismatch,conflicts,needsReview:mismatch || parsed.warnings.length>0 || conflicts.length>0};
}
export function possibleVisitMatches(visits) {
    const matches=[];
    for(let i=0;i<visits.length;i++)for(let j=i+1;j<visits.length;j++){
        const a=visits[i],b=visits[j];
        const phones=v=>v.items.flatMap(s=>[s.phone,...(s.phones || [])]).filter(Boolean);
        const samePhone=phones(a).some(p=>phones(b).includes(p));
        if(a.address && b.address && addressKey(a)===addressKey(b) && (normalizeKey(a.name)===normalizeKey(b.name)||samePhone))matches.push({a,b});
    }
    return matches;
}
