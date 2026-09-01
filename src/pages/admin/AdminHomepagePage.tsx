import { useState } from 'react';
import { getSiteSettings, saveSiteSettings, getStoredArtworks } from '@/lib/storage';
import { ARTWORKS } from '@/constants/data';
import { Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminHomepagePage() {
  const [settings, setSettings] = useState(getSiteSettings());

  // Merge artworks
  const storedArtworks = getStoredArtworks();
  const storedIds = new Set(storedArtworks.map(a => a.id));
  const allArtworks = [...storedArtworks, ...ARTWORKS.filter(a => !storedIds.has(a.id))];

  const handleSave = () => {
    saveSiteSettings(settings);
    toast.success('تم حفظ الإعدادات');
  };

  const toggleFeatured = (id: string) => {
    const ids = settings.featuredWorkIds.includes(id)
      ? settings.featuredWorkIds.filter(i => i !== id)
      : [...settings.featuredWorkIds, id].slice(0, 4);
    setSettings(s => ({ ...s, featuredWorkIds: ids }));
  };

  const toggleSection = (key: keyof typeof settings) => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
  };

  const sections = [
    { key: 'showHero' as const, label: 'قسم Hero الترحيبي' },
    { key: 'showStats' as const, label: 'شريط الإحصائيات' },
    { key: 'showTypesCards' as const, label: 'بطاقتا الأنواع' },
    { key: 'showFeatured' as const, label: 'الأعمال المميزة' },
    { key: 'showCategories' as const, label: 'أيقونات التصنيفات' },
    { key: 'showAbout' as const, label: 'قسم نبذة عني' },
    { key: 'showReviews' as const, label: 'قسم التقييمات' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">محتوى الصفحة الرئيسية</h1>
          <p className="text-sm text-gray-400">تحكم في محتوى وأقسام الصفحة الرئيسية</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium">
          <Check size={16} /> حفظ التغييرات
        </button>
      </div>

      {/* Sections Toggle */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">إظهار/إخفاء الأقسام</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sections.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
              <span className="text-sm text-gray-300">{label}</span>
              <button
                onClick={() => toggleSection(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${settings[key] ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-500'}`}
              >
                {settings[key] ? <><Eye size={12} /> مرئي</> : <><EyeOff size={12} /> مخفي</>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Content */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">محتوى قسم Hero</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1.5">الاسم الكبير</label><input value={settings.heroTitle} onChange={e => setSettings(s => ({ ...s, heroTitle: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">العنوان الفرعي</label><input value={settings.heroSubtitle} onChange={e => setSettings(s => ({ ...s, heroSubtitle: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div className="sm:col-span-2"><label className="block text-xs text-gray-400 mb-1.5">الجملة التعريفية</label><textarea value={settings.heroBio} onChange={e => setSettings(s => ({ ...s, heroBio: e.target.value }))} rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">نص الزر الأول</label><input value={settings.heroCta1} onChange={e => setSettings(s => ({ ...s, heroCta1: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">نص الزر الثاني</label><input value={settings.heroCta2} onChange={e => setSettings(s => ({ ...s, heroCta2: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div className="sm:col-span-2"><label className="block text-xs text-gray-400 mb-1.5">رابط صورة الخلفية (اختياري)</label><input value={settings.heroBackground} onChange={e => setSettings(s => ({ ...s, heroBackground: e.target.value }))} placeholder="https://..." className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">أرقام الإحصائيات</h2>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1.5">عدد الأعمال</label><input value={settings.statsWorks} onChange={e => setSettings(s => ({ ...s, statsWorks: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">سنوات الخبرة</label><input value={settings.statsYears} onChange={e => setSettings(s => ({ ...s, statsYears: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">العملاء</label><input value={settings.statsClients} onChange={e => setSettings(s => ({ ...s, statsClients: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" /></div>
        </div>
      </div>

      {/* Featured Works */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-200">الأعمال المميزة في الرئيسية</h2>
          <p className="text-xs text-gray-400 mt-1">اختر حتى 4 أعمال تظهر في قسم الأعمال المميزة — {settings.featuredWorkIds.length}/4 محدد</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
          {allArtworks.filter(a => !a.isArchived).map(work => (
            <button
              key={work.id}
              onClick={() => toggleFeatured(work.id)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all ${settings.featuredWorkIds.includes(work.id) ? 'border-amber-500' : 'border-gray-700 hover:border-gray-500'}`}
            >
              <img src={work.images[0]} alt={work.title} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              <p className="absolute bottom-1.5 right-2 left-2 text-xs text-white font-medium truncate">{work.title}</p>
              {settings.featuredWorkIds.includes(work.id) && (
                <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check size={10} className="text-gray-900" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-gray-900 font-semibold text-sm">
          <Check size={16} /> حفظ جميع التغييرات
        </button>
      </div>
    </div>
  );
}
