import test from 'node:test';
import assert from 'node:assert/strict';
import { materialsFromNote,materialRows,visitHistory,archiveFinishedDays,restoreKnownLocations } from '../src/utils/fieldTools.js';
const old = {id:'old',name:'Örnek',address:'Örnek sok. no:3 d:2',mahalle:'Ambarlı',status:'done',createdAt:Date.parse('2026-10-01T07:00:00Z'),visitNote:'576101 pompa takıldı — 7000 TL',coordinates:{lat:40.98,lng:28.72}};
test('Material codes exclude price, support quantities and count grouped tickets once',()=>{
 assert.deepEqual(materialsFromNote('7000 TL\n576101 2 adet pompa — 7000 TL\n123456 conta').map(p=>[p.code,p.quantity]),[['576101',2],['123456',1]]);
 const visit={items:[{visitNote:'576101 2 adet pompa',materialUsage:{576101:1}},{visitNote:'576101 2 adet pompa',materialUsage:{576101:1}}]};
 const rows=materialRows([visit]); assert.equal(rows.length,1);assert.equal(rows[0].quantity-rows[0].used,1);
 assert.equal(materialRows([{items:[{visitNote:'576101 pompa',materialUsage:{576101:9}}]}])[0].used,1);
});
test('Past completed visits show at same address, not other apartments or incomplete jobs',()=>{
 const current={id:'new',...old,status:'pending'};current.id='new';
 const visit={address:old.address,mahalle:old.mahalle,items:[current]};
 assert.equal(visitHistory(visit,[current],[old,{...old,id:'other',address:'Örnek sok. no:3 d:5'},{...old,id:'pending',status:'pending'}]).length,1);
 assert.equal(restoreKnownLocations([{address:old.address,mahalle:old.mahalle}],[old])[0].coordinates.lat,40.98);
 assert.equal(restoreKnownLocations([{address:'Örnek sok. no:3 d:5',mahalle:old.mahalle}],[old])[0].coordinates,undefined);
});
test('Later import archives old completed jobs and preserves unfinished ones',()=>{
 const pending={...old,id:'pending',status:'pending'};
 const current={...old,id:'today',createdAt:Date.parse('2026-10-11T07:00:00Z')};
 const result=archiveFinishedDays([old,pending,current],[],Date.parse('2026-10-11T08:00:00Z'));
 assert.deepEqual(result.services.map(s=>s.id),['pending','today']);assert.equal(result.archive[0].id,'old');
});
