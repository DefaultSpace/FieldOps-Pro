# FieldOps saha incelemesi — 13 Ekim 2026

Amaç: Tabletteki eCom resmi fiş, fotoğraf, stok ve işlem sistemidir. FieldOps; eCom listesini kopyalayıp günlük ziyaretleri, iletişimi, saha notlarını ve kişisel primi takip etmek içindir.

## Düzeltilenler

| Sorun | Yeni davranış |
|---|---|
| Arşivdeki fiş tekrar aktarılınca sessizce atlanıyordu | Tekrar aktarılan fiş kalan işlere döner. Notlar ve satış adetleri korunur. Aktif fiş çoğaltılmaz. |
| Aktarım sonucu yeni kayıt sayısını açıklamıyordu | Yeni, güncellenen ve arşivden dönen fiş sayıları ayrı bildirilir. |
| Bazı mahalle biçimleri kaydı tamamen düşürüyordu | Mahalle ayrılamayan fakat temel bilgileri bulunan fiş, adres kontrol uyarısıyla aktarılır. Gerçekten eksik kayıt için uyarı devam eder. |
| İlçe tahmini aynı adresli kayıtları karıştırabilirdi | Aktarımdaki ilçe saklanır; harita ve adres eşleştirmesinde kullanılır. |
| Saat aralıklarındaki dakikalar kayboluyordu | 10:30–12:30 gibi saatler korunur; sıralama ve gecikme hesabı dakikaya göre yapılır. |
| Önceki günün primi günlük toplama karışabiliyordu | Günlük tamamlanan fiş ve kazanılan prim, İstanbul tarihine göre aktif kayıt ve arşiv birlikte taranarak hesaplanır. |
| Gün sonunda bitmemiş işler de arşive gidiyordu | “Kapanan işleri arşivle” yalnızca tamamlanan ve iptal edilen fişleri taşır. |
| Arşiv sadece üç fiş gösteriyordu | Tüm kayıtlar isim, fiş, telefon, adres ve tarihle aranır. Her fişin ayrıntısı açılır. |
| Tamamlama yolları ve erteleme yolları farklı davranıyordu | Fiş ve ziyaret tamamlama aynı kayıt işlemini kullanır. Tamamlanmış fişe yeniden basmak tarihi değiştirmez; iptal edilmiş fiş yanlışlıkla tamamlanmaz. Erteleme/iptal ortak formu kullanır. |
| Tamamlama eski hatırlatmayı taşıyabiliyordu | Tamamlanınca hatırlatma temizlenir. Fotoğraf sorusu, eCom işlemiyle FieldOps işaretlemesinin farkını belirtir. |
| İkinci telefon kullanılamıyordu | Kayıttaki telefonlar seçilebilir. Santral için 05…/02… biçiminde kopyalanır. Boş numarayla WhatsApp açılamaz. |
| Kopyalama başarısızlığı yanlış bildiriliyordu | Sonuç kontrol edilir; alternatif kopyalama denenir. Başarısızlıkta açık uyarı verilir. |
| Manuel fişte numara alanı yoktu; varsayılan randevu 10/12 idi | Fiş numarası eklendi, aynı numarayla ikinci kayıt engellendi. Varsayılan saat “Saatsiz”. Telefon yoksa kayıt yine eklenebilir. |
| Manuel kayıt yalnızca seçili bölgedeki mahallelere izin veriyordu | Mahalle önerileri yanında serbest giriş var; ilçe ayrıca seçilir. Profil bölgesi zorunlu değil. |
| İptal edilen ziyaretin malzemesi hazırlık listesini şişiriyordu | Tamamı iptal olan ziyaretin malzemeleri hazırlık listesine girmez. |
| Güncel kod farklı sürümler arasında ayrışmıştı | GitHub’daki profil, tamamlananlar ve bölge özellikleri korunarak mevcut saha düzeltmeleri aynı sürüme alındı. |

## Eklenen kolaylıklar

- Günlük listede mahalle filtresi ve telefonla arama.
- Ziyaret kartından doğrudan numara kopyalama ve WhatsApp mesajı açma.
- Mesajı WhatsApp’a geçmeden düzenleme, doğru numarayı seçme ve metni ayrıca kopyalama.
- Fotoğraf/video isteme mesajı. Teknisyen adı hazır mesajlara otomatik eklenir.
- Eski tarihli eCom listesini yapıştırınca tarih uyarısı.
- Yanlış silme için son silmeyi geri alma. Arşive gizli kayıt taşınmaz; geri alma yalnızca açık oturumda tutulur.
- Yedek JSON dosyasını geri yükleme. Geçersiz dosya reddedilir; mevcut kayıtların üzerine yazmadan eksikler eklenir. Eski `{s,a}` yedekleri desteklenir.
- Son yedek indirme isteğinin zamanı. Dosyanın gerçekten indirildiği tarayıcıda kontrol edilmelidir.
- İnternet ve tarayıcıya kayıt hatası uyarıları.
- Malzeme listesini kapatıp açma; dokunma alanları ve metin boyutlarında düzenleme.

## Çıkarılan / sadeleştirilenler

- Elle verilen NPS sürgüsü: resmi müşteri anket puanını temsil etmiyordu. Anket mesajı korundu.
- “En geç 30 dakikada geliriz” ve kesin yarın ziyaret sözü: teknisyen kontrol etmeden böyle bir söz verilmez. Düzenlenebilir, saat taahhüdü içermeyen metinler var.
- İş akışını kilitlemeyen, yalnızca “ekstra” etiketi üreten plan kilidi ve etiketleri.
- Kullanılmayan eski sıralama, mahalle grubu, istatistik ve erteleme bileşenleri.
- Sabit “iletişim zekası / stratejik mesaj” gibi başlıklar; düz, görev odaklı düğmeler kullanıldı.

## Korunan kurallar

- Prim: bakım 260 TL, aksesuar 120 TL, Plus 130 TL. Aksesuar ve Plus adedi düzenlenebilir. Fiş başına ek prim yok.
- Bekleyen prim tüm açık işlerindir; kazanılan günlük prim bugün tamamlanan işlerindir.
- Arşivden yeniden açılan aynı fiş bekleyen duruma döner; önceki tamamlanma tarihi temizlenir. Aynı fişin ayrı ziyaret sürümleri tutulmaz.
- Geçmişte tamamlanma zamanı kaydedilmemiş fişlerde tarih için oluşturulma zamanı kullanılır; ekranda tamamlanma saatinin bilinmediği belirtilir.
- Aynı ziyaretin malzeme notu ve kullanımı ortak tutulur. Bu bir araç depo sayımı değildir.

## Doğrulama ve sınırlar

30 otomatik test geçti. Gerçek Zustand deposuyla içe aktarma → tamamlama → arşivleme → geri alma → silme/geri alma → kalıcı kayıt akışı kontrol edildi. Yedek birleştirme, İstanbul gece yarısı, prim, alternatif telefon, dakika içeren randevular, bölgeler ve iptal malzemeleri test edildi. Üretim derlemesi kontrol edildi.

Bu ortamda tablet/telefon tarayıcısında görsel ve dokunmatik test yapılmadı. WhatsApp, santral, dosya indirme ve bildirim izinleri cihazda doğrulanmalı.

- Uygulama eCom’a fiş, fotoğraf, imza veya stok işlemez. Resmi işlem tablette ayrıca yapılır.
- Veriler tarayıcıda saklanır. Telefon ve tablet arasında otomatik senkronizasyon veya kullanıcı hesabı yoktur. Yedek dosyasıyla eksik kayıtlar taşınabilir; mevcut bir fişteki sonradan yapılan değişiklikler otomatik birleştirilmez.
- Sayfa kapalıyken güvenilir zamanlanmış bildirim yoktur. Açıkken hatırlatır; yeniden açılınca geciken hatırlatıcı gösterilebilir.
- Tam çevrimdışı açılış garantisi yoktur. Bağlantı kesilmiş açık sayfada çalışılabilir; WhatsApp ve harita bağlantı ister.
- Bilinmeyen mahalle/adres biçimleri için uyarıyı kontrol etmek gerekir. Konum doğruluğu Google Maps’in adres çözümlemesine de bağlıdır.

## Tablette kısa kontrol

1. Mevcut verilerin yedeğini indir.
2. eCom listesini yapıştır; yeni/güncellenen/arşivden dönen adetlerini ve uyarıları kontrol et.
3. İki telefonlu bir kayıtta diğer numarayı seç; santrale yapıştır.
4. Test fişini tamamla; tarih ve günlük primi kontrol et, sonra geri al.
5. Test fişini sil ve son silmeyi geri al.
6. Yedeği tekrar yükle; aynı fişlerin çoğalmadığını kontrol et.
7. Yakın bir saat için “Sonra gel” kur; uygulama açıkken uyarıyı kontrol et.
