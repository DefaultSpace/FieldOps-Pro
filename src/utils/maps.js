export const districtFor = (mahalle, district = '') => district || (/altınşehir|güvercintepe|şahintepe/.test(String(mahalle).toLocaleLowerCase('tr-TR')) ? 'Başakşehir' : 'Avcılar');
export function navigationAddress(address, mahalle = '', district = '') {
    // Keep building/site names; remove phone, floor and flat fields only.
    const street = String(address || '').replace(/(?:\+?90)?\s*\(?0?5\d{2}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g, '')
        .replace(/\b(?:daire|kat|d|k)\s*[:.]?\s*(?:\d+|zemin(?:\s+kat)?|z)\b/gi, '')
        .replace(/\b(?:cad|cd)\./gi, 'Caddesi').replace(/\b(?:sok|sk)\./gi, 'Sokak').replace(/\s+/g, ' ').trim();
    return [street, mahalle && `${mahalle} Mahallesi`, districtFor(mahalle,district), 'İstanbul', 'Türkiye'].filter(Boolean).join(', ');
}
export function validCoordinates(value) {
    return !!value && Number.isFinite(value.lat) && Number.isFinite(value.lng) && Math.abs(value.lat) <= 90 && Math.abs(value.lng) <= 180;
}
export function getMapsSearchUrl(address, mahalle = '', coordinates = null, district = '') {
    const destination = validCoordinates(coordinates) ? `${coordinates.lat},${coordinates.lng}` : navigationAddress(address, mahalle, district);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}
export const getMapsRouteUrl = addresses => {
    if (!addresses?.length) return '';
    const formatted = addresses.map(a => typeof a === 'string' ? navigationAddress(a) : validCoordinates(a.coordinates) ? `${a.coordinates.lat},${a.coordinates.lng}` : navigationAddress(a.navigationAddress || a.address, a.mahalle, a.district));
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatted.at(-1))}&waypoints=${encodeURIComponent(formatted.slice(0, -1).join('|'))}&travelmode=driving`;
};

