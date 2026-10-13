# Saha düzenlemesi — 13 Ekim 2026

Bu rapor önceki incelemenin prim ve harita kararlarının yerine geçer.

| Konu | Yeni davranış |
|---|---|
| Prim ve satış | Ana sayfa, fiş ayrıntısı, geçmiş ve tamamlananlardan bütün sayaçlar, adet girişleri ve hesaplama kodu kaldırıldı. Eski kayıtlar ve yedekler yüklenirken bu alanlar temizlenir. |
| Servis bilgileri | İş türü, malzeme listesi, müşteri, adres, telefon ve saha notları korunur. Bakım ve aksesuar teslimi gerçek iş türü olarak kalır. |
| Harita | Tam adres Google Maps aramasına gönderilir. Eski koordinat veya alternatif navigasyon adresi kullanılmaz, yol tarifi başlatılmaz. Bina/kat/daire metni korunur. |
| Saat önceliği | 10–12 daima öncelikli, ardından 12–14, 14–16, 16–18, 18–20 ve saatsiz işler. Saat ilerlediğinde bu sıra değişmez. Standart dışı saatler başlangıcına göre sıralanır. |
| Mahalleler | Yalnızca Avcılar profili: saat başlıklarının altında mahalle bölümleri. Mahalle filtresiyle o mahalledeki bütün saatler görüntülenir. Diğer profillere bu bölümler/filtre veya Gümüşpala önceliği gösterilmez. Elle kayıt mahalle önerileri de seçilen bölgeye aittir. |
| Gümüşpala uyarısı | Avcılar profiline, açık 10–12 Gümüşpala ziyaretlerinin müşteri isimleriyle görünür uyarı ve mahalleye geçiş düğmesi. Tamamlanan/iptal edilen işler dahil değildir. |
| Silme | Ziyaret üzerindeki Sil tüm fişlerini, fiş ayrıntısındaki Sil yalnız o fişi siler. Arşive taşımaz. Yanlış dokunmaya karşı onay ve yalnız açık oturumda geri alma korunur; silinen kayıt kalıcı yedeğe eklenmez. |
| İptal / erteleme | eCom’dan gelen gerçek fiş numarası otomatik doldurulur. Önceki mesajdaki eski numara yerine kaydın numarası kullanılır. Çok fişli ziyarette bir fiş numarası, işlem yapılan fiş sayısı ve sebep birleşir. Numara yoksa elle giriş mümkündür. |

Örnek mesaj: `159000001 3 kaydı var evde değilmiş yarın ister`

## Doğrulama

31 otomatik test geçti; GitHub Pages üretim derlemesi başarılı. Kontroller: saat sırası, bölge/durum/saat filtreli uyarı, harita arama parametreleri, otomatik mesaj, eski verilerin dönüşümü, yedek yükleme, arşivden aktarım ve kalıcı silme davranışı.

Fiziksel tablette görsel/dokunmatik kontrol yapılmadı. Google Maps arama sonucunda tek eşleşme bulursa kendisi bir yeri gösterebilir; uygulama işletme, koordinat veya rota seçmez. Alternatif olarak mevcut adres kopyalama düğmesiyle metni kopyalayıp Maps arama alanına elle yapıştırabilirsin.

Kayıtlar cihazın tarayıcısında kalır. Yeni sürüm veri alanlarını dönüştürürken servis ve notları korur. eCom’daki fiş, fotoğraf ve resmi işlemler ayrı yürütülür.
