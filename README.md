# Akış

React + Tailwind CSS ile yapılmış çalışma süresi sayacı (kullanıcıya görünen adı **Akış**, teknik adı `flow`). Ders çalışırken süreyi başlatırsın, **Bitir ve kaydet** dediğinde süre o günün altına yazılır. Her günün başlığında çizginin sağında o günün toplam süresi görünür. Veriler tarayıcıda saklanır, istersen Google ile giriş yapıp Supabase'e yedeklenir ve cihazlar arasında eşitlenir. GitHub Actions her `main` güncellemesinde siteyi GitHub Pages'e yayınlar.

## Özellikler

- **Başlat / Duraklat / Devam / Bitir.** Sayaç dakika:saniye olarak gösterilir (ör. `75:30`), saat yoktur. Bir dakikadan kısa çalışmalar kaydedilmez. Süre zaman damgalarından hesaplanır; sekme arka planda kalsa, ekran kilitlense ya da sayfa yenilense bile doğru kalır. Yenilenince sayaç kaldığı yerden devam eder. Çalışırken yalnızca iki nokta yavaşça sönüp yanar.
- **Büyük ekran.** Sayacı ekrana ölçekli, ince rakamlarla gösterir; 100 dakikayı geçince rakamlar kendiliğinden küçülüp sığar. Tarayıcı destekliyorsa gerçek tam ekrana geçer. Tam ekrandan `Esc` ile ya da sağ üstteki ✕ ile çıkılır.
- **Ekran açık kalır.** Süre işlerken (ve büyük ekran açıkken) Screen Wake Lock API ile ekranın kapanması engellenir. Chrome ve Edge'de çalışır; iPhone'da Safari 16.4 ve üzeri destekler.
- **Günlere göre kayıt.** Bir oturum, başladığı günün altına kaydedilir. Gece yarısını aşan çalışma başladığı güne yazılır. Duraklamalar süreden düşülür. Kayıt satırları çalışılan etiketi ve süreyi saat ve dakika olarak ("1 sa 25 dk"), günün toplamı da aynı biçimde gösterir; saat aralığı ve saniye gösterilmez. Bir kayda dokununca altında çalışılan saat aralığı ve **Sil** düğmesi açılır.
- **Etiket.** Sayacın altındaki alana ne üzerinde çalıştığını yaz (ör. Matematik). Son kullanılan etiketler tek dokunuşla seçilebilir; etiket kayıtla birlikte saklanır.
- **Silme.** Her kayıtta çöp kutusu vardır, silmeden önce onay ister.
- **Bulut eşitleme.** Google ile giriş yap; kayıtlar Supabase'deki ortak `app_backups` tablosuna `app = flow` satırı olarak yazılır.

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local   # Supabase URL ve anon anahtarını yaz (üç uygulamada aynı)
npm run dev                  # http://localhost:5173
npm test                     # süre biçimi, gruplama ve eşitleme testleri
```

Supabase anahtarları olmadan da uygulama çalışır. Bu durumda bulut yedekleme kapalıdır ve kayıtlar yalnızca tarayıcıda saklanır.

## Supabase yedekleme kurulumu (bir kez, üç uygulama için ortak)

Günlük, Akış ve Görevler **aynı Supabase projesini ve aynı tek tabloyu** (`app_backups`) kullanır. Her uygulama tabloda kendi satırına yazar (`app` sütunu: `daily`, `flow`, `task`), bu yüzden veriler karışmaz. Her kullanıcı yalnızca kendi satırlarını görür (RLS).

1. **Tablo:** Supabase → SQL Editor'a `supabase/setup.sql` dosyasının içeriğini yapıştırıp çalıştır (tekrar çalıştırmak güvenli).
2. **Google girişi:** Supabase → Authentication → Providers → **Google**'ı aç, Google Cloud'daki OAuth istemcisinin Client ID ve Client Secret değerlerini yaz. Google Cloud'da bu istemcinin **Authorized redirect URIs** listesine Supabase'in gösterdiği `https://<proje>.supabase.co/auth/v1/callback` adresini ekle.
3. **Yönlendirme adresleri:** Supabase → Authentication → URL Configuration → **Redirect URLs** listesine üç uygulamanın adreslerini ekle (sonda `/` olacak), yerel geliştirme için de `http://localhost:5173/`. Örnek: `https://oguzbatuhan.github.io/daily/`, `https://oguzbatuhan.github.io/flow/`, `https://oguzbatuhan.github.io/task/`.
4. **Anahtarlar:** Supabase → Project Settings → API'den `Project URL` ve `anon public` anahtarını al. Yerelde `.env.local` içine, yayında deponun **Settings → Secrets and variables → Actions → Variables** bölümüne `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` olarak ekle. Anahtar herkese açık olacak şekilde tasarlanmıştır; veriyi RLS korur. `service_role` anahtarını **asla** kullanma.

Tabloyu başka bir adla açtıysan `VITE_SUPABASE_TABLE` ile adını ver.

## Yayınlama (GitHub Pages)

1. Yeni bir depo aç (ör. `flow`) ve bu klasörün içeriğini `main` dalına yükle.
2. Depo **Settings → Pages → Source** kısmını **GitHub Actions** yap.
3. Depo **Settings → Secrets and variables → Actions → Variables** bölümüne `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` ekle (depo değişkenleri depoya özeldir, her yeni depoda yeniden eklenir).
4. Yayın adresini Supabase → Authentication → URL Configuration → Redirect URLs listesine ekle (aşağıdaki kuruluma bak).

Site `https://oguzbatuhan.github.io/<depo-adi>/` adresinde yayınlanır. Chrome'da adres çubuğundaki yükle simgesiyle kendi uygulaması olarak kurulur.

## Tasarım

Yazı tipi Geist'tir ve uygulamayla birlikte gelir (Google Fonts'a bağlanmaz, çevrimdışı da aynı görünür). Renkler ve düğme biçimleri `src/index.css` içindeki jetonlardan gelir; açık ve koyu tema otomatiktir.

## Simgeler

`python3 scripts/make-icons.py` (Pillow gerekir) `public/` içindeki simgeleri yeniden üretir.
