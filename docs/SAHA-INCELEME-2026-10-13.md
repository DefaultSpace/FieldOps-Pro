# Saha teknik notları — 13 Ekim 2026

Bu dosya ilk saha düzeltmelerinin teknik kaydıdır. Güncel kullanım kuralları README ve SAHA-DUZENLEME-2026-10-13.md içinde tutulur.

- eCom listesinden fiş, müşteri, cihaz, adres, telefon, saat ve iş türü ayrıştırılır.
- Tekrarlanan fiş çoğaltılmaz. Arşivden aktarım önceki not ve geçmişi koruyarak fişi yeniden açar.
- Dakika içeren saatler ve birden fazla telefon desteklenir.
- Tamamlama, erteleme, iptal ve silme aynı kayıt katmanından uygulanır.
- Gün sonu arşivleme yalnızca tamamlanan ve iptal edilen kayıtları taşır.
- Arşivde isim, fiş, telefon ve adresle arama yapılır.
- Silinen son kayıtlar açık oturumda geri alınabilir; silme arşivleme değildir.
- JSON yedek birleştirme mevcut fiş ve notların üzerine yazmaz.
- İstanbul saat dilimi günlük işlemlerde kullanılır.

İlk sürümdeki prim/satış hesabı, serbest bölge seçimi ve bilinmeyen mahalleyi aktarma davranışı artık kullanılmaz. Yeni kayıtlar yalnızca Gümüşpala, Denizköşkler, Merkez, Ambarlı ve Cihangir içindir. Eski kayıtlar korunur.

Gerçek cihazda telefon numarası kopyalama, WhatsApp açılışı ve yedek dosyasının indirilmesi ayrıca kontrol edilmelidir. Otomatik testler sentetik veri kullanır.
