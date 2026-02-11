# FieldOps Lite - Saha Operasyon Paneli

Bu proje, beyaz eşya servis teknisyenleri için günlük iş akışını hızlandırmak amacıyla geliştirilmiş hafif bir React uygulamasıdır.

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
