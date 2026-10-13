import test from 'node:test';
import assert from 'node:assert/strict';
import {closeDay,completeRecords,todaysCompleted,dayKey} from '../src/utils/workflow.js';
import {importWithArchive,groupVisits,parseEcom,appointmentState,earliestSlot} from '../src/utils/ecom.js';
import {readBackup,mergeBackup} from '../src/utils/backup.js';
import {localPhone,contactPhones,messageTemplates,whatsappUrl} from '../src/utils/contacts.js';
import {materialRows} from '../src/utils/fieldTools.js';
import {getMapsSearchUrl, cleanMapsAddress} from '../src/utils/maps.js';
const now=Date.parse('2026-10-13T21:01:00Z');
const row=(id,status='pending')=>({id,receiptNo:id,name:'Örnek',status,createdAt:now-86400000,notes:'koru'});
test('day close keeps unfinished jobs; Istanbul daily completed count survives archiving',()=>{
 const done={...row('done','done'),completedAt:now};const yesterday={...row('yesterday','done'),completedAt:now-120000};
 const active=[row('pending'),row('later','postponed'),done,row('cancelled','cancelled'),yesterday];
 const result=closeDay(active,[],now);
 assert.deepEqual(result.services.map(s=>s.id),['pending','later']);
 assert.equal(todaysCompleted(active,[],now).length,1);
 assert.equal(todaysCompleted(result.services,result.archive,now).length,1);
 assert.equal(dayKey(now),'2026-10-14');
});
test('completion is idempotent, excludes cancelled, clears reminders',()=>{
 const initial=[{...row('a'),reminderAt:now},row('b','cancelled')];const done=completeRecords(initial,['a','b'],now);
 assert.equal(done[0].completedAt,now);assert.equal(done[0].reminderAt,null);assert.equal(done[1].status,'cancelled');
 assert.deepEqual(completeRecords(done,['a'],now+1000),done);
});
test('reimport reopens archived receipts once and preserves data without duplicate archive',()=>{
 const old={...row('123456789','done'),completedAt:now,removedFromList:true};
 const records=[{receiptNo:old.receiptNo,name:'Güncel'},{receiptNo:old.receiptNo,name:'Güncel'}];
 const result=importWithArchive([], [old,row('other','done')],records,()=> 'new',now);
 assert.equal(result.services.length,1);assert.equal(result.archive.length,1);assert.equal(result.services[0].status,'pending');assert.equal(result.services[0].notes,'koru');
 assert.deepEqual(importWithArchive(result.services,result.archive,records,()=> 'new',now),result);
});
test('backup rejects malformed data and merging never replaces current work',()=>{
 assert.throws(()=>readBackup('broken'));assert.throws(()=>readBackup('{}'));
 assert.throws(()=>readBackup(JSON.stringify({s:[{...row('a'),phones:'wrong'}],a:[]})));
 const current=row('a'),backup=readBackup(JSON.stringify({s:[{...current,notes:'old'},row('b')],a:[row('b'),row('c','done')]}));
 const result=mergeBackup({services:[current],archive:[]},backup);
 assert.equal(result.added,2);assert.equal(result.skipped,2);assert.equal(result.services[0].notes,'koru');
 assert.equal(mergeBackup(result,backup).added,0);
});
test('two phone numbers, local copy format, safe message links and no invented ETA',()=>{
 assert.equal(localPhone('+90 (555) 000-0000'),'05550000000');
 assert.deepEqual(contactPhones({phone:'05550000000',phones:['+905550000000','02120000000']}),['905550000000','902120000000']);
 assert.equal(whatsappUrl('','test'),'');assert.ok(whatsappUrl('05550000000','A & B').includes('A%20%26%20B'));
 const templates=messageTemplates({timeSlot:'Saatsiz'},'Veysel');assert.ok(templates.every(t=>t.text.includes('Veysel')));assert.ok(templates.every(t=>!t.text.includes('Saatsiz')&&!t.text.includes('30 dakika')));
});
test('parser warns but retains unknown neighborhood; preserves district and minute slots',()=>{
 const text='Tarih\n13.10.2026\n123456789\n10:30 - 12:30\nÖrnek\nBosch | Buzdolabı\nÖrnek sok no 2 YENİ MAH-ESENYURT+(555) 000-0000\nYeni\nGH\nOnarım';
 const result=parseEcom(text);assert.equal(result.records.length,1);assert.equal(result.sourceDate,'2026-10-13');assert.equal(result.records[0].district,'ESENYURT');assert.equal(groupVisits(result.records)[0].district,'ESENYURT');assert.ok(result.warnings.length);assert.equal(result.records[0].timeSlot,'10:30/12:30');
 assert.equal(earliestSlot([{timeSlot:'11/13'},{timeSlot:'10:30/12:30'}]),'10:30/12:30');
 assert.equal(appointmentState('10:30/12:30',new Date('2026-10-13T07:15:00Z')),'upcoming');
 assert.ok(decodeURIComponent(getMapsSearchUrl('Örnek sok','Yeni',null,'Esenyurt')).includes('Örnek sok'));
 assert.ok(decodeURIComponent(getMapsSearchUrl('','Yeni',null,'Esenyurt')).includes('Esenyurt'));
});
test('cancelled-only visits no longer inflate material list',()=>{
 assert.deepEqual(materialRows([{items:[{status:'cancelled',visitNote:'576101 pompa'}]}]),[]);
});

test('cleanMapsAddress strips apartment numbers, kat/daire, and district suffixes but preserves building number', () => {
    assert.equal(cleanMapsAddress('Başaran sok no12 d4'), 'Başaran sok no 12');
    assert.equal(cleanMapsAddress('Başaran sok no:12 d:4'), 'Başaran sok no 12');
    assert.equal(cleanMapsAddress('Başaran sokak no 12 daire 4'), 'Başaran sokak no 12');
    assert.equal(cleanMapsAddress('Başaran sok. no:12/4'), 'Başaran sok. no 12');
    assert.equal(cleanMapsAddress('Atatürk cad. no: 20 kat 2 daire 5'), 'Atatürk cad. no 20');
    assert.equal(cleanMapsAddress('Fevzi çakmak cd no 8 d 2'), 'Fevzi çakmak cd no 8');
    assert.equal(cleanMapsAddress('Denizköşkler cad no 45 d6 Avcılar İstanbul'), 'Denizköşkler cad no 45');
});

test('groupVisits and formatMahalle prevent duplicate uppercase neighborhoods', () => {
    const records = [
        { name: 'A', address: 'Sok 1', mahalle: 'CİHANGİR', receiptNo: '1' },
        { name: 'B', address: 'Sok 2', mahalle: 'Cihangir', receiptNo: '2' },
        { name: 'C', address: 'Sok 3', mahalle: 'GÜMÜŞPALA', receiptNo: '3' },
        { name: 'D', address: 'Sok 4', mahalle: 'Gümüşpala', receiptNo: '4' },
    ];
    const grouped = groupVisits(records);
    const mahalles = [...new Set(grouped.map(g => g.mahalle))];
    assert.deepEqual(mahalles, ['Cihangir', 'Gümüşpala']);
});

