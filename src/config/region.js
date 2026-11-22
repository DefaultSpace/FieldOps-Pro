export const REGION = {
    name: 'Avcılar',
    city: 'İstanbul',
    neighborhoods: [
        'Gümüşpala', 'Denizköşkler', 'Merkez', 'Ambarlı', 'Cihangir',
    ],
};

export const regionKey = value => String(value || '').normalize('NFKC').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/\s/g, '');
export const serviceNeighborhood = value => REGION.neighborhoods.find(name => regionKey(name) === regionKey(value)) || '';
export const isServiceArea = (mahalle, district = REGION.name) => Boolean(serviceNeighborhood(mahalle)) && (!district || regionKey(district) === regionKey(REGION.name));
