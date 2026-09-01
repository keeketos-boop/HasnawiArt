import { useState, useEffect, useRef } from 'react';
import { fetchSiteSettings, saveSiteSettings, uploadSiteAsset } from '@/lib/api';
import type { SiteSettings } from '@/types';
import { Check, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_SETTINGS } from '@/lib/defaults';

export default function AdminProfilePage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSiteSettings().then(s => { setSettings(s); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSettings(settings);
      toast.success('تم حفظ الملف الشخصي ✓ — التغييرات ظاهرة الآن للجميع');
    } catch { toast.error('حدث خطأ أثناء الحفظ'); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadSiteAsset(file, 'profile');
      setSettings(s => ({ ...s, artistPhoto: url }));
      // Save immediately
      const current = await fetchSiteSettings();
      await saveSiteSettings({ ...current, artistPhoto: url });
      toast.success('تم رفع الصورة وحفظها ✓ — ستظهر للجميع الآن');
    } catch (err) {
      console.error(err);
      toast.error('فشل رفع الصورة. تأكد من صلاحيات Supabase Storage.');
    } finally {
      setUploadingPhoto(false);
      if (photoRef.current) photoRef.current.value = '';
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">الملف الشخصي</h1>
          <p className="text-sm text-gray-400">جميع التغييرات تُحفظ في Supabase وتظهر للجميع</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} حفظ
        </button>
      </div>

      {/* Photo */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">الصورة الشخصية</h2>
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-700 flex-shrink-0">
            {settings.artistPhoto ? (
              <img src={settings.artistPhoto} alt="صورة الأستاذ" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl">👤</div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-300 mb-3">
              الصورة تُرفع مباشرة إلى Supabase Storage وتظهر للجميع فوراً.
            </p>
            <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <button onClick={() => photoRef.current?.click()} disabled={uploadingPhoto} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-amber-600/40 text-amber-400 hover:bg-amber-600/10 text-sm transition-colors disabled:opacity-60">
              {uploadingPhoto ? <><Loader2 size={14} className="animate-spin" /> جارٍ الرفع...</> : <><Upload size={14} /> رفع صورة جديدة</>}
            </button>
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1.5">أو أدخل رابطاً مباشراً</label>
              <input value={settings.artistPhoto} onChange={e => setSettings(s => ({ ...s, artistPhoto: e.target.value }))} placeholder="https://..." className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">البيانات الشخصية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1.5">الاسم الكامل</label><input value={settings.artistName} onChange={e => setSettings(s => ({ ...s, artistName: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">اللقب/التخصص</label><input value={settings.artistTitle} onChange={e => setSettings(s => ({ ...s, artistTitle: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">رقم واتساب</label><input value={settings.whatsappNumber} onChange={e => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="218910000000" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">البريد الإلكتروني</label><input value={settings.emailAddress} onChange={e => setSettings(s => ({ ...s, emailAddress: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">انستغرام</label><input value={settings.instagramUrl} onChange={e => setSettings(s => ({ ...s, instagramUrl: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="https://instagram.com/..." /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">فيسبوك</label><input value={settings.facebookUrl} onChange={e => setSettings(s => ({ ...s, facebookUrl: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="https://facebook.com/..." /></div>
        </div>
      </div>

      {/* Bios */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">النبذات</h2>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">النبذة القصيرة (تظهر في الرئيسية)</label>
          <textarea value={settings.artistShortBio} onChange={e => setSettings(s => ({ ...s, artistShortBio: e.target.value }))} rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">السيرة الكاملة (تظهر عند الضغط على "اقرأ المزيد")</label>
          <textarea value={settings.artistFullBio} onChange={e => setSettings(s => ({ ...s, artistFullBio: e.target.value }))} rows={6} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" placeholder="اكتب سيرتك الذاتية هنا..." />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-gray-900 font-semibold text-sm disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} حفظ الملف الشخصي
        </button>
      </div>
    </div>
  );
}
