import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Brush, PenTool, Palette } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/features/HeroSection';
import GalleryGrid from '@/components/features/GalleryGrid';
import ServicesSection from '@/components/features/ServicesSection';
import AboutSection from '@/components/features/AboutSection';
import ReviewsSection from '@/components/features/ReviewsSection';
import FAQSection from '@/components/features/FAQSection';
import AssistantBot from '@/components/features/AssistantBot';
import WhatsAppButton from '@/components/features/WhatsAppButton';
import { incrementVisit, getSiteSettings, getStoredArtworks, getStoredServices } from '@/lib/storage';
import { ARTWORKS, SERVICES } from '@/constants/data';

export default function Index() {
  const s = getSiteSettings();

  useEffect(() => { incrementVisit(); }, []);

  // Merge artworks
  const storedArtworks = getStoredArtworks();
  const storedIds = new Set(storedArtworks.map(a => a.id));
  const allArtworks = [...storedArtworks, ...ARTWORKS.filter(a => !storedIds.has(a.id))];

  const storedServices = getStoredServices();
  const storedSvcIds = new Set(storedServices.map(s => s.id));
  const allServices = [...storedServices, ...SERVICES.filter(s => !storedSvcIds.has(s.id))];

  const featuredWorks = s.featuredWorkIds
    .map(id => allArtworks.find(a => a.id === id))
    .filter(Boolean) as typeof allArtworks;

  const categoryIcons = [
    { id: 'photography', label: 'تصوير', Icon: Camera },
    { id: 'painting', label: 'فن تشكيلي', Icon: Brush },
    { id: 'calligraphy', label: 'خط عربي', Icon: PenTool },
    { id: 'design', label: 'تصميم', Icon: Palette },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {s.showHero && <HeroSection />}

        {/* Type Cards */}
        {s.showTypesCards && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-ink-light">
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Link
                to="/gallery?tab=ready"
                className="glass-card rounded-2xl p-6 hover:border-amber/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber/15 flex items-center justify-center mb-4 group-hover:bg-amber/25 transition-colors">
                  <Brush size={22} className="text-amber" />
                </div>
                <h3 className="font-heading text-xl text-ivory mb-2">أعمال جاهزة</h3>
                <p className="font-body text-ivory-muted text-sm leading-relaxed">
                  قطع فنية أصلية متاحة للشراء والتسليم الفوري.
                </p>
                <div className="mt-4 flex items-center gap-2 text-amber text-sm font-body">
                  استعرض الأعمال <ArrowLeft size={14} />
                </div>
              </Link>
              <Link
                to="/gallery?tab=services"
                className="glass-card rounded-2xl p-6 hover:border-amber/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber/15 flex items-center justify-center mb-4 group-hover:bg-amber/25 transition-colors">
                  <PenTool size={22} className="text-amber" />
                </div>
                <h3 className="font-heading text-xl text-ivory mb-2">خدمات مخصصة</h3>
                <p className="font-body text-ivory-muted text-sm leading-relaxed">
                  اطلب عملاً فنياً مصمماً خصيصاً لك وفق رؤيتك.
                </p>
                <div className="mt-4 flex items-center gap-2 text-amber text-sm font-body">
                  احجز الآن <ArrowLeft size={14} />
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Category Icons */}
        {s.showCategories && (
          <section className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap justify-center gap-3">
                {categoryIcons.map(({ id, label, Icon }) => (
                  <Link
                    key={id}
                    to={`/gallery?category=${id}`}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border hover:border-amber/40 hover:bg-amber/5 text-ivory-muted hover:text-amber transition-all font-body text-sm"
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Works */}
        {s.showFeatured && featuredWorks.length > 0 && (
          <section id="gallery-preview" className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-amber text-sm font-body mb-2">أعمال مختارة</p>
                  <h2 className="font-heading text-3xl sm:text-4xl text-ivory">الأعمال المميزة</h2>
                </div>
                <Link to="/gallery" className="hidden sm:flex items-center gap-2 text-amber hover:text-amber-light transition-colors text-sm font-body">
                  عرض الكل <ArrowLeft size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredWorks.slice(0, 4).map((artwork, idx) => (
                  <Link key={artwork.id} to={`/gallery?artwork=${artwork.id}`} className={`group relative rounded-2xl overflow-hidden ${idx === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}>
                    <div className={`relative ${idx === 0 ? 'h-64 sm:h-full min-h-[280px]' : 'h-48'} bg-indigo`}>
                      <img
                        src={artwork.images[0]}
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="font-body text-ivory text-sm font-medium">{artwork.title}</p>
                        <p className="text-amber text-xs font-body">
                          {artwork.isPriceOnRequest ? 'حسب الطلب' : `${artwork.price?.toLocaleString()} د.ل`}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center sm:hidden">
                <Link to="/gallery" className="inline-flex items-center gap-2 text-amber hover:text-amber-light text-sm font-body">
                  عرض جميع الأعمال <ArrowLeft size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Gallery Grid (non-featured view) */}
        {!s.showFeatured && (
          <section id="gallery-preview" className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <GalleryGrid limit={6} showTabs={false} />
            </div>
          </section>
        )}

        {s.showAbout && <AboutSection />}
        {s.showReviews && <ReviewsSection />}
        <ServicesSection />
        <FAQSection />
      </main>

      <Footer />
      <AssistantBot />
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
}
