import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Star, MoreHorizontal, ShoppingBag } from 'lucide-react';

const BOTTOM_LINKS = [
  { href: '/', label: 'الرئيسية', Icon: Home },
  { href: '/gallery', label: 'المعرض', Icon: Grid3X3 },
  { href: '/order', label: 'اطلب', Icon: ShoppingBag, isCenter: true },
  { href: '/#reviews', label: 'التقييمات', Icon: Star },
  { href: '/about', label: 'نبذة', Icon: MoreHorizontal },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href.replace('/#', '/'));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
      <div className="flex items-center justify-around h-16 px-2">
        {BOTTOM_LINKS.map(({ href, label, Icon, isCenter }) => (
          <Link
            key={href}
            to={href}
            className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center rounded-xl transition-all ${
              isCenter
                ? 'w-14 h-14 -mt-6 rounded-2xl amber-gradient shadow-lg shadow-amber/30 text-ink'
                : isActive(href)
                ? 'text-amber'
                : 'text-ivory-muted'
            }`}
          >
            <Icon size={isCenter ? 22 : 20} />
            <span className={`font-body ${isCenter ? 'text-[9px] font-semibold text-ink' : 'text-[10px]'}`}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
