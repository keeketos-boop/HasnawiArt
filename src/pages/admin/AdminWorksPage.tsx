import { useState, useRef } from 'react';
import { ARTWORKS, DEFAULT_CATEGORIES } from '@/constants/data';
import { getStoredArtworks, saveArtwork, deleteArtwork, getStoredCategories } from '@/lib/storage';
import { Artwork, ArtCategory } from '@/types';
import { Eye, Archive, Plus, Search, Edit2, Trash2, Star, Copy, X, Check, Upload } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_ARTWORK: Omit<Artwork, 'id' | 'dateAdded'> = {
  title: '', category: 'painting', description: '', dimensions: '', technique: '',
  price: undefined, isPriceOnRequest: false, images: [], isSold: false, isArchived: false, isFeatured: false,
};

export default function AdminWorksPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ArtCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'archived'>('all');
  const [preview, setPreview] = useState<Artwork | null>(null);
  const [editWork, setEditWork] = useState<Artwork | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<typeof EMPTY_ARTWORK>({ ...EMPTY_ARTWORK });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storedArtworks = getStoredArtworks();
  const storedIds = new Set(storedArtworks.map(a => a.id));
  const allArtworks: Artwork[] = [...storedArtworks, ...ARTWORKS.filter(a => !storedIds.has(a.id))];

  const storedCats = getStoredCategories();
  const storedCatIds = new Set(storedCats.map(c => c.id));
  const allCategories = [...storedCats, ...DEFAULT_CATEGORIES.filter(c => !storedCatIds.has(c.id))];

  const filtered = allArtworks.filter(a => {
    const matchSearch = !search || a.title.includes(search) || a.description?.includes(search);
    const matchCat = category === 'all' || a.category === category;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'archived' ? a.isArchived : !a.isArchived);
    return matchSearch && matchCat && matchStatus;
  });

  const openAdd = () => { setFormData({ ...EMPTY_ARTWORK }); setEditWork(null); setShowForm(true); };
  const openEdit = (work: Artwork) => {
    setFormData({ title: work.title, category: work.category, description: work.description || '', dimensions: work.dimensions || '', technique: work.technique || '', price: work.price, isPriceOnRequest: work.isPriceOnRequest || false, images: [...work.images], isSold: work.isSold || false, isArchived: work.isArchived || false, isFeatured: work.isFeatured || false });
    setEditWork(work);
    setShowForm(true);
  };

  const handleSave = (publish = false) => {
    if (!formData.title.trim()) { toast.error('العنوان مطلوب'); return; }
    if (formData.images.length === 0) { toast.error('أضف صورة واحدة على الأقل'); return; }
    const work: Artwork = {
      ...formData,
      id: editWork?.id || `aw-${Date.now()}`,
      dateAdded: editWork?.dateAdded || new Date().toISOString(),
      isArchived: publish ? false : formData.isArchived,
    };
    saveArtwork(work);
    toast.success(editWork ? 'تم التعديل بنجاح' : 'تم الحفظ بنجاح');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteArtwork(id);
    setDeleteConfirm(null);
    toast.success('تم الحذف');
  };

  const handleArchive = (work: Artwork) => {
    saveArtwork({ ...work, isArchived: !work.isArchived });
    toast.success(work.isArchived ? 'تم الإلغاء من الأرشيف' : 'تم الأرشفة');
  };

  const handleFeature = (work: Artwork) => {
    saveArtwork({ ...work, isFeatured: !work.isFeatured });
    toast.success(work.isFeatured ? 'أُزيل من المميزة' : 'أضيف للمميزة');
  };

  const handleDuplicate = (work: Artwork) => {
    const dup: Artwork = { ...work, id: `aw-${Date.now()}`, title: `${work.title} — نسخة`, dateAdded: new Date().toISOString(), isFeatured: false };
    saveArtwork(dup);
    toast.success('تم النسخ');
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData(f => ({ ...f, images: [...f.images, newImageUrl.trim()] }));
    setNewImageUrl('');
  };

  const removeImage = (i: number) => setFormData(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setFormData(f => ({ ...f, images: [...f.images, url] }));
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">الأعمال الجاهزة</h1>
          <p className="text-sm text-gray-400">{filtered.length} عمل</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium transition-colors">
          <Plus size={16} /> إضافة عمل
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="bg-gray-800 border border-gray-700 rounded-lg pr-8 pl-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 w-44" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value as ArtCategory)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none">
          <option value="all">كل التصنيفات</option>
          {allCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'published' | 'archived')} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none">
          <option value="all">كل الحالات</option>
          <option value="published">منشور</option>
          <option value="archived">مؤرشف</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50 text-right">
                <th className="px-4 py-3 text-xs font-medium text-gray-400">العمل</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 hidden sm:table-cell">التصنيف</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">السعر</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 hidden md:table-cell">الحالة</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filtered.map(work => (
                <tr key={work.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={work.images[0]} alt={work.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-200 font-medium truncate max-w-[160px]">{work.title}</p>
                        {work.dimensions && <p className="text-xs text-gray-500">{work.dimensions}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                      {allCategories.find(c => c.id === work.category)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-amber-400">
                    {work.isPriceOnRequest ? 'حسب الطلب' : `${work.price?.toLocaleString()} د.ل`}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-1 rounded-full ${work.isArchived ? 'bg-gray-700 text-gray-400' : 'bg-green-900/40 text-green-400'}`}>
                        {work.isArchived ? 'مؤرشف' : 'منشور'}
                      </span>
                      {work.isFeatured && <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-1 rounded-full">مميز</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setPreview(work)} className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-100 transition-colors" title="معاينة"><Eye size={14} /></button>
                      <button onClick={() => openEdit(work)} className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-colors" title="تعديل"><Edit2 size={14} /></button>
                      <button onClick={() => handleFeature(work)} className={`w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center transition-colors ${work.isFeatured ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`} title="تمييز"><Star size={14} /></button>
                      <button onClick={() => handleArchive(work)} className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-yellow-400 transition-colors" title="أرشفة"><Archive size={14} /></button>
                      <button onClick={() => handleDuplicate(work)} className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-purple-400 transition-colors" title="نسخ"><Copy size={14} /></button>
                      <button onClick={() => setDeleteConfirm(work.id)} className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors" title="حذف"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-12 text-center text-gray-500 text-sm">لا توجد أعمال</div>}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-gray-800 rounded-2xl p-5 max-w-lg w-full border border-gray-700 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="text-gray-100 font-semibold">{preview.title}</h3>
              <button onClick={() => setPreview(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {preview.images.map((img, i) => (
                <img key={i} src={img} alt="" className="h-40 w-auto rounded-xl object-cover flex-shrink-0" />
              ))}
            </div>
            {preview.description && <p className="text-gray-400 text-sm">{preview.description}</p>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {preview.dimensions && <div><span className="text-gray-500">الأبعاد: </span><span className="text-gray-300">{preview.dimensions}</span></div>}
              {preview.technique && <div><span className="text-gray-500">التقنية: </span><span className="text-gray-300">{preview.technique}</span></div>}
              <div><span className="text-gray-500">السعر: </span><span className="text-amber-400">{preview.isPriceOnRequest ? 'حسب الطلب' : `${preview.price?.toLocaleString()} د.ل`}</span></div>
              <div><span className="text-gray-500">التصنيف: </span><span className="text-gray-300">{allCategories.find(c => c.id === preview.category)?.label}</span></div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { openEdit(preview); setPreview(null); }} className="flex-1 py-2 rounded-lg bg-amber-600 text-gray-900 text-sm font-medium">تعديل</button>
              <button onClick={() => setPreview(null)} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-gray-100 font-semibold">تأكيد الحذف</h3>
            <p className="text-gray-400 text-sm">هل أنت متأكد من حذف هذا العمل؟ لا يمكن التراجع.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium">حذف</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg bg-gray-700 text-gray-300 text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 space-y-4 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-gray-100 font-semibold">{editWork ? 'تعديل عمل' : 'إضافة عمل جديد'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">العنوان *</label>
                <input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="عنوان العمل" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">التصنيف</label>
                <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value as ArtCategory }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none">
                  {allCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">السعر (د.ل)</label>
                <div className="flex gap-2">
                  <input type="number" value={formData.price || ''} onChange={e => setFormData(f => ({ ...f, price: Number(e.target.value), isPriceOnRequest: false }))} disabled={formData.isPriceOnRequest} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 disabled:opacity-50" placeholder="السعر" />
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer flex-shrink-0">
                    <input type="checkbox" checked={formData.isPriceOnRequest} onChange={e => setFormData(f => ({ ...f, isPriceOnRequest: e.target.checked, price: e.target.checked ? undefined : f.price }))} className="accent-amber-500" />
                    حسب الطلب
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">الأبعاد</label>
                <input value={formData.dimensions} onChange={e => setFormData(f => ({ ...f, dimensions: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="مثال: 60×80 سم" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">التقنية</label>
                <input value={formData.technique} onChange={e => setFormData(f => ({ ...f, technique: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="مثال: زيت على كانفاس" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">الوصف</label>
                <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" placeholder="وصف العمل..." />
              </div>
              <div className="sm:col-span-2 flex gap-4">
                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData(f => ({ ...f, isFeatured: e.target.checked }))} className="accent-amber-500" /> تمييز في الرئيسية
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={formData.isArchived} onChange={e => setFormData(f => ({ ...f, isArchived: e.target.checked }))} className="accent-amber-500" /> أرشفة
                </label>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">الصور *</label>
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)} className="absolute top-1 left-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} className="text-white" />
                      </button>
                      {i === 0 && <span className="absolute bottom-1 right-1 text-[9px] bg-amber-600 text-gray-900 px-1 rounded">رئيسية</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mb-2">
                <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addImageUrl()} placeholder="رابط صورة (URL)..." className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" />
                <button onClick={addImageUrl} className="px-3 py-2 rounded-lg bg-amber-600 text-gray-900 text-sm font-medium">إضافة</button>
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500 text-sm transition-colors">
                  <Upload size={14} /> رفع من الجهاز
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => handleSave(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-semibold transition-colors">
                <Check size={16} /> حفظ ونشر
              </button>
              <button onClick={() => handleSave(false)} className="px-5 py-2.5 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 transition-colors">
                حفظ
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-sm hover:text-gray-200 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
