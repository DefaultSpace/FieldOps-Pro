import test from 'node:test';
import assert from 'node:assert/strict';
import {orderedVisits,morningNearby,visitSlot} from '../src/utils/scheduling.js';
import {receiptForAction,actionMessage} from '../src/utils/actionMessage.js';
import {readBackup} from '../src/utils/backup.js';
const visit=(name,timeSlot,mahalle='GÜMÜŞPALA',status='pending',district='Avcılar')=>({name,mahalle,district,items:[{name,timeSlot,status,receiptNo:'159000001'}]});
test('time priority always precedes neighborhood and unscheduled work',()=>{
 const jobs=['Saatsiz','18/20','14/16','10/12','16/18','12/14'].map(s=>visit(s,s));
 assert.deepEqual(orderedVisits(jobs,'Avcılar').map(v=>visitSlot(v)),['10/12','12/14','14/16','16/18','18/20','Saatsiz']);
 const multi=visit('multi','Saatsiz');multi.items.push({status:'pending',timeSlot:'10/12'});assert.equal(visitSlot(multi),'10/12');
});
test('Gumuspala alert respects profile, district, status and exact appointment',()=>{
 const jobs=[visit('yes','10/12'),visit('late','12/14'),visit('other','10/12','DENİZKÖŞKLER'),visit('done','10/12','GÜMÜŞPALA','done'),visit('elsewhere','10/12','GÜMÜŞPALA','pending','Esenyurt'),visit('also','10:00/12:00','Gümüşpala','postponed')];
 assert.deepEqual(morningNearby(jobs,'Avcılar').map(v=>v.name),['yes','also']);
 for(const region of ['Başakşehir','Parseller',''])assert.equal(morningNearby(jobs,region).length,0);
});
test('receipt message uses one real receipt and count, with no repeated typing',()=>{
 const rows=[{receiptNo:'159000001'},{receiptNo:'159000002'},{receiptNo:'159000003'}];
 assert.equal(actionMessage(receiptForAction(rows),rows.length,'evde değilmiş yarın ister'),'159000001 3 kaydı var evde değilmiş yarın ister');
 assert.equal(receiptForAction([{receiptNo:''},{receiptNo:159000002}]),'159000002');assert.equal(receiptForAction([]),'');
});
test('old backup retains field work but cannot restore retired sales fields',()=>{
 const restored=readBackup(JSON.stringify({s:[{id:'a',name:'Örnek',status:'pending',createdAt:1,plus:true,plusQuantity:4,jobType:'Bakım',visitNote:'576101 pompa'}],a:[]}));
 assert.equal(restored.s[0].plus,undefined);assert.equal(restored.s[0].plusQuantity,undefined);assert.equal(restored.s[0].jobType,'Bakım');assert.equal(restored.s[0].visitNote,'576101 pompa');
});
