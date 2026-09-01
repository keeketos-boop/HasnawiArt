import { useState } from 'react';
import { getSiteSettings, saveSiteSettings } from '@/lib/storage';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProfilePage() {
  const [settings, setSettings] = useState(getSiteSettings());
  const [photoPreview, setPhotoPreview] = useState(settings.artistPhoto);

  const handleSave = () => {
    saveSiteSettings(settings);
    toast.success('تم حفظ الملف الشخصي');
  };

  const handlePhotoChange = (url: string) => {
    setSettings(s => ({ ...s, artistPhoto: url }));
    setPhotoPreview(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">الملف الشخصي</h1>
          <p className="text-sm text-gray-400">معلوماتك الشخصية والمهنية</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium">
          <Check size={16} /> حفظ
        </button>
      </div>

      {/* Photo */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">الصورة الشخصية</h2>
        <div className="flex gap-5 items-start">
          <div className="relative flex-shrink-0">
            <img
              src={photoPreview}
              alt="صورة شخصية"
              className="w-24 h-24 rounded-xl object-cover border-2 border-gray-700"
              onError={e => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?w=200'; }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1.5">رابط الصورة الشخصية</label>
            <input
              value={settings.artistPhoto}
              onChange={e => handlePhotoChange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60"
              placeholder="https://... (رابط صورة حقيقية من Pexels أو Unsplash)"
            />
            <p className="text-xs text-gray-500 mt-1">استخدم رابط صورة حقيقية خاصة بك من أي خدمة استضافة صور</p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">البيانات الأساسية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1.5">الاسم الكامل</label><input value={settings.artistName} onChange={e => setSettings(s => ({ ...s, artistName: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">اللقب / التخصص</label><input value={settings.artistTitle} onChange={e => setSettings(s => ({ ...s, artistTitle: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">واتساب</label><input value={settings.whatsappNumber} onChange={e => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="218910000000" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">البريد الإلكتروني</label><input value={settings.emailAddress} onChange={e => setSettings(s => ({ ...s, emailAddress: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">انستغرام</label><input value={settings.instagramUrl} onChange={e => setSettings(s => ({ ...s, instagramUrl: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="https://instagram.com/..." /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">فيسبوك</label><input value={settings.facebookUrl} onChange={e => setSettings(s => ({ ...s, facebookUrl: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="https://facebook.com/..." /></div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">النبذة التعريفية</h2>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">النبذة القصيرة (تظهر في الرئيسية)</label>
          <textarea value={settings.artistShortBio} onChange={e => setSettings(s => ({ ...s, artistShortBio: e.target.value }))} rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">السيرة الكاملة (في صفحة نبذة عني)</label>
          <textarea value={settings.artistFullBio} onChange={e => setSettings(s => ({ ...s, artistFullBio: e.target.value }))} rows={8} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-gray-900 font-semibold text-sm">
          <Check size={16} /> حفظ الملف الشخصي
        </button>
      </div>
    </div>
  );
}
