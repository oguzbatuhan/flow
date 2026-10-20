# Akış

React + Tailwind CSS ile yapılmış çalışma süresi sayacı (kullanıcıya görünen adı **Akış**, teknik adı `flow`). Ders çalışırken süreyi başlatırsın, **Bitir ve kaydet** dediğinde süre o günün altına yazılır. Her günün başlığında çizginin sağında o günün toplam süresi görünür. Veriler tarayıcıda saklanır, istersen Google Drive ile cihazlar arasında eşitlenir. GitHub Actions her `main` güncellemesinde siteyi GitHub Pages'e yayınlar.

## Özellikler

- **Başlat / Duraklat / Devam / Bitir.** Sayaç dakika:saniye olarak gösterilir (ör. `75:30`), saat yoktur. Bir saniyeden kısa denemeler kaydedilmez. Süre zaman damgalarından hesaplanır; sekme arka planda kalsa, ekran kilitlense ya da sayfa yenilense bile doğru kalır. Yenilenince sayaç kaldığı yerden devam eder. Çalışırken yalnızca iki nokta yavaşça sönüp yanar.
- **Büyük ekran.** Sayacı ekrana ölçekli, ince rakamlarla gösterir; 100 dakikayı geçince rakamlar kendiliğinden küçülüp sığar. Tarayıcı destekliyorsa gerçek tam ekrana geçer. Tam ekrandan `Esc` ile ya da sağ üstteki ✕ ile çıkılır.
- **Ekran açık kalır.** Süre işlerken (ve büyük ekran açıkken) Screen Wake Lock API ile ekranın kapanması engellenir. Chrome ve Edge'de çalışır; iPhone'da Safari 16.4 ve üzeri destekler.
- **Günlere göre kayıt.** Bir oturum, başladığı günün altına kaydedilir. Gece yarısını aşan çalışma başladığı güne yazılır. Duraklamalar süreden düşülür. Kayıt satırları dakika ve saniye ("50 dk 12 sn"), günün toplamı saat ve dakika ("1 sa 55 dk") olarak görünür.
- **Silme.** Her kayıtta çöp kutusu vardır, silmeden önce onay ister.
- **Drive eşitleme.** Görevlerim uygulamasıyla aynı yöntem: kayıtlar Drive'daki gizli uygulama klasörüne `flow.json` olarak yazılır.

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local   # Drive eşitlemesi için istemci kimliğini buraya yaz
npm run dev                  # http://localhost:5173
npm test                     # süre biçimi, gruplama ve eşitleme testleri
```

İstemci kimliği olmadan da uygulama çalışır. Bu durumda Drive eşitleme kapalıdır ve kayıtlar yalnızca tarayıcıda saklanır.

## Yayınlama (GitHub Pages)

1. Yeni bir depo aç (ör. `flow`) ve bu klasörün içeriğini `main` dalına yükle.
2. Depo **Settings → Pages → Source** kısmını **GitHub Actions** yap.
3. Depo **Settings → Secrets and variables → Actions → Variables** bölümüne `VITE_GOOGLE_CLIENT_ID` adıyla Google istemci kimliğini ekle (Görevlerim'dekiyle aynısı olur). Depo değişkenleri depoya özel olduğu için bunu her yeni depoda yeniden eklemen gerekir.
4. Google Cloud Console'da yetkili JavaScript kaynağı olarak `https://oguzbatuhan.github.io` zaten ekliyse ayrıca bir şey yapman gerekmez.

Site `https://oguzbatuhan.github.io/<depo-adi>/` adresinde yayınlanır. Chrome'da adres çubuğundaki yükle simgesiyle kendi uygulaması olarak kurulur.

## Tasarım

Yazı tipi Geist'tir ve uygulamayla birlikte gelir (Google Fonts'a bağlanmaz, çevrimdışı da aynı görünür). Renkler ve düğme biçimleri `src/index.css` içindeki jetonlardan gelir; açık ve koyu tema otomatiktir.

## Simgeler

`python3 scripts/make-icons.py` (Pillow gerekir) `public/` içindeki simgeleri yeniden üretir.
