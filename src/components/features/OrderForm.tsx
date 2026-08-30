import { useState, useEffect } from 'react';
import { fetchSiteSettings, fetchArtworks, fetchServices, insertOrder, generateOrderNumber, logActivity } from '@/lib/api';
import type { SiteSettings, Artwork, Service } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/defaults';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';

const DELIVERY_LABELS: Record<string, string> = { pickup: 'استلام مباشر', shipping: 'شحن', digital: 'تسليم رقمي' };
const STEP_LABELS = ['نوع الطلب', 'التفاصيل', 'البيانات', 'المراجعة'];

export default function OrderForm() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    type: '' as 'ready' | 'service' | '',
    artworkId: params.get('artwork') || '',
    serviceId: params.get('service') || '',
    category: '',
    description: '',
    deliveryMethod: 'pickup' as 'pickup' | 'shipping' | 'digital',
    address: '',
    customerName: '',
    customerPhone: '',
    referralCode: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([fetchSiteSettings(), fetchArtworks(), fetchServices()]).then(([s, aw, sv]) => {
      setSettings(s);
      setArtworks(aw.filter(a => !a.isArchived));
      setServices(sv.filter(s => !s.isArchived));

      // Pre-fill from URL params
      const refCode = new URLSearchParams(window.location.search).get('ref') || '';
      if (refCode) setForm(f => ({ ...f, referralCode: refCode }));

      if (params.get('artwork')) setForm(f => ({ ...f, type: 'ready', artworkId: params.get('artwork') || '' }));
      if (params.get('service')) setForm(f => ({ ...f, type: 'service', serviceId: params.get('service') || '' }));
    });
  }, []);

  const selectedArtwork = artworks.find(a => a.id === form.artworkId);
  const selectedService = services.find(s => s.id === form.serviceId);

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1 && !form.type) e.type = 'اختر نوع الطلب';
    if (s === 2) {
      if (form.type === 'ready' && !form.artworkId) e.artworkId = 'اختر العمل المطلوب';
      if (form.type === 'service' && !form.category) e.category = 'اختر التصنيف';
      if (form.type === 'service' && !form.description) e.description = 'اكتب وصف الخدمة المطلوبة';
    }
    if (s === 3) {
      if (!form.customerName.trim()) e.customerName = 'الاسم مطلوب';
      if (!form.customerPhone.trim()) e.customerPhone = 'رقم الهاتف مطلوب';
      if (form.deliveryMethod === 'shipping' && !form.address.trim()) e.address = 'العنوان مطلوب للشحن';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validate(3)) return;
    setSubmitting(true);
    try {
      const orderNumber = await generateOrderNumber();
      const order = {
        id: Date.now().toString(),
        orderNumber,
        type: form.type as 'ready' | 'service',
        artworkId: form.artworkId || undefined,
        artworkTitle: selectedArtwork?.title || undefined,
        serviceId: form.serviceId || undefined,
        serviceTitle: selectedService?.title || undefined,
        category: form.category || undefined,
        description: form.description || undefined,
        deliveryMethod: form.deliveryMethod,
        address: form.address || undefined,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        referralCode: form.referralCode || undefined,
        notes: form.notes || undefined,
        status: 'new' as const,
        dateCreated: new Date().toISOString(),
        totalAmount: selectedArtwork?.price,
      };

      await insertOrder(order);
      await logActivity('طلب جديد', `${orderNumber} — ${form.customerName}`);

      // Open WhatsApp
      const whatsappMsg = [
        `*طلب جديد — ${orderNumber}*`,
        `الاسم: ${form.customerName}`,
        `الهاتف: ${form.customerPhone}`,
        form.type === 'ready' ? `العمل: ${selectedArtwork?.title || ''}` : `الخدمة: ${selectedService?.title || ''}`,
        form.description ? `الوصف: ${form.description}` : '',
        `التسليم: ${DELIVERY_LABELS[form.deliveryMethod]}`,
        form.address ? `العنوان: ${form.address}` : '',
        form.referralCode ? `كود الإحالة: ${form.referralCode}` : '',
      ].filter(Boolean).join('\n');

      window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');

      toast.success('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
      setSubmitting(false);
    }
  };

  const fieldClass = (name: string) => `w-full bg-background/50 border rounded-xl px-4 py-3 text-ivory font-body text-sm focus:outline-none transition-colors placeholder:text-silver ${errors[name] ? 'border-red-500/60 focus:border-red-500' : 'border-border focus:border-amber/50'}`;

  return (
    <div className="max-w-lg mx-auto">
      {/* Steps */}
      <div className="flex items-center justify-between mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body transition-all ${step > i + 1 ? 'bg-amber text-ink' : step === i + 1 ? 'bg-amber/20 border-2 border-amber text-amber' : 'bg-border text-silver'}`}>
                {step > i + 1 ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-body hidden sm:block ${step === i + 1 ? 'text-amber' : 'text-silver'}`}>{label}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-px mx-1 transition-all ${step > i + 1 ? 'bg-amber/50' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-5">

        {/* Step 1: Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl text-ivory">ما نوع طلبك؟</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { value: 'ready', label: 'عمل جاهز', desc: 'شراء لوحة أو عمل فني موجود في المعرض' },
                { value: 'service', label: 'خدمة مخصصة', desc: 'طلب خدمة فنية (تصوير، خط، تصميم، بورتريه)' },
              ].map(opt => (
                <button key={opt.value} onClick={() => { setForm(f => ({ ...f, type: opt.value as 'ready' | 'service' })); setErrors({}); }} className={`p-4 rounded-xl text-right border-2 transition-all ${form.type === opt.value ? 'border-amber bg-amber/10' : 'border-border hover:border-amber/40'}`}>
                  <p className="font-body text-ivory font-medium mb-1">{opt.label}</p>
                  <p className="font-body text-silver text-xs leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
            {errors.type && <p className="text-red-400 text-xs">{errors.type}</p>}
          </div>
        )}

        {/* Step 2a: Ready work */}
        {step === 2 && form.type === 'ready' && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl text-ivory">اختر العمل</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {artworks.map(a => (
                <button key={a.id} onClick={() => { setForm(f => ({ ...f, artworkId: a.id })); setErrors({}); }} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${form.artworkId === a.id ? 'border-amber bg-amber/10' : 'border-border hover:border-amber/30'}`}>
                  <img src={a.images[0]} alt={a.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-700" />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-ivory text-sm font-medium truncate">{a.title}</p>
                    <p className="font-body text-amber text-xs">{a.isPriceOnRequest ? 'حسب الطلب' : `${a.price?.toLocaleString()} د.ل`}</p>
                  </div>
                  {form.artworkId === a.id && <Check size={16} className="text-amber flex-shrink-0" />}
                </button>
              ))}
              {artworks.length === 0 && <p className="text-center text-silver text-sm py-8">لا توجد أعمال متاحة حالياً</p>}
            </div>
            {errors.artworkId && <p className="text-red-400 text-xs">{errors.artworkId}</p>}
            {form.artworkId && (
              <div className="space-y-3">
                <label className="block font-body text-ivory-muted text-sm mb-1">طريقة التسليم *</label>
                <div className="flex gap-3">
                  {(['pickup', 'shipping'] as const).map(m => (
                    <button key={m} onClick={() => setForm(f => ({ ...f, deliveryMethod: m }))} className={`flex-1 py-2.5 rounded-xl border text-sm font-body transition-all ${form.deliveryMethod === m ? 'border-amber bg-amber/10 text-amber' : 'border-border text-silver hover:border-amber/30'}`}>
                      {DELIVERY_LABELS[m]}
                    </button>
                  ))}
                </div>
                {form.deliveryMethod === 'shipping' && (
                  <div>
                    <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="المدينة، الحي، التفاصيل" className={fieldClass('address')} />
                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2b: Service */}
        {step === 2 && form.type === 'service' && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl text-ivory">تفاصيل الخدمة</h2>
            <div>
              <label className="block font-body text-ivory-muted text-sm mb-1.5">التصنيف *</label>
              <div className="grid grid-cols-2 gap-2">
                {services.map(s => (
                  <button key={s.id} onClick={() => { setForm(f => ({ ...f, serviceId: s.id, category: s.title })); setErrors({}); }} className={`p-3 rounded-xl text-right border text-xs font-body transition-all ${form.serviceId === s.id ? 'border-amber bg-amber/10 text-ivory' : 'border-border text-silver hover:border-amber/30'}`}>
                    {s.title}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block font-body text-ivory-muted text-sm mb-1.5">وصف ما تريد *</label>
              <textarea value={form.description} onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setErrors(p => ({ ...p, description: '' })); }} rows={4} placeholder="صف الخدمة المطلوبة بالتفصيل..." className={fieldClass('description') + ' resize-none'} />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>
            {form.serviceId && (
              <div className="p-3 rounded-xl bg-amber/5 border border-amber/20">
                <p className="text-amber text-xs font-body font-medium">ملاحظة العربون</p>
                <p className="text-ivory-muted text-xs font-body mt-1">يُشترط دفع عربون 20-30% من قيمة الخدمة قبل بدء التنفيذ. العربون غير مسترجع بعد بدء العمل.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Personal Info */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl text-ivory">بياناتك الشخصية</h2>
            <div>
              <label className="block font-body text-ivory-muted text-sm mb-1.5">الاسم الكامل *</label>
              <input value={form.customerName} onChange={e => { setForm(f => ({ ...f, customerName: e.target.value })); setErrors(p => ({ ...p, customerName: '' })); }} placeholder="اسمك الكامل" className={fieldClass('customerName')} />
              {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
            </div>
            <div>
              <label className="block font-body text-ivory-muted text-sm mb-1.5">رقم الهاتف/واتساب *</label>
              <input value={form.customerPhone} onChange={e => { setForm(f => ({ ...f, customerPhone: e.target.value })); setErrors(p => ({ ...p, customerPhone: '' })); }} placeholder="218xxxxxxxxx" dir="ltr" className={fieldClass('customerPhone')} />
              {errors.customerPhone && <p className="text-red-400 text-xs mt-1">{errors.customerPhone}</p>}
            </div>
            <div>
              <label className="block font-body text-ivory-muted text-sm mb-1.5">كود الإحالة <span className="text-silver">(اختياري)</span></label>
              <input value={form.referralCode} onChange={e => setForm(f => ({ ...f, referralCode: e.target.value }))} placeholder="إذا أحالك أحد..." className={fieldClass('referralCode')} />
            </div>
            <div>
              <label className="block font-body text-ivory-muted text-sm mb-1.5">ملاحظات إضافية <span className="text-silver">(اختياري)</span></label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="أي تفاصيل أو ملاحظات..." className={fieldClass('notes') + ' resize-none'} />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl text-ivory">مراجعة الطلب</h2>
            <div className="space-y-3">
              {[
                { label: 'نوع الطلب', value: form.type === 'ready' ? 'عمل جاهز' : 'خدمة مخصصة' },
                form.type === 'ready' ? { label: 'العمل', value: selectedArtwork?.title } : { label: 'الخدمة', value: selectedService?.title || form.category },
                form.type === 'ready' ? { label: 'السعر', value: selectedArtwork?.isPriceOnRequest ? 'حسب الطلب' : `${selectedArtwork?.price?.toLocaleString()} د.ل` } : null,
                form.description ? { label: 'الوصف', value: form.description } : null,
                { label: 'الاسم', value: form.customerName },
                { label: 'الهاتف', value: form.customerPhone },
                { label: 'التسليم', value: DELIVERY_LABELS[form.deliveryMethod] },
                form.address ? { label: 'العنوان', value: form.address } : null,
                form.referralCode ? { label: 'كود الإحالة', value: form.referralCode } : null,
              ].filter(Boolean).map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-background/30 border border-border">
                  <span className="font-body text-silver text-sm w-24 flex-shrink-0">{item!.label}</span>
                  <span className="font-body text-ivory text-sm break-words">{item!.value}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-green-900/10 border border-green-700/30">
              <p className="text-green-400 text-xs font-body">عند إرسال الطلب، سيتم فتح واتساب تلقائياً لإرسال تفاصيل طلبك لعبد العزيز الحسناوي مباشرة.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <button onClick={prev} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-ivory-muted hover:border-amber/40 hover:text-ivory transition-all text-sm font-body">
              <ChevronRight size={16} /> السابق
            </button>
          )}
          {step < 4 ? (
            <button onClick={next} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl amber-gradient text-ink font-body font-semibold text-sm transition-all">
              التالي <ChevronLeft size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl amber-gradient text-ink font-body font-semibold text-sm transition-all disabled:opacity-60">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {submitting ? 'جارٍ الإرسال...' : 'إرسال الطلب عبر واتساب'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
