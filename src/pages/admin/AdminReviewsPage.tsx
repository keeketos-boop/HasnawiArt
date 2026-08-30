import { useState, useEffect } from 'react';
import { fetchReviews, updateReviewStatus, deleteReview } from '@/lib/api';
import type { Review } from '@/types';
import { Star, Check, X, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [filter, setFilter] = useState<Review['status'] | 'all'>('all');

  const load = async () => {
    const data = await fetchReviews();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = reviews.filter(r => filter === 'all' || r.status === filter);
  const counts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    published: reviews.filter(r => r.status === 'published').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  };

  const handleStatus = async (id: string, status: Review['status']) => {
    try {
      await updateReviewStatus(id, status);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(status === 'published' ? 'تم النشر ✓' : 'تم الرفض');
    } catch { toast.error('حدث خطأ'); }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await updateReviewStatus(id, 'published', replyText);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'published', reply: replyText } : r));
      setReplyText('');
      setReplyTarget(null);
      toast.success('تم إرسال الرد ✓');
    } catch { toast.error('حدث خطأ'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('تم الحذف');
    } catch { toast.error('فشل الحذف'); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-100">التقييمات</h1>
        <p className="text-sm text-gray-400">{counts.pending > 0 ? `${counts.pending} تقييم بانتظار المراجعة` : 'جميع التقييمات مراجعة'}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'published', 'rejected'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filter === s ? 'bg-amber-600 text-gray-900 font-medium' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200'}`}>
            {s === 'all' ? `الكل (${counts.all})` : s === 'pending' ? `بانتظار (${counts.pending})` : s === 'published' ? `منشور (${counts.published})` : `مرفوض (${counts.rejected})`}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map(review => (
          <div key={review.id} className="bg-gray-800 rounded-xl border border-gray-700/50 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-900/50 flex items-center justify-center text-amber-400 font-semibold flex-shrink-0">{review.customerName[0]}</div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{review.customerName}</p>
                  <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'} />)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${review.status === 'published' ? 'bg-green-900/40 text-green-400' : review.status === 'pending' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-red-900/40 text-red-400'}`}>
                  {review.status === 'published' ? 'منشور' : review.status === 'pending' ? 'بانتظار' : 'مرفوض'}
                </span>
                <span className="text-xs text-gray-500">{new Date(review.dateCreated).toLocaleDateString('ar-LY')}</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">"{review.comment}"</p>
            {review.reply && (
              <div className="bg-gray-900/50 rounded-lg p-3 mb-3 border border-gray-700">
                <p className="text-xs text-amber-400 font-medium mb-1">ردك</p>
                <p className="text-gray-400 text-xs">{review.reply}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-700/50">
              {review.status !== 'published' && <button onClick={() => handleStatus(review.id, 'published')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-900/40 text-green-400 hover:bg-green-900/60 text-xs transition-colors"><Check size={12} /> نشر</button>}
              {review.status !== 'rejected' && <button onClick={() => handleStatus(review.id, 'rejected')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/60 text-xs transition-colors"><X size={12} /> رفض</button>}
              <button onClick={() => setReplyTarget(replyTarget === review.id ? null : review.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700 text-gray-400 hover:text-gray-200 text-xs transition-colors"><MessageSquare size={12} /> رد</button>
              <button onClick={() => handleDelete(review.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 text-xs transition-colors"><Trash2 size={12} /> حذف</button>
            </div>
            {replyTarget === review.id && (
              <div className="mt-3 flex gap-2">
                <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="اكتب ردك..." className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" />
                <button onClick={() => handleReply(review.id)} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium">إرسال</button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-500 text-sm">لا توجد تقييمات</div>}
      </div>
    </div>
  );
}
