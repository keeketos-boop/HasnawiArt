import { getOrders, getVisitCount, getStoredArtworks } from '@/lib/storage';
import { ARTWORKS, REVIEWS } from '@/constants/data';
import { getReviews } from '@/lib/storage';
import { ShoppingBag, Image, Eye, Star } from 'lucide-react';

export default function AdminStats() {
  const orders = getOrders();
  const storedArtworks = getStoredArtworks();
  const storedArtworkIds = new Set(storedArtworks.map(a => a.id));
  const allArtworks = [...storedArtworks, ...ARTWORKS.filter(a => !storedArtworkIds.has(a.id))];

  const allReviews = [...REVIEWS, ...getReviews()];
  const pendingReviews = allReviews.filter(r => r.status === 'pending').length;
  const newOrders = orders.filter(o => o.status === 'new').length;
  const publishedWorks = allArtworks.filter(a => !a.isArchived).length;
  const visits = getVisitCount();

  const stats = [
    { label: 'طلبات جديدة', value: newOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-900/30' },
    { label: 'أعمال منشورة', value: publishedWorks, icon: Image, color: 'text-green-400', bg: 'bg-green-900/30' },
    { label: 'الزيارات', value: visits, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-900/30' },
    { label: 'تقييمات معلقة', value: pendingReviews, icon: Star, color: 'text-amber-400', bg: 'bg-amber-900/30' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-gray-800 rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-400 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
