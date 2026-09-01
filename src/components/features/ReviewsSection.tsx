import { useState, useEffect } from 'react';
import { fetchSiteSettings, fetchReviews } from '@/lib/api';
import { Star } from 'lucide-react';
import type { SiteSettings, Review } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/defaults';

export default function ReviewsSection() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    Promise.all([fetchSiteSettings(), fetchReviews(true)]).then(([s, r]) => {
      setSettings(s);
      setReviews(r);
    });
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-amber text-sm font-body mb-2">آراء العملاء</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-ivory">التقييمات</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.slice(0, 6).map(review => (
            <div key={review.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center text-amber font-heading text-lg flex-shrink-0">
                  {review.customerName[0]}
                </div>
                <div>
                  <p className="font-body text-ivory text-sm font-medium">{review.customerName}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= review.rating ? 'text-amber fill-amber' : 'text-silver'} />)}
                  </div>
                </div>
                <span className="mr-auto text-xs text-silver">{new Date(review.dateCreated).toLocaleDateString('ar-LY', { month: 'short', year: 'numeric' })}</span>
              </div>
              <p className="font-body text-ivory-muted text-sm leading-relaxed">"{review.comment}"</p>
              {review.reply && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-amber mb-1">{settings.artistName}</p>
                  <p className="text-xs text-ivory-muted">{review.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
