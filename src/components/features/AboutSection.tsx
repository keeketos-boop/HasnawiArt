import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getSiteSettings } from '@/lib/storage';
import tuaregSeal from '@/assets/tuareg-seal.png';

export default function AboutSection({ full = false }: { full?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const s = getSiteSettings();

  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden aspect-square max-w-md mx-auto lg:mx-0">
              <img
                src={s.artistPhoto}
                alt={s.artistName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?w=400&q=80';
                }}
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
            <h2 className="font-heading text-3xl sm:text-4xl text-ivory mb-6">{s.artistName}</h2>
            <p className="font-heading text-xl text-ivory-muted mb-4">{s.artistTitle}</p>

            <p className="font-body text-ivory-muted leading-relaxed text-base mb-4">
              {s.artistShortBio}
            </p>

            {(expanded || full) && (
              <div className="space-y-3 animate-fade-in">
                {s.artistFullBio.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="font-body text-ivory-muted leading-relaxed text-sm">{para}</p>
                ))}
              </div>
            )}

            {!full && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-amber hover:text-amber-light transition-colors text-sm font-body mt-4"
              >
                {expanded ? <><ChevronUp size={16} /> اقرأ أقل</> : <><ChevronDown size={16} /> اقرأ المزيد</>}
              </button>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {['خط عربي', 'تصوير فوتوغرافي', 'فن تشكيلي', 'تصميم', 'بورتريه', 'أكريليك', 'مائي'].map(skill => (
                <span key={skill} className="px-3 py-1 rounded-full border border-amber/30 text-amber text-xs font-body bg-amber/5">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
