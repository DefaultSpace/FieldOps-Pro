import test from 'node:test';
import assert from 'node:assert/strict';
import { completionDay, surveyMessage, REGIONS, formatMahalle } from '../src/utils/profile.js';
import { navigationAddress, districtFor } from '../src/utils/maps.js';
import { parseEcom } from '../src/utils/ecom.js';

test('Survey uses technician, appliance and operation rather than brand or model', () => {
    const text = surveyMessage({device:'Bosch | Çamaşır Makinesi | WAT123',jobType:'Onarım'}, 'Veysel');
    assert.ok(text.includes('teknisyen Veysel'));
    assert.ok(text.includes('çamaşır makinesi onarımı için'));
    assert.ok(!text.includes('WAT123'));
    assert.ok(text.includes('10 puan'));
    assert.ok(surveyMessage({}, 'Ali').includes('cihazınızla ilgili işlem'));
});
test('Completion groups by completion date in Istanbul, including midnight boundary', () => {
    assert.equal(completionDay({createdAt:Date.parse('2026-10-10T10:00:00Z'),completedAt:Date.parse('2026-10-12T21:30:00Z')}), '2026-10-13');
    assert.equal(completionDay({createdAt:Date.parse('2026-10-10T10:00:00Z')}), '2026-10-10');
});
test('Region neighborhoods use correct navigation district with uppercase import values', () => {
    assert.equal(REGIONS['Başakşehir'].length,3);
    assert.equal(REGIONS['Parseller'].length,3);
    assert.equal(REGIONS['Avcılar'].length,5);
    assert.equal(districtFor('ALTINŞEHİR'), 'Başakşehir');
    assert.equal(districtFor('AMBARLI'), 'Avcılar');
    assert.equal(formatMahalle('ALTINŞEHİR'), 'Altınşehir');
    assert.equal(formatMahalle('CİHANGİR'), 'Cihangir');
    assert.equal(formatMahalle('GÜMÜŞPALA'), 'Gümüşpala');
    assert.equal(formatMahalle('DENİZKÖŞKLER'), 'Denizköşkler');
    assert.equal(formatMahalle('MERKEZ'), 'Merkez');
});
test('Joined Başakşehir clipboard addresses are parsed without losing neighborhood or phone', () => {
    const text = '159000001\nSaatsiz\nMüşteri\nBosch | Buzdolabı\nÖrnek sokak no:1 ALTINŞEHİR MAH-BAŞAKŞEHİR+(555) 000-0000\nYeni\nGD\nMontaj';
    const result = parseEcom(text);
    assert.equal(result.records.length,1);
    assert.equal(result.records[0].mahalle,'ALTINŞEHİR');
    assert.equal(result.records[0].phone,'905550000000');
});

