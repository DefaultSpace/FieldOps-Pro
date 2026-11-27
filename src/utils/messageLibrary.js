// New, editable drafts based on the supplied case requirements; not historical quotations.
const photo = complaint => `{{cihaz}} için ${complaint} şikâyetinize ilişkin ilgili bölgenin yakın ve genel görünümünü paylaşabilir misiniz? Görseller üzerinden ön değerlendirme yaparak sonraki adım hakkında bilgi verebiliriz.`;
const groups = {
    'Çamaşır makinesi': [
        ['Genel paslanma', photo('paslanma')],
        ['Deterjan çekmecesi altında paslanma', photo('deterjan çekmecesi altında paslanma')],
        ['Ön sac paslanması', photo('ön sacda paslanma')],
        ['Boya kalkması ve kabarması', photo('boya kalkması veya kabarması')],
        ['Kapaktan su akıtma', 'Su akıtma şikâyetinizi değerlendirebilmemiz için suyun aktığı bölgenin ve ön kapak lastiğinin fotoğraflarını paylaşabilir misiniz?'],
        ['Kapak lastiği yırtılması', photo('kapak lastiği')],
        ['Kapak lastiği kopması veya çıkması', photo('kapak lastiğinin kopması veya yerinden çıkması')],
        ['Kapak lastiğinde küflenme', photo('kapak lastiğinde küflenme')],
        ['Köpük simgesi ve fazla köpük uyarısı', 'Ekranda görünen köpük uyarısını değerlendirebilmemiz için ekranın fotoğrafını ve kullandığınız programı paylaşabilir misiniz? Modele uygun açıklama için cihazınızın model bilgisine de ihtiyacımız var.', true],
        ['Ayak / kapak bağlantı parçası', 'Talep ettiğiniz ayak veya bağlantı parçasını doğru belirleyebilmemiz için ilgili bölümün yakın ve genel fotoğraflarını paylaşabilir misiniz? Fiyat ve stok bilgisi kontrol edildikten sonra size dönüş yapılabilir.'],
    ],
    'Bulaşık makinesi': ['Genel paslanma', 'Sepet paslanması', 'Sürgülü ray paslanması', 'Boya ve yüzey sorunları', 'Sepet / ray sorunu'].map(x=>[x,photo(x.toLocaleLowerCase('tr-TR'))]),
    'Buzdolabı': [
        ['Gövdede paslanma',photo('gövdede paslanma')], ['Boya atması',photo('boya atması')],
        ['Kapak lastiği sorunu','Hangi kapının lastiğinde sorun olduğunu belirterek ilgili bölgenin fotoğrafını paylaşabilir misiniz? Değerlendirme sonrasında yapılabilecek işlemler ve varsa parça fiyatı hakkında bilgi verebiliriz.'],
        ['İç aydınlatmanın çalışmaması','Soğutmada da bir sorun var mı, yoksa yalnızca iç aydınlatma mı çalışmıyor? Aydınlatma bölümünün fotoğrafını paylaşabilir misiniz? Model bilgisi eksikse cihaz etiketinin fotoğrafını da rica edeceğim.'],
        ['LED aydınlatma değişimi bilgisi','İç aydınlatma için modele uygun parçanın ve uygulanacak işlemin kontrol edilmesi gerekiyor. Model bilgisi ve inceleme sonucuna göre fiyat ve garanti kapsamı hakkında bilgi verebiliriz.',true],
    ],
    'Kurutma makinesi': [
        ['Gider bağlıyken su haznesinin dolması','Gider hortumu bağlıyken haznede su birikmesiyle ilgili bildiriminizi aldık. Ne sıklıkla dolduğunu, varsa ekrandaki uyarıyı ve model etiketinin fotoğrafını paylaşabilir misiniz? Çalışma biçimini modelinize göre değerlendirerek bilgi verebiliriz.',true],
        ['Conta ve lastik kopması','Hangi conta veya lastik bölümünde sorun olduğunu belirterek ilgili kısmın fotoğrafını paylaşabilir misiniz?'],
        ['İlgili bölümün fotoğrafı',photo('bildirdiğiniz sorun')],
    ],
    'Fırın': [['İç aydınlatma / lamba sorunu','İç aydınlatma şikâyetinizi değerlendirebilmemiz için model bilgisini ve sorunun hangi durumda oluştuğunu paylaşabilir misiniz?'],['Kapak camı üzerindeki parça','Kapak camı üzerinde talep ettiğiniz parçanın fotoğrafını paylaşabilir misiniz? Parçayı belirledikten sonra fiyat ve stok bilgisi hakkında dönüş yapabiliriz.'],['Parça fotoğrafı isteme','İhtiyaç duyduğunuz parçanın ve cihaz üzerindeki yerinin fotoğrafını paylaşabilir misiniz?']],
    'Ocak': ['Boya atması','Ön panel yüzey sorunları'].map(x=>[x,photo(x.toLocaleLowerCase('tr-TR'))]),
    'Şarjlı süpürge': [
        ...['Bataryanın çabuk bitmesi','Kısa kullanım süresi','Batarya performansı değerlendirmesi'].map(x=>[x,'Kullanım süresini değerlendirebilmemiz için kullandığınız güç modunu, başlığı, zemin türünü ve yaklaşık çalışma süresini paylaşabilir misiniz? Model farklılıklarını kontrol edebilmek için cihaz etiketinin net fotoğrafını da rica edeceğim. İnceleme öncesinde batarya değişimi veya ücretsiz işlem sözü veremiyoruz.',true]),
        ['Çalışırken durması','Cihazın hangi güç modunda ve yaklaşık ne kadar süre sonra durduğunu, varsa uyarısını paylaşabilir misiniz? Modele göre değerlendirme yapabilmemiz için cihaz etiketinin fotoğrafını da rica edeceğim.'],
        ['Model etiketi ve fatura isteme','Müsait olduğunuzda cihazınızın model etiketinin ve faturasının net fotoğraflarını paylaşabilir misiniz? Model ve garanti kapsamını kontrol ederek sonraki adım hakkında sizi bilgilendirebiliriz.'],
    ],
    'Genel servis işlemleri': [
        ['Cihaz etiketi isteme','Cihazınızın model ve üretim bilgilerinin okunabildiği etiketin net bir fotoğrafını paylaşabilir misiniz?'],
        ['Fatura isteme','Garanti süresi ve kapsamını değerlendirebilmemiz için cihazınızın faturasının okunaklı bir fotoğrafını paylaşabilir misiniz?'],
        ['Arıza fotoğrafı isteme','Bildirdiğiniz sorunun bulunduğu bölgenin hem yakından hem genel görünümünü gösteren fotoğraflarını paylaşabilir misiniz?'],
        ['Parça fotoğrafı isteme','Talep ettiğiniz parçanın ve cihaz üzerindeki yerinin fotoğrafını paylaşabilir misiniz?'],
        ['Parça fiyatı ve stok bilgisi','{{parça}} için kontrol ettiğimiz fiyat: {{fiyat}}. Stok durumu: {{stok}}. İşlem için onayınızı rica ediyoruz.'],
        ['Parça siparişi bilgilendirmesi','{{parça}} için sipariş durumu: {{sipariş_durumu}}. Teslim ve ziyaret bilgileri netleştiğinde size dönüş yapacağız.'],
        ['Parça bekleme süreci','{{parça}} için bekleme süreci devam ediyor. Güncel bilgi: {{bilgi}}. Ziyaret planı netleştiğinde size bilgi vereceğiz.'],
        ['Merkez değerlendirmesi','Başvurunuzun değerlendirme durumu: {{değerlendirme}}. Sonraki adım hakkında sizi bilgilendireceğiz.'],
        ['Ücretsiz parça değişimi','{{parça}} değişimini, bu başvuru için tarafınıza ilettiğimiz karar doğrultusunda ücretsiz gerçekleştireceğiz. Planlanan ziyaret: {{tarih}}.'],
        ['Ücretli parça değişimi','{{parça}} değişimi için ilettiğimiz toplam tutar: {{fiyat}}. Onayınız sonrasında ziyaret planını birlikte netleştirebiliriz.'],
        ['Atölyeye cihaz alımı','Cihazınızın atölyeye alınması için planlanan zaman: {{tarih}}. Bu zamanda uygun olup olmadığınızı paylaşabilir misiniz?'],
        ['Randevu bilgilendirmesi','Servis ziyaretiniz {{tarih}} için planlanmıştır. Bu zamanda müsait olduğunuzu teyit edebilir misiniz?'],
        ['Randevu değişikliği','Servis ziyaretiniz için önerdiğimiz yeni zaman: {{tarih}}. Sizin için uygun mudur?'],
        ['Gecikme bilgilendirmesi','Servis ziyaretimizde gecikme yaşanıyor. Güncel bilgi: {{bilgi}}. Anlayışınız için teşekkür ederim.'],
        ['Yoldayım mesajı','Servis ziyaretiniz için yola çıktım. Adresinizde müsait olduğunuzu teyit edebilir misiniz?'],
        ['Müsaitlik sor','Servis ziyaretiniz öncesinde müsaitliğinizi teyit etmek istiyorum. Evde misiniz?'],
        ['Kapıdayım','Şu an adresinizdeyim. Müsaitseniz zili çalacağım.'],
    ],
};
export const defaultReasons = ['Müşteri evde yok','Telefona cevap vermiyor'];
export function defaultLibrary() {
    return Object.entries(groups).map(([name,rows],i)=>({id:`device-${i}`,name,templates:rows.map(([title,body,technicalReview=false],j)=>({id:`template-${i}-${j}`,title,body,technicalReview,enabled:true}))}));
}
export const variables = text => [...new Set([...text.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)].map(m=>m[1]))];
export function renderMessage(body, values, brand, introduction=true) {
    const missing=variables(body).filter(key=>!String(values[key]||'').trim());
    if(introduction && !brand.trim()) missing.push('marka');
    const text=body.replace(/\{\{\s*([^{}]+?)\s*\}\}/g,(_,key)=>String(values[key]||'').trim());
    return {missing,text:(introduction?`Merhaba ${brand.trim()} Yetkili Servisi’nden ulaşıyorum\n\n`:'')+text};
}
export function knownBrand(service) {
    const explicit=String(service.brand || String(service.device||'').split('|')[0]).trim();
    return /^(Bosch|Siemens|Profilo)$/i.test(explicit)?explicit:'';
}
export function validatePreferences(value) {
    if(!value || value.version!==1 || !Array.isArray(value.reasons) || !Array.isArray(value.library)) throw new Error('Geçersiz mesaj ve erteleme ayarları.');
    const string=(x,max)=>typeof x==='string' && x.trim().length>0 && x.length<=max;
    if(value.reasons.length>100 || value.reasons.some(x=>!string(x,200)) || value.library.length>100) throw new Error('Geçersiz kategori veya sebep.');
    const ids=new Set();
    for(const g of value.library) {
        if(!g || !string(g.id,200) || ids.has(g.id) || !string(g.name,100) || !Array.isArray(g.templates) || g.templates.length>200) throw new Error('Geçersiz mesaj kategorisi.');
        ids.add(g.id);
        for(const t of g.templates) {
            if(!t || !string(t.id,200) || ids.has(t.id) || !string(t.title,150) || !string(t.body,10000) || typeof t.enabled!=='boolean' || typeof t.technicalReview!=='boolean') throw new Error('Geçersiz mesaj şablonu.');
            ids.add(t.id);
        }
    }
    return {version:1,reasons:[...value.reasons],library:value.library.map(g=>({id:g.id,name:g.name,templates:g.templates.map(t=>({id:t.id,title:t.title,body:t.body,enabled:t.enabled,technicalReview:t.technicalReview}))}))};
}
export const defaultPreferences = () => ({version:1,reasons:[...defaultReasons],library:defaultLibrary()});
