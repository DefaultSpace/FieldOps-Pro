# FieldOps Pro

Avcılar / İstanbul’da kendi günlük saha işlerimi takip etmek için kullandığım kişisel araç. Tek kişinin günlük kullanımı için tasarlanmıştır. Kullanıcı hesabı, backend veya eCom entegrasyonu yoktur. Tarayıcı ve telefondaki Android uygulaması ayrı yerel depolar kullanır. Android sürümünde mevcut kişisel Galaxy Watch bağlantısı korunur; tarayıcı ile telefon arasında otomatik veri eşitlemesi yoktur.

Çalışma alanı: **Gümüşpala, Denizköşkler, Merkez, Ambarlı ve Cihangir**. Bölge seçilmez; mahalle listesi `src/config/region.js` içinde tutulur.

## Günlük kullanım

1. Hazır müşteri mesajlarında kullanılacak ismini kaydet.
2. eCom listesini kopyalayıp “eCom listesini aktar” alanına yapıştır.
3. Önizlemede aktarılacak, hatalı ve bölge dışı atlanan fiş sayılarını kontrol et. Eksik kopyalamayı denetlemek için eCom ekranındaki toplamı girebilirsin.
4. İşleri saat ve mahalleye göre takip et. Karttan telefon/adres kopyala, WhatsApp mesajını düzenle veya haritayı aç. Ayrıntılardan iş notu, erteleme ve iptal işlemlerine ulaş.
5. Eksik kalan işi “Tek fiş ekle” ile ekle; yalnızca beş mahalleden biri seçilebilir.
6. Fotoğraf, imza, stok ve resmi fiş kapatma işlemlerini eCom’da yap. Buradaki “Tamamla” yalnızca yerel kaydı tamamlar.
7. Gün sonunda tamamlanan ve iptal edilen fişleri arşivle; bitmemiş işler listede kalır. JSON yedeğini indir ve dosyanın indirildiğini kontrol et.

10–12 randevuları önce, ardından diğer saatler ve saatsiz işler gelir. Açık 10–12 Gümüşpala ziyaretleri ayrıca hatırlatılır. Arama isim, telefon, adres ve fiş numarasıyla çalışır. Plan, malzeme hazırlığı ve işlem geçmişi gerektiğinde açılır. Yazı boyutu “Görünüm ayarları”ndan değiştirilir.

## Aktarım ve mevcut kayıtlar

- Beş mahalle dışındaki, ilçesi farklı olan veya mahallesi belirlenemeyen eCom kayıtları `ignored: true` ile ayrılır; uyarı onayı gerektirmeden atlanır. Hatalı saat ve eksik kayıtlar ayrıca gösterilir.
- Elle kayıt ve kayıt katmanından doğrudan aktarım da aynı bölge kontrolünü kullanır.
- Yeniden aktarım aktif fişin durumunu, notlarını ve elle seçilmiş randevusunu korur. Kaynak saat ayrıca saklanır. Arşivden gelen fiş geçmişiyle yeniden açılır.
- Yeni listede görünmeyen fişler silinmez. Önceden kaydedilmiş bölge dışı fişler de silinmez veya gizlenmez; bunların notlarına, geçmişine ve arşivine erişim sürer.
- Eski bölge ayarı Avcılar’a dönüştürülür; teknisyen adı ve kayıtlar korunur. Yedekten kurtarma bölge filtresi nedeniyle eski fişleri düşürmez.

## Veriyi koruma

Kayıtlar aynı tarayıcının `routex-persist-v1` alanında tutulur. Veri sunucuya gönderilmez. Tarayıcı depolaması şifreli bir kasa değildir; cihaz kilidini kullan ve indirdiğin müşteri verilerini koru.

Aktarım, elle ekleme, silme, gün sonu arşivleme ve yedek birleştirmeden önce `fieldops-checkpoint` kurtarma kopyası alınır. Son işlem önceki kopyanın yerini alır. “İşlem öncesi kopyadan eksikleri kurtar” eksik fişleri ekler; mevcut notların üzerine yazmaz. Son silme açık oturumda geri alınabilir.

Sürüm 3 JSON yedeği fişleri ve işlem geçmişini içerir; eski yedekler de okunur. Geri yükleme mevcut fişleri korur ve yalnızca eksikleri ekler. Yedek indirme isteğinin son zamanı İstanbul saatine göre görünür. Bu zaman dosyanın diske yazıldığının garantisi değildir; indirme başarısızsa yeniden dene.

Yerel kayıt hatası ekranda gösterilir. Okunamayan tarayıcı kaydının üzerine yazılmaz. Tarayıcı verilerini temizlemek hem fişleri hem yerel kurtarma kopyasını silebilir; indirilen JSON yedeği bu nedenle gereklidir.

## Çevrimdışı kullanım

Üretim sürümü HTTPS üzerinde bir kez açılıp **“Çevrimdışı açılış hazır”** göründükten sonra aynı cihaz/tarayıcıda bağlantısız yeniden açılabilir. Notlar yerelde kaydedilir. Yeni sürüm hazır olduğunda açık not ve formları kaydedip “Güncelle ve yeniden aç” seçilir.

WhatsApp ve harita bağlantı gerektirir; mesajı kendin gönderirsin. Web/PWA kapalıyken yerel alarm çalışmaz; geciken hatırlatıcı açılışta gösterilir. Android 0.3.0 sürümünde Sonra gel, kalıcı yerel Android alarmı kullanır; bildirim ve kesin alarm izinleri gerekir. Harita araması bina numarasını korur, kat/daireyi çıkarır. Otomatik rota veya konum doğrulaması yapılmaz.

## Geliştirme ve kontrol

```sh
npm ci
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

GitHub Pages paketi `/FieldOps-Pro/` yolunu kullanır. Kök alan adı için `SITE_DEPLOY=1 npm run build` kullanılabilir. Yerel Chrome ile test için `FIELDOPS_CHROME` ayarlanabilir.

Tarayıcı testleri sentetik kayıtlarla aktarım, elle kayıt, kişisel ayarlar, çevrimdışı yeniden açılış/not düzenleme, güncelleme, yedekleme ve kurtarmayı denetler. Test dosyaları `test-artifacts/` altında Git dışında kalır. `legacy/UZERINE_TIKLA_CALISTIR.html` eski bağımsız sürümdür; güncel üretim paketine alınmaz.

[İlk teknik notlar](docs/SAHA-INCELEME-2026-10-13.md) · [Güncel kişisel kullanım notları](docs/SAHA-DUZENLEME-2026-10-13.md)

## Telefonda kurulu FieldOps Pro

Android uygulamasının kaynakları `android-mini/` altındadır. Sürüm 0.3.0, güncel kişisel kullanım ekranlarını APK içinde taşır; GitHub Pages yayını telefondaki APK’yı otomatik güncellemez. Sürüm bilgisi uygulamanın durum satırında görünür.

APK güncellemesi için önce JSON yedeği alınır. `npm run build:mini` ile ekranlar paketlenir, ardından aynı imzalama anahtarı ve `com.fieldops.mini` kimliğiyle yeni APK üretilip mevcut uygulamanın üzerine kurulur. Uygulama kaldırılmaz veya verileri temizlenmez. Özel imzalama anahtarları ve gerçek müşteri yedekleri Git’e eklenmez.

[Android derleme ve kişisel saat bağlantısı](docs/FIELDOPS-MINI.md)

## Teknisyen V2

Sıradaki İş kartı, düzenlenebilir WhatsApp şablon kütüphanesi, iki başlangıç erteleme sebebi, dönemsel istatistikler ve beş sekmeli alt menü eklendi. Şablonlar/sebepler yedeğe dahildir. [Kullanım, doğrulama sonuçları ve cihaz kontrolü](docs/TEKNISYEN-V2.md).
