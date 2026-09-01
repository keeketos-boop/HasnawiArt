import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { getSiteSettings } from '@/lib/storage';

export default function HeroSection() {
  const s = getSiteSettings();

  const scrollDown = () => {
    document.getElementById('gallery-preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {s.heroBackground ? (
          <img src={s.heroBackground} alt="خلفية" className="w-full h-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,35%,10%)] via-[hsl(230,30%,8%)] to-[hsl(25,40%,12%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink" />
      </div>

      {/* Geometric decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 border border-amber/10 rounded-full" />
        <div className="absolute top-32 left-20 w-52 h-52 border border-amber/15 rounded-full" />
        <div className="absolute bottom-40 right-10 w-96 h-96 border border-amber/8 rounded-full" />
        <div className="absolute top-10 right-1/4 w-32 h-32 border border-amber/12 rotate-45" />
        <div className="absolute bottom-20 left-1/3 w-24 h-24 border border-amber/10 rotate-12" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-5 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(25, 75%, 50%), transparent 70%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber/30 bg-amber/5 text-amber text-xs font-body mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
            متاح للطلبات الجديدة
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl lg:text-8xl text-ivory leading-tight mb-4 animate-slide-up">
            {s.heroTitle.split(' ')[0]}
            <br />
            <span className="text-amber">{s.heroTitle.split(' ').slice(1).join(' ')}</span>
          </h1>

          <p className="font-heading text-xl sm:text-2xl text-ivory-muted mb-3">{s.heroSubtitle}</p>

          <p className="font-body text-ivory-muted leading-relaxed text-base sm:text-lg mb-8 max-w-lg">
            {s.heroBio}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/gallery"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl amber-gradient text-ink font-medium font-body hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-amber/20"
            >
              {s.heroCta1}
              <ArrowLeft size={18} />
            </Link>
            <Link
              to="/order"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-amber/30 text-ivory font-body hover:border-amber/60 hover:bg-amber/5 transition-all"
            >
              {s.heroCta2}
            </Link>
          </div>

          {/* Stats */}
          {s.showStats && (
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-border/40">
              {[
                { num: s.statsWorks, label: 'عمل فني' },
                { num: s.statsYears, label: 'سنوات خبرة' },
                { num: s.statsClients, label: 'عميل راضٍ' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="font-heading text-3xl text-amber">{stat.num}</div>
                  <div className="font-body text-ivory-muted text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ivory-muted hover:text-amber transition-colors"
      >
        <span className="text-xs font-body">استعرض</span>
        <ChevronDown size={20} className="animate-bounce" />
      </button>
    </section>
  );
}
