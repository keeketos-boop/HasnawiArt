import { useState } from 'react';
import { getBotSettings, saveBotSettings } from '@/lib/storage';
import { BotSettings } from '@/types';
import { Check, Plus, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBotPage() {
  const [settings, setSettings] = useState<BotSettings>(getBotSettings());

  const handleSave = () => {
    saveBotSettings(settings);
    toast.success('تم حفظ إعدادات البوت');
  };

  const addQuestion = () => {
    setSettings(s => ({
      ...s,
      questions: [...s.questions, { id: `q${Date.now()}`, label: '', answer: '', action: 'whatsapp' }],
    }));
  };

  const updateQuestion = (id: string, field: string, value: string) => {
    setSettings(s => ({
      ...s,
      questions: s.questions.map(q => q.id === id ? { ...q, [field]: value } : q),
    }));
  };

  const removeQuestion = (id: string) => {
    setSettings(s => ({ ...s, questions: s.questions.filter(q => q.id !== id) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">البوت المساعد</h1>
          <p className="text-sm text-gray-400">إدارة نصوص وإعدادات البوت الذكي</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium">
          <Check size={16} /> حفظ
        </button>
      </div>

      {/* Main Settings */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200">الإعدادات الأساسية</h2>
          <button
            onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${settings.enabled ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-500'}`}
          >
            {settings.enabled ? <><Eye size={12} /> مفعّل</> : <><EyeOff size={12} /> معطّل</>}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1.5">نص الترحيب</label>
            <textarea value={settings.welcomeText} onChange={e => setSettings(s => ({ ...s, welcomeText: e.target.value }))} rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">مدة التأخير (ثوانٍ)</label>
            <input type="number" min={1} max={30} value={settings.delaySeconds} onChange={e => setSettings(s => ({ ...s, delaySeconds: Number(e.target.value) }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">رقم واتساب للتحويل</label>
            <input value={settings.whatsappNumber} onChange={e => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="218910000000" />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200">أزرار الأسئلة السريعة</h2>
          <button onClick={addQuestion} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 text-gray-400 hover:text-gray-200 text-xs transition-colors">
            <Plus size={12} /> إضافة سؤال
          </button>
        </div>

        <div className="space-y-3">
          {settings.questions.map((q, i) => (
            <div key={q.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">سؤال {i + 1}</span>
                <button onClick={() => removeQuestion(q.id)} className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"><X size={12} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">نص الزر</label>
                  <input value={q.label} onChange={e => updateQuestion(q.id, 'label', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" placeholder="نص الزر..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">الإجراء</label>
                  <select value={q.action} onChange={e => updateQuestion(q.id, 'action', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none">
                    <option value="gallery">فتح المعرض</option>
                    <option value="order">فتح نموذج الطلب</option>
                    <option value="faq">قسم الأسئلة الشائعة</option>
                    <option value="whatsapp">تحويل لواتساب</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">الإجابة</label>
                  <textarea value={q.answer} onChange={e => updateQuestion(q.id, 'answer', e.target.value)} rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" placeholder="نص الإجابة التي يعرضها البوت..." />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-gray-900 font-semibold text-sm">
          <Check size={16} /> حفظ إعدادات البوت
        </button>
      </div>
    </div>
  );
}
