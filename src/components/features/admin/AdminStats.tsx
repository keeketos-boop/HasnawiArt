import { useEffect, useState } from 'react';
import { fetchArtworks, fetchOrders, fetchReviews, getVisitCount } from '@/lib/api';
import { ShoppingBag, Image, Eye, Star } from 'lucide-react';

export default function AdminStats() {
  const [stats, setStats] = useState({ newOrders: 0, publishedWorks: 0, visits: 0, pendingReviews: 0 });

  useEffect(() => {
    Promise.all([fetchArtworks(), fetchOrders(), fetchReviews()]).then(([artworks, orders, reviews]) => {
      setStats({
        newOrders: orders.filter(o => o.status === 'new').length,
        publishedWorks: artworks.filter(a => !a.isArchived).length,
        visits: getVisitCount(),
        pendingReviews: reviews.filter(r => r.status === 'pending').length,
      });
    });
  }, []);

  const items = [
    { label: 'طلبات جديدة', value: stats.newOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-900/30' },
    { label: 'أعمال منشورة', value: stats.publishedWorks, icon: Image, color: 'text-green-400', bg: 'bg-green-900/30' },
    { label: 'الزيارات', value: stats.visits, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-900/30' },
    { label: 'تقييمات معلقة', value: stats.pendingReviews, icon: Star, color: 'text-amber-400', bg: 'bg-amber-900/30' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-gray-800 rounded-xl border border-gray-700/50 p-4">
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}><Icon size={18} className={color} /></div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-400 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
