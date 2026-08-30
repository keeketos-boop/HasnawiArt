import { useState, useEffect } from 'react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api';
import type { Notification } from '@/types';
import { Bell, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'order' | 'review' | 'inquiry'>('all');

  const load = async () => {
    const data = await fetchNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleReadAll = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('تم تحديد الكل كمقروء');
  };

  const filtered = notifications.filter(n => filter === 'all' || n.type === filter);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">الإشعارات</h1>
          <p className="text-sm text-gray-400">{notifications.filter(n => !n.isRead).length} غير مقروء</p>
        </div>
        <button onClick={handleReadAll} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 text-xs transition-colors">
          <Check size={13} /> تحديد الكل كمقروء
        </button>
      </div>

      <div className="flex gap-2">
        {(['all', 'order', 'review', 'inquiry'] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filter === t ? 'bg-amber-600 text-gray-900 font-medium' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200'}`}>
            {t === 'all' ? 'الكل' : t === 'order' ? 'طلبات' : t === 'review' ? 'تقييمات' : 'استفسارات'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-12 text-center">
          <Bell size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n.id} onClick={() => handleRead(n.id)} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${!n.isRead ? 'bg-amber-900/5 border-amber-700/30' : 'bg-gray-800 border-gray-700/50'} hover:bg-gray-700/30`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${!n.isRead ? 'bg-amber-500' : 'bg-gray-600'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200">{n.title}</p>
                <p className="text-xs text-gray-400 truncate">{n.message}</p>
              </div>
              <span className="text-xs text-gray-600 flex-shrink-0">{new Date(n.dateCreated).toLocaleString('ar-LY', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
