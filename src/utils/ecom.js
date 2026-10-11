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
        const neighborhoodIndex = content.findIndex((line, i) => i >= 3 && /MAH(?:ALLESİ)?\s*[-–]/i.test(line));
        const fields = neighborhoodIndex >= 3
            ? [content[0], content[1], content.slice(2, neighborhoodIndex).join(' '), content[neighborhoodIndex], content[neighborhoodIndex + 1] || '']
            : [];
        const receiptNo = block[0];
        if (fields.length < 4 || !fields[1]?.includes('|')) { warnings.push(`${receiptNo}: Eksik kayıt; aktarılmadı.`); return; }
        if (seen.has(receiptNo)) { warnings.push(`${receiptNo}: Tekrarlanan fiş atlandı.`); return; }
        seen.add(receiptNo);
        const phoneMatches = (fields[4] || '').match(/(?:\+?90\s*)?\(?0?\d{3}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g) || [];
        const phones = phoneMatches.map(p => { const n = p.replace(/\D/g, ''); return n.length === 10 ? '90' + n : n.length === 11 && n[0] === '0' ? '9' + n : n; });
        const mahalle = fields[3].replace(/\s*MAH(?:ALLESİ)?\s*[-–].*$/i, '').trim();
        const match = block[1].match(/(\d{1,2}):\d{2}\s*[-–—]\s*(\d{1,2}):\d{2}/);
        const timeSlot = match ? `${Number(match[1])}/${Number(match[2])}` : 'Saatsiz';
        const flagStart = content.findIndex((line, i) => i > neighborhoodIndex && /^(Yeni|Devam|Açık|Kapalı)$/i.test(line));
        const flags = flagStart >= 0 ? content.slice(flagStart) : [];
        records.push({ receiptNo, name: fields[0], device: fields[1], address: fields[2], mahalle, phone: phones[0] || '', phones, timeSlot, warranty: flags[1] || '', jobType: flags[2] || '', addressWarning: !/\bno\s*[:.]?\s*\d/i.test(fields[2]) || !mahalle });
    });
    if (!starts.length) warnings.push('Fiş bulunamadı. eCom listesinin tamamını yapıştırın.');
    return { records, warnings };
}
export function mergeImported(services, archive, records, createId, now = Date.now(), isExtra = false) {
    const result = [...services];
    for (const record of records) {
        const index = result.findIndex(s => s.receiptNo === record.receiptNo);
        if (index >= 0) result[index] = { ...result[index], ...record };
        else if (!archive.some(s => s.receiptNo === record.receiptNo)) result.push({ ...record, id: createId(), createdAt: now, status: 'pending', plus: false, aksesuar: false, bakim: false, nps: null, notes: '', isExtra });
    }
    return result;
}
export function groupVisits(services) {
    const groups = new Map();
    services.forEach(s => {
        const key = [normalizeKey(s.name), normalizeKey(s.address), normalizeKey(s.mahalle)].join('|');
        if (!groups.has(key)) groups.set(key, { key, name: s.name, address: s.address, mahalle: s.mahalle, items: [] });
        groups.get(key).items.push(s);
    });
    return [...groups.values()];
}
export function earliestSlot(items) {
    return items.map(s => s.timeSlot).filter(s => /^\d+\/\d+$/.test(s)).sort((a, b) => Number(a.split('/')[0]) - Number(b.split('/')[0]))[0] || 'Saatsiz';
}
export function appointmentState(slot, date = new Date()) {
    if (!/^\d+\/\d+$/.test(slot)) return 'unscheduled';
    const [start, end] = slot.split('/').map(Number);
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
    const minutes = Number(parts.find(p => p.type === 'hour').value) * 60 + Number(parts.find(p => p.type === 'minute').value);
    return minutes >= end * 60 ? 'late' : minutes >= start * 60 ? 'active' : 'upcoming';
}
