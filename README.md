# RouteX - Saha Operasyon Sistemi

Bu proje, saha teknisyenleri için günlük iş akışını hızlandırmak amacıyla geliştirilmiş hafif bir React uygulamasıdır.

## 🚀 Başlarken

Proje **Vite + React** tabanlıdır ancak sisteminizde Node.js yüklü olmadığı tespit edildiği için iki farklı kullanım seçeneği sunulmuştur:

### Seçenek 1: Hemen Kullan (Önerilen)
Dizin içindeki `UZERINE_TIKLA_CALISTIR.html` dosyasını tarayıcınızda açarak uygulamayı **hemen kullanmaya başlayabilirsiniz**. Tüm özellikler (Zustand, Tailwind, DND) bu tek dosyada CDN üzerinden çalışacak şekilde paketlenmiştir.

### Seçenek 2: Geliştirici Modu (Node.js gerektirir)
Eğer ileride Node.js kurarsanız şu adımları izleyebilirsiniz:
1. Terminali proje klasöründe açın.
2. `npm install` komutu ile bağımlılıkları yükleyin.
3. `npm run dev` komutu ile geliştirme sunucusunu başlatın.

## 📌 Özellikler
- **Mahalle Bazlı Gruplama**: Servisleriniz otomatik olarak mahallelerine göre ayrılır.
- **Akıllı Rota**: Bir mahalledeki tüm adresleri tek tıkla Google Maps üzerinden sıraya dizebilirsiniz (CarPlay uyumlu).
- **Hızlı Giriş**: Sabah servis girişlerini saniyeler içinde yapın, mükerrer müşteri uyarılarını alın.
- **Prim Sistemi**: Günlük kazancınızı (Plus, Aksesuar, Bakım satışları dahil) real-time takip edin.
- **Arşiv**: Geçmiş günler otomatik olarak arşive taşınır, tarih bazlı primlerinizi görebilirsiniz.
- **Drag & Drop**: Mahalle içindeki servis sıralamasını sürükle-bırak ile değiştirebilirsiniz.

## 🛡️ Veri Güvenliği
Uygulama tamamen **LocalStorage** kullanır. Verileriniz tarayıcınızda saklanır, hiçbir sunucuya gönderilmez.

## FieldOps Pro — yeni günlük ekran

Mevcut React, Zustand ve `routex-persist-v1` veri yapısı korunur. Günlük ekran eCom listesini tek seferde aktarır, aynı müşteri / adres / mahalledeki fişleri ziyaret olarak gruplar. Fiş bazında satış, prim, durum ve arşiv korunur. Listeyi tekrar aktarmak mevcut fişlerin durumunu veya satışlarını sıfırlamaz. Arşivde bulunan fişler yeniden açılmaz. Silinen kaynak fişleri otomatik silinmez.

Saatli ziyaretler başlangıç saatine göre sıralanır; İstanbul saatinde aralığı geçenler işaretlenir. Bu ekran mesafe veya seyahat süresi hesaplamaz. Saatsiz bir işe yetişme garantisi vermez.

Harita aramasına mahalle, Avcılar, İstanbul eklenir. Daire ve kat kartta korunur, navigasyon metninden çıkarılır. Google Maps adres araması doğrulama değildir. Kullanıcı doğru noktayı bulup enlem ve boylamını kaydettiğinde navigasyon doğrudan koordinata açılır. Kalan ziyaretlerin kendi haritasında yalnızca kaydedilmiş koordinatlar gösterilir. Tamamlanan ziyaretler haritadan kalkar. Maps Favoriler listesi değiştirilmez.

Müşteri verileri yerel tarayıcıda tutulur. Navigasyon tıklanınca hedef adres / koordinat Google Maps'e gider. Harita açılırsa OpenStreetMap zemin karoları yüklenir. Farklı alan adı veya cihaz eski localStorage verisini paylaşmaz. Önemli kayıtları eski uygulamadan yedekleyin; bu sürümde yedek geri yükleme arayüzü yoktur.

Kontrol: `node --test tests/ecom.test.js` ve `npm run build`.
Sites kök alan adı için: `SITE_DEPLOY=1 npm run build`.
GitHub Pages için varsayılan `/FieldOps-Pro/` yolu korunur.
`UZERINE_TIKLA_CALISTIR.html` önceki bağımsız sürümdür; yeni tasarım Vite / React kaynaklarında çalışır.
