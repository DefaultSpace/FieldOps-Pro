# Kişisel saha kullanımının teknik notları

Güncelleme: 22 Kasım 2026.

## Kapsam

Tek kişi, tek cihaz ve Avcılar’daki beş mahalle: Gümüşpala, Denizköşkler, Merkez, Ambarlı, Cihangir. Hesap, backend, eşitleme veya dış sistem entegrasyonu bulunmaz.

## Kayıt kuralları

- `src/config/region.js` ortak mahalle listesi ve bölge kontrolünü sağlar.
- Profil yalnızca hazır mesajlarda kullanılan ismi düzenler. Bölge Avcılar olarak sabittir.
- Elle kayıt ekranında mahalle seçilir; ilçe seçimi ve serbest mahalle girişi yoktur.
- Kayıt katmanı hem elle eklemede hem eCom aktarımında bölgeyi denetler. Tamamı atlanan aktarım mevcut fişleri veya kurtarma kopyasını değiştirmez.
- Ayrıştırıcı bölge dışını `ignored: true` ile ayırır. Hatalı kayıtlarla bölge dışı atlananların adetleri ayrı gösterilir.
- Eski bölge ayarı yüklenirken Avcılar’a dönüşür. Eski fişlerin ilçesi, notları, geçmişi ve arşivi korunur. Yedek kurtarma bu fişleri filtrelemez.

## Günlük ekran ve veri

Saat, mahalle, müşteri, telefon ve adres kart üzerinde görünür. Tamamlama doğrudan; not, erteleme ve iptal ayrıntılardan kullanılabilir. Elle kayıt günlük listenin başındadır. Plan ve malzeme araçları isteğe bağlı açılır.

Yerel veri anahtarı değişmez. İşlem öncesi kurtarma, silmeyi geri alma ve JSON yedekleri korunur. Yedek indirme zamanı İstanbul saatindedir; dosyanın indirildiği ayrıca kontrol edilmelidir. Yeni sürümden önce açık taslaklar kaydedilir.

## Doğrulama

Lint, birim testleri, üretim derlemesi ve tarayıcı senaryosu çalıştırılır. Kontroller beş mahalle sınırını, eski kayıtların korunmasını, elle kayıt kalıcılığını, çevrimdışı not düzenlemeyi, sürüm güncellemesini ve yedek kurtarmayı kapsar. Fiziksel saha cihazındaki dokunma, indirme ve dış uygulama geçişleri ayrıca doğrulanmalıdır.
