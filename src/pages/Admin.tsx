import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAdminLoggedIn, adminLogin, getOrders, getUnreadCount, markAllNotificationsRead, getNotifications } from '@/lib/storage';
import AdminSidebar from '@/components/features/admin/AdminSidebar';
import AdminStats from '@/components/features/admin/AdminStats';
import AdminWorksPage from './admin/AdminWorksPage';
import AdminOrdersPage from './admin/AdminOrdersPage';
import AdminReviewsPage from './admin/AdminReviewsPage';
import AdminSettingsPage from './admin/AdminSettingsPage';
import AdminServicesPage from './admin/AdminServicesPage';
import AdminCategoriesPage from './admin/AdminCategoriesPage';
import AdminCustomersPage from './admin/AdminCustomersPage';
import AdminReferralsPage from './admin/AdminReferralsPage';
import AdminProfilePage from './admin/AdminProfilePage';
import AdminHomepagePage from './admin/AdminHomepagePage';
import AdminBotPage from './admin/AdminBotPage';
import AdminMediaPage from './admin/AdminMediaPage';
import AdminNotificationsPage from './admin/AdminNotificationsPage';
import { Eye, EyeOff, Lock, Bell, X } from 'lucide-react';
import tuaregSeal from '@/assets/tuareg-seal.png';
import { REVIEWS } from '@/constants/data';
import { getReviews } from '@/lib/storage';

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(password)) { onLogin(); }
    else { setError('كلمة المرور غير صحيحة'); }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={tuaregSeal} alt="ختم" className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-xl font-semibold text-gray-100 mb-1">لوحة تحكم الحسناوي</h1>
          <p className="text-sm text-gray-400">أدخل كلمة المرور للوصول</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">كلمة المرور</label>
            <div className="relative">
              <Lock size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pr-10 pl-10 py-3 text-gray-100 text-sm focus:outline-none focus:border-amber-500/60 transition-colors placeholder:text-gray-600"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-gray-900 font-semibold text-sm transition-colors">
            دخول
          </button>
          <p className="text-xs text-gray-600 text-center">كلمة المرور التجريبية: admin2024</p>
        </form>
      </div>
    </div>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = getNotifications().slice(0, 8);
  const unread = getUnreadCount();

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) markAllNotificationsRead(); }} className="relative w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors">
        <Bell size={16} />
        {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-gray-900 text-[9px] font-bold flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="absolute left-0 top-11 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <span className="text-sm font-medium text-gray-200">الإشعارات</span>
            <button onClick={() => setOpen(false)}><X size={14} className="text-gray-400" /></button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-xs py-6">لا توجد إشعارات</p>
            ) : notifications.map(n => (
              <div key={n.id} className={`px-4 py-3 border-b border-gray-700/50 hover:bg-gray-700/30 ${!n.isRead ? 'bg-amber-900/5' : ''}`}>
                <p className="text-xs font-medium text-gray-200">{n.title}</p>
                <p className="text-xs text-gray-500 truncate">{n.message}</p>
                <p className="text-xs text-gray-600 mt-0.5">{new Date(n.dateCreated).toLocaleString('ar-LY', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const orders = getOrders();
  const recentOrders = orders.slice(0, 5);
  const allReviews = [...REVIEWS, ...getReviews()];
  const publishedReviews = allReviews.filter(r => r.status === 'published');
  const avgRating = publishedReviews.length > 0 ? (publishedReviews.reduce((s, r) => s + r.rating, 0) / publishedReviews.length).toFixed(1) : '—';

  // Last 7 days orders chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    return {
      day: d.toLocaleDateString('ar-LY', { weekday: 'short' }),
      count: orders.filter(o => new Date(o.dateCreated).toDateString() === dateStr).length,
    };
  });
  const maxCount = Math.max(...last7.map(d => d.count), 1);

  const STATUS_LABELS: Record<string, string> = {
    new: 'جديد', preparing: 'قيد التجهيز', ready: 'جاهز',
    delivered: 'تم التسليم', completed: 'مكتمل', cancelled: 'ملغي',
    awaiting_deposit: 'بانتظار العربون', deposit_received: 'عربون مستلم', in_progress: 'قيد التنفيذ',
  };
  const STATUS_COLORS: Record<string, string> = {
    new: 'bg-blue-900/50 text-blue-300', preparing: 'bg-yellow-900/50 text-yellow-300',
    ready: 'bg-purple-900/50 text-purple-300', delivered: 'bg-green-900/50 text-green-300',
    completed: 'bg-green-900/70 text-green-200', cancelled: 'bg-red-900/50 text-red-300',
    awaiting_deposit: 'bg-orange-900/50 text-orange-300', deposit_received: 'bg-teal-900/50 text-teal-300',
    in_progress: 'bg-indigo-900/50 text-indigo-300',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-100 mb-1">لوحة التحكم</h1>
        <p className="text-sm text-gray-400">أهلاً بك أستاذ عبد العزيز 👋</p>
      </div>

      <AdminStats />

      {/* Chart */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">الطلبات — آخر 7 أيام</h2>
        <div className="flex items-end gap-2 h-28">
          {last7.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{d.count > 0 ? d.count : ''}</span>
              <div
                className="w-full rounded-t-lg bg-amber-600/60 hover:bg-amber-600 transition-colors"
                style={{ height: `${(d.count / maxCount) * 80 + (d.count > 0 ? 8 : 2)}px`, minHeight: '4px' }}
              />
              <span className="text-[10px] text-gray-500">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders + Last Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-700/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-200">آخر الطلبات</h2>
            <span className="text-xs text-gray-500">{orders.length} إجمالي</span>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">لا توجد طلبات بعد</div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 font-medium truncate">{order.customerName}</p>
                    <p className="text-xs text-gray-500 truncate">{order.orderNumber} · {order.artworkTitle || order.serviceTitle}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 mr-2 ${STATUS_COLORS[order.status] || 'bg-gray-700 text-gray-400'}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-700/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-200">آخر التقييمات</h2>
            <span className="text-xs text-amber-400">⭐ {avgRating}/5</span>
          </div>
          {publishedReviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">لا توجد تقييمات</div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {publishedReviews.slice(0, 5).map(r => (
                <div key={r.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-200">{r.customerName}</p>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <span key={i} className={i <= r.rating ? 'text-amber-400' : 'text-gray-600'} style={{ fontSize: '11px' }}>★</span>)}</div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">"{r.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex" dir="rtl">
      <AdminSidebar onLogout={() => setLoggedIn(false)} />
      <main className="flex-1 overflow-auto min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-6 py-3 flex items-center justify-between lg:pr-6 pr-14">
          <div className="text-xs text-gray-500 hidden sm:block">لوحة تحكم — عبد العزيز الحسناوي</div>
          <NotificationBell />
        </div>
        <div className="p-5 lg:p-6 max-w-7xl">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/works" element={<AdminWorksPage />} />
            <Route path="/services" element={<AdminServicesPage />} />
            <Route path="/categories" element={<AdminCategoriesPage />} />
            <Route path="/orders" element={<AdminOrdersPage />} />
            <Route path="/customers" element={<AdminCustomersPage />} />
            <Route path="/reviews" element={<AdminReviewsPage />} />
            <Route path="/referrals" element={<AdminReferralsPage />} />
            <Route path="/profile" element={<AdminProfilePage />} />
            <Route path="/homepage" element={<AdminHomepagePage />} />
            <Route path="/bot" element={<AdminBotPage />} />
            <Route path="/media" element={<AdminMediaPage />} />
            <Route path="/notifications" element={<AdminNotificationsPage />} />
            <Route path="/settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
