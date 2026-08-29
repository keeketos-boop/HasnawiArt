import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Image, Package, ShoppingBag, Users, Star,
  Settings, LogOut, Menu, X, Tag, User, Globe, Bot, HardDrive,
  Bell, ExternalLink, BarChart2
} from 'lucide-react';
import { adminLogout, getUnreadCount } from '@/lib/storage';
import tuaregSeal from '@/assets/tuareg-seal.png';

const NAV_ITEMS = [
  { href: '/admin', label: 'الرئيسية', Icon: LayoutDashboard, exact: true },
  { href: '/admin/works', label: 'الأعمال الجاهزة', Icon: Image },
  { href: '/admin/services', label: 'الخدمات المخصصة', Icon: Package },
  { href: '/admin/categories', label: 'التصنيفات', Icon: Tag },
  { href: '/admin/orders', label: 'الطلبات', Icon: ShoppingBag },
  { href: '/admin/customers', label: 'العملاء', Icon: Users },
  { href: '/admin/reviews', label: 'التقييمات', Icon: Star },
  { href: '/admin/referrals', label: 'الإحالات والنقاط', Icon: BarChart2 },
  { href: '/admin/profile', label: 'الملف الشخصي', Icon: User },
  { href: '/admin/homepage', label: 'محتوى الرئيسية', Icon: Globe },
  { href: '/admin/bot', label: 'البوت المساعد', Icon: Bot },
  { href: '/admin/media', label: 'مكتبة الوسائط', Icon: HardDrive },
  { href: '/admin/notifications', label: 'الإشعارات', Icon: Bell },
  { href: '/admin/settings', label: 'الإعدادات', Icon: Settings },
];

interface AdminSidebarProps {
  onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const unread = getUnreadCount();

  const handleLogout = () => { adminLogout(); onLogout(); };

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname === href || location.pathname.startsWith(href + '/');

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={tuaregSeal} alt="لوحة التحكم" className="w-9 h-9 opacity-70 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-100 truncate">لوحة التحكم</p>
            <p className="text-xs text-gray-400">الحسناوي — مدير</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, Icon, exact }) => (
          <Link
            key={href}
            to={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              isActive(href, exact)
                ? 'bg-amber-600/20 text-amber-400 font-medium border border-amber-600/20'
                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700/50'
            }`}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="truncate">{label}</span>
            {href === '/admin/notifications' && unread > 0 && (
              <span className="mr-auto bg-amber-600 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-700/50 flex-shrink-0 space-y-0.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-700/50 transition-all"
          onClick={() => setOpen(false)}
        >
          <ExternalLink size={16} />
          عرض الموقع
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-all"
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 right-4 z-[60] w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 right-0 h-full z-50 w-60 bg-gray-900 border-l border-gray-700/50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <NavContent />
      </aside>
    </>
  );
}
