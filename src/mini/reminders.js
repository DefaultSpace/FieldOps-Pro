import { groupVisits } from '../utils/ecom.js';
export function reminderPlan(services) {
    const eligible=services.filter(s=>['pending','postponed'].includes(s.status)&&s.availability==='later'&&Number.isFinite(s.reminderAt)&&s.reminderAt>0&&s.reminderNotifiedAt!==s.reminderAt);
    const times=[...new Set(eligible.map(s=>s.reminderAt))];
    return times.flatMap(at=>groupVisits(eligible.filter(s=>s.reminderAt===at)).map(v=>({id:[...v.items].sort((a,b)=>a.id.localeCompare(b.id))[0].id,at,name:v.name||'',mahalle:v.mahalle||'',address:v.address||''})));
}
let status=null;
export const reminderStatus=()=>status;
export function setReminderStatus(value){status=value;window.dispatchEvent(new Event('fieldops-reminders'));}
export function requestReminderPermission(){window.FieldOpsMini?.postMessage(JSON.stringify({type:'reminderPermission'}));}
