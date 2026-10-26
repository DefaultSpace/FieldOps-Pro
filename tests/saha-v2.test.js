import {fieldRecord,fieldState} from '../src/utils/fieldRecords.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEcom,mergeImported,groupVisits} from '../src/utils/ecom.js';
import {reviewImport,possibleVisitMatches} from '../src/utils/importReview.js';
import {reopenRecord,dailyActivity} from '../src/utils/history.js';
import {completeRecords,closeDay,dayKey} from '../src/utils/workflow.js';
import {nextVisit} from '../src/utils/scheduling.js';
import {readBackup,mergeBackup} from '../src/utils/backup.js';
const now=Date.parse('2026-10-25T08:00:00Z');
const record={id:'a',receiptNo:'159000001',name:'Örnek',address:'Başaran sok no12 d4',mahalle:'Gümüşpala',status:'pending',createdAt:now,timeSlot:'10/12',visitNote:'576101 2 adet pompa',notes:'Önce ara'};
const block=(id,time='10:00 - 12:00')=>`${id}\n${time}\nÖrnek\nBosch | Çamaşır Makinesi\nBaşaran sok no12 d4\nGÜMÜŞPALA MAH-AVCILAR+\n(555) 000-0000\nYeni\nGD\nOnarım`;
test('independent receipt candidates expose malformed time, missing payload, duplicate and invalid hours',()=>{
 const result=parseEcom([block('159000001'),block('159000002','BOZUK'),block('159000003','25:00 - 26:00'),block('159000001'),'159000004\nSaatsiz\nEksik'].join('\n'));
 assert.equal(result.sourceReceiptCount,5);assert.equal(result.records.length,1);assert.equal(result.rejectedReceiptCount,4);assert.equal(result.rejected.length,4);
 assert.ok(result.rejected.find(r=>r.receiptNo==='159000002').raw.includes('BOZUK'));
 assert.equal(reviewImport(result,[],[],6).mismatch,true);assert.equal(reviewImport(result,[],[],5).mismatch,false);assert.equal(reviewImport(result,[],[]).needsReview,true);
});
test('manual appointment survives eCom update and source appointment remains available',()=>{
 const old={...record,timeSlot:'14/16',manualTimeSlot:true,contactedAt:now};
 const incoming=parseEcom(block(record.receiptNo)).records;
 const updated=mergeImported([old],[],incoming,()=> 'new',now)[0];
 assert.equal(updated.timeSlot,'14/16');assert.equal(updated.sourceTimeSlot,'10/12');assert.equal(updated.visitNote,old.visitNote);assert.equal(updated.contactedAt,now);
 assert.equal(reviewImport({records:incoming,warnings:[],sourceReceiptCount:1},[old],[]).conflicts.length,1);
 assert.equal(mergeImported([{...old,manualTimeSlot:false}],[],incoming,()=> 'new',now)[0].timeSlot,'10/12');
});
test('repeat visits retain each completion, original notes and reason across backup round trip',()=>{
 const done=completeRecords([record],['a'],now)[0];
 const reopened=reopenRecord(done,now+1000);
 assert.equal(reopened.status,'pending');assert.equal(reopened.completedAt,null);assert.equal(reopened.history[0].visitNote,record.visitNote);
 const second=completeRecords([{...reopened,visitNote:'Parça takıldı'}],['a'],now+2000)[0];
 assert.equal(second.history.filter(e=>e.type==='completed').length,2);
 const backup=readBackup(JSON.stringify({version:3,s:[second],a:[]}));assert.deepEqual(backup.s[0].history,second.history);
 const legacy=reopenRecord({...record,status:'done',completedAt:now},now+1000);assert.equal(legacy.history[0].type,'completed');
 assert.equal(dailyActivity([second],[],[],dayKey(now)).length,3);
});
test('retired parts status migrates without losing notes and re-enters normal planning',()=>{
 const legacy={...record,status:'waiting_parts',contactedAt:now};const parts=fieldRecord(legacy);
 assert.equal(parts.status,'pending');assert.equal(parts.visitNote,record.visitNote);assert.equal(parts.contactedAt,now);
 assert.equal(fieldState({services:[legacy],archive:[legacy]}).archive[0].status,'pending');
 assert.equal(closeDay([parts],[],now).services.length,1);
 assert.ok(nextVisit(groupVisits([parts]),'Avcılar'));
 const visits=groupVisits([{...record,id:'a',name:'Uzak',mahalle:'Ambarlı'}, {...record,id:'b',name:'Yakın'}, {...record,id:'c',name:'Daha geç',timeSlot:'12/14'}]);
 assert.equal(nextVisit(visits,'Avcılar','Gümüşpala',now).name,'Yakın');
 assert.equal(nextVisit(visits,'Avcılar','Başka mahalle',now).items[0].timeSlot,'10/12');
 const later={...record,availability:'later',reminderAt:now+10000};
 assert.equal(nextVisit(groupVisits([later]),'Avcılar','',now),null);assert.ok(nextVisit(groupVisits([later]),'Avcılar','',now+10000));
});
test('similar address suggestions retain apartment identity and never auto merge',()=>{
 const variants=[record,{...record,id:'b',receiptNo:'159000002',address:'Başaran sk no12 d4'}];
 const visits=groupVisits(variants);assert.equal(visits.length,2);assert.equal(possibleVisitMatches(visits).length,1);
 assert.equal(possibleVisitMatches(groupVisits([record,{...variants[1],address:'Başaran sk no12 d5'}])).length,0);
});
test('backup validates new fields before writes and retains current notes on merge',()=>{
 assert.throws(()=>readBackup(JSON.stringify({s:[{...record,history:{}}],a:[]})));
 assert.throws(()=>readBackup(JSON.stringify({s:[{...record,history:[{id:'bad',at:'yesterday',type:'completed'}]}],a:[]})));
 assert.throws(()=>readBackup(JSON.stringify({s:[{...record,materialPrepared:{576101:'2'}}],a:[]})));
 assert.throws(()=>readBackup(JSON.stringify({version:99,s:[],a:[]})));
 const backup=readBackup(JSON.stringify({version:3,s:[{...record,status:'waiting_parts'}],a:[]}));
 assert.equal(backup.s[0].status,'pending');assert.equal(mergeBackup({services:[record],archive:[]},backup).services[0].notes,record.notes);
});
