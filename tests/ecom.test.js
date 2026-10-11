import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEcom, mergeImported, groupVisits, earliestSlot, appointmentState } from '../src/utils/ecom.js';
import { navigationAddress, getMapsSearchUrl, validCoordinates } from '../src/utils/maps.js';
const block = (id, slot = 'Saatsiz', device = 'Bosch | Bulaşık Makinesi', name = 'ÖRNEK MÜŞTERİ') => `${id}\n${slot}\n- ${name}\n- ${device}\n- Örnek sok. no:34 d:5 k:2 Site A blok\n- AMBARLI MAH-AVCILAR+\n- (555) 000-0000/(555) 000-0001\n* Yeni\n* GD\n* Onarım`;
test('Reads multi-ticket visits, slots, model-free devices and incomplete final flags', () => {
 const r = parseEcom([block('159000001'), block('159000002','10:00 - 12:00'), block('159000003','14:00 - 16:00','Siemens | Kurutma | WT00/01','DİĞER MÜŞTERİ').split('* Yeni')[0]].join('\n'));
 assert.equal(r.records.length,3); assert.equal(r.warnings.length,0); assert.equal(r.records[0].phones.length,2);
 assert.equal(r.records[0].mahalle,'AMBARLI'); assert.equal(r.records[1].timeSlot,'10/12');
 const visits = groupVisits(r.records); assert.equal(visits.length,2); assert.equal(earliestSlot(visits[0].items),'10/12');
});
test('Reimport preserves status, sales, notes, saved coordinate, and old archived tickets', () => {
 const records = parseEcom(block('159000001')).records;
 let services = mergeImported([], [], records, () => 'uuid');
 services[0] = {...services[0], status:'done', plus:true, notes:'keep', coordinates:{lat:40.98,lng:28.72}};
 const merged = mergeImported(services, [], [...records, ...parseEcom(block('159000002')).records], () => 'uuid2');
 assert.equal(merged.length,2); assert.equal(merged[0].status,'done'); assert.equal(merged[0].plus,true); assert.equal(merged[0].notes,'keep'); assert.equal(merged[0].coordinates.lat,40.98);
 assert.equal(mergeImported([],services,records,()=> 'new').length,0);
});
test('Duplicates and malformed records are reported', () => {
 const r = parseEcom(block('159000001')+'\n'+block('159000001')+'\n159000002\nSaatsiz\n- Eksik');
 assert.equal(r.records.length,1); assert.equal(r.warnings.length,2);
 assert.equal(parseEcom('not a list').records.length,0);
});
test('Map destination includes neighborhood and uses saved coordinates exactly', () => {
 const a = navigationAddress('Örnek sok. no:34 d:5 k:2 Site A blok','AMBARLI');
 assert.ok(a.includes('no:34')); assert.ok(a.includes('AMBARLI Mahallesi')); assert.ok(a.includes('Site A blok')); assert.ok(!a.includes('d:5'));
 assert.ok(getMapsSearchUrl('wrong','AMBARLI',{lat:40.98,lng:28.72}).includes('destination=40.98%2C28.72'));
 assert.equal(validCoordinates({lat:91,lng:20}),false);
});
test('Appointment state uses Istanbul time and exact end boundary', () => {
 assert.equal(appointmentState('10/12',new Date('2026-10-11T08:00:00Z')),'active');
 assert.equal(appointmentState('10/12',new Date('2026-10-11T09:00:00Z')),'late');
 assert.equal(appointmentState('12/14',new Date('2026-10-11T08:00:00Z')),'upcoming');
 assert.equal(appointmentState('Saatsiz',new Date('2026-10-11T08:00:00Z')),'unscheduled');
});

test('Imports plain clipboard text without list markers, including wrapped addresses', () => {
 const plain = [block('159000001'),block('159000002','10:00 - 12:00')].join('\n').replace(/^[-*] /gm,'');
 const result = parseEcom(plain);
 assert.equal(result.records.length,2);
 assert.equal(result.warnings.length,0);
 assert.equal(result.records[0].warranty,'GD');
 assert.equal(result.records[0].jobType,'Onarım');
 assert.equal(result.records[0].phones[0],'905550000000');
 assert.equal(groupVisits(result.records).length,1);
 const wrapped = plain.replaceAll('Örnek sok. no:34 d:5 k:2 Site A blok', 'Örnek sok. no:34\nSite A blok d:5 k:2');
 assert.equal(parseEcom(wrapped).records[0].address,'Örnek sok. no:34 Site A blok d:5 k:2');
 assert.deepEqual(parseEcom(plain).records,parseEcom([block('159000001'),block('159000002','10:00 - 12:00')].join('\n')).records);
});
test('Accepts browser bullet markers and en dash time separators', () => {
 const text = block('159000001','10:00 – 12:00').replace(/^[-*] /gm,'• ');
 const r = parseEcom(text); assert.equal(r.records.length,1); assert.equal(r.records[0].timeSlot,'10/12'); assert.equal(r.records[0].warranty,'GD');
});
