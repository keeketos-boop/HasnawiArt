import { Star } from 'lucide-react';
import { REVIEWS } from '@/constants/data';
import { getReviews } from '@/lib/storage';

export default function ReviewsSection() {
  const storedReviews = getReviews().filter(r => r.status === 'published');
  const allReviews = [...REVIEWS.filter(r => r.status === 'published'), ...storedReviews];
  const avgRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;

  return (
    <section id="reviews" className="py-16 px-4 sm:px-6 lg:px-8 bg-ink-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-amber text-sm font-body mb-2">آراء العملاء</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-ivory mb-4">التقييمات</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} size={20} className={i <= Math.round(avgRating) ? 'text-amber fill-amber' : 'text-silver'} />)}</div>
            <span className="font-body text-ivory-muted text-sm">{avgRating.toFixed(1)} من أصل {allReviews.length} تقييم</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {allReviews.map(review => (
            <div key={review.id} className="glass-card rounded-2xl p-5">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= review.rating ? 'text-amber fill-amber' : 'text-silver'} />)}
              </div>
              <p className="font-body text-ivory-muted text-sm leading-relaxed mb-4 line-clamp-4">"{review.comment}"</p>
              <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center text-amber font-heading text-sm">{review.customerName[0]}</div>
                <div>
                  <p className="font-body text-ivory text-sm font-medium">{review.customerName}</p>
                  <p className="font-body text-silver text-xs">{new Date(review.dateCreated).toLocaleDateString('ar-LY')}</p>
                </div>
              </div>
              {review.reply && (
                <div className="mt-3 p-3 rounded-lg bg-amber/5 border border-amber/20">
                  <p className="text-amber text-xs font-body font-medium mb-1">رد الفنان</p>
                  <p className="text-ivory-muted text-xs font-body leading-relaxed">{review.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
