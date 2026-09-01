import { useState, useEffect } from 'react';
import { fetchCategories, upsertCategory, deleteCategory, logActivity } from '@/lib/api';
import { DEFAULT_CATEGORIES } from '@/constants/data';
import type { Category } from '@/types';
import { Plus, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_CAT: Omit<Category, 'id'> = {
  label: '', color: '#D4722A', description: '', isArchived: false, sortOrder: 99,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_CAT>({ ...EMPTY_CAT });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = async () => {
    const data = await fetchCategories();
    const ids = new Set(data.map(c => c.id));
    setCategories([...data, ...DEFAULT_CATEGORIES.filter(c => !ids.has(c.id))]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setFormData({ ...EMPTY_CAT }); setEditCat(null); setShowForm(true); };
  const openEdit = (c: Category) => {
    setFormData({ label: c.label, color: c.color, description: c.description || '', isArchived: c.isArchived || false, sortOrder: c.sortOrder || 99 });
    setEditCat(c);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.label.trim()) { toast.error('الاسم مطلوب'); return; }
    setSaving(true);
    try {
      const cat: Category = { ...formData, id: editCat?.id || `cat-${Date.now()}` };
      await upsertCategory(cat);
      await logActivity(editCat ? 'تعديل تصنيف' : 'إضافة تصنيف', cat.label);
      toast.success(editCat ? 'تم التعديل ✓' : 'تم الإضافة ✓');
      setShowForm(false);
      load();
    } catch { toast.error('حدث خطأ أثناء الحفظ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const isDefault = DEFAULT_CATEGORIES.some(c => c.id === id);
    if (isDefault) { toast.error('لا يمكن حذف التصنيفات الأساسية'); return; }
    try {
      await deleteCategory(id);
      await logActivity('حذف تصنيف', id);
      toast.success('تم الحذف');
      setDeleteConfirm(null);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch { toast.error('فشل الحذف'); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">التصنيفات</h1>
          <p className="text-sm text-gray-400">{categories.length} تصنيف</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium transition-colors">
          <Plus size={16} /> إضافة تصنيف
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-gray-800 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: cat.color + '33', border: `2px solid ${cat.color}` }}>
                <span className="text-lg font-bold" style={{ color: cat.color }}>{cat.label[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{cat.label}</p>
                {cat.description && <p className="text-xs text-gray-500 truncate">{cat.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-gray-500 font-mono">{cat.color}</span>
              <div className="flex-1" />
              <button onClick={() => openEdit(cat)} className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-colors"><Edit2 size={12} /></button>
              {!DEFAULT_CATEGORIES.some(c => c.id === cat.id) ? (
                <button onClick={() => setDeleteConfirm(cat.id)} className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
              ) : (
                <span className="text-xs text-gray-600 px-2">أساسي</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-gray-100 font-semibold">تأكيد الحذف</h3>
            <p className="text-gray-400 text-sm">هل أنت متأكد من حذف هذا التصنيف؟</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium">حذف</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg bg-gray-700 text-gray-300 text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-gray-100 font-semibold">{editCat ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs text-gray-400 mb-1.5">الاسم *</label><input value={formData.label} onChange={e => setFormData(f => ({ ...f, label: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="اسم التصنيف" /></div>
              <div><label className="block text-xs text-gray-400 mb-1.5">الوصف</label><input value={formData.description || ''} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="وصف مختصر" /></div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">اللون المميز</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={formData.color} onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-lg border border-gray-700 cursor-pointer bg-transparent" />
                  <input value={formData.color} onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none font-mono" placeholder="#D4722A" />
                </div>
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
