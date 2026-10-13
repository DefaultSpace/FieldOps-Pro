import { fieldRecord } from './fieldRecords.js'
import { districtFor } from './maps.js'
import { normalizePhone } from './contacts.js'
export const normalizeKey = value => String(value || '').normalize('NFKC').toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
export function parseEcom(text) {
    const lines = text.replace(/\r/g, '').split('\n').map(l => l.replace(/^[\s\u200B\uFEFF]+|[\s\u200B\uFEFF]+$/g, '').replace(/^[-•*▪●]\s*/, '')).filter(Boolean);
    const starts = lines.flatMap((l, i) => /^\d{7,12}$/.test(l) && /^(Saatsiz|\d{1,2}:\d{2}\s*[-–—]\s*\d{1,2}:\d{2})$/i.test(lines[i + 1] || '') ? [i] : []);
    const records = [], warnings = [];
    const seen = new Set();
    starts.forEach((start, index) => {
        const block = lines.slice(start, starts[index + 1] ?? lines.length);
        // Browser clipboard copies may omit all HTML list markers.
        const content = block.slice(2);
        const flagStart = content.findIndex((line, i) => i >= 2 && /^(Yeni|Devam|Açık|Kapalı)$/i.test(line));
        const payload = content.slice(2, flagStart >= 0 ? flagStart : content.length);
        const neighborhoodIndex = payload.findIndex(line => /MAH(?:ALLESİ)?\s*[-–]/i.test(line));
        let fields = [];
        if (neighborhoodIndex >= 0) {
            const line = payload[neighborhoodIndex];
            // Some mobile clipboards join street, neighborhood and phones without spaces.
            const marker = line.match(/MAH(?:ALLESİ)?\s*[-–]\s*(?:AVC[Iİ]LAR|BAŞAKŞEH[Iİ]R|ESENYURT)\s*\+?/i);
            const prefix = marker ? line.slice(0, marker.index).trim() : '';
            const known = prefix.match(/(?:ALT[Iİ]NŞEH[Iİ]R|GÜVERC[Iİ]NTEPE|ŞAH[Iİ]NTEPE|MUSTAFA\s*KEMAL\s*PAŞA|DENİZKÖŞKLER|GÜMÜŞPALA|ÜNİVERSİTE|FİRUZKÖY|TAHTAKALE|YEŞİLKENT|CİHANGİR|AMBARLI|MERKEZ)\s*$/i);
            if (marker && known) {
                const streetPart = prefix.slice(0,known.index).trim();
                const address = [...payload.slice(0,neighborhoodIndex),streetPart].filter(Boolean).join(' ');
                const neighborhood = `${known[0].trim()} ${marker[0]}`;
                const phoneText = [line.slice(marker.index+marker[0].length),...payload.slice(neighborhoodIndex+1)].join(' ');
                fields = [content[0],content[1],address,neighborhood,phoneText];
            } else if (neighborhoodIndex > 0) {
                fields = [content[0],content[1],payload.slice(0,neighborhoodIndex).join(' '),line,payload.slice(neighborhoodIndex+1).join(' ')];
            }
        }
        const receiptNo = block[0];
        if (!fields.length && content[0] && content[1]?.includes('|') && payload.length) {
            fields = [content[0], content[1], payload.join(' ').replace(/(?:\+?90\s*)?\(?0?\d{3}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g, '').trim(), '', payload.join(' ')];
            warnings.push(`${receiptNo}: Mahalle ayrılamadı; adresi kontrol et. Fiş aktarılacak.`);
        }
        if (fields.length < 4 || !fields[1]?.includes('|') || !fields[2]) { warnings.push(`${receiptNo}: Eksik kayıt; aktarılmadı.`); return; }
        if (seen.has(receiptNo)) { warnings.push(`${receiptNo}: Tekrarlanan fiş atlandı.`); return; }
        seen.add(receiptNo);
        const phoneMatches = (fields[4] || '').match(/(?:\+?90\s*)?\(?0?\d{3}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g) || [];
        const phones = [...new Set(phoneMatches.map(normalizePhone).filter(Boolean))];
        if (!phones.length) warnings.push(`${receiptNo}: Telefon bulunamadı; fiş yine de aktarılacak.`);
        const mahalle = fields[3].replace(/\s*MAH(?:ALLESİ)?\s*[-–].*$/i, '').trim();
        const match = block[1].match(/(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})/);
        const timeSlot = match ? `${Number(match[1])}${match[2]==='00'?'':':'+match[2]}/${Number(match[3])}${match[4]==='00'?'':':'+match[4]}` : 'Saatsiz';
        const flags = flagStart >= 0 ? content.slice(flagStart) : [];
        records.push({ receiptNo, name: fields[0], device: fields[1], address: fields[2], mahalle, district: fields[3].match(/[-–]\s*([^+]+)/)?.[1]?.trim() || payload.join(' ').match(/MAH(?:ALLESİ)?\s*[-–]\s*([^+]+)/i)?.[1]?.trim() || '', phone: phones[0] || '', phones, timeSlot, warranty: flags[1] || '', jobType: flags[2] || '', addressWarning: !/\bno\s*[:.]?\s*\d/i.test(fields[2]) || !mahalle });
    });
    if (!starts.length) warnings.push('Fiş bulunamadı. eCom listesinin tamamını yapıştırın.');
    const date = text.match(/Tarih\s*\n\s*(\d{2})\.(\d{2})\.(\d{4})/);
    const sourceDate = date ? `${date[3]}-${date[2]}-${date[1]}` : '';
    return { records, warnings, sourceDate };
}
export function mergeImported(services, archive, records, createId, now = Date.now(), isExtra = false) {
    const result = [...services];
    for (const record of records) {
        const index = result.findIndex(s => s.receiptNo === record.receiptNo);
        if (index >= 0) result[index] = { ...result[index], ...record };
        else {
            const previous = archive.find(s => s.receiptNo === record.receiptNo);
            if (previous) result.push({ ...previous, ...record, status: 'pending', completedAt: null, statusBeforeDone: null, removedFromList: false, restoredAt: now, availability: '', reminderAt: null, reminderNotifiedAt: null, actionReason: '', actionReceiptNo: '', actionRecordCount: null });
            else result.push({ ...record, id: createId(), createdAt: now, status: 'pending', notes: '', isExtra });
        }
    }
    return result.map(fieldRecord);
}
export function importWithArchive(services, archive, records, createId, now = Date.now(), isExtra = false) {
    const receipts = new Set(records.map(record => record.receiptNo));
    return { services: mergeImported(services, archive, records, createId, now, isExtra), archive: archive.filter(s => !receipts.has(s.receiptNo)) };
}
export function importSummary(services, archive, records) {
    const result={added:0,updated:0,restored:0};
    for(const receipt of new Set(records.map(s=>s.receiptNo))) {
        if(services.some(s=>s.receiptNo===receipt)) result.updated++;
        else if(archive.some(s=>s.receiptNo===receipt)) result.restored++;
        else result.added++;
    }
    return result;
}
export function groupVisits(services) {
    const groups = new Map();
    services.forEach(s => {
        const key = [normalizeKey(s.name), normalizeKey(s.address), normalizeKey(s.mahalle),normalizeKey(districtFor(s.mahalle,s.district))].join('|');
        if (!groups.has(key)) groups.set(key, { key, name: s.name, address: s.address, mahalle: s.mahalle, district: s.district, items: [] });
        groups.get(key).items.push(s);
    });
    return [...groups.values()];
}
export const slotStart = slot => {
    const match=String(slot).match(/^(\d{1,2})(?::(\d{2}))?\//);
    return match ? Number(match[1])*60+Number(match[2]||0) : 9999;
};
export function earliestSlot(items) {
    return items.map(s=>s.timeSlot).filter(s=>/^\d{1,2}(?::\d{2})?\/\d{1,2}(?::\d{2})?$/.test(s)).sort((a,b)=>slotStart(a)-slotStart(b))[0] || 'Saatsiz';
}
export function appointmentState(slot, date = new Date()) {
    if (!/^\d{1,2}(?::\d{2})?\/\d{1,2}(?::\d{2})?$/.test(slot)) return 'unscheduled';
    const toMinutes=part=>{const [h,m=0]=part.split(':').map(Number);return h*60+m;};
    const [start,end]=slot.split('/').map(toMinutes);
    if(start>=end || end>1440) return 'unscheduled';
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
    const minutes=Number(parts.find(p=>p.type==='hour').value)*60+Number(parts.find(p=>p.type==='minute').value);
    return minutes>=end?'late':minutes>=start?'active':'upcoming';
}
