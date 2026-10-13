export function normalizePhone(value) {
    let number = String(value || '').replace(/\D/g,'');
    if(number.startsWith('0090')) number=number.slice(2);
    if(number.length===11 && number.startsWith('0')) number='9'+number;
    if(number.length===10) number='90'+number;
    return /^90\d{10}$/.test(number) ? number : '';
}
export const localPhone = value => { const number=normalizePhone(value); return number ? '0'+number.slice(2) : ''; };
export const contactPhones = service => [...new Set([service.phone,...(service.phones || [])].map(normalizePhone).filter(Boolean))];
export const whatsappUrl = (phone,text) => { const number=normalizePhone(phone); return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : ''; };
export async function copyText(text) {
    if(!text) return false;
    try { await navigator.clipboard.writeText(text); return true; } catch {
        const input=document.createElement('textarea'); input.value=text; input.style.position='fixed'; input.style.opacity='0';
        const focused=document.activeElement; document.body.appendChild(input); input.select();
        let copied=false; try { copied=document.execCommand('copy'); } catch { copied=false; }
        input.remove(); focused?.focus(); return copied;
    }
}
export function messageTemplates(service,name) {
    const intro=`Merhaba, ben Bosch Siemens Profilo yetkili servisinden teknisyen ${name || ''}.`;
    const slot=service.timeSlot && service.timeSlot!=='Saatsiz' ? ` ${service.timeSlot.replace('/', '–')} saatleri arasında` : '';
    return [
        {id:'arrival',name:'Müsaitlik sor',text:`${intro}\n\nBugün${slot} için servis kaydınız bulunuyor. Size gelmeden önce müsaitliğinizi teyit etmek istiyorum. Evde misiniz?`},
        {id:'door',name:'Kapıdayım',text:`${intro}\n\nŞu an adresinizdeyim. Müsaitseniz zili çalacağım.`},
        {id:'delay',name:'Gecikme bilgisi',text:`${intro}\n\nÖnceki işlem uzadığı için gecikiyorum. Geliş saatim netleşince size bilgi vereceğim. Anlayışınız için teşekkür ederim.`},
        {id:'photo',name:'Fotoğraf / video iste',text:`${intro}\n\nSorunu daha iyi anlayabilmem için cihazın model etiketinin ve sorunlu bölümün net fotoğraflarını paylaşabilir misiniz? Ses veya çalışma sorunu varsa kısa bir video da yardımcı olur. Teşekkür ederim.`},
        {id:'postpone',name:'Yeni randevu konuş',text:`${intro}\n\nServis ziyaretimiz için yeni bir gün belirlememiz gerekiyor. Size uygun gün ve saat aralığını paylaşabilir misiniz? Randevu netleşince bilgi vereceğiz.`},
    ];
}
