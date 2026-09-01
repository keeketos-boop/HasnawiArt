import { useState, useEffect } from 'react';
import { fetchSiteSettings } from '@/lib/api';
import type { SiteSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/defaults';
import { ArrowDown, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';
import tuaregSeal from '@/assets/tuareg-seal.png';

interface HeroSectionProps {
  settings?: SiteSettings;
}

export default function HeroSection({ settings: propSettings }: HeroSectionProps) {
  const [settings, setSettings] = useState<SiteSettings>(propSettings || DEFAULT_SETTINGS);

  useEffect(() => {
    if (!propSettings) {
      fetchSiteSettings().then(setSettings);
    }
  }, [propSettings]);

  useEffect(() => {
    if (propSettings) setSettings(propSettings);
  }, [propSettings]);

  const bgImage = settings.heroBackground || heroBg;

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Overlays */}
      <div className="absolute inset-0 bg-ink/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Decorative Seal */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none">
        <img src={tuaregSeal} alt="" className="w-48 h-48" />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber/30 bg-amber/5 mb-6">
          <Star size={12} className="text-amber fill-amber" />
          <span className="font-body text-amber text-xs">{settings.heroSubtitle}</span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-ivory mb-4 leading-tight">
          {settings.heroTitle}
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-px bg-amber/50" />
          <img src={tuaregSeal} alt="" className="w-6 h-6 opacity-70" />
          <div className="w-12 h-px bg-amber/50" />
        </div>

        {/* Bio */}
        <p className="font-body text-ivory-muted text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          {settings.heroBio}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/gallery"
            className="px-8 py-4 rounded-2xl amber-gradient text-ink font-body font-semibold text-base hover:opacity-90 transition-all shadow-lg shadow-amber/25"
          >
            {settings.heroCta1}
          </Link>
          <Link
            to="/order"
            className="px-8 py-4 rounded-2xl border border-ivory/30 text-ivory font-body font-medium text-base hover:border-amber/50 hover:text-amber transition-all"
          >
            {settings.heroCta2}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ivory-muted animate-bounce">
        <span className="font-body text-xs">اكتشف</span>
        <ArrowDown size={16} />
      </div>
    </section>
  );
}
