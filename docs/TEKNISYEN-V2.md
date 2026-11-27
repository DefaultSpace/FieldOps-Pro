# Teknisyen V2 güncellemesi — 27 Kasım 2026

## Kullanım

- Alt menü: Bugün, Malzeme, Arşiv, İstatistikler, Ayarlar. Mevcut masaüstü araçları ve kart ayrıntıları korunur. Önceden var olan yazı boyutu tercihi Ayarlar'dan da erişilir; yeni tema veya yazı modu eklenmez.
- Sıradaki İş, mevcut `nextVisit` fonksiyonunu kullanır. Arama filtrelerinden bağımsızdır; gelecekteki Sonra gel kayıtlarını saati gelene kadar atlar. Mevcut saat/mahalle algoritması değiştirilmedi. Kaynak kodun mahalle sıralaması belgelerdeki sabit listeyle aynı değildir; bu güncelleme mevcut davranışı korur.
- WhatsApp: Sohbeti aç, Hazır mesaj oluştur ve mevcut kısa mesajlar. Şablon akışında cihaz/şikâyet elle seçilir, açıkça kayıtlı marka ön doldurulur. Belirsiz marka seçilir/yazılır. Mesaj önizlenir, düzenlenir, kopyalanır veya seçili numaranın WhatsApp sohbetine aktarılır; otomatik gönderim yoktur.
- Ayarlar'da kategori ve şablon ekleme, düzenleme, silme, sıralama ve etkinleştirme bulunur. Eksik varsayılanları geri getirmek kişisel metinlerin üzerine yazmaz. Alanlar `{{parça}}`, `{{tarih}}` gibi tanımlanır; boş alanla mesaj oluşturulmaz.
- Başlangıç erteleme sebepleri yalnızca “Müşteri evde yok” ve “Telefona cevap vermiyor”. Özel sebep yazılabilir. Düzenlenen liste telefon üzerinden saate eşitlenir; eski telefon verisiyle eşleşen yeni saat uygulaması bu iki varsayılanı kullanır.

## Mesaj kaynakları

Kullanıcının sağladığı `Teknisyen-v2.md`, `teknisyen-v2-fieldops-ornek-veri.md` ve `teknisyen_v2_ornekler.md` incelendi. İçlerindeki geçmiş kullanıcı/asistan talimatları bağımsız güncel komut sayılmadı. Şablonlar yeni, düzenlenebilir taslaklardır; eksik özgün mesajların yeniden bulunmuş kopyası olarak sunulmaz.

Köpük, kurutma su haznesi, LED ve batarya örneklerinde modele özgü teşhis veya garanti kararı genellenmedi. Bu şablonlar teknik doğrulama notu taşır; hazır metinler bilgi/fotoğraf istemeye odaklanır. Parça, fiyat, sipariş, ücretsiz işlem ve tarih alanları teknisyen tarafından doldurulur. Örnek müşteriler uygulamaya aktarılmaz. AI API, OCR, eCom entegrasyonu veya müşteri verisi alan yeni bir sunucu yoktur.

## Android hatırlatıcıları

Telefon ve saat APK sürümleri 0.3.0 / versionCode 3. Android telefon uygulaması, kalıcı yerel plan ve `AlarmManager`/`PendingIntent` kullanır. WebView/JavaScript açık kalmadan sistem bildirimi oluşturulabilir. Aynı ziyaret ve saatteki fişler tek hatırlatıcıya dönüşür. Saat değişikliği, Sonra gel iptali, tamamlama, erteleme ve silme planı günceller. Açılış, yeniden başlatma, uygulama güncellemesi ve alarm izni değişikliği planı yeniden kurar. Bildirim müşteriyi, mahalleyi, adresi ve ziyaret tarih/saatini içerir; dokunulduğunda ilgili kayıt açılır.

Bildirim izni ve kesin alarm özel erişimi kullanıcıdan istenir. Kesin alarm izni yoksa Android'in yaklaşık alarmı kullanılır ve arayüz gecikme ihtimalini bildirir. Bildirim izni kapalıysa teslim edilmiş sayılmaz. Zorla durdurulmuş uygulama yeniden açılmalıdır. Telefonun kapalı olması, üretici pil kısıtlamaları, DND ve kullanıcı bildirim ayarları gerçek teslimi etkiler.

Saat bildirimi telefon bildirimini Wear OS üzerinden yansıtır; `setLocalOnly(false)` kullanılır. Galaxy Wearable içinde FieldOps bildirimleri etkin olmalı. Saat uygulaması ayrı bir ikinci alarm üretmez. Saatte yapılan fiş işlemlerinin telefon uygulaması açıkken kaydedilmesi şeklindeki mevcut senkronizasyon korunur.

Web/PWA için kapalı tarayıcıda yerel alarm vaadi verilmez; mevcut açık uygulama uyarısı korunur. Android ve web depoları ayrı kalır.

Dayanak: [Android alarm planlama](https://developer.android.com/develop/background-work/services/alarms), [kesin alarm izinleri](https://developer.android.com/about/versions/14/changes/schedule-exact-alarms), [Wear OS bildirim yansıtma](https://developer.android.com/training/wearables/notifications/bridger).

## Veri ve istatistikler

Mevcut `routex-persist-v1` depolamasına `preferences` eklenir; eski fişler ve geçmiş değiştirilmez. Varsayılanlar eski depoya ilk açılışta sağlanır; kullanıcı tarafından silinen şablonlar sonraki açılışta yeniden eklenmez. Sürüm 3 JSON yedekleri tercihlerle genişletilir; sürüm 1/2/3 eski yedekler okunur. Tercih içeren yedek geri yüklenirken mevcut şablon/sebep ayarlarının değişeceği önizlemede açıklanır. Fiş birleştirme mevcut kayıtların üzerine yazmaz. Kurtarma kopyası da tercihleri içerir.

İstatistikler aktif ve arşiv kayıtlarını fiş kimliğiyle tekilleştirir. Tarihli tamamlanma geçmişi, yeniden açılmış fişleri de kapsar. Aynı müşteri/adres/mahallede aynı gün tamamlanan fişler tek ziyaret sayılır; fişler ayrıca tekil sayılır. Erteleme sayısı kaydedilmiş fiş-erteleme işlemleridir; tekrar erteleme ayrı olaydır. Haftalar pazartesi başlar, tüm sınırlar İstanbul saatidir. Ortalama takvim günü başınadır. Tamamlanma tarihi olmayan eski fişlere tarih uydurulmaz; hariç kalan sayı gösterilir. Geçmişte kaydedilmemiş işlem veya silinmiş kayıt için istatistik üretilmez.

## Doğrulama

- 72 JavaScript birim testi geçti; mevcut 64 test dahil.
- `npm run lint`, web üretim ve Android web paketleme derlemeleri geçti.
- Mevcut tarayıcı regresyonu geçti: aktarım, not, rota/saat, malzeme, çevrimdışı tekrar açılış, silme/kurtarma ve yedek.
- Yeni tarayıcı testi geçti: mobil sekmeler, Sıradaki İş, seçili alıcı, Türkçe karakterler, zorunlu alanlar, şablon/sebep kalıcılığı, devre dışı bırakma, istatistik, kayıt bağlantısı ve tercihlerle yedek geri yükleme.
- Mini köprü testi hem web hem paketlenmiş Android varlıkları üzerinde geçti; hatırlatıcı planı ve tamamlama sonrası iptal dahil.
- 6 Android alarm Robolectric testi geçti (API 30/33): etkinlik açılmadan kalıcı plan/boot, saat değişikliği/iptal, eski tetiklemenin reddi, bildirim içeriği/kayıt bağlantısı, çakışmayan alarm kimlikleri, kesin alarm izni reddi ve bildirim izni reddi/yeniden verme.
- Mevcut 8 ortak Android JUnit testi geçti.
- Telefon ve saat debug APK'ları derlendi; iki uygulamanın Android lint kontrolleri geçti.

Robolectric gerçek telefon testi değildir. Fiziksel telefon/saat bağlı olmadığından uygulamayı kapatıp bildirim alma, gerçek yeniden başlatma, pil tasarrufu ve Galaxy Watch Ultra'ya yansıma cihaz üzerinde doğrulanmadı.

## Cihazda son kontrol

1. Mevcut uygulamadan JSON yedeği al. APK'yı aynı imzayla mevcut uygulamanın üzerine kur; verileri silme.
2. Bildirim ve alarm izinlerini aç. İki dakika sonrasına Sonra gel kur; uygulamayı son uygulamalar ekranından kapat. Telefon bildiriminin içeriğini ve dokununca açılan kaydı kontrol et.
3. Saati değiştir; eski saatte bildirim gelmediğini kontrol et. Tamamlama ve silme sonrası aynı denemeyi yap.
4. Geleceğe alarm kurup telefonu yeniden başlat; kilidi açtıktan sonra uygulamayı açmadan bildirim bekle.
5. Galaxy Wearable'da FieldOps bildirimlerini aç; eşleşmiş saatte yansımayı ve erteleme sebeplerinin eşitlenmesini kontrol et.
6. Bildirim/kesin alarm izinlerini kapatıp uyarıları kontrol et; tekrar aç. Zorla durdurma sonrasında uygulamayı yeniden açarak planı yenile.

## Değişikliklerin yerleri

- `android-mini/phone/.../Reminders.java`, `ReminderReceiver.java`, `MainActivity.java`, manifest ve testler: yerel alarm, izin ve bağlantı.
- `android-mini/shared/.../Protocol.java`, `android-mini/wear/.../MainActivity.java`: erteleme sebepleri protokolü ve saat seçimi.
- `src/mini/{bridge,protocol,reminders}.js`: kalıcı telefon verisinden alarm/saat eşitlemesi.
- `src/utils/messageLibrary.js`, `src/components/TemplateComposer.jsx`, `src/pages/Settings.jsx`: şablonlar ve yönetim.
- `src/utils/statistics.js`, `src/pages/Statistics.jsx`: dönemsel hesaplama ve mahalle dağılımı.
- `src/components/{BottomNav,NextVisit,ContactActions,Availability,VisitActions,BackupPanel,ReminderCenter}.jsx`, `src/pages/{Home,Materials}.jsx`, `src/App.jsx`, `src/index.css`: gezinme ve mevcut akışların bağlantısı.
- `src/store/useServiceStore.js`, `src/utils/{backup,storage,reminders}.js`: tercihler, geriye uyumlu yedekler ve tarihli hatırlatma.
- Testler, CI, paket betikleri ve README: doğrulama ve kullanım notları.
