import { useState, useEffect } from 'react';
import { ArtCategory, ArtTab, Artwork, Service } from '@/types';
import { ARTWORKS, SERVICES, DEFAULT_CATEGORIES } from '@/constants/data';
import { getStoredArtworks, getStoredServices, getStoredCategories } from '@/lib/storage';
import LightboxModal from './LightboxModal';
import { Eye, ShoppingBag, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GalleryGridProps {
  limit?: number;
  showTabs?: boolean;
  showFilters?: boolean;
  initialCategory?: ArtCategory;
}

export default function GalleryGrid({ limit, showTabs = true, showFilters = true, initialCategory = 'all' }: GalleryGridProps) {
  const [activeTab, setActiveTab] = useState<ArtTab>('ready');
  const [activeCategory, setActiveCategory] = useState<ArtCategory>(initialCategory);
  const [lightboxWork, setLightboxWork] = useState<Artwork | null>(null);
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Merge default + stored artworks (stored take priority by ID)
  const storedArtworks = getStoredArtworks();
  const storedArtworkIds = new Set(storedArtworks.map(a => a.id));
  const allArtworks: Artwork[] = [
    ...storedArtworks,
    ...ARTWORKS.filter(a => !storedArtworkIds.has(a.id)),
  ];

  const storedServices = getStoredServices();
  const storedServiceIds = new Set(storedServices.map(s => s.id));
  const allServices: Service[] = [
    ...storedServices,
    ...SERVICES.filter(s => !storedServiceIds.has(s.id)),
  ];

  const storedCats = getStoredCategories();
  const storedCatIds = new Set(storedCats.map(c => c.id));
  const allCategories = [
    { id: 'all', label: 'الكل', color: '#D4722A' },
    ...storedCats,
    ...DEFAULT_CATEGORIES.filter(c => !storedCatIds.has(c.id)),
  ];

  const filteredArtworks = allArtworks
    .filter(a => !a.isArchived)
    .filter(a => activeCategory === 'all' || a.category === activeCategory)
    .filter(a => !search || a.title.includes(search) || a.description?.includes(search))
    .slice(0, limit);

  const filteredServices = allServices
    .filter(s => !s.isArchived)
    .filter(s => activeCategory === 'all' || s.category === activeCategory);

  return (
    <div>
      {/* Tabs */}
      {showTabs && (
        <div className="flex gap-2 mb-6">
          {[
            { id: 'ready' as ArtTab, label: 'أعمال جاهزة', count: allArtworks.filter(a => !a.isArchived).length },
            { id: 'services' as ArtTab, label: 'خدمات مخصصة', count: allServices.filter(s => !s.isArchived).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveCategory('all'); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-body transition-all ${
                activeTab === tab.id
                  ? 'amber-gradient text-ink font-medium shadow-lg shadow-amber/20'
                  : 'border border-border text-ivory-muted hover:border-amber/40 hover:text-ivory'
              }`}
            >
              {tab.label}
              <span className={`mr-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-ink/20' : 'bg-border'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'ready' ? (
        <>
          {showFilters && (
            <div className="space-y-3 mb-6">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {allCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as ArtCategory)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-body transition-all ${
                      activeCategory === cat.id
                        ? 'bg-amber text-ink font-medium'
                        : 'border border-border text-ivory-muted hover:border-amber/40 hover:text-ivory'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="relative max-w-xs">
                <Search size={14} className="absolute top-1/2 right-3 -translate-y-1/2 text-silver" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث في الأعمال..."
                  className="w-full bg-background/50 border border-border rounded-xl pr-9 pl-4 py-2 text-ivory text-sm font-body placeholder:text-silver focus:outline-none focus:border-amber/50 transition-colors"
                />
              </div>
            </div>
          )}

          {filteredArtworks.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-indigo flex items-center justify-center mx-auto mb-4">
                <Eye size={32} className="text-silver" />
              </div>
              <p className="font-heading text-xl text-ivory-muted mb-2">لا توجد أعمال في هذا التصنيف</p>
              <button
                onClick={() => { setActiveCategory('all'); setSearch(''); }}
                className="mt-2 text-amber hover:underline font-body text-sm"
              >
                عرض جميع الأعمال
              </button>
            </div>
          ) : (
            <div className="masonry-grid">
              {filteredArtworks.map(artwork => (
                <div
                  key={artwork.id}
                  className="masonry-item group cursor-pointer"
                  onClick={() => setLightboxWork(artwork)}
                >
                  <div className="relative rounded-xl overflow-hidden bg-indigo">
                    {!loaded.has(artwork.id) && (
                      <div className="absolute inset-0 bg-indigo animate-pulse" style={{ aspectRatio: '3/4' }} />
                    )}
                    <img
                      src={artwork.images[0]}
                      alt={artwork.title}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onLoad={() => setLoaded(p => new Set([...p, artwork.id]))}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 p-3 w-full">
                        <p className="font-body text-ivory text-sm font-medium leading-tight mb-1">{artwork.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-amber text-sm font-body">
                            {artwork.isPriceOnRequest ? 'حسب الطلب' : `${artwork.price?.toLocaleString()} د.ل`}
                          </span>
                          <span className="text-xs text-silver bg-ink/60 px-2 py-0.5 rounded-full">
                            {allCategories.find(c => c.id === artwork.category)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-ink/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={14} className="text-ivory" />
                    </div>
                    {artwork.isFeatured && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber/90 text-ink text-[10px] font-body font-medium">
                        مميز
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map(service => (
            <div key={service.id} className="glass-card rounded-2xl overflow-hidden hover:border-amber/40 transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.coverImage}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                {service.requiresDeposit && (
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xs bg-amber/20 text-amber border border-amber/30 px-2 py-0.5 rounded-full font-body">يتطلب عربون</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-heading text-lg text-ivory mb-2">{service.title}</h3>
                <p className="font-body text-ivory-muted text-sm leading-relaxed mb-3 line-clamp-2">{service.description}</p>
                <ul className="space-y-1 mb-3">
                  {service.details.slice(0, 3).map((d, i) => (
                    <li key={i} className="text-xs text-ivory-muted font-body flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between text-sm font-body mb-3">
                  <span className="text-amber font-medium">{service.priceRange}</span>
                  <span className="text-silver">{service.duration}</span>
                </div>
                <Link
                  to={`/order?service=${service.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-amber/30 text-amber hover:bg-amber/10 transition-all text-sm font-body"
                  onClick={e => e.stopPropagation()}
                >
                  <ShoppingBag size={15} />
                  احجز هذه الخدمة
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxWork && (
        <LightboxModal
          artwork={lightboxWork}
          allArtworks={filteredArtworks}
          onClose={() => setLightboxWork(null)}
          onNavigate={setLightboxWork}
        />
      )}
    </div>
  );
}
