import { Link } from 'react-router-dom';
import { SERVICES } from '@/constants/data';
import { getStoredServices } from '@/lib/storage';
import { ArrowLeft, Clock } from 'lucide-react';

export default function ServicesSection() {
  const storedSvcs = getStoredServices();
  const storedIds = new Set(storedSvcs.map(s => s.id));
  const allServices = [...storedSvcs, ...SERVICES.filter(s => !storedIds.has(s.id))].filter(s => !s.isArchived);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-amber text-sm font-body mb-2">ما أقدمه</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-ivory">الخدمات المخصصة</h2>
          </div>
          <Link to="/gallery?tab=services" className="hidden sm:flex items-center gap-2 text-amber hover:text-amber-light transition-colors text-sm font-body">
            عرض الكل <ArrowLeft size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allServices.slice(0, 3).map(service => (
            <Link
              key={service.id}
              to={`/order?service=${service.id}`}
              className="glass-card rounded-2xl overflow-hidden hover:border-amber/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={service.coverImage}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-heading text-lg text-ivory mb-2">{service.title}</h3>
                <p className="font-body text-ivory-muted text-sm leading-relaxed mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between text-xs font-body">
                  <span className="flex items-center gap-1 text-silver"><Clock size={12} />{service.duration}</span>
                  <span className="text-amber font-medium">{service.priceRange}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link to="/gallery?tab=services" className="inline-flex items-center gap-2 text-amber hover:text-amber-light transition-colors text-sm font-body">
            عرض جميع الخدمات <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
