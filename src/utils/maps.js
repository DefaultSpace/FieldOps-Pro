export const districtFor = (mahalle, district = '') => district || (/altınşehir|güvercintepe|şahintepe/.test(String(mahalle).toLocaleLowerCase('tr-TR')) ? 'Başakşehir' : 'Avcılar');
export function navigationAddress(address, mahalle = '', district = '') {
    return [String(address || '').trim(), mahalle && `${mahalle} Mahallesi`, districtFor(mahalle,district), 'İstanbul', 'Türkiye'].filter(Boolean).join(', ');
}
export function validCoordinates(value) {
    return !!value && Number.isFinite(value.lat) && Number.isFinite(value.lng) && Math.abs(value.lat) <= 90 && Math.abs(value.lng) <= 180;
}
export function getMapsSearchUrl(address, mahalle = '', _coordinates = null, district = '') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(navigationAddress(address,mahalle,district))}`;
}
