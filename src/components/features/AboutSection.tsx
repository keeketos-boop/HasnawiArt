import { useState, useEffect } from 'react';
import { fetchSiteSettings } from '@/lib/api';
import { DEFAULT_SETTINGS } from '@/lib/defaults';
import type { SiteSettings } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import tuaregSeal from '@/assets/tuareg-seal.png';

export default function AboutSection({ full = false }: { full?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchSiteSettings().then(setSettings);
  }, []);

  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden aspect-square max-w-md mx-auto lg:mx-0">
              <img
                src={settings.artistPhoto}
                alt={settings.artistName}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?w=400&q=80'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-indigo border-2 border-amber/30 flex items-center justify-center shadow-lg">
              <img src={tuaregSeal} alt="ختم" className="w-12 h-12" />
            </div>
            <div className="absolute -top-3 -right-3 w-full h-full rounded-2xl border border-amber/20 max-w-md pointer-events-none" />
          </div>
          {/* Text */}
          <div>
            <p className="text-amber text-sm font-body mb-2">من أنا</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-ivory mb-6">{settings.artistName}</h2>
            <p className="font-heading text-xl text-ivory-muted mb-4">{settings.artistTitle}</p>
            <p className="font-body text-ivory-muted leading-relaxed text-base mb-4">{settings.artistShortBio}</p>
            {(expanded || full) && (
              <div className="space-y-3">
                {settings.artistFullBio.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="font-body text-ivory-muted leading-relaxed text-sm">{para}</p>
                ))}
              </div>
            )}
            {!full && (
              <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-amber hover:text-amber-light transition-colors text-sm font-body mt-4">
                {expanded ? <><ChevronUp size={16} /> اقرأ أقل</> : <><ChevronDown size={16} /> اقرأ المزيد</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
