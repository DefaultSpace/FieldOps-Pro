# FieldOps Pro

Saha teknisyenleri için eCom listesinden çalışan günlük iş takip yardımcısı. eCom; resmi fiş, fotoğraf, imza ve stok işlemlerinin yapıldığı sistem olmaya devam eder.

## Kullanım

- Teknisyen adını kaydet; bölge isteğe bağlıdır.
- Tablette eCom listesini kopyala, FieldOps içindeki “eCom listesini aktar” alanına yapıştır.
- Aktarım uyarılarını ve yeni/güncellenen/arşivden dönen fiş sayılarını kontrol et.
- Saat ve mahalleye göre işleri takip et. Numara kopyalama, düzenlenebilir WhatsApp mesajları, iş/malzeme notları ve harita bağlantısı kullan.
- Fotoğrafları eCom’a yükleyip resmi fişi orada kapat. FieldOps’ta Tamamla seçeneği yalnızca yerel kaydı tamamlar.
- Tamamlananlar ve arşivde fişleri tarih/isim/adres/telefonla ara.
- Gün sonunda kapanan işleri arşivle; bitmemiş işler listede kalır. Düzenli olarak JSON yedeği indir.

Prim ve satış takibi kaldırıldı. Uygulama saha işlerine odaklanır.

Saat sırası: 10–12 (öncelikli), 12–14, 14–16, 16–18, 18–20, saatsiz. Avcılar profiline özel mahalle bölümleri ve Gümüşpala 10–12 uyarısı bulunur. Mahalle filtresi, seçilen mahallenin bütün saatlerini birlikte gösterir.

## Veri davranışı

Kayıtlar aynı tarayıcının `routex-persist-v1` alanında tutulur; mevcut veri anahtarı değiştirilmez. Sunucu hesabı veya otomatik cihaz eşitlemesi yoktur. Sürüm 3 JSON yedekleri fiş geçmişini ve günlük işlemleri içerir; eski yedekler de okunur. Geri yükleme mevcut fişleri koruyarak yalnızca eksikleri ekler. Aynı fişin notlarını cihazlar arasında otomatik birleştirmez. Silinen son kayıt grubu açık oturumda geri alınabilir; silme arşive taşımaz.

Aktarım, silme, arşivleme ve yedek birleştirmeden önce son durum `fieldops-checkpoint` içinde saklanır. “İşlem öncesi kopyadan eksikleri kurtar” silinmiş kayıtları ekler, mevcut kayıtları eski sürüme çevirmez. Son işlem önceki kurtarma kopyasının yerini alır. Bu kopya aynı tarayıcıdadır; tarayıcı temizliğine karşı günlük indirilen yedek gerekir.

eCom aktarımı arşivde bulunan fişi bekleyen olarak geri açar; notlar, önceki tamamlanma zamanı ve işlem geçmişi korunur. Aktif fişin mevcut durumu korunur. Elle seçilen randevu saatini yeni aktarım değiştirmez; kaynak saat ayrıca tutulur ve “eCom saatine dön” ile seçilebilir. Kaynak listede olmayan işler kendiliğinden silinmez.

## Saha V2

- Aktarım önizlemesi bağımsız 7–12 rakamlı fiş adaylarını, okunabilen ve reddedilen kayıtları sayar. Bozuk saat ve eksik kayıtlar ham metniyle görünür. İsteğe bağlı eCom ekran toplamı eksik kopyalamayı denetler. Uyarılarda açık onay gerekir; aktarım sonrası fişlerin aktif listede olduğu doğrulanır. Metinde hiç bulunmayan fişler, kaynak toplamı girilmeden saptanamaz; tek başına yazılmış telefon/malzeme numarası da aday sayılabilir.
- Sabah kontrolü 10–12 önceliğini ve saat sırasını korur; aynı dilimde seçilen mahalleyi önerir. Yol süresi hesaplanmaz. Parça bekleyen ve “Sonra gel” zamanı gelmeyen işler önerilmez.
- Malzeme kodu, adet, müşteri ve fiş eşleşmesiyle günlük araç hazırlık listesi vardır. Hazırlık işareti kullanım miktarından ayrıdır ve her gün yenilenir; eCom stoğunu değiştirmez.
- Kartlar küçültülebilir, fiş numarası tek dokunuşla kopyalanabilir. İletişim ve parça bekleme durumu, elle randevu seçimi, geçmiş ve notlar ikincil işlemlerde bulunur. Büyük yazı seçimi “Görünüm ayarları”ndadır.
- Ana ekranın “İptal edilenler” sekmesi iptalleri, “Tamamlananlar” tüm tamamlanmış fişleri tarihleriyle, “Arşiv” aktif listeden çıkarılmış kayıtları gösterir.
- Tamamlama, tekrar açma, erteleme, iptal, parça bekleme, iletişim, not/saat değişiklikleri ve silme günlük geçmişte izlenebilir. Önceden tutulmamış geçmiş geriye dönük oluşturulamaz; eski fişin bilinen tamamlanma zamanı korunur.
- Benzer müşteri/telefon ve adres yazımları kontrol için işaretlenir; daire farkları korunur, otomatik belirsiz eşleştirme yapılmaz.

## Çevrimdışı kullanım ve adres

Üretim sürümü HTTPS üzerinde bir kez açılıp **“Çevrimdışı açılış hazır”** göründükten sonra aynı cihaz/tarayıcıda bağlantısız yeniden açılabilir. Uygulama dosyaları sürüme göre önbelleğe alınır; kayıtlar mevcut yerel depoda kalır. Yeni sürüm bulunduğunda açık formları kaydedip “Güncelle ve yeniden aç” seçilmelidir. Tarayıcının depolamayı temizlemesi/boşaltması çevrimdışı dosyaları ve kayıtları kaldırabilir. Geliştirme sunucusu (`npm run dev`) önbellek oluşturmaz; üretim paketiyle test edin.

Uygulama kapalıyken zamanında bildirim garantisi yoktur. Geciken hatırlatıcı açılışta görünür. WhatsApp ve harita bağlantı gerektirir; mesajı kullanıcı gönderir. **Google Maps adres davranışı değiştirilmedi: `Başaran sok no 12`.** Mevcut temizleyici kat/daireyi çıkarır, mahalle/ilçe eklemez; kayıtlı koordinat ve otomatik yol tarifi kullanılmaz. Rota optimizasyonu veya adres doğrulaması yapılmaz.

`legacy/UZERINE_TIKLA_CALISTIR.html` tarihî bağımsız sürümdür; üretim paketine alınmaz. Güncel sürüm `src/` altındaki React uygulamasıdır. Kullanılmayan Leaflet, sürükle-bırak ve date-fns bağımlılıkları kaldırılmıştır.

## Geliştirme

```sh
npm ci
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

GitHub Pages paketi: `npm run build` (`/FieldOps-Pro/`). Sites kök alan adı: `SITE_DEPLOY=1 npm run build`.

Tarayıcı testi yalnızca sentetik müşteri kayıtları kullanır; aktarım, saha işlemleri, çevrimdışı yeniden açılış, geçmiş, kurtarma ve cihazlar arası yedek aktarımını denetler. Ekran görüntüleri ve test yedeği `test-artifacts/` altında, Git dışında kalır. Yerel Chrome için `FIELDOPS_CHROME` ile çalıştırılabilir. PR kontrolü lint, birim testleri, üretim derlemesi ve Chromium senaryosunu çalıştırır.

[13 Ekim 2026 saha inceleme ve değişiklik raporu](docs/SAHA-INCELEME-2026-10-13.md)

[Güncel saha düzenlemesi](docs/SAHA-DUZENLEME-2026-10-13.md)
