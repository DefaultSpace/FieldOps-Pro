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

Prim birimleri: bakım 260 TL, aksesuar 120 TL, Plus 130 TL. Günlük kazanç İstanbul tarihine göre hesaplanır. Fiş başına ek ücret yoktur.

## Veri davranışı

Kayıtlar aynı tarayıcının `routex-persist-v1` alanında tutulur. Sunucu hesabı veya otomatik cihaz eşitlemesi yoktur. Yedek geri yükleme, mevcut fişleri koruyarak yalnızca eksikleri ekler. Silinen son kayıt grubu açık oturumda geri alınabilir; silme arşive taşımaz.

eCom aktarımı arşivde bulunan fişi bekleyen olarak geri açar; notlar ve satış adetleri korunur. Aktif fişin mevcut durumu korunur. Eski tamamlanma tarihi yeniden açılışta temizlenir; aynı fişin ayrı ziyaret sürümleri tutulmaz. Kaynak listede olmayan işler kendiliğinden silinmez.

Uygulama kapalıyken zamanında bildirim garantisi yoktur. WhatsApp mesajları kullanıcı tarafından gönderilir. Harita bağlantısı adresi Google Maps’e aktarır; rota optimizasyonu veya adres doğrulaması yapılmaz. Tam çevrimdışı açılış desteklenmez.

`UZERINE_TIKLA_CALISTIR.html` tarihî bağımsız sürümdür; güncel uygulama değildir. Güncel sürüm `src/` altındaki React uygulamasıdır.

## Geliştirme

```sh
npm ci
npm test
npm run dev
```

GitHub Pages paketi: `npm run build` (`/FieldOps-Pro/`). Sites kök alan adı: `SITE_DEPLOY=1 npm run build`.

[13 Ekim 2026 saha inceleme ve değişiklik raporu](docs/SAHA-INCELEME-2026-10-13.md)
