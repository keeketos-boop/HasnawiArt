import { Link } from 'react-router-dom';
import tuaregSeal from '@/assets/tuareg-seal.png';
import { getSiteSettings } from '@/lib/storage';
import { Instagram, Facebook, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  const s = getSiteSettings();

  return (
    <footer className="bg-ink-light border-t border-border/40 py-10 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={tuaregSeal} alt="ختم" className="w-10 h-10 opacity-80" />
              <div>
                <div className="font-heading text-xl text-ivory">{s.artistName}</div>
                <div className="text-amber text-sm font-body">{s.artistTitle}</div>
              </div>
            </div>
            <p className="text-ivory-muted text-sm font-body leading-relaxed mb-4">
              {s.artistShortBio}
            </p>
            <div className="flex gap-3">
              <a href={`https://wa.me/${s.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-green-700/30 flex items-center justify-center text-green-400 hover:bg-green-700/50 transition-colors"><MessageCircle size={16} /></a>
              {s.instagramUrl && <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-border flex items-center justify-center text-ivory-muted hover:text-amber transition-colors"><Instagram size={16} /></a>}
              {s.facebookUrl && <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-border flex items-center justify-center text-ivory-muted hover:text-amber transition-colors"><Facebook size={16} /></a>}
              {s.emailAddress && <a href={`mailto:${s.emailAddress}`} className="w-9 h-9 rounded-lg bg-border flex items-center justify-center text-ivory-muted hover:text-amber transition-colors"><Mail size={16} /></a>}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading text-ivory mb-4">روابط سريعة</h3>
            <div className="flex flex-col gap-2">
              {[
                { href: '/gallery', label: 'معرض الأعمال' },
                { href: '/order', label: 'اطلب خدمة' },
                { href: '/about', label: 'نبذة عني' },
                { href: '/#reviews', label: 'التقييمات' },
              ].map(link => (
                <Link key={link.href} to={link.href} className="text-ivory-muted hover:text-amber text-sm font-body transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-ivory mb-4">تواصل معي</h3>
            <div className="flex flex-col gap-2 text-sm font-body text-ivory-muted">
              <span>غات — فزان، ليبيا</span>
              <a href={`https://wa.me/${s.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-amber hover:text-amber-light transition-colors">
                واتساب: {s.whatsappNumber}
              </a>
              {s.emailAddress && <a href={`mailto:${s.emailAddress}`} className="text-amber hover:text-amber-light transition-colors">{s.emailAddress}</a>}
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-silver text-xs font-body">
            © {new Date().getFullYear()} {s.artistName} — جميع الحقوق محفوظة
          </p>
          <Link to="/admin" className="text-silver/40 hover:text-silver text-xs font-body transition-colors">
            لوحة التحكم
          </Link>
        </div>
      </div>
    </footer>
  );
}
