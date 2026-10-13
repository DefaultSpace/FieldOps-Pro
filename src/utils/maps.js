export const districtFor = (mahalle, district = '') => district || (/altınşehir|güvercintepe|şahintepe/i.test(String(mahalle).toLocaleLowerCase('tr-TR')) ? 'Başakşehir' : 'Avcılar');

export function cleanMapsAddress(address) {
    if (!address) return '';
    let s = String(address).trim();
    // 1. Remove trailing district / city / country if already in address text
    s = s.replace(/[\s,/-]+(?:avc[ıi]lar|ba[şs]ak[şs]ehir|esenyurt|k[üu][çc][üu]k[çc]ekmece)?[\s,/-]*(?:[ıi]stanbul)?[\s,/-]*(?:t[üu]rkiye)?$/i, '');
    // 2. Format 'no12' or 'no:12' -> 'no 12'
    s = s.replace(/\bno[:.]?\s*(\d+)\b/gi, 'no $1');
    // 3. Remove slash apartment number: 'no 12/4' -> 'no 12', '12/4' -> '12'
    s = s.replace(/(\bno\s*\d+)\s*[\/]\s*\d+\b/gi, '$1');
    s = s.replace(/(\b\d+)\s*[\/]\s*\d+\b/gi, '$1');
    // 4. Remove floor / flat / apartment:
    // e.g. 'kat 2 daire 5', 'k:2 d:4', 'd:4', 'd4', 'daire 4', 'iç kapı no 4'
    s = s.replace(/[\s,/-]+(?:k(?:at)?\s*[:.]?\s*\d+)?\s*(?:d(?:aire)?|i[çc]\s*kap[ıi](?:\s*no)?)\s*[:.]?\s*\d+.*$/i, '');
    s = s.replace(/[\s,/-]+k(?:at)?\s*[:.]?\s*\d+.*$/i, '');
    s = s.replace(/[\s,/-]+d\s*[:.]?\s*\d+.*$/i, '');
    s = s.replace(/[\s,/-]+d\d+\b.*$/i, '');
    // 5. Clean up any trailing punctuation or spaces
    s = s.replace(/[\s,/-]+$/, '').trim();
    return s;
}

export function navigationAddress(address, mahalle = '', district = '') {
    const cleaned = cleanMapsAddress(address);
    if (cleaned) return cleaned;
    return [mahalle && `${mahalle} Mahallesi`, districtFor(mahalle, district)].filter(Boolean).join(', ');
}

export function validCoordinates(value) {
    return !!value && Number.isFinite(value.lat) && Number.isFinite(value.lng) && Math.abs(value.lat) <= 90 && Math.abs(value.lng) <= 180;
}

export function getMapsSearchUrl(address, mahalle = '', _coordinates = null, district = '') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(navigationAddress(address, mahalle, district))}`;
}
