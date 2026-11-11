# FieldOps Mini — telefon ve Galaxy Watch Ultra

Bu sürüm telefon için **FieldOps Pro**, Wear OS saat için **FieldOps Mini** olmak üzere iki Android uygulaması içerir. Müşteri/eCOM kayıtları telefonda oluşturulur. Saat günlük fişleri gösterir; seçilen **tek fişi** tamamlandı veya ertelendi yapar. Aynı müşterinin diğer fişlerini topluca değiştirmez.

## İlk kullanım

1. Mevcut Chrome/PWA FieldOps-Pro içinde **Yedek indir** seçin ve dosyanın kaydedildiğini kontrol edin. Tarayıcı verilerini silmeyin.
2. Telefon APK’sını Android telefona, saat APK’sını Galaxy Watch Ultra’ya kurun. İki APK aynı paket adıyla ve aynı anahtarla imzalanmalıdır. Telefon ve saat Galaxy Wearable üzerinden eşleşmiş olmalı; Google Play services bulunmalıdır.
3. Telefondaki yeni **FieldOps Pro** uygulamasını açın, profilinizi girin ve **Yedekten geri yükle → Eksik kayıtları ekle** ile JSON yedeğinizi seçin. Mevcut bir fişin üzerine yazılmaz. İsim, fiş sayısı, notlar ve arşivleri karşılaştırın.
4. Bundan sonra eCOM listelerini **bu telefon uygulamasına** aktarın. Chrome/PWA ile Android uygulamasının depoları ayrıdır; birbirlerini otomatik güncellemezler.
5. Telefonda FieldOps Pro açıkken saatte FieldOps Mini’yi açın. Günlük liste geldikten sonra bir fişi açıp durumunu değiştirebilirsiniz. Ertelemede hazır sebeplerden birini seçin.
6. **Bekliyor** yazısı işlem henüz telefona kaydedilmedi demektir. Telefon uygulamasını açın ve bağlantının geri gelmesini bekleyin. **İşlem telefona kaydedildi** gerçek bir kayıt onayıdır. Çakışma bildirimi varsa telefondaki güncel fişi inceleyin.

Telefon uygulaması kapalıyken saat işlemleri kalıcı kuyrukta bekler. Telefon işletim sistemi iletişimi geciktirebilir; uygulama açıldığında mevcut bekleyen veri yeniden okunur. Anlık teslim süresi garantisi yoktur. Saatte internet olmadan son alınan liste görülebilir ve aynı gün için işlemler kuyruğa alınabilir. Önceki günün listesi görüntülenir ama yeni durum işlemleri kapalıdır. Gün ve saat değerlendirmeleri Europe/Istanbul kullanır.

**Günlük liste:** açık/ertelenmiş aktif fişler (önceki günden kalan açık işler dahil), bugün iptal edilen aktif fişler ve bugün tamamlanan fişler (arşivdekiler dahil). Eski tamamlanmış kayıtlar saatte taşınmaz. Önce açık işler, ardından kapananlar; saat sırasına göre listelenir.

Yedekler mevcut v3 JSON biçimindedir; saatin işlem günlüğü yedeğe eklenmez. Telefon uygulamasındaki **Yedek indir**, Android dosya kaydetme ekranını açar. Dosya kaydedildi bildirimini bekleyin. Tarayıcıdaki önceki yedekleme/geri yükleme davranışı devam eder.

## Mimari ve nedenleri

Kaynak: `b821392c23011b5b8bf8528e59371a3958b206e6` (`DefaultSpace/FieldOps-Pro/main`). React/Vite/Zustand uygulaması `routex-persist-v1`, sürüm 1 kullanıyor; bir sunucu veri tabanı ve cihazlar arası otomatik eşitleme yok. `mergeBackup` mevcut fişleri koruyarak yalnızca eksikleri eklediğinden eşitleme için kullanılamaz.

```
Paketlenmiş React uygulaması / Android telefon
  routex-persist-v1
  Zustand + ek miniSync işlem makbuzları
       ↕ yalnızca güvenilen yerel HTTPS kökeni, ana çerçeve
Android telefon köprüsü / şifreli kalıcı gelen kutusu
       ↕ Wear OS Data Layer DataItem + büyük liste için Asset
Wear OS / şifreli son liste, kalıcı giden kutusu ve sonuçlar
```

Telefon WebView’i uygulamayla paketlenen dosyaları `https://appassets.androidplatform.net/assets/web/` üzerinden açar. Sunucudan JavaScript indirmez. WebMessageListener yalnızca bu kökenin ana çerçevesine açıktır; başka sayfalar yerel köprüye erişemez. İzin verilen kullanıcı bağlantıları Maps/WhatsApp/telefon gibi dış uygulamalarda açılır. WebView içindeki uzak kaynak istekleri engellenir. `addJavascriptInterface`, açık HTTP sunucusu, genel erişimli veri tabanı ve hesap parolası yoktur.

Normal tarayıcıda `FieldOpsMini` bulunmadığından ek köprü çalışmaz. `miniSync` alanı ancak Android köprüsü açılırsa oluşturulur; eski anahtar, persist sürümü, yedek biçimi ve kontrol noktası mekanizması korunur. Kayıtların hiçbiri saatten oluşturulamaz veya silinemez.

## Teslim ve çakışma kuralları

- İşlem: protokol sürümü, rastgele UUID işlem kimliği, veri dönemi (`epoch`), kayıt kimliği, SHA-256 temel sürümü, hedef durum ve sınırlı erteleme sebebi. İstemci saat damgası çakışma çözümünde kullanılmaz.
- Kayıt sürümü, dönemin ve **bütün mevcut telefon kaydının** SHA-256 özetidir. Not/saat/malzeme gibi başka bir alan değişmişse bile eski saat işlemi uygulanmaz. Hash hesaplanırken gelen telefon değişiklikleri ayrıca nesne kimliğiyle denetlenir.
- İşlem önce saatte atomik olarak diske kaydedilir. Her işlem ayrı bir DataItem yoluna yazılır; bağlantısızken son durumun üzerine yazılıp kaybolmaz. Google Play services teslimi sağlar; WorkManager ve açılış taraması kaçırılan olayları tamamlar.
- Telefonda kayıt değişikliği ve işlem makbuzu **tek Zustand/localStorage yazımında** tutulur. Makbuz kalıcı depodan geri okunmadan ACK gönderilmez. Depolama başarısızsa işlem saatte beklemeye devam eder. Telefon tekrar açılırsa aynı UUID ikinci kez işlem geçmişi yaratmaz.
- Silinen/arşivlenen kayıt yeniden oluşturulmaz. Telefonda değişmiş veya kapanmış fiş için `conflict`, bulunamayan fiş için `missing`, değişen veri dönemi için `reset` döner. Telefon verisi korunur; saat sonucu gösterir.
- ACK alınınca saat giden kutusunu ve sonucu tek atomik yazımda değiştirir; sonra DataItem’ı siler. Telefon bu silmeyi gördüğünde geçici gelen kutusunu/ACK’yi temizler. Açılış taraması kaçırılan silme olaylarını da temizler.
- Telefon işlem günlüğü 2000 makbuzu aşınca yeni dönem açılır ve son 1000 makbuz korunur. Önceki dönemin silinmiş makbuzlarına ait komutlar artık uygulanamaz. Bu sınırda henüz teslim edilmemiş eski komutlar güncel listeyi kontrol etme bildirimi alabilir.
- Saatte bir fiş için aynı anda yalnızca bir bekleyen işlem, toplam en fazla 200 işlem tutulur. Telefon gelen kutusu 1000, günlük liste 1000 kayıtla sınırlıdır. Büyük/bozuk veri sessizce eksiltilerek uygulanmaz. Liste yükü en fazla 1 MB’dır.
- Aynı kurulumda tek telefon ve tek saat desteklenir. İlk kabul edilen eşleşmiş karşı cihaz kimliği sabitlenir. Başka telefon/saat veya anahtar değişiminde mevcut kuyrukları önce tamamlayın, yedek alın ve yeni kurulum yapın; otomatik cihaz taşıma bu sürümde yoktur.

## Gizlilik ve depolama

Saate yalnızca müşteri adı, adres, randevu saati, fiş numarası, durum, işlem yapılabilirliği ve teknik kimlik/özet gönderilir. Müşteri telefonları, teknisyen profili, malzeme/not geçmişi ve tüm arşiv gönderilmez. Alan sınırını aşan çok uzun metinlerin saat görünümü kısaltılır; telefondaki orijinal alan değişmez.

Native kuyruklar/liste AES-GCM ile şifrelenir; anahtar Android Keystore’da, veri uygulamanın `noBackupFilesDir` dizinindedir. Atomik dosya yazımı sırasında bozulma/anahtar kaybı oluşursa veri sıfırlanmaz. WebView’in asıl `localStorage` verisi uygulamanın özel depolama alanında ve Android cihaz şifrelemesi altındadır; ayrıca uygulama düzeyinde AES şifrelemesi uygulanmaz. Cihaz ekran kilidi ve Android korumaları önemlidir.

Her iki uygulamada otomatik bulut yedeği/cihaz aktarımı kapalıdır; ekran ve son uygulamalar görüntüsü korunur. Kullanıcının açıkça dışa aktardığı JSON yedeği **şifresizdir** ve müşteri verileri içerir; güvenli yerde tutulmalıdır. Uygulama verisini silmek veya kaldırmak kuyrukları/yerel kayıtları kaybettirir. Kayıt içeren log/analitik eklenmemiştir.

Data Layer aynı paket adı ve imza şartını uygular. Bluetooth üzerinden doğrudan iletişim veya Google’ın yönetilen aktarım altyapısını kullanabilir; “veri hiçbir zaman Google üzerinden geçmez” garantisi verilmez. Bu proje ayrıca bir bulut sunucusu kurmaz.

## Derleme

Gerekenler: Node 22+, JDK 17, Android SDK 35 / build-tools 35.0.0. Android Studio ile `android-mini` açılabilir.

```sh
npm ci
npm run lint
npm test
npm run build
npm run test:browser
npm run test:mini-browser
npm run build:mini
cd android-mini
./gradlew :shared:testDebugUnitTest :phone:assembleDebug :wear:assembleDebug :phone:lintDebug :wear:lintDebug
```

Windows’ta `gradlew.bat` kullanın. Tarayıcı testleri için `npx playwright install chromium` gerekir; önceden kurulu Chromium/Chrome için `FIELDOPS_CHROME` tam uygulama yolunu alır. Android web varlıkları `build:mini` ile üretilir; ayrı Android dağıtımı `/assets/web/` tabanını kullanır. Normal `npm run build` GitHub Pages davranışını korur. Oluşan APK’lar `android-mini/phone/build/outputs/apk/debug/` ve `android-mini/wear/build/outputs/apk/debug/` altındadır.

Debug APK’ları geliştirme/saha doğrulaması içindir. Yayın sürümünde iki APK’yı aynı özel anahtarla imzalayın; anahtarı depoya yüklemeyin. Play Store yayını, üretim imzası ve cihazlara kurulum bu değişikliğin parçası değildir. Mevcut React/Vite bağımlılıkları topluca yükseltilmemiştir; devralınan bağımlılık uyarıları ayrıca değerlendirilmelidir.

## Doğrulama kapsamı

Otomatik testler: mevcut web regresyonları; gerçek Zustand deposunda durum/alan koruma, tekrar teslim, yeniden açılış, kota hatası, bozuk komut, aynı anda telefon düzenlemesi, silme/arşiv, dönem değişimi, saat verisinin azaltılması, İstanbul gün sınırı ve yedek uyumu; tarayıcıda yerel köprü taklidiyle uçtan uca ACK/tekrar/reload/yedek; Android protokol doğrulama birim testleri; iki APK derlemesi ve Android Lint.

12 Kasım 2026 doğrulaması: **54 JavaScript testi ve 5 Android/JVM testi geçti.** Mevcut web tarayıcı regresyonu, köprü tarayıcı testi ve CSP içeren Android web varlıklarının köprü testi geçti. Telefon/saat debug APK’ları üretildi; aynı imza SHA-256 değeri ve paket adı doğrulandı. Lint her iki modülde sıfır hata verdi. Kalan iki uyarı: sabitlenen WebKit sürümünün daha yeni sürümü bulunduğu ve ortak kütüphaneden kullanılan `is_watch` kaynak üst yazımının kullanılmıyor görünmesi. Android kaynakları incelenerek telefonda `false`, saatte `true` olduğu doğrulandı. Devralınan npm üretim bağımlılıklarında audit 3 orta seviye uyarı bildirdi; bu çalışmada bağımlılık yükseltmesi yapılmadı.

**Gerçek Galaxy Watch Ultra üzerinde aşağıdaki kabul testleri ayrıca yapılmalıdır:**

1. Test fişlerini telefona ekleyin; ad/adres/saat/fiş ve tamamlananlar birebir gelsin.
2. Bluetooth/Wi-Fi kapalıyken saatte bir fişi tamamlayın, birini erteleyin; uygulamayı kapatıp açın. İşlemler beklemeli ve kaybolmamalı.
3. Telefonu açıp bağlantıyı geri getirin. Her işlem yalnızca bir geçmiş kaydı oluştursun; saat ancak kayıt onayından sonra bekleme durumundan çıksın.
4. Çevrimdışı saat işlemi beklerken telefonda aynı fişin notunu/saatini/durumunu değiştirin. Telefon değişikliği korunsun; saat çakışmayı bildirsin.
5. Saat işlemi beklerken fişi silin/arşivleyin. Yeniden doğmasın; uygulanmadı sonucu görülsün.
6. ACK öncesi/sonrası iki uygulamayı ve cihazları yeniden başlatın. Kuyruk kalıcı olsun; tekrar durum/geçmiş yazımı olmasın.
7. Tarih değişimi, uzun adres, 200+ bekleyen işlem sınırı, büyük yedek dosyası, dosya seçimi iptali, düşük depolama ve WebView güncellemesi senaryolarını sınayın.
8. Önceki JSON yedeğini içe aktarın; yeniden dışa aktararak fiş, not, malzeme, geçmiş ve arşiv korunmasını karşılaştırın. Chrome’daki orijinal kaydın değişmediğini doğrulayın.

Fiziksel cihaz eşleşmesi ve BLE teslimi bu ortamda doğrulanmadı. WebView içinde uygulama içi hatırlatmalar korunur; tarayıcı sistem bildirimlerinin Android arka plan alarmına dönüştürülmesi bu sürüme eklenmedi.

## Resmî kaynaklar

- [Wear OS Data Layer genel bakış](https://developer.android.com/training/wearables/data/overview)
- [Kalıcı DataItem eşitlemesi](https://developer.android.com/training/wearables/data/data-items)
- [WebView yerel içerik yükleme](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content)
- [Köken sınırlı JavaScript köprüsü](https://developer.android.com/develop/ui/views/layout/webapps/native-api-access-jsbridge)
- [Android Gradle Plugin 8.9 uyumluluğu](https://developer.android.com/build/releases/agp-8-9-0-release-notes)
