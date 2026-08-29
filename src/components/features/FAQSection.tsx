import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '@/constants/data';

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-amber text-sm font-body mb-2">إجابات جاهزة</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-ivory">الأسئلة الشائعة</h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right hover:bg-amber/5 transition-colors"
              >
                <span className="font-body text-ivory font-medium text-sm">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-amber flex-shrink-0 mr-3 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 animate-fade-in">
                  <p className="font-body text-ivory-muted text-sm leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
