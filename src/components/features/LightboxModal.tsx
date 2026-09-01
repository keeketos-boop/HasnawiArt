import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Share2, ShoppingBag, ExternalLink } from 'lucide-react';
import { Artwork } from '@/types';
import { DEFAULT_CATEGORIES } from '@/constants/data';
import { getSiteSettings, getStoredCategories } from '@/lib/storage';
import { Link } from 'react-router-dom';

interface LightboxModalProps {
  artwork: Artwork;
  allArtworks: Artwork[];
  onClose: () => void;
  onNavigate: (artwork: Artwork) => void;
}

export default function LightboxModal({ artwork, allArtworks, onClose, onNavigate }: LightboxModalProps) {
  const [activeImg, setActiveImg] = useState(0);
  const currentIdx = allArtworks.findIndex(a => a.id === artwork.id);

  useEffect(() => {
    setActiveImg(0);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') navigateNext();
      if (e.key === 'ArrowRight') navigatePrev();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [artwork.id]);

  const navigatePrev = () => {
    if (currentIdx > 0) onNavigate(allArtworks[currentIdx - 1]);
  };

  const navigateNext = () => {
    if (currentIdx < allArtworks.length - 1) onNavigate(allArtworks[currentIdx + 1]);
  };

  const shareOnWhatsApp = () => {
    const msg = `أعجبني هذا العمل الفني: "${artwork.title}" من معرض عبد العزيز الحسناوي`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const storedCats = getStoredCategories();
  const storedCatIds = new Set(storedCats.map(c => c.id));
  const allCategories = [...storedCats, ...DEFAULT_CATEGORIES.filter(c => !storedCatIds.has(c.id))];
  const { whatsappNumber } = getSiteSettings();

  const categoryLabel = allCategories.find(c => c.id === artwork.category)?.label;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-xl" />

      <div
        className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col lg:flex-row gap-4 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Image Area */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="relative rounded-2xl overflow-hidden bg-indigo flex-1 max-h-[50vh] lg:max-h-[70vh]">
            <img
              src={artwork.images[activeImg]}
              alt={artwork.title}
              className="w-full h-full object-contain"
            />
            {/* Nav Arrows */}
            <button
              onClick={navigatePrev}
              disabled={currentIdx === 0}
              className="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 rounded-full bg-ink/70 flex items-center justify-center text-ivory disabled:opacity-30 hover:bg-ink transition-all"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={navigateNext}
              disabled={currentIdx === allArtworks.length - 1}
              className="absolute top-1/2 left-3 -translate-y-1/2 w-10 h-10 rounded-full bg-ink/70 flex items-center justify-center text-ivory disabled:opacity-30 hover:bg-ink transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 left-3 w-10 h-10 rounded-full bg-ink/70 flex items-center justify-center text-ivory hover:bg-ink transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Thumbnails */}
          {artwork.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {artwork.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImg === i ? 'border-amber' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="lg:w-72 glass-card rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <span className="text-xs text-amber font-body bg-amber/10 px-2 py-0.5 rounded-full">{categoryLabel}</span>
            <h2 className="font-heading text-2xl text-ivory mt-2">{artwork.title}</h2>
          </div>

          {artwork.description && (
            <p className="font-body text-ivory-muted text-sm leading-relaxed">{artwork.description}</p>
          )}

          <div className="space-y-2">
            {artwork.dimensions && (
              <div className="flex items-center justify-between text-sm font-body">
                <span className="text-silver">الأبعاد</span>
                <span className="text-ivory">{artwork.dimensions}</span>
              </div>
            )}
            {artwork.technique && (
              <div className="flex items-center justify-between text-sm font-body">
                <span className="text-silver">التقنية</span>
                <span className="text-ivory">{artwork.technique}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-body">
              <span className="text-silver">السعر</span>
              <span className="text-amber font-medium text-base">
                {artwork.isPriceOnRequest ? 'حسب الطلب' : `${artwork.price?.toLocaleString()} د.ل`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-auto">
            <Link
              to={`/order?artwork=${artwork.id}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl amber-gradient text-ink font-medium font-body hover:opacity-90 transition-all text-sm"
            >
              <ShoppingBag size={16} />
              اطلب هذا العمل
            </Link>
            <button
              onClick={shareOnWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-ivory-muted hover:border-amber/40 hover:text-ivory transition-all text-sm font-body"
            >
              <Share2 size={15} />
              مشاركة عبر واتساب
            </button>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`مرحباً، أستفسر عن العمل: "${artwork.title}"`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-ivory-muted hover:border-amber/40 hover:text-ivory transition-all text-sm font-body"
            >
              <ExternalLink size={15} />
              استفسار مباشر
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
