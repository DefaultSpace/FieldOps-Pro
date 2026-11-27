import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultPreferences,validatePreferences,renderMessage,knownBrand} from '../src/utils/messageLibrary.js';
import {readBackup,mergeBackup} from '../src/utils/backup.js';
import {statistics,periodStart} from '../src/utils/statistics.js';
import {reminderPlan} from '../src/mini/reminders.js';
import {nextVisit} from '../src/utils/scheduling.js';
import {groupVisits} from '../src/utils/ecom.js';
import {whatsappUrl} from '../src/utils/contacts.js';
import {reminderTimestamp} from '../src/utils/reminders.js';
const at=Date.parse('2026-11-27T12:00:00+03:00');
const row=(id,patch={})=>({id,receiptNo:id,name:'Örnek',address:'Sokak no 1 d2',mahalle:'Gümüşpala',district:'Avcılar',status:'done',createdAt:1,completedAt:at,history:[],...patch});
test('defaults contain only two postponement reasons and neutral editable drafts',()=>{
 const p=defaultPreferences();assert.deepEqual(p.reasons,['Müşteri evde yok','Telefona cevap vermiyor']);assert.equal(p.library.length,8);
 assert.ok(p.library.flatMap(g=>g.templates).length>=45);assert.deepEqual(validatePreferences(p),p);
 const dryer=p.library.find(g=>g.name==='Kurutma makinesi').templates[0];assert.equal(dryer.technicalReview,true);assert.doesNotMatch(dryer.body,/normaldir|arızaya işaret etmemektedir|rezistans/);
 assert.equal(knownBrand({device:'Bosch | Çamaşır Makinesi'}),'Bosch');assert.equal(knownBrand({device:'Kapak'}),'');
});
test('required fields, unknown brand, continuing conversation and Turkish WhatsApp encoding',()=>{
 assert.deepEqual(renderMessage('{{parça}} {{tarih}}',{},'',true).missing,['parça','tarih','marka']);
 const r=renderMessage('{{parça}} için {{tarih}}',{parça:'Ön sac',tarih:'Cuma'},'Siemens');assert.equal(r.missing.length,0);assert.match(r.text,/Siemens Yetkili/);
 assert.equal(renderMessage('Teşekkürler',{},'',false).text,'Teşekkürler');assert.equal(new URL(whatsappUrl('05550000000',r.text)).searchParams.get('text'),r.text);
});
test('preferences backup round trip preserves edits, disabled and deleted templates; old backups remain valid',()=>{
 const p=defaultPreferences();p.library[0].templates[0].body='Kişisel metnim';p.library[0].templates[0].enabled=false;p.library.pop();p.reasons=[];
 const b=readBackup(JSON.stringify({version:3,s:[row('1')],a:[],preferences:p}));assert.deepEqual(b.preferences,p);
 const restored=mergeBackup({services:[],archive:[]},b);assert.deepEqual(restored.preferences,p);
 assert.equal(readBackup(JSON.stringify({version:3,s:[],a:[]})).preferences,undefined);
 assert.throws(()=>readBackup(JSON.stringify({s:[],a:[],preferences:{...p,reasons:[3]}})),/Geçersiz/);
});
test('Istanbul week/month boundaries and duplicate receipt/visit statistics',()=>{
 assert.equal(periodStart('week',at),Date.parse('2026-11-23T00:00:00+03:00'));
 assert.equal(periodStart('month',at),Date.parse('2026-11-01T00:00:00+03:00'));
 const a=row('1',{history:[{id:'delay-1',type:'postponed',at:at-1000,reason:'Müşteri evde yok'},{id:'done-1',type:'completed',at}]});
 const b=row('2');const c=row('3',{address:'Sokak no 1 d3'});
 const s=statistics([a,b,c],[a,b,row('4',{completedAt:null}),row('5',{completedAt:at+86400000})],'week',at);
 assert.equal(s.visits,2);assert.equal(s.receipts,3);assert.equal(s.postponements,1);assert.equal(s.undated,1);assert.deepEqual(s.neighborhoods,[['Gümüşpala',2]]);
 const old=row('6',{completedAt:at-40*86400000});assert.equal(statistics([],[old],'month',at).visits,0);
});
test('reopened historical completion counts without inventing dates',()=>{
 const s=statistics([row('1',{status:'pending',completedAt:null,history:[{id:'past',type:'completed',at:at-86400000},{id:'reopen',type:'reopened',at}]})],[],'week',at);
 assert.equal(s.visits,1);assert.equal(s.receipts,1);
});
test('native plan groups receipts and removes cancelled/completed/deleted/cleared reminders',()=>{
 const a=row('1',{status:'pending',availability:'later',reminderAt:at});const b={...a,id:'2',receiptNo:'2'};
 assert.equal(reminderPlan([a,b]).length,1);assert.equal(reminderPlan([b,a])[0].id,'1');
 assert.equal(reminderPlan([{...a,status:'done'},{...b,status:'cancelled'}]).length,0);
 assert.equal(reminderPlan([{...a,reminderAt:null}]).length,0);assert.equal(reminderPlan([]).length,0);
 assert.equal(reminderPlan([{...a,reminderAt:at+1000}])[0].at,at+1000);
 assert.equal(reminderPlan([{...a,reminderNotifiedAt:at}]).length,0);
});
test('reminders accept a future Istanbul date and reject invalid calendar dates',()=>{
 assert.equal(reminderTimestamp('10:30',new Date(at),'2026-11-28'),Date.parse('2026-11-28T10:30:00+03:00'));
 assert.equal(reminderTimestamp('10:30',new Date(at),'2026-02-30'),null);
 assert.equal(reminderTimestamp('10:30',new Date(at),'2026-11-27'),null);
});
test('next visit reuses existing route and skips future later records, regardless of list filters',()=>{
 const early=row('1',{status:'pending',timeSlot:'10/12',availability:'later',reminderAt:at+1000});
 const later=row('2',{status:'pending',name:'Diğer',timeSlot:'12/14'});
 assert.equal(nextVisit(groupVisits([early,later]),'Avcılar','',at).name,'Diğer');
 assert.equal(nextVisit(groupVisits([early,later]),'Avcılar','',at+1000).name,'Örnek');
});
