import { dayKey } from './workflow.js'
export const REGIONS = {
    'Başakşehir': ['Altınşehir', 'Güvercintepe', 'Şahintepe'],
    'Parseller': ['Mustafa Kemal Paşa', 'Yeşilkent', 'Üniversite'],
    'Avcılar': ['Merkez', 'Denizköşkler', 'Gümüşpala', 'Ambarlı', 'Cihangir']
};
export const completionDay = service => dayKey(service.completedAt || service.createdAt);
export function surveyMessage(service, name) {
    const device = String(service.device || '').split('|').map(part => part.trim()).filter(Boolean).find(part => !/^(bosch|siemens|profilo)$/i.test(part)) || '';
    const job = String(service.jobType || '').trim().toLocaleLowerCase('tr-TR');
    const action = { 'onarım': 'onarımı', 'montaj': 'montajı', 'bakım': 'bakımı', 'kontrol': 'kontrolü' }[job] || job;
    const operation = [device, action].filter(Boolean).join(' ').toLocaleLowerCase('tr-TR') || 'cihazınızla ilgili işlem';
    return `Merhaba,\nBen Bosch Siemens Profilo servisinden teknisyen ${name}. Geçtiğimiz günlerde ${operation} için size servis hizmeti sağlamıştık.\n\nTelefonunuzun SMS bölümüne markamız adına bir memnuniyet anketi gelmiş olabilir. Hizmetimizden memnun kaldıysanız ankette bize 10 puan vererek destek olmanız bizi çok mutlu eder. Değerlendirmeniz bizim için çok değerli.\n\nCihazınızla ilgili herhangi bir sorunuz olursa bu numaradan benimle iletişime geçebilirsiniz.\n\nDesteğiniz için şimdiden teşekkür eder, iyi günler dilerim.`;
}

