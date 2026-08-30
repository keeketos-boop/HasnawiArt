import { useState, useEffect } from 'react';
import { fetchBotSettings, saveBotSettings } from '@/lib/api';
import type { BotSettings } from '@/types';
import { Plus, Trash2, Check, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_BOT } from '@/lib/defaults';

export default function AdminBotPage() {
  const [settings, setSettings] = useState<BotSettings>(DEFAULT_BOT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBotSettings().then(s => { setSettings(s); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBotSettings(settings);
      toast.success('تم حفظ إعدادات البوت ✓');
    } catch { toast.error('حدث خطأ أثناء الحفظ'); }
    finally { setSaving(false); }
  };

  const addQuestion = () => {
    const q = { id: Date.now().toString(), label: 'سؤال جديد', answer: 'إجابة...', action: 'gallery' };
    setSettings(s => ({ ...s, questions: [...s.questions, q] }));
  };

  const updateQuestion = (id: string, field: string, value: string) => {
    setSettings(s => ({ ...s, questions: s.questions.map(q => q.id === id ? { ...q, [field]: value } : q) }));
  };

  const deleteQuestion = (id: string) => {
    setSettings(s => ({ ...s, questions: s.questions.filter(q => q.id !== id) }));
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">البوت المساعد</h1>
          <p className="text-sm text-gray-400">إعدادات البوت تُحفظ في Supabase وتظهر للجميع</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} حفظ
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">الإعدادات العامة</h2>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
          <div>
            <p className="text-sm text-gray-300">تفعيل البوت</p>
            <p className="text-xs text-gray-500">يظهر أيقونة البوت في الموقع</p>
          </div>
          <button onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${settings.enabled ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
            {settings.enabled ? 'مفعّل' : 'معطّل'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">رقم واتساب للتحويل</label>
            <input value={settings.whatsappNumber} onChange={e => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">مدة التأخير (ثانية)</label>
            <input type="number" value={settings.delaySeconds} onChange={e => setSettings(s => ({ ...s, delaySeconds: Number(e.target.value) }))} min={1} max={30} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1.5">رسالة الترحيب</label>
            <textarea value={settings.welcomeText} onChange={e => setSettings(s => ({ ...s, welcomeText: e.target.value }))} rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200">الأسئلة السريعة</h2>
          <button onClick={addQuestion} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-400 text-xs hover:bg-amber-600/30 transition-colors"><Plus size={13} /> إضافة سؤال</button>
        </div>
        <div className="space-y-3">
          {settings.questions.map(q => (
            <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-700">
              <GripVertical size={16} className="text-gray-600 mt-1 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <input value={q.label} onChange={e => updateQuestion(q.id, 'label', e.target.value)} placeholder="نص الزر..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-xs focus:outline-none focus:border-amber-500/60" />
                <textarea value={q.answer} onChange={e => updateQuestion(q.id, 'answer', e.target.value)} rows={2} placeholder="الإجابة..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-xs focus:outline-none focus:border-amber-500/60 resize-none" />
                <select value={q.action} onChange={e => updateQuestion(q.id, 'action', e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-xs focus:outline-none">
                  <option value="gallery">انتقل للمعرض</option>
                  <option value="order">افتح نموذج الطلب</option>
                  <option value="faq">انتقل للأسئلة الشائعة</option>
                  <option value="whatsapp">حوّل لواتساب</option>
                </select>
              </div>
              <button onClick={() => deleteQuestion(q.id)} className="w-7 h-7 rounded-lg bg-red-900/30 flex items-center justify-center text-red-400 hover:bg-red-900/50 flex-shrink-0 transition-colors"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-gray-900 font-semibold text-sm disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} حفظ إعدادات البوت
        </button>
      </div>
    </div>
  );
}
