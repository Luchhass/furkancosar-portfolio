# Animasyon envanteri ve ortak davranışlar

Bu envanter mevcut dört route'u, ortak bileşenleri ve kaynakta bulunan fakat şu anda render edilmeyen görselleri kapsar. Tasarımın yerleşimi ve animasyonun tetikleyicisi, hareket ailesinden ayrı tutulur.

## Ortak kaynaklar

- `src/lib/motionPresets.js`: ailelerin kuvvet, mesafe, süre, ease, stagger ve scrub değerleri.
- `src/lib/repeatReveal.js`: sabit kapsayıcıları izleyen tek IntersectionObserver. İlk görünürlükte beklemeden baştan giriş; tamamen ekran dışında en fazla 0,26 sn içinde reverse; hızlı dönüşte dahi yeniden baştan giriş. `rootMargin: 0px`, `threshold: 0`; ekran dışında bekleme, giriş yüzdesi veya kart batch gecikmesi yok. Son kullanıcı ayrılınca gözlemci kaldırılır.
- `src/lib/pointerMotion.js`: magnet ve üç boyutlu eğim hesapları, ortak pointer easing'i ve temizleme davranışı.
- `src/lib/useAccordionMotion.js`: Home About ve About Tech Stack için aynı satır ve logo açılış sistemi.
- `src/lib/useShelfCardReveal.js`: Home ve Projects kartları ortak görünürlük sisteminde; bütün kart içeriği tek yatay maske açılışıyla girer.
- `src/lib/motionMedia.js`: breakpoint ve reduced-motion abonelikleri.

## Eşitlenen aileler

| Aile | Kullanıldığı yerler | Ortak değer / davranış |
| --- | --- | --- |
| Harf bazlı başlık reveal | Bölüm başlıkları, CTA, IdentityBand, hero giriş harfleri; kayan bantta kelime bazında aynı hareket | yPercent 105; rotationX -70; 0,85 sn; power3.out; stagger 0,022 sn |
| Maskeli satır açılışı | ResponsiveTextLines, Home About accordion, About Tech accordion, Journey satırları, footer metinleri, menü alt metinleri | yPercent 112; 0,78 sn; power4.out; stagger 0,075 sn |
| İçerik fade/slide | Bölüm içeriği, kicker, CTA metni/butonu, GitHub satırları, About highlight, Journey ayrıntıları, proje modalı ayrıntıları | y 32 px; 0,8 sn; power3.out; stagger 0,1 sn |
| Soldan kart gelişi | Home ProjectsHighlights ve ProjectsList | 0,44 sn expo.out yatay maske; bütün içerik birlikte; ayrı metin girişi veya kartlar arasında batch gecikmesi yok |
| Genişliği kadar maskeli başlık kayması | Hero başlık satırları ve menü linkleri | yüzde 115 başlangıç kayması; 0,9 sn; expo.out. Satırın sağdan gelmesi kompozisyon yönüdür, süre/ease farkı değildir |
| Logo/icon pop | TechStackAccordion logoları, TechConstellation düğümleri, bölüm satırı ikonları | scale 0,5; rotation -80; 0,8 sn; back.out(1.5); stagger 0,07 sn |
| Magnet | Contact 01–04 ve CTA'nın iki başlık satırı, açıklaması, butonu | Etki yarıçapı 360 px; kuvvet 0,42; yakınlık üssü 1,25; x sınırı 28 px; y sınırı 22 px; 0,7 sn power3.out. Artık bileşen bazında çarpan yok |
| Pointer tilt | Tüm hero başlıkları, InterfaceSculpture; kaynakta kalan OrbitalSculpture ve ContactEnvelope | Normalize edilmiş konum; rotationY ±12°, rotationX ±10°; 0,7 sn power3.out; touch/reduced-motion'da kapalı |
| Proje kartı tilt | Home ve Projects kartları | Aynı x/y çarpanları: 0,108 / 0,122; aynı CSS hover kaldırması |
| Scroll parallax / scrub | Hero çıkışı, CTA satırları, outline marquee, arka plan halkaları, dekoratif objeler, yatay galeri | Ortak scrub 1 sn; sürekli scroll'a bağlı hareketler geri kaydırıldığında doğal olarak tersine gider. Mesafe ve eksen tasarımın parçasıdır |
| İlerleme göstergeleri | Sayfa üst barı, BackToTop çevre çizgisi, hero oku, galeri barı, Journey barı | Ortak 0,3 sn takip süresi. Ölçülen ilerleme alanı her göstergenin işlevine göre kalır |
| Programatik kaydırma | BackToTop ve Journey bölüm butonları | Ortak 1 sn power3.inOut; kullanıcı scroll'u devralınca autoKill |
| Doğrudan cursor takibi | Home galerisindeki Drag rozeti | Ortak pointer süresi/ease'i: 0,7 sn power3.out. Konumu doğrudan pointer merkezine bağlanır; magnetin yakınlık kuvveti uygulanmaz |
| Footer / menü halkaları | Footer'ın scroll hareketi ve menünün açılış timeline'ı | Aynı dokuz yol; aynı travel/sideways ölçekleri ve limitleri; scale 1,08 → 1; power3.inOut. Menü timeline süresi 0,78 sn; footer kullanıcı scroll'u ile ilerler |
| Sürekli kayan bant | Tüm MarqueeText örnekleri | Ortak 44 sn temel tur; aynı scroll hızı artışı ve aynı yumuşatma; ekran dışında ve gizli sekmede pause |
| Dekoratif sürekli dönüş | Marquee sembolleri, TechConstellation; kaynakta kalan orbital halkalar | Ortak 80 sn tur. Logo karşı dönüşü okunurluğu korumak için aynı sürede ters yöndedir |
| Boşta salınım | InterfaceSculpture kıvılcımları; kaynakta kalan gönderim zarfı | Ortak 3 sn sine.inOut; görünürlükle play/pause |
| Sayaç | Tüm RevealCounter kullanımları | Varsayılan 1,9 sn; aynı makara hesabı. Bölüm sayaçları kendi görünürlüklerine göre play/reverse; hero sayacı intro sıralamasından başlar |
| Renkli gradient akışı | Ortak CSS gradientleri, form odak başlıkları, accordion SVG gradientleri | Tek kaynaktan 22 sn. Ekran dışı/gizli sekme durdurma sistemi korunur |
| Hover gradient doldurma | GradientActionButton, sosyal butonlar, menü/footer/accordion başlıkları | Mevcut ortak CSS aileleri korunur; buton yazısı geçişi ortak pointer süresi/ease'i kullanır |

## Reverse veya tekrar davranışı düzeltilen yerler

- Proje kartları: tek kullanımlık `unobserve` kaldırıldı. Sabit dış kapsayıcı izleniyor, iç kart hareket ediyor; reverse sırasında görünürlük eşiğinde titreme önleniyor.
- Projects filtreleri: ortak kart reveal'ının üstüne eklenen ikinci farklı sonuç animasyonu kaldırıldı.
- CTA: `once` kaldırıldı; magnet ile reveal farklı kapsayıcı/property üzerinde çalışıyor.
- IdentityBand: tek seferlik harf reveal'ı ortak sisteme taşındı.
- MarqueeText: kelime girişi tekrar ediyor; bandın sürekli akışı görünürlük dışında duruyor, scroll hızına tepkisi korunuyor.
- InterfaceSculpture: katman girişi tekrar ediyor; boşta salınımın görünürlük yönetimi ortak.
- TechConstellation: halka ve ikon girişi tekrar ediyor; dönüşler ekran dışında ve gizli sekmede duruyor.
- Genel bölüm satırları, çizgileri ve ikonları: `once` kaldırıldı.
- About metin highlight'ları: yalnızca yukarı çıkışta sıfırlamak yerine her iki yönde aynı timeline reverse ediyor.
- Footer: metin ve bağlantılar kendi sabit maskelerinden izlenir; tüm footer'ın görünürlüğünü veya uzun bir sıralamayı beklemez.
- Başlık, kicker ve metin satırları: section'ın ortak zaman çizelgesi yerine kendi maskelerine göre hemen giriş ve ekran dışında reverse kullanır. CTA ve Toolkit metinleri de aynı kurala bağlıdır.
- Hero: header girişinden ayrı içerik timeline'ı ilk sayfa girişinden sonra başlar; hero tamamen çıkınca reverse, geri gelince baştan giriş. Sayfa intro'su yeniden oynatılmaz.
- Accordion içerikleri: yalnızca açık panel değişince çalışmak yerine scroll dönüşlerinde de aynı hook ile yeniden oynuyor.
- Journey: aktif bölüm değişimi ve ilerleme mantığı korunurken dış başlık/içerik/kontrol girişi ortak görünürlük sistemiyle tekrar ediyor.
- Sayaçlar: bölüm tamamlanmasına bağımlı tekrar tetikleme yerine kendi ortak görünürlük aboneliğini kullanıyor.
- Kaynakta bulunan ContactEnvelope: kullanılmaya başlanırsa girişi de ortak play/reverse ve tilt sistemini kullanacak.

## Ayrı davranış olması amaçlanan yerler

- PageIntro: route girişine bağlı sinematik sıralama; bitince unmount. Scroll reveal değildir.
- Menü ve proje modalı: aç/kapat eylemleriyle çalışır. Scroll çıkışında kapatılmaz; menü kendi timeline'ını reverse eder, modal kendi kapanışını oynar.
- Journey bölüm değişimi: scroll ilerlemesine bağlı sunumdur; aşağı/yukarı geçiş yönünü korur. İçeriğin tamamını rastgele tek reveal'a dönüştürmez.
- Hero çıkışı ve yatay galeri: scroll'a bağlı scrub/pin koreografisidir. Reveal farklı iç kapsayıcılar üzerinde çalışır; aynı transform iki sistem tarafından yönetilmez.
- Hero canvas izi: hız, yay ve sönümleme kullanan fizik efektidir. UI magnet/tilt ailesinin yerine geçirilmez.
- IdentityBand harf hover'ı: tek harfin elastik tepkisidir; magnet veya sürekli dönüş değildir.
- Form gönderim beklemesi/başarı kaplaması, arama odak çizgisi, BackToTop pop ve yukarı kaydırma: ilgili durum/eylem tarafından tetiklenir. Reveal görünürlüğü bu durumları yeniden başlatmaz.
- Dekoratif yüzey gradientleri, maskeler ve metin dolum oranı: scroll çizimi/ışıklandırmanın parçası olanlar marka rengi döngüsüyle aynı işlevde değildir.

## Tekrar kontrolü

`scripts/verify-reveal-lifecycle.mjs` dört sayfada hero, başlık, paragraf ve footer için giriş → ekran dışında kısa reverse → tekrar giriş ve hızlı geri dönüş döngülerini masaüstü/mobil boyutlarında kontrol eder. `verify-shelf-reveal.mjs` bütün kartın birlikte açılmasını ve reverse davranışını kontrol eder. Reduced-motion statik kalır.

```powershell
node scripts/verify-reveal-lifecycle.mjs
node scripts/verify-shelf-reveal.mjs
npm run lint
npm run build
```

Ham gözlem sonuçları `.artifacts/motion-system/report.json` altında tutulur. Bu test davranış doğrulamasıdır; FPS/bellek benchmark'ı değildir.

Son production turu: dört route × 1440/390 px görünüm; 31 kayıtlı davranış kontrolü başarılı, yakalanan tarayıcı JS hatası yok. Menü ve modal kapanışı ile dört route'ta reduced-motion kontrolü de geçti. Aynı 80/50 px pointer ofsetinde Contact ve CTA için ölçülen yer değiştirme iki yerde de x=22,981 px / y=14,3631 px oldu. Harici proje görsellerinin indirme başarısı bu davranış testinin kapsamı değildir.
