import { useState } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/storage';
import { Notification } from '@/types';
import { Bell, Check, Package, Star, MessageSquare, Shield, HardDrive } from 'lucide-react';

const TYPE_ICONS = {
  order: Package,
  review: Star,
  inquiry: MessageSquare,
  backup: HardDrive,
  security: Shield,
};

const TYPE_COLORS = {
  order: 'text-blue-400 bg-blue-900/30',
  review: 'text-amber-400 bg-amber-900/30',
  inquiry: 'text-green-400 bg-green-900/30',
  backup: 'text-purple-400 bg-purple-900/30',
  security: 'text-red-400 bg-red-900/30',
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const refresh = () => setNotifications(getNotifications());

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    refresh();
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">الإشعارات</h1>
          <p className="text-sm text-gray-400">{unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'لا توجد إشعارات جديدة'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 text-sm transition-colors">
            <Check size={14} /> تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filter === f ? 'bg-amber-600 text-gray-900 font-medium' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200'}`}>
            {f === 'all' ? `الكل (${notifications.length})` : `غير مقروء (${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          filtered.map(notif => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            const colors = TYPE_COLORS[notif.type] || 'text-gray-400 bg-gray-800';
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${notif.isRead ? 'bg-gray-800/50 border-gray-700/40' : 'bg-gray-800 border-gray-600 border-r-2 border-r-amber-500'}`}
                onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${notif.isRead ? 'text-gray-400' : 'text-gray-100'}`}>{notif.title}</p>
                    <span className="text-xs text-gray-500 flex-shrink-0">{new Date(notif.dateCreated).toLocaleDateString('ar-LY')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
