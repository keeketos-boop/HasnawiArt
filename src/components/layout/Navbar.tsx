import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import tuaregSeal from '@/assets/tuareg-seal.png';

const NAV_LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/gallery', label: 'المعرض' },
  { href: '/order', label: 'اطلب / احجز' },
  { href: '/about', label: 'نبذة عني' },
  { href: '/#reviews', label: 'التقييمات' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href.replace('/#', '/'));

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={tuaregSeal} alt="ختم الحسناوي" className="w-9 h-9 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="hidden sm:block">
              <div className="font-heading text-lg text-ivory leading-none">عبد العزيز</div>
              <div className="text-amber text-xs font-body">الحسناوي</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-body transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-amber bg-amber/10'
                    : 'text-ivory-muted hover:text-ivory hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-ivory-muted hover:text-ivory hover:bg-white/5 transition-all"
              aria-label="تبديل الوضع"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/order"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg amber-gradient text-ink text-sm font-medium font-body transition-all hover:opacity-90 active:scale-95"
            >
              اطلب الآن
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-ivory-muted hover:text-ivory hover:bg-white/5 transition-all"
              aria-label="القائمة"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-slide-up">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-body transition-all ${
                  isActive(link.href)
                    ? 'text-amber bg-amber/10'
                    : 'text-ivory-muted hover:text-ivory hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
