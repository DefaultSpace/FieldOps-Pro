import { dayKey } from './workflow.js'
export const REGIONS = {
    'Başakşehir': ['Altınşehir', 'Güvercintepe', 'Şahintepe'],
    'Parseller': ['Mustafa Kemal Paşa', 'Yeşilkent', 'Üniversite'],
    'Avcılar': ['Merkez', 'Denizköşkler', 'Gümüşpala', 'Ambarlı', 'Cihangir']
};
export const KNOWN_MAHALLE = {
    'altınşehir': 'Altınşehir',
    'altinsehir': 'Altınşehir',
    'güvercintepe': 'Güvercintepe',
    'guvercintepe': 'Güvercintepe',
    'şahintepe': 'Şahintepe',
    'sahintepe': 'Şahintepe',
    'mustafa kemal paşa': 'Mustafa Kemal Paşa',
    'mustafa kemal pasa': 'Mustafa Kemal Paşa',
    'yeşilkent': 'Yeşilkent',
    'yesilkent': 'Yeşilkent',
    'üniversite': 'Üniversite',
    'universite': 'Üniversite',
    'merkez': 'Merkez',
    'denizköşkler': 'Denizköşkler',
    'denizkoskler': 'Denizköşkler',
    'gümüşpala': 'Gümüşpala',
    'gumuspala': 'Gümüşpala',
    'ambarlı': 'Ambarlı',
    'ambarli': 'Ambarlı',
    'cihangir': 'Cihangir',
    'firuzköy': 'Firuzköy',
    'firuzkoy': 'Firuzköy',
    'tahtakale': 'Tahtakale',
};
export function formatMahalle(value) {
    if (!value) return '';
    const trimmed = String(value).trim();
    if (!trimmed) return '';
    const key = trimmed.toLocaleLowerCase('tr-TR');
    if (KNOWN_MAHALLE[key]) return KNOWN_MAHALLE[key];
    return trimmed
        .split(/\s+/)
        .map(word => word ? word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR') : '')
        .join(' ');
}
export const completionDay = service => dayKey(service.completedAt || service.createdAt);
export function surveyMessage(service, name) {
    const device = String(service.device || '').split('|').map(part => part.trim()).filter(Boolean).find(part => !/^(bosch|siemens|profilo)$/i.test(part)) || '';
    const job = String(service.jobType || '').trim().toLocaleLowerCase('tr-TR');
    const action = { 'onarım': 'onarımı', 'montaj': 'montajı', 'bakım': 'bakımı', 'kontrol': 'kontrolü' }[job] || job;
    const operation = [device, action].filter(Boolean).join(' ').toLocaleLowerCase('tr-TR') || 'cihazınızla ilgili işlem';
    return `Merhaba,\nBen Bosch Siemens Profilo servisinden teknisyen ${name}. Geçtiğimiz günlerde ${operation} için size servis hizmeti sağlamıştık.\n\nTelefonunuzun SMS bölümüne markamız adına bir memnuniyet anketi gelmiş olabilir. Hizmetimizden memnun kaldıysanız ankette bize 10 puan vererek destek olmanız bizi çok mutlu eder. Değerlendirmeniz bizim için çok değerli.\n\nCihazınızla ilgili herhangi bir sorunuz olursa bu numaradan benimle iletişime geçebilirsiniz.\n\nDesteğiniz için şimdiden teşekkür eder, iyi günler dilerim.`;
}

