import { useState, useEffect, useRef } from 'react';
import { fetchServices, upsertService, deleteService, uploadArtworkImage, logActivity } from '@/lib/api';
import type { Service } from '@/types';
import { Plus, Edit2, Trash2, Archive, Eye, X, Check, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_SERVICE = {
  title: '', description: '', details: [''], duration: '', priceRange: '',
  category: 'photography' as Service['category'], coverImage: '', requiresDeposit: true, isArchived: false,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_SERVICE });
  const [preview, setPreview] = useState<Service | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const data = await fetchServices();
    setServices(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setFormData({ ...EMPTY_SERVICE }); setEditService(null); setShowForm(true); };
  const openEdit = (s: Service) => {
    setFormData({ title: s.title, description: s.description, details: [...s.details], duration: s.duration, priceRange: s.priceRange, category: s.category, coverImage: s.coverImage, requiresDeposit: s.requiresDeposit, isArchived: s.isArchived || false });
    setEditService(s);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('الاسم مطلوب'); return; }
    setSaving(true);
    try {
      const service: Service = {
        ...formData,
        id: editService?.id || `sv-${Date.now()}`,
        details: formData.details.filter(d => d.trim()),
      };
      await upsertService(service);
      await logActivity(editService ? 'تعديل خدمة' : 'إضافة خدمة', service.title);
      toast.success(editService ? 'تم التعديل ✓' : 'تم الإضافة ✓ — ظاهر للجميع الآن');
      setShowForm(false);
      load();
    } catch { toast.error('حدث خطأ أثناء الحفظ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      toast.success('تم الحذف');
      setDeleteConfirm(null);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch { toast.error('فشل الحذف'); }
  };

  const handleArchive = async (s: Service) => {
    try {
      await upsertService({ ...s, isArchived: !s.isArchived });
      toast.success(s.isArchived ? 'تم الإلغاء من الأرشيف' : 'تم الأرشفة');
      load();
    } catch { toast.error('حدث خطأ'); }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadArtworkImage(file, 'services');
      setFormData(f => ({ ...f, coverImage: url }));
      toast.success('تم رفع الصورة ✓');
    } catch { toast.error('فشل رفع الصورة'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const addDetail = () => setFormData(f => ({ ...f, details: [...f.details, ''] }));
  const updateDetail = (i: number, val: string) => setFormData(f => { const d = [...f.details]; d[i] = val; return { ...f, details: d }; });
  const removeDetail = (i: number) => setFormData(f => ({ ...f, details: f.details.filter((_, idx) => idx !== i) }));

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">الخدمات المخصصة</h1>
          <p className="text-sm text-gray-400">{services.length} خدمة</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium transition-colors">
          <Plus size={16} /> إضافة خدمة
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-12 text-center">
          <p className="text-gray-400 text-sm">لا توجد خدمات بعد</p>
          <p className="text-gray-600 text-xs mt-1">اضغط "إضافة خدمة" لإنشاء أول خدمة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div key={service.id} className={`bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden ${service.isArchived ? 'opacity-60' : ''}`}>
              <div className="relative h-40">
                <img src={service.coverImage} alt={service.title} className="w-full h-full object-cover bg-gray-700" onError={e => (e.currentTarget.style.display = 'none')} />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                {service.isArchived && <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-800/90 text-gray-400 text-xs rounded-full">مؤرشف</div>}
              </div>
              <div className="p-4">
                <h3 className="text-gray-100 font-medium mb-1">{service.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-amber-400">{service.priceRange || 'حسب الطلب'}</span>
                  <span className="text-gray-500">{service.duration}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPreview(service)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gray-700 text-gray-400 hover:text-gray-100 text-xs transition-colors"><Eye size={12} /> معاينة</button>
                  <button onClick={() => openEdit(service)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gray-700 text-gray-400 hover:text-blue-400 text-xs transition-colors"><Edit2 size={12} /> تعديل</button>
                  <button onClick={() => handleArchive(service)} className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-yellow-400 transition-colors"><Archive size={12} /></button>
                  <button onClick={() => setDeleteConfirm(service.id)} className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-gray-800 rounded-2xl p-5 max-w-md w-full border border-gray-700 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between"><h3 className="text-gray-100 font-semibold">{preview.title}</h3><button onClick={() => setPreview(null)}><X size={18} className="text-gray-400" /></button></div>
            {preview.coverImage && <img src={preview.coverImage} alt="" className="w-full h-48 object-cover rounded-xl" />}
            <p className="text-gray-400 text-sm">{preview.description}</p>
            <ul className="space-y-1">{preview.details.map((d, i) => <li key={i} className="text-xs text-gray-400 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-500" />{d}</li>)}</ul>
            <div className="flex gap-3"><button onClick={() => { openEdit(preview); setPreview(null); }} className="flex-1 py-2 rounded-lg bg-amber-600 text-gray-900 text-sm font-medium">تعديل</button><button onClick={() => setPreview(null)} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm">إغلاق</button></div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-gray-100 font-semibold">تأكيد الحذف</h3>
            <p className="text-gray-400 text-sm">هل أنت متأكد من حذف هذه الخدمة؟</p>
            <div className="flex gap-3"><button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium">حذف</button><button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg bg-gray-700 text-gray-300 text-sm">إلغاء</button></div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 space-y-4 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-gray-100 font-semibold">{editService ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="block text-xs text-gray-400 mb-1.5">الاسم *</label><input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="اسم الخدمة" /></div>
              <div className="sm:col-span-2"><label className="block text-xs text-gray-400 mb-1.5">الوصف المختصر</label><textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" /></div>
              <div><label className="block text-xs text-gray-400 mb-1.5">المدة التقريبية</label><input value={formData.duration} onChange={e => setFormData(f => ({ ...f, duration: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="مثال: 3-7 أيام" /></div>
              <div><label className="block text-xs text-gray-400 mb-1.5">نطاق السعر</label><input value={formData.priceRange} onChange={e => setFormData(f => ({ ...f, priceRange: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="مثال: 200-500 دينار" /></div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">صورة الغلاف</label>
                <input value={formData.coverImage} onChange={e => setFormData(f => ({ ...f, coverImage: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 mb-2" placeholder="https://..." />
                <div className="flex gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-600/40 text-amber-400 text-xs hover:bg-amber-600/10 disabled:opacity-60">
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} رفع من الجهاز
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-2"><label className="text-xs text-gray-400">تفاصيل الخدمة</label><button onClick={addDetail} className="text-xs text-amber-400 hover:text-amber-300">+ إضافة</button></div>
                {formData.details.map((d, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={d} onChange={e => updateDetail(i, e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder={`تفصيل ${i + 1}`} />
                    <button onClick={() => removeDetail(i)} className="w-8 h-9 flex items-center justify-center text-gray-500 hover:text-red-400"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer"><input type="checkbox" checked={formData.requiresDeposit} onChange={e => setFormData(f => ({ ...f, requiresDeposit: e.target.checked }))} className="accent-amber-500" /> يتطلب عربون</label>
                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer"><input type="checkbox" checked={formData.isArchived} onChange={e => setFormData(f => ({ ...f, isArchived: e.target.checked }))} className="accent-amber-500" /> أرشفة</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-semibold disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={16} />} حفظ
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
