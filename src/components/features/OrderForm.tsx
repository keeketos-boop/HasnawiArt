import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Package, Wrench, User, FileText } from 'lucide-react';
import { ARTWORKS, SERVICES } from '@/constants/data';
import { getSiteSettings, getStoredArtworks, getStoredServices } from '@/lib/storage';
import { saveOrder, generateOrderNumber } from '@/lib/storage';
import { Order, OrderType, DeliveryMethod } from '@/types';
import { toast } from 'sonner';

const STEPS = ['نوع الطلب', 'التفاصيل', 'بياناتك', 'المراجعة'];

export default function OrderForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    orderType: '' as OrderType | '',
    artworkId: searchParams.get('artwork') || '',
    serviceId: searchParams.get('service') || '',
    description: '',
    deliveryMethod: 'pickup' as DeliveryMethod,
    address: '',
    customerName: '',
    customerPhone: '',
    referralCode: searchParams.get('ref') || '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (searchParams.get('artwork')) setForm(f => ({ ...f, orderType: 'ready' }));
    if (searchParams.get('service')) setForm(f => ({ ...f, orderType: 'service' }));
  }, []);

  const storedAws = getStoredArtworks();
  const storedAwIds = new Set(storedAws.map(a => a.id));
  const allArtworks = [...storedAws, ...ARTWORKS.filter(a => !storedAwIds.has(a.id))];
  const storedSvcs = getStoredServices();
  const storedSvcIds = new Set(storedSvcs.map(s => s.id));
  const allServices = [...storedSvcs, ...SERVICES.filter(s => !storedSvcIds.has(s.id))];

  const selectedArtwork = allArtworks.find(a => a.id === form.artworkId);
  const selectedService = allServices.find(s => s.id === form.serviceId);
  const { whatsappNumber } = getSiteSettings();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (step === 0 && !form.orderType) newErrors.orderType = 'اختر نوع الطلب';
    if (step === 1) {
      if (form.orderType === 'ready' && !form.artworkId) newErrors.artworkId = 'اختر العمل الفني';
      if (form.orderType === 'service' && !form.serviceId) newErrors.serviceId = 'اختر الخدمة';
      if (form.orderType === 'service' && !form.description) newErrors.description = 'وصف الخدمة مطلوب';
      if (form.deliveryMethod === 'shipping' && !form.address) newErrors.address = 'العنوان مطلوب للشحن';
    }
    if (step === 2) {
      if (!form.customerName.trim()) newErrors.customerName = 'الاسم مطلوب';
      if (!form.customerPhone.trim()) newErrors.customerPhone = 'رقم الهاتف مطلوب';
      else if (!/^[0-9]{9,13}$/.test(form.customerPhone.replace(/\s/g, '')))
        newErrors.customerPhone = 'رقم هاتف غير صحيح';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validate()) setStep(s => Math.min(s + 1, 3));
  };

  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = () => {
    const orderNumber = generateOrderNumber();
    const order: Order = {
      id: Date.now().toString(),
      orderNumber,
      type: form.orderType as OrderType,
      artworkId: form.artworkId || undefined,
      artworkTitle: selectedArtwork?.title,
      serviceId: form.serviceId || undefined,
      serviceTitle: selectedService?.title,
      description: form.description,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      deliveryMethod: form.deliveryMethod,
      address: form.address,
      referralCode: form.referralCode,
      notes: form.notes,
      status: 'new',
      dateCreated: new Date().toISOString(),
      totalAmount: selectedArtwork?.price,
    };

    saveOrder(order);

    // Open WhatsApp
    const itemName = selectedArtwork?.title || selectedService?.title || 'خدمة مخصصة';
    const waMsg = `🎨 *طلب جديد — ${orderNumber}*\n\n` +
      `• *النوع:* ${form.orderType === 'ready' ? 'عمل جاهز' : 'خدمة مخصصة'}\n` +
      `• *العمل/الخدمة:* ${itemName}\n` +
      `• *الاسم:* ${form.customerName}\n` +
      `• *الهاتف:* ${form.customerPhone}\n` +
      `• *التسليم:* ${form.deliveryMethod === 'pickup' ? 'استلام مباشر' : form.deliveryMethod === 'shipping' ? 'شحن' : 'رقمي'}\n` +
      (form.address ? `• *العنوان:* ${form.address}\n` : '') +
      (form.description ? `• *التفاصيل:* ${form.description}\n` : '') +
      (form.notes ? `• *ملاحظات:* ${form.notes}\n` : '') +
      (form.referralCode ? `• *كود الإحالة:* ${form.referralCode}\n` : '') +
      `\nأتطلع للتواصل معك قريباً 🙏`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMsg)}`, '_blank');
    setSubmitted(true);
    toast.success('تم إرسال طلبك بنجاح!');
  };

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  if (submitted) {
    return (
      <div className="text-center py-16 animate-slide-up">
        <div className="w-20 h-20 rounded-full amber-gradient flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber/30">
          <Check size={36} className="text-ink" />
        </div>
        <h2 className="font-heading text-3xl text-ivory mb-3">تم إرسال طلبك!</h2>
        <p className="font-body text-ivory-muted mb-2">سيتم التواصل معك عبر واتساب في أقرب وقت.</p>
        <p className="font-body text-silver text-sm mb-8">إذا لم تفتح نافذة واتساب، تأكد من السماح بالنوافذ المنبثقة.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => { setSubmitted(false); setStep(0); setForm(f => ({ ...f, orderType: '', artworkId: '', serviceId: '', description: '' })); }}
            className="px-6 py-3 rounded-xl border border-border text-ivory-muted hover:text-ivory hover:border-amber/40 transition-all font-body text-sm"
          >
            طلب جديد
          </button>
          <button
            onClick={() => navigate('/gallery')}
            className="px-6 py-3 rounded-xl amber-gradient text-ink font-medium font-body text-sm hover:opacity-90 transition-all"
          >
            العودة للمعرض
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-body transition-all ${
              i < step ? 'amber-gradient text-ink' : i === step ? 'border-2 border-amber text-amber' : 'border border-border text-silver'
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`hidden sm:block text-xs font-body ${i === step ? 'text-amber' : 'text-silver'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-amber' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 animate-slide-up">

        {/* Step 0: Order Type */}
        {step === 0 && (
          <div>
            <h2 className="font-heading text-2xl text-ivory mb-2">نوع الطلب</h2>
            <p className="font-body text-ivory-muted text-sm mb-6">اختر ما تريد طلبه</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'ready', label: 'عمل جاهز', desc: 'اختر من الأعمال المتوفرة في المعرض', Icon: Package },
                { id: 'service', label: 'خدمة مخصصة', desc: 'خدمة مصممة خصيصاً لاحتياجاتك', Icon: Wrench },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => update('orderType', type.id)}
                  className={`p-5 rounded-xl border-2 text-right transition-all ${
                    form.orderType === type.id
                      ? 'border-amber bg-amber/10'
                      : 'border-border hover:border-amber/40'
                  }`}
                >
                  <type.Icon size={28} className={form.orderType === type.id ? 'text-amber mb-3' : 'text-silver mb-3'} />
                  <p className="font-heading text-lg text-ivory mb-1">{type.label}</p>
                  <p className="font-body text-silver text-sm">{type.desc}</p>
                </button>
              ))}
            </div>
            {errors.orderType && <p className="text-destructive text-xs font-body mt-2">{errors.orderType}</p>}
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div>
            <h2 className="font-heading text-2xl text-ivory mb-2">تفاصيل الطلب</h2>
            <p className="font-body text-ivory-muted text-sm mb-6">
              {form.orderType === 'ready' ? 'اختر العمل الفني' : 'حدد الخدمة ووصف احتياجاتك'}
            </p>

            {form.orderType === 'ready' ? (
              <div className="space-y-4">
                <div>
                  <label className="block font-body text-ivory text-sm mb-2">اختر العمل</label>
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {allArtworks.filter(a => !a.isArchived && !a.isSold).map(artwork => (
                      <button
                        key={artwork.id}
                        onClick={() => update('artworkId', artwork.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${
                          form.artworkId === artwork.id ? 'border-amber bg-amber/10' : 'border-border hover:border-amber/30'
                        }`}
                      >
                        <img src={artwork.images[0]} alt={artwork.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-ivory text-sm font-medium truncate">{artwork.title}</p>
                          <p className="text-amber text-sm font-body">
                            {artwork.isPriceOnRequest ? 'حسب الطلب' : `${artwork.price?.toLocaleString()} د.ل`}
                          </p>
                        </div>
                        {form.artworkId === artwork.id && <Check size={16} className="text-amber flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                  {errors.artworkId && <p className="text-destructive text-xs font-body mt-1">{errors.artworkId}</p>}
                </div>

                <div>
                  <label className="block font-body text-ivory text-sm mb-2">طريقة التسليم</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'pickup', label: 'استلام مباشر' },
                      { id: 'shipping', label: 'شحن' },
                    ].map(d => (
                      <button
                        key={d.id}
                        onClick={() => update('deliveryMethod', d.id)}
                        className={`py-2.5 rounded-lg border text-sm font-body transition-all ${
                          form.deliveryMethod === d.id ? 'border-amber bg-amber/10 text-amber' : 'border-border text-ivory-muted hover:border-amber/30'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.deliveryMethod === 'shipping' && (
                  <div>
                    <label className="block font-body text-ivory text-sm mb-2">العنوان</label>
                    <input
                      value={form.address}
                      onChange={e => update('address', e.target.value)}
                      placeholder="المدينة، الحي، التفاصيل..."
                      className="w-full bg-background border border-input rounded-xl px-4 py-3 text-ivory text-sm font-body placeholder:text-silver focus:outline-none focus:border-amber/50 transition-colors"
                    />
                    {errors.address && <p className="text-destructive text-xs font-body mt-1">{errors.address}</p>}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-body text-ivory text-sm mb-2">اختر الخدمة</label>
                  <div className="space-y-2">
                    {allServices.filter(s => !s.isArchived).map(service => (
                      <button
                        key={service.id}
                        onClick={() => update('serviceId', service.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${
                          form.serviceId === service.id ? 'border-amber bg-amber/10' : 'border-border hover:border-amber/30'
                        }`}
                      >
                        <img src={service.coverImage} alt={service.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-ivory text-sm font-medium">{service.title}</p>
                          <p className="text-silver text-xs font-body">{service.priceRange}</p>
                        </div>
                        {form.serviceId === service.id && <Check size={16} className="text-amber flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                  {errors.serviceId && <p className="text-destructive text-xs font-body mt-1">{errors.serviceId}</p>}
                </div>

                <div>
                  <label className="block font-body text-ivory text-sm mb-2">وصف ما تريده</label>
                  <textarea
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    placeholder="اكتب تفاصيل طلبك بوضوح..."
                    rows={4}
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-ivory text-sm font-body placeholder:text-silver focus:outline-none focus:border-amber/50 transition-colors resize-none"
                  />
                  {errors.description && <p className="text-destructive text-xs font-body mt-1">{errors.description}</p>}
                  <p className="text-silver text-xs font-body mt-1">* يتطلب دفع عربون 20-30% قبل بدء التنفيذ</p>
                </div>

                <div>
                  <label className="block font-body text-ivory text-sm mb-2">طريقة التسليم</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'pickup', label: 'مباشر' },
                      { id: 'shipping', label: 'شحن' },
                      { id: 'digital', label: 'رقمي' },
                    ].map(d => (
                      <button
                        key={d.id}
                        onClick={() => update('deliveryMethod', d.id)}
                        className={`py-2.5 rounded-lg border text-sm font-body transition-all ${
                          form.deliveryMethod === d.id ? 'border-amber bg-amber/10 text-amber' : 'border-border text-ivory-muted hover:border-amber/30'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
          <div>
            <h2 className="font-heading text-2xl text-ivory mb-2">بياناتك الشخصية</h2>
            <p className="font-body text-ivory-muted text-sm mb-6">لنتمكن من التواصل معك</p>
            <div className="space-y-4">
              <div>
                <label className="block font-body text-ivory text-sm mb-2">الاسم الكامل *</label>
                <div className="relative">
                  <User size={16} className="absolute top-1/2 right-4 -translate-y-1/2 text-silver" />
                  <input
                    value={form.customerName}
                    onChange={e => update('customerName', e.target.value)}
                    placeholder="اسمك الكامل"
                    className="w-full bg-background border border-input rounded-xl pr-10 pl-4 py-3 text-ivory text-sm font-body placeholder:text-silver focus:outline-none focus:border-amber/50 transition-colors"
                  />
                </div>
                {errors.customerName && <p className="text-destructive text-xs font-body mt-1">{errors.customerName}</p>}
              </div>

              <div>
                <label className="block font-body text-ivory text-sm mb-2">رقم الهاتف *</label>
                <input
                  value={form.customerPhone}
                  onChange={e => update('customerPhone', e.target.value)}
                  placeholder="091XXXXXXX"
                  type="tel"
                  dir="ltr"
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-ivory text-sm font-body placeholder:text-silver focus:outline-none focus:border-amber/50 transition-colors text-right"
                />
                {errors.customerPhone && <p className="text-destructive text-xs font-body mt-1">{errors.customerPhone}</p>}
              </div>

              <div>
                <label className="block font-body text-ivory text-sm mb-2">كود الإحالة (اختياري)</label>
                <input
                  value={form.referralCode}
                  onChange={e => update('referralCode', e.target.value)}
                  placeholder="إذا أحالك أحد، أدخل الكود هنا"
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-ivory text-sm font-body placeholder:text-silver focus:outline-none focus:border-amber/50 transition-colors"
                />
              </div>

              <div>
                <label className="block font-body text-ivory text-sm mb-2">ملاحظات إضافية</label>
                <textarea
                  value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                  placeholder="أي تفاصيل إضافية..."
                  rows={3}
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-ivory text-sm font-body placeholder:text-silver focus:outline-none focus:border-amber/50 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 className="font-heading text-2xl text-ivory mb-2">مراجعة الطلب</h2>
            <p className="font-body text-ivory-muted text-sm mb-6">تحقق من التفاصيل قبل الإرسال</p>
            <div className="space-y-3">
              {[
                { label: 'نوع الطلب', value: form.orderType === 'ready' ? 'عمل جاهز' : 'خدمة مخصصة' },
                { label: 'العمل/الخدمة', value: selectedArtwork?.title || selectedService?.title || '—' },
                { label: 'التسليم', value: form.deliveryMethod === 'pickup' ? 'استلام مباشر' : form.deliveryMethod === 'shipping' ? 'شحن' : 'رقمي' },
                ...(form.address ? [{ label: 'العنوان', value: form.address }] : []),
                ...(form.description ? [{ label: 'الوصف', value: form.description }] : []),
                { label: 'الاسم', value: form.customerName },
                { label: 'الهاتف', value: form.customerPhone },
                ...(form.referralCode ? [{ label: 'كود الإحالة', value: form.referralCode }] : []),
                ...(form.notes ? [{ label: 'ملاحظات', value: form.notes }] : []),
              ].map(item => (
                <div key={item.label} className="flex gap-3 p-3 rounded-lg bg-background/50">
                  <span className="font-body text-silver text-sm w-28 flex-shrink-0">{item.label}</span>
                  <span className="font-body text-ivory text-sm">{item.value}</span>
                </div>
              ))}
              {selectedArtwork?.price && !selectedArtwork.isPriceOnRequest && (
                <div className="flex gap-3 p-3 rounded-lg bg-amber/10 border border-amber/30">
                  <span className="font-body text-silver text-sm w-28 flex-shrink-0">السعر الإجمالي</span>
                  <span className="font-body text-amber text-sm font-medium">{selectedArtwork.price.toLocaleString()} د.ل</span>
                </div>
              )}
            </div>
            <p className="font-body text-silver text-xs mt-4">بالنقر على إرسال، سيتم فتح واتساب برسالة منسقة لإتمام الطلب.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-ivory-muted hover:text-ivory hover:border-amber/40 transition-all disabled:opacity-30 text-sm font-body"
          >
            <ChevronRight size={16} />
            السابق
          </button>

          {step < 3 ? (
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl amber-gradient text-ink font-medium text-sm font-body hover:opacity-90 transition-all active:scale-95"
            >
              التالي
              <ChevronLeft size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl amber-gradient text-ink font-medium text-sm font-body hover:opacity-90 transition-all active:scale-95"
            >
              <FileText size={16} />
              إرسال الطلب
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
